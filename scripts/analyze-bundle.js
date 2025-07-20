#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Bundle analyzer for Next.js
function analyzeBundles() {
  console.log('🔍 Analyzing bundle sizes...\n');

  try {
    // Build the application
    console.log('Building application...');
    execSync('npm run build', { stdio: 'inherit' });

    // Check if .next directory exists
    const nextDir = path.join(process.cwd(), '.next');
    if (!fs.existsSync(nextDir)) {
      console.error('❌ .next directory not found. Build may have failed.');
      process.exit(1);
    }

    // Analyze static directory
    const staticDir = path.join(nextDir, 'static');
    if (fs.existsSync(staticDir)) {
      console.log('\n📊 Bundle Analysis:');
      console.log('==================');
      
      // Analyze chunks
      const chunksDir = path.join(staticDir, 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunks = fs.readdirSync(chunksDir);
        const chunkSizes = [];

        chunks.forEach(chunk => {
          const chunkPath = path.join(chunksDir, chunk);
          const stats = fs.statSync(chunkPath);
          const sizeKB = (stats.size / 1024).toFixed(2);
          
          chunkSizes.push({
            name: chunk,
            size: stats.size,
            sizeKB: parseFloat(sizeKB)
          });
        });

        // Sort by size (largest first)
        chunkSizes.sort((a, b) => b.size - a.size);

        console.log('\n🗂️  Largest Chunks:');
        chunkSizes.slice(0, 10).forEach((chunk, index) => {
          const indicator = chunk.sizeKB > 250 ? '🔴' : chunk.sizeKB > 100 ? '🟡' : '🟢';
          console.log(`${indicator} ${index + 1}. ${chunk.name} - ${chunk.sizeKB} KB`);
        });

        // Calculate total size
        const totalSize = chunkSizes.reduce((sum, chunk) => sum + chunk.size, 0);
        const totalSizeKB = (totalSize / 1024).toFixed(2);
        const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2);

        console.log(`\n📈 Total Bundle Size: ${totalSizeKB} KB (${totalSizeMB} MB)`);

        // Performance recommendations
        console.log('\n💡 Performance Recommendations:');
        console.log('================================');

        if (totalSize > 1024 * 1024) { // > 1MB
          console.log('⚠️  Bundle size is large (>1MB). Consider:');
          console.log('   - Code splitting with dynamic imports');
          console.log('   - Tree shaking unused code');
          console.log('   - Analyzing and removing large dependencies');
        }

        const largeChunks = chunkSizes.filter(chunk => chunk.sizeKB > 250);
        if (largeChunks.length > 0) {
          console.log('⚠️  Large chunks detected (>250KB):');
          largeChunks.forEach(chunk => {
            console.log(`   - ${chunk.name}: ${chunk.sizeKB} KB`);
          });
          console.log('   Consider splitting these chunks further.');
        }

        // Check for duplicate dependencies
        const duplicateCheck = chunks.filter(chunk => 
          chunk.includes('node_modules') || chunk.includes('vendor')
        );
        
        if (duplicateCheck.length > 3) {
          console.log('⚠️  Multiple vendor chunks detected. Check for duplicate dependencies.');
        }

        console.log('\n✅ Analysis complete!');
        console.log('💡 For detailed analysis, consider using @next/bundle-analyzer');
      }
    }

    // Generate performance report
    generatePerformanceReport();

  } catch (error) {
    console.error('❌ Bundle analysis failed:', error.message);
    process.exit(1);
  }
}

function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    analysis: 'Bundle size analysis completed',
    recommendations: [
      'Enable gzip compression in production',
      'Use Next.js Image component for optimized images',
      'Implement code splitting for large components',
      'Monitor Core Web Vitals in production',
      'Use dynamic imports for non-critical components'
    ]
  };

  const reportPath = path.join(process.cwd(), 'performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Performance report saved to: ${reportPath}`);
}

// Run analysis
if (require.main === module) {
  analyzeBundles();
}

module.exports = { analyzeBundles };