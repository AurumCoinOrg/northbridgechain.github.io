import { useState } from "react"
import { ethers } from "ethers"

const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937"

const ABI = [
"function createPair(address tokenA,address tokenB) returns(address pair)"
]

declare global {
interface Window {
ethereum?: any
}
}

export default function CreatePair(){

const [tokenA,setTokenA]=useState("")
const [tokenB,setTokenB]=useState("")
const [pair,setPair]=useState("")
const [status,setStatus]=useState("")

async function create(){

if(!window.ethereum){
setStatus("Metamask not found")
return
}

try{

setStatus("Connecting wallet...")

const provider = new ethers.BrowserProvider(window.ethereum)
const signer = await provider.getSigner()

const factory = new ethers.Contract(
FACTORY,
ABI,
signer
)

setStatus("Creating pair...")

const tx = await factory.createPair(tokenA,tokenB)

await tx.wait()

setStatus("Pair created")

const receipt = await provider.getTransactionReceipt(tx.hash)

setPair(receipt.logs[0].address)

}catch(e:any){
setStatus(e.message)
}

}

return(

<div style={{maxWidth:800,margin:"40px auto",padding:20}}>

<h1>Create Trading Pair</h1>

<div style={{marginTop:20}}>

<input
placeholder="Token A Address"
value={tokenA}
onChange={e=>setTokenA(e.target.value)}
style={input()}
/>

<input
placeholder="Token B Address"
value={tokenB}
onChange={e=>setTokenB(e.target.value)}
style={input()}
/>

<button
onClick={create}
style={btn()}
>
Create Pair
</button>

</div>

<div style={{marginTop:20}}>
Status: {status}
</div>

{pair && (
<div style={{marginTop:20}}>
Pair Address: {pair}
</div>
)}

</div>

)

}

function input(){
return{
width:"100%",
padding:"14px",
marginBottom:12,
borderRadius:10,
border:"1px solid rgba(255,255,255,0.2)",
background:"rgba(255,255,255,0.05)",
color:"white"
}
}

function btn(){
return{
padding:"12px 20px",
borderRadius:10,
border:"1px solid rgba(255,255,255,0.2)",
background:"#3b82f6",
color:"white",
fontWeight:700,
cursor:"pointer"
}
}
