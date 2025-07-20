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
    };

    // Store the data (in production, save to database)
    performanceData.push(performanceEntry);

    // Keep only last 1000 entries in memory
    if (performanceData.length > 1000) {
      performanceData.splice(0, performanceData.length - 1000);
    }

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
    };
  });

  return stats;
}