import Head from "next/head"

export default function Home() {
  return (
    <>
      <Head>
        <title>Northbridge Chain Explorer</title>
      </Head>

      <main style={wrap}>

        <section style={hero}>
          <div style={heroInner}>
            <h1 style={title}>
              Northbridge Blockchain Explorer
            </h1>

            <p style={subtitle}>
              Search blocks, transactions, addresses, tokens and DEX markets.
            </p>

            <div style={searchWrap}>
              <input
                placeholder="Search by Address / Tx Hash / Block / Token"
                style={searchInput}
              />
              <button style={searchButton}>
                Search
              </button>
            </div>
          </div>
        </section>


        <section style={stats}>
          <Stat label="Network" value="Northbridge Testnet"/>
          <Stat label="DEX Pools" value="1"/>
          <Stat label="Tokens" value="1"/>
          <Stat label="Transactions" value="4"/>
        </section>


        <section style={grid}>

          <div style={panel}>
            <h3>Latest Blocks</h3>
            <p>Block explorer data will appear here.</p>
          </div>

          <div style={panel}>
            <h3>Latest Transactions</h3>
            <p>Recent network activity will appear here.</p>
          </div>

          <div style={panel}>
            <h3>Top Tokens</h3>
            <p>Token statistics will appear here.</p>
          </div>

          <div style={panel}>
            <h3>DEX Markets</h3>
            <p>Trading pairs and liquidity.</p>
          </div>

        </section>

      </main>
    </>
  )
}

function Stat({label,value}:{label:string,value:string}){
  return(
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  )
}

const wrap:React.CSSProperties={
  maxWidth:1200,
  margin:"40px auto",
  padding:20
}

const hero:React.CSSProperties={
  marginBottom:40
}

const heroInner:React.CSSProperties={
  maxWidth:900
}

const title:React.CSSProperties={
  fontSize:44,
  fontWeight:800,
  marginBottom:12
}

const subtitle:React.CSSProperties={
  opacity:.7,
  marginBottom:24
}

const searchWrap:React.CSSProperties={
  display:"flex",
  gap:10
}

const searchInput:React.CSSProperties={
  flex:1,
  padding:"14px 16px",
  borderRadius:12,
  border:"1px solid rgba(255,255,255,.15)",
  background:"rgba(255,255,255,.05)",
  color:"white"
}

const searchButton:React.CSSProperties={
  padding:"14px 22px",
  borderRadius:12,
  border:"none",
  background:"#3b82f6",
  color:"white",
  fontWeight:700,
  cursor:"pointer"
}

const stats:React.CSSProperties={
  display:"grid",
  gridTemplateColumns:"repeat(4,1fr)",
  gap:16,
  marginBottom:40
}

const statCard:React.CSSProperties={
  padding:20,
  borderRadius:16,
  border:"1px solid rgba(255,255,255,.1)",
  background:"rgba(255,255,255,.04)"
}

const statLabel:React.CSSProperties={
  fontSize:12,
  opacity:.6
}

const statValue:React.CSSProperties={
  fontSize:24,
  fontWeight:700
}

const grid:React.CSSProperties={
  display:"grid",
  gridTemplateColumns:"repeat(2,1fr)",
  gap:20
}

const panel:React.CSSProperties={
  padding:20,
  borderRadius:16,
  border:"1px solid rgba(255,255,255,.1)",
  background:"rgba(255,255,255,.04)"
}
