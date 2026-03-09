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
  "function totalSupply() view returns (uint256)",
  "event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)",
  "event Mint(address indexed sender,uint amount0,uint amount1)",
  "event Burn(address indexed sender,uint amount0,uint amount1,address indexed to)"
];

const ERC20_ABI = [
  "function totalSupply() view returns (uint256)"
];

function fmt(x: bigint, decimals = 18, maxFrac = 6) {
  const s = ethers.formatUnits(x, decimals);
  const [w, f = ""] = s.split(".");
  const cut = f.slice(0, maxFrac).replace(/0+$/, "");
  return cut ? `${w}.${cut}` : w;
}

function short(x: string) {
  return x.slice(0, 10) + "…" + x.slice(-8);
}

function n(x: bigint, decimals = 18) {
  return Number(ethers.formatUnits(x, decimals));
}

export default function DexPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [pairAddress, setPairAddress] = useState(DEX_PAIRS[0].pair);
  const [pairMeta, setPairMeta] = useState(DEX_PAIRS[0]);
  const [reserveA, setReserveA] = useState<bigint>(0n);
  const [reserveB, setReserveB] = useState<bigint>(0n);
  const [lpSupply, setLpSupply] = useState<bigint>(0n);
  const [tokenSupply, setTokenSupply] = useState<bigint>(0n);
  const [updated, setUpdated] = useState("-");
  const [err, setErr] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const meta = DEX_PAIRS.find((x) => x.pair.toLowerCase() === pairAddress.toLowerCase()) || DEX_PAIRS[0];
    setPairMeta(meta);
  }, [pairAddress]);

  async function load() {
    try {
      setErr("");

      const pair = new ethers.Contract(pairMeta.pair, PAIR_ABI, provider);
      const token = new ethers.Contract(pairMeta.tokenA.address, ERC20_ABI, provider);

      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 5000);

      const [token0, token1, reserves, totalSupply, baseSupply, swapLogs, mintLogs, burnLogs] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves(),
        pair.totalSupply(),
        token.totalSupply(),
        pair.queryFilter(pair.filters.Swap(), fromBlock, latest),
        pair.queryFilter(pair.filters.Mint(), fromBlock, latest),
        pair.queryFilter(pair.filters.Burn(), fromBlock, latest)
      ]);

      let a = 0n;
      let b = 0n;

      if (String(token0).toLowerCase() === pairMeta.tokenA.address.toLowerCase()) {
        a = BigInt(reserves[0]);
        b = BigInt(reserves[1]);
      } else if (String(token1).toLowerCase() === pairMeta.tokenA.address.toLowerCase()) {
        a = BigInt(reserves[1]);
        b = BigInt(reserves[0]);
      } else {
        a = BigInt(reserves[0]);
        b = BigInt(reserves[1]);
      }

      setReserveA(a);
      setReserveB(b);
      setLpSupply(BigInt(totalSupply));
      setTokenSupply(BigInt(baseSupply));

      const rows = [
        ...swapLogs.map((log: any) => ({
          type: "Swap",
          tx: log.transactionHash,
          block: Number(log.blockNumber),
          actor: log.args?.sender || "",
          detail: `In ${fmt(BigInt(log.args?.amount0In || 0n))}/${fmt(BigInt(log.args?.amount1In || 0n))} • Out ${fmt(BigInt(log.args?.amount0Out || 0n))}/${fmt(BigInt(log.args?.amount1Out || 0n))}`
        })),
        ...mintLogs.map((log: any) => ({
          type: "Add Liquidity",
          tx: log.transactionHash,
          block: Number(log.blockNumber),
          actor: log.args?.sender || "",
          detail: `${fmt(BigInt(log.args?.amount0 || 0n))} + ${fmt(BigInt(log.args?.amount1 || 0n))}`
        })),
        ...burnLogs.map((log: any) => ({
          type: "Remove Liquidity",
          tx: log.transactionHash,
          block: Number(log.blockNumber),
          actor: log.args?.sender || "",
          detail: `${fmt(BigInt(log.args?.amount0 || 0n))} + ${fmt(BigInt(log.args?.amount1 || 0n))}`
        }))
      ]
        .sort((x, y) => y.block - x.block)
        .slice(0, 8);

      setEvents(rows);
      setUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load DEX overview");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [pairMeta]);

  const priceBPerA = reserveA > 0n ? n(reserveB) / Math.max(n(reserveA), 1e-18) : 0;
  const priceAPerB = reserveB > 0n ? n(reserveA) / Math.max(n(reserveB), 1e-18) : 0;
  const tvlApprox = n(reserveA) + n(reserveB) * priceAPerB;
  const poolShare = tokenSupply > 0n ? (n(reserveA) / Math.max(n(tokenSupply), 1e-18)) * 100 : 0;

  return (
    <>
      <Head>
        <title>DEX</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Northbridge DEX</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Multi-pair live dashboard
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

        <div style={panel()}>
          <div style={label()}>Selected Pair</div>
          <select
            value={pairAddress}
            onChange={(e) => setPairAddress(e.target.value)}
            style={{
              width: "100%",
              maxWidth: 360,
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.05)",
              color: "white"
            }}
          >
            {DEX_PAIRS.map((x) => (
              <option key={x.pair} value={x.pair}>{x.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginTop: 16 }}>
          <div style={card()}>
            <div style={label()}>Approx TVL</div>
            <div style={big()}>{tvlApprox.toLocaleString(undefined, { maximumFractionDigits: 6 })} {pairMeta.tokenA.symbol}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Price</div>
            <div style={big()}>{priceBPerA.toLocaleString(undefined, { maximumFractionDigits: 6 })} {pairMeta.tokenB.symbol}</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 {pairMeta.tokenA.symbol}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Inverse Price</div>
            <div style={big()}>{priceAPerB.toLocaleString(undefined, { maximumFractionDigits: 8 })} {pairMeta.tokenA.symbol}</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 {pairMeta.tokenB.symbol}</div>
          </div>

          <div style={card()}>
            <div style={label()}>LP Supply</div>
            <div style={big()}>{fmt(lpSupply)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool {pairMeta.tokenA.symbol}</div>
            <div style={big()}>{fmt(reserveA)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool {pairMeta.tokenB.symbol}</div>
            <div style={big()}>{fmt(reserveB)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool Share of {pairMeta.tokenA.symbol} Supply</div>
            <div style={big()}>{poolShare.toLocaleString(undefined, { maximumFractionDigits: 8 })}%</div>
          </div>

          <div style={card()}>
            <div style={label()}>Market</div>
            <div style={big()}>{pairMeta.name}</div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/swap" style={pillPrimary()}>Open Swap →</a>
          <a href="/liquidity" style={pill()}>Add Liquidity →</a>
          <a href="/pools" style={pill()}>View Pools →</a>
          <a href="/analytics" style={pill()}>Analytics →</a>
          <a href="/dex-activity" style={pill()}>DEX Activity →</a>
          <a href="/chart" style={pill()}>Chart →</a>
        </div>

        <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
          <div style={panel()}>
            <div style={panelTitle()}>Recent DEX Activity</div>

            <div style={{ marginTop: 10, overflowX: "auto" }}>
              <table style={{ width: "100%", minWidth: 560, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={th()}>Type</th>
                    <th style={th()}>Tx</th>
                    <th style={th()}>Block</th>
                    <th style={th()}>Actor</th>
                    <th style={th()}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {events.length ? events.map((x, i) => (
                    <tr key={x.tx + ":" + i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                      <td style={td()}>{x.type}</td>
                      <td style={tdMono()}><a href={`/tx/${x.tx}`} style={{ color: "inherit", textDecoration: "none" }}>{short(x.tx)}</a></td>
                      <td style={td()}><a href={`/block/${x.block}`} style={{ color: "inherit", textDecoration: "none" }}>{x.block.toLocaleString()}</a></td>
                      <td style={tdMono()}><a href={`/address/${x.actor}`} style={{ color: "inherit", textDecoration: "none" }}>{short(x.actor)}</a></td>
                      <td style={td()}>{x.detail}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} style={{ padding: "18px 10px", opacity: 0.78 }}>No recent DEX activity found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div style={panel()}>
            <div style={panelTitle()}>Contracts</div>

            <div style={{ marginTop: 12 }}>
              <div style={label()}>{pairMeta.tokenA.symbol}</div>
              <div style={codeBox()}>{pairMeta.tokenA.address}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label()}>{pairMeta.tokenB.symbol}</div>
              <div style={codeBox()}>{pairMeta.tokenB.address}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label()}>Factory</div>
              <div style={codeBox()}>{FACTORY}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label()}>Router</div>
              <div style={codeBox()}>{ROUTER}</div>
            </div>

            <div style={{ marginTop: 12 }}>
              <div style={label()}>Pair</div>
              <div style={codeBox()}>{pairMeta.pair}</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, opacity: 0.68, fontSize: 13 }}>
          Auto-refresh: 8s • Last updated: {updated}
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

function panel(): React.CSSProperties {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    overflow: "hidden"
  };
}

function label(): React.CSSProperties {
  return {
    fontSize: 13,
    opacity: 0.72,
    marginBottom: 8
  };
}

function big(): React.CSSProperties {
  return {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1
  };
}

function panelTitle(): React.CSSProperties {
  return {
    fontSize: 18,
    fontWeight: 800
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

function pillPrimary(): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(120,170,255,0.45)",
    background: "rgba(60,100,220,0.22)",
    color: "white",
    textDecoration: "none",
    fontWeight: 800
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

function codeBox(): React.CSSProperties {
  return {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflowWrap: "anywhere",
    wordBreak: "break-word"
  };
}
