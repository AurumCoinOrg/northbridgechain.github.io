const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";

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

    const block = await rpc("eth_blockNumber",[]);
    const latestBlock = parseInt(block,16);

    const supply = await rpc("eth_call",[
      {
        to:NBCX,
        data:"0x18160ddd"
      },
      "latest"
    ]);

    const totalSupply = parseInt(supply,16) / 1e18;

    res.status(200).json({
      latestBlock,
      totalSupply
    });

  }catch(e){

    res.status(500).json({error:e.message});

  }

}
