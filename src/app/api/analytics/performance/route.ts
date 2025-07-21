import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for development (use a proper database in production)
const performanceData: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate the data
    if (!data.name || typeof data.value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid performance data' },
        { status: 400 }
      );
    }

    // Add timestamp and additional metadata
    const performanceEntry = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer'),
      sessionId: data.sessionId || generateSessionId(),
      deviceType: getDeviceType(request.headers.get('user-agent') || ''),
      connectionType: data.connectionType || 'unknown',
    };

    // Store the data (in production, save to database)
    performanceData.push(performanceEntry);

    // Keep only last 1000 entries in memory
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000);
    }

    // Check for performance issues and send alerts
    checkPerformanceThresholds(performanceEntry);

    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance metric received:', performanceEntry);
    }

    // In production, you might want to:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Send to external analytics service (Google Analytics, Mixpanel, etc.)
    // 3. Send alerts for critical performance issues
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const metric = searchParams.get('metric');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    let filteredData = [...performanceData];

    // Filter by metric name
    if (metric) {
      filteredData = filteredData.filter(entry => entry.name === metric);
    }

    // Filter by time range
    if (startTime) {
      const start = parseInt(startTime);
      filteredData = filteredData.filter(entry => entry.timestamp >= start);
    }

    if (endTime) {
      const end = parseInt(endTime);
      filteredData = filteredData.filter(entry => entry.timestamp <= end);
    }

    // Sort by timestamp (newest first)
    filteredData.sort((a, b) => b.timestamp - a.timestamp);

    // Limit results
    filteredData = filteredData.slice(0, limit);

    // Calculate statistics
    const stats = calculatePerformanceStats(filteredData);

    return NextResponse.json({
      data: filteredData,
      stats,
      total: filteredData.length,
    });
  } catch (error) {
    console.error('Error retrieving performance data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    return 'mobile';
  } else if (/Tablet/.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

function checkPerformanceThresholds(entry: any) {
  const thresholds = {
    LCP: 2500,    // 2.5s
    FID: 100,     // 100ms
    INP: 200,     // 200ms
    CLS: 0.1,     // 0.1
    FCP: 1800,    // 1.8s
    TTFB: 800,    // 800ms
  };

  const threshold = thresholds[entry.name as keyof typeof thresholds];
  if (threshold && entry.value > threshold) {
    console.warn(`Performance threshold exceeded: ${entry.name} = ${entry.value} (threshold: ${threshold})`);
    
    // In production, you might send alerts here
    // sendPerformanceAlert(entry, threshold);
  }
}

function calculatePerformanceStats(data: any[]) {
  if (data.length === 0) {
    return {};
  }

  const metricGroups = data.reduce((groups, entry) => {
    if (!groups[entry.name]) {
      groups[entry.name] = [];
    }
    groups[entry.name].push(entry.value);
    return groups;
  }, {} as Record<string, number[]>);

  const stats: Record<string, any> = {};

  Object.entries(metricGroups).forEach(([metricName, values]) => {
    const numericValues = values as number[];
    const sorted = numericValues.sort((a, b) => a - b);
    const count = numericValues.length;
    const sum = numericValues.reduce((a, b) => a + b, 0);

    stats[metricName] = {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      mean: sum / count,
      median: count % 2 === 0 
        ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
        : sorted[Math.floor(count / 2)],
      p75: sorted[Math.floor(count * 0.75)],
      p90: sorted[Math.floor(count * 0.90)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)],
      // Performance ratings based on Core Web Vitals thresholds
      rating: getPerformanceRating(metricName, sorted[Math.floor(count * 0.75)]),
    };
  });

  return stats;
}

function getPerformanceRating(metricName: string, value: number): string {
  const thresholds = {
    LCP: { good: 2500, poor: 4000 },
    FID: { good: 100, poor: 300 },
    INP: { good: 200, poor: 500 },
    CLS: { good: 0.1, poor: 0.25 },
    FCP: { good: 1800, poor: 3000 },
    TTFB: { good: 800, poor: 1800 },
  };

  const threshold = thresholds[metricName as keyof typeof thresholds];
  if (!threshold) return 'unknown';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}