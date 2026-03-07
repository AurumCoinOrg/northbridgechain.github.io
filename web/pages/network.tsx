import { useEffect, useState } from "react";
import Head from "next/head";

export default function Network() {
  const [stats, setStats] = useState(null);
  const [gas, setGas] = useState(null);

  useEffect(() => {
    async function load() {
      const [a, b] = await Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/gas").then((r) => r.json()),
      ]);
      setStats(a);
      setGas(b);
    }

    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  if (!stats || !gas) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <>
      <Head>
        <title>Network Stats</title>
      </Head>

      <main style={{ maxWidth: 1000, margin: "40px auto", padding: 20 }}>
        <h1>Network Stats</h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 18,
            marginTop: 30,
          }}
        >
          <div>
            <b>Latest Block</b>
            <div style={{ marginTop: 8 }}>{stats.latestBlock.toLocaleString()}</div>
          </div>

          <div>
            <b>Total NBCX Supply</b>
            <div style={{ marginTop: 8 }}>{stats.totalSupply.toLocaleString()}</div>
          </div>

          <div>
            <b>Avg Gas Used</b>
            <div style={{ marginTop: 8 }}>{gas.avgGasUsed.toLocaleString()}</div>
          </div>

          <div>
            <b>Avg Gas Limit</b>
            <div style={{ marginTop: 8 }}>{gas.avgGasLimit.toLocaleString()}</div>
          </div>

          <div>
            <b>Gas Utilization</b>
            <div style={{ marginTop: 8 }}>{gas.avgUtilizationPct}%</div>
          </div>

          <div>
            <b>Sampled Blocks</b>
            <div style={{ marginTop: 8 }}>{gas.sampledBlocks}</div>
          </div>
        </div>
      </main>
    </>
  );
}
