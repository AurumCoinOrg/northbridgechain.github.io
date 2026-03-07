import { useEffect, useState } from "react";

const RPC = "https://northbridgechain.com/api/rpc";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";
const TOKEN = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const MULTISIG = "0x1f8d52151cbEa7098aA0A628079DEEBC3F15ab17";
const TIMELOCK = "0x21e2962b917B7bA8B49540d0A0898981Bc88AE2D";
const TIMELOCK_DELAY_SECONDS = 259200; // 72h

const EXPLORER = "https://northbridgechain.com";

function formatEther(value: number) {
  return (value / 1e18).toLocaleString(undefined, {
    maximumFractionDigits: 4
  });
}

export default function HowItWorks() {
  const [stats, setStats] = useState<any>(null);

  async function rpc(method: string, params: any[] = []) {
    const r = await fetch(RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }),
    });
    const j = await r.json();
    return j.result;
  }

  async function load() {
    try {
      const [block, rewardRate, totalStaked, funded] = await Promise.all([
        rpc("eth_blockNumber"),
        rpc("eth_call", [{ to: STAKING, data: "0x7b0a47ee" }, "latest"]),
        rpc("eth_call", [{ to: STAKING, data: "0x817b1cd2" }, "latest"]),
        rpc("eth_call", [{ to: STAKING, data: "0xec6814fb" }, "latest"]),
      ]);

      setStats({
        block: parseInt(block, 16),
        rewardRate: parseInt(rewardRate, 16),
        totalStaked: parseInt(totalStaked, 16),
        funded: funded === "0x1"
      });
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    load();
    const i = setInterval(load, 10000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ maxWidth: 1000, margin: "80px auto", padding: "0 20px" }}>
      <h1 style={{ fontSize: 38, marginBottom: 30 }}>
        How NorthBridge Works
      </h1>

      <Section title="Network Architecture">
        Independent EVM-compatible blockchain.<br/>
        Chain ID: 9000<br/>
        RPC Endpoint: {RPC}
      </Section>

      <Section title="NBCX Token">
        Fixed supply token powering staking emissions.
        Rewards are distributed from a funded pool —
        not algorithmically minted.
      </Section>

      <Section title="Staking Protocol">
        <ul>
          <li><code>stake(uint256)</code></li>
          <li><code>claim()</code></li>
          <li><code>unstake(uint256)</code></li>
        </ul>
        Rewards accrue per second based on rewardRate and totalStaked.
      </Section>

      <Section title="Emission Model">
        Emissions are pre-funded and distributed while
        <code> FUNDED() </code> remains true.
        Distribution stops when the reward pool is depleted.
      </Section>


      <Section title="Governance Controls">
        Protocol admin actions are gated by a <b>2-of-3 multisig</b> behind a <b>72-hour timelock</b>.
        <ul>
          <li><b>Multisig (Governance):</b> <code>{MULTISIG}</code></li>
          <li><b>Timelock:</b> <code>{TIMELOCK}</code></li>
          <li><b>Delay:</b> {Math.floor(TIMELOCK_DELAY_SECONDS / 3600)} hours ({TIMELOCK_DELAY_SECONDS.toLocaleString()} seconds)</li>
        </ul>
        What this means:
        <ul>
          <li>No single wallet can change parameters or move treasury funds.</li>
          <li>Even the multisig must <b>schedule</b> actions first, then wait the timelock delay, then <b>execute</b>.</li>
          <li>Users can monitor pending operations publicly on the <a href="/transparency">Transparency</a> page.</li>
        </ul>
      </Section>

      <Section title="Live Network Telemetry">
        {!stats && <div>Loading live data...</div>}

        {stats && (
          <div style={{ display: "grid", gap: 16, marginTop: 20 }}>
            <Card label="Current Block" value={stats.block} />
            <Card label="Reward Rate (NBCX/sec)" value={formatEther(stats.rewardRate)} />
            <Card label="Total Staked (NBCX)" value={formatEther(stats.totalStaked)} />
            <Card
              label="Rewards Funded"
              value={
                <span style={{
                  color: stats.funded ? "#4caf50" : "#ff9800",
                  fontWeight: 600
                }}>
                  {stats.funded ? "Active" : "Inactive"}
                </span>
              }
            />
          </div>
        )}
      </Section>

      <Section title="Contract Addresses">
        <div style={{ fontFamily: "monospace", fontSize: 14 }}>
          Staking: {STAKING}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div style={{
      marginBottom: 50,
      paddingBottom: 20,
      borderBottom: "1px solid rgba(255,255,255,0.08)"
    }}>
      <h2 style={{
        fontSize: 22,
        marginBottom: 14,
        borderLeft: "4px solid #c6a44c",
        paddingLeft: 12
      }}>
        {title}
      </h2>
      <div style={{ opacity: 0.85, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}

function Card({ label, value }: any) {
  return (
    <div style={{
      padding: 20,
      borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.04)"
    }}>
      <div style={{ fontSize: 14, opacity: 0.6 }}>{label}</div>
      <div style={{ fontSize: 20, marginTop: 6, fontFamily: "monospace" }}>
        {value}
      </div>
    </div>
  );
}
