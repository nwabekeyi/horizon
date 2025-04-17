import { useState, useCallback } from 'react';

export interface ApiRequestParams<B = unknown> {
  url: string | null;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: B;
  headers?: Record<string, string>;
  config?: Omit<RequestInit, 'headers' | 'method' | 'body'>;
}

export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

export const apiRequest = async <T, B = unknown>({
  url,
  method = 'GET',
  body,
  headers = {},
  config = {},
}: ApiRequestParams<B>): Promise<T> => {
  if (!url) {
    throw {
      status: 400,
      message: 'URL is required for API request',
    } as ApiError;
  }

  const options: RequestInit = {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...config,
  };

  if (method !== 'GET' && body !== undefined) {
    options.body = body instanceof FormData ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const isJson = response.headers.get('content-type')?.includes('application/json');

    if (!response.ok) {
      const errorData = isJson ? await response.json() : null;

      throw {
        status: response.status,
        message:
          (errorData && typeof errorData.message === 'string' ? errorData.message : response.statusText) ||
          'API request failed',
        details: errorData,
      } as ApiError;
    }

    return (isJson ? await response.json() : {}) as T;
  } catch (err: unknown) {
    if (err instanceof TypeError) {
      throw {
        status: 0,
        message: 'Network error. Please check your connection.',
        details: err,
      } as ApiError;
    }

    throw err;
  }
};

export function useApiRequest<T, B = unknown>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ApiError | null>(null);

  const callApi = useCallback(async (params: ApiRequestParams<B>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest<T, B>(params);
      setData(response);
      return response;
    } catch (err: unknown) {
      const safeError: ApiError = {
        status: 0,
        message: 'Something went wrong',
      };

      if (err && typeof err === 'object' && 'message' in err && 'status' in err) {
        const apiError = err as ApiError;
        safeError.message = apiError.message || 'Something went wrong';
        safeError.status = apiError.status || 0;
        safeError.details = apiError.details;
      }

      setError(safeError);
      throw safeError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, error, loading, callApi };
}
