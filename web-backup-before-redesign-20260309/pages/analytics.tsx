import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const WNBCX = "0xb4E91c043F1166aB33653ADbE316C7a6423Cb723";
const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937";
const ROUTER = "0x55d7E0a93faC96183B71C7e45621cD63bbD4bE7D";
const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)",
  "function totalSupply() view returns (uint256)"
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

function num(x: bigint, decimals = 18) {
  return Number(ethers.formatUnits(x, decimals));
}

export default function AnalyticsPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [reserveW, setReserveW] = useState<bigint>(0n);
  const [reserveN, setReserveN] = useState<bigint>(0n);
  const [lpSupply, setLpSupply] = useState<bigint>(0n);
  const [tokenSupply, setTokenSupply] = useState<bigint>(0n);
  const [lastUpdated, setLastUpdated] = useState("-");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");

      const pair = new ethers.Contract(PAIR, PAIR_ABI, provider);
      const nbcx = new ethers.Contract(NBCX, ERC20_ABI, provider);

      const [token0, token1, reserves, totalSupplyLP, totalSupplyToken] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves(),
        pair.totalSupply(),
        nbcx.totalSupply()
      ]);

      let w = 0n;
      let n = 0n;

      if (String(token0).toLowerCase() === WNBCX.toLowerCase()) {
        w = BigInt(reserves[0]);
        n = BigInt(reserves[1]);
      } else if (String(token1).toLowerCase() === WNBCX.toLowerCase()) {
        w = BigInt(reserves[1]);
        n = BigInt(reserves[0]);
      } else {
        w = BigInt(reserves[0]);
        n = BigInt(reserves[1]);
      }

      setReserveW(w);
      setReserveN(n);
      setLpSupply(BigInt(totalSupplyLP));
      setTokenSupply(BigInt(totalSupplyToken));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load analytics");
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  const priceNBCXInWNBCX =
    reserveN > 0n ? (num(reserveW) / Math.max(num(reserveN), 1e-18)) : 0;

  const priceWNBCXInNBCX =
    reserveW > 0n ? (num(reserveN) / Math.max(num(reserveW), 1e-18)) : 0;

  const tvlApprox =
    num(reserveN) > 0 && num(reserveW) > 0
      ? num(reserveN) + (num(reserveW) * priceWNBCXInNBCX)
      : 0;

  const liquidityRatio =
    num(reserveW) > 0 ? num(reserveN) / num(reserveW) : 0;

  const poolShareOfSupply =
    tokenSupply > 0n ? (num(reserveN) / Math.max(num(tokenSupply), 1e-18)) * 100 : 0;

  return (
    <>
      <Head>
        <title>Analytics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1040, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Analytics</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Northbridge DEX analytics for the live NBCX / WNBCX pool
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
            <div style={label()}>Approx TVL</div>
            <div style={big()}>{tvlApprox.toLocaleString(undefined, { maximumFractionDigits: 6 })} NBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Price</div>
            <div style={big()}>{priceWNBCXInNBCX.toLocaleString(undefined, { maximumFractionDigits: 6 })} NBCX</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 WNBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Inverse Price</div>
            <div style={big()}>{priceNBCXInWNBCX.toLocaleString(undefined, { maximumFractionDigits: 8 })} WNBCX</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>per 1 NBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>LP Supply</div>
            <div style={big()}>{fmt(lpSupply, 18, 6)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool NBCX</div>
            <div style={big()}>{fmt(reserveN, 18, 6)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool WNBCX</div>
            <div style={big()}>{fmt(reserveW, 18, 6)}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool Ratio</div>
            <div style={big()}>{liquidityRatio.toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
            <div style={{ marginTop: 6, opacity: 0.72 }}>NBCX per WNBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pool Share of NBCX Supply</div>
            <div style={big()}>{poolShareOfSupply.toLocaleString(undefined, { maximumFractionDigits: 8 })}%</div>
          </div>
        </div>

        <div style={{ marginTop: 24, overflowX: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th()}>Component</th>
                <th style={th()}>Address</th>
                <th style={th()}>Open</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>NBCX Token</td>
                <td style={tdMono()}>{NBCX}</td>
                <td style={td()}><a href={`/token/${NBCX}`} style={{ color: "inherit", textDecoration: "none" }}>Token</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>WNBCX</td>
                <td style={tdMono()}>{WNBCX}</td>
                <td style={td()}><a href={`/contract/${WNBCX}`} style={{ color: "inherit", textDecoration: "none" }}>Contract</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>Factory</td>
                <td style={tdMono()}>{FACTORY}</td>
                <td style={td()}><a href={`/contract/${FACTORY}`} style={{ color: "inherit", textDecoration: "none" }}>Contract</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>Router</td>
                <td style={tdMono()}>{ROUTER}</td>
                <td style={td()}><a href={`/contract/${ROUTER}`} style={{ color: "inherit", textDecoration: "none" }}>Contract</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>Pair</td>
                <td style={tdMono()}>{PAIR}</td>
                <td style={td()}><a href={`/contract/${PAIR}`} style={{ color: "inherit", textDecoration: "none" }}>Contract</a></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/swap" style={pill()}>Open Swap →</a>
          <a href="/liquidity" style={pill()}>Open Liquidity →</a>
          <a href="/pools" style={pill()}>Open Pools →</a>
        </div>

        <div style={{ marginTop: 16, opacity: 0.68, fontSize: 13 }}>
          Auto-refresh: 8s • Last updated: {lastUpdated}
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
    lineHeight: 1.1,
    overflowWrap: "anywhere",
    wordBreak: "break-word"
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
