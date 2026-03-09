const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";

async function rpc(method, params = []) {
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });

  const j = await r.json();
  if(j.error) throw new Error(j.error.message);
  return j.result;
}

function fmtUnits(hex,dec=18){
  const n = BigInt(hex);
  const div = 10n ** BigInt(dec);
  const whole = n/div;
  const frac = (n%div).toString().padStart(dec,"0").slice(0,4).replace(/0+$/,"");
  return frac ? whole+"."+frac : whole.toString();
}

export default async function handler(req,res){
  try{
    const addr = req.query.address;
    if(!addr) return res.status(400).json({});

    const data =
      "0x70a08231" +
      addr.replace("0x","").padStart(64,"0");

    const bal = await rpc("eth_call",[{
      to:NBCX,
      data
    },"latest"]);

    res.status(200).json({
      token:"NBCX",
      balance:fmtUnits(bal)
    });

  }catch(e){
    res.status(500).json({error:e.message});
  }
}
