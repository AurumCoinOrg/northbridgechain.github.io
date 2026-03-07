import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import CopyButton from "../../components/CopyButton";

const RPC = "/api/rpc";

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

function normalizeReceiptStatus(status: unknown): "success" | "failed" | "pending" {
  if (status === null || status === undefined) return "pending";

  if (typeof status === "number") {
    if (status === 1) return "success";
    if (status === 0) return "failed";
    return "pending";
  }

  if (typeof status === "string") {
    const s = status.trim().toLowerCase();
    if (s === "0x1" || s === "1") return "success";
    if (s === "0x0" || s === "0") return "failed";
    return "pending";
  }

  return "pending";
}

function shortHash(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

export default function TxPage() {
  const router = useRouter();
  const { hash } = router.query;

  const [tx, setTx] = useState<any | null>(null);
  const [receipt, setReceipt] = useState<any | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !hash) return;

    async function load() {
      try {
        setErr("");
        const h = String(hash);
        if (!/^0x[0-9a-fA-F]{64}$/.test(h)) {
          throw new Error("Invalid transaction hash");
        }

        const t = await rpc("eth_getTransactionByHash", [h]);
        const r = await rpc("eth_getTransactionReceipt", [h]);

        if (!t && !r) throw new Error("Transaction not found");

        setTx(t);
        setReceipt(r);
      } catch (e: any) {
        setErr(e?.message || "Failed to load transaction");
      }
    }

    load();
  }, [router.isReady, hash]);

  const status = useMemo(() => normalizeReceiptStatus(receipt?.status), [receipt]);

  const statusText =
    status === "success" ? "Success" :
    status === "failed" ? "Failed" :
    "Pending";

  const statusStyle =
    status === "success"
      ? {
          background: "rgba(34,197,94,0.16)",
          border: "1px solid rgba(34,197,94,0.40)",
          color: "rgba(220,255,230,0.98)",
        }
      : status === "failed"
      ? {
          background: "rgba(239,68,68,0.16)",
          border: "1px solid rgba(239,68,68,0.40)",
          color: "rgba(255,220,220,0.98)",
        }
      : {
          background: "rgba(245,158,11,0.16)",
          border: "1px solid rgba(245,158,11,0.40)",
          color: "rgba(255,242,210,0.98)",
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

  const cardStyle: React.CSSProperties = {
    marginTop: 20,
    display: "grid",
    gap: 14,
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

  const valueStyle: React.CSSProperties = {
    fontSize: 16,
  };

  const logs = Array.isArray(receipt?.logs) ? receipt.logs : [];

  return (
    <>
      <Head>
        <title>Transaction</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
        <h1>Transaction</h1>

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

        {tx || receipt ? (
          <>
            <div style={cardStyle}>
              <div>
                <div style={labelStyle}>Status</div>
                <span
                  style={{
                    display: "inline-block",
                    padding: "6px 12px",
                    borderRadius: 999,
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 0.3,
                    ...statusStyle,
                  }}
                >
                  {statusText}
                </span>
              </div>

              <div>
                <div style={labelStyle}>Hash</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <span>{tx?.hash || receipt?.transactionHash || "-"}</span>
                  {tx?.hash || receipt?.transactionHash ? (
                    <CopyButton value={tx?.hash || receipt?.transactionHash} />
                  ) : null}
                </div>
              </div>

              <div>
                <div style={labelStyle}>From</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {tx?.from ? (
                    <>
                      <a href={`/address/${tx.from}`}>{tx.from}</a>
                      <CopyButton value={tx.from} />
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div>
                <div style={labelStyle}>To</div>
                <div style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                  {tx?.to ? (
                    <>
                      <a href={`/address/${tx.to}`}>{tx.to}</a>
                      <CopyButton value={tx.to} />
                    </>
                  ) : receipt?.to ? (
                    <>
                      <a href={`/address/${receipt.to}`}>{receipt.to}</a>
                      <CopyButton value={receipt.to} />
                    </>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <div>
                  <div style={labelStyle}>Block</div>
                  <div style={valueStyle}>
                    {tx?.blockNumber ? (
                      <a href={`/block/${hexToInt(tx.blockNumber)}`}>
                        {hexToInt(tx.blockNumber).toLocaleString()}
                      </a>
                    ) : (
                      "-"
                    )}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Gas Used</div>
                  <div style={valueStyle}>
                    {receipt?.gasUsed ? hexToInt(receipt.gasUsed).toLocaleString() : "-"}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Gas Limit</div>
                  <div style={valueStyle}>
                    {tx?.gas ? hexToInt(tx.gas).toLocaleString() : "-"}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Gas Price</div>
                  <div style={valueStyle}>
                    {tx?.gasPrice ? hexToString(tx.gasPrice) : "-"}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Nonce</div>
                  <div style={valueStyle}>
                    {tx?.nonce ? hexToInt(tx.nonce).toLocaleString() : tx?.nonce === "0x0" ? "0" : "-"}
                  </div>
                </div>

                <div>
                  <div style={labelStyle}>Logs</div>
                  <div style={valueStyle}>{logs.length.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 34, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <h2 style={{ margin: 0 }}>Receipt Logs</h2>
              <div style={{ fontSize: 13, opacity: 0.72 }}>{logs.length.toLocaleString()} entries</div>
            </div>

            {logs.length ? (
              <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
                {logs.map((log: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.10)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ fontWeight: 700 }}>Log #{i}</div>
                      <div style={{ fontSize: 13, opacity: 0.72 }}>
                        Index: {log?.logIndex ? hexToInt(log.logIndex) : 0}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={labelStyle}>Address</div>
                      <div style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        {log?.address ? (
                          <>
                            <a href={`/address/${log.address}`}>{log.address}</a>
                            <CopyButton value={log.address} />
                          </>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={labelStyle}>Topics</div>
                      {Array.isArray(log?.topics) && log.topics.length ? (
                        <div style={{ display: "grid", gap: 8 }}>
                          {log.topics.map((topic: string, idx: number) => (
                            <div key={idx} style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginTop: 0 }}>
                              <span style={{ minWidth: 68, opacity: 0.72 }}>Topic {idx}</span>
                              <span>{topic}</span>
                              <CopyButton value={topic} />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={codeBox}>-</div>
                      )}
                    </div>

                    <div style={{ marginTop: 12 }}>
                      <div style={labelStyle}>Data</div>
                      <div style={{ ...codeBox, display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <span>{log?.data || "0x"}</span>
                        {log?.data ? <CopyButton value={log.data} /> : null}
                      </div>
                    </div>

                    <div style={{ marginTop: 12, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                      <div>
                        <div style={labelStyle}>Block Number</div>
                        <div style={valueStyle}>
                          {log?.blockNumber ? hexToInt(log.blockNumber).toLocaleString() : "-"}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Tx Hash</div>
                        <div style={valueStyle}>
                          {log?.transactionHash ? shortHash(log.transactionHash) : "-"}
                        </div>
                      </div>

                      <div>
                        <div style={labelStyle}>Removed</div>
                        <div style={valueStyle}>{String(Boolean(log?.removed))}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  marginTop: 16,
                  padding: 18,
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.10)",
                  background: "rgba(255,255,255,0.03)",
                  opacity: 0.8,
                }}
              >
                No logs found for this transaction.
              </div>
            )}
          </>
        ) : null}
      </main>
    </>
  );
}
