/**
 * Instrument API service (F088).
 * Wraps GET /v1/instruments/{symbol} with typed responses and error mapping.
 */
import type { ApiClient } from "@/app/providers/api-client-provider";
import { ApiClientError } from "@/app/providers/api-client-provider";
import type { InstrumentResponse } from "@/api/types";

export interface GetInstrumentResult {
  readonly instrument: InstrumentResponse;
}

export interface GetInstrumentNotFoundResult {
  readonly notFound: true;
  readonly symbol: string;
}

export type GetInstrumentOutcome = GetInstrumentResult | GetInstrumentNotFoundResult;

/**
 * Fetch instrument details by symbol.
 * Returns a typed result discriminating between found, not-found, and error cases.
 *
 * - 200: returns instrument data
 * - 404: returns not-found result (caller renders neutral not-found UX)
 * - Other errors: re-throws for the caller/query to handle
 */
export const getInstrument = async (
  symbol: string,
  client: ApiClient
): Promise<GetInstrumentOutcome> => {
  try {
    const instrument = await client.request<InstrumentResponse>(`/v1/instruments/${encodeURIComponent(symbol)}`);
    return { instrument };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 404) {
      return { notFound: true, symbol };
    }
    throw error;
  }
};

export const isInstrumentNotFound = (
  result: GetInstrumentOutcome
): result is GetInstrumentNotFoundResult => "notFound" in result && result.notFound === true;
