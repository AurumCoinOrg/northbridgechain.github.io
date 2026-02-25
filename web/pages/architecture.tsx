import Link from "next/link";

export default function Architecture() {
  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Architecture (v0.1)</h1>
        <nav style={{ display: "flex", gap: 14, fontWeight: 600 }}>
          <Link href="/">Home</Link>
          <Link href="/whitepaper-v0-1">Whitepaper</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="/demo">Demo</Link>
        </nav>
      </header>

      <section style={{ marginTop: 18, lineHeight: 1.8 }}>
        <h2>Core pieces</h2>
        <ul>
          <li><b>Multisig (2-of-3)</b>: owns admin functions; reduces single-key risk.</li>
          <li><b>NBCX Token (V2)</b>: ERC-20 token with controlled minting/ownership.</li>
          <li><b>Staking (V2)</b>: users stake NBCX and earn emissions over time.</li>
          <li><b>Lock (V2)</b>: time/penalty-based locking primitive (treasury receives penalty).</li>
        </ul>

        <h2>Flow</h2>
        <ol>
          <li>Multisig funds staking contract with reward tokens.</li>
          <li>User approves staking contract to spend NBCX.</li>
          <li>User stakes NBCX → starts earning via rewardRate.</li>
          <li>User claims rewards anytime (rewards transfer from staking balance).</li>
          <li>User can optionally lock tokens; early exit pays penalty to treasury (multisig).</li>
        </ol>

        <h2>Safety model</h2>
        <ul>
          <li>Governance keys should be offline / hardware-backed.</li>
          <li>Only multisig can change rewardRate / ownership-level actions.</li>
          <li>Public demo wallet is for testing only.</li>
        </ul>
      </section>
    </main>
  );
}
