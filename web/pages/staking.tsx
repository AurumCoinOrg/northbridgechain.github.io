import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL = (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

// contracts
const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";
const VAULT = "0x81A41Be104490887533D24758905cF9023c27BB8";

// chain
const CHAIN_ID = 9000;

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

const STAKING_ABI = [
  "function rewardRate() view returns (uint256)",
  "function token() view returns (address)",
  "function totalStaked() view returns (uint256)",
  "function staked(address) view returns (uint256)",
  "function earned(address) view returns (uint256)",
  "function stake(uint256 amount)",
  "function unstake(uint256 amount)",
  "function claim()",
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

function fmtUnits(x: bigint, d: number) {
  try {
    return ethers.formatUnits(x, d);
  } catch {
    return "0";
  }
}

function nbGetAddrFromQuery(): string {
  if (typeof window === "undefined") return "";
  const q = new URLSearchParams(window.location.search);
  return (q.get("addr") || "").trim();
}

function nbSetAddrInQuery(addr: string) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (addr) url.searchParams.set("addr", addr);
  else url.searchParams.delete("addr");
  window.history.replaceState(null, "", url.toString());
}


function pageBg() {
  return {
    minHeight: "100vh",
    color: "rgba(255,255,255,0.92)",
    background:
      "radial-gradient(1200px 600px at 20% 10%, rgba(255,215,0,0.18), transparent 60%)," +
      "radial-gradient(900px 500px at 80% 20%, rgba(120,160,255,0.18), transparent 60%)," +
      "linear-gradient(180deg, #070A12, #05060B 55%, #04040A)",
  } as const;
}

function container() {
  return {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "28px 18px 60px",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
  } as const;
}

function card() {
  return {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 16,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
    backdropFilter: "blur(10px)",
  } as const;
}

function pill() {
  return {
    display: "inline-flex",
    gap: 10,
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(0,0,0,0.18)",
    color: "rgba(255,255,255,0.92)",
    textDecoration: "none",
  } as const;
}

function btn(primary?: boolean) {
  return {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.16)",
    background: primary ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.08)",
    color: "rgba(255,255,255,0.92)",
    cursor: "pointer",
  } as const;
}

function btnPrimaryStyle(disabled?: boolean) {
  return {
    ...btn(true),
    width: "100%",
    border: "1px solid rgba(255,215,0,0.22)",
    background: disabled ? "rgba(255,255,255,0.10)" : "rgba(255,215,0,0.20)",
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

function btnGhostStyle(disabled?: boolean) {
  return {
    ...btn(false),
    border: "1px solid rgba(255,255,255,0.14)",
    background: disabled ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.18)",
    cursor: disabled ? "not-allowed" : "pointer",
  } as const;
}

function inputBox() {
  return {
    width: "100%",
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(0,0,0,0.25)",
    color: "rgba(255,255,255,0.92)",
    outline: "none",
  } as const;
}

export default function Staking() {
  const hasMM = typeof window !== "undefined" && !!window.ethereum;

  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState<string>("");

  const [account, setAccount] = useState<string>("");
  const [viewAddr, setViewAddr] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);

  const [name, setName] = useState<string>("-");
  const [symbol, setSymbol] = useState<string>("-");
  const [decimals, setDecimals] = useState<number>(18);

  const [bal, setBal] = useState<string>("0");
  const [allow, setAllow] = useState<string>("0");

  const [staked, setStaked] = useState<string>("0");
  const [earned, setEarned] = useState<string>("0");

  const [totalStaked, setTotalStaked] = useState<string>("0");
  const [rewardRate, setRewardRate] = useState<string>("0");

  const [stakeAmt, setStakeAmt] = useState<string>("100");
  const [unstakeAmt, setUnstakeAmt] = useState<string>("10");

  const wrongChain = chainId !== null && chainId !== CHAIN_ID;

  const browserProvider = useMemo(() => {
    if (!hasMM) return null;
    try {
      return new ethers.BrowserProvider(window.ethereum);
    } catch {
      return null;
    }
  }, [hasMM]);

  async function connect() {
    setErr("");
    if (!window.ethereum) {
      setErr("MetaMask not detected");
      return;
    }
    const p = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await p.getSigner();
    const addr = await signer.getAddress();
    const net = await p.getNetwork();
    setAccount(addr);
    setChainId(Number(net.chainId));
  }

  async function forceSwitchNetwork() {
    setErr("");
    if (!window.ethereum) {
      setErr("MetaMask not detected");
      return;
    }
    const hex = "0x" + CHAIN_ID.toString(16);
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hex }],
      });
    } catch (e: any) {
      // If chain not added, try adding it
      if (e?.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: hex,
              chainName: "Northbridge Local",
              nativeCurrency: { name: "NBC", symbol: "NBC", decimals: 18 },
              rpcUrls: [RPC_URL],
            },
          ],
        });
      } else {
        throw e;
      }
    }

    // refresh local state after switch
    const p = new ethers.BrowserProvider(window.ethereum);
    const net = await p.getNetwork();
    setChainId(Number(net.chainId));
  }

  async function refresh() {
    setErr("");
    try {
      // read-only provider (RPC)
      const rpc = new ethers.JsonRpcProvider(RPC_URL);

      const token = new ethers.Contract(NBCX, ERC20_ABI, rpc);
      const nm = await token.name();
      const sym = await token.symbol();
      const dec: number = Number(await token.decimals());

      setName(nm);
      setSymbol(sym);
      setDecimals(dec);

      const target = (viewAddr || account || "").trim();
      if (!target) {
        setBal("0");
        setAllow("0");
        setStaked("0");
        setEarned("0");
        return;
      }

      // balances via RPC
      const b: bigint = await token.balanceOf(target);
      setBal(fmtUnits(b, dec));

      const a: bigint = await token.allowance(target, STAKING);
      setAllow(fmtUnits(a, dec));

      const staking = new ethers.Contract(STAKING, STAKING_ABI, rpc);
      try {
        const [ts, rr] = await Promise.all([staking.totalStaked(), staking.rewardRate()]);
        setTotalStaked(fmtUnits(BigInt(ts), dec));
        setRewardRate(fmtUnits(BigInt(rr), dec));
      } catch {
        // ignore
      }
      const s: bigint = await staking.staked(target);
      const e: bigint = await staking.earned(target);

      setStaked(fmtUnits(s, dec));
      setEarned(fmtUnits(e, dec));
    } catch (e: any) {
      setErr(e?.message || String(e));
    }
  }

  async function approveMax() {
    setErr("");
    if (!browserProvider) return;
    if (!account) return;

    setBusy("approve");
    try {
      const signer = await browserProvider.getSigner();
      const token = new ethers.Contract(NBCX, ERC20_ABI, signer);
      const tx = await token.approve(STAKING, ethers.MaxUint256);
      await tx.wait();
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy("");
    }
  }

  async function doStake() {
    setErr("");
    if (!browserProvider) return;
    if (!account) return;

    setBusy("stake");
    try {
      const signer = await browserProvider.getSigner();
      const staking = new ethers.Contract(STAKING, STAKING_ABI, signer);
      const amt = ethers.parseUnits(stakeAmt || "0", decimals);
      const tx = await staking.stake(amt);
      await tx.wait();
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy("");
    }
  }

  async function doUnstake() {
    setErr("");
    if (!browserProvider) return;
    if (!account) return;

    setBusy("unstake");
    try {
      const signer = await browserProvider.getSigner();
      const staking = new ethers.Contract(STAKING, STAKING_ABI, signer);
      const amt = ethers.parseUnits(unstakeAmt || "0", decimals);
      const tx = await staking.unstake(amt);
      await tx.wait();
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy("");
    }
  }

  async function doClaim() {
    setErr("");
    if (!browserProvider) return;
    if (!account) return;

    setBusy("claim");
    try {
      const signer = await browserProvider.getSigner();
      const staking = new ethers.Contract(STAKING, STAKING_ABI, signer);
      const tx = await staking.claim();
      await tx.wait();
      await refresh();
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setBusy("");
    }
  }

  useEffect(() => {
    // auto refresh on load
    refresh().catch(() => {});
    const q = nbGetAddrFromQuery();
    if (q) {
      try {
        const checksum = ethers.getAddress(q);
        setViewAddr(checksum);
      } catch {}
    }
    // listen for metamask changes
    if (window.ethereum) {
      const onAccounts = () => refresh().catch(() => {});
      const onChain = () => refresh().catch(() => {});
      window.ethereum.on?.("accountsChanged", onAccounts);
      window.ethereum.on?.("chainChanged", onChain);
      return () => {
        window.ethereum.removeListener?.("accountsChanged", onAccounts);
        window.ethereum.removeListener?.("chainChanged", onChain);
      };
    }
  }, [account]);

  return (
    <div style={pageBg()}>
      <div style={container()}>
<div style={{ marginBottom: 18, ...card() }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ opacity: 0.85, fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase" }}>Northbridge Chain • Testnet</div>
              <div style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>NBCX Staking Dashboard</div>
              <div style={{ opacity: 0.75, marginTop: 6 }}>Stake NBCX, claim rewards, and track your position.</div>
            </div>
            <button style={btnGhostStyle(false)} onClick={addNorthbridgeNetwork}>Add Network</button>
          </div>
        </div>
      <h1 style={{ margin: "0 0 8px 0" }}>NBCX Dashboard</h1>
      <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 12 }}>
        <div><b>RPC:</b> {RPC_URL}</div>
        <div><b>NBCX:</b> {NBCX}</div>
        <div><b>Staking:</b> {STAKING}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ ...card(), padding: 12, minWidth: 220 }}><b>Total Staked:</b><div style={{ marginTop: 6, fontSize: 20 }}>{totalStaked}</div></div>
          <div style={{ ...card(), padding: 12, minWidth: 220 }}><b>Reward Rate:</b><div style={{ marginTop: 6, fontSize: 20 }}>{rewardRate}</div></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <button style={btnPrimaryStyle(false)} onClick={connect}>Connect MetaMask</button>
          <button style={btnGhostStyle(false)} onClick={forceSwitchNetwork}>Force Switch Network</button>
          <button style={btnGhostStyle(false)} onClick={refresh}>Refresh</button>
        </div>

      {wrongChain && (
        <div style={{ ...card(), border: "1px solid rgba(245,158,11,0.35)", marginBottom: 12 }}>
          <b>Wrong network.</b> Switch MetaMask to ChainId {CHAIN_ID}.
        </div>
      )}

      {err && (
        <div style={{ ...card(), border: "1px solid rgba(239,68,68,0.35)", marginBottom: 12 }}>
          <b>Error:</b> {err}
        </div>
      )}

      <section style={{ ...card(), marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Wallet</h2>
        <div><b>Account:</b> {account || "(not connected)"}</div>
        <div><b>ChainId:</b> {chainId === null ? "(unknown)" : chainId}</div>
      </section>

      <section style={{ ...card(), marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Token</h2>
        <div><b>Name:</b> {name}</div>
        <div><b>Symbol:</b> {symbol}</div>
        <div><b>Decimals:</b> {decimals}</div>
        <div><b>Your balance:</b> {bal}</div>
        <div><b>Allowance to staking:</b> {allow}</div>
      </section>

      <section style={{ ...card(), marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Staking</h2>
        <div><b>Staked:</b> {staked}</div>
        <div><b>Earned:</b> {earned}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
          <div style={{ ...card() }}>
            <div style={{ marginBottom: 8 }}><b>Approve</b></div>
            <button style={btnPrimaryStyle(!account || wrongChain || busy !== "")} onClick={approveMax} disabled={!account || wrongChain || busy !== ""}>
              {busy === "approve" ? "Approving..." : "Approve MAX"}
            </button>
          </div>

          <div style={{ ...card() }}>
            <div style={{ marginBottom: 8 }}><b>Claim</b></div>
            <button style={btnPrimaryStyle(!account || wrongChain || busy !== "")} onClick={doClaim} disabled={!account || wrongChain || busy !== ""}>
              {busy === "claim" ? "Claiming..." : "Claim"}
            </button>
          </div>

          <div style={{ ...card() }}>
            <div style={{ marginBottom: 8 }}><b>Stake</b></div>
            <input
              value={stakeAmt}
              onChange={(e) => setStakeAmt(e.target.value)}
              placeholder="amount"
              style={inputBox()}
            />
            <button style={btnPrimaryStyle(!account || wrongChain || busy !== "")} onClick={doStake} disabled={!account || wrongChain || busy !== ""}>
              {busy === "stake" ? "Staking..." : "Stake"}
            </button>
          </div>

          <div style={{ ...card() }}>
            <div style={{ marginBottom: 8 }}><b>Unstake</b></div>
            <input
              value={unstakeAmt}
              onChange={(e) => setUnstakeAmt(e.target.value)}
              placeholder="amount"
              style={inputBox()}
            />
            <button style={btnPrimaryStyle(!account || wrongChain || busy !== "")} onClick={doUnstake} disabled={!account || wrongChain || busy !== ""}>
              {busy === "unstake" ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>
      </section>

      <a href="/" style={{ display: "inline-block", marginTop: 8 }}>← Back to landing</a>
          </div>
    </div>
  );
}

async function addNorthbridgeNetwork() {
  if (!(window as any).ethereum) return alert("Install MetaMask");

  await (window as any).ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x2328", // 9000 in hex
      chainName: "Northbridge Chain",
      rpcUrls: ["http://rpc.northbridgechain.com:8545"],
      nativeCurrency: {
        name: "NBC",
        symbol: "NBC",
        decimals: 18
      }
    }]
  });
}

