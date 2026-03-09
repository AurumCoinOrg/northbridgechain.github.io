import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const WNBCX = "0xb4E91c043F1166aB33653ADbE316C7a6423Cb723";
const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)"
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

export default function ChartPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [price, setPrice] = useState("0");
  const [invPrice, setInvPrice] = useState("0");
  const [points, setPoints] = useState<any[]>([]);
  const [updated, setUpdated] = useState("-");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");

      const pair = new ethers.Contract(PAIR, PAIR_ABI, provider);
      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(0, latest - 5000);

      const [token0, token1, reserves, swapLogs] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves(),
        pair.queryFilter(pair.filters.Swap(), fromBlock, latest)
      ]);

      let reserveW = 0n;
      let reserveN = 0n;

      if (String(token0).toLowerCase() === WNBCX.toLowerCase()) {
        reserveW = BigInt(reserves[0]);
        reserveN = BigInt(reserves[1]);
      } else if (String(token1).toLowerCase() === WNBCX.toLowerCase()) {
        reserveW = BigInt(reserves[1]);
        reserveN = BigInt(reserves[0]);
      } else {
        reserveW = BigInt(reserves[0]);
        reserveN = BigInt(reserves[1]);
      }

      const p = Number(ethers.formatUnits(reserveN, 18)) / Math.max(Number(ethers.formatUnits(reserveW, 18)), 1e-18);
      const ip = Number(ethers.formatUnits(reserveW, 18)) / Math.max(Number(ethers.formatUnits(reserveN, 18)), 1e-18);

      setPrice(p.toLocaleString(undefined, { maximumFractionDigits: 8 }));
      setInvPrice(ip.toLocaleString(undefined, { maximumFractionDigits: 12 }));

      const rows = swapLogs
        .slice(-20)
        .map((log: any) => {
          const a0in = BigInt(log.args?.amount0In || 0n);
          const a1in = BigInt(log.args?.amount1In || 0n);
          const a0out = BigInt(log.args?.amount0Out || 0n);
          const a1out = BigInt(log.args?.amount1Out || 0n);

          let pricePoint = 0;

          if (String(token0).toLowerCase() === WNBCX.toLowerCase()) {
            const wMoved = Number(ethers.formatUnits(a0in > 0n ? a0in : a0out, 18));
            const nMoved = Number(ethers.formatUnits(a1in > 0n ? a1in : a1out, 18));
            pricePoint = wMoved > 0 ? nMoved / wMoved : 0;
          } else {
            const wMoved = Number(ethers.formatUnits(a1in > 0n ? a1in : a1out, 18));
            const nMoved = Number(ethers.formatUnits(a0in > 0n ? a0in : a0out, 18));
            pricePoint = wMoved > 0 ? nMoved / wMoved : 0;
          }

          return {
            tx: log.transactionHash,
            block: Number(log.blockNumber),
            sender: log.args?.sender || "",
            price: pricePoint
          };
        })
        .reverse();

      setPoints(rows);
      setUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load chart");
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
        <title>Chart</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>DEX Chart</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          On-chain implied price view for the NBCX / WNBCX pool
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

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <div style={card()}>
            <div style={label()}>Price</div>
            <div style={big()}>{price} NBCX</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 WNBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Inverse Price</div>
            <div style={big()}>{invPrice} WNBCX</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 NBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pair</div>
            <div style={mono()}>{PAIR}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Last Updated</div>
            <div style={big()}>{updated}</div>
          </div>
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/dex" style={pill()}>DEX →</a>
          <a href="/swap" style={pill()}>Swap →</a>
          <a href="/liquidity" style={pill()}>Liquidity →</a>
          <a href="/analytics" style={pill()}>Analytics →</a>
          <a href="/dex-activity" style={pill()}>Activity →</a>
        </div>

        <div style={{
          marginTop: 24,
          overflowX: "auto",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(255,255,255,0.03)"
        }}>
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th()}>Block</th>
                <th style={th()}>Tx</th>
                <th style={th()}>Sender</th>
                <th style={th()}>Implied Price</th>
              </tr>
            </thead>
            <tbody>
              {points.length ? points.map((x, i) => (
                <tr key={x.tx + ":" + i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <td style={td()}>
                    <a href={`/block/${x.block}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {x.block.toLocaleString()}
                    </a>
                  </td>
                  <td style={tdMono()}>
                    <a href={`/tx/${x.tx}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {short(x.tx)}
                    </a>
                  </td>
                  <td style={tdMono()}>
                    <a href={`/address/${x.sender}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {short(x.sender)}
                    </a>
                  </td>
                  <td style={td()}>
                    {x.price ? x.price.toLocaleString(undefined, { maximumFractionDigits: 8 }) : "0"} NBCX / WNBCX
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    No recent price points found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

function big(): React.CSSProperties {
  return {
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1.1
  };
}

function mono(): React.CSSProperties {
  return {
    fontSize: 14,
    fontWeight: 700,
    overflowWrap: "anywhere",
    wordBreak: "break-word",
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
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
