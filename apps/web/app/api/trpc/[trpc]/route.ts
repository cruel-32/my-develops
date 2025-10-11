import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * tRPC proxy handler for the Next.js App Router.
 * This single handler forwards both GET and POST requests to the backend tRPC server.
 *
 * @param request The incoming Next.js request.
 * @returns A NextResponse from the backend.
 */
async function handler(request: NextRequest) {
  try {
    // Extract the tRPC path from the URL.
    const pathname = request.nextUrl.pathname;
    const trpcPath = pathname.split('/api/trpc/')[1];

    if (!trpcPath) {
      return NextResponse.json({ error: 'Invalid tRPC path' }, { status: 400 });
    }

    // Forward cookies from the incoming request to the backend.
    const cookies = request.headers.get('cookie') || '';

    // Construct the backend URL.
    const backendUrl = `${BACKEND_URL}/${trpcPath}${request.nextUrl.search}`;

    // Use the incoming request's body directly.
    const body = request.method === 'POST' ? await request.blob() : undefined;

    // Forward the request to the backend tRPC server.
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'x-trpc-source': request.headers.get('x-trpc-source') || 'nextjs-proxy',
        Cookie: cookies,
      },
      body,
      // Important: Duplex is required for streaming request bodies.
      // @ts-expect-error - `duplex` is a valid option for fetch
      duplex: 'half',
    });

    // At this point, we're just proxying the response back to the client.
    // We don't need to parse the response body (e.g., with .json() or .text()).
    // We can just stream it back.

    // Forward the response headers from the backend, especially 'Set-Cookie'.
    const responseHeaders = new Headers(response.headers);

    return new NextResponse(response.body, {
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

export { handler as GET, handler as POST };
