import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

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

function hexToInt(h: string) {
  return parseInt(h, 16);
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

  return (
    <>
      <Head>
        <title>Transaction</title>
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
              <div style={codeBox}>{tx?.hash || receipt?.transactionHash || "-"}</div>
            </div>

            <div>
              <div style={labelStyle}>From</div>
              <div style={codeBox}>
                {tx?.from ? <a href={`/address/${tx.from}`}>{tx.from}</a> : "-"}
              </div>
            </div>

            <div>
              <div style={labelStyle}>To</div>
              <div style={codeBox}>
                {tx?.to ? (
                  <a href={`/address/${tx.to}`}>{tx.to}</a>
                ) : receipt?.to ? (
                  <a href={`/address/${receipt.to}`}>{receipt.to}</a>
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
                <div style={labelStyle}>Nonce</div>
                <div style={valueStyle}>
                  {tx?.nonce ? hexToInt(tx.nonce).toLocaleString() : tx?.nonce === "0x0" ? "0" : "-"}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </>
  );
}
