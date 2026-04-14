import type { ReactNode } from "react";
import { ApiClientProvider } from "@/app/providers/api-client-provider";
import { AuthProvider } from "@/app/providers/auth-provider";
import { NotificationProvider } from "@/app/providers/notification-provider";
import { AppQueryProvider } from "@/app/providers/query-provider";
import { ToastViewport } from "@/components/feedback/toast-viewport";

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <ApiClientProvider>
      <AppQueryProvider>
        <NotificationProvider>
          {children}
          <ToastViewport />
        </NotificationProvider>
      </AppQueryProvider>
    </ApiClientProvider>
  </AuthProvider>
);
