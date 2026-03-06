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

function hexToInt(h:string){
  return parseInt(h,16);
}

export default function AddressPage() {
  const router = useRouter();
  const { addr } = router.query;

  const [balance,setBalance] = useState("-");
  const [latest,setLatest] = useState("-");
  const [recent,setRecent] = useState<any[]>([]);
  const [scanDepth,setScanDepth] = useState(40);
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
        const latestNum = parseInt(blk,16);

        setBalance(fmtNative(bal));
        setLatest(latestNum.toLocaleString());

        const hits:any[] = [];
        const from = Math.max(0, latestNum - scanDepth + 1);

        for(let n = latestNum; n >= from; n--){
          const b = await rpc("eth_getBlockByNumber",["0x" + n.toString(16), true]);
          if(!b || !b.transactions) continue;

          for(const tx of b.transactions){
            const txFrom = (tx.from || "").toLowerCase();
            const txTo = (tx.to || "").toLowerCase();
            if(txFrom === a.toLowerCase() || txTo === a.toLowerCase()){
              hits.push({
                hash: tx.hash,
                from: tx.from,
                to: tx.to,
                blockNumber: n,
                timestamp: parseInt(b.timestamp,16)
              });
              if(hits.length >= 20) break;
            }
          }

          if(hits.length >= 20) break;
        }

        setRecent(hits);
      }catch(e:any){
        setErr(e?.message || "Failed to load address");
      }
    }

    load();
  }, [router.isReady, addr, scanDepth]);

  return (
    <>
      <Head><title>Address</title></Head>
      <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
        <h1>Address</h1>

        {err ? <div style={{marginTop:16,color:"rgba(255,120,120,0.95)"}}>{err}</div> : null}

        {addr ? (
          <>
            <div style={{marginTop:20,display:"grid",gap:10}}>
              <div><b>Address:</b> <span style={{fontFamily:"monospace"}}>{String(addr)}</span></div>
              <div><b>Short:</b> <span style={{fontFamily:"monospace"}}>{shortHash(String(addr))}</span></div>
              <div><b>Native Balance:</b> {balance}</div>
              <div><b>Latest Block Seen:</b> {latest}</div>
              <div><b>Recent Scan Depth:</b> last {scanDepth.toLocaleString()} blocks</div>
            </div>

            <div style={{marginTop:18,display:"flex",gap:10,flexWrap:"wrap"}}>
              <button
                onClick={()=>setScanDepth(40)}
                style={{padding:"10px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.08)",color:"inherit",cursor:"pointer"}}
              >
                Scan 40
              </button>
              <button
                onClick={()=>setScanDepth(100)}
                style={{padding:"10px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.08)",color:"inherit",cursor:"pointer"}}
              >
                Scan 100
              </button>
              <button
                onClick={()=>setScanDepth(250)}
                style={{padding:"10px 14px",borderRadius:12,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.08)",color:"inherit",cursor:"pointer"}}
              >
                Scan 250
              </button>
            </div>

            <h2 style={{marginTop:30}}>Recent Transactions</h2>

            {recent.length === 0 ? (
              <div style={{opacity:0.8}}>No recent transactions found in the scanned block range.</div>
            ) : (
              <table style={{width:"100%",marginTop:16,borderCollapse:"collapse"}}>
                <thead>
                  <tr>
                    <th style={{textAlign:"left",padding:"10px 8px"}}>Block</th>
                    <th style={{textAlign:"left",padding:"10px 8px"}}>Hash</th>
                    <th style={{textAlign:"left",padding:"10px 8px"}}>From</th>
                    <th style={{textAlign:"left",padding:"10px 8px"}}>To</th>
                    <th style={{textAlign:"left",padding:"10px 8px"}}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tx,i)=>(
                    <tr key={i} style={{borderTop:"1px solid rgba(255,255,255,0.08)"}}>
                      <td style={{padding:"10px 8px"}}>
                        <a href={`/block/${tx.blockNumber}`} style={{textDecoration:"none",color:"inherit"}}>
                          {tx.blockNumber.toLocaleString()}
                        </a>
                      </td>
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
                      <td style={{padding:"10px 8px"}}>
                        {new Date(tx.timestamp * 1000).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}
