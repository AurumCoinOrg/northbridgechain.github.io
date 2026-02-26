import { STAKING, NBCX, MULTISIG } from "../lib/config";

export default function Tokenomics() {
  return (
    <main style={{ minHeight: "100vh", padding: 28, background: "#070A0F", color: "#EAF0FF", fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ letterSpacing: 2, opacity: 0.8, fontSize: 12 }}>NORTHBRIDGE</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 36 }}>Tokenomics</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Clear, simple, credible v0.1 tokenomics.</div>

        <div style={box()}>
          <h3 style={{ marginTop: 0 }}>Core Assets</h3>
          <ul>
            <li><b>NBC</b>: native gas token</li>
            <li><b>NBCX</b>: staking / rewards token</li>
          </ul>
        </div>

        <div style={box()}>
          <h3 style={{ marginTop: 0 }}>Emissions</h3>
          <ul>
            <li><b>Phase A:</b> 4,000 NBCX / day (launch hype)</li>
            <li><b>Phase B:</b> 2,000 NBCX / day (sustainable)</li>
            <li>Governance can adjust emissions via multisig vote.</li>
          </ul>
        </div>

        <div style={box()}>
          <h3 style={{ marginTop: 0 }}>On-chain Contracts</h3>
          <ul>
            <li><b>Multisig:</b> {MULTISIG}</li>
            <li><b>Staking:</b> {STAKING}</li>
            <li><b>NBCX:</b> {NBCX}</li>
          </ul>
        </div>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 13 }}>
          <a href="/transparency" style={link()}>Transparency →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/wallet" style={link()}>Wallet →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/" style={link()}>Home →</a>
        </div>
      </div>
    </main>
  );
}

function box() {
  return { marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" } as const;
}
function link() {
  return { color: "#EAF0FF", textDecoration: "underline", textUnderlineOffset: 4 } as const;
}
