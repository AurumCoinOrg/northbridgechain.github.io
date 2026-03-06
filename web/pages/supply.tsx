import Head from "next/head";
import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const RPC = "/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const STAKING = "0x688192F914b058bF7a5533e5Fb1da8f9e45ACBa2";
const VAULT = "0x81A41Be104490887533D24758905cF9023c27BB8";

const TOTAL_SUPPLY_SIG = "0x18160ddd";
const BALANCE_SIG = "0x70a08231";

function pad(a:string){
  return a.slice(2).padStart(64,"0");
}

async function rpc(method:string,params:any[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  return j.result;
}

function fmt(hex:string){
  const n = BigInt(hex);
  return Number(n/1000000000000000000n);
}

export default function Supply(){

  const [supply,setSupply]=useState(0);
  const [staking,setStaking]=useState(0);
  const [vault,setVault]=useState(0);

  useEffect(()=>{

    async function load(){

      const totalHex = await rpc("eth_call",[{
        to:NBCX,
        data:TOTAL_SUPPLY_SIG
      },"latest"]);

      const stakingHex = await rpc("eth_call",[{
        to:NBCX,
        data:BALANCE_SIG + pad(STAKING)
      },"latest"]);

      const vaultHex = await rpc("eth_call",[{
        to:NBCX,
        data:BALANCE_SIG + pad(VAULT)
      },"latest"]);

      setSupply(fmt(totalHex));
      setStaking(fmt(stakingHex));
      setVault(fmt(vaultHex));

    }

    load();
    const t=setInterval(load,15000);
    return ()=>clearInterval(t);

  },[]);

  const circulating = supply - staking - vault;

  const data={
    labels:["Circulating","Staking Pool","Treasury Vault"],
    datasets:[{
      data:[circulating,staking,vault],
      backgroundColor:[
        "#22c55e",
        "#3b82f6",
        "#f59e0b"
      ]
    }]
  };

  return(
    <>
    <Head>
      <title>Supply Tracker</title>
    </Head>

    <main style={{maxWidth:900,margin:"40px auto",padding:20}}>
      <h1>NBCX Supply Tracker</h1>

      <div style={{width:400,margin:"40px auto"}}>
        <Pie data={data}/>
      </div>

      <p>Total Supply: {supply.toLocaleString()} NBCX</p>
      <p>Circulating: {circulating.toLocaleString()} NBCX</p>
      <p>Staking Pool: {staking.toLocaleString()} NBCX</p>
      <p>Treasury Vault: {vault.toLocaleString()} NBCX</p>

    </main>
    </>
  );

}
