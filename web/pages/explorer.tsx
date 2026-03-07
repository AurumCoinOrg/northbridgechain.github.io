import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import ExplorerSearch from "../components/ExplorerSearch";

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

function shortHash(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
}

function shortAddr(x: string) {
  return x ? x.slice(0, 6) + "…" + x.slice(-4) : "";
}

function formatClock(ts?: number | null) {
  if (!ts) return "-";
  return new Date(ts * 1000).toLocaleTimeString();
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

export default function Explorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [latest, setLatest] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshState, setRefreshState] = useState("Loading...");
  const [err, setErr] = useState("");

  const deadRef = useRef(false);
  const loadingRef = useRef(false);
  const latestSeenRef = useRef<number | null>(null);

  useEffect(() => {
    deadRef.current = false;

    async function load(force = false) {
      if (loadingRef.current) return;

      loadingRef.current = true;
      if (force) setLoading(true);

      try {
        const blk = await rpc("eth_blockNumber", []);
        const latestBlock = parseInt(blk, 16);

        if (!force && latestSeenRef.current === latestBlock) {
          if (!deadRef.current) {
            setRefreshState("No new block yet");
            setLastUpdated(new Date().toLocaleTimeString());
            setErr("");
          }
          return;
        }

        const blockArr: any[] = [];
        const txArr: any[] = [];

        for (let i = 0; i < 10; i++) {
          const num = latestBlock - i;
          if (num < 0) break;

          const b = await rpc("eth_getBlockByNumber", [
            "0x" + num.toString(16),
            true,
          ]);

          if (!b) continue;

          const ts = parseInt(b.timestamp, 16);

          blockArr.push({
            number: num,
            hash: b.hash,
            txCount: Array.isArray(b.transactions) ? b.transactions.length : 0,
            gasUsed: parseInt(b.gasUsed, 16),
            timestamp: ts,
          });

          for (const tx of b.transactions || []) {
            txArr.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              block: num,
              timestamp: ts,
            });
            if (txArr.length >= 12) break;
          }

          if (txArr.length >= 12 && blockArr.length >= 10) break;
        }

        if (deadRef.current) return;

        latestSeenRef.current = latestBlock;
        setLatest(latestBlock);
        setBlocks(blockArr);
        setTxs(txArr.slice(0, 12));
        setLastUpdated(new Date().toLocaleTimeString());
        setRefreshState(force ? "Loaded" : "Updated");
        setErr("");
      } catch (e: any) {
        if (!deadRef.current) {
          setErr(e?.message || "Failed to refresh explorer");
          setRefreshState("Refresh failed");
        }
      } finally {
        loadingRef.current = false;
        if (!deadRef.current) setLoading(false);
      }
    }

    load(true);
    const t = setInterval(() => load(false), 3000);

    return () => {
      deadRef.current = true;
      clearInterval(t);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Explorer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <h1>Explorer</h1>
        <ExplorerSearch />

        <div className="stats">
          <div>Latest Block: {latest.toLocaleString()}</div>
          <div>Auto-refresh: 3s</div>
          <div>Last Check: {lastUpdated || "-"}</div>
          <div>Status: {loading ? "Loading..." : refreshState}</div>
        </div>

        {err ? <div className="errorBox">{err}</div> : null}

        <div className="sections">
          <section>
            <div className="sectionHead">
              <h2>Latest Blocks</h2>
              <div className="subtle">{blocks.length.toLocaleString()} rows</div>
            </div>

            <div className="scroller">
              <table className="gridTable">
                <thead>
                  <tr>
                    <th>Block</th>
                    <th>Hash</th>
                    <th>Tx Count</th>
                    <th>Gas Used</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {blocks.length ? (
                    blocks.map((b, i) => (
                      <tr key={i}>
                        <td>
                          <a href={`/block/${b.number}`}>{b.number.toLocaleString()}</a>
                        </td>
                        <td className="mono">
                          <a href={`/block/${b.number}`} title={b.hash}>{shortHash(b.hash)}</a>
                        </td>
                        <td>{b.txCount}</td>
                        <td>{b.gasUsed.toLocaleString()}</td>
                        <td title={formatClock(b.timestamp)}>
                          <div className="timePrimary">{timeAgo(b.timestamp)}</div>
                          <div className="timeSecondary">{formatClock(b.timestamp)}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="emptyRow">
                        {loading ? "Loading blocks..." : "No blocks found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div className="sectionHead">
              <h2>Latest Transactions</h2>
              <div className="subtle">{txs.length.toLocaleString()} rows</div>
            </div>

            <div className="scroller">
              <table className="gridTable">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>Block</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.length ? (
                    txs.map((tx, i) => (
                      <tr key={i}>
                        <td className="mono">
                          <a href={`/tx/${tx.hash}`} title={tx.hash}>{shortHash(tx.hash)}</a>
                        </td>
                        <td>
                          <a href={`/block/${tx.block}`}>{Number(tx.block).toLocaleString()}</a>
                        </td>
                        <td className="mono">
                          <a href={`/address/${tx.from}`} title={tx.from}>{shortAddr(tx.from)}</a>
                        </td>
                        <td className="mono">
                          {tx.to ? (
                            <a href={`/address/${tx.to}`} title={tx.to}>{shortAddr(tx.to)}</a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td title={formatClock(tx.timestamp)}>
                          <div className="timePrimary">{timeAgo(tx.timestamp)}</div>
                          <div className="timeSecondary">{formatClock(tx.timestamp)}</div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="emptyRow">
                        {loading ? "Loading transactions..." : "No transactions found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <style jsx>{`
          .page {
            max-width: 1100px;
            margin: 40px auto;
            padding: 20px;
          }
          .stats {
            margin-top: 12px;
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
          }
          .errorBox {
            margin-top: 16px;
            padding: 12px 14px;
            border-radius: 12px;
            background: rgba(239, 68, 68, 0.12);
            border: 1px solid rgba(239, 68, 68, 0.28);
            color: rgba(255, 220, 220, 0.98);
          }
          .sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
          }
          .sectionHead {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }
          .subtle {
            font-size: 13px;
            opacity: 0.72;
          }
          .scroller {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .gridTable {
            width: 100%;
            min-width: 700px;
            margin-top: 16px;
            border-collapse: collapse;
            table-layout: auto;
          }
          .gridTable th,
          .gridTable td {
            text-align: left;
            padding: 10px 8px;
            white-space: nowrap;
            vertical-align: top;
          }
          .gridTable tr {
            border-top: 1px solid rgba(255,255,255,0.08);
          }
          .mono {
            font-family: monospace;
          }
          .gridTable a {
            text-decoration: none;
            color: inherit;
          }
          .timePrimary {
            font-weight: 600;
            line-height: 1.15;
          }
          .timeSecondary {
            margin-top: 2px;
            font-size: 12px;
            opacity: 0.68;
            line-height: 1.15;
          }
          .emptyRow {
            opacity: 0.78;
            padding: 18px 8px !important;
          }

          @media (max-width: 900px) {
            .sections {
              grid-template-columns: 1fr;
              gap: 28px;
            }
          }

          @media (max-width: 640px) {
            .page {
              padding: 16px;
              margin: 24px auto;
            }
            h1 {
              font-size: 48px;
              line-height: 1.05;
              margin-bottom: 8px;
            }
            h2 {
              font-size: 26px;
              line-height: 1.15;
              margin: 0;
            }
            .stats {
              gap: 12px;
              flex-direction: column;
              align-items: flex-start;
            }
            .gridTable {
              min-width: 620px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
