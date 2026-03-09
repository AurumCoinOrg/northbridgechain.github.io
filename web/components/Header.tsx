import Link from "next/link"

export default function Header(){

  return (
    <header style={header}>

      {/* Utility Bar */}
      <div style={utility}>
        <div>Northbridge Testnet</div>
        <div style={{opacity:.6}}>Gas: 0.01 NBCX</div>
        <div>Wallet</div>
      </div>

      {/* Main Nav */}
      <div style={mainNav}>

        <div style={logo}>
          <Link href="/" style={{textDecoration:"none",color:"white"}}>
            Northbridge
          </Link>
        </div>

        <nav style={navLinks}>
          <Link href="/explorer">Explorer</Link>
          <Link href="/tokens">Tokens</Link>
          <Link href="/contracts">Contracts</Link>
          <Link href="/dex">DEX</Link>
          <Link href="/markets">Markets</Link>
          <Link href="/analytics">Analytics</Link>
        </nav>

      </div>

    </header>
  )
}

const header:React.CSSProperties={
  borderBottom:"1px solid rgba(255,255,255,.08)"
}

const utility:React.CSSProperties={
  display:"flex",
  justifyContent:"space-between",
  padding:"6px 20px",
  fontSize:12,
  opacity:.7
}

const mainNav:React.CSSProperties={
  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",
  padding:"16px 20px"
}

const logo:React.CSSProperties={
  fontWeight:800,
  fontSize:22
}

const navLinks:React.CSSProperties={
  display:"flex",
  gap:24,
  fontSize:15
}
