import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const upstream = "http://rpc.northbridgechain.com:8545";

  try {
    const r = await fetch(upstream, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await r.text();
    res.setHeader("content-type", "application/json");
    return res.status(r.status).send(text);
  } catch (e: any) {
    return res.status(502).json({ error: "Upstream RPC unreachable", detail: String(e?.message || e) });
  }
}
