import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

/**
 * Faucet API
 *
 * Required env:
 *   RPC_URL
 *   FAUCET_PK
 *   FAUCET_NBCX
 *
 * Optional env:
 *   FAUCET_AMOUNT (default "1000")
 *   FAUCET_COOLDOWN_SECONDS (default "86400")   // 24h wallet lock
 *   FAUCET_MAX_BALANCE (default = FAUCET_AMOUNT) // if wallet already has >= this, block
 *
 * Optional (recommended) persistent rate limit (Upstash Redis REST):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 *
 * NOTE: Without Redis, the cooldown is best-effort (per serverless instance).
 */

const lastHit = new Map<string, number>();

function getIp(req: NextApiRequest) {
  const xf = (req.headers["x-forwarded-for"] || "") as string;
  const ip = xf.split(",")[0]?.trim();
  return ip || req.socket.remoteAddress || "unknown";
}

async function upstashGet(key: string): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const resp = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) return null;

  const j: any = await resp.json().catch(() => null);
  // Upstash returns: { result: "value" } or { result: null }
  return j?.result ?? null;
}

async function upstashSet(key: string, value: string, ttlSeconds: number): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;

  // SET key value EX seconds
  const resp = await fetch(
    `${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value)}?EX=${encodeURIComponent(
      String(ttlSeconds)
    )}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return resp.ok;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const rpcUrl = process.env.RPC_URL;
    const pk = process.env.FAUCET_PK;
    const tokenAddr = process.env.FAUCET_NBCX;

    const amountStr = (process.env.FAUCET_AMOUNT || "1000").trim();
    const cooldown = Number((process.env.FAUCET_COOLDOWN_SECONDS || "86400").toString().trim()); // 24h default
    const maxBalStr = (process.env.FAUCET_MAX_BALANCE || amountStr).trim();
    if (!rpcUrl || !pk || !tokenAddr) {
      return res.status(500).json({
        ok: false,
        error: "Faucet not configured (missing RPC_URL / FAUCET_PK / FAUCET_NBCX).",
      });
    }

    const address = (req.body?.address || "").toString();
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ ok: false, error: "Invalid address" });
    }

    const ip = getIp(req);
    const now = Date.now();

    // --- Provider + contracts
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(pk, provider);

    const erc20 = new ethers.Contract(
      tokenAddr,
      [
        "function transfer(address to, uint256 amount) returns (bool)",
        "function balanceOf(address owner) view returns (uint256)",
        "function decimals() view returns (uint8)",
      ],
      wallet
    );

    // --- decimals-safe parsing
    let decimals = 18;
    try {
      decimals = Number(await erc20.decimals());
      if (!Number.isFinite(decimals) || decimals < 0 || decimals > 255) decimals = 18;
    } catch {
      decimals = 18;
    }

    const amount = ethers.parseUnits(amountStr, decimals);
    const maxBalance = ethers.parseUnits(maxBalStr, decimals);

    // --- Max balance guard (prevents: claim -> stake/unstake loops or multi-claims once wallet is "funded")
    let bal: bigint = 0n;
    try {
      bal = (await erc20.balanceOf(address)) as bigint;
    } catch (e: any) {
      return res.status(500).json({ ok: false, error: e?.message || "Failed to read balance" });
    }

    if (bal >= maxBalance) {
      return res.status(200).json({
        ok: false,
        error: `Already funded (balance >= ${maxBalStr} NBCX).`,
        code: "ALREADY_FUNDED",
        balance: ethers.formatUnits(bal, decimals),
      });
    }

    // --- Cooldown key (wallet + ip)
    const key = `nb:faucet:${ip.toLowerCase()}:${address.toLowerCase()}`;

    // Prefer Redis if configured, otherwise best-effort in-memory
    const prevStr = (await upstashGet(key)) ?? null;
    const prev = prevStr ? Number(prevStr) : (lastHit.get(key) || 0);

    if (prev && now - prev < cooldown * 1000) {
      const waitSec = Math.ceil((cooldown * 1000 - (now - prev)) / 1000);
      return res.status(429).json({
        ok: false,
        error: `Rate limited. Try again in ${waitSec}s.`,
        code: "RATE_LIMITED",
        waitSec,
      });
    }

    // Mark BEFORE sending (prevents spam retries)
    lastHit.set(key, now);
    await upstashSet(key, String(now), cooldown).catch(() => {});

    // --- Send
    const tx = await erc20.transfer(address, amount);
    const receipt = await tx.wait(1);

    return res.status(200).json({
      ok: true,
      to: address,
      amount: amountStr,
      txHash: receipt?.hash || tx.hash,
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Unknown error" });
  }
}
