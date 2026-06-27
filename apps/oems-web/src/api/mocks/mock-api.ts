/**
 * Mock API mode guard and context (F102).
 * Provides runtime mock-mode detection for use in fixtures/testing.
 */
import { runtimeConfig } from "@/config/runtime";

/**
 * Returns true when the app is running in mock-auth mode.
 * Mock API fixtures should only be injected when this returns true.
 * This guard ensures mock mode cannot activate in production builds.
 */
export const isMockMode = (): boolean => runtimeConfig.enableMockAuth;

/**
 * Assert that the caller is in a non-production environment before using mock data.
 * Throws in production to prevent accidental mock data exposure.
 */
export const assertMockModeAllowed = (): void => {
  if (runtimeConfig.isProductionBuild) {
    throw new Error(
      "[oems-web] Mock API mode is not allowed in production builds. " +
        "This is a programming error — mock fixtures must never be imported in production code paths."
    );
  }
};
