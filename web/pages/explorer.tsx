import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

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

function hexToInt(h:string){
  return parseInt(h,16);
}

function shortHash(x:string){
  if(!x) return "";
  return x.slice(0,10) + "…" + x.slice(-8);
}

function isHexHash(x:string){
  return /^0x[0-9a-fA-F]{64}$/.test(x);
}

function isAddress(x:string){
  return /^0x[0-9a-fA-F]{40}$/.test(x);
}

export default function Explorer(){
  const [blocks,setBlocks]=useState<any[]>([]);
  const [q,setQ]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const [txResult,setTxResult]=useState<any|null>(null);
  const [addrResult,setAddrResult]=useState<any|null>(null);

  async function loadBlocks(){
    const latest=await rpc("eth_blockNumber");
    const n=hexToInt(latest);

    const arr=[];
    for(let i=0;i<10;i++){
      const b=await rpc("eth_getBlockByNumber",[
        "0x"+(n-i).toString(16),
        false
      ]);
      if (b) arr.push(b);
    }
    setBlocks(arr);
  }

  useEffect(()=>{
    loadBlocks().catch((e:any)=>setErr(e?.message || "Failed to load blocks"));
    const t=setInterval(()=>{
      loadBlocks().catch(()=>{});
    },15000);
    return()=>clearInterval(t);
  },[]);

  async function onSearch(){
    const value = q.trim();
    if(!value) return;

    setBusy(true);
    setErr("");
    setTxResult(null);
    setAddrResult(null);

    try{
      if(isHexHash(value)){
        const tx = await rpc("eth_getTransactionByHash",[value]);
        const receipt = await rpc("eth_getTransactionReceipt",[value]);
        if(!tx && !receipt){
          setErr("Transaction not found");
        }else{
          setTxResult({tx,receipt});
        }
      }else if(isAddress(value)){
        const latest = await rpc("eth_blockNumber");
        const bal = await rpc("eth_getBalance",[value,"latest"]);
        setAddrResult({
          address:value,
          balanceHex:bal,
          balance:Number(BigInt(bal) / 1000000000000000000n).toLocaleString(),
          latestBlock:hexToInt(latest).toLocaleString()
        });
      }else{
        setErr("Enter a valid transaction hash or address");
      }
    }catch(e:any){
      setErr(e?.message || "Lookup failed");
    }finally{
      setBusy(false);
    }
  }

  return(
    <>
      <Head>
        <title>Explorer</title>
      </Head>

      <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
        <h1>Northbridge Explorer</h1>

        <div style={{display:"flex",gap:10,marginTop:20,flexWrap:"wrap"}}>
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Paste tx hash or address"
            style={{
              flex:"1 1 560px",
              padding:"12px 14px",
              borderRadius:12,
              border:"1px solid rgba(255,255,255,0.14)",
              background:"rgba(0,0,0,0.25)",
              color:"inherit"
            }}
          />
          <button
            onClick={onSearch}
            disabled={busy}
            style={{
              padding:"12px 16px",
              borderRadius:12,
              border:"1px solid rgba(255,255,255,0.14)",
              background:"rgba(255,255,255,0.08)",
              color:"inherit",
              cursor: busy ? "not-allowed" : "pointer"
            }}
          >
            {busy ? "Searching…" : "Lookup"}
          </button>
        </div>

        {err ? (
          <div style={{
            marginTop:16,
            padding:14,
            borderRadius:12,
            border:"1px solid rgba(255,120,120,0.25)",
            background:"rgba(255,120,120,0.08)"
          }}>
            {err}
          </div>
        ) : null}

        {txResult ? (
          <div style={{
            marginTop:20,
            padding:16,
            borderRadius:16,
            border:"1px solid rgba(255,255,255,0.10)",
            background:"rgba(255,255,255,0.05)"
          }}>
            <h2 style={{marginTop:0}}>Transaction</h2>
            <div><b>Hash:</b> {txResult.tx?.hash || txResult.receipt?.transactionHash}</div>
            <div><b>Status:</b> {txResult.receipt?.status === "0x1" ? "Success" : txResult.receipt ? "Failed" : "Pending"}</div>
            <div><b>From:</b> {txResult.tx?.from || "-"}</div>
            <div><b>To:</b> {txResult.tx?.to || txResult.receipt?.to || "-"}</div>
            <div><b>Block:</b> {txResult.tx?.blockNumber ? hexToInt(txResult.tx.blockNumber).toLocaleString() : "-"}</div>
            <div><b>Gas Used:</b> {txResult.receipt?.gasUsed ? hexToInt(txResult.receipt.gasUsed).toLocaleString() : "-"}</div>
          </div>
        ) : null}

        {addrResult ? (
          <div style={{
            marginTop:20,
            padding:16,
            borderRadius:16,
            border:"1px solid rgba(255,255,255,0.10)",
            background:"rgba(255,255,255,0.05)"
          }}>
            <h2 style={{marginTop:0}}>Address</h2>
            <div><b>Address:</b> {addrResult.address}</div>
            <div><b>Native Balance:</b> {addrResult.balance} NBCX</div>
            <div><b>Latest Block Seen:</b> {addrResult.latestBlock}</div>
          </div>
        ) : null}

        <h2 style={{marginTop:30}}>Latest Blocks</h2>

        <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Block</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Hash</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Tx Count</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b,i)=>{
              const num=parseInt(b.number,16);
              const ts=parseInt(b.timestamp,16);
              return(
                <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <td style={{padding:"10px 8px"}}>{num.toLocaleString()}</td>
                  <td style={{padding:"10px 8px",fontFamily:"monospace"}}>{shortHash(b.hash)}</td>
                  <td style={{padding:"10px 8px"}}>{b.transactions.length}</td>
                  <td style={{padding:"10px 8px"}}>{new Date(ts*1000).toLocaleString()}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </main>
    </>
  )
}
