import {useEffect,useState} from "react";
import Head from "next/head";

function short(x){
  return x.slice(0,8)+"…"+x.slice(-6);
}

export default function RichList(){

  const [holders,setHolders]=useState([]);

  useEffect(()=>{

    fetch("/api/richlist")
      .then(r=>r.json())
      .then(setHolders)
      .catch(()=>{});

  },[]);

  return(
  <>
    <Head>
      <title>NBCX Rich List</title>
    </Head>

    <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>

      <h1>NBCX Rich List</h1>

      <table style={{width:"100%",marginTop:30}}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>
          {holders.map((h,i)=>(
            <tr key={i}>
              <td>{i+1}</td>

              <td>
                <a href={"/address/"+h.addr}>
                  {short(h.addr)}
                </a>
              </td>

              <td>
                {h.balance.toLocaleString()}
              </td>

            </tr>
          ))}
        </tbody>

      </table>

    </main>
  </>
  );
}
