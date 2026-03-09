import Head from "next/head"
import { useEffect,useState } from "react"

export default function Trades(){

const [trades,setTrades]=useState<any[]>([])

useEffect(()=>{

async function load(){

try{

const r = await fetch("/api/trades")
const data = await r.json()

setTrades(Array.isArray(data) ? data : [])

}catch(e){}

}

load()

const timer = setInterval(load,5000)

return ()=>clearInterval(timer)

},[])

return(
<>
<Head>
<title>Recent Trades</title>
</Head>

<main style={{maxWidth:900,margin:"40px auto",padding:20}}>

<h1>Recent Trades</h1>

<div style={{opacity:0.7,marginBottom:20}}>
Live swaps across Northbridge DEX pools
</div>

<div style={panel()}>

{trades.map((t,i)=>(
<div key={i} style={row()}>

<div style={{fontWeight:700}}>
{t.side}
</div>

<div>
{Number(t.price).toLocaleString(undefined,{maximumFractionDigits:8})}
</div>

<div>
{Number(t.size).toLocaleString(undefined,{maximumFractionDigits:6})}
</div>

<a
href={`/tx/${t.tx}`}
style={{textDecoration:"none",color:"#7aa2ff"}}
>
tx
</a>

</div>
))}

</div>

</main>
</>
)

}

function panel(){
return{
padding:18,
borderRadius:16,
border:"1px solid rgba(255,255,255,0.12)",
background:"rgba(255,255,255,0.03)"
}
}

function row(){
return{
display:"grid",
gridTemplateColumns:"1fr 1fr 1fr auto",
gap:12,
padding:"10px 0",
borderBottom:"1px solid rgba(255,255,255,0.08)"
}
}
