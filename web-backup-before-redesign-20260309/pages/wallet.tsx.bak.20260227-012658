import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, CHAIN_ID, CHAIN_ID_HEX, CHAIN_NAME, NBCX, STAKING, LOCK } from "../lib/config";

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
];

const STAKING_ABI = [
  "function token() view returns (address)",
  "function totalStaked() view returns (uint256)",
  "function staked(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function rewardRate() view returns (uint256)",
];

async function addNorthbridgeNetwork() {
  const eth = (globalThis as any).ethereum;
  if (!eth) return alert("Install MetaMask");

  await eth.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: CHAIN_ID_HEX,
      chainName: CHAIN_NAME,
      rpcUrls: [RPC_URL],
      nativeCurrency: { name: "NBC", symbol: "NBC", decimals: 18 }
    }]
  });
}

function fmt18(x: bigint) {
  return ethers.formatUnits(x, 18);
}

export default function WalletPage() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [account, setAccount] = useState<string>("");
  const [wrongChain, setWrongChain] = useState<boolean>(false);

  const [queryAddr, setQueryAddr] = useState<string>("");
  const [viewAddr, setViewAddr] = useState<string>("");

  const [nbcxBal, setNbcxBal] = useState<string>("-");
  const [staked, setStaked] = useState<string>("-");
  const [earned, setEarned] = useState<string>("-");
  const [totalStaked, setTotalStaked] = useState<string>("-");
  const [rewardRate, setRewardRate] = useState<string>("-");

  async function connect() {
    const eth = (globalThis as any).ethereum;
    if (!eth) return alert("Install MetaMask");

    const accts = await eth.request({ method: "eth_requestAccounts" });
    const a = (accts?.[0] || "").toLowerCase();
    setAccount(a);

    const cidHex = await eth.request({ method: "eth_chainId" });
    setWrongChain(parseInt(cidHex, 16) !== CHAIN_ID);
  }

  async function refresh(addr: string) {
    if (!addr) return;
    const a = ethers.getAddress(addr);

    const nbcx = new ethers.Contract(NBCX, ERC20_ABI, provider);
    const staking = new ethers.Contract(STAKING, STAKING_ABI, provider);

    const [bal, st, er, ts, rr] = await Promise.all([
      nbcx.balanceOf(a),
      staking.staked(a),
      staking.earned(a),
      staking.totalStaked(),
      staking.rewardRate(),
    ]);

    setNbcxBal(fmt18(bal));
    setStaked(fmt18(st));
    setEarned(fmt18(er));
    setTotalStaked(fmt18(ts));
    setRewardRate(fmt18(rr)); // tokens/sec (18 decimals)
  }

  useEffect(() => {
    // default to connected wallet if present, otherwise placeholder
    const init = async () => {
      const eth = (globalThis as any).ethereum;
      if (eth) {
        try {
          const accts = await eth.request({ method: "eth_accounts" });
          const a = (accts?.[0] || "").toLowerCase();
          if (a) setAccount(a);

          const cidHex = await eth.request({ method: "eth_chainId" });
          setWrongChain(parseInt(cidHex, 16) !== CHAIN_ID);

          if (a && !viewAddr) {
            setViewAddr(a);
            setQueryAddr(a);
          }
        } catch {}
      }
    };
    init();
  }, [viewAddr]);

  useEffect(() => {
    if (viewAddr) refresh(viewAddr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewAddr]);

  return (
    <main style={{ minHeight: "100vh", padding: 28, background: "radial-gradient(1200px 600px at 10% 10%, rgba(255,215,0,0.12), transparent), radial-gradient(900px 500px at 90% 10%, rgba(0,200,255,0.10), transparent), #070A0F", color: "#EAF0FF", fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ letterSpacing: 2, opacity: 0.8, fontSize: 12 }}>NORTHBRIDGE</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 36 }}>Wallet</h1>
            <div style={{ opacity: 0.8, marginTop: 6 }}>View any address + staking stats.</div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={addNorthbridgeNetwork} style={btn()}>Add Network</button>
            <button onClick={connect} style={btn(true)}>
              {account ? `Connected: ${account.slice(0, 6)}…${account.slice(-4)}` : "Connect Wallet"}
            </button>
          </div>
        </div>

        {wrongChain && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "rgba(255,80,80,0.12)", border: "1px solid rgba(255,80,80,0.35)" }}>
            Wrong chain in MetaMask. Click <b>Add Network</b> then switch to <b>{CHAIN_NAME}</b>.
          </div>
        )}

        <div style={{ marginTop: 18, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 10 }}>Enter address to view:</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              value={queryAddr}
              onChange={(e) => setQueryAddr(e.target.value)}
              placeholder="0x..."
              style={input()}
            />
            <button
              onClick={() => {
                try {
                  const a = ethers.getAddress(queryAddr.trim());
                  setViewAddr(a);
                } catch {
                  alert("Invalid address");
                }
              }}
              style={btn(true)}
            >
              View
            </button>
            {account && (
              <button onClick={() => { setQueryAddr(account); setViewAddr(account); }} style={btn()}>
                Use my address
              </button>
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.75 }}>
            Contracts: NBCX {short(NBCX)} • STAKING {short(STAKING)} • LOCK {short(LOCK)}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 18 }}>
          <Card title="NBCX Balance" value={nbcxBal} suffix="NBCX" />
          <Card title="Staked" value={staked} suffix="NBCX" />
          <Card title="Earned" value={earned} suffix="NBCX" />
          <Card title="Total Staked" value={totalStaked} suffix="NBCX" />
          <Card title="Reward Rate" value={rewardRate} suffix="NBCX/sec" />
        </div>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 13 }}>
          <a href="/staking" style={link()}>Go to Staking Dashboard →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/explorer" style={link()}>Explorer Lite →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/" style={link()}>Back to Home →</a>
        </div>
      </div>
    </main>
  );
}

function short(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}`; }

function Card({ title, value, suffix }: { title: string; value: string; suffix: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))", border: "1px solid rgba(255,255,255,0.10)" }}>
      <div style={{ fontSize: 12, opacity: 0.75, letterSpacing: 1 }}>{title.toUpperCase()}</div>
      <div style={{ fontSize: 22, marginTop: 8, fontWeight: 700 }}>
        {value} <span style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>{suffix}</span>
      </div>
    </div>
  );
}

function btn(primary = false) {
  return {
    padding: "10px 14px",
    borderRadius: 12,
    border: primary ? "1px solid rgba(255,215,0,0.35)" : "1px solid rgba(255,255,255,0.18)",
    background: primary ? "linear-gradient(180deg, rgba(255,215,0,0.22), rgba(255,215,0,0.08))" : "rgba(255,255,255,0.06)",
    color: "#EAF0FF",
    cursor: "pointer",
    fontWeight: 700,
  } as const;
}

function input() {
  return {
    flex: 1,
    minWidth: 260,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(0,0,0,0.35)",
    color: "#EAF0FF",
    outline: "none",
  } as const;
}

function link() {
  return { color: "#EAF0FF", textDecoration: "underline", textUnderlineOffset: 4 } as const;
}
