import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { DEX_PAIRS } from "../lib/dexPairs";

const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937";
const ROUTER = "0x55d7E0a93faC96183B71C7e45621cD63bbD4bE7D";

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function totalSupply() view returns (uint256)"
];

function fmt(x: bigint, decimals = 18, maxFrac = 6) {
  const s = ethers.formatUnits(x, decimals);
  const [w, f = ""] = s.split(".");
  const cut = f.slice(0, maxFrac).replace(/0+$/, "");
  return cut ? `${w}.${cut}` : w;
}

export default function PoolsPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [rows, setRows] = useState<any[]>([]);
  const [updated, setUpdated] = useState("-");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");

      const nextRows = await Promise.all(
        DEX_PAIRS.map(async (p) => {
          const pair = new ethers.Contract(p.pair, PAIR_ABI, provider);

          const [token0, token1, reserves, totalSupply] = await Promise.all([
            pair.token0(),
            pair.token1(),
            pair.getReserves(),
            pair.totalSupply()
          ]);

          let reserveA = 0n;
          let reserveB = 0n;

          if (String(token0).toLowerCase() === p.tokenA.address.toLowerCase()) {
            reserveA = BigInt(reserves[0]);
            reserveB = BigInt(reserves[1]);
          } else if (String(token1).toLowerCase() === p.tokenA.address.toLowerCase()) {
            reserveA = BigInt(reserves[1]);
            reserveB = BigInt(reserves[0]);
          } else {
            reserveA = BigInt(reserves[0]);
            reserveB = BigInt(reserves[1]);
          }

          return {
            ...p,
            reserveA: fmt(reserveA),
            reserveB: fmt(reserveB),
            lpSupply: fmt(BigInt(totalSupply))
          };
        })
      );

      setRows(nextRows);
      setUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load pools");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <Head>
        <title>Pools</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Pools</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Multi-pair Northbridge DEX pool registry
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
          <div style={card()}>
            <div style={label()}>Factory</div>
            <div style={value()}>{FACTORY}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Router</div>
            <div style={value()}>{ROUTER}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Tracked Pools</div>
            <div style={big()}>{rows.length}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Last Updated</div>
            <div style={big()}>{updated}</div>
          </div>
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
                <th style={th()}>Pair</th>
                <th style={th()}>Reserve A</th>
                <th style={th()}>Reserve B</th>
                <th style={th()}>LP Supply</th>
                <th style={th()}>Pair Address</th>
                <th style={th()}>Open</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((x) => (
                <tr key={x.pair} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={td()}>{x.name}</td>
                  <td style={td()}>{x.reserveA} {x.tokenA.symbol}</td>
                  <td style={td()}>{x.reserveB} {x.tokenB.symbol}</td>
                  <td style={td()}>{x.lpSupply}</td>
                  <td style={tdMono()}>{x.pair}</td>
                  <td style={td()}>
                    <a href={`/contract/${x.pair}`} style={{ color: "inherit", textDecoration: "none" }}>
                      Contract →
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    No pools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/dex" style={pill()}>DEX →</a>
          <a href="/swap" style={pill()}>Swap →</a>
          <a href="/liquidity" style={pill()}>Liquidity →</a>
          <a href="/analytics" style={pill()}>Analytics →</a>
        </div>
      </main>
    </>
  );
}

function card(): React.CSSProperties {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 16
  };
}

function label(): React.CSSProperties {
  return {
    fontSize: 13,
    opacity: 0.72,
    marginBottom: 8
  };
}

function value(): React.CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 700,
    overflowWrap: "anywhere",
    wordBreak: "break-word"
  };
}

function big(): React.CSSProperties {
  return {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1
  };
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
