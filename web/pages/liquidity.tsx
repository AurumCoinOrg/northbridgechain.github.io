import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

const CHAIN_ID_HEX = "0x2328";
const RPC_URL =
  (typeof window !== "undefined" ? window.location.origin : "https://northbridgechain.com") + "/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const WNBCX = "0xb4E91c043F1166aB33653ADbE316C7a6423Cb723";
const ROUTER = "0x55d7E0a93faC96183B71C7e45621cD63bbD4bE7D";
const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";

const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)"
];

const WNBCX_ABI = [
  "function deposit() payable",
  "function balanceOf(address owner) view returns (uint256)",
  "function allowance(address owner,address spender) view returns (uint256)",
  "function approve(address spender,uint256 amount) returns (bool)"
];

const ROUTER_ABI = [
  "function addLiquidity(address tokenA,address tokenB,uint amountADesired,uint amountBDesired,uint amountAMin,uint amountBMin,address to,uint deadline) returns (uint amountA,uint amountB,uint liquidity)"
];

const PAIR_ABI = [
  "function getReserves() view returns (uint112 reserve0,uint112 reserve1,uint32 blockTimestampLast)",
  "function token0() view returns (address)",
  "function token1() view returns (address)"
];

declare global {
  interface Window {
    ethereum?: any;
  }
}

function fmt(x: bigint, decimals = 18, maxFrac = 6) {
  const s = ethers.formatUnits(x, decimals);
  const [w, f = ""] = s.split(".");
  const cut = f.slice(0, maxFrac).replace(/0+$/, "");
  return cut ? `${w}.${cut}` : w;
}

function errMsg(e: any) {
  return e?.shortMessage || e?.reason || e?.message || "Transaction failed";
}

export default function LiquidityPage() {
  const [account, setAccount] = useState("");
  const [connected, setConnected] = useState(false);
  const [nbcxAmount, setNbcxAmount] = useState("1");
  const [wnbcxAmount, setWnbcxAmount] = useState("0.001");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [balNBCX, setBalNBCX] = useState("0");
  const [balWNBCX, setBalWNBCX] = useState("0");
  const [allowNBCX, setAllowNBCX] = useState("0");
  const [allowWNBCX, setAllowWNBCX] = useState("0");
  const [reserveA, setReserveA] = useState("-");
  const [reserveB, setReserveB] = useState("-");

  const readProvider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);

  async function refreshWallet(addr?: string) {
    const active = addr || account;
    if (!active) return;

    try {
      const nbcx = new ethers.Contract(NBCX, ERC20_ABI, readProvider);
      const wnbcx = new ethers.Contract(WNBCX, WNBCX_ABI, readProvider);

      const [bn, bw, an, aw] = await Promise.all([
        nbcx.balanceOf(active),
        wnbcx.balanceOf(active),
        nbcx.allowance(active, ROUTER),
        wnbcx.allowance(active, ROUTER)
      ]);

      setBalNBCX(fmt(bn, 18, 6));
      setBalWNBCX(fmt(bw, 18, 6));
      setAllowNBCX(fmt(an, 18, 6));
      setAllowWNBCX(fmt(aw, 18, 6));
    } catch {}
  }

  async function refreshPool() {
    try {
      const pair = new ethers.Contract(PAIR, PAIR_ABI, readProvider);
      const [token0, token1, reserves] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves()
      ]);

      const r0 = fmt(reserves[0], 18, 6);
      const r1 = fmt(reserves[1], 18, 6);

      if (String(token0).toLowerCase() === WNBCX.toLowerCase()) {
        setReserveA(`${r0} WNBCX`);
        setReserveB(`${r1} NBCX`);
      } else if (String(token1).toLowerCase() === WNBCX.toLowerCase()) {
        setReserveA(`${r1} WNBCX`);
        setReserveB(`${r0} NBCX`);
      } else {
        setReserveA(r0);
        setReserveB(r1);
      }
    } catch {}
  }

  useEffect(() => {
    refreshPool();
    const t = setInterval(refreshPool, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" })
      .then((accs: string[]) => {
        if (accs?.length) {
          setAccount(accs[0]);
          setConnected(true);
          refreshWallet(accs[0]);
        }
      })
      .catch(() => {});
  }, []);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("MetaMask not found");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const addr = accounts?.[0] || "";
      if (!addr) throw new Error("No account returned");

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: CHAIN_ID_HEX }]
        });
      } catch {}

      setAccount(addr);
      setConnected(true);
      setStatus("Wallet connected");
      await refreshWallet(addr);
    } catch (e: any) {
      setStatus(errMsg(e));
    }
  }

  async function wrapNative() {
    if (!window.ethereum || !connected) return;

    try {
      setBusy(true);
      setStatus("Wrapping native NBCX...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const wnbcx = new ethers.Contract(WNBCX, WNBCX_ABI, signer);

      const tx = await wnbcx.deposit({ value: ethers.parseUnits(wnbcxAmount || "0", 18) });
      await tx.wait();

      setStatus("Wrapped into WNBCX");
      await refreshWallet();
    } catch (e: any) {
      setStatus(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function approveBoth() {
    if (!window.ethereum || !connected) return;

    try {
      setBusy(true);
      setStatus("Approving NBCX...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nbcx = new ethers.Contract(NBCX, ERC20_ABI, signer);
      const wnbcx = new ethers.Contract(WNBCX, WNBCX_ABI, signer);

      let tx = await nbcx.approve(ROUTER, ethers.MaxUint256);
      await tx.wait();

      setStatus("Approving WNBCX...");
      tx = await wnbcx.approve(ROUTER, ethers.MaxUint256);
      await tx.wait();

      setStatus("Approvals confirmed");
      await refreshWallet();
    } catch (e: any) {
      setStatus(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  async function addLiquidity() {
    if (!window.ethereum || !connected) return;

    try {
      setBusy(true);
      setStatus("Adding liquidity...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const router = new ethers.Contract(ROUTER, ROUTER_ABI, signer);

      const tx = await router.addLiquidity(
        NBCX,
        WNBCX,
        ethers.parseUnits(nbcxAmount || "0", 18),
        ethers.parseUnits(wnbcxAmount || "0", 18),
        0,
        0,
        account,
        Math.floor(Date.now() / 1000) + 60 * 20
      );

      await tx.wait();

      setStatus("Liquidity added");
      await refreshWallet();
      await refreshPool();
    } catch (e: any) {
      setStatus(errMsg(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Head>
        <title>Liquidity</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 920, margin: "40px auto", padding: 20 }}>
        <h1 style={{ marginBottom: 8 }}>Liquidity</h1>
        <div style={{ opacity: 0.72, marginBottom: 20 }}>
          Add liquidity to the live NBCX / WNBCX pool
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 }}>
          <div style={card()}>
            <div style={label()}>Pair</div>
            <div style={value()}>{PAIR}</div>
          </div>
          <div style={card()}>
            <div style={label()}>Reserve</div>
            <div style={value()}>{reserveA}</div>
          </div>
          <div style={card()}>
            <div style={label()}>Reserve</div>
            <div style={value()}>{reserveB}</div>
          </div>
        </div>

        <div style={shell()}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ fontSize: 14, opacity: 0.78 }}>
              {connected ? `Connected: ${account}` : "Wallet not connected"}
            </div>

            {!connected ? (
              <button onClick={connectWallet} style={btnPrimary()} disabled={busy}>
                Connect Wallet
              </button>
            ) : null}
          </div>

          <div style={{ marginTop: 22 }}>
            <div style={label()}>NBCX Amount</div>
            <input
              value={nbcxAmount}
              onChange={(e) => setNbcxAmount(e.target.value)}
              style={inputStyle()}
              placeholder="1"
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={label()}>WNBCX Amount</div>
            <input
              value={wnbcxAmount}
              onChange={(e) => setWnbcxAmount(e.target.value)}
              style={inputStyle()}
              placeholder="0.001"
            />
          </div>

          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
            <div style={miniCard()}>
              <div style={label()}>NBCX Balance</div>
              <div style={value()}>{balNBCX}</div>
            </div>
            <div style={miniCard()}>
              <div style={label()}>WNBCX Balance</div>
              <div style={value()}>{balWNBCX}</div>
            </div>
            <div style={miniCard()}>
              <div style={label()}>NBCX Allowance</div>
              <div style={value()}>{allowNBCX}</div>
            </div>
            <div style={miniCard()}>
              <div style={label()}>WNBCX Allowance</div>
              <div style={value()}>{allowWNBCX}</div>
            </div>
          </div>

          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={wrapNative} style={btnGhost()} disabled={busy || !connected}>
              Wrap Native → WNBCX
            </button>

            <button onClick={approveBoth} style={btnPrimary()} disabled={busy || !connected}>
              Approve NBCX + WNBCX
            </button>

            <button onClick={addLiquidity} style={btnPrimary()} disabled={busy || !connected}>
              Add Liquidity
            </button>
          </div>

          <div style={{ marginTop: 18, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={label()}>Status</div>
            <div style={{ fontSize: 14 }}>{status || "Ready"}</div>
          </div>
        </div>
      </main>
    </>
  );
}

function shell(): React.CSSProperties {
  return {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 20
  };
}

function card(): React.CSSProperties {
  return {
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
    padding: 16
  };
}

function miniCard(): React.CSSProperties {
  return {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.025)",
    padding: 14
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
    fontSize: 16,
    fontWeight: 700,
    overflowWrap: "anywhere",
    wordBreak: "break-word"
  };
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontSize: 18,
    outline: "none"
  };
}

function btnPrimary(): React.CSSProperties {
  return {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(120,170,255,0.45)",
    background: "rgba(60,100,220,0.22)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer"
  };
}

function btnGhost(): React.CSSProperties {
  return {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "white",
    fontWeight: 700,
    cursor: "pointer"
  };
}
