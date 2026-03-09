import Head from "next/head";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../lib/publicRpc";

const RPC = PUBLIC_RPC;

const KNOWN_TOKENS = [
  {
    address: "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196",
    name: "Northbridge Coin",
    symbol: "NBCX"
  }
];

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params
    })
  });

  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

function hexToBigInt(h?: string) {
  try {
    return h ? BigInt(h) : 0n;
  } catch {
    return 0n;
  }
}

function formatUnits(v: bigint, decimals = 18) {
  const base = 10n ** BigInt(decimals);
  return (v / base).toString();
}

export default function Tokens() {

  const [tokens,setTokens] = useState<any[]>([]);

  useEffect(()=>{

    async function load(){

      const rows:any[] = [];

      for(const t of KNOWN_TOKENS){

        try{

          const supplyHex = await rpc("eth_call",[
            {
              to:t.address,
              data:"0x18160ddd"
            },
            "latest"
          ]);

          const supply =
            formatUnits(hexToBigInt(supplyHex),18);

          rows.push({
            ...t,
            supply
          });

        }catch{
          rows.push({
            ...t,
            supply:"-"
          });
        }

      }

      setTokens(rows);

    }

    load();

  },[]);

  return(
  <>
    <Head>
      <title>Tokens</title>
    </Head>

    <main style={{maxWidth:1100,margin:"40px auto",padding:20}}>

      <h1>Tokens</h1>

      <table style={{width:"100%",marginTop:30}}>

        <thead>
          <tr>
            <th>Token</th>
            <th>Symbol</th>
            <th>Supply</th>
            <th>Contract</th>
          </tr>
        </thead>

        <tbody>

        {tokens.map((t,i)=>(
          <tr key={i}>

            <td>{t.name}</td>

            <td>{t.symbol}</td>

            <td>{t.supply}</td>

            <td>
              <a href={"/token/"+t.address}>
                {t.address.slice(0,10)}...
              </a>
            </td>

          </tr>
        ))}

        </tbody>

      </table>

    </main>
  </>
  );
}
