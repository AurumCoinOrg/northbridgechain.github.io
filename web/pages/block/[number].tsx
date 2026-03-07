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

function hexToInt(h:string){
  return parseInt(h,16);
}

function shortHash(x:string){
  return x ? x.slice(0,10) + "…" + x.slice(-8) : "";
}

function pct(a:number,b:number){
  if(!b) return "0.00";
  return ((a/b)*100).toFixed(2);
}

export default function BlockPage(){
  const router = useRouter();
  const { number } = router.query;

  const [block,setBlock] = useState<any|null>(null);
  const [err,setErr] = useState("");

  useEffect(()=>{
    if(!router.isReady || !number) return;

    async function load(){
      try{
        setErr("");
        const n = Number(number);
        if(!Number.isFinite(n) || n < 0) throw new Error("Invalid block number");
        const hex = "0x" + n.toString(16);
        const b = await rpc("eth_getBlockByNumber",[hex,true]);
        if(!b) throw new Error("Block not found");
        setBlock(b);
      }catch(e:any){
        setErr(e?.message || "Failed to load block");
      }
    }

    load();
  },[router.isReady, number]);

  return (
    <>
      <Head>
        <title>Block {number}</title>
      </Head>

      <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>
        <h1>Block {number}</h1>

        <div style={{marginTop:16,display:"flex",gap:14,flexWrap:"wrap"}}>
          <a href="/explorer" style={{textDecoration:"none",color:"inherit"}}>← Explorer</a>
          <a href="/network" style={{textDecoration:"none",color:"inherit"}}>Network Stats →</a>
        </div>

        {err ? <div style={{marginTop:16,color:"rgba(255,120,120,0.95)"}}>{err}</div> : null}

        {block ? (
          <>
            <div
              style={{
                marginTop:20,
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
                gap:16
              }}
            >
              <div><b>Hash</b><div style={{fontFamily:"monospace",marginTop:6,wordBreak:"break-all"}}>{block.hash}</div></div>
              <div><b>Parent Hash</b><div style={{fontFamily:"monospace",marginTop:6,wordBreak:"break-all"}}>{block.parentHash}</div></div>
              <div><b>Timestamp</b><div style={{marginTop:6}}>{new Date(hexToInt(block.timestamp)*1000).toLocaleString()}</div></div>
              <div><b>Transactions</b><div style={{marginTop:6}}>{block.transactions.length}</div></div>
              <div><b>Gas Used</b><div style={{marginTop:6}}>{hexToInt(block.gasUsed).toLocaleString()}</div></div>
              <div><b>Gas Limit</b><div style={{marginTop:6}}>{hexToInt(block.gasLimit).toLocaleString()}</div></div>
              <div><b>Gas Utilization</b><div style={{marginTop:6}}>{pct(hexToInt(block.gasUsed), hexToInt(block.gasLimit))}%</div></div>
              <div><b>Nonce</b><div style={{marginTop:6,fontFamily:"monospace"}}>{block.nonce}</div></div>
              <div><b>Difficulty</b><div style={{marginTop:6}}>{block.difficulty ? hexToInt(block.difficulty).toLocaleString() : "-"}</div></div>
              <div><b>Miner</b><div style={{marginTop:6,fontFamily:"monospace"}}>{block.miner || "-"}</div></div>
            </div>

            <h2 style={{marginTop:32}}>Transactions</h2>

            <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Hash</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>From</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>To</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Nonce</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Value</th>
                </tr>
              </thead>
              <tbody>
                {block.transactions.map((tx:any,i:number)=>(
                  <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      <a href={`/tx/${tx.hash}`} style={{textDecoration:"none",color:"inherit"}}>
                        {shortHash(tx.hash)}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      <a href={`/address/${tx.from}`} style={{textDecoration:"none",color:"inherit"}}>
                        {shortHash(tx.from)}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      {tx.to ? (
                        <a href={`/address/${tx.to}`} style={{textDecoration:"none",color:"inherit"}}>
                          {shortHash(tx.to)}
                        </a>
                      ) : "-"}
                    </td>
                    <td style={{padding:"10px 8px"}}>{hexToInt(tx.nonce).toLocaleString()}</td>
                    <td style={{padding:"10px 8px"}}>{hexToInt(tx.value).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : null}
      </main>
    </>
  );
}
