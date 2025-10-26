import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API 프록시 - 모든 API 요청을 백엔드로 프록시합니다
 * 브라우저와 서버 모두에서 쿠키를 포함하여 백엔드로 요청을 전달합니다
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function handleRequest(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // URL 재구성
  // /api/auth/login → http://localhost:4000/api/auth/login
  const pathSegments = req.nextUrl.pathname
    .split('/')
    .filter((segment) => segment && segment !== 'api');
  const backendPath = `/api/${pathSegments.join('/')}`;

  const backendUrl = new URL(backendPath, BACKEND_URL);

  // Query parameters 복사
  searchParams.forEach((value, key) => {
    backendUrl.searchParams.append(key, value);
  });

  try {
    // Request headers 준비
    const headers = new Headers();

    // Content-Type 복사
    if (req.headers.has('content-type')) {
      headers.set('content-type', req.headers.get('content-type')!);
    }

    // Cookie 복사 (중요!)
    if (req.headers.has('cookie')) {
      headers.set('cookie', req.headers.get('cookie')!);
    }

    // Body 준비
    let body: string | FormData | undefined;
    const contentType = req.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      // FormData의 경우 그대로 전달
      body = await req.formData();
    } else if (req.method !== 'GET' && req.method !== 'HEAD') {
      // JSON이나 다른 형식의 경우
      const text = await req.text();
      if (text) {
        body = text;
        if (!headers.has('content-type')) {
          headers.set('content-type', 'application/json');
        }
      }
    }

    // 백엔드로 요청
    const backendResponse = await fetch(backendUrl.toString(), {
      method: req.method,
      headers,
      body,
      credentials: 'include', // 쿠키 포함
    });

    // 응답 준비
    const responseBody = await backendResponse.arrayBuffer();
    const response = new NextResponse(responseBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
    });

    // 응답 headers 복사 (Set-Cookie 제외 - 따로 처리)
    backendResponse.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        response.headers.set(key, value);
      }
    });

    // Set-Cookie 헤더 복사 (쿠키 설정을 클라이언트에 전달)
    // 주의: Set-Cookie는 여러 개일 수 있으므로 append 사용
    const setCookieHeaders = backendResponse.headers.getSetCookie();
    setCookieHeaders.forEach((value) => {
      response.headers.append('set-cookie', value);
    });

    return response;
  } catch (error) {
    console.error('[API Proxy Error]', error);

    return NextResponse.json(
      {
        error: 'Backend API request failed',
        statusCode: 500,
      },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const PATCH = handleRequest;
