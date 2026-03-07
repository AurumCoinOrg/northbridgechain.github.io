const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";

const TRANSFER_TOPIC =
"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc(method,params=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({
      jsonrpc:"2.0",
      id:1,
      method,
      params
    })
  });

  const j = await r.json();
  if(j.error) throw new Error(j.error.message);
  return j.result;
}

export default async function handler(req,res){

  try{

    const addr = (req.query.addr || "").toLowerCase();

    const latest = await rpc("eth_blockNumber",[]);
    const latestBlock = parseInt(latest,16);

    const fromBlock = "0x"+(latestBlock-300).toString(16);

    const logs = await rpc("eth_getLogs",[{
      address:NBCX,
      fromBlock,
      toBlock:"latest",
      topics:[TRANSFER_TOPIC]
    }]);

    const transfers = logs.map(l=>{

      const from = "0x"+l.topics[1].slice(26);
      const to = "0x"+l.topics[2].slice(26);

      return {
        tx:l.transactionHash,
        from,
        to,
        block:parseInt(l.blockNumber,16)
      };

    }).filter(t =>
      t.from.toLowerCase() === addr ||
      t.to.toLowerCase() === addr
    );

    res.status(200).json(transfers.slice(0,25));

  }catch(e){

    res.status(500).json({error:e.message});

  }

}
