export default function Roadmap() {
  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 42, marginBottom: 6 }}>Roadmap</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>v1 protocol site milestones (stop after these).</p>

      <section style={{ marginTop: 28 }}>
        <h2>Phase 1 — Launch</h2>
        <ul>
          <li>Multisig live (2-of-3)</li>
          <li>NBCX v2 token deployed</li>
          <li>Staking v2 deployed + funded</li>
          <li>Emissions configured</li>
          <li>Site live + wallet UX</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Phase 2 — v1 Protocol Site (Complete)</h2>
        <ol>
          <li>Upgrade Wallet page (balances + staking stats)</li>
          <li>Upgrade Staking page to pro dashboard</li>
          <li>Add Transparency page</li>
          <li>Add Tokenomics page</li>
          <li>Add Explorer Lite search</li>
        </ol>
        <p style={{ marginTop: 10, opacity: 0.85 }}><b>After this — stop.</b></p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Links</h2>
        <ul>
          <li><a href="/staking">Staking Dashboard</a></li>
          <li><a href="/tokenomics">Tokenomics</a></li>
          <li><a href="/transparency">Transparency</a></li>
          <li><a href="/">Home</a></li>
        </ul>
      </section>
    </main>
  );
}
