import Head from "next/head";
import { useEffect, useState } from "react";

const RPC_URL = "/api/rpc";
const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";

const ERC20_DECIMALS = "0x313ce567";
const ERC20_TOTAL_SUPPLY = "0x18160ddd";
const ERC20_BALANCE_OF = "0x70a08231";
const CHAIN_ID = "eth_chainId";
const BLOCK_NUMBER = "eth_blockNumber";

function fmtHexInt(hex: string) {
  try {
    return parseInt(hex, 16).toLocaleString();
  } catch {
    return "0";
  }
}

function fmtUnits(hex: string, decimals = 18) {
  try {
    const n = BigInt(hex);
    const div = 10n ** BigInt(decimals);
    const whole = n / div;
    const frac = n % div;
    const fracStr = frac.toString().padStart(decimals, "0").slice(0, 4).replace(/0+$/, "");
    return fracStr ? `${whole.toLocaleString()}.${fracStr}` : whole.toLocaleString();
  } catch {
    return "0";
  }
}

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function cardStyle(): React.CSSProperties {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
  };
}

export default function NetworkStatus() {
  const [chainId, setChainId] = useState("-");
  const [blockNumber, setBlockNumber] = useState("-");
  const [tokenDecimals, setTokenDecimals] = useState(18);
  const [totalSupply, setTotalSupply] = useState("-");
  const [stakingBalance, setStakingBalance] = useState("-");
  const [lastUpdated, setLastUpdated] = useState("-");
  const [err, setErr] = useState("");

  useEffect(() => {
    let dead = false;

    async function load() {
      try {
        setErr("");

        const chain = await rpc(CHAIN_ID);
        const block = await rpc(BLOCK_NUMBER);

        const decimalsHex = await rpc("eth_call", [
          { to: NBCX, data: ERC20_DECIMALS },
          "latest",
        ]);
        const decimals = parseInt(decimalsHex, 16) || 18;

        const supplyHex = await rpc("eth_call", [
          { to: NBCX, data: ERC20_TOTAL_SUPPLY },
          "latest",
        ]);

        const stakingBalHex = await rpc("eth_call", [
          { to: NBCX, data: ERC20_BALANCE_OF + STAKING.slice(2).padStart(64, "0") },
          "latest",
        ]);

        if (dead) return;

        setChainId(fmtHexInt(chain));
        setBlockNumber(fmtHexInt(block));
        setTokenDecimals(decimals);
        setTotalSupply(fmtUnits(supplyHex, decimals));
        setStakingBalance(fmtUnits(stakingBalHex, decimals));
        setLastUpdated(new Date().toLocaleString());
      } catch (e: any) {
        if (!dead) setErr(e?.message || "Failed to load network status");
      }
    }

    load();
    const t = setInterval(load, 15000);
    return () => {
      dead = true;
      clearInterval(t);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Network Status</title>
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Northbridge Network Status</h1>
        <div style={{ opacity: 0.82, marginBottom: 24 }}>
          Live chain and contract stats pulled from the Northbridge RPC.
        </div>

        {err ? (
          <div style={{ ...cardStyle(), color: "rgba(255,120,120,0.95)", marginBottom: 16 }}>
            Error: {err}
          </div>
        ) : null}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>Chain ID</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{chainId}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>Current Block</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{blockNumber}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>NBCX Decimals</div>
            <div style={{ fontSize: 30, fontWeight: 800 }}>{tokenDecimals}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>Last Updated</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>{lastUpdated}</div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 14,
            marginTop: 14,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>NBCX Total Supply</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{totalSupply}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ opacity: 0.72, marginBottom: 8 }}>Staking Pool Balance</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>{stakingBalance}</div>
          </div>
        </div>
      </main>
    </>
  );
}
