import { vi } from "vitest";
import "whatwg-fetch";

vi.stubEnv("VITE_APP_ENV", "test");
vi.stubEnv("VITE_ENABLE_MOCK_AUTH", "true");
