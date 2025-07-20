#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Performance testing script
async function runPerformanceTests() {
  console.log('🚀 Running performance tests...\n');

  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Test 1: Bundle size analysis
  console.log('📦 Testing bundle size...');
  try {
    execSync('npm run build', { stdio: 'pipe' });
    
    const nextDir = path.join(process.cwd(), '.next');
    const staticDir = path.join(nextDir, 'static');
    
    if (fs.existsSync(staticDir)) {
      const chunksDir = path.join(staticDir, 'chunks');
      if (fs.existsSync(chunksDir)) {
        const chunks = fs.readdirSync(chunksDir);
        let totalSize = 0;
        
        chunks.forEach(chunk => {
          const chunkPath = path.join(chunksDir, chunk);
          const stats = fs.statSync(chunkPath);
          totalSize += stats.size;
        });
        
        const totalSizeMB = totalSize / (1024 * 1024);
        const passed = totalSizeMB < 2; // 2MB budget
        
        results.tests.push({
          name: 'Bundle Size',
          passed,
          value: `${totalSizeMB.toFixed(2)} MB`,
          threshold: '2 MB',
          details: `Total bundle size: ${totalSizeMB.toFixed(2)} MB`
        });
        
        if (passed) {
          console.log(`✅ Bundle size: ${totalSizeMB.toFixed(2)} MB (under 2 MB budget)`);
          results.summary.passed++;
        } else {
          console.log(`❌ Bundle size: ${totalSizeMB.toFixed(2)} MB (exceeds 2 MB budget)`);
          results.summary.failed++;
        }
      }
    }
  } catch (error) {
    console.log('❌ Bundle size test failed:', error.message);
    results.tests.push({
      name: 'Bundle Size',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }

  // Test 2: Image optimization check
  console.log('\n🖼️  Testing image optimization...');
  try {
    const publicDir = path.join(process.cwd(), 'public');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    let largeImages = [];
    
    function checkImagesInDir(dir) {
      const items = fs.readdirSync(dir);
      
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          checkImagesInDir(itemPath);
        } else if (imageExtensions.some(ext => item.toLowerCase().endsWith(ext))) {
          const sizeKB = stats.size / 1024;
          if (sizeKB > 500) { // 500KB threshold
            largeImages.push({
              path: itemPath.replace(process.cwd(), ''),
              size: `${sizeKB.toFixed(0)} KB`
            });
          }
        }
      });
    }
    
    if (fs.existsSync(publicDir)) {
      checkImagesInDir(publicDir);
    }
    
    const passed = largeImages.length === 0;
    
    results.tests.push({
      name: 'Image Optimization',
      passed,
      details: passed ? 'All images under 500KB' : `${largeImages.length} large images found`,
      largeImages
    });
    
    if (passed) {
      console.log('✅ All images optimized (under 500KB)');
      results.summary.passed++;
    } else {
      console.log(`⚠️  ${largeImages.length} large images found:`);
      largeImages.forEach(img => {
        console.log(`   - ${img.path}: ${img.size}`);
      });
      results.summary.warnings++;
    }
  } catch (error) {
    console.log('❌ Image optimization test failed:', error.message);
    results.tests.push({
      name: 'Image Optimization',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }

  // Test 3: Critical CSS check
  console.log('\n🎨 Testing critical CSS...');
  try {
    const layoutPath = path.join(process.cwd(), 'src', 'app', 'layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');
    
    const hasCriticalCSS = layoutContent.includes('preconnect') && 
                          layoutContent.includes('dns-prefetch');
    
    results.tests.push({
      name: 'Critical CSS',
      passed: hasCriticalCSS,
      details: hasCriticalCSS ? 'Resource hints found' : 'Missing resource hints'
    });
    
    if (hasCriticalCSS) {
      console.log('✅ Critical CSS optimizations found');
      results.summary.passed++;
    } else {
      console.log('⚠️  Missing critical CSS optimizations');
      results.summary.warnings++;
    }
  } catch (error) {
    console.log('❌ Critical CSS test failed:', error.message);
    results.tests.push({
      name: 'Critical CSS',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }

  // Test 4: Service Worker check
  console.log('\n⚙️  Testing Service Worker...');
  try {
    const swPath = path.join(process.cwd(), 'public', 'sw.js');
    const swExists = fs.existsSync(swPath);
    
    let swContent = '';
    if (swExists) {
      swContent = fs.readFileSync(swPath, 'utf8');
    }
    
    const hasCache = swContent.includes('caches.open') && swContent.includes('cache.put');
    
    results.tests.push({
      name: 'Service Worker',
      passed: swExists && hasCache,
      details: swExists ? (hasCache ? 'Service Worker with caching' : 'Service Worker without caching') : 'No Service Worker'
    });
    
    if (swExists && hasCache) {
      console.log('✅ Service Worker with caching configured');
      results.summary.passed++;
    } else if (swExists) {
      console.log('⚠️  Service Worker exists but no caching');
      results.summary.warnings++;
    } else {
      console.log('⚠️  No Service Worker found');
      results.summary.warnings++;
    }
  } catch (error) {
    console.log('❌ Service Worker test failed:', error.message);
    results.tests.push({
      name: 'Service Worker',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }

  // Test 5: Manifest check
  console.log('\n📱 Testing PWA Manifest...');
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifestExists = fs.existsSync(manifestPath);
    
    let manifestValid = false;
    if (manifestExists) {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);
      manifestValid = manifest.name && manifest.short_name && manifest.icons && manifest.icons.length > 0;
    }
    
    results.tests.push({
      name: 'PWA Manifest',
      passed: manifestExists && manifestValid,
      details: manifestExists ? (manifestValid ? 'Valid manifest' : 'Invalid manifest') : 'No manifest'
    });
    
    if (manifestExists && manifestValid) {
      console.log('✅ Valid PWA manifest found');
      results.summary.passed++;
    } else if (manifestExists) {
      console.log('⚠️  Manifest exists but invalid');
      results.summary.warnings++;
    } else {
      console.log('⚠️  No PWA manifest found');
      results.summary.warnings++;
    }
  } catch (error) {
    console.log('❌ PWA Manifest test failed:', error.message);
    results.tests.push({
      name: 'PWA Manifest',
      passed: false,
      error: error.message
    });
    results.summary.failed++;
  }

  // Generate report
  console.log('\n📊 Performance Test Summary:');
  console.log('============================');
  console.log(`✅ Passed: ${results.summary.passed}`);
  console.log(`⚠️  Warnings: ${results.summary.warnings}`);
  console.log(`❌ Failed: ${results.summary.failed}`);
  
  const reportPath = path.join(process.cwd(), 'performance-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Exit with appropriate code
  if (results.summary.failed > 0) {
    console.log('\n❌ Some performance tests failed!');
    process.exit(1);
  } else if (results.summary.warnings > 0) {
    console.log('\n⚠️  Performance tests completed with warnings.');
    process.exit(0);
  } else {
    console.log('\n🎉 All performance tests passed!');
    process.exit(0);
  }
}

// Run tests
if (require.main === module) {
  runPerformanceTests().catch(error => {
    console.error('Performance test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runPerformanceTests };