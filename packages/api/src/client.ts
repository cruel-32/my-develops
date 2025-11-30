/**
 * CSR 전용 API 클라이언트
 * 브라우저에서만 사용 가능합니다
 *
 * Next.js API Route 프록시 사용:
 * /api/auth/login → Next.js 프록시 → 백엔드 API
 */

/**
 * Kubb과 호환되는 Request/Response 타입
 */
export interface RequestConfig<TData = unknown> {
  url?: string;
  method?: string;
  baseURL?: string;
  params?: Record<string, unknown>;
  data?: TData;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  [key: string]: unknown;
}

export type ResponseConfig<TData = unknown> = TData;

/**
 * ResponseErrorConfig는 @kubb/plugin-client에 없으므로 custom 정의
 */
export type ResponseErrorConfig<T = unknown> = T;

// 클라이언트 설정 저장소
let globalConfig: Partial<RequestConfig> & { on401?: () => void } = {
  baseURL: '', // Kubb 생성 URL이 이미 /api/... 형식이므로 baseURL은 비움
  credentials: 'include', // *** 중요: 쿠키를 보내기 위해 필수 ***
};

/**
 * Next.js의 fetch를 사용한 CSR 전용 API 클라이언트
 * Kubb의 pluginReactQuery와 호환 가능
 */
const createFetchClient = () => {
  const client = async <
    TData = unknown,
    _TError = unknown,
    TVariables = unknown,
  >(
    config: RequestConfig<TVariables> = {}
  ): Promise<TData> => {
    const isServer = typeof window === 'undefined';

    const mergedConfig = {
      ...globalConfig,
      ...config,
    } as RequestConfig<TVariables>;

    const {
      url = '/',
      method = 'GET',
      baseURL,
      params,
      data,
      headers: configHeaders,
      credentials,
    } = mergedConfig;

    // 1. Base URL Handling
    let resolvedBaseUrl = baseURL || globalConfig.baseURL;
    
    if (isServer && !resolvedBaseUrl) {
      // Server-side: Use environment variable or default to backend URL
      // This avoids "Invalid URL" error for relative paths
      resolvedBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    }
    
    let fullPath = `${resolvedBaseUrl || ''}${url}`;

    // Query params 추가
    if (params && typeof params === 'object') {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullPath += `?${queryString}`;
      }
    }

    // Headers 구성
    const headers = new Headers();

    // 기존 headers 병합
    if (configHeaders && typeof configHeaders === 'object') {
      Object.entries(configHeaders).forEach(([key, value]) => {
        if (value !== undefined) {
          headers.set(key, String(value));
        }
      });
    }

    // 2. Server-side Cookie Injection
    if (isServer) {
      try {
        // Dynamically import next/headers to avoid build errors in non-Next.js environments
        // @ts-ignore - next/headers might not be in dependencies but available in runtime
        const { cookies } = await import('next/headers');
        const cookieStore = await cookies();
        const cookieString = cookieStore.toString();
        
        if (cookieString) {
          headers.set('Cookie', cookieString);
        }
      } catch (e) {
        // Ignore errors if next/headers is not available or called outside request context
        // console.warn('Failed to inject server cookies:', e);
      }
    }

    // Content-Type이 없으면 자동으로 application/json 추가
    if (data && !headers.has('content-type') && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Fetch 옵션 구성
    const fetchOptions: RequestInit = {
      ...mergedConfig, // Pass through all other options (next, cache, etc.)
      method: method.toUpperCase(),
      headers,
      credentials: (credentials as RequestCredentials) || 'include',
    };

    // Enforce no-cache for mutation methods (POST, PUT, DELETE, etc.)
    // User Request: "get만 캐싱을 사용하고 post, put, delete는 캐싱을 사용할 필요가 없을 것 같아"
    const isReadMethod =
      fetchOptions.method === 'GET' || fetchOptions.method === 'HEAD';
    if (!isReadMethod && !fetchOptions.cache) {
      fetchOptions.cache = 'no-store';
    }

    // Body 추가
    if (
      data &&
      method.toUpperCase() !== 'GET' &&
      method.toUpperCase() !== 'HEAD'
    ) {
      if (data instanceof FormData) {
        fetchOptions.body = data;
        headers.delete('Content-Type');
      } else if (typeof data === 'string') {
        fetchOptions.body = data;
      } else {
        fetchOptions.body = JSON.stringify(data);
      }
    }

    const response = await fetch(fullPath, fetchOptions);

    // 응답 파싱
    let responseData: TData;
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      responseData = (await response.json()) as TData;
    } else if (contentType?.includes('text')) {
      responseData = (await response.text()) as unknown as TData;
    } else {
      responseData = (await response.blob()) as unknown as TData;
    }

    // HTTP 에러 상태 체크 (4xx, 5xx)
    if (!response.ok) {
      if (response.status === 401 && globalConfig.on401) {
        globalConfig.on401();
      }

      // 백엔드가 보낸 에러 JSON 객체를 그대로 throw하여
      // React Query 훅의 에러 타입과 일치시킴
      throw responseData;
    }

    return responseData;
  };

  client.getConfig = () => globalConfig;
  client.setConfig = (config: Partial<RequestConfig>) => {
    globalConfig = { ...globalConfig, ...config };
  };

  return client as typeof client & {
    getConfig: () => Partial<RequestConfig>;
    setConfig: (config: Partial<RequestConfig>) => void;
  };
};

const fetchClient = createFetchClient();

export const apiClient = fetchClient;

// Default export - Kubb가 사용할 클라이언트
export default fetchClient;
