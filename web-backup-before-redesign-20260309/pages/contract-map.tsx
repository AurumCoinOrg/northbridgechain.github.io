import Head from "next/head";

const TIMELOCK = "0x21e2962b917B7bA8B49540d0A0898981Bc88AE2D";
const VAULT = "0x81A41Be104490887533D24758905cF9023c27BB8";
const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";

const OWNER1 = "0xfbBC8cb66CF2db89A8059f161ccDc3653B17ECba";
const OWNER2 = "0x5d47Cc8675344E69FBAb0b34b89a83fAD3b0D4cb";
const OWNER3 = "0xAb22B5283050E218f5B08878D2E5b7B7c9420978";

function short(a: string) {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

function explorerUrl(a: string) {
  return "/explorer?addr=" + a;
}

function cardStyle() {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  } as const;
}

function Row(props: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexWrap: "wrap",
      }}
    >
      <b>{props.label}</b>
      <span style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "monospace" }}>
          {props.value} ({short(props.value)})
        </span>
        <a href={explorerUrl(props.value)} style={{ opacity: 0.85, textDecoration: "none" }}>
          View →
        </a>
      </span>
    </div>
  );
}

function Box(props: { title: string; value: string; subtitle: string }) {
  return (
    <div
      style={{
        ...cardStyle(),
        minHeight: 120,
        display: "grid",
        alignContent: "start",
        gap: 8,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 800 }}>{props.title}</div>
      <div style={{ opacity: 0.78, fontSize: 13 }}>{props.subtitle}</div>
      <a
        href={explorerUrl(props.value)}
        style={{
          textDecoration: "none",
          color: "rgba(255,255,255,0.92)",
          fontFamily: "monospace",
          fontSize: 13,
          wordBreak: "break-all",
        }}
      >
        {props.value}
      </a>
    </div>
  );
}

function Arrow(props: { label?: string }) {
  return (
    <div
      style={{
        display: "grid",
        justifyItems: "center",
        alignItems: "center",
        gap: 6,
        padding: "6px 0",
      }}
    >
      {props.label ? <div style={{ opacity: 0.75, fontSize: 12 }}>{props.label}</div> : null}
      <div style={{ fontSize: 28, lineHeight: 1 }}>↓</div>
    </div>
  );
}

export default function ContractMap() {
  return (
    <>
      <Head>
        <title>Contract Map</title>
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Northbridge Contract Map</h1>
        <div style={{ opacity: 0.82, marginBottom: 24 }}>
          Live contracts, governance owners, and control flow.
        </div>

        <h2>Live Contracts</h2>
        <div style={{ ...cardStyle(), marginTop: 10 }}>
          <Row label="NBCX Token (V2)" value={NBCX} />
          <Row label="Staking (V2)" value={STAKING} />
          <Row label="Treasury Vault" value={VAULT} />
          <Row label="Timelock (72h)" value={TIMELOCK} />
        </div>

        <h2 style={{ marginTop: 28 }}>Governance Owners</h2>
        <div style={{ ...cardStyle(), marginTop: 10 }}>
          <Row label="Owner 1" value={OWNER1} />
          <Row label="Owner 2" value={OWNER2} />
          <Row label="Owner 3" value={OWNER3} />
        </div>

        <h2 style={{ marginTop: 28 }}>Live Architecture Diagram</h2>

        <div
          style={{
            ...cardStyle(),
            marginTop: 10,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 18,
              justifyItems: "stretch",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 14,
              }}
            >
              <Box title="Owner 1" value={OWNER1} subtitle="Governance signer" />
              <Box title="Owner 2" value={OWNER2} subtitle="Governance signer" />
              <Box title="Owner 3" value={OWNER3} subtitle="Governance signer" />
            </div>

            <Arrow label="2-of-3 operational approvals" />

            <Box title="TimelockController" value={TIMELOCK} subtitle="72 hour governance delay" />

            <Arrow label="Owns treasury" />

            <Box title="TreasuryVault" value={VAULT} subtitle="Treasury / ecosystem / team funds" />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 14,
                marginTop: 8,
              }}
            >
              <Box title="NBCX Token (V2)" value={NBCX} subtitle="Live ERC-20 token" />
              <Box title="Staking (V2)" value={STAKING} subtitle="Prefunded rewards pool" />
            </div>

            <div style={{ opacity: 0.8, marginTop: 6 }}>
              Flow: owners govern the timelock, the timelock owns the TreasuryVault, and NBCX/Staking operate as separate live contracts.
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
