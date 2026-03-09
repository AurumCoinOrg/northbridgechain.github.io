import { ethers } from "ethers"
import tokens from "../../data/tokens.json"

const RPC = process.env.NEXT_PUBLIC_RPC || "https://rpc.northbridgechain.com"

const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937"

const factoryABI=[
"function allPairsLength() view returns(uint)",
"function allPairs(uint) view returns(address)"
]

const pairABI=[
"function token0() view returns(address)",
"function token1() view returns(address)",
"function getReserves() view returns(uint112,uint112,uint32)",
"event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)"
]

const erc20ABI=[
"function symbol() view returns(string)"
]

export default async function handler(req,res){

const provider=new ethers.JsonRpcProvider(RPC)

const factory=new ethers.Contract(FACTORY,factoryABI,provider)

const length=Number(await factory.allPairsLength())

let markets=[]

for(let i=0;i<length;i++){

const pairAddress=await factory.allPairs(i)

const pair=new ethers.Contract(pairAddress,pairABI,provider)

const token0=await pair.token0()
const token1=await pair.token1()

const reserves=await pair.getReserves()

const r0=Number(ethers.formatUnits(reserves[0],18))
const r1=Number(ethers.formatUnits(reserves[1],18))

const t0=new ethers.Contract(token0,erc20ABI,provider)
const t1=new ethers.Contract(token1,erc20ABI,provider)

const symbol0=await t0.symbol()
const symbol1=await t1.symbol()

let price=0
let tvl=0

if(r0>0 && r1>0){
price=r1/r0
tvl=r0+r1
}

const currentBlock=await provider.getBlockNumber()
const fromBlock=currentBlock-6500

const filter=pair.filters.Swap()

let logs=[]

try{
logs=await pair.queryFilter(filter,fromBlock,currentBlock)
}catch(e){}

let volume=0
let trades=logs.length

for(const log of logs){

const a0in=Number(ethers.formatUnits(log.args.amount0In,18))
const a1in=Number(ethers.formatUnits(log.args.amount1In,18))

volume+=a0in+a1in

}

markets.push({

pair:pairAddress,

token0:{
address:token0,
symbol:symbol0,
logo:tokens[token0]?.logo || null,
reserve:r0
},

token1:{
address:token1,
symbol:symbol1,
logo:tokens[token1]?.logo || null,
reserve:r1
},

price,
tvl,
volume,
trades

})

}

res.status(200).json(markets)

}
