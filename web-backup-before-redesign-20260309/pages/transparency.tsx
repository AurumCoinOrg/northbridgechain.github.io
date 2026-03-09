import React from "react";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";
const VAULT = "0x81A41Be104490887533D24758905cF9023c27BB8";

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  };
}

function pillStyle(): React.CSSProperties {
  return {
    display: "inline-flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
  };
}

function mono(): React.CSSProperties {
  return {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    fontSize: 13,
    wordBreak: "break-word",
  };
}

function rowLabel(): React.CSSProperties {
  return { opacity: 0.75, fontSize: 12, letterSpacing: 1.1, textTransform: "uppercase" };
}

function short(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

// Timelock drill opId (optional)
const DRILL_OP_ID = "0x24ffd07a925a62fadbd351e93da4bcd953ab930ef4b1712a596b05c3a260743b";

export default function Transparency() {
  const hasDrillOpId = typeof DRILL_OP_ID === "string" && DRILL_OP_ID.startsWith("0x") && DRILL_OP_ID.length === 66;

  const lastUpdated = new Date().toISOString().slice(0, 10);

  return (
    <div
      style={{
        minHeight: "100vh",
        color: "rgba(255,255,255,0.92)",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(255,215,0,0.18), transparent 60%)," +
          "radial-gradient(900px 500px at 80% 20%, rgba(120,160,255,0.18), transparent 60%)," +
          "linear-gradient(180deg, #070A12, #05060B 55%, #04040A)",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 18px 60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <a href="/" style={pillStyle()}>
            ← Home
          </a>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/contracts" style={pillStyle()}>Contracts</a>
            <a href="/explorer" style={pillStyle()}>Explorer Lite</a>
            <a href="/whitepaper-v0-1" style={pillStyle()}>Whitepaper</a>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ opacity: 0.85, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>
            Northbridge Chain • Transparency
          </div>
          <h1 style={{ margin: "10px 0 10px", fontSize: 44, lineHeight: 1.06 }}>Trust, by default.</h1>
          <div style={{ opacity: 0.82, maxWidth: 900 }}>
            This page summarizes who controls what, what is immutable, and what can change. It’s designed for users,
            builders, and exchanges.
          </div>
        </div>

        <div style={{ marginTop: 18, display: "grid", gap: 16, gridTemplateColumns: "minmax(0, 1.5fr) minmax(0, 1fr)", alignItems: "start" }}>
  <div style={{ minWidth: 320, display: "grid", gap: 16 }}>
    <div style={cardStyle()}>
            <div style={rowLabel()}>Status</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div><b>Network:</b> Northbridge Testnet</div>
              <div><b>Governance:</b> Multisig-controlled (recommended)</div>

            
          </div>
    <div style={cardStyle()}>
            <div style={rowLabel()}>Security</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div><b>Audits:</b> Not published yet</div>

<div style={{ marginTop: 18 }}>
  <div style={{ border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  padding: 18,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                  backdropFilter: "blur(10px)" }}>{hasDrillOpId && (

    <div style={{ marginTop: 12, padding: 14, border: "1px solid rgba(255,255,255,0.14)", borderRadius: 12, background: "rgba(0,0,0,0.22)" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Governance Timelock — Live Drill Status</div>
              <div style={{ marginBottom: 6 }}>
                OP_ID: <code style={{ wordBreak: "break-all", fontSize: 12, opacity: 0.92 }}>{DRILL_OP_ID}</code>
              </div>
              <TimelockStatus />
            </div>

              
)}<div><b>Staking:</b> Live</div>
              <div><b>Last updated:</b> {lastUpdated}</div>
            </div>
  </div>
</div>


              <div><b>Bug bounty:</b> Not announced yet</div>
              <div style={{ opacity: 0.85 }}>
                Until an audit is published, treat the protocol as <b>experimental</b> and do not deposit funds you can’t
                afford to lose.
              </div>
            </div>
          </div>
  </div>
  <div style={{ minWidth: 320, display: "grid", gap: 16 }}>
    <div style={cardStyle()}>
            <div style={rowLabel()}>Upgradability & Controls</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div><b>Emissions:</b> Adjustable on-chain (by admin)</div>
              <div><b>Staking:</b> Admin may pause / configure (depending on contract)</div>
              <div><b>Token:</b> Standard ERC-20 (supply rules depend on deployment)</div>
              <div style={{ opacity: 0.85 }}>
                Exact permissions are visible on the <a href="/contracts" style={{ color: "rgba(255,215,0,0.95)" }}>Contracts</a> page.
              </div>
            </div>
          </div>
  </div>
</div>

        <div style={{ marginTop: 16, ...cardStyle() }}>
          <div style={rowLabel()}>Core Contracts</div>
          <div style={{ marginTop: 12, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
            <div style={cardStyle()}>
              <div style={{ opacity: 0.85 }}>NBCX Token</div>
              <div style={{ marginTop: 10 }}>
                <div><b>Address:</b> <span style={mono()}>{NBCX}</span></div>
                <div style={{ marginTop: 8, opacity: 0.85 }}><b>Short:</b> {short(NBCX)}</div>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ opacity: 0.85 }}>Staking</div>
              <div style={{ marginTop: 10 }}>
                <div><b>Address:</b> <span style={mono()}>{STAKING}</span></div>
                <div style={{ marginTop: 8, opacity: 0.85 }}><b>Short:</b> {short(STAKING)}</div>
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ opacity: 0.85 }}>Vault / Vault</div>
              <div style={{ marginTop: 10 }}>
                <div><b>Address:</b> <span style={mono()}>{VAULT}</span></div>
                <div style={{ marginTop: 8, opacity: 0.85 }}><b>Short:</b> {short(VAULT)}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 14, opacity: 0.85 }}>
            Tip: you can paste any address into <a href="/wallet" style={{ color: "rgba(255,215,0,0.95)" }}>Wallet</a> to view balance + staked + earned.
          </div>
        </div>

        <div style={{ marginTop: 16, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>
          <div style={cardStyle()}>
            <div style={rowLabel()}>What we publish</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div>• Contract addresses and roles</div>
              <div>• Admin controls and intended policy</div>
              <div>• Roadmap and release notes</div>
              <div>• RPC endpoint(s) for public access</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={rowLabel()}>What’s next</div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              <div>• Publish ownership / multisig address on Contracts page</div>
              <div>• Add audit + bounty section when ready</div>
              <div>• Add on-chain permission snapshots (read-only)</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, opacity: 0.7, fontSize: 12 }}>
          © {new Date().getFullYear()} Northbridge Chain • Transparency is a living document.
        </div>
      </div>
    </div>
  );
}



function formatLeft(sec: number) {
  sec = Math.max(0, Number(sec || 0));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const parts = [] as string[];
  if (d) parts.push(`${d}d`);
  if (h || d) parts.push(`${h}h`);
  if (m || h || d) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

function TimelockStatus() {
  const [data, setData] = React.useState<any>(null);
  const [err, setErr] = React.useState<string>("");

  const hasOpId = typeof DRILL_OP_ID === "string" && DRILL_OP_ID.startsWith("0x") && DRILL_OP_ID.length === 66;
  if (!hasOpId) return null;

  React.useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setErr("");
        const r = await fetch(`/api/governance.json?opId=${DRILL_OP_ID}`);
        const j = await r.json();
        if (!alive) return;
        setData(j.timelockStatus || null);
      } catch (e: any) {
        if (!alive) return;
        setErr(String(e?.message || e));
      }
    }

    load();
    const t = setInterval(load, 15000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (err) {
    return (
      <div style={{ marginTop: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{
            width: 10, height: 10, borderRadius: 999,
            background: "rgba(255,80,80,0.95)",
            boxShadow: "0 0 0 6px rgba(255,80,80,0.12)"
          }} />
          <b style={{ color: "rgba(255,180,180,0.95)" }}>RPC error</b>
        </div>
        <div style={{ marginTop: 6, opacity: 0.85, fontSize: 13 }}>{err}</div>
      </div>
    );
  }

  if (!data) return <p style={{ marginTop: 10, opacity: 0.85 }}>Loading…</p>;
  if (data.error) return <p style={{ marginTop: 10 }}>RPC error: {data.error}</p>;

  const pending = !!data.pending;
  const ready   = !!data.ready;
  const done    = !!data.done;

  const status =
    done ? { label: "Executed", color: "rgba(80, 255, 160, 0.95)", glow: "rgba(80,255,160,0.18)" } :
    ready ? { label: "Ready",    color: "rgba(255, 220, 120, 0.95)", glow: "rgba(255,220,120,0.18)" } :
    pending ? { label: "Pending", color: "rgba(255, 165, 80, 0.95)", glow: "rgba(255,165,80,0.18)" } :
    { label: "Unknown", color: "rgba(200,200,200,0.9)", glow: "rgba(200,200,200,0.10)" };

  const sec = Math.max(0, Number(data.secondsLeft || 0));
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const ss = Math.floor(sec % 60);
  const left = `${d ? d + "d " : ""}${(h || d) ? h + "h " : ""}${(m || h || d) ? m + "m " : ""}${ss}s`.trim();

  const explorerHref = `/explorer?opId=${encodeURIComponent(String(data.opId || DRILL_OP_ID))}`;

  return (
    <div style={{ marginTop: 10 }}>
      <style jsx>{`
        @keyframes nb_pulse {
          0%   { transform: scale(1);   opacity: 0.95; }
          50%  { transform: scale(1.15); opacity: 0.70; }
          100% { transform: scale(1);   opacity: 0.95; }
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: status.color,
              boxShadow: `0 0 0 7px ${status.glow}`,
              animation: "nb_pulse 1.4s ease-in-out infinite"
            }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>{status.label}</div>
            <div style={{ opacity: 0.75, fontSize: 13 }}>
              Pending: <b>{String(pending)}</b> • Ready: <b>{String(ready)}</b> • Done: <b>{String(done)}</b>
            </div>
          </div>
        </div>

        <a
          href={explorerHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(0,0,0,0.18)",
            color: "rgba(255,255,255,0.92)",
            textDecoration: "none",
            whiteSpace: "nowrap"
          }}
        >
          View on Explorer →
        </a>
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ opacity: 0.75, fontSize: 13 }}>Time left</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{left}</div>
      </div>

      <div style={{ marginTop: 10, opacity: 0.75, fontSize: 12 }}>
        OP_ID: <code style={{ wordBreak: "break-all" }}>{String(data.opId || DRILL_OP_ID)}</code>
      </div>
    </div>
  );
}
