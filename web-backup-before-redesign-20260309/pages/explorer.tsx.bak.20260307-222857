import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import ExplorerSearch from "../components/ExplorerSearch";
import { PUBLIC_RPC } from "../lib/publicRpc";

const RPC = PUBLIC_RPC;
const NBCX = "0x09fbf5662DbF33B0ea3D56a3Fdc8cD1936c3c196";
const ERC20_TRANSFER_TOPIC =
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
  const [liveTxs, setLiveTxs] = useState<any[]>([]);
  const [latest, setLatest] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshState, setRefreshState] = useState("Loading...");
  const [err, setErr] = useState("");

  const deadRef = useRef(false);
  const loadingRef = useRef(false);
  const latestSeenRef = useRef<number | null>(null);
  const txSeenRef = useRef<Set<string>>(new Set());

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
            setRefreshState("Watching for new blocks");
            setLastUpdated(new Date().toLocaleTimeString());
            setErr("");
          }
          return;
        }

        const blockArr: any[] = [];
        const txArr: any[] = [];
        const newLive: any[] = [];

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

            let status = "pending";
            let value = "0";
            let tokenTransferCount = 0;
            let tokenContract = "";

            try {
              const receipt = await rpc("eth_getTransactionReceipt",[tx.hash]);
              if(receipt && receipt.status){
                status = receipt.status === "0x1" ? "success" : "failed";
              }

              const logs = Array.isArray(receipt?.logs) ? receipt.logs : [];
              const tokenLogs = logs.filter((log:any) => {
                const firstTopic =
                  Array.isArray(log?.topics) && log.topics.length
                    ? String(log.topics[0]).toLowerCase()
                    : "";
                return firstTopic === ERC20_TRANSFER_TOPIC;
              });

              tokenTransferCount = tokenLogs.length;
              tokenContract = tokenLogs[0]?.address || "";
            } catch {}

            try{
              value = (BigInt(tx.value || "0x0")/1000000000000000000n).toString();
            }catch{}

            const item = {
              hash: tx.hash,
              from: tx.from,
              to: tx.to,
              block: num,
              timestamp: ts,
              fresh: false,
              status,
              value,
              tokenTransferCount,
              tokenContract
            };

            txArr.push(item);

            if (!txSeenRef.current.has(tx.hash)) {
              txSeenRef.current.add(tx.hash);
              newLive.push({
                ...item,
                fresh: true,
              });
            }

            if (txArr.length >= 12) break;
          }

          if (txArr.length >= 12 && blockArr.length >= 10) break;
        }

        if (deadRef.current) return;

        if (force && txSeenRef.current.size === 0) {
          for (const tx of txArr) {
            txSeenRef.current.add(tx.hash);
          }
          newLive.length = 0;
        }

        latestSeenRef.current = latestBlock;
        setLatest(latestBlock);
        setBlocks(blockArr);
        setTxs(txArr.slice(0, 12));

        if (newLive.length) {
          setLiveTxs((prev) => [...newLive.reverse(), ...prev].slice(0, 20));
          setRefreshState(`New activity: ${newLive.length} tx`);
        } else {
          setRefreshState(force ? "Loaded" : "Updated");
        }

        setLastUpdated(new Date().toLocaleTimeString());
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
    const t = setInterval(() => load(false), 1000);

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

        <div className="quickLinks">
          <a className="quickCard" href={latest > 0 ? `/block/${latest}` : "/explorer"}>
            <div className="quickTitle">Blocks</div>
            <div className="quickText">
              Latest block {latest > 0 ? latest.toLocaleString() : "loading"}
            </div>
          </a>

          <a className="quickCard" href={txs[0]?.hash ? `/tx/${txs[0].hash}` : "/explorer"}>
            <div className="quickTitle">Transactions</div>
            <div className="quickText">
              Jump to latest tx
            </div>
          </a>

          <a className="quickCard" href={txs[0]?.from ? `/address/${txs[0].from}` : "/explorer"}>
            <div className="quickTitle">Addresses</div>
            <div className="quickText">
              Open latest active wallet
            </div>
          </a>

          <a className="quickCard" href="/tokens">
            <div className="quickTitle">Tokens</div>
            <div className="quickText">
              View token registry
            </div>
          </a>

          <a className="quickCard" href={`/token/${NBCX}`}>
            <div className="quickTitle">NBCX</div>
            <div className="quickText">
              Token overview page
            </div>
          </a>
        </div>

        <div className="stats">
          <div>Latest Block: {latest.toLocaleString()}</div>
          <div>Live Poll: 1s</div>
          <div>Last Check: {lastUpdated || "-"}</div>
          <div>Status: {loading ? "Loading..." : refreshState}</div>
        </div>

        {err ? <div className="errorBox">{err}</div> : null}

        <section className="liveSection">
          <div className="sectionHead">
            <h2>Live Transactions</h2>
            <div className="subtle">{liveTxs.length.toLocaleString()} recent events</div>
          </div>

          <div className="liveFeed">
            {liveTxs.length ? (
              liveTxs.map((tx, i) => (
                <a className={"liveItem" + (tx.fresh ? " liveFresh" : "")} key={tx.hash + ":" + i} href={`/tx/${tx.hash}`}>
                  <div className="liveRow">
                    <span className="liveBadge">NEW</span>
                    <span className="mono">{shortHash(tx.hash)}</span>
                    <span className="subtle">block {Number(tx.block).toLocaleString()}</span>
                  </div>
                  <div className="liveMeta">
                    <span className={"statusPill " + (tx.status === "success" ? "statusSuccess" : tx.status === "failed" ? "statusFailed" : "statusPending")}>
                      {tx.status}
                    </span>
                    {tx.tokenTransferCount ? (
                      <span className="tokenPill">
                        TOKEN {tx.tokenTransferCount}
                      </span>
                    ) : null}
                    <span className="mono">{shortAddr(tx.from)}</span>
                    <span>→</span>
                    <span className="mono">{tx.to ? shortAddr(tx.to) : "-"}</span>
                    <span className="subtle">{tx.value} NBC</span>
                    {tx.tokenContract ? (
                      <a className="tokenLink" href={`/token/${tx.tokenContract}`} title={tx.tokenContract}>
                        {shortAddr(tx.tokenContract)}
                      </a>
                    ) : null}
                    <span className="subtle">{timeAgo(tx.timestamp)}</span>
                  </div>
                </a>
              ))
            ) : (
              <div className="liveEmpty">
                {loading ? "Waiting for chain activity..." : "No new transactions captured yet."}
              </div>
            )}
          </div>
        </section>

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
          .quickLinks {
            margin-top: 18px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 14px;
          }
          .quickCard {
            display: block;
            padding: 16px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.04);
            text-decoration: none;
            color: inherit;
          }
          .quickTitle {
            font-size: 18px;
            font-weight: 800;
            line-height: 1.1;
          }
          .quickText {
            margin-top: 8px;
            font-size: 13px;
            opacity: 0.74;
            line-height: 1.35;
          }
          .stats {
            margin-top: 18px;
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
          .liveSection {
            margin-top: 34px;
          }
          .liveFeed {
            margin-top: 16px;
            display: grid;
            gap: 10px;
          }
          .liveItem {
            display: block;
            padding: 14px 16px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.03);
            text-decoration: none;
            color: inherit;
          }
          .liveFresh {
            border-color: rgba(59,130,246,0.35);
            background: rgba(59,130,246,0.08);
          }
          .liveRow {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
          }
          .liveMeta {
            margin-top: 6px;
            display: flex;
            gap: 8px;
            align-items: center;
            flex-wrap: wrap;
            font-size: 13px;
            opacity: 0.82;
          }
          .statusPill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.35px;
            text-transform: uppercase;
          }
          .statusSuccess {
            background: rgba(34,197,94,0.16);
            border: 1px solid rgba(34,197,94,0.40);
            color: rgba(220,255,230,0.98);
          }
          .statusFailed {
            background: rgba(239,68,68,0.16);
            border: 1px solid rgba(239,68,68,0.40);
            color: rgba(255,220,220,0.98);
          }
          .statusPending {
            background: rgba(245,158,11,0.16);
            border: 1px solid rgba(245,158,11,0.40);
            color: rgba(255,242,210,0.98);
          }
          .tokenPill {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.35px;
            text-transform: uppercase;
            background: rgba(59,130,246,0.16);
            border: 1px solid rgba(59,130,246,0.40);
            color: rgba(220,235,255,0.98);
          }
          .tokenLink {
            text-decoration: none;
            color: inherit;
            font-family: monospace;
            opacity: 0.88;
          }
          .liveBadge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 999px;
            background: rgba(34,197,94,0.16);
            border: 1px solid rgba(34,197,94,0.40);
            color: rgba(220,255,230,0.98);
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.4px;
          }
          .liveEmpty {
            padding: 18px 16px;
            border-radius: 16px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.03);
            opacity: 0.78;
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
