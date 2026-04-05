function App() {
  return (
    <main className="app-shell" data-testid="app-shell">
      <header className="app-header">
        <h1>OEMS Web</h1>
        <p>Phase 2 frontend scaffold is running.</p>
      </header>
      <section className="app-card">
        <h2>Local checks</h2>
        <ul>
          <li>Vite dev server ready</li>
          <li>TypeScript strict mode enabled</li>
          <li>Vitest + Playwright baseline configured</li>
        </ul>
      </section>
    </main>
  );
}

export default App;
