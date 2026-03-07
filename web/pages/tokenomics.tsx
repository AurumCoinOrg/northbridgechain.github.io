import React from "react";

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };
}

export default function Tokenomics() {
  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        color: "rgba(255,255,255,0.92)",
        background:
          "radial-gradient(1200px 600px at 20% 10%, rgba(255,215,0,0.18), transparent 60%)," +
          "radial-gradient(900px 500px at 80% 20%, rgba(120,160,255,0.18), transparent 60%)," +
          "linear-gradient(180deg, #070A12, #05060B 55%, #04040A)",
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ marginBottom: 30 }}>NBCX Tokenomics & Emission Policy (v1)</h1>

        <div style={cardStyle()}>
          <h2>Hard Cap</h2>
          <p><b>Total Supply:</b> 100,000,000 NBCX</p>
          <p>Minted once at deployment. No mint function exists. Cap is permanent and immutable.</p>
        </div>

        <div style={cardStyle()}>
          <h2>Initial Distribution</h2>
          <ul>
            <li>35,000,000 (35%) – Staking Rewards Pool</li>
            <li>30,000,000 (30%) – Treasury (timelocked)</li>
            <li>20,000,000 (20%) – Ecosystem & Grants (timelocked)</li>
            <li>10,000,000 (10%) – Team (4-year vesting, 1-year cliff)</li>
            <li>5,000,000 (5%) – Liquidity provisioning</li>
          </ul>
        </div>

        <div style={cardStyle()}>
          <h2>Staking Emission Model</h2>
          <p><b>Staking Pool:</b> 35,000,000 NBCX (pre-funded, no refill)</p>
          <p>Deterministic halving every 4 years:</p>
          <ul>
            <li>Years 0–4: 17,500,000 NBCX</li>
            <li>Years 4–8: 8,750,000 NBCX</li>
            <li>Years 8–12: 4,375,000 NBCX</li>
            <li>Years 12–16: 2,187,500 NBCX</li>
            <li>Years 16–20: 1,093,750 NBCX</li>
          </ul>
          <p>Emission rate automatically halves via timestamp logic. It can never increase.</p>
          <p>When the staking pool is exhausted, rewards permanently stop.</p>
        </div>

        <div style={cardStyle()}>
          <h2>Security Guarantees</h2>
          <ul>
            <li>Immutable monetary policy</li>
            <li>No inflation authority</li>
            <li>No governance emission control</li>
            <li>Staking principal cannot be drained</li>
            <li>Only emergency pause for new staking (multisig controlled)</li>
          </ul>
        </div>

        <div style={cardStyle()}>
          <h2>Treasury Controls</h2>
          <ul>
            <li>3-of-5 multisig</li>
            <li>72-hour timelock</li>
            <li>Public transaction queue</li>
            <li>Cannot modify supply or emissions</li>
          </ul>
        </div>

        <div style={cardStyle()}>
          <h2>Vesting Structure</h2>
          <ul>
            <li>Team: 1-year cliff</li>
            <li>4-year total vesting</li>
            <li>Linear monthly unlock</li>
            <li>No early unlock</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
