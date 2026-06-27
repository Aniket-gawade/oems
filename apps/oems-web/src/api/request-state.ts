/**
 * Shared request state helpers (F093).
 * Provides a unified RequestState union type and adapter from React Query results.
 */
import type { UseQueryResult, UseMutationResult } from "@tanstack/react-query";

// ─── RequestState Union ───────────────────────────────────────────────────────

export type RequestStatus = "idle" | "loading" | "error" | "empty" | "success";

export interface RequestStateIdle {
  readonly status: "idle";
  readonly data: undefined;
  readonly error: null;
}

export interface RequestStateLoading {
  readonly status: "loading";
  readonly data: undefined;
  readonly error: null;
}

export interface RequestStateError {
  readonly status: "error";
  readonly data: undefined;
  readonly error: unknown;
}

export interface RequestStateEmpty {
  readonly status: "empty";
  readonly data: undefined;
  readonly error: null;
}

export interface RequestStateSuccess<T> {
  readonly status: "success";
  readonly data: T;
  readonly error: null;
}

export type RequestState<T> =
  | RequestStateIdle
  | RequestStateLoading
  | RequestStateError
  | RequestStateEmpty
  | RequestStateSuccess<T>;

// ─── Adapters ─────────────────────────────────────────────────────────────────

/**
 * Converts a React Query UseQueryResult into a unified RequestState<T>.
 * The `isEmpty` predicate allows the caller to define when a successful response is "empty".
 */
export const toRequestState = <T>(
  query: UseQueryResult<T, unknown>,
  isEmpty?: (data: T) => boolean
): RequestState<T> => {
  if (query.isLoading || query.isFetching) {
    return { status: "loading", data: undefined, error: null };
  }

  if (query.isError) {
    return { status: "error", data: undefined, error: query.error };
  }

  if (query.isSuccess) {
    if (isEmpty && isEmpty(query.data)) {
      return { status: "empty", data: undefined, error: null };
    }
    return { status: "success", data: query.data, error: null };
  }

  return { status: "idle", data: undefined, error: null };
};

/**
 * Converts a React Query UseMutationResult into a unified RequestState<T>.
 */
export const mutationToRequestState = <T>(
  mutation: UseMutationResult<T, unknown, unknown, unknown>
): RequestState<T> => {
  if (mutation.isPending) {
    return { status: "loading", data: undefined, error: null };
  }

  if (mutation.isError) {
    return { status: "error", data: undefined, error: mutation.error };
  }

  if (mutation.isSuccess) {
    return { status: "success", data: mutation.data, error: null };
  }

  return { status: "idle", data: undefined, error: null };
};

// ─── Type Guards ──────────────────────────────────────────────────────────────

export const isSuccess = <T>(state: RequestState<T>): state is RequestStateSuccess<T> =>
  state.status === "success";

export const isLoading = <T>(state: RequestState<T>): state is RequestStateLoading =>
  state.status === "loading";

export const isError = <T>(state: RequestState<T>): state is RequestStateError =>
  state.status === "error";

export const isEmpty = <T>(state: RequestState<T>): state is RequestStateEmpty =>
  state.status === "empty";
