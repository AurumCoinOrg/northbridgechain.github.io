import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../../../lib/publicRpc";

const RPC = PUBLIC_RPC;

const TRANSFER =
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function short(x:string){
  return x.slice(0,10)+"…"+x.slice(-8);
}

function hexToInt(h:string){
  return parseInt(h,16);
}

function hexToBigInt(h:string){
  return BigInt(h);
}

function topicAddr(t:string){
  return "0x"+t.slice(26);
}

function fmtUnits(hex:string){
  const n = BigInt(hex);
  const div = 10n**18n;
  return (n/div).toString();
}

async function rpc(method:string,params:any[]=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });

  const j = await r.json();
  if(j.error) throw new Error(j.error.message);
  return j.result;
}

export default function TokenTransfers(){

  const router = useRouter();
  const { address } = router.query;

  const [items,setItems] = useState<any[]>([]);
  const [err,setErr] = useState("");

  useEffect(()=>{

    if(!router.isReady) return;

    async function load(){

      try{

        const latestHex = await rpc("eth_blockNumber");
        const latest = hexToInt(latestHex);

        const fromBlock =
          "0x"+Math.max(0,latest-2000).toString(16);

        const logs = await rpc("eth_getLogs",[{
          address,
          fromBlock,
          toBlock:"latest",
          topics:[TRANSFER]
        }]);

        const rows =
          logs
          .map((l:any)=>{

            const from = topicAddr(l.topics[1]);
            const to = topicAddr(l.topics[2]);

            return{
              block:hexToInt(l.blockNumber),
              tx:l.transactionHash,
              from,
              to,
              amount:fmtUnits(l.data)
            };

          })
          .reverse();

        setItems(rows);

      }catch(e:any){

        setErr(e.message);

      }

    }

    load();

  },[router.isReady]);

  return(
  <>
    <Head>
      <title>Token Transfers</title>
    </Head>

    <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>

      <h1>Token Transfers</h1>

      <div style={{marginTop:10,opacity:0.7}}>
        Token: {address}
      </div>

      {err && (
        <div style={{marginTop:20,color:"red"}}>
          {err}
        </div>
      )}

      <table style={{width:"100%",marginTop:30}}>

        <thead>
          <tr>
            <th>Block</th>
            <th>Tx</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>

        {items.map((x,i)=>(
          <tr key={i}>

            <td>
              <a href={"/block/"+x.block}>
                {x.block}
              </a>
            </td>

            <td>
              <a href={"/tx/"+x.tx}>
                {short(x.tx)}
              </a>
            </td>

            <td>
              <a href={"/address/"+x.from}>
                {short(x.from)}
              </a>
            </td>

            <td>
              <a href={"/address/"+x.to}>
                {short(x.to)}
              </a>
            </td>

            <td>
              {Number(x.amount).toLocaleString()}
            </td>

          </tr>
        ))}

        </tbody>

      </table>

    </main>
  </>
  );
}
