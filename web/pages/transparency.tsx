import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, MULTISIG, STAKING, NBCX, LOCK } from "../lib/config";

const MULTI_ABI = [
  "function getOwners() view returns (address[])",
  "function required() view returns (uint256)"
];

const STAKING_ABI = [
  "function totalStaked() view returns (uint256)",
  "function rewardRate() view returns (uint256)"
];

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)"
];

function fmt18(x: bigint) { return ethers.formatUnits(x, 18); }
function short(a: string) { return `${a.slice(0, 6)}…${a.slice(-4)}`; }

export default function Transparency() {
  const provider = useMemo(() => new ethers.JsonRpcProvider(RPC_URL), []);
  const [owners, setOwners] = useState<string[]>([]);
  const [required, setRequired] = useState<string>("-");
  const [totalStaked, setTotalStaked] = useState<string>("-");
  const [rewardRate, setRewardRate] = useState<string>("-");
  const [stakingNbcx, setStakingNbcx] = useState<string>("-");

  useEffect(() => {
    (async () => {
      const multi = new ethers.Contract(MULTISIG, MULTI_ABI, provider);
      const staking = new ethers.Contract(STAKING, STAKING_ABI, provider);
      const nbcx = new ethers.Contract(NBCX, ERC20_ABI, provider);

      const [o, r, ts, rr, bal] = await Promise.all([
        multi.getOwners(),
        multi.required(),
        staking.totalStaked(),
        staking.rewardRate(),
        nbcx.balanceOf(STAKING),
      ]);

      setOwners(o);
      setRequired(r.toString());
      setTotalStaked(fmt18(ts));
      setRewardRate(fmt18(rr));
      setStakingNbcx(fmt18(bal));
    })().catch(console.error);
  }, [provider]);

  return (
    <main style={{ minHeight: "100vh", padding: 28, background: "#070A0F", color: "#EAF0FF", fontFamily: "ui-sans-serif, system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={{ letterSpacing: 2, opacity: 0.8, fontSize: 12 }}>NORTHBRIDGE</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 36 }}>Transparency</h1>
        <div style={{ opacity: 0.8, marginTop: 6 }}>Live on-chain governance and emissions.</div>

        <div style={box()}>
          <h3 style={{ marginTop: 0 }}>Governance (Multisig)</h3>
          <div><b>Multisig:</b> {MULTISIG} ({short(MULTISIG)})</div>
          <div><b>Threshold:</b> {required} approvals</div>
          <div style={{ marginTop: 10 }}><b>Owners:</b></div>
          <ul>
            {owners.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>

        <div style={box()}>
          <h3 style={{ marginTop: 0 }}>Staking (Live)</h3>
          <div><b>Staking:</b> {STAKING}</div>
          <div><b>NBCX:</b> {NBCX}</div>
          <div><b>Lock:</b> {LOCK}</div>
          <div style={{ marginTop: 10 }}><b>Total Staked:</b> {totalStaked} NBCX</div>
          <div><b>Reward Rate:</b> {rewardRate} NBCX/sec</div>
          <div><b>NBCX in Staking Contract:</b> {stakingNbcx} NBCX</div>
        </div>

        <div style={{ marginTop: 18, opacity: 0.85, fontSize: 13 }}>
          <a href="/tokenomics" style={link()}>Tokenomics →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/wallet" style={link()}>Wallet →</a>
          <span style={{ margin: "0 10px", opacity: 0.5 }}>|</span>
          <a href="/" style={link()}>Home →</a>
        </div>
      </div>
    </main>
  );
}

function box() {
  return { marginTop: 16, padding: 16, borderRadius: 16, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" } as const;
}
function link() {
  return { color: "#EAF0FF", textDecoration: "underline", textUnderlineOffset: 4 } as const;
}
