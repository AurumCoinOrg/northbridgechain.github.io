import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ display: "flex", gap: 16, alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>Northbridge Chain</div>
          <div style={{ opacity: 0.75, marginTop: 6 }}>Fast, simple, governance-first chain + staking.</div>
        </div>

        <nav style={{ display: "flex", gap: 14, fontWeight: 600 }}>
          <Link href="/whitepaper-v0-1">Whitepaper</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="/demo">Staking Demo</Link>
        </nav>
      </header>

      <section style={{ marginTop: 28, padding: 18, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12 }}>
        <h2 style={{ marginTop: 0 }}>Quick links</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li><Link href="/whitepaper-v0-1">Whitepaper v0.1</Link></li>
          <li><Link href="/contracts">Contract Addresses</Link></li>
          <li><Link href="/demo">Staking Demo App</Link></li>
        </ul>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2>What’s live</h2>
        <ul style={{ lineHeight: 1.8 }}>
          <li>Multisig governance (2-of-3)</li>
          <li>Staking emissions (rewardRate live)</li>
          <li>Lock contract (penalty bps)</li>
        </ul>
      </section>

      <footer style={{ marginTop: 40, opacity: 0.65 }}>
        © {new Date().getFullYear()} Northbridge Chain
      </footer>
    </main>
  );
}
