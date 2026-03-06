import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const RPC = "/api/rpc";

async function rpc(method:string,params:any[]=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function isAddress(x:string){
  return /^0x[0-9a-fA-F]{40}$/.test(x);
}

function shortHash(x:string){
  return x ? x.slice(0,10) + "…" + x.slice(-8) : "";
}

function fmtNative(hex:string){
  try{
    const n = BigInt(hex);
    const div = 1000000000000000000n;
    const whole = n / div;
    const frac = (n % div).toString().padStart(18,"0").slice(0,4).replace(/0+$/,"");
    return frac ? `${whole.toLocaleString()}.${frac}` : whole.toLocaleString();
  }catch{
    return "0";
  }
}

export default function AddressPage() {
  const router = useRouter();
  const { addr } = router.query;

  const [balance,setBalance] = useState("-");
  const [latest,setLatest] = useState("-");
  const [err,setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !addr) return;

    async function load(){
      try{
        setErr("");
        const a = String(addr);
        if (!isAddress(a)) throw new Error("Invalid address");

        const bal = await rpc("eth_getBalance",[a,"latest"]);
        const blk = await rpc("eth_blockNumber",[]);

        setBalance(fmtNative(bal));
        setLatest(parseInt(blk,16).toLocaleString());
      }catch(e:any){
        setErr(e?.message || "Failed to load address");
      }
    }

    load();
  }, [router.isReady, addr]);

  return (
    <>
      <Head><title>Address</title></Head>
      <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
        <h1>Address</h1>

        {err ? <div style={{marginTop:16,color:"rgba(255,120,120,0.95)"}}>{err}</div> : null}

        {addr ? (
          <div style={{marginTop:20,display:"grid",gap:10}}>
            <div><b>Address:</b> <span style={{fontFamily:"monospace"}}>{String(addr)}</span></div>
            <div><b>Short:</b> <span style={{fontFamily:"monospace"}}>{shortHash(String(addr))}</span></div>
            <div><b>Native Balance:</b> {balance}</div>
            <div><b>Latest Block Seen:</b> {latest}</div>
          </div>
        ) : null}
      </main>
    </>
  );
}
