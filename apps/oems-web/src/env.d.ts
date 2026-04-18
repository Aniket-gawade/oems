/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_PATH?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_AUTH_TELEMETRY_ENABLED?: string;
  readonly VITE_ENABLE_MOCK_AUTH?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
  readonly VITE_OIDC_ISSUER?: string;
  readonly VITE_OIDC_POST_LOGOUT_REDIRECT_URI?: string;
  readonly VITE_OIDC_REDIRECT_URI?: string;
  readonly VITE_OIDC_SCOPE?: string;
  readonly VITE_OIDC_SILENT_REDIRECT_URI?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
