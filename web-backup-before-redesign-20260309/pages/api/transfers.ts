const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

async function rpc(method, params = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function hexToInt(h) {
  return parseInt(h, 16);
}

function fmtUnits(hex, decimals = 18) {
  const n = BigInt(hex);
  const div = 10n ** BigInt(decimals);
  const whole = n / div;
  const frac = (n % div).toString().padStart(decimals, "0").slice(0, 4).replace(/0+$/, "");
  return frac ? `${whole.toString()}.${frac}` : whole.toString();
}

export default async function handler(req, res) {
  try {
    const latestHex = await rpc("eth_blockNumber", []);
    const latest = hexToInt(latestHex);
    const fromBlock = "0x" + Math.max(0, latest - 300).toString(16);

    const logs = await rpc("eth_getLogs", [{
      address: NBCX,
      fromBlock,
      toBlock: "latest",
      topics: [TRANSFER_TOPIC]
    }]);

    const items = logs.slice(-25).reverse().map((l) => ({
      tx: l.transactionHash,
      block: hexToInt(l.blockNumber),
      from: "0x" + l.topics[1].slice(26),
      to: "0x" + l.topics[2].slice(26),
      amount: fmtUnits(l.data, 18)
    }));

    res.status(200).json(items);
  } catch (e) {
    res.status(500).json({ error: e.message || "failed" });
  }
}
