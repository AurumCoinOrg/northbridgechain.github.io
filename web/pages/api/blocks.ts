import type { NextApiRequest, NextApiResponse } from 'next'
import { JsonRpcProvider } from "ethers"

const RPC = process.env.NEXT_PUBLIC_RPC!

export default async function handler(req:NextApiRequest,res:NextApiResponse){

  const provider = new JsonRpcProvider(RPC)

  const latest = await provider.getBlockNumber()

  const blocks:any[] = []

  for(let i=0;i<10;i++){

    const b = await provider.getBlock(latest-i)

    blocks.push({
      number:b.number,
      txs:b.transactions.length,
      gasUsed:b.gasUsed.toString(),
      timestamp:b.timestamp
    })
  }

  res.status(200).json(blocks)
}
