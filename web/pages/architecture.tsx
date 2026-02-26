export default function Architecture() {
  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 42, marginBottom: 6 }}>Architecture (v0.1)</h1>
      <p style={{ opacity: 0.8, marginTop: 0 }}>High-level system design for Northbridge Chain + NBCX protocol.</p>

      <section style={{ marginTop: 28 }}>
        <h2>Layers</h2>
        <ol>
          <li><b>Northbridge Chain</b> — EVM network (Chain ID 9000), RPC: <code>http://89.167.28.12:8545</code></li>
          <li><b>NBCX Token</b> — ERC-20 token contract</li>
          <li><b>Staking</b> — stake NBCX, earn emissions over time</li>
          <li><b>Distributor / Vault</b> — protocol treasury and controlled flows</li>
          <li><b>Lock</b> — lock/penalty module (treasury-controlled)</li>
          <li><b>Multisig Governance</b> — owner of core contracts; executes upgrades</li>
        </ol>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Security Model</h2>
        <ul>
          <li>Core contracts are <b>owned by the Multisig</b>.</li>
          <li>All sensitive actions are executed via <b>2-of-3 approvals</b>.</li>
          <li>Public UI is read-only + wallet actions (stake/unstake/claim) require user signature.</li>
        </ul>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Links</h2>
        <ul>
          <li><a href="/contracts">Contracts</a></li>
          <li><a href="/staking">Staking Dashboard</a></li>
          <li><a href="/whitepaper-v0-1">Whitepaper v0.1</a></li>
          <li><a href="/">Home</a></li>
        </ul>
      </section>
    </main>
  );
}
