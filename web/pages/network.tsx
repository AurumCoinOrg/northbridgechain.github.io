export default function Network() {
  return (
    <main style={{maxWidth:900,margin:"40px auto",fontFamily:"sans-serif"}}>
      <h1>Northbridge Network</h1>

      <h2>Chain Details</h2>
      <ul>
        <li><b>Chain Name:</b> Northbridge Chain</li>
        <li><b>Symbol:</b> NBC</li>
        <li><b>Chain ID:</b> 9000</li>
        <li><b>RPC:</b> http://89.167.28.12:8545</li>
      </ul>

      <h2>Token</h2>
      <ul>
        <li><b>NBCX:</b> Staking & rewards asset</li>
        <li>Deflationary emissions</li>
      </ul>

      <h2>Consensus</h2>
      <p>Proof-of-Work inspired emissions with governance-controlled distribution and multisig security.</p>

      <a href="/">← Back</a>
    </main>
  )
}
