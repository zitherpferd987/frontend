import { NextRequest, NextResponse } from 'next/server';

// Handle resource performance data
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const resourceEntry = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      userAgent: request.headers.get('user-agent'),
      type: 'resource',
    };

    // Log slow resources in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Slow resource detected:', resourceEntry);
    }

    // In production, you might want to:
    // 1. Alert on critical resources being slow
    // 2. Track resource performance trends
    // 3. Optimize based on resource data

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing resource data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}