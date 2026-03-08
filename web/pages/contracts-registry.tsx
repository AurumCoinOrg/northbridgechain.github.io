import Head from "next/head";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../lib/publicRpc";

const RPC = PUBLIC_RPC;

async function rpc(method:string, params:any[] = []){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  if(j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function hexToInt(h?:string){
  if(!h) return 0;
  return parseInt(h,16);
}

function shortHash(x:string){
  return x ? x.slice(0,10) + "…" + x.slice(-8) : "";
}

function shortAddr(x:string){
  return x ? x.slice(0,8) + "…" + x.slice(-6) : "";
}

export default function ContractsRegistryPage(){
  const [rows,setRows] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState("");

  useEffect(()=>{
    async function load(){
      try{
        setErr("");
        setLoading(true);

        const latestHex = await rpc("eth_blockNumber",[]);
        const latest = hexToInt(latestHex);

        const items:any[] = [];

        for(let i=0;i<200;i++){
          const n = latest - i;
          if(n < 0) break;

          const block = await rpc("eth_getBlockByNumber",["0x" + n.toString(16), true]);
          const txs = Array.isArray(block?.transactions) ? block.transactions : [];

          for(const tx of txs){
            if(items.length >= 100) break;

            try{
              const receipt = await rpc("eth_getTransactionReceipt",[tx.hash]);
              if(receipt?.contractAddress){
                items.push({
                  contractAddress: receipt.contractAddress,
                  creator: tx.from || "",
                  txHash: tx.hash || "",
                  blockNumber: n,
                });
              }
            }catch{}
          }

          if(items.length >= 100) break;
        }

        setRows(items);
      }catch(e:any){
        setErr(e?.message || "Failed to load contracts");
      }finally{
        setLoading(false);
      }
    }

    load();
  },[]);

  return(
    <>
      <Head>
        <title>Contracts Registry</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>
        <h1>Contracts Registry</h1>
        <div style={{marginTop:10,opacity:0.72}}>
          Recent deployed contracts from chain activity
        </div>

        {err ? (
          <div style={{
            marginTop:16,
            padding:"12px 14px",
            borderRadius:12,
            background:"rgba(239,68,68,0.12)",
            border:"1px solid rgba(239,68,68,0.28)",
            color:"rgba(255,220,220,0.98)"
          }}>
            {err}
          </div>
        ) : null}

        <div style={{
          width:"100%",
          overflowX:"auto",
          WebkitOverflowScrolling:"touch",
          marginTop:24,
          borderRadius:16,
          border:"1px solid rgba(255,255,255,0.10)",
          background:"rgba(255,255,255,0.03)"
        }}>
          <table style={{width:"100%",minWidth:980,borderCollapse:"collapse"}}>
            <thead>
              <tr>
                <th style={{textAlign:"left",padding:"12px 10px"}}>Contract</th>
                <th style={{textAlign:"left",padding:"12px 10px"}}>Creator</th>
                <th style={{textAlign:"left",padding:"12px 10px"}}>Tx Hash</th>
                <th style={{textAlign:"left",padding:"12px 10px"}}>Block</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{padding:"18px 10px",opacity:0.78}}>
                    Scanning recent blocks...
                  </td>
                </tr>
              ) : rows.length ? rows.map((r,i)=>(
                <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                  <td style={{padding:"12px 10px",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}>
                    <a href={"/address/" + r.contractAddress} title={r.contractAddress} style={{textDecoration:"none",color:"inherit"}}>
                      {shortAddr(r.contractAddress)}
                    </a>
                  </td>

                  <td style={{padding:"12px 10px",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}>
                    <a href={"/address/" + r.creator} title={r.creator} style={{textDecoration:"none",color:"inherit"}}>
                      {shortAddr(r.creator)}
                    </a>
                  </td>

                  <td style={{padding:"12px 10px",fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}}>
                    <a href={"/tx/" + r.txHash} title={r.txHash} style={{textDecoration:"none",color:"inherit"}}>
                      {shortHash(r.txHash)}
                    </a>
                  </td>

                  <td style={{padding:"12px 10px"}}>
                    <a href={"/block/" + r.blockNumber} style={{textDecoration:"none",color:"inherit"}}>
                      {Number(r.blockNumber).toLocaleString()}
                    </a>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{padding:"18px 10px",opacity:0.78}}>
                    No recent deployed contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{marginTop:12,fontSize:13,opacity:0.68}}>
          Scan window: latest 200 blocks • max 100 contracts
        </div>
      </main>
    </>
  );
}
