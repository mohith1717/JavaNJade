const modules = [
  "Operations overview",
  "Transactions",
  "Alert queue",
  "Investigation workspace",
  "Rules",
  "Reports",
  "Audit trail"
];

export function App() {
  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">Transaction monitoring</p>
        <h1>JadeGuard</h1>
        <p className="subtitle">
          The project skeleton is running. Feature teams can now build against a
          shared frontend, API, and database contract.
        </p>
      </header>

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading">Planned modules</h2>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module}>
              <span aria-hidden="true">◇</span>
              <h3>{module}</h3>
              <p>Ready for implementation</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
