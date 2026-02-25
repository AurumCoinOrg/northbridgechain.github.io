import Link from "next/link";

const RPC_URL = "http://89.167.28.12:8545";
const CHAIN_ID = 9000;

// Governance / Owners
const MULTISIG = "0xac2d3568271AE9dAf802C46ba60daE9fEE653c20";
const OWNER1 = "0xf4A78142187754db8De724C962E48550585C5669";
const OWNER2 = "0xfbBC8cb66CF2db89A8059f161ccDc3653B17ECba";
const OWNER3 = "0x5d47Cc8675344E69FBAb0b34b89a83fAD3b0D4cb";

// Core contracts (V2)
const NBCX_V2 = "0xBa73385776f5A2D3F5D199bB2D0bA20704A7895a";
const STAKING_V2 = "0x4b941e43989D24086C9CaFd1d91c78ac6C25214F";
const LOCK_V2 = "0xB9B5d2218035ED91451DfEf6E6894036fFd247B1";

export default function Contracts() {
  const Row = ({ k, v }: { k: string; v: string }) => (
    <tr>
      <td style={{ padding: "10px 12px", fontWeight: 700, width: 220, verticalAlign: "top" }}>{k}</td>
      <td style={{ padding: "10px 12px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{v}</td>
    </tr>
  );

  return (
    <main style={{ maxWidth: 920, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <h1 style={{ margin: 0 }}>Contracts</h1>
        <nav style={{ display: "flex", gap: 14, fontWeight: 600 }}>
          <Link href="/">Home</Link>
          <Link href="/whitepaper-v0-1">Whitepaper</Link>
          <Link href="/roadmap">Roadmap</Link>
          <Link href="/architecture">Architecture</Link>
          <Link href="/demo">Demo</Link>
        </nav>
      </header>

      <p style={{ opacity: 0.8, marginTop: 10 }}>
        Chain ID: <b>{CHAIN_ID}</b> • RPC: <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>{RPC_URL}</span>
      </p>

      <h2>Governance</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, overflow: "hidden" as any }}>
        <tbody>
          <Row k="Multisig (2-of-3)" v={MULTISIG} />
          <Row k="Owner 1" v={OWNER1} />
          <Row k="Owner 2" v={OWNER2} />
          <Row k="Owner 3" v={OWNER3} />
        </tbody>
      </table>

      <h2 style={{ marginTop: 22 }}>Core (V2)</h2>
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(0,0,0,0.12)", borderRadius: 12, overflow: "hidden" as any }}>
        <tbody>
          <Row k="NBCX Token (V2)" v={NBCX_V2} />
          <Row k="Staking (V2)" v={STAKING_V2} />
          <Row k="Lock (V2)" v={LOCK_V2} />
        </tbody>
      </table>

      <p style={{ marginTop: 18, opacity: 0.75 }}>
        Keep governance keys offline. Only use a hot wallet for testing.
      </p>
    </main>
  );
}
