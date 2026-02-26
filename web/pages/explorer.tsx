import { useMemo, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, NBCX, STAKING } from "../lib/config";

const ERC20_ABI = ["function balanceOf(address) view returns (uint256)"];
const STAKING_ABI = [
  "function staked(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
];

function fmt18(x: bigint) { return ethers.formatUnits(x, 18); }

export default function Explorer() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [q, setQ] = useState("");
  const [out, setOut] = useState<string>("");

  async function search() {
    setOut("Loading...");
    const s = q.trim();

    try {
      // tx hash?
      if (/^0x[0-9a-fA-F]{64}$/.test(s)) {
        const [tx, rcpt] = await Promise.all([
          provider.getTransaction(s),
          provider.getTransactionReceipt(s),
        ]);

        setOut(JSON.stringify({
          type: "tx",
          hash: s,
          from: tx?.from || null,
          to: tx?.to || null,
          blockNumber: rcpt?.blockNumber || null,
          status: rcpt?.status ?? null,
          gasUsed: rcpt?.gasUsed?.toString() ?? null,
        }, null, 2));
        return;
      }

      // address?
      const addr = ethers.getAddress(s);

      const nbcx = new ethers.Contract(NBCX, ERC20_ABI, provider);
      const staking = new ethers.Contract(STAKING, STAKING_ABI, provider);

      const [nbcxBal, staked, earned] = await Promise.all([
        nbcx.balanceOf(addr),
        staking.staked(addr),
        staking.earned(addr),
      ]);

      setOut(JSON.stringify({
        type: "address",
        address: addr,
        nbcxBalance: fmt18(nbcxBal),
        staked: fmt18(staked),
        earned: fmt18(earned),
      }, null, 2));
    } catch (e: any) {
      setOut(`Error: ${e?.message || e}`);
    }
  }

  return (
    <main style={{ minHeight: "100vh", padding: 28, background: "#070A0F", color: "#EAF0FF", fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ letterSpacing: 2, opacity: 0.8, fontSize: 12 }}>NORTHBRIDGE</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 36 }}>Explorer Lite</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Paste an address or transaction hash.</div>

        <div style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="0x address or 0x tx hash"
              style={{
                flex: 1, minWidth: 280, padding: "10px 12px", borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.35)", color: "#EAF0FF", outline: "none"
              }}
            />
            <button onClick={search} style={{
              padding: "10px 14px", borderRadius: 12,
              border: "1px solid rgba(255,215,0,0.35)",
              background: "linear-gradient(180deg, rgba(255,215,0,0.22), rgba(255,215,0,0.08))",
              color: "#EAF0FF", cursor: "pointer", fontWeight: 800
            }}>
              Search
            </button>
          </div>
        </div>

        <pre style={{ marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.10)", overflowX: "auto" }}>
{out || "Enter a query and hit Search."}
        </pre>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 13 }}>
          <a href="/wallet" style={link()}>Wallet →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/staking" style={link()}>Staking →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/" style={link()}>Home →</a>
        </div>
      </div>
    </main>
  );
}

function link() {
  return { color: "#EAF0FF", textDecoration: "underline", textUnderlineOffset: 4 } as const;
}
