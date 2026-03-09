import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";

const PAIR_ABI = [
  "event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)",
  "event Mint(address indexed sender,uint amount0,uint amount1)",
  "event Burn(address indexed sender,uint amount0,uint amount1,address indexed to)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

function short(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

function fmt(x: bigint, decimals = 18, maxFrac = 6) {
  const s = ethers.formatUnits(x, decimals);
  const [w, f = ""] = s.split(".");
  const cut = f.slice(0, maxFrac).replace(/0+$/, "");
  return cut ? `${w}.${cut}` : w;
}

export default function DexActivityPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [items, setItems] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [updated, setUpdated] = useState("-");

  async function load() {
    try {
      setErr("");

      const pair = new ethers.Contract(PAIR, PAIR_ABI, provider);
      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 5000);

      const [token0, token1, swapLogs, mintLogs, burnLogs] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.queryFilter(pair.filters.Swap(), fromBlock, latest),
        pair.queryFilter(pair.filters.Mint(), fromBlock, latest),
        pair.queryFilter(pair.filters.Burn(), fromBlock, latest)
      ]);

      const token0Label = String(token0).toLowerCase() === "0xb4e91c043f1166ab33653adbe316c7a6423cb723".toLowerCase() ? "WNBCX" : "NBCX";
      const token1Label = String(token1).toLowerCase() === "0xb4e91c043f1166ab33653adbe316c7a6423cb723".toLowerCase() ? "WNBCX" : "NBCX";

      const swaps = swapLogs.map((log: any) => ({
        type: "Swap",
        tx: log.transactionHash,
        block: Number(log.blockNumber),
        actor: log.args?.sender || "",
        target: log.args?.to || "",
        detail:
          `${fmt(BigInt(log.args?.amount0In || 0n))} ${token0Label} in, ` +
          `${fmt(BigInt(log.args?.amount1In || 0n))} ${token1Label} in, ` +
          `${fmt(BigInt(log.args?.amount0Out || 0n))} ${token0Label} out, ` +
          `${fmt(BigInt(log.args?.amount1Out || 0n))} ${token1Label} out`
      }));

      const mints = mintLogs.map((log: any) => ({
        type: "Add Liquidity",
        tx: log.transactionHash,
        block: Number(log.blockNumber),
        actor: log.args?.sender || "",
        target: "",
        detail:
          `${fmt(BigInt(log.args?.amount0 || 0n))} ${token0Label} + ` +
          `${fmt(BigInt(log.args?.amount1 || 0n))} ${token1Label}`
      }));

      const burns = burnLogs.map((log: any) => ({
        type: "Remove Liquidity",
        tx: log.transactionHash,
        block: Number(log.blockNumber),
        actor: log.args?.sender || "",
        target: log.args?.to || "",
        detail:
          `${fmt(BigInt(log.args?.amount0 || 0n))} ${token0Label} + ` +
          `${fmt(BigInt(log.args?.amount1 || 0n))} ${token1Label}`
      }));

      const rows = [...swaps, ...mints, ...burns]
        .sort((a, b) => b.block - a.block)
        .slice(0, 50);

      setItems(rows);
      setUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load DEX activity");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Head>
        <title>DEX Activity</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>DEX Activity</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Recent swaps and liquidity events from the live NBCX / WNBCX pool
        </div>

        {err ? (
          <div style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            background: "rgba(239,68,68,0.12)",
            border: "1px solid rgba(239,68,68,0.28)",
            color: "rgba(255,220,220,0.98)"
          }}>
            {err}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <a href="/dex" style={pill()}>DEX →</a>
          <a href="/swap" style={pill()}>Swap →</a>
          <a href="/liquidity" style={pill()}>Liquidity →</a>
          <a href="/analytics" style={pill()}>Analytics →</a>
        </div>

        <div style={{
          overflowX: "auto",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)"
        }}>
          <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th()}>Type</th>
                <th style={th()}>Tx</th>
                <th style={th()}>Block</th>
                <th style={th()}>Actor</th>
                <th style={th()}>Target</th>
                <th style={th()}>Details</th>
              </tr>
            </thead>
            <tbody>
              {items.length ? items.map((x, i) => (
                <tr key={x.tx + ":" + i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={td()}>{x.type}</td>
                  <td style={tdMono()}>
                    <a href={`/tx/${x.tx}`} style={{ color: "inherit", textDecoration: "none" }}>{short(x.tx)}</a>
                  </td>
                  <td style={td()}>
                    <a href={`/block/${x.block}`} style={{ color: "inherit", textDecoration: "none" }}>{x.block.toLocaleString()}</a>
                  </td>
                  <td style={tdMono()}>
                    {x.actor ? <a href={`/address/${x.actor}`} style={{ color: "inherit", textDecoration: "none" }}>{short(x.actor)}</a> : "-"}
                  </td>
                  <td style={tdMono()}>
                    {x.target ? <a href={`/address/${x.target}`} style={{ color: "inherit", textDecoration: "none" }}>{short(x.target)}</a> : "-"}
                  </td>
                  <td style={td()}>{x.detail}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    No recent DEX activity found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, opacity: 0.68, fontSize: 13 }}>
          Scan window: latest 5,000 blocks • Last updated: {updated}
        </div>
      </main>
    </>
  );
}

function pill(): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    textDecoration: "none",
    fontWeight: 700
  };
}

function th(): React.CSSProperties {
  return {
    textAlign: "left",
    padding: "12px 10px"
  };
}

function td(): React.CSSProperties {
  return {
    padding: "12px 10px"
  };
}

function tdMono(): React.CSSProperties {
  return {
    padding: "12px 10px",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    overflowWrap: "anywhere",
    wordBreak: "break-word"
  };
}
