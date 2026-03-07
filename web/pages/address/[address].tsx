import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import CopyButton from "../../components/CopyButton";

function short(x: string) {
  return x ? x.slice(0, 10) + "…" + x.slice(-8) : "";
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

  return (
    <>
      <Head>
        <title>Address {String(address || "")}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="page">
        <h1>Address</h1>

        <div className="addressCard">
          <div className="label">Wallet Address</div>
          <div className="addressBox">
            <span className="mono fullAddress">{String(address || "")}</span>
            {address ? <CopyButton value={String(address)} /> : null}
          </div>
        </div>

        {balance && (
          <div className="balanceCard">
            <div className="label">Token Balance</div>
            <div className="balanceValue">{balance.balance} NBCX</div>
          </div>
        )}

        <div className="sectionHead">
          <h2>NBCX Transfers</h2>
          <div className="transferCount">{transfers.length.toLocaleString()} records</div>
        </div>

        <div className="scroller">
          <table className="gridTable">
            <thead>
              <tr>
                <th>Tx</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {transfers.length ? (
                transfers.map((t, i) => (
                  <tr key={i}>
                    <td className="mono">
                      <a href={"/tx/" + t.tx} title={t.tx}>
                        {short(t.tx)}
                      </a>
                      {t.tx ? <CopyButton value={t.tx} /> : null}
                    </td>

                    <td className="mono">
                      <a href={"/address/" + t.from} title={t.from}>
                        {short(t.from)}
                      </a>
                      {t.from ? <CopyButton value={t.from} /> : null}
                    </td>

                    <td className="mono">
                      <a href={"/address/" + t.to} title={t.to}>
                        {short(t.to)}
                      </a>
                      {t.to ? <CopyButton value={t.to} /> : null}
                    </td>

                    <td className="amountCell">{t.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="emptyCell">No NBCX transfers found for this address yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <style jsx>{`
          .page {
            max-width: 1100px;
            margin: 40px auto;
            padding: 20px;
          }

          .label {
            font-size: 13px;
            opacity: 0.72;
            margin-bottom: 8px;
            letter-spacing: 0.2px;
          }

          .addressCard,
          .balanceCard {
            margin-top: 18px;
            padding: 18px;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.03);
          }

          .addressBox {
            display: flex;
            align-items: flex-start;
            gap: 8px;
            flex-wrap: wrap;
          }

          .fullAddress {
            display: inline-block;
            padding: 10px 12px;
            border-radius: 12px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.10);
            overflow-wrap: anywhere;
            word-break: break-word;
          }

          .balanceValue {
            font-size: 28px;
            font-weight: 800;
            line-height: 1.1;
          }

          .sectionHead {
            margin-top: 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
          }

          .transferCount {
            font-size: 13px;
            opacity: 0.72;
          }

          .scroller {
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin-top: 16px;
          }

          .gridTable {
            width: 100%;
            min-width: 720px;
            border-collapse: collapse;
          }

          .gridTable th,
          .gridTable td {
            text-align: left;
            padding: 12px 10px;
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

          .gridTable a {
            color: inherit;
            text-decoration: none;
          }

          .mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
          }

          .amountCell {
            font-weight: 700;
          }

          .emptyCell {
            opacity: 0.72;
            padding: 18px 10px;
          }

          @media (max-width: 640px) {
            .page {
              padding: 16px;
              margin: 24px auto;
            }

            h1 {
              font-size: 42px;
              line-height: 1.05;
              margin-bottom: 6px;
            }

            h2 {
              font-size: 26px;
              line-height: 1.1;
              margin: 0;
            }

            .balanceValue {
              font-size: 24px;
            }

            .gridTable {
              min-width: 640px;
            }
          }
        `}</style>
      </main>
    </>
  );
}
