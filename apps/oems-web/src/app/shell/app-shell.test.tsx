import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { AppProviders } from "@/app/providers/app-providers";
import { createAppMemoryRouter } from "@/app/routes/app-router";

const renderTraderShell = () => {
  window.sessionStorage.setItem(
    "oems-web-mock-session",
    JSON.stringify({
      displayName: "Trader One",
      role: "TRADER",
      userId: "mock-trader"
    })
  );

  const router = createAppMemoryRouter(["/trader"]);
  return render(
    <AppProviders>
      <App router={router} />
    </AppProviders>
  );
};

describe("App shell keyboard navigation", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("supports keyboard tab traversal for skip link, sign out, and nav links", async () => {
    const user = userEvent.setup();
    renderTraderShell();
    expect(await screen.findByRole("heading", { name: "Trader Dashboard" })).toBeTruthy();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Skip to content" }));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Sign out" }));

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("link", { name: "Trader Dashboard" }));
  });
});
