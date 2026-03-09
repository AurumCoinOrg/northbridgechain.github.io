import Head from "next/head";
import { useEffect, useState } from "react";
import ExplorerSearch from "../components/ExplorerSearch";
import CopyButton from "../components/CopyButton";

const RPC = "/api/rpc";

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function shortHash(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

function shortAddr(x: string) {
  return x ? x.slice(0, 6) + "…" + x.slice(-4) : "";
}

function formatClock(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString();
}

function timeAgo(ts: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);

  if (diff < 5) return "just now";
  if (diff < 60) return diff + "s ago";

  const m = Math.floor(diff / 60);
  if (m < 60) return m + "m ago";

  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";

  const d = Math.floor(h / 24);
  return d + "d ago";
}

function normalizeStatus(status:any){
  if(status === undefined || status === null) return "pending";

  if(status === 1 || status === "0x1") return "success";
  if(status === 0 || status === "0x0") return "failed";

  return "pending";
}

export default function Explorer() {

  const [blocks,setBlocks] = useState<any[]>([]);
  const [txs,setTxs] = useState<any[]>([]);
  const [latest,setLatest] = useState<number>(0);
  const [lastUpdated,setLastUpdated] = useState("");

  useEffect(()=>{

    let dead=false;

    async function load(){

      try{

        const blk = await rpc("eth_blockNumber",[]);
        const latestBlock = parseInt(blk,16);

        const blockArr:any[]=[];
        const txArr:any[]=[];

        for(let i=0;i<10;i++){

          const num = latestBlock-i;
          if(num<0) break;

          const b = await rpc("eth_getBlockByNumber",[
            "0x"+num.toString(16),
            true
          ]);

          if(!b) continue;

          const ts = parseInt(b.timestamp,16);

          blockArr.push({
            number:num,
            hash:b.hash,
            txCount:b.transactions.length,
            gasUsed:parseInt(b.gasUsed,16),
            timestamp:ts
          });

          for(const tx of b.transactions){

            const receipt = await rpc("eth_getTransactionReceipt",[tx.hash]).catch(()=>null);

            txArr.push({
              hash:tx.hash,
              from:tx.from,
              to:tx.to,
              block:num,
              timestamp:ts,
              status:normalizeStatus(receipt?.status)
            });

            if(txArr.length>=12) break;

          }

        }

        if(dead) return;

        setLatest(latestBlock);
        setBlocks(blockArr);
        setTxs(txArr.slice(0,12));
        setLastUpdated(new Date().toLocaleTimeString());

      }catch{}

    }

    load();

    const t=setInterval(load,3000);

    return ()=>{
      dead=true;
      clearInterval(t);
    };

  },[]);

  return (
  <>
    <Head>
      <title>Explorer</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>

    <main className="page">

      <h1>Explorer</h1>

      <ExplorerSearch/>

      <div className="stats">
        <div>Latest Block: {latest.toLocaleString()}</div>
        <div>Auto-refresh: 3s</div>
        <div>Last Updated: {lastUpdated}</div>
      </div>

      <div className="sections">

        <section>

          <h2>Latest Blocks</h2>

          <div className="scroller">

          <table className="gridTable">

          <thead>
          <tr>
            <th>Block</th>
            <th>Hash</th>
            <th>Tx</th>
            <th>Gas</th>
            <th>Time</th>
          </tr>
          </thead>

          <tbody>

          {blocks.map((b,i)=>(
          <tr key={i}>

          <td>
          <a href={`/block/${b.number}`}>
          {b.number.toLocaleString()}
          </a>
          </td>

          <td className="mono">
          <a href={`/block/${b.number}`}>
          {shortHash(b.hash)}
          </a>
          <CopyButton value={b.hash}/>
          </td>

          <td>{b.txCount}</td>

          <td>{b.gasUsed.toLocaleString()}</td>

          <td title={formatClock(b.timestamp)}>
          <div className="timePrimary">{timeAgo(b.timestamp)}</div>
          <div className="timeSecondary">{formatClock(b.timestamp)}</div>
          </td>

          </tr>
          ))}

          </tbody>

          </table>

          </div>

        </section>

        <section>

          <h2>Latest Transactions</h2>

          <div className="scroller">

          <table className="gridTable">

          <thead>
          <tr>
            <th>Hash</th>
            <th>Status</th>
            <th>Block</th>
            <th>From</th>
            <th>To</th>
            <th>Time</th>
          </tr>
          </thead>

          <tbody>

          {txs.map((tx,i)=>(
          <tr key={i}>

          <td className="mono">
          <a href={`/tx/${tx.hash}`}>
          {shortHash(tx.hash)}
          </a>
          <CopyButton value={tx.hash}/>
          </td>

          <td>
          <span className={`status ${tx.status}`}>
          {tx.status}
          </span>
          </td>

          <td>
          <a href={`/block/${tx.block}`}>
          {Number(tx.block).toLocaleString()}
          </a>
          </td>

          <td className="mono">
          <a href={`/address/${tx.from}`}>
          {shortAddr(tx.from)}
          </a>
          <CopyButton value={tx.from}/>
          </td>

          <td className="mono">
          {tx.to ? (
          <>
          <a href={`/address/${tx.to}`}>
          {shortAddr(tx.to)}
          </a>
          <CopyButton value={tx.to}/>
          </>
          ) : "-"}
          </td>

          <td title={formatClock(tx.timestamp)}>
          <div className="timePrimary">{timeAgo(tx.timestamp)}</div>
          <div className="timeSecondary">{formatClock(tx.timestamp)}</div>
          </td>

          </tr>
          ))}

          </tbody>

          </table>

          </div>

        </section>

      </div>

      <style jsx>{`

        .page{
          max-width:1100px;
          margin:40px auto;
          padding:20px;
        }

        .stats{
          margin-top:12px;
          display:flex;
          gap:20px;
          flex-wrap:wrap;
        }

        .sections{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:40px;
          margin-top:40px;
        }

        .scroller{
          width:100%;
          overflow-x:auto;
        }

        .gridTable{
          width:100%;
          min-width:720px;
          border-collapse:collapse;
        }

        .gridTable th,
        .gridTable td{
          padding:10px 8px;
          text-align:left;
          white-space:nowrap;
        }

        .gridTable tr{
          border-top:1px solid rgba(255,255,255,0.08);
          transition:background 0.15s;
        }

        .gridTable tbody tr:hover{
          background:rgba(255,255,255,0.04);
        }

        .mono{
          font-family:monospace;
        }

        .timePrimary{
          font-weight:600;
        }

        .timeSecondary{
          font-size:12px;
          opacity:0.7;
        }

        .status{
          padding:4px 8px;
          border-radius:8px;
          font-size:12px;
          font-weight:600;
          text-transform:capitalize;
        }

        .status.success{
          background:rgba(0,200,120,0.18);
          color:#39d98a;
        }

        .status.failed{
          background:rgba(255,80,80,0.18);
          color:#ff6b6b;
        }

        .status.pending{
          background:rgba(255,200,80,0.18);
          color:#ffd166;
        }

        @media(max-width:900px){
          .sections{
            grid-template-columns:1fr;
          }
        }

      `}</style>

    </main>
  </>
  );

}
