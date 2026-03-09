import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../../components/CopyButton";
import { PUBLIC_RPC } from "../../../lib/publicRpc";

const RPC = PUBLIC_RPC;
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const TOTAL_SUPPLY_CALL = "0x18160ddd";
const DECIMALS_CALL = "0x313ce567";

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });

  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function short(x: string) {
  return x ? x.slice(0, 8) + "…" + x.slice(-6) : "";
}

function shortAddr(x: string) {
  return x ? x.slice(0, 6) + "…" + x.slice(-4) : "";
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

function topicToAddress(topic?: string | null) {
  if (!topic || topic.length < 42) return "";
  return ("0x" + topic.slice(-40)).toLowerCase();
}

function formatUnits(value: bigint, decimals: number) {
  const safeDecimals = Number.isFinite(decimals) && decimals >= 0 ? decimals : 18;
  const base = 10n ** BigInt(safeDecimals);
  const whole = value / base;
  const frac = (value % base)
    .toString()
    .padStart(safeDecimals, "0")
    .slice(0, 4)
    .replace(/0+$/, "");
  return frac ? whole.toString() + "." + frac : whole.toString();
}

export default function TokenHolders() {
  const router = useRouter();
  const { address } = router.query;

  const [holders, setHolders] = useState<any[]>([]);
  const [supply, setSupply] = useState<bigint>(0n);
  const [decimals, setDecimals] = useState<number>(18);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const tokenAddress = useMemo(() => String(address || ""), [address]);

  useEffect(() => {
    if (!router.isReady || !address) return;

    async function load() {
      try {
        setErr("");
        setLoading(true);

        const token = String(address);
        if (!/^0x[0-9a-fA-F]{40}$/.test(token)) {
          throw new Error("Invalid token address");
        }

        const latestHex = await rpc("eth_blockNumber", []);
        const latest = hexToInt(latestHex);
        const fromBlock = "0x" + Math.max(0, latest - 10000).toString(16);

        const [totalSupplyHex, decimalsHex, logs] = await Promise.all([
          rpc("eth_call", [{ to: token, data: TOTAL_SUPPLY_CALL }, "latest"]).catch(() => "0x0"),
          rpc("eth_call", [{ to: token, data: DECIMALS_CALL }, "latest"]).catch(() => "0x12"),
          rpc("eth_getLogs", [{
            address: token,
            fromBlock,
            toBlock: "latest",
            topics: [TRANSFER_TOPIC],
          }]).catch(() => []),
        ]);

        const tokenSupply = hexToBigInt(totalSupplyHex);
        const tokenDecimals = decimalsHex && decimalsHex !== "0x" ? hexToInt(decimalsHex) : 18;

        const balances = new Map<string, bigint>();
        const zero = "0x0000000000000000000000000000000000000000";

        for (const log of Array.isArray(logs) ? logs : []) {
          const from = topicToAddress(log?.topics?.[1]);
          const to = topicToAddress(log?.topics?.[2]);
          const amount = hexToBigInt(log?.data);

          if (from && from !== zero) {
            balances.set(from, (balances.get(from) || 0n) - amount);
          }

          if (to && to !== zero) {
            balances.set(to, (balances.get(to) || 0n) + amount);
          }
        }

        const items = Array.from(balances.entries())
          .filter(([, bal]) => bal > 0n)
          .map(([addr, bal]) => ({
            addr,
            balanceRaw: bal,
          }))
          .sort((a, b) => (a.balanceRaw > b.balanceRaw ? -1 : a.balanceRaw < b.balanceRaw ? 1 : 0))
          .slice(0, 100);

        setSupply(tokenSupply);
        setDecimals(tokenDecimals);
        setHolders(items);
      } catch (e: any) {
        setErr(e?.message || "Failed to load token holders");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router.isReady, address]);

  function pct(balanceRaw: bigint) {
    if (!supply) return "0.00";
    const scaled = Number((balanceRaw * 10000n) / supply) / 100;
    return scaled.toFixed(2);
  }

  return (
    <>
      <Head>
        <title>Token Holders</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1100, margin: "40px auto", padding: 20 }}>
        <h1>Token Holders</h1>

        <div style={{ marginTop: 10, opacity: 0.7 }}>
          Token: {tokenAddress}
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href={`/token/${tokenAddress}`} style={{ textDecoration: "none", color: "inherit" }}>
            ← Token
          </a>
          <a href="/explorer" style={{ textDecoration: "none", color: "inherit" }}>
            Explorer →
          </a>
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
            marginTop: 24,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Rank</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Address</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Balance</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>% Supply</th>
              </tr>
            </thead>

            <tbody>
              {holders.length ? (
                holders.map((h, i) => (
                  <tr key={h.addr} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "12px 10px" }}>{i + 1}</td>

                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <a href={`/address/${h.addr}`} title={h.addr}>
                          {shortAddr(h.addr)}
                        </a>
                        <CopyButton value={h.addr} />
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                      {formatUnits(h.balanceRaw, decimals)}
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {pct(h.balanceRaw)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    {loading ? "Loading holders..." : "No holders found in the scanned transfer history."}
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
