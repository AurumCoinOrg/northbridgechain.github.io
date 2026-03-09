import Head from "next/head"
import { useEffect,useState } from "react"

export default function Markets(){

const [pairs,setPairs]=useState<any[]>([])

useEffect(()=>{

async function load(){

try{
const r = await fetch("/api/pairs")
const data = await r.json()
setPairs(Array.isArray(data) ? data : [])
}catch(e){}
}

load()

},[])

return(
<>
<Head>
<title>Northbridge Markets</title>
</Head>

<main style={{maxWidth:1100,margin:"40px auto",padding:20}}>

<h1>Northbridge Markets</h1>

<div style={{opacity:0.7,marginBottom:20}}>
Live trading markets on Northbridge Chain
</div>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
gap:16,
marginBottom:30
}}>
<Card title="Total Pools" value={pairs.length}/>
<Card title="Markets" value="Live"/>
<Card title="DEX Status" value="Active"/>
</div>

<h2>Available Pools</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
gap:16,
marginTop:20
}}>
{pairs.map((p,i)=>(
<div key={i} style={card()}>
<div style={{fontWeight:700}}>Pool</div>

<div style={{opacity:0.8,fontSize:13,marginTop:4,wordBreak:"break-word"}}>
{p.pair}
</div>

<div style={{marginTop:14}}>
<a href="/swap" style={btn()}>Trade</a>
<a href="/chart" style={btn()}>Chart</a>
<a href={`/contract/${p.pair}`} style={btn()}>Contract</a>
</div>
</div>
))}
</div>

</main>
</>
)

}

function Card({title,value}:{title:string,value:any}){
return(
<div style={card()}>
<div style={{opacity:0.7,fontSize:13}}>{title}</div>
<div style={{fontSize:22,fontWeight:700,marginTop:4}}>{value}</div>
</div>
)
}

function card(){
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
marginRight:8,
marginTop:8,
border:"1px solid rgba(255,255,255,0.2)",
background:"rgba(255,255,255,0.05)",
color:"white",
textDecoration:"none"
}
}
