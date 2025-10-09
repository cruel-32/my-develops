import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * tRPC proxy handler for Next.js App Router
 * Forwards requests to the backend tRPC server
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ trpc: string }> }
) {
  try {
    const { trpc } = await params;
    const body = await request.text();

    // ✅ Extract cookies from incoming request
    const cookies = request.headers.get('cookie') || '';

    // Forward request to backend tRPC server
    // Backend standalone adapter uses root path
    const backendUrl = `${BACKEND_URL}/${trpc}`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trpc-source': request.headers.get('x-trpc-source') || 'nextjs',
        Cookie: cookies, // ✅ Forward cookies to backend
      },
      body,
      credentials: 'include', // ✅ Include cookies in request
    });

    const data = await response.text();

    // ✅ Extract Set-Cookie headers from backend response
    const setCookieHeader = response.headers.get('set-cookie');
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // ✅ Forward Set-Cookie headers to client
    if (setCookieHeader) {
      responseHeaders['Set-Cookie'] = setCookieHeader;
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('tRPC proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests (for queries)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trpc: string }> }
) {
  try {
    const { trpc } = await params;
    const searchParams = request.nextUrl.searchParams;

    // ✅ Extract cookies from incoming request
    const cookies = request.headers.get('cookie') || '';

    // Forward request to backend tRPC server
    // Backend standalone adapter uses root path
    const backendUrl = `${BACKEND_URL}/${trpc}?${searchParams.toString()}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'x-trpc-source': request.headers.get('x-trpc-source') || 'nextjs',
        Cookie: cookies, // ✅ Forward cookies to backend
      },
      credentials: 'include', // ✅ Include cookies in request
    });

    const data = await response.text();

    // ✅ Extract Set-Cookie headers from backend response
    const setCookieHeader = response.headers.get('set-cookie');
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // ✅ Forward Set-Cookie headers to client
    if (setCookieHeader) {
      responseHeaders['Set-Cookie'] = setCookieHeader;
    }

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('tRPC proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
