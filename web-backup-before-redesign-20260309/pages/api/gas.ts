const RPC = process.env.RPC_URL || "https://northbridgechain.com/api/rpc";

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

export default async function handler(req, res) {
  try {
    const latestHex = await rpc("eth_blockNumber", []);
    const latest = hexToInt(latestHex);

    const blocks = [];
    for (let i = 0; i < 10; i++) {
      const n = latest - i;
      if (n < 0) break;
      const b = await rpc("eth_getBlockByNumber", ["0x" + n.toString(16), false]);
      if (!b) continue;
      blocks.push({
        number: n,
        gasUsed: hexToInt(b.gasUsed),
        gasLimit: hexToInt(b.gasLimit),
        timestamp: hexToInt(b.timestamp),
      });
    }

    let avgGasUsed = 0;
    let avgGasLimit = 0;
    if (blocks.length) {
      avgGasUsed = Math.round(blocks.reduce((a, b) => a + b.gasUsed, 0) / blocks.length);
      avgGasLimit = Math.round(blocks.reduce((a, b) => a + b.gasLimit, 0) / blocks.length);
    }

    const utilization = avgGasLimit > 0 ? ((avgGasUsed / avgGasLimit) * 100).toFixed(2) : "0.00";

    res.status(200).json({
      latestBlock: latest,
      sampledBlocks: blocks.length,
      avgGasUsed,
      avgGasLimit,
      avgUtilizationPct: utilization,
    });
  } catch (e) {
    res.status(500).json({ error: e.message || "failed" });
  }
}
