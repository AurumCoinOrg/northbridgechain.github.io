import { ethers } from "ethers"

const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937"

const FACTORY_ABI = [
"function allPairsLength() view returns(uint)",
"function allPairs(uint) view returns(address)"
]

const PAIR_ABI = [
"function token0() view returns(address)",
"function token1() view returns(address)"
]

export async function loadPairs(provider:any){

const factory = new ethers.Contract(
FACTORY,
FACTORY_ABI,
provider
)

const length = Number(await factory.allPairsLength())

const pairs:any[]=[]

for(let i=0;i<length;i++){

const pairAddr = await factory.allPairs(i)

const pair = new ethers.Contract(
pairAddr,
PAIR_ABI,
provider
)

const token0 = await pair.token0()
const token1 = await pair.token1()

pairs.push({
pair:pairAddr,
token0,
token1
})

}

return pairs

}
