import Head from "next/head"
import { useEffect,useState } from "react"

export default function Depth(){

const [pairs,setPairs]=useState<any[]>([])
const [selected,setSelected]=useState<any>(null)

useEffect(()=>{

async function load(){

try{
const r = await fetch("/api/pairs")
const data = await r.json()

if(Array.isArray(data)){
setPairs(data)
if(data.length) setSelected(data[0])
}
}catch(e){}

}

load()

},[])

function buildDepth(pair:any){

if(!pair) return { bids:[], asks:[] }

const r0 = Number(pair.token0?.reserve || 0)
const r1 = Number(pair.token1?.reserve || 0)

if(!r0 || !r1) return { bids:[], asks:[] }

const mid = r1 / r0

let bids:any[] = []
let asks:any[] = []

for(let i=1;i<=12;i++){

const down = mid * (1 - i * 0.01)
const up = mid * (1 + i * 0.01)

bids.push({
price: down,
liquidity: r0 * (i / 12)
})

asks.push({
price: up,
liquidity: r1 * (i / 12)
})

}

return { bids, asks }
}

const depth = buildDepth(selected)

return(
<>
<Head>
<title>Liquidity Depth</title>
</Head>

<main style={{maxWidth:1100,margin:"40px auto",padding:20}}>

<h1>Liquidity Depth</h1>

<div style={{opacity:0.7,marginBottom:20}}>
AMM market depth simulation for Northbridge DEX pools
</div>

<div style={{marginBottom:20}}>
<select
value={selected?.pair || ""}
onChange={e=>{
const next = pairs.find((p:any)=>p.pair===e.target.value)
setSelected(next || null)
}}
style={{
padding:"12px 14px",
borderRadius:12,
border:"1px solid rgba(255,255,255,0.12)",
background:"rgba(255,255,255,0.05)",
color:"white",
minWidth:320
}}
>
{pairs.map((p:any)=>(
<option key={p.pair} value={p.pair}>
{p.token0?.symbol || "TOKEN0"} / {p.token1?.symbol || "TOKEN1"}
</option>
))}
</select>
</div>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:20
}}>

<div style={panel()}>
<div style={{fontWeight:700,fontSize:18,marginBottom:12}}>Buy Depth</div>

{depth.bids.map((b:any,i:number)=>(
<div key={i} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:13,opacity:0.9}}>
<span>{b.price.toLocaleString(undefined,{maximumFractionDigits:8})}</span>
<span>{b.liquidity.toLocaleString(undefined,{maximumFractionDigits:6})}</span>
</div>
<div style={{
height:12,
marginTop:4,
borderRadius:8,
background:"rgba(34,197,94,0.18)",
overflow:"hidden"
}}>
<div style={{
width:`${(i+1)*8}%`,
height:"100%",
background:"rgba(34,197,94,0.75)"
}} />
</div>
</div>
))}
</div>

<div style={panel()}>
<div style={{fontWeight:700,fontSize:18,marginBottom:12}}>Sell Depth</div>

{depth.asks.map((a:any,i:number)=>(
<div key={i} style={{marginBottom:10}}>
<div style={{display:"flex",justifyContent:"space-between",fontSize:13,opacity:0.9}}>
<span>{a.price.toLocaleString(undefined,{maximumFractionDigits:8})}</span>
<span>{a.liquidity.toLocaleString(undefined,{maximumFractionDigits:6})}</span>
</div>
<div style={{
height:12,
marginTop:4,
borderRadius:8,
background:"rgba(239,68,68,0.18)",
overflow:"hidden"
}}>
<div style={{
width:`${(i+1)*8}%`,
height:"100%",
background:"rgba(239,68,68,0.78)"
}} />
</div>
</div>
))}
</div>

</div>

<div style={{marginTop:24,display:"flex",gap:12,flexWrap:"wrap"}}>
<a href="/markets" style={btn()}>Markets</a>
<a href="/swap" style={btn()}>Swap</a>
<a href="/chart" style={btn()}>Chart</a>
<a href="/analytics" style={btn()}>Analytics</a>
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

function btn(){
return{
display:"inline-block",
padding:"8px 14px",
borderRadius:10,
border:"1px solid rgba(255,255,255,0.2)",
background:"rgba(255,255,255,0.05)",
color:"white",
textDecoration:"none"
}
}
