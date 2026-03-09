import { ethers } from "ethers"
import { loadPairs } from "../../lib/loadPairs"

const RPC = process.env.NEXT_PUBLIC_RPC

export default async function handler(req:any,res:any){

try{

const provider = new ethers.JsonRpcProvider(RPC)

const pairs = await loadPairs(provider)

res.status(200).json(pairs)

}catch(e:any){

res.status(500).json({error:e.message})

}

}
