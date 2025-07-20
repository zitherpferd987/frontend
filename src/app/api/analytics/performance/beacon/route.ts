import { NextRequest, NextResponse } from 'next/server';

// Handle beacon data sent on page unload
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Process beacon data (page unload metrics)
    const beaconEntry = {
      ...data,
      timestamp: data.timestamp || Date.now(),
      userAgent: request.headers.get('user-agent'),
      type: 'beacon',
    };

    // In production, save to database or send to analytics service
    console.log('Beacon data received:', beaconEntry);

    // Return 204 No Content for beacon requests (standard practice)
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error processing beacon data:', error);
    return new NextResponse(null, { status: 204 }); // Still return 204 to avoid client errors
  }
}