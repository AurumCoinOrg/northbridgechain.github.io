import Link from "next/link";

export default function Roadmap() {
  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Roadmap</h1>
        <nav style={{ display: "flex", gap: 14, fontWeight: 600 }}>
          <Link href="/">Home</Link>
          <Link href="/whitepaper-v0-1">Whitepaper</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="/demo">Demo</Link>
        </nav>
      </header>

      <section style={{ marginTop: 18 }}>
        <h2>Phase 0 — Launch (Now)</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Deploy multisig + move ownership to multisig</li>
          <li>Deploy NBCX V2 / Staking V2 / Lock V2</li>
          <li>Fund staking rewards + verify earned() ticking</li>
          <li>Ship demo UI + contract address page</li>
        </ul>

        <h2>Phase 1 — Trust + UX</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Add “Connect Wallet” + network switch helper</li>
          <li>Better staking stats (APY estimate, TVL, emissions/day)</li>
          <li>Public docs: how to stake, claim, lock, withdraw</li>
        </ul>

        <h2>Phase 2 — Growth</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Explorer / block viewer</li>
          <li>Faucet for test users</li>
          <li>Listings + community rollout</li>
        </ul>

        <h2>Phase 3 — Hardening</h2>
        <ul style={{ lineHeight: 1.9 }}>
          <li>Independent audit + fixes</li>
          <li>Upgrade governance process + on-chain proposals (optional)</li>
          <li>Incident playbook (pause / revoke / rotate keys)</li>
        </ul>
      </section>
    </main>
  );
}
