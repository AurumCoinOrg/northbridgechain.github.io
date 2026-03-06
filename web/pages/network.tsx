import { useEffect,useState } from "react";
import Head from "next/head";

export default function Network(){

  const [stats,setStats] = useState(null);

  useEffect(()=>{

    async function load(){

      const r = await fetch("/api/stats");
      const j = await r.json();

      setStats(j);

    }

    load();

  },[]);

  if(!stats) return <div>Loading...</div>;

  return (
    <>
      <Head>
        <title>Network Stats</title>
      </Head>

      <main style={{maxWidth:900,margin:"40px auto",padding:20}}>

        <h1>Network Stats</h1>

        <div style={{marginTop:30}}>

          <div>
            <b>Latest Block:</b> {stats.latestBlock.toLocaleString()}
          </div>

          <div style={{marginTop:10}}>
            <b>Total NBCX Supply:</b> {stats.totalSupply.toLocaleString()}
          </div>

        </div>

      </main>
    </>
  );

}
