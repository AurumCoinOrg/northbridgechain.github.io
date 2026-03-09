import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../../lib/publicRpc";

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

function shortHash(x:string){
  return x ? x.slice(0,10) + "…" + x.slice(-8) : "";
}

function shortAddr(x:string){
  return x ? x.slice(0,8) + "…" + x.slice(-6) : "";
}

function hexToInt(h?:string){
  if(!h) return 0;
  return parseInt(h,16);
}

function hexToBigInt(h?:string){
  try{
    return h ? BigInt(h) : 0n;
  }catch{
    return 0n;
  }
}

function formatUnits(value:bigint, decimals:number){
  const base = 10n ** BigInt(decimals);
  const whole = value / base;
  const frac = (value % base).toString().padStart(decimals, "0").slice(0,4).replace(/0+$/,"");
  return frac ? whole.toString() + "." + frac : whole.toString();
}

function decodeStringResult(hex?:string){
  if(!hex || hex === "0x") return "-";

  try{
    const raw = hex.startsWith("0x") ? hex.slice(2) : hex;

    if(raw.length >= 128){
      const lenHex = raw.slice(64,128);
      const len = parseInt(lenHex,16);
      const data = raw.slice(128,128 + len * 2);

      let out = "";
      for(let i=0;i<data.length;i+=2){
        const code = parseInt(data.slice(i,i+2),16);
        if(code) out += String.fromCharCode(code);
      }
      return out || "-";
    }

    let out = "";
    for(let i=0;i<raw.length;i+=2){
      const code = parseInt(raw.slice(i,i+2),16);
      if(code) out += String.fromCharCode(code);
    }
    return out || "-";
  }catch{
    return "-";
  }
}

export default function ContractPage(){
  const router = useRouter();
  const { address } = router.query;

  const [row,setRow] = useState<any>(null);
  const [err,setErr] = useState("");
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    if(!router.isReady || !address) return;

    async function load(){
      try{
        setErr("");
        setLoading(true);

        const addr = String(address);
        if(!/^0x[a-fA-F0-9]{40}$/.test(addr)){
          throw new Error("Invalid contract address");
        }

        const code = await rpc("eth_getCode",[addr,"latest"]);
        if(!code || code === "0x"){
          throw new Error("No contract bytecode found at this address");
        }

        let creator = "";
        let creationTx = "";
        let creationBlock = 0;

        const latestHex = await rpc("eth_blockNumber",[]);
        const latest = hexToInt(latestHex);

        for(let i=0;i<120;i++){
          const n = latest - i;
          if(n < 0) break;

          const block = await rpc("eth_getBlockByNumber",["0x" + n.toString(16), true]);
          const txs = Array.isArray(block?.transactions) ? block.transactions : [];

          let found = false;

          for(const tx of txs){
            try{
              const receipt = await rpc("eth_getTransactionReceipt",[tx.hash]);
              if(
                receipt?.contractAddress &&
                String(receipt.contractAddress).toLowerCase() === addr.toLowerCase()
              ){
                creator = tx.from || "";
                creationTx = tx.hash || "";
                creationBlock = n;
                found = true;
                break;
              }
            }catch{}
          }

          if(found) break;
        }

        let tokenName = "-";
        let tokenSymbol = "-";
        let tokenDecimals = "-";
        let tokenLike = false;

        try{
          const [nameHex, symbolHex, decimalsHex, totalSupplyHex] = await Promise.all([
            rpc("eth_call",[{ to:addr, data:"0x06fdde03" },"latest"]).catch(()=>"0x"),
            rpc("eth_call",[{ to:addr, data:"0x95d89b41" },"latest"]).catch(()=>"0x"),
            rpc("eth_call",[{ to:addr, data:"0x313ce567" },"latest"]).catch(()=>"0x"),
            rpc("eth_call",[{ to:addr, data:"0x18160ddd" },"latest"]).catch(()=>"0x")
          ]);

          tokenName = decodeStringResult(nameHex);
          tokenSymbol = decodeStringResult(symbolHex);
          tokenDecimals = decimalsHex && decimalsHex !== "0x" ? String(hexToInt(decimalsHex)) : "-";

          let tokenSupply = "-";
          if (tokenDecimals !== "-") {
            tokenSupply = formatUnits(hexToBigInt(totalSupplyHex), hexToInt(decimalsHex));
          }

          let holderCount = 0;
          let transferCount = 0;

          if(tokenName !== "-" || tokenSymbol !== "-"){
            tokenLike = true;

            const latestHex = await rpc("eth_blockNumber",[]);
            const latestLogsBlock = hexToInt(latestHex);
            const fromLogsBlock = "0x" + Math.max(0, latestLogsBlock - 10000).toString(16);

            const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
            const logs = await rpc("eth_getLogs", [{
              address: addr,
              fromBlock: fromLogsBlock,
              toBlock: "latest",
              topics: [transferTopic]
            }]).catch(() => []);

            transferCount = Array.isArray(logs) ? logs.length : 0;

            const balances = new Map<string, bigint>();
            const zero = "0x0000000000000000000000000000000000000000";

            for(const log of Array.isArray(logs) ? logs : []){
              const topics = Array.isArray(log?.topics) ? log.topics : [];
              const from = topics[1] ? ("0x" + String(topics[1]).slice(-40)).toLowerCase() : "";
              const to = topics[2] ? ("0x" + String(topics[2]).slice(-40)).toLowerCase() : "";
              const amount = hexToBigInt(log?.data);

              if(from && from !== zero){
                balances.set(from, (balances.get(from) || 0n) - amount);
              }

              if(to && to !== zero){
                balances.set(to, (balances.get(to) || 0n) + amount);
              }
            }

            holderCount = Array.from(balances.values()).filter(v => v > 0n).length;
          }
        }catch{}

        setRow({
          address: addr,
          codeSize: Math.max(0, (code.length - 2) / 2),
          creator,
          creationTx,
          creationBlock,
          tokenLike,
          tokenName,
          tokenSymbol,
          tokenDecimals,
          tokenSupply: "-",
          holderCount: 0,
          transferCount: 0
        });
      }catch(e:any){
        setErr(e?.message || "Failed to load contract");
      }finally{
        setLoading(false);
      }
    }

    load();
  },[router.isReady,address]);

  return(
    <>
      <Head>
        <title>Contract {String(address || "")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>
        <h1>Contract</h1>

        <div style={{marginTop:14,display:"flex",gap:14,flexWrap:"wrap"}}>
          <a href="/contracts-registry" style={{textDecoration:"none",color:"inherit"}}>← Contracts Registry</a>
          <a href="/explorer" style={{textDecoration:"none",color:"inherit"}}>Explorer →</a>
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

        {loading ? (
          <div style={{marginTop:18,opacity:0.78}}>Loading contract...</div>
        ) : null}

        {row ? (
          <>
            <div style={{
              marginTop:20,
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
              gap:16
            }}>
              <div style={{
                padding:18,
                borderRadius:18,
                border:"1px solid rgba(255,255,255,0.10)",
                background:"rgba(255,255,255,0.03)"
              }}>
                <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Contract Address</div>
                <div style={{
                  padding:"10px 12px",
                  borderRadius:12,
                  background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.10)",
                  fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  overflowWrap:"anywhere",
                  wordBreak:"break-word"
                }}>
                  {row.address}
                </div>
              </div>

              <div style={{
                padding:18,
                borderRadius:18,
                border:"1px solid rgba(255,255,255,0.10)",
                background:"rgba(255,255,255,0.03)"
              }}>
                <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Bytecode Size</div>
                <div style={{fontSize:28,fontWeight:800,lineHeight:1.1}}>
                  {Number(row.codeSize).toLocaleString()} bytes
                </div>
              </div>

              <div style={{
                padding:18,
                borderRadius:18,
                border:"1px solid rgba(255,255,255,0.10)",
                background:"rgba(255,255,255,0.03)"
              }}>
                <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Contract Type</div>
                <div style={{fontSize:28,fontWeight:800,lineHeight:1.1}}>
                  {row.tokenLike ? "Token-like" : "Generic Contract"}
                </div>
              </div>

              <div style={{
                padding:18,
                borderRadius:18,
                border:"1px solid rgba(255,255,255,0.10)",
                background:"rgba(255,255,255,0.03)"
              }}>
                <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Created In Block</div>
                <div style={{fontSize:28,fontWeight:800,lineHeight:1.1}}>
                  {row.creationBlock ? (
                    <a href={`/block/${row.creationBlock}`} style={{textDecoration:"none",color:"inherit"}}>
                      {Number(row.creationBlock).toLocaleString()}
                    </a>
                  ) : "-"}
                </div>
              </div>
            </div>

            <div style={{
              marginTop:18,
              padding:18,
              borderRadius:18,
              border:"1px solid rgba(255,255,255,0.10)",
              background:"rgba(255,255,255,0.03)"
            }}>
              <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Creator</div>
              <div style={{
                padding:"10px 12px",
                borderRadius:12,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.10)",
                fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                overflowWrap:"anywhere",
                wordBreak:"break-word"
              }}>
                {row.creator ? (
                  <a href={`/address/${row.creator}`} style={{textDecoration:"none",color:"inherit"}}>
                    {row.creator}
                  </a>
                ) : "-"}
              </div>
            </div>

            <div style={{
              marginTop:18,
              padding:18,
              borderRadius:18,
              border:"1px solid rgba(255,255,255,0.10)",
              background:"rgba(255,255,255,0.03)"
            }}>
              <div style={{fontSize:13,opacity:0.72,marginBottom:8}}>Creation Transaction</div>
              {!row.creationTx ? (
                <div style={{marginBottom:10,fontSize:13,opacity:0.72}}>
                  Creation details may be outside the quick scan window. Check Contracts Registry for recent deployments.
                </div>
              ) : null}
              <div style={{
                padding:"10px 12px",
                borderRadius:12,
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.10)",
                fontFamily:'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                overflowWrap:"anywhere",
                wordBreak:"break-word"
              }}>
                {row.creationTx ? (
                  <a href={`/tx/${row.creationTx}`} style={{textDecoration:"none",color:"inherit"}}>
                    {row.creationTx}
                  </a>
                ) : "-"}
              </div>
            </div>

            <div style={{
              marginTop:18,
              padding:18,
              borderRadius:18,
              border:"1px solid rgba(255,255,255,0.10)",
              background:"rgba(255,255,255,0.03)"
            }}>
              <div style={{fontSize:13,opacity:0.72,marginBottom:14}}>Detected Interface</div>

              <div style={{
                display:"grid",
                gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
                gap:14
              }}>
                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Name</div>
                  <div style={{marginTop:6,fontWeight:700}}>{row.tokenName}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Symbol</div>
                  <div style={{marginTop:6,fontWeight:700}}>{row.tokenSymbol}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Decimals</div>
                  <div style={{marginTop:6,fontWeight:700}}>{row.tokenDecimals}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Total Supply</div>
                  <div style={{marginTop:6,fontWeight:700}}>{row.tokenSupply || "-"}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Holder Count</div>
                  <div style={{marginTop:6,fontWeight:700}}>{Number(row.holderCount || 0).toLocaleString()}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Transfer Count</div>
                  <div style={{marginTop:6,fontWeight:700}}>{Number(row.transferCount || 0).toLocaleString()}</div>
                </div>

                <div>
                  <div style={{fontSize:13,opacity:0.72}}>Quick Link</div>
                  <div style={{marginTop:6,fontWeight:700}}>
                    {row.tokenLike ? (
                      <a href={`/token/${row.address}`} style={{textDecoration:"none",color:"inherit"}}>
                        Open token page →
                      </a>
                    ) : "-"}
                  </div>
                </div>
              </div>
            </div>

            <div style={{marginTop:14,fontSize:13,opacity:0.68}}>
              Discovery scan window: latest 120 blocks
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
