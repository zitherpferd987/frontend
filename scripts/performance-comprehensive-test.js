#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance testing configuration
const PERFORMANCE_CONFIG = {
  urls: [
    'http://localhost:3000',
    'http://localhost:3000/blog',
    'http://localhost:3000/gallery',
  ],
  metrics: ['FCP', 'LCP', 'CLS', 'FID', 'TTFB'],
  thresholds: {
    FCP: 1800,    // 1.8s
    LCP: 2500,    // 2.5s
    CLS: 0.1,     // 0.1
    FID: 100,     // 100ms
    TTFB: 800,    // 800ms
  },
  iterations: 5,
  outputDir: './performance-reports',
};

// Ensure output directory exists
if (!fs.existsSync(PERFORMANCE_CONFIG.outputDir)) {
  fs.mkdirSync(PERFORMANCE_CONFIG.outputDir, { recursive: true });
}

console.log('🚀 Starting comprehensive performance testing...\n');

// Function to run Lighthouse audit
function runLighthouseAudit(url, iteration) {
  console.log(`📊 Running Lighthouse audit for ${url} (iteration ${iteration + 1}/${PERFORMANCE_CONFIG.iterations})`);
  
  const outputFile = path.join(
    PERFORMANCE_CONFIG.outputDir,
    `lighthouse-${url.replace(/[^a-zA-Z0-9]/g, '-')}-${iteration}.json`
  );
  
  try {
    const command = `npx lighthouse ${url} --output=json --output-path=${outputFile} --chrome-flags="--headless --no-sandbox" --quiet`;
    execSync(command, { stdio: 'pipe' });
    
    const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    return {
      url,
      iteration,
      metrics: {
        FCP: report.audits['first-contentful-paint'].numericValue,
        LCP: report.audits['largest-contentful-paint'].numericValue,
        CLS: report.audits['cumulative-layout-shift'].numericValue,
        FID: report.audits['max-potential-fid'].numericValue,
        TTFB: report.audits['server-response-time'].numericValue,
      },
      scores: {
        performance: report.categories.performance.score * 100,
        accessibility: report.categories.accessibility.score * 100,
        bestPractices: report.categories['best-practices'].score * 100,
        seo: report.categories.seo.score * 100,
      },
      opportunities: report.audits,
    };
  } catch (error) {
    console.error(`❌ Lighthouse audit failed for ${url}:`, error.message);
    return null;
  }
}

// Function to analyze bundle size
function analyzeBundleSize() {
  console.log('📦 Analyzing bundle size...');
  
  try {
    // Run Next.js build analyzer
    execSync('npm run build', { stdio: 'pipe' });
    
    const buildDir = '.next';
    const staticDir = path.join(buildDir, 'static');
    
    if (!fs.existsSync(staticDir)) {
      console.warn('⚠️  Build directory not found. Run npm run build first.');
      return null;
    }
    
    const bundleStats = {
      totalSize: 0,
      jsSize: 0,
      cssSize: 0,
      chunks: [],
    };
    
    function analyzeDirectory(dir, prefix = '') {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          analyzeDirectory(filePath, `${prefix}${file}/`);
        } else {
          const size = stat.size;
          bundleStats.totalSize += size;
          
          if (file.endsWith('.js')) {
            bundleStats.jsSize += size;
          } else if (file.endsWith('.css')) {
            bundleStats.cssSize += size;
          }
          
          bundleStats.chunks.push({
            name: `${prefix}${file}`,
            size,
            type: file.split('.').pop(),
          });
        }
      });
    }
    
    analyzeDirectory(staticDir);
    
    // Sort chunks by size
    bundleStats.chunks.sort((a, b) => b.size - a.size);
    
    return bundleStats;
  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    return null;
  }
}

// Function to test Core Web Vitals
async function testCoreWebVitals() {
  console.log('🎯 Testing Core Web Vitals...\n');
  
  const results = [];
  
  for (const url of PERFORMANCE_CONFIG.urls) {
    console.log(`Testing ${url}:`);
    const urlResults = [];
    
    for (let i = 0; i < PERFORMANCE_CONFIG.iterations; i++) {
      const result = runLighthouseAudit(url, i);
      if (result) {
        urlResults.push(result);
      }
    }
    
    if (urlResults.length > 0) {
      // Calculate averages
      const averages = {
        url,
        metrics: {},
        scores: {},
      };
      
      PERFORMANCE_CONFIG.metrics.forEach(metric => {
        const values = urlResults.map(r => r.metrics[metric]).filter(v => v != null);
        averages.metrics[metric] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      });
      
      Object.keys(urlResults[0].scores).forEach(score => {
        const values = urlResults.map(r => r.scores[score]).filter(v => v != null);
        averages.scores[score] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      });
      
      results.push(averages);
      
      // Display results
      console.log(`  📈 Performance Score: ${averages.scores.performance.toFixed(1)}/100`);
      console.log(`  🎨 Accessibility Score: ${averages.scores.accessibility.toFixed(1)}/100`);
      console.log(`  ✅ Best Practices Score: ${averages.scores.bestPractices.toFixed(1)}/100`);
      console.log(`  🔍 SEO Score: ${averages.scores.seo.toFixed(1)}/100`);
      
      console.log('  Core Web Vitals:');
      PERFORMANCE_CONFIG.metrics.forEach(metric => {
        const value = averages.metrics[metric];
        const threshold = PERFORMANCE_CONFIG.thresholds[metric];
        const status = value <= threshold ? '✅' : '❌';
        const unit = metric === 'CLS' ? '' : 'ms';
        
        console.log(`    ${status} ${metric}: ${value.toFixed(0)}${unit} (threshold: ${threshold}${unit})`);
      });
      
      console.log('');
    }
  }
  
  return results;
}

// Function to generate performance report
function generateReport(webVitalsResults, bundleStats) {
  console.log('📄 Generating performance report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalUrls: PERFORMANCE_CONFIG.urls.length,
      iterations: PERFORMANCE_CONFIG.iterations,
      overallScore: 0,
    },
    webVitals: webVitalsResults,
    bundleAnalysis: bundleStats,
    recommendations: [],
  };
  
  // Calculate overall score
  if (webVitalsResults.length > 0) {
    const totalScore = webVitalsResults.reduce((sum, result) => sum + result.scores.performance, 0);
    report.summary.overallScore = totalScore / webVitalsResults.length;
  }
  
  // Generate recommendations
  webVitalsResults.forEach(result => {
    PERFORMANCE_CONFIG.metrics.forEach(metric => {
      const value = result.metrics[metric];
      const threshold = PERFORMANCE_CONFIG.thresholds[metric];
      
      if (value > threshold) {
        report.recommendations.push({
          url: result.url,
          metric,
          currentValue: value,
          threshold,
          severity: value > threshold * 1.5 ? 'high' : 'medium',
          suggestion: getOptimizationSuggestion(metric),
        });
      }
    });
  });
  
  // Bundle size recommendations
  if (bundleStats) {
    if (bundleStats.totalSize > 2 * 1024 * 1024) { // 2MB
      report.recommendations.push({
        type: 'bundle-size',
        severity: 'high',
        suggestion: 'Total bundle size exceeds 2MB. Consider code splitting and tree shaking.',
        currentSize: bundleStats.totalSize,
        threshold: 2 * 1024 * 1024,
      });
    }
    
    // Check for large chunks
    const largeChunks = bundleStats.chunks.filter(chunk => chunk.size > 500 * 1024); // 500KB
    if (largeChunks.length > 0) {
      report.recommendations.push({
        type: 'large-chunks',
        severity: 'medium',
        suggestion: `Found ${largeChunks.length} chunks larger than 500KB. Consider splitting these chunks.`,
        chunks: largeChunks.map(chunk => ({ name: chunk.name, size: chunk.size })),
      });
    }
  }
  
  // Save report
  const reportPath = path.join(PERFORMANCE_CONFIG.outputDir, `performance-report-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Generate HTML report
  generateHTMLReport(report, reportPath.replace('.json', '.html'));
  
  return report;
}

// Function to get optimization suggestions
function getOptimizationSuggestion(metric) {
  const suggestions = {
    FCP: 'Optimize critical rendering path, inline critical CSS, and preload key resources.',
    LCP: 'Optimize largest contentful paint by preloading hero images and optimizing server response time.',
    CLS: 'Set explicit dimensions for images and videos, avoid inserting content above existing content.',
    FID: 'Reduce JavaScript execution time, break up long tasks, and use web workers for heavy computations.',
    TTFB: 'Optimize server response time, use CDN, and implement proper caching strategies.',
  };
  
  return suggestions[metric] || 'Optimize this metric for better performance.';
}

// Function to generate HTML report
function generateHTMLReport(report, outputPath) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Report - ${new Date(report.timestamp).toLocaleDateString()}</title>
    <style>
        body { font-family: system-ui, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1, h2, h3 { color: #333; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 6px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #007bff; }
        .metric-label { color: #666; margin-top: 5px; }
        .url-results { margin: 20px 0; }
        .url-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 10px 0; }
        .metric { text-align: center; padding: 10px; background: white; border-radius: 4px; }
        .good { border-left: 4px solid #28a745; }
        .poor { border-left: 4px solid #dc3545; }
        .recommendations { margin: 20px 0; }
        .recommendation { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 10px 0; border-radius: 6px; }
        .high-severity { background: #f8d7da; border-color: #f5c6cb; }
        .bundle-stats { margin: 20px 0; }
        .chunk-list { max-height: 300px; overflow-y: auto; }
        .chunk { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Performance Report</h1>
        <p>Generated on: ${new Date(report.timestamp).toLocaleString()}</p>
        
        <div class="summary">
            <div class="metric-card">
                <div class="metric-value">${report.summary.overallScore.toFixed(1)}</div>
                <div class="metric-label">Overall Performance Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.totalUrls}</div>
                <div class="metric-label">URLs Tested</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.summary.iterations}</div>
                <div class="metric-label">Iterations per URL</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${report.recommendations.length}</div>
                <div class="metric-label">Recommendations</div>
            </div>
        </div>
        
        <h2>Core Web Vitals Results</h2>
        ${report.webVitals.map(result => `
            <div class="url-card">
                <h3>${result.url}</h3>
                <div class="metrics-grid">
                    ${PERFORMANCE_CONFIG.metrics.map(metric => {
                        const value = result.metrics[metric];
                        const threshold = PERFORMANCE_CONFIG.thresholds[metric];
                        const isGood = value <= threshold;
                        const unit = metric === 'CLS' ? '' : 'ms';
                        return `
                            <div class="metric ${isGood ? 'good' : 'poor'}">
                                <strong>${metric}</strong><br>
                                ${value.toFixed(0)}${unit}<br>
                                <small>Threshold: ${threshold}${unit}</small>
                            </div>
                        `;
                    }).join('')}
                </div>
                <div class="metrics-grid">
                    <div class="metric">
                        <strong>Performance</strong><br>
                        ${result.scores.performance.toFixed(1)}/100
                    </div>
                    <div class="metric">
                        <strong>Accessibility</strong><br>
                        ${result.scores.accessibility.toFixed(1)}/100
                    </div>
                    <div class="metric">
                        <strong>Best Practices</strong><br>
                        ${result.scores.bestPractices.toFixed(1)}/100
                    </div>
                    <div class="metric">
                        <strong>SEO</strong><br>
                        ${result.scores.seo.toFixed(1)}/100
                    </div>
                </div>
            </div>
        `).join('')}
        
        ${report.bundleAnalysis ? `
            <h2>Bundle Analysis</h2>
            <div class="bundle-stats">
                <div class="metrics-grid">
                    <div class="metric">
                        <strong>Total Size</strong><br>
                        ${(report.bundleAnalysis.totalSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div class="metric">
                        <strong>JavaScript</strong><br>
                        ${(report.bundleAnalysis.jsSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div class="metric">
                        <strong>CSS</strong><br>
                        ${(report.bundleAnalysis.cssSize / 1024 / 1024).toFixed(2)} MB
                    </div>
                    <div class="metric">
                        <strong>Chunks</strong><br>
                        ${report.bundleAnalysis.chunks.length}
                    </div>
                </div>
                
                <h3>Largest Chunks</h3>
                <div class="chunk-list">
                    ${report.bundleAnalysis.chunks.slice(0, 20).map(chunk => `
                        <div class="chunk">
                            <span>${chunk.name}</span>
                            <span>${(chunk.size / 1024).toFixed(1)} KB</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
        
        <h2>Recommendations</h2>
        <div class="recommendations">
            ${report.recommendations.map(rec => `
                <div class="recommendation ${rec.severity === 'high' ? 'high-severity' : ''}">
                    <strong>${rec.severity?.toUpperCase() || 'MEDIUM'} PRIORITY</strong>
                    ${rec.url ? `<br><strong>URL:</strong> ${rec.url}` : ''}
                    ${rec.metric ? `<br><strong>Metric:</strong> ${rec.metric}` : ''}
                    <br><strong>Issue:</strong> ${rec.suggestion}
                    ${rec.currentValue ? `<br><strong>Current:</strong> ${rec.currentValue} | <strong>Target:</strong> ${rec.threshold}` : ''}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;
  
  fs.writeFileSync(outputPath, html);
  console.log(`📄 HTML report saved to: ${outputPath}`);
}

// Main execution
async function main() {
  try {
    // Test Core Web Vitals
    const webVitalsResults = await testCoreWebVitals();
    
    // Analyze bundle size
    const bundleStats = analyzeBundleSize();
    
    // Generate comprehensive report
    const report = generateReport(webVitalsResults, bundleStats);
    
    console.log('✅ Performance testing completed!');
    console.log(`📊 Overall Performance Score: ${report.summary.overallScore.toFixed(1)}/100`);
    console.log(`⚠️  Found ${report.recommendations.length} recommendations`);
    
    // Exit with error code if performance is poor
    if (report.summary.overallScore < 70) {
      console.log('❌ Performance score is below 70. Please address the recommendations.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Performance testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  testCoreWebVitals,
  analyzeBundleSize,
  generateReport,
  PERFORMANCE_CONFIG,
};