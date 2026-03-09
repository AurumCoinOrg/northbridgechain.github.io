import Head from "next/head";
import { useEffect, useState } from "react";
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

function formatClock(ts: number) {
  return new Date(ts * 1000).toLocaleTimeString();
}

function timeAgo(ts: number) {
  const now = Math.floor(Date.now() / 1000);
  const diff = Math.max(0, now - ts);

  if (diff < 5) return "just now";
  if (diff < 60) return `${diff}s ago`;

  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function Explorer() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [txs, setTxs] = useState<any[]>([]);
  const [latest, setLatest] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let dead = false;

    async function load() {
      try {
        const blk = await rpc("eth_blockNumber", []);
        const latestBlock = parseInt(blk, 16);

        const blockArr = [];
        const txArr = [];

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
            txCount: b.transactions.length,
            gasUsed: parseInt(b.gasUsed, 16),
            timestamp: ts,
          });

          for (const tx of b.transactions) {
            txArr.push({
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              block: num,
              timestamp: ts,
            });
            if (txArr.length >= 12) break;
          }
        }

        if (dead) return;
        setLatest(latestBlock);
        setBlocks(blockArr);
        setTxs(txArr.slice(0, 12));
        setLastUpdated(new Date().toLocaleTimeString());
      } catch {}
    }

    load();
    const t = setInterval(load, 3000);
    return () => {
      dead = true;
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
          <div>Last Updated: {lastUpdated}</div>
        </div>

        <div className="sections">
          <section>
            <h2>Latest Blocks</h2>
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
                  {blocks.map((b, i) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2>Latest Transactions</h2>
            <div className="scroller">
              <table className="gridTable">
                <thead>
                  <tr>
                    <th>Hash</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txs.map((tx, i) => (
                    <tr key={i}>
                      <td className="mono">
                        <a href={`/tx/${tx.hash}`} title={tx.hash}>{shortHash(tx.hash)}</a>
                      </td>
                      <td className="mono">
                        <a href={`/address/${tx.from}`} title={tx.from}>{shortAddr(tx.from)}</a>
                      </td>
                      <td className="mono">
                        {tx.to ? <a href={`/address/${tx.to}`} title={tx.to}>{shortAddr(tx.to)}</a> : "-"}
                      </td>
                      <td title={formatClock(tx.timestamp)}>
                        <div className="timePrimary">{timeAgo(tx.timestamp)}</div>
                        <div className="timeSecondary">{formatClock(tx.timestamp)}</div>
                      </td>
                    </tr>
                  ))}
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
          .sections {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
          }
          .scroller {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          .gridTable {
            width: 100%;
            min-width: 640px;
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
            transition: background 0.16s ease;
          }
          .gridTable tbody tr:hover {
            background: rgba(255,255,255,0.04);
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
              min-width: 560px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
