import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import CopyButton from "../../components/CopyButton";

function short(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

function shortAddr(x: string) {
  return x ? x.slice(0, 6) + "…" + x.slice(-4) : "";
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

function parseMaybeNumber(value: any): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export default function AddressPage() {
  const router = useRouter();
  const { address } = router.query;

  const [balance, setBalance] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);

  useEffect(() => {
    if (!address) return;

    fetch("/api/tokenBalance?address=" + address)
      .then((r) => r.json())
      .then(setBalance)
      .catch(() => {});

    fetch("/api/tokenTransfers?address=" + address)
      .then((r) => r.json())
      .then(setTransfers)
      .catch(() => {});
  }, [address]);

  const normalizedAddress = useMemo(() => String(address || "").toLowerCase(), [address]);

  const normalizedTransfers = useMemo(() => {
    return (Array.isArray(transfers) ? transfers : []).map((t: any, i: number) => {
      const from = String(t?.from || "");
      const to = String(t?.to || "");
      const lowerFrom = from.toLowerCase();
      const lowerTo = to.toLowerCase();

      const direction =
        lowerTo === normalizedAddress ? "Incoming" :
        lowerFrom === normalizedAddress ? "Outgoing" :
        "Other";

      const blockNumber =
        parseMaybeNumber(t?.blockNumber) ??
        parseMaybeNumber(t?.block) ??
        parseMaybeNumber(t?.height);

      const timestamp =
        parseMaybeNumber(t?.timestamp) ??
        parseMaybeNumber(t?.time) ??
        parseMaybeNumber(t?.ts);

      return {
        key: t?.tx || "row-" + i,
        tx: String(t?.tx || ""),
        from,
        to,
        amount: t?.amount ?? "0",
        blockNumber,
        timestamp,
        direction,
      };
    });
  }, [transfers, normalizedAddress]);

  const pageStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: "40px auto",
    padding: 20,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    opacity: 0.72,
    marginBottom: 8,
    letterSpacing: 0.2,
  };

  const cardStyle: React.CSSProperties = {
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.03)",
  };

  const monoBox: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    flexWrap: "wrap",
    padding: "10px 12px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.10)",
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    overflowWrap: "anywhere",
    wordBreak: "break-word",
  };

  const directionStyle = (direction: string): React.CSSProperties => {
    if (direction === "Incoming") {
      return {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(34,197,94,0.16)",
        border: "1px solid rgba(34,197,94,0.40)",
        color: "rgba(220,255,230,0.98)",
      };
    }

    if (direction === "Outgoing") {
      return {
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(239,68,68,0.16)",
        border: "1px solid rgba(239,68,68,0.40)",
        color: "rgba(255,220,220,0.98)",
      };
    }

    return {
      display: "inline-block",
      padding: "4px 10px",
      borderRadius: 999,
      fontSize: 12,
      fontWeight: 700,
      background: "rgba(245,158,11,0.16)",
      border: "1px solid rgba(245,158,11,0.40)",
      color: "rgba(255,242,210,0.98)",
    };
  };

  return (
    <>
      <Head>
        <title>Address {String(address || "")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main style={pageStyle}>
        <h1>Address</h1>

        <div style={cardStyle}>
          <div style={labelStyle}>Wallet Address</div>
          <div style={monoBox}>
            <span>{String(address || "")}</span>
            {address ? <CopyButton value={String(address)} /> : null}
          </div>
        </div>

        {balance && (
          <div style={cardStyle}>
            <div style={labelStyle}>Token Balance</div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
              {balance.balance} NBCX
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <h2 style={{ margin: 0 }}>NBCX Transfers</h2>
          <div style={{ fontSize: 13, opacity: 0.72 }}>
            {normalizedTransfers.length.toLocaleString()} records
          </div>
        </div>

        <div
          style={{
            width: "100%",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
            marginTop: 16,
            borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.10)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Direction</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Tx</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Block</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>From</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>To</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Amount</th>
                <th style={{ textAlign: "left", padding: "12px 10px" }}>Time</th>
              </tr>
            </thead>

            <tbody>
              {normalizedTransfers.length ? (
                normalizedTransfers.map((t) => (
                  <tr key={t.key} style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={directionStyle(t.direction)}>{t.direction}</span>
                    </td>

                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <a href={"/tx/" + t.tx} title={t.tx}>
                          {short(t.tx)}
                        </a>
                        {t.tx ? <CopyButton value={t.tx} /> : null}
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px" }}>
                      {t.blockNumber !== null ? (
                        <a href={"/block/" + t.blockNumber}>{t.blockNumber.toLocaleString()}</a>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <a href={"/address/" + t.from} title={t.from}>
                          {shortAddr(t.from)}
                        </a>
                        {t.from ? <CopyButton value={t.from} /> : null}
                      </div>
                    </td>

                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily:
                          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                      }}
                    >
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <a href={"/address/" + t.to} title={t.to}>
                          {shortAddr(t.to)}
                        </a>
                        {t.to ? <CopyButton value={t.to} /> : null}
                      </div>
                    </td>

                    <td style={{ padding: "12px 10px", fontWeight: 700 }}>{t.amount}</td>

                    <td style={{ padding: "12px 10px" }}>
                      {t.timestamp ? (
                        <div title={new Date(t.timestamp * 1000).toLocaleString()}>
                          <div style={{ fontWeight: 600 }}>{timeAgo(t.timestamp)}</div>
                          <div style={{ marginTop: 2, fontSize: 12, opacity: 0.68 }}>
                            {new Date(t.timestamp * 1000).toLocaleTimeString()}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ padding: "18px 10px", opacity: 0.72 }}>
                    No NBCX transfers found for this address yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
