/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { runtimeConfig } from "@/config/runtime";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: unknown;
}

export interface ApiClient {
  readonly basePath: string;
  readonly request: <TResponse>(path: string, options?: ApiRequestOptions) => Promise<TResponse>;
}

const ApiClientContext = createContext<ApiClient | undefined>(undefined);

const mergePaths = (basePath: string, path: string): string => {
  const normalizedBase = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const createApiClient = (basePath: string): ApiClient => ({
  basePath,
  request: async <TResponse,>(path: string, options: ApiRequestOptions = {}) => {
    const requestInit: RequestInit = {
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers ?? {})
      }
    };

    const response = await fetch(mergePaths(basePath, path), requestInit);
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }
});

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const apiClient = useMemo(() => createApiClient(runtimeConfig.apiBasePath), []);
  return <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>;
};

export const useApiClient = (): ApiClient => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider");
  }

  return context;
};
