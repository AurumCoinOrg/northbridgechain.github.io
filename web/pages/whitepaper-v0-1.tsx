export default function WhitepaperV01() {
  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1>NorthbridgeChain Whitepaper (v0.1)</h1>

      <h2>Overview</h2>
      <p>
        NorthbridgeChain uses on-chain multisig governance and staking-based emissions
        controlled via rewardRate.
      </p>

      <h2>Architecture</h2>
      <ul>
        <li>2-of-3 Multisig Governance</li>
        <li>NBCX Token (ERC20)</li>
        <li>Staking Contract (rewardRate controlled)</li>
        <li>Lock Contract (penalty + treasury routing)</li>
      </ul>

      <h2>Emissions Model</h2>
      <p>
        Emissions are configured via multisig. Reward rate can be adjusted through
        governance transactions.
      </p>

      <p><a href="/">Back to Home</a></p>
    </main>
  );
}
