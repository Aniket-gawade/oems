/**
 * useInstrument hook (F088, F092).
 * Fetches instrument data with 5-minute cache policy.
 */
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/app/providers/api-client-provider";
import { getInstrument } from "@/api/services/instrument.service";
import type { GetInstrumentOutcome } from "@/api/services/instrument.service";
import { instrumentKeys, INSTRUMENT_STALE_TIME_MS } from "@/api/query-keys";
import { makeGetRetryFn } from "@/api/retry";
import type { RequestState } from "@/api/request-state";
import { toRequestState } from "@/api/request-state";

/**
 * Fetch instrument details by symbol.
 * Returns a RequestState wrapping the GetInstrumentOutcome discriminated union.
 *
 * Usage:
 * ```tsx
 * const state = useInstrument("AAPL");
 * if (state.status === "success" && !isInstrumentNotFound(state.data)) {
 *   // state.data.instrument is InstrumentResponse
 * }
 * ```
 */
export const useInstrument = (symbol: string | null | undefined): RequestState<GetInstrumentOutcome> => {
  const client = useApiClient();

  const query = useQuery<GetInstrumentOutcome, unknown>({
    queryKey: instrumentKeys.detail(symbol ?? ""),
    queryFn: () => getInstrument(symbol!, client),
    enabled: Boolean(symbol && symbol.trim().length > 0),
    staleTime: INSTRUMENT_STALE_TIME_MS,
    retry: makeGetRetryFn()
  });

  return toRequestState(query);
};
