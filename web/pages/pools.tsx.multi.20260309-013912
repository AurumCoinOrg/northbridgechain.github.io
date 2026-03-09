import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const WNBCX = "0xb4E91c043F1166aB33653ADbE316C7a6423Cb723";
const ROUTER = "0x55d7E0a93faC96183B71C7e45621cD63bbD4bE7D";
const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937";
const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";

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
  const [reserveW, setReserveW] = useState("-");
  const [reserveN, setReserveN] = useState("-");
  const [lpSupply, setLpSupply] = useState("-");
  const [updated, setUpdated] = useState("-");
  const [err, setErr] = useState("");

  async function load() {
    try {
      setErr("");
      const pair = new ethers.Contract(PAIR, PAIR_ABI, provider);

      const [token0, token1, reserves, totalSupply] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves(),
        pair.totalSupply()
      ]);

      const r0 = fmt(reserves[0], 18, 6);
      const r1 = fmt(reserves[1], 18, 6);

      if (String(token0).toLowerCase() === WNBCX.toLowerCase()) {
        setReserveW(r0);
        setReserveN(r1);
      } else if (String(token1).toLowerCase() === WNBCX.toLowerCase()) {
        setReserveW(r1);
        setReserveN(r0);
      } else {
        setReserveW(r0);
        setReserveN(r1);
      }

      setLpSupply(fmt(totalSupply, 18, 6));
      setUpdated(new Date().toLocaleTimeString());
    } catch (e: any) {
      setErr(e?.message || "Failed to load pool");
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

      <main style={{ maxWidth: 980, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Pools</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Live Northbridge DEX pool overview
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
            <div style={label()}>Pool</div>
            <div style={value()}>{PAIR}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Factory</div>
            <div style={value()}>{FACTORY}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Router</div>
            <div style={value()}>{ROUTER}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Pair</div>
            <div style={value()}>NBCX / WNBCX</div>
          </div>

          <div style={card()}>
            <div style={label()}>Reserve WNBCX</div>
            <div style={big()}>{reserveW}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Reserve NBCX</div>
            <div style={big()}>{reserveN}</div>
          </div>

          <div style={card()}>
            <div style={label()}>LP Total Supply</div>
            <div style={big()}>{lpSupply}</div>
          </div>

          <div style={card()}>
            <div style={label()}>Last Updated</div>
            <div style={big()}>{updated}</div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/swap" style={pill()}>Open Swap →</a>
          <a href="/liquidity" style={pill()}>Open Liquidity →</a>
          <a href={`/contract/${PAIR}`} style={pill()}>Open Pair Contract →</a>
        </div>

        <div style={{ marginTop: 26, overflowX: "auto", borderRadius: 16, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}>
          <table style={{ width: "100%", minWidth: 820, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th()}>Asset</th>
                <th style={th()}>Address</th>
                <th style={th()}>Explorer</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>NBCX</td>
                <td style={tdMono()}>{NBCX}</td>
                <td style={td()}><a href={`/token/${NBCX}`} style={{ color: "inherit", textDecoration: "none" }}>Token Page</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>WNBCX</td>
                <td style={tdMono()}>{WNBCX}</td>
                <td style={td()}><a href={`/contract/${WNBCX}`} style={{ color: "inherit", textDecoration: "none" }}>Contract Page</a></td>
              </tr>
              <tr style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <td style={td()}>Pair</td>
                <td style={tdMono()}>{PAIR}</td>
                <td style={td()}><a href={`/contract/${PAIR}`} style={{ color: "inherit", textDecoration: "none" }}>Contract Page</a></td>
              </tr>
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
    fontSize: 26,
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
