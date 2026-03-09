import { ethers } from "ethers"
import tokens from "../../data/tokens.json"

const RPC = process.env.NEXT_PUBLIC_RPC || "https://rpc.northbridgechain.com"

const FACTORY = "0x5b1211A7880C0B8a49A2495c133e4592EA6f8937"

const factoryABI = [
  "function allPairsLength() view returns(uint)",
  "function allPairs(uint) view returns(address)"
]

const pairABI = [
  "function token0() view returns(address)",
  "function token1() view returns(address)",
  "function getReserves() view returns(uint112,uint112,uint32)"
]

const erc20ABI = [
  "function symbol() view returns(string)",
  "function decimals() view returns(uint8)"
]

type TokenRegistry = Record<string, { symbol?: string; logo?: string }>

const TOKEN_REGISTRY = tokens as TokenRegistry

function metaFor(address: string, fallbackSymbol: string) {
  const exact = TOKEN_REGISTRY[address]
  if (exact) {
    return {
      symbol: exact.symbol || fallbackSymbol,
      logo: exact.logo || null
    }
  }

  const lowered = Object.entries(TOKEN_REGISTRY).find(
    ([k]) => k.toLowerCase() === address.toLowerCase()
  )?.[1]

  return {
    symbol: lowered?.symbol || fallbackSymbol,
    logo: lowered?.logo || null
  }
}

export default async function handler(req: any, res: any) {
  try {
    const provider = new ethers.JsonRpcProvider(RPC)
    const factory = new ethers.Contract(FACTORY, factoryABI, provider)

    const length = Number(await factory.allPairsLength())
    const markets: any[] = []

    for (let i = 0; i < length; i++) {
      const pairAddress = await factory.allPairs(i)
      const pair = new ethers.Contract(pairAddress, pairABI, provider)

      const [token0, token1, reserves] = await Promise.all([
        pair.token0(),
        pair.token1(),
        pair.getReserves()
      ])

      const t0 = new ethers.Contract(token0, erc20ABI, provider)
      const t1 = new ethers.Contract(token1, erc20ABI, provider)

      const [symbol0, symbol1] = await Promise.all([
        t0.symbol().catch(() => "TOKEN0"),
        t1.symbol().catch(() => "TOKEN1")
      ])

      const meta0 = metaFor(token0, symbol0)
      const meta1 = metaFor(token1, symbol1)

      markets.push({
        pair: pairAddress,
        token0: {
          address: token0,
          symbol: meta0.symbol,
          logo: meta0.logo,
          reserve: ethers.formatUnits(reserves[0], 18)
        },
        token1: {
          address: token1,
          symbol: meta1.symbol,
          logo: meta1.logo,
          reserve: ethers.formatUnits(reserves[1], 18)
        }
      })
    }

    res.status(200).json(markets)
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "Failed to load pairs" })
  }
}
