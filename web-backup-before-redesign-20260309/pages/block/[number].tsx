import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../components/CopyButton";
import { PUBLIC_RPC } from "../../lib/publicRpc";

const RPC = PUBLIC_RPC;

async function rpc(method: string, params: any[] = []) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function hexToInt(h?: string | null) {
  if (!h) return 0;
  return parseInt(h, 16);
}

function hexToString(h?: string | null) {
  if (!h) return "0";
  try {
    return BigInt(h).toString();
  } catch {
    return "0";
  }
}

function shortHash(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

function pct(a: number, b: number) {
  if (!b) return "0.00";
  return ((a / b) * 100).toFixed(2);
}

function timeAgo(ts: number) {
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

export default function BlockPage() {
  const router = useRouter();
  const { number } = router.query;

  const [block, setBlock] = useState<any | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !number) return;

    async function load() {
      try {
        setErr("");
        const n = Number(number);
        if (!Number.isFinite(n) || n < 0) throw new Error("Invalid block number");
        const hex = "0x" + n.toString(16);
        const b = await rpc("eth_getBlockByNumber", [hex, true]);
        if (!b) throw new Error("Block not found");
        setBlock(b);
      } catch (e: any) {
        setErr(e?.message || "Failed to load block");
      }
    }

    load();
  }, [router.isReady, number]);

  const timestamp = useMemo(() => {
    return block?.timestamp ? hexToInt(block.timestamp) : 0;
  }, [block]);

  const gasUsed = useMemo(() => {
    return block?.gasUsed ? hexToInt(block.gasUsed) : 0;
  }, [block]);

  const gasLimit = useMemo(() => {
    return block?.gasLimit ? hexToInt(block.gasLimit) : 0;
  }, [block]);

  const txs = Array.isArray(block?.transactions) ? block.transactions : [];

  const pageStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "40px auto",
    padding: 20
  };

  const cardStyle: React.CSSProperties = {
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)"
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.78,
    marginBottom: 4,
    letterSpacing: 0.2
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
    wordBreak: "break-word"
  };

  return (
    <>
      <Head>
        <title>Block {number}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={pageStyle}>
        <h1>Block {number}</h1>

        <div style={{ marginTop: 16, display: "flex", gap: 14, flexWrap: "wrap" }}>
          <a href="/explorer" style={{ textDecoration: "none", color: "inherit" }}>
            ← Explorer
          </a>
          <a href="/network" style={{ textDecoration: "none", color: "inherit" }}>
            Network Stats →
          </a>
        </div>

        {err ? (
          <div style={{ marginTop: 16, color: "rgba(255,120,120,0.95)" }}>{err}</div>
        ) : null}

        {block ? (
          <>
            <div
              style={{
                marginTop: 20,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: 16
              }}
            >
              <div style={cardStyle}>
                <div style={labelStyle}>Hash</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <span>{block.hash}</span>
                  <CopyButton value={block.hash} />
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Parent Hash</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <span>{block.parentHash}</span>
                  <CopyButton value={block.parentHash} />
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Timestamp</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{timestamp ? timeAgo(timestamp) : "-"}</div>
                <div style={{ marginTop: 6, opacity: 0.78 }}>{timestamp ? new Date(timestamp * 1000).toLocaleString() : "-"}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Transactions</div>
                <div style={{ fontSize: 24, fontWeight: 800 }}>{txs.length.toLocaleString()}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Gas Used</div>
                <div style={{ fontSize: 16 }}>{gasUsed.toLocaleString()}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Gas Limit</div>
                <div style={{ fontSize: 16 }}>{gasLimit.toLocaleString()}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Gas Utilization</div>
                <div style={{ fontSize: 16 }}>{pct(gasUsed, gasLimit)}%</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Nonce</div>
                <div style={{ ...codeBox, marginTop: 0 }}>{block.nonce || "-"}</div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Difficulty</div>
                <div style={{ fontSize: 16 }}>
                  {block.difficulty ? hexToInt(block.difficulty).toLocaleString() : "-"}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Miner</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}>
                  <span>{block.miner || "-"}</span>
                  {block.miner ? <CopyButton value={block.miner} /> : null}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Base Fee Per Gas</div>
                <div style={{ fontSize: 16 }}>
                  {block.baseFeePerGas ? hexToString(block.baseFeePerGas) : "-"}
                </div>
              </div>

              <div style={cardStyle}>
                <div style={labelStyle}>Block Size</div>
                <div style={{ fontSize: 16 }}>
                  {block.size ? hexToInt(block.size).toLocaleString() : "-"}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 34, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>Transactions</h2>
              <div style={{ fontSize: 13, opacity: 0.72 }}>{txs.length.toLocaleString()} in block</div>
            </div>

            <div
              style={{
                marginTop: 16,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(255,255,255,0.03)"
              }}
            >
              <table style={{ width: "100%", minWidth: 860, borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>Hash</th>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>From</th>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>To</th>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>Nonce</th>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>Value</th>
                    <th style={{ textAlign: "left", padding: "12px 10px" }}>Gas</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length ? (
                    txs.map((tx: any, i: number) => (
                      <tr key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                        <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <a href={`/tx/${tx.hash}`} style={{ textDecoration: "none", color: "inherit" }}>
                              {shortHash(tx.hash)}
                            </a>
                            <CopyButton value={tx.hash} />
                          </div>
                        </td>

                        <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                            <a href={`/address/${tx.from}`} style={{ textDecoration: "none", color: "inherit" }}>
                              {shortHash(tx.from)}
                            </a>
                            <CopyButton value={tx.from} />
                          </div>
                        </td>

                        <td style={{ padding: "12px 10px", fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                          {tx.to ? (
                            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                              <a href={`/address/${tx.to}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {shortHash(tx.to)}
                              </a>
                              <CopyButton value={tx.to} />
                            </div>
                          ) : "-"}
                        </td>

                        <td style={{ padding: "12px 10px" }}>
                          {tx.nonce ? hexToInt(tx.nonce).toLocaleString() : "0"}
                        </td>

                        <td style={{ padding: "12px 10px" }}>
                          {tx.value ? hexToString(tx.value) : "0"}
                        </td>

                        <td style={{ padding: "12px 10px" }}>
                          {tx.gas ? hexToInt(tx.gas).toLocaleString() : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} style={{ padding: "18px 10px", opacity: 0.78 }}>
                        No transactions found in this block.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
