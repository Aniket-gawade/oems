const parseBooleanFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (!value) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  return defaultValue;
};

export const runtimeConfig = {
  appEnv: import.meta.env.VITE_APP_ENV ?? "local",
  apiBasePath: import.meta.env.VITE_API_BASE_PATH ?? "/api",
  enableMockAuth: parseBooleanFlag(import.meta.env.VITE_ENABLE_MOCK_AUTH, !import.meta.env.PROD)
} as const;
