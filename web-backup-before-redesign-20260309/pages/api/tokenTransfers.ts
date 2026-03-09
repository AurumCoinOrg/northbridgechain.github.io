const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";

const TRANSFER =
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc(method,params=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });

  const j = await r.json();
  if(j.error) throw new Error(j.error.message);
  return j.result;
}

function hexToInt(h){
  return parseInt(h,16);
}

function fmtUnits(hex){
  const n = BigInt(hex);
  const div = 10n**18n;
  return (n/div).toString();
}

export default async function handler(req,res){
  try{

    const addr = req.query.address.toLowerCase();

    const latestHex = await rpc("eth_blockNumber");
    const latest = hexToInt(latestHex);

    const fromBlock =
      "0x"+Math.max(0,latest-500).toString(16);

    const logs = await rpc("eth_getLogs",[{
      address:NBCX,
      fromBlock,
      toBlock:"latest",
      topics:[TRANSFER]
    }]);

    const items =
      logs
      .map(l=>{
        const from="0x"+l.topics[1].slice(26);
        const to="0x"+l.topics[2].slice(26);

        return {
          block:hexToInt(l.blockNumber),
          tx:l.transactionHash,
          from,
          to,
          amount:fmtUnits(l.data)
        };
      })
      .filter(x=>
        x.from.toLowerCase()==addr ||
        x.to.toLowerCase()==addr
      )
      .slice(-20)
      .reverse();

    res.status(200).json(items);

  }catch(e){
    res.status(500).json({error:e.message});
  }
}
