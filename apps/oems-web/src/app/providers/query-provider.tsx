import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 30_000
      }
    }
  });

export const AppQueryProvider = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState<QueryClient>(() => createQueryClient());
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
