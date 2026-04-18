/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAuth } from "@/app/providers/auth-provider";
import { useNotifications } from "@/app/providers/notification-provider";
import { runtimeConfig } from "@/config/runtime";

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: BodyInit | Record<string, unknown> | null;
}

export interface ApiClientErrorPayload {
  readonly code?: string;
  readonly message?: string;
  readonly traceId?: string;
}

export class ApiClientError extends Error {
  public readonly code: string | null;
  public readonly status: number;
  public readonly traceId: string | null;

  public constructor(status: number, payload: ApiClientErrorPayload, traceId: string | null) {
    super(payload.message ?? `API request failed with status ${status}`);
    this.code = payload.code ?? null;
    this.status = status;
    this.traceId = payload.traceId ?? traceId;
  }
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

const serializeRequestBody = (
  body: BodyInit | Record<string, unknown> | null | undefined
): BodyInit | undefined => {
  if (body === null || body === undefined) {
    return undefined;
  }

  if (typeof body === "string" || body instanceof FormData || body instanceof URLSearchParams) {
    return body;
  }

  return JSON.stringify(body);
};

const parseErrorPayload = async (response: Response): Promise<ApiClientErrorPayload> => {
  try {
    const responseContentType = response.headers.get("content-type");
    if (!responseContentType?.includes("application/json")) {
      return {};
    }

    const parsed = (await response.json()) as ApiClientErrorPayload;
    return parsed ?? {};
  } catch {
    return {};
  }
};

export const ApiClientProvider = ({ children }: { children: ReactNode }) => {
  const { getAccessToken, handleApiAuthFailure } = useAuth();
  const { notify } = useNotifications();

  const apiClient = useMemo<ApiClient>(
    () => ({
      basePath: runtimeConfig.apiBasePath,
      request: async <TResponse,>(path: string, options: ApiRequestOptions = {}) => {
        const headers = new Headers(options.headers);
        headers.set("Accept", "application/json");

        const bearerToken = getAccessToken();
        if (bearerToken) {
          headers.set("Authorization", `Bearer ${bearerToken}`);
        }

        const serializedBody = serializeRequestBody(options.body);
        if (serializedBody && !(serializedBody instanceof FormData) && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }

        const requestInit: RequestInit = {
          ...options,
          body: serializedBody,
          headers
        };

        const response = await fetch(mergePaths(runtimeConfig.apiBasePath, path), requestInit);
        if (!response.ok) {
          const traceId = response.headers.get("X-Trace-Id");
          const errorPayload = await parseErrorPayload(response);

          if (response.status === 401) {
            handleApiAuthFailure(401);
            notify({
              message: "Session expired. Please sign in again.",
              severity: "warning",
              title: "Authentication required"
            });
          } else if (response.status === 403) {
            notify({
              message: "You do not have permission for this operation.",
              severity: "error",
              title: "Permission denied"
            });
          }

          throw new ApiClientError(response.status, errorPayload, traceId);
        }

        if (response.status === 204) {
          return undefined as TResponse;
        }

        return (await response.json()) as TResponse;
      }
    }),
    [getAccessToken, handleApiAuthFailure, notify]
  );

  return <ApiClientContext.Provider value={apiClient}>{children}</ApiClientContext.Provider>;
};

export const useApiClient = (): ApiClient => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider");
  }

  return context;
};
