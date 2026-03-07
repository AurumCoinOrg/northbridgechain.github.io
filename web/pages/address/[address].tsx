import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";

function short(x){
  return x ? x.slice(0,10)+"…"+x.slice(-8) : "";
}

export default function AddressPage(){

  const router = useRouter();
  const { address } = router.query;

  const [balance,setBalance] = useState(null);
  const [transfers,setTransfers] = useState([]);

  useEffect(()=>{

    if(!address) return;

    fetch("/api/tokenBalance?address="+address)
      .then(r=>r.json())
      .then(setBalance)
      .catch(()=>{});

    fetch("/api/tokenTransfers?address="+address)
      .then(r=>r.json())
      .then(setTransfers)
      .catch(()=>{});

  },[address]);

  return (
  <>
    <Head>
      <title>Address {address}</title>
    </Head>

    <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>

      <h1>Address</h1>

      <div style={{fontFamily:"monospace"}}>
        {address}
      </div>

      {balance && (
        <>
          <h2>Token Balance</h2>
          <div>{balance.balance} NBCX</div>
        </>
      )}

      <h2 style={{marginTop:40}}>NBCX Transfers</h2>

      <table style={{width:"100%",marginTop:20}}>
        <thead>
          <tr>
            <th>Tx</th>
            <th>From</th>
            <th>To</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {transfers.map((t,i)=>(
            <tr key={i}>
              <td>
                <a href={"/tx/"+t.tx}>
                  {short(t.tx)}
                </a>
              </td>

              <td>
                <a href={"/address/"+t.from}>
                  {short(t.from)}
                </a>
              </td>

              <td>
                <a href={"/address/"+t.to}>
                  {short(t.to)}
                </a>
              </td>

              <td>{t.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </main>
  </>
  );
}
