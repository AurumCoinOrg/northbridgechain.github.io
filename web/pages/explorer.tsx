import Head from "next/head";
import { useEffect, useState } from "react";
import ExplorerSearch from "../components/ExplorerSearch";

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

function shortHash(x:string){
  return x ? x.slice(0,10) + "…" + x.slice(-8) : "";
}

function shortAddr(x:string){
  return x ? x.slice(0,6) + "…" + x.slice(-4) : "";
}

export default function Explorer(){
  const [blocks,setBlocks] = useState<any[]>([]);
  const [txs,setTxs] = useState<any[]>([]);
  const [transfers,setTransfers] = useState<any[]>([]);
  const [latest,setLatest] = useState<number>(0);
  const [lastUpdated,setLastUpdated] = useState<string>("");

  useEffect(()=>{
    let dead = false;

    async function load(){
      try{
        const blk = await rpc("eth_blockNumber",[]);
        const latestBlock = parseInt(blk,16);

        const blockArr = [];
        const txArr = [];

        for(let i=0;i<10;i++){
          const num = latestBlock - i;
          if(num < 0) break;

          const b = await rpc("eth_getBlockByNumber",[
            "0x"+num.toString(16),
            true
          ]);

          if(!b) continue;

          blockArr.push({
            number:num,
            hash:b.hash,
            txCount:b.transactions.length,
            timestamp:parseInt(b.timestamp,16)
          });

          for(const tx of b.transactions){
            txArr.push({
              hash:tx.hash,
              from:tx.from,
              to:tx.to,
              block:num,
              timestamp:parseInt(b.timestamp,16)
            });
            if(txArr.length >= 12) break;
          }
        }

        const tr = await fetch("/api/transfers").then(r=>r.json());

        if(dead) return;
        setLatest(latestBlock);
        setBlocks(blockArr);
        setTxs(txArr.slice(0,12));
        setTransfers(Array.isArray(tr) ? tr : []);
        setLastUpdated(new Date().toLocaleTimeString());
      }catch{}
    }

    load();
    const t = setInterval(load,3000);
    return ()=>{
      dead = true;
      clearInterval(t);
    };
  },[]);

  return (
    <>
      <Head>
        <title>Explorer</title>
      </Head>

      <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>
        <h1>Explorer</h1>
        <ExplorerSearch />

        <div style={{marginTop:20,display:"flex",gap:20,flexWrap:"wrap"}}>
          <div>Latest Block: {latest.toLocaleString()}</div>
          <div>Auto-refresh: 3s</div>
          <div>Last Updated: {lastUpdated}</div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,marginTop:40}}>
          <div>
            <h2>Latest Blocks</h2>
            <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Block</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Hash</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Tx Count</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Time</th>
                </tr>
              </thead>
              <tbody>
                {blocks.map((b,i)=>(
                  <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    <td style={{padding:"10px 8px"}}>
                      <a href={`/block/${b.number}`} style={{textDecoration:"none",color:"inherit"}}>
                        {b.number.toLocaleString()}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      <a href={`/block/${b.number}`} style={{textDecoration:"none",color:"inherit"}}>
                        {shortHash(b.hash)}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px"}}>{b.txCount}</td>
                    <td style={{padding:"10px 8px"}}>{new Date(b.timestamp*1000).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2>Latest Transactions</h2>
            <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Hash</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>From</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>To</th>
                  <th style={{textAlign:"left",padding:"10px 8px"}}>Time</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx,i)=>(
                  <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      <a href={`/tx/${tx.hash}`} style={{textDecoration:"none",color:"inherit"}}>
                        {shortHash(tx.hash)}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      <a href={`/address/${tx.from}`} style={{textDecoration:"none",color:"inherit"}}>
                        {shortAddr(tx.from)}
                      </a>
                    </td>
                    <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                      {tx.to ? (
                        <a href={`/address/${tx.to}`} style={{textDecoration:"none",color:"inherit"}}>
                          {shortAddr(tx.to)}
                        </a>
                      ) : "-"}
                    </td>
                    <td style={{padding:"10px 8px"}}>{new Date(tx.timestamp*1000).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 style={{marginTop:40}}>NBCX Token Transfers</h2>
        <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Block</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Tx</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>From</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>To</th>
              <th style={{textAlign:"left",padding:"10px 8px"}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t,i)=>(
              <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                <td style={{padding:"10px 8px"}}>
                  <a href={`/block/${t.block}`} style={{textDecoration:"none",color:"inherit"}}>
                    {Number(t.block).toLocaleString()}
                  </a>
                </td>
                <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                  <a href={`/tx/${t.tx}`} style={{textDecoration:"none",color:"inherit"}}>
                    {shortHash(t.tx)}
                  </a>
                </td>
                <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                  <a href={`/address/${t.from}`} style={{textDecoration:"none",color:"inherit"}}>
                    {shortAddr(t.from)}
                  </a>
                </td>
                <td style={{padding:"10px 8px",fontFamily:"monospace"}}>
                  <a href={`/address/${t.to}`} style={{textDecoration:"none",color:"inherit"}}>
                    {shortAddr(t.to)}
                  </a>
                </td>
                <td style={{padding:"10px 8px"}}>{t.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
}
