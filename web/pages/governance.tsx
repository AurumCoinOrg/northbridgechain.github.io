export default function Governance() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
      <h1>Governance Process</h1>

      <p>
        NBCX is governed by a <b>2-of-3 multisig</b> behind a <b>72-hour timelock</b>. No single wallet can move treasury funds.
      </p>

      <h2>How changes happen</h2>
      <ol>
        <li><b>Propose</b>: Multisig submits a transaction targeting the Timelock.</li>
        <li><b>Confirm</b>: At least 2 owners confirm the proposal.</li>
        <li><b>Schedule</b>: Timelock schedules the operation and enforces the delay.</li>
        <li><b>Execute</b>: After delay, multisig executes the Timelock operation.</li>
      </ol>

      <h2>Immutable constraints</h2>
      <ul>
        <li><b>Token</b>: Fixed supply (no mint exposed).</li>
        <li><b>Staking</b>: Rewards paid from a prefunded pool with deterministic halving schedule.</li>
        <li><b>Admin scope</b>: Timelock + multisig can act on treasury only (staking pool has no admin drain path).</li>
      </ul>

      <h2>Public config</h2>
      <p>
        Addresses and parameters are published at: <a href="/api/governance.json">/api/governance.json</a>
      </p>
    </main>
  );
}
