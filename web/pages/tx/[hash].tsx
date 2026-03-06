import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const RPC = "/api/rpc";

async function rpc(method:string,params:any[]=[]){
  const r = await fetch(RPC,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify({jsonrpc:"2.0",id:1,method,params})
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message || "RPC error");
  return j.result;
}

function hexToInt(h:string){
  return parseInt(h,16);
}

export default function TxPage() {
  const router = useRouter();
  const { hash } = router.query;

  const [tx,setTx] = useState<any|null>(null);
  const [receipt,setReceipt] = useState<any|null>(null);
  const [err,setErr] = useState("");

  useEffect(() => {
    if (!router.isReady || !hash) return;

    async function load(){
      try{
        setErr("");
        const h = String(hash);
        if (!/^0x[0-9a-fA-F]{64}$/.test(h)) throw new Error("Invalid transaction hash");

        const t = await rpc("eth_getTransactionByHash",[h]);
        const r = await rpc("eth_getTransactionReceipt",[h]);

        if (!t && !r) throw new Error("Transaction not found");

        setTx(t);
        setReceipt(r);
      }catch(e:any){
        setErr(e?.message || "Failed to load transaction");
      }
    }

    load();
  }, [router.isReady, hash]);

  return (
    <>
      <Head><title>Transaction</title></Head>
      <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
        <h1>Transaction</h1>

        {err ? <div style={{marginTop:16,color:"rgba(255,120,120,0.95)"}}>{err}</div> : null}

        {(tx || receipt) ? (
          <div style={{marginTop:20,display:"grid",gap:10}}>
            <div><b>Hash:</b> <span style={{fontFamily:"monospace"}}>{tx?.hash || receipt?.transactionHash}</span></div>
            <div><b>Status:</b> {receipt?.status === "0x1" ? "Success" : receipt ? "Failed" : "Pending"}</div>
            <div><b>From:</b> {tx?.from ? <a href={`/address/${tx.from}`}>{tx.from}</a> : "-"}</div>
            <div><b>To:</b> {tx?.to ? <a href={`/address/${tx.to}`}>{tx.to}</a> : (receipt?.to ? <a href={`/address/${receipt.to}`}>{receipt.to}</a> : "-")}</div>
            <div><b>Block:</b> {tx?.blockNumber ? <a href={`/block/${hexToInt(tx.blockNumber)}`}>{hexToInt(tx.blockNumber).toLocaleString()}</a> : "-"}</div>
            <div><b>Gas Used:</b> {receipt?.gasUsed ? hexToInt(receipt.gasUsed).toLocaleString() : "-"}</div>
            <div><b>Nonce:</b> {tx?.nonce ? hexToInt(tx.nonce).toLocaleString() : tx?.nonce === "0x0" ? "0" : "-"}</div>
          </div>
        ) : null}
      </main>
    </>
  );
}
