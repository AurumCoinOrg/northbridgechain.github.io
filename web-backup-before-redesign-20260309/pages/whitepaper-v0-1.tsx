import React from "react";

export default function WhitepaperV01() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui" }}>
      <h1>NorthbridgeChain Whitepaper (v0.1)</h1>
      <p>
        This is the v0.1 draft. It will be updated as the protocol and contracts finalize.
      </p>

      <h2>Overview</h2>
      <ul>
        <li>Chain ID: 9000 (Northbridge Local)</li>
        <li>Governance: 2-of-3 Multisig</li>
        <li>Core modules: Token, Staking, Lock</li>
      </ul>

      <h2>Architecture (v0.1)</h2>
      <ul>
        <li>NBCX Token: ERC-20 with owner-controlled mint (governance)</li>
        <li>Staking: stake/unstake/claim with emissions controlled by governance</li>
        <li>Lock: treasury + penaltyBps for early exits</li>
      </ul>

      <h2>Governance</h2>
      <p>
        All critical permissions are intended to be held by the multisig to reduce single-key risk.
      </p>

      <h2>Roadmap</h2>
      <ol>
        <li>v0.1: contracts live, staking UI live, emissions schedule live</li>
        <li>v0.2: audits + hardening + monitoring</li>
        <li>v1.0: mainnet-ready release</li>
      </ol>
    </main>
  );
}
