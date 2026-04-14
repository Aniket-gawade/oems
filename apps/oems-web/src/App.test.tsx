import { render, screen } from "@testing-library/react";
import App from "@/App";
import { AppProviders } from "@/app/providers/app-providers";
import { createAppMemoryRouter } from "@/app/routes/app-router";

const renderWithRouter = (route: string) => {
  const router = createAppMemoryRouter([route]);
  return render(
    <AppProviders>
      <App router={router} />
    </AppProviders>
  );
};

describe("App routing", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("redirects unauthenticated user to login for protected route", async () => {
    renderWithRouter("/trader");
    expect(await screen.findByRole("heading", { name: "OEMS Login" })).toBeTruthy();
  });

  it("allows signed-in trader session to load trader dashboard", async () => {
    window.sessionStorage.setItem(
      "oems-web-mock-session",
      JSON.stringify({
        displayName: "Trader One",
        role: "TRADER",
        userId: "mock-trader"
      })
    );

    renderWithRouter("/trader");
    expect(await screen.findByRole("heading", { name: "Trader Dashboard" })).toBeTruthy();
  });

  it("denies trader session for ops route", async () => {
    window.sessionStorage.setItem(
      "oems-web-mock-session",
      JSON.stringify({
        displayName: "Trader One",
        role: "TRADER",
        userId: "mock-trader"
      })
    );

    renderWithRouter("/ops");
    expect(await screen.findByRole("heading", { name: "Unauthorized" })).toBeTruthy();
  });
});
