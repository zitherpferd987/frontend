#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance audit script
async function performanceAudit() {
  console.log('🚀 Starting Performance Audit...\n');

  const results = {
    timestamp: new Date().toISOString(),
    bundleAnalysis: null,
    lighthouseScores: null,
    webVitals: null,
    recommendations: []
  };

  try {
    // 1. Bundle Analysis
    console.log('📦 Analyzing bundle size...');
    results.bundleAnalysis = await analyzeBundleSize();
    
    // 2. Build Performance Check
    console.log('🔨 Checking build performance...');
    const buildTime = await measureBuildTime();
    results.buildTime = buildTime;
    
    // 3. Static Analysis
    console.log('🔍 Running static analysis...');
    results.staticAnalysis = await runStaticAnalysis();
    
    // 4. Generate recommendations
    console.log('💡 Generating recommendations...');
    results.recommendations = generateRecommendations(results);
    
    // 5. Save comprehensive report
    const reportPath = path.join(process.cwd(), 'performance-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log('\n✅ Performance audit complete!');
    console.log(`📄 Report saved to: ${reportPath}`);
    
    // Print summary
    printSummary(results);
    
  } catch (error) {
    console.error('❌ Performance audit failed:', error.message);
    process.exit(1);
  }
}

async function analyzeBundleSize() {
  const buildDir = path.join(process.cwd(), '.next');
  const staticDir = path.join(buildDir, 'static');
  
  if (!fs.existsSync(staticDir)) {
    throw new Error('Build directory not found. Run npm run build first.');
  }
  
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  const largeFiles = [];
  
  const analyzeDirectory = (dir) => {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        const size = stats.size;
        totalSize += size;
        
        if (file.endsWith('.js')) {
          jsSize += size;
        } else if (file.endsWith('.css')) {
          cssSize += size;
        }
        
        // Track large files (>500KB)
        if (size > 500 * 1024) {
          largeFiles.push({
            name: path.relative(staticDir, filePath),
            size: size,
            sizeKB: (size / 1024).toFixed(2)
          });
        }
      } else if (stats.isDirectory()) {
        analyzeDirectory(filePath);
      }
    });
  };
  
  analyzeDirectory(staticDir);
  
  return {
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    jsSize,
    jsSizeMB: (jsSize / 1024 / 1024).toFixed(2),
    cssSize,
    cssSizeKB: (cssSize / 1024).toFixed(2),
    largeFiles: largeFiles.sort((a, b) => b.size - a.size)
  };
}

async function measureBuildTime() {
  console.log('  Building application...');
  const startTime = Date.now();
  
  try {
    execSync('npm run build', { stdio: 'pipe' });
    const endTime = Date.now();
    const buildTime = endTime - startTime;
    
    return {
      duration: buildTime,
      durationSeconds: (buildTime / 1000).toFixed(2),
      status: buildTime < 60000 ? 'good' : buildTime < 120000 ? 'fair' : 'poor'
    };
  } catch (error) {
    throw new Error('Build failed: ' + error.message);
  }
}

async function runStaticAnalysis() {
  const analysis = {
    imageOptimization: checkImageOptimization(),
    codeStructure: checkCodeStructure(),
    dependencies: checkDependencies()
  };
  
  return analysis;
}

function checkImageOptimization() {
  const publicDir = path.join(process.cwd(), 'public');
  const issues = [];
  
  if (fs.existsSync(publicDir)) {
    const checkImages = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile()) {
          const ext = path.extname(file).toLowerCase();
          
          if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            const size = stats.size;
            
            // Check for large images (>500KB)
            if (size > 500 * 1024) {
              issues.push({
                file: path.relative(publicDir, filePath),
                issue: 'Large image file',
                size: (size / 1024).toFixed(2) + ' KB',
                recommendation: 'Consider compressing or using WebP format'
              });
            }
            
            // Check for missing WebP alternatives
            const webpPath = filePath.replace(ext, '.webp');
            if (!fs.existsSync(webpPath)) {
              issues.push({
                file: path.relative(publicDir, filePath),
                issue: 'Missing WebP alternative',
                recommendation: 'Create WebP version for better compression'
              });
            }
          }
        } else if (stats.isDirectory()) {
          checkImages(filePath);
        }
      });
    };
    
    checkImages(publicDir);
  }
  
  return {
    totalIssues: issues.length,
    issues: issues.slice(0, 10) // Limit to first 10 issues
  };
}

function checkCodeStructure() {
  const srcDir = path.join(process.cwd(), 'src');
  const issues = [];
  
  if (fs.existsSync(srcDir)) {
    // Check for large component files
    const checkComponents = (dir) => {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && (file.endsWith('.tsx') || file.endsWith('.ts'))) {
          const size = stats.size;
          const lines = fs.readFileSync(filePath, 'utf8').split('\n').length;
          
          // Check for large component files (>500 lines)
          if (lines > 500) {
            issues.push({
              file: path.relative(srcDir, filePath),
              issue: 'Large component file',
              lines: lines,
              recommendation: 'Consider breaking into smaller components'
            });
          }
          
          // Check for missing lazy loading
          const content = fs.readFileSync(filePath, 'utf8');
          if (content.includes('import(') && !content.includes('dynamic')) {
            issues.push({
              file: path.relative(srcDir, filePath),
              issue: 'Dynamic import without Next.js dynamic',
              recommendation: 'Use Next.js dynamic() for better optimization'
            });
          }
        } else if (stats.isDirectory()) {
          checkComponents(filePath);
        }
      });
    };
    
    checkComponents(srcDir);
  }
  
  return {
    totalIssues: issues.length,
    issues: issues.slice(0, 10)
  };
}

function checkDependencies() {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const issues = [];
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Check for heavy dependencies
    const heavyDeps = [
      'lodash', 'moment', 'jquery', 'bootstrap', 'material-ui'
    ];
    
    heavyDeps.forEach(dep => {
      if (dependencies[dep]) {
        issues.push({
          dependency: dep,
          issue: 'Heavy dependency detected',
          recommendation: `Consider lighter alternatives or tree-shaking for ${dep}`
        });
      }
    });
    
    // Check for duplicate functionality
    if (dependencies['date-fns'] && dependencies['moment']) {
      issues.push({
        dependency: 'date-fns + moment',
        issue: 'Duplicate date libraries',
        recommendation: 'Choose one date library to reduce bundle size'
      });
    }
  }
  
  return {
    totalIssues: issues.length,
    issues: issues
  };
}

function generateRecommendations(results) {
  const recommendations = [];
  
  // Bundle size recommendations
  if (results.bundleAnalysis) {
    const { totalSize, jsSize, largeFiles } = results.bundleAnalysis;
    
    if (totalSize > 2 * 1024 * 1024) { // >2MB
      recommendations.push({
        category: 'Bundle Size',
        priority: 'high',
        issue: 'Large total bundle size',
        recommendation: 'Implement aggressive code splitting and lazy loading'
      });
    }
    
    if (jsSize > 1.5 * 1024 * 1024) { // >1.5MB
      recommendations.push({
        category: 'JavaScript',
        priority: 'high',
        issue: 'Large JavaScript bundle',
        recommendation: 'Use dynamic imports and tree shaking'
      });
    }
    
    if (largeFiles.length > 0) {
      recommendations.push({
        category: 'Code Splitting',
        priority: 'medium',
        issue: `${largeFiles.length} large files detected`,
        recommendation: 'Split large files into smaller chunks'
      });
    }
  }
  
  // Build time recommendations
  if (results.buildTime && results.buildTime.duration > 120000) { // >2 minutes
    recommendations.push({
      category: 'Build Performance',
      priority: 'medium',
      issue: 'Slow build time',
      recommendation: 'Optimize build process and consider incremental builds'
    });
  }
  
  // Static analysis recommendations
  if (results.staticAnalysis) {
    const { imageOptimization, codeStructure, dependencies } = results.staticAnalysis;
    
    if (imageOptimization.totalIssues > 0) {
      recommendations.push({
        category: 'Image Optimization',
        priority: 'medium',
        issue: `${imageOptimization.totalIssues} image optimization issues`,
        recommendation: 'Optimize images and use modern formats like WebP'
      });
    }
    
    if (codeStructure.totalIssues > 0) {
      recommendations.push({
        category: 'Code Structure',
        priority: 'low',
        issue: `${codeStructure.totalIssues} code structure issues`,
        recommendation: 'Refactor large components and improve code organization'
      });
    }
    
    if (dependencies.totalIssues > 0) {
      recommendations.push({
        category: 'Dependencies',
        priority: 'medium',
        issue: `${dependencies.totalIssues} dependency issues`,
        recommendation: 'Review and optimize dependencies'
      });
    }
  }
  
  return recommendations;
}

function printSummary(results) {
  console.log('\n📊 Performance Audit Summary');
  console.log('============================');
  
  if (results.bundleAnalysis) {
    const { totalSizeMB, jsSizeMB, cssSizeKB } = results.bundleAnalysis;
    console.log(`📦 Bundle Size: ${totalSizeMB}MB (JS: ${jsSizeMB}MB, CSS: ${cssSizeKB}KB)`);
  }
  
  if (results.buildTime) {
    const { durationSeconds, status } = results.buildTime;
    const statusIcon = status === 'good' ? '🟢' : status === 'fair' ? '🟡' : '🔴';
    console.log(`⏱️  Build Time: ${durationSeconds}s ${statusIcon}`);
  }
  
  console.log(`💡 Recommendations: ${results.recommendations.length}`);
  
  // Print high priority recommendations
  const highPriority = results.recommendations.filter(r => r.priority === 'high');
  if (highPriority.length > 0) {
    console.log('\n🚨 High Priority Issues:');
    highPriority.forEach(rec => {
      console.log(`   • ${rec.issue}: ${rec.recommendation}`);
    });
  }
  
  console.log('\n✅ Audit complete! Check the full report for detailed analysis.');
}

// Run audit if called directly
if (require.main === module) {
  performanceAudit();
}

module.exports = { performanceAudit };