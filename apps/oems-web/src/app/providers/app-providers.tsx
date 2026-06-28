import type { ReactNode } from "react";
import { ApiClientProvider } from "@/app/providers/api-client-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { NotificationProvider } from "@/app/providers/notification-provider";
import { AppQueryProvider } from "@/app/providers/query-provider";
import { SubmissionHistoryProvider } from "@/app/providers/submission-history-provider";
import { ToastViewport } from "@/components/feedback/toast-viewport";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <NotificationProvider>
      <ApiClientProvider>
        <AppQueryProvider>
          <SubmissionHistoryProvider>
            {children}
            <ToastViewport />
          </SubmissionHistoryProvider>
        </AppQueryProvider>
      </ApiClientProvider>
    </NotificationProvider>
  </AuthProvider>
);
