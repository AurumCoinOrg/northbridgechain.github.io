import Head from "next/head";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../lib/publicRpc";

const RPC = PUBLIC_RPC;

async function rpc(method:string,params:any[]=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  return j.result;
}

function hexToInt(h:string){
  return parseInt(h,16);
}

export default function Health(){

  const [block,setBlock]=useState(0);
  const [blockTime,setBlockTime]=useState("-");
  const [latency,setLatency]=useState("-");
  const [chainId,setChainId]=useState("-");

  useEffect(()=>{

    async function load(){

      const start=performance.now();

      const chain = await rpc("eth_chainId");
      const b1 = await rpc("eth_blockNumber");
      const b2 = await rpc("eth_getBlockByNumber",[b1,false]);

      const end=performance.now();

      setLatency((end-start).toFixed(0)+" ms");
      setChainId(hexToInt(chain).toString());
      setBlock(hexToInt(b1));

      if(b2 && b2.timestamp){
        const t=parseInt(b2.timestamp,16);
        setBlockTime(new Date(t*1000).toLocaleTimeString());
      }

    }

    load();
    const t=setInterval(load,10000);
    return ()=>clearInterval(t);

  },[]);

  return(
    <>
    <Head>
      <title>Network Health</title>
    </Head>

    <main style={{maxWidth:900,margin:"40px auto",padding:20}}>
      <h1>Network Health</h1>

      <div style={{marginTop:30}}>

        <p><b>Chain ID:</b> {chainId}</p>

        <p><b>Latest Block:</b> {block.toLocaleString()}</p>

        <p><b>Last Block Time:</b> {blockTime}</p>

        <p><b>RPC Latency:</b> {latency}</p>

      </div>

    </main>
    </>
  )

}
