import Head from "next/head";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const RPC = "/api/rpc";

const PAIR = "0xcd55F87AF066f654BA12384DEBf6CE477ee28518";
const ROUTER = "0x55d7E0a93faC96183B71C7e45621cD63bbD4bE7D";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const WNBCX = "0xb4E91c043F1166aB33653ADbE316C7a6423Cb723";

const PAIR_ABI = [
"function balanceOf(address owner) view returns (uint)",
"function approve(address spender,uint value) returns (bool)",
"function allowance(address owner,address spender) view returns(uint)"
];

const ROUTER_ABI = [
"function removeLiquidity(address tokenA,address tokenB,uint liquidity,uint amountAMin,uint amountBMin,address to,uint deadline)"
];

export default function RemoveLiquidity(){

const [account,setAccount]=useState("");
const [lpBalance,setLpBalance]=useState("0");
const [amount,setAmount]=useState("");
const [status,setStatus]=useState("");

useEffect(()=>{

async function load(){

if(!window.ethereum) return;

const provider=new ethers.BrowserProvider(window.ethereum);
const signer=await provider.getSigner();

const addr=await signer.getAddress();
setAccount(addr);

const pair=new ethers.Contract(PAIR,PAIR_ABI,provider);
const bal=await pair.balanceOf(addr);

setLpBalance(ethers.formatUnits(bal,18));

}

load();

},[]);

async function remove(){

try{

setStatus("Preparing...");

const provider=new ethers.BrowserProvider(window.ethereum);
const signer=await provider.getSigner();

const pair=new ethers.Contract(PAIR,PAIR_ABI,signer);
const router=new ethers.Contract(ROUTER,ROUTER_ABI,signer);

const liquidity=ethers.parseUnits(amount,18);

const allowance=await pair.allowance(account,ROUTER);

if(allowance<liquidity){

setStatus("Approving LP...");

const tx=await pair.approve(ROUTER,ethers.MaxUint256);
await tx.wait();

}

setStatus("Removing liquidity...");

const deadline=Math.floor(Date.now()/1000)+600;

const tx=await router.removeLiquidity(
NBCX,
WNBCX,
liquidity,
0,
0,
account,
deadline
);

await tx.wait();

setStatus("Liquidity removed");

}catch(e){

setStatus("Failed");

}

}

return(

<>
<Head>
<title>Remove Liquidity</title>
</Head>

<main style={{maxWidth:700,margin:"40px auto",padding:20}}>

<h1>Remove Liquidity</h1>

<div style={{marginTop:20}}>

<div>Wallet</div>
<div>{account}</div>

</div>

<div style={{marginTop:20}}>

<div>Your LP Balance</div>
<div>{lpBalance}</div>

</div>

<div style={{marginTop:20}}>

<input
value={amount}
onChange={e=>setAmount(e.target.value)}
placeholder="LP amount"
/>

</div>

<button
onClick={remove}
style={{marginTop:20}}
>

Remove Liquidity

</button>

<div style={{marginTop:20}}>

{status}

</div>

</main>
</>

);

}
