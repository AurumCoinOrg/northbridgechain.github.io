const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

async function rpc(method, params = []) {
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

function hexToInt(h){
  return parseInt(h,16);
}

export default async function handler(req,res){
  try{
    const addr = (req.query.address || "").toLowerCase();
    if(!addr) return res.status(400).json([]);

    const latestHex = await rpc("eth_blockNumber");
    const latest = hexToInt(latestHex);

    const results = [];

    for(let i=0;i<80;i++){
      const num = latest - i;
      if(num < 0) break;

      const block = await rpc("eth_getBlockByNumber",[
        "0x"+num.toString(16),
        true
      ]);

      if(!block) continue;

      for(const tx of block.transactions){
        const from = (tx.from || "").toLowerCase();
        const to = (tx.to || "").toLowerCase();

        if(from === addr || to === addr){
          results.push({
            hash:tx.hash,
            from:tx.from,
            to:tx.to,
            block:num,
            value:parseInt(tx.value,16),
            timestamp:parseInt(block.timestamp,16)
          });
        }

        if(results.length >= 20) break;
      }

      if(results.length >= 20) break;
    }

    res.status(200).json(results);
  }catch(e){
    res.status(500).json({error:e.message});
  }
}
