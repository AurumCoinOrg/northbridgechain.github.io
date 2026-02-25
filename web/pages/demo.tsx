import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const RPC_URL = "http://89.167.28.12:8545";

// contracts
const NBCX = "0xBa73385776f5A2D3F5D199bB2D0bA20704A7895a";
const STAKING = "0x4b941e43989D24086C9CaFd1d91c78ac6C25214F";
const LOCK = "0xB9B5d2218035ED91451DfEf6E6894036fFd247B1";

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

export default function Demo() {
  const hasMM = typeof window !== "undefined" && !!window.ethereum;

  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState<string>("");

  const [account, setAccount] = useState<string>("");
  const [chainId, setChainId] = useState<number | null>(null);

  const [name, setName] = useState<string>("-");
  const [symbol, setSymbol] = useState<string>("-");
  const [decimals, setDecimals] = useState<number>(18);

  const [bal, setBal] = useState<string>("0");
  const [allow, setAllow] = useState<string>("0");

  const [staked, setStaked] = useState<string>("0");
  const [earned, setEarned] = useState<string>("0");

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

      if (!account) {
        setBal("0");
        setAllow("0");
        setStaked("0");
        setEarned("0");
        return;
      }

      // balances via RPC
      const b: bigint = await token.balanceOf(account);
      setBal(fmtUnits(b, dec));

      const a: bigint = await token.allowance(account, STAKING);
      setAllow(fmtUnits(a, dec));

      const staking = new ethers.Contract(STAKING, STAKING_ABI, rpc);
      const s: bigint = await staking.staked(account);
      const e: bigint = await staking.earned(account);

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
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
<div style={{marginBottom:20}}><button onClick={addNorthbridgeNetwork}>Add Northbridge Network</button></div>
      <h1 style={{ margin: "0 0 8px 0" }}>NBCX Dashboard</h1>
      <div style={{ opacity: 0.8, fontSize: 14, marginBottom: 12 }}>
        <div><b>RPC:</b> {RPC_URL}</div>
        <div><b>NBCX:</b> {NBCX}</div>
        <div><b>Staking:</b> {STAKING}</div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={connect}>Connect MetaMask</button>
        <button onClick={forceSwitchNetwork}>Force Switch Network</button>
        <button onClick={refresh}>Refresh</button>
      </div>

      {wrongChain && (
        <div style={{ padding: 10, border: "1px solid #f59e0b", borderRadius: 10, marginBottom: 12 }}>
          <b>Wrong network.</b> Switch MetaMask to ChainId {CHAIN_ID}.
        </div>
      )}

      {err && (
        <div style={{ padding: 10, border: "1px solid #ef4444", borderRadius: 10, marginBottom: 12 }}>
          <b>Error:</b> {err}
        </div>
      )}

      <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Wallet</h2>
        <div><b>Account:</b> {account || "(not connected)"}</div>
        <div><b>ChainId:</b> {chainId === null ? "(unknown)" : chainId}</div>
      </section>

      <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Token</h2>
        <div><b>Name:</b> {name}</div>
        <div><b>Symbol:</b> {symbol}</div>
        <div><b>Decimals:</b> {decimals}</div>
        <div><b>Your balance:</b> {bal}</div>
        <div><b>Allowance to staking:</b> {allow}</div>
      </section>

      <section style={{ padding: 12, border: "1px solid #ddd", borderRadius: 10, marginBottom: 12 }}>
        <h2 style={{ marginTop: 0 }}>Staking</h2>
        <div><b>Staked:</b> {staked}</div>
        <div><b>Earned:</b> {earned}</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 12 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ marginBottom: 8 }}><b>Approve</b></div>
            <button onClick={approveMax} disabled={!account || wrongChain || busy !== ""}>
              {busy === "approve" ? "Approving..." : "Approve MAX"}
            </button>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ marginBottom: 8 }}><b>Claim</b></div>
            <button onClick={doClaim} disabled={!account || wrongChain || busy !== ""}>
              {busy === "claim" ? "Claiming..." : "Claim"}
            </button>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ marginBottom: 8 }}><b>Stake</b></div>
            <input
              value={stakeAmt}
              onChange={(e) => setStakeAmt(e.target.value)}
              placeholder="amount"
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <button onClick={doStake} disabled={!account || wrongChain || busy !== ""}>
              {busy === "stake" ? "Staking..." : "Stake"}
            </button>
          </div>

          <div style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
            <div style={{ marginBottom: 8 }}><b>Unstake</b></div>
            <input
              value={unstakeAmt}
              onChange={(e) => setUnstakeAmt(e.target.value)}
              placeholder="amount"
              style={{ width: "100%", marginBottom: 8, padding: 8 }}
            />
            <button onClick={doUnstake} disabled={!account || wrongChain || busy !== ""}>
              {busy === "unstake" ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>
      </section>

      <a href="/" style={{ display: "inline-block", marginTop: 8 }}>← Back to landing</a>
    </main>
  );
}

async function addNorthbridgeNetwork() {
  if (!(window as any).ethereum) return alert("Install MetaMask");

  await (window as any).ethereum.request({
    method: "wallet_addEthereumChain",
    params: [{
      chainId: "0x2328", // 9000 in hex
      chainName: "Northbridge Chain",
      rpcUrls: ["http://89.167.28.12:8545"],
      nativeCurrency: {
        name: "NBC",
        symbol: "NBC",
        decimals: 18
      }
    }]
  });
}

