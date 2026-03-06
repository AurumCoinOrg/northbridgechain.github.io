import Head from "next/head";

const TIMELOCK = "0x21e2962b917B7bA8B49540d0A0898981Bc88AE2D";
const VAULT = "0x81A41Be104490887533D24758905cF9023c27BB8";
const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";

const OWNER1 = "0xfbBC8cb66CF2db89A8059f161ccDc3653B17ECba";
const OWNER2 = "0x5d47Cc8675344E69FBAb0b34b89a83fAD3b0D4cb";
const OWNER3 = "0xAb22B5283050E218f5B08878D2E5b7B7c9420978";

function short(a: string) {
  return a.slice(0,6) + "…" + a.slice(-4);
}

function explorerUrl(a: string) {
  return "/explorer?addr=" + a;
}

function Row({label,value}:{label:string,value:string}) {
  return (
    <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0"}}>
      <b>{label}</b>
      <span style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
        <span style={{fontFamily:"monospace"}}>
          {value} ({short(value)})
        </span>
        <a
          href={explorerUrl(value)}
          style={{opacity:0.85,textDecoration:"none"}}
        >
          View →
        </a>
      </span>
    </div>
  );
}

export default function ContractMap(){
  return (
    <>
      <Head>
        <title>Contract Map</title>
      </Head>

      <main style={{maxWidth:900,margin:"40px auto",padding:20}}>
        <h1>Northbridge Contract Map</h1>

        <h2>Live Contracts</h2>

        <Row label="NBCX Token (V2)" value={NBCX}/>
        <Row label="Staking (V2)" value={STAKING}/>
        <Row label="Treasury Vault" value={VAULT}/>
        <Row label="Timelock (72h)" value={TIMELOCK}/>

        <h2 style={{marginTop:30}}>Governance Owners</h2>

        <Row label="Owner 1" value={OWNER1}/>
        <Row label="Owner 2" value={OWNER2}/>
        <Row label="Owner 3" value={OWNER3}/>

        <h2 style={{marginTop:30}}>Control Diagram</h2>

<pre>
Owners (2-of-3 approvals recommended)
        │
        ▼
TimelockController (72h delay)
        │
        ▼
TreasuryVault (treasury funds)

Token + Staking separate:
NBCX Token (V2) → Staking (V2)
</pre>

      </main>
    </>
  );
}
