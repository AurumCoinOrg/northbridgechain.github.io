import Head from "next/head";
import { useEffect, useState } from "react";
import { PUBLIC_RPC } from "../lib/publicRpc";

const RPC = PUBLIC_RPC;
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

const KNOWN_TOKENS = [
  {
    address: "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196",
    name: "Northbridge Coin",
    symbol: "NBCX",
  },
];

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });

  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function hexToInt(h?: string | null) {
  if (!h) return 0;
  return parseInt(h, 16);
}

function hexToBigInt(h?: string | null) {
  try {
    return h ? BigInt(h) : 0n;
  } catch {
    return 0n;
  }
}

function formatUnits(v: bigint, decimals = 18) {
  const base = 10n ** BigInt(decimals);
  const whole = v / base;
  const frac = (v % base)
    .toString()
    .padStart(decimals, "0")
    .slice(0, 4)
    .replace(/0+$/, "");
  return frac ? whole.toString() + "." + frac : whole.toString();
}

function shortAddr(x: string) {
  return x ? x.slice(0, 8) + "…" + x.slice(-6) : "";
}

type TokenRow = {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  supply: string;
  holderCount: number;
  transferCount: number;
};

export default function TokensPage() {
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setErr("");
        setLoading(true);

        const latestHex = await rpc("eth_blockNumber", []);
        const latest = hexToInt(latestHex);
        const fromBlock = "0x" + Math.max(0, latest - 10000).toString(16);

        const rows: TokenRow[] = [];

        for (const t of KNOWN_TOKENS) {
          try {
            const [supplyHex, decimalsHex, logs] = await Promise.all([
              rpc("eth_call", [{ to: t.address, data: "0x18160ddd" }, "latest"]).catch(() => "0x0"),
              rpc("eth_call", [{ to: t.address, data: "0x313ce567" }, "latest"]).catch(() => "0x12"),
              rpc("eth_getLogs", [{
                address: t.address,
                fromBlock,
                toBlock: "latest",
                topics: [TRANSFER_TOPIC],
              }]).catch(() => []),
            ]);

            const decimals = decimalsHex && decimalsHex !== "0x" ? hexToInt(decimalsHex) : 18;
            const supply = formatUnits(hexToBigInt(supplyHex), decimals);

            const balances = new Map<string, bigint>();
            const zero = "0x0000000000000000000000000000000000000000";

            for (const log of Array.isArray(logs) ? logs : []) {
              const topics = Array.isArray(log?.topics) ? log.topics : [];
              const from = topics[1] ? ("0x" + String(topics[1]).slice(-40)).toLowerCase() : "";
              const to = topics[2] ? ("0x" + String(topics[2]).slice(-40)).toLowerCase() : "";
              const amount = hexToBigInt(log?.data);

              if (from && from !== zero) {
                balances.set(from, (balances.get(from) || 0n) - amount);
              }

              if (to && to !== zero) {
                balances.set(to, (balances.get(to) || 0n) + amount);
              }
            }

            const holderCount = Array.from(balances.values()).filter((v) => v > 0n).length;
            const transferCount = Array.isArray(logs) ? logs.length : 0;

            rows.push({
              address: t.address,
              name: t.name,
              symbol: t.symbol,
              decimals,
              supply,
              holderCount,
              transferCount,
            });
          } catch {
            rows.push({
              address: t.address,
              name: t.name,
              symbol: t.symbol,
              decimals: 18,
              supply: "-",
              holderCount: 0,
              transferCount: 0,
            });
          }
        }

        setTokens(rows);
      } catch (e: any) {
        setErr(e?.message || "Failed to load tokens");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <>
      <Head>
        <title>Tokens</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1>Tokens</h1>

        <div style={{ marginTop: 10, opacity: 0.75 }}>
          Chain token registry
        </div>

        {err ? (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 12,
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.28)",
              color: "rgba(255, 220, 220, 0.98)",
            }}
          >
            {err}
          </div>
        ) : null}

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            marginTop: 24,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Token</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Symbol</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Holders</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Transfers</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Supply</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Contract</th>
              </tr>
            </thead>

            <tbody>
              {tokens.length ? (
                tokens.map((t) => (
                  <tr key={t.address} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                      <a href={`/token/${t.address}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {t.name}
                      </a>
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {t.symbol}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {t.holderCount.toLocaleString()}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      <a href={`/token/${t.address}/transfers`} style={{ textDecoration: "none", color: "inherit" }}>
                        {t.transferCount.toLocaleString()}
                      </a>
                    </td>

                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                      {t.supply}
                    </td>

                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      <a href={`/token/${t.address}`} title={t.address} style={{ textDecoration: "none", color: "inherit" }}>
                        {shortAddr(t.address)}
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    {loading ? "Loading tokens..." : "No tokens found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 12, fontSize: 13, opacity: 0.68 }}>
          Scan window: latest 10,000 blocks
        </div>
      </main>
    </>
  );
}
