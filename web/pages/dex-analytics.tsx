import Head from "next/head"
import { useEffect,useState } from "react"

export default function DexAnalytics(){

const [pairs,setPairs]=useState<any[]>([])
const [trades,setTrades]=useState<any[]>([])

useEffect(()=>{

async function load(){

try{
const [pairsRes,tradesRes] = await Promise.all([
fetch("/api/pairs"),
fetch("/api/trades")
])

const pairsData = await pairsRes.json()
const tradesData = await tradesRes.json()

setPairs(Array.isArray(pairsData) ? pairsData : [])
setTrades(Array.isArray(tradesData) ? tradesData : [])
}catch(e){}
}

load()

const t = setInterval(load,10000)
return ()=>clearInterval(t)

},[])

const totalPools = pairs.length
const totalTrades = trades.length

const totalTVL = pairs.reduce((sum,p)=>{
return sum + Number(p.tvl || 0)
},0)

const totalVolume = pairs.reduce((sum,p)=>{
return sum + Number(p.volume || 0)
},0)

const topPools = [...pairs]
.sort((a,b)=>Number(b.volume || 0)-Number(a.volume || 0))
.slice(0,5)

return(
<>
<Head>
<title>DEX Analytics</title>
</Head>

<main style={{maxWidth:1100,margin:"40px auto",padding:20}}>

<h1>DEX Analytics</h1>

<div style={{opacity:0.7,marginBottom:20}}>
Northbridge Chain exchange analytics dashboard
</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:16,
marginBottom:28
}}>
<Card title="Total Pools" value={totalPools}/>
<Card title="Total Trades" value={totalTrades}/>
<Card title="TVL" value={fmt(totalTVL)}/>
<Card title="24h Volume" value={fmt(totalVolume)}/>
</div>

<div style={panel()}>
<div style={{fontWeight:700,fontSize:20,marginBottom:14}}>Top Markets</div>

{topPools.map((p,i)=>(
<div key={i} style={row()}>
<div>
<div style={{fontWeight:700}}>
{p.token0?.symbol || "TOKEN0"} / {p.token1?.symbol || "TOKEN1"}
</div>
<div style={{opacity:0.65,fontSize:12,marginTop:4}}>
{p.pair}
</div>
</div>

<div>
<div style={{fontSize:13,opacity:0.7}}>TVL</div>
<div>{fmt(p.tvl || 0)}</div>
</div>

<div>
<div style={{fontSize:13,opacity:0.7}}>Volume</div>
<div>{fmt(p.volume || 0)}</div>
</div>

<div>
<a href="/swap" style={btn()}>Trade</a>
<a href="/chart" style={btn()}>Chart</a>
</div>
</div>
))}

</div>

</main>
</>
)

}

function fmt(v:any){
const n = Number(v || 0)
if(!Number.isFinite(n)) return "0"
return n.toLocaleString(undefined,{maximumFractionDigits:6})
}

function Card({title,value}:{title:string,value:any}){
return(
<div style={panel()}>
<div style={{opacity:0.7,fontSize:13}}>{title}</div>
<div style={{fontSize:24,fontWeight:700,marginTop:6}}>{value}</div>
</div>
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
gridTemplateColumns:"2fr 1fr 1fr auto",
gap:16,
padding:"14px 0",
borderBottom:"1px solid rgba(255,255,255,0.08)",
alignItems:"center"
}
}

function btn(){
return{
display:"inline-block",
padding:"8px 14px",
borderRadius:10,
marginRight:8,
border:"1px solid rgba(255,255,255,0.2)",
background:"rgba(255,255,255,0.05)",
color:"white",
textDecoration:"none"
}
}
