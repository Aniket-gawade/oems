/**
 * SubmissionHistoryProvider — session-scoped order submission history (F127, F128).
 * Allows PlaceOrderPage to record successful submissions that TraderDashboard can display.
 */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { PlaceOrderResponse } from "@/api/types";

export interface SubmissionRecord {
  readonly orderId: string;
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly orderType: "MARKET" | "LIMIT";
  readonly quantity: number;
  readonly price: number | null | undefined;
  readonly status: "NEW" | "REJECTED";
  readonly submittedAt: string;
}

interface SubmissionHistoryContextValue {
  readonly submissions: readonly SubmissionRecord[];
  readonly addSubmission: (response: PlaceOrderResponse) => void;
  readonly clearHistory: () => void;
}

const SubmissionHistoryContext = createContext<SubmissionHistoryContextValue | undefined>(
  undefined
);

export const SubmissionHistoryProvider = ({ children }: { children: ReactNode }) => {
  const [submissions, setSubmissions] = useState<readonly SubmissionRecord[]>([]);

  const addSubmission = useCallback((response: PlaceOrderResponse) => {
    const record: SubmissionRecord = {
      orderId: response.orderId,
      symbol: response.symbol,
      side: response.side,
      orderType: response.orderType,
      quantity: response.quantity,
      price: response.price,
      status: response.status,
      submittedAt: response.createdAt
    };
    // Prepend so most recent is first
    setSubmissions((prev) => [record, ...prev]);
  }, []);

  const clearHistory = useCallback(() => {
    setSubmissions([]);
  }, []);

  const value = useMemo(
    () => ({ addSubmission, clearHistory, submissions }),
    [addSubmission, clearHistory, submissions]
  );

  return (
    <SubmissionHistoryContext.Provider value={value}>
      {children}
    </SubmissionHistoryContext.Provider>
  );
};

export const useSubmissionHistory = (): SubmissionHistoryContextValue => {
  const context = useContext(SubmissionHistoryContext);
  if (!context) {
    throw new Error("useSubmissionHistory must be used within SubmissionHistoryProvider");
  }
  return context;
};
