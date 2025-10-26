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
  accessToken?: string;
  [key: string]: unknown;
}

// export interface ResponseConfig<TData = unknown> {
//   status: number;
//   statusText: string;
//   data: TData;
//   headers?: Record<string, string>;
//   [key: string]: unknown;
// }
export type ResponseConfig<TData = unknown> = TData;

/**
 * ResponseErrorConfig는 @kubb/plugin-client에 없으므로 custom 정의
 */
export type ResponseErrorConfig<T = unknown> = T;

// 클라이언트 설정 저장소
let globalConfig: Partial<RequestConfig> = {
  baseURL: '', // Kubb 생성 URL이 이미 /api/... 형식이므로 baseURL은 비움
  credentials: 'include',
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
    // CSR 전용: SSR에서 호출되면 에러 발생
    if (typeof window === 'undefined') {
      throw new Error(
        'API client must be used in browser environment (CSR only)'
      );
    }

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
      accessToken,
    } = mergedConfig;

    // URL 구성 (상대 경로 지원)
    const baseUrl = baseURL || globalConfig.baseURL;
    let fullPath = `${baseUrl}${url}`;

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

    // Content-Type이 없으면 자동으로 application/json 추가
    if (data && !headers.has('content-type') && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Authorization 헤더 추가
    // 1. 파라미터로 전달된 accessToken이 있으면 사용
    // 2. 없으면 localStorage에서 accessToken 읽기
    let authToken = accessToken;
    if (!authToken) {
      authToken = localStorage.getItem('accessToken') || undefined;
    }

    if (authToken && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    // Fetch 옵션 구성
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers,
      credentials: (credentials as RequestCredentials) || 'include',
    };

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
      // HTTP 상태 코드가 4xx 또는 5xx인 경우
      const error = new Error(
        `HTTP ${response.status}: ${response.statusText}`
      ) as Error & {
        error?: string;
        statusCode?: number;
        details?: any[];
      };

      // responseData가 formatted error format이면 필드 추가
      if (
        typeof responseData === 'object' &&
        responseData !== null &&
        'error' in responseData
      ) {
        error.error = (responseData as any).error;
        error.statusCode = (responseData as any).statusCode;
        error.details = (responseData as any).details;
      }

      // 401 에러인 경우 localStorage에서 accessToken 삭제
      if (response.status === 401) {
        localStorage.removeItem('accessToken');
      }

      throw error;
    }

    // 성공 응답(2xx)에서 새로운 accessToken이 있으면 저장
    const newAccessToken = response.headers.get('X-New-Access-Token');
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
    }

    return responseData;
  };

  // Kubb의 fetch 클라이언트 API 호환
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
