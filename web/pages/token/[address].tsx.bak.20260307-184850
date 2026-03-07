import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../components/CopyButton";

const RPC = "/api/rpc";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

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

function shortHash(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
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

function formatUnitsFromBigInt(value: bigint, decimals: number) {
  const safeDecimals = Number.isFinite(decimals) && decimals >= 0 ? decimals : 18;
  const base = 10n ** BigInt(safeDecimals);
  const whole = value / base;
  const frac = (value % base).toString().padStart(safeDecimals, "0").slice(0, 4).replace(/0+$/, "");
  return frac ? `${whole.toString()}.${frac}` : whole.toString();
}

function timeAgo(ts?: number | null) {
  if (!ts) return "-";
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);

  if (diff < 5) return "just now";
  if (diff < 60) return diff + "s ago";

  const m = Math.floor(diff / 60);
  if (m < 60) return m + "m ago";

  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";

  const d = Math.floor(h / 24);
  return d + "d ago";
}

function decodeStringResult(hex?: string | null) {
  if (!hex || hex === "0x") return "";
  try {
    if (hex.length >= 194) {
      const len = Number(BigInt("0x" + hex.slice(130, 194)));
      const dataHex = hex.slice(194, 194 + len * 2);
      return Buffer.from(dataHex, "hex").toString("utf8").replace(/\0/g, "");
    }
    const raw = hex.startsWith("0x") ? hex.slice(2) : hex;
    return Buffer.from(raw, "hex").toString("utf8").replace(/\0/g, "").trim();
  } catch {
    return "";
  }
}

function topicToAddress(topic?: string | null) {
  if (!topic || topic.length < 42) return "";
  return "0x" + topic.slice(-40);
}

export default function TokenPage() {
  const router = useRouter();
  const { address } = router.query;

  const [meta, setMeta] = useState({
    name: "",
    symbol: "",
    decimals: 18,
    totalSupply: "0",
  });
  const [transfers, setTransfers] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const tokenAddress = useMemo(() => String(address || ""), [address]);
  const tokenAddressLower = useMemo(() => tokenAddress.toLowerCase(), [tokenAddress]);

  useEffect(() => {
    if (!router.isReady || !address) return;

    async function load() {
      try {
        setErr("");
        setLoading(true);

        const addr = String(address);
        if (!/^0x[0-9a-fA-F]{40}$/.test(addr)) {
          throw new Error("Invalid token address");
        }

        const latestHex = await rpc("eth_blockNumber", []);
        const latest = hexToInt(latestHex);
        const fromBlock = "0x" + Math.max(0, latest - 1000).toString(16);

        const [
          nameHex,
          symbolHex,
          decimalsHex,
          totalSupplyHex,
          logs,
        ] = await Promise.all([
          rpc("eth_call", [{ to: addr, data: "0x06fdde03" }, "latest"]).catch(() => "0x"),
          rpc("eth_call", [{ to: addr, data: "0x95d89b41" }, "latest"]).catch(() => "0x"),
          rpc("eth_call", [{ to: addr, data: "0x313ce567" }, "latest"]).catch(() => "0x"),
          rpc("eth_call", [{ to: addr, data: "0x18160ddd" }, "latest"]).catch(() => "0x"),
          rpc("eth_getLogs", [{
            address: addr,
            fromBlock,
            toBlock: "latest",
            topics: [TRANSFER_TOPIC],
          }]).catch(() => []),
        ]);

        const decimals = decimalsHex && decimalsHex !== "0x" ? hexToInt(decimalsHex) : 18;
        const safeDecimals = Number.isFinite(decimals) ? decimals : 18;

        const items = (Array.isArray(logs) ? logs : [])
          .map((l: any, i: number) => ({
            key: l.transactionHash || "log-" + i,
            tx: l.transactionHash || "",
            block: hexToInt(l.blockNumber),
            from: topicToAddress(l.topics?.[1]),
            to: topicToAddress(l.topics?.[2]),
            amountRaw: hexToBigInt(l.data),
          }))
          .slice(-50)
          .reverse();

        setMeta({
          name: decodeStringResult(nameHex),
          symbol: decodeStringResult(symbolHex),
          decimals: safeDecimals,
          totalSupply: formatUnitsFromBigInt(hexToBigInt(totalSupplyHex), safeDecimals),
        });

        setTransfers(items);
      } catch (e: any) {
        setErr(e?.message || "Failed to load token");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [router.isReady, address]);

  const holderCountEstimate = useMemo(() => {
    const set = new Set<string>();
    for (const t of transfers) {
      if (t.from && t.from !== "0x0000000000000000000000000000000000000000") set.add(t.from.toLowerCase());
      if (t.to && t.to !== "0x0000000000000000000000000000000000000000") set.add(t.to.toLowerCase());
    }
    return set.size;
  }, [transfers]);

  const pageStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "40px auto",
    padding: 20,
  };

  const cardStyle: React.CSSProperties = {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.78,
    marginBottom: 4,
    letterSpacing: 0.2,
  };

  const codeBox: React.CSSProperties = {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  return (
    <>
      <Head>
        <title>{meta.symbol || "Token"} Token</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={pageStyle}>
        <h1>{meta.name || meta.symbol || "Token"}</h1>

        <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/explorer" style={{ textDecoration: "none", color: "inherit" }}>
            ← Explorer
          </a>
          <a href="/contracts" style={{ textDecoration: "none", color: "inherit" }}>
            Contracts →
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
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 16,
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>Token Name</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{meta.name || (loading ? "Loading..." : "-")}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Symbol</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{meta.symbol || (loading ? "Loading..." : "-")}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Decimals</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{meta.decimals}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Total Supply</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{meta.totalSupply}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Visible Holder Estimate</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{holderCountEstimate.toLocaleString()}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Recent Transfer Count</div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{transfers.length.toLocaleString()}</div>
          </div>
        </div>

        <div style={{ ...cardStyle, marginTop: 16 }}>
          <div style={labelStyle}>Contract Address</div>
          <div style={{ ...codeBox, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
            <span>{tokenAddress || "-"}</span>
            {tokenAddress ? <CopyButton value={tokenAddress} /> : null}
          </div>
        </div>

        <div style={{ marginTop: 34, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0 }}>Latest Transfers</h2>
          <div style={{ fontSize: 13, opacity: 0.72 }}>{transfers.length.toLocaleString()} rows</div>
        </div>

        <div
          style={{
            marginTop: 16,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <table style={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Tx</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Block</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>From</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>To</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Amount</th>
              </tr>
            </thead>

            <tbody>
              {transfers.length ? (
                transfers.map((t) => (
                  <tr key={t.key} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <a href={`/tx/${t.tx}`} title={t.tx}>{shortHash(t.tx)}</a>
                        <CopyButton value={t.tx} />
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      <a href={`/block/${t.block}`}>{t.block.toLocaleString()}</a>
                    </td>

                    <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <a href={`/address/${t.from}`} title={t.from}>{shortAddr(t.from)}</a>
                        <CopyButton value={t.from} />
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                        <a href={`/address/${t.to}`} title={t.to}>{shortAddr(t.to)}</a>
                        <CopyButton value={t.to} />
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>
                      {formatUnitsFromBigInt(t.amountRaw, meta.decimals)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: "18px 10px", opacity: 0.78 }}>
                    {loading ? "Loading token transfers..." : "No token transfers found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, fontSize: 13, opacity: 0.72 }}>
          Token route: {tokenAddressLower ? `/token/${tokenAddressLower}` : "-"}
        </div>
      </main>
    </>
  );
}
