export default function Landing() {
  return (
    <>
      <head>
        <title>Northbridge Chain</title>
        <meta
          name="description"
          content="Northbridge Chain is an independent Layer-1 blockchain engineered for deterministic finality, security, and long-term infrastructure resilience."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>

      <main className="page">
        <div className="wrap">
          <div className="top">
            <div className="brand">
              <div className="logo" aria-hidden="true" />
              <div className="name">Northbridge Chain</div>
            </div>
            <div className="pill">Launching soon • Mainnet development in progress</div>
          </div>

          <div className="hero">
            <h1>Deterministic infrastructure for the next generation of decentralized systems.</h1>
            <p className="sub">
              Northbridge Chain is an independent Layer-1 blockchain engineered for deterministic finality,
              security, and long-term infrastructure resilience.
            </p>

            <div className="btns">
              <a className="btn primary" href="/whitepaper.html">Whitepaper v0.1</a>
              <a className="btn" href="/spec.md">Technical Spec (v0.1)</a>
              <a className="btn" href="/roadmap.md">Roadmap (v0.1)</a>
              <a className="btn" href="/architecture.md">Architecture (v0.1)</a>
              <a className="btn" href="/demo">Open Demo Dashboard</a>
              <a className="btn" href="mailto:dev@northbridgechain.com">Contact: dev@northbridgechain.com</a>
            </div>

            <div className="grid">
              <div className="card">
                <b>Security-first</b>
                <span>Protocol design optimized for safety, reliability, and long-term stability.</span>
              </div>
              <div className="card">
                <b>Deterministic finality</b>
                <span>Clear settlement guarantees designed for real-world usage and trust.</span>
              </div>
              <div className="card">
                <b>Built to scale</b>
                <span>L1 foundation with a roadmap for layered scaling and ecosystem growth.</span>
              </div>
            </div>
          </div>

          <footer>
            <div>© 2026 Northbridge Chain</div>
            <div>northbridgechain.com</div>
          </footer>
        </div>
      </main>

      <style jsx global>{`
        :root{
          --bg1:#060b1a;
          --bg2:#0b1b3a;
          --txt:#eaf0ff;
          --muted:rgba(234,240,255,.72);
          --card:rgba(255,255,255,.06);
          --border:rgba(255,255,255,.12);
        }
        *{box-sizing:border-box}
        body{
          margin:0;
          font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
          color:var(--txt);
          background: radial-gradient(1200px 700px at 20% 10%, #173a7a 0%, transparent 60%),
                      radial-gradient(1000px 600px at 90% 30%, #1b7aa6 0%, transparent 55%),
                      linear-gradient(180deg,var(--bg1),var(--bg2));
          min-height:100vh;
        }
        .page{
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:32px;
        }
        .wrap{
          width:min(980px,100%);
        }
        .top{
          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:16px;
          margin-bottom:28px;
        }
        .brand{
          display:flex;
          align-items:center;
          gap:12px;
        }
        .logo{
          width:44px;height:44px;border-radius:12px;
          background:linear-gradient(135deg,#2dd4ff,#6366f1);
          box-shadow:0 10px 30px rgba(0,0,0,.35);
        }
        .name{
          font-weight:700;
          letter-spacing:.12em;
          text-transform:uppercase;
          font-size:14px;
          opacity:.9;
        }
        .pill{
          padding:8px 12px;
          border:1px solid var(--border);
          background:rgba(255,255,255,.04);
          border-radius:999px;
          color:var(--muted);
          font-size:13px;
          white-space:nowrap;
        }
        .hero{
          border:1px solid var(--border);
          background:var(--card);
          border-radius:20px;
          padding:34px;
          box-shadow:0 25px 70px rgba(0,0,0,.45);
        }
        h1{
          margin:0 0 10px 0;
          font-size:44px;
          line-height:1.1;
          letter-spacing:-.02em;
        }
        .sub{
          margin:0 0 22px 0;
          font-size:18px;
          line-height:1.6;
          color:var(--muted);
          max-width:70ch;
        }
        .btns{display:flex; gap:12px; flex-wrap:wrap; margin-top:18px;}
        a.btn{
          text-decoration:none;
          color:var(--txt);
          padding:12px 16px;
          border-radius:12px;
          border:1px solid var(--border);
          background:rgba(255,255,255,.05);
          font-weight:600;
          font-size:14px;
        }
        a.btn.primary{
          border:none;
          background:linear-gradient(135deg,#2dd4ff,#6366f1);
          color:#061021;
        }
        .grid{
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
          margin-top:22px;
        }
        .card{
          border:1px solid var(--border);
          background:rgba(0,0,0,.15);
          border-radius:16px;
          padding:16px;
        }
        .card b{display:block; margin-bottom:6px; font-size:14px;}
        .card span{color:var(--muted); font-size:13px; line-height:1.5;}
        footer{
          margin-top:16px;
          color:rgba(234,240,255,.45);
          font-size:12px;
          display:flex;
          justify-content:space-between;
          gap:12px;
          flex-wrap:wrap;
        }
        @media (max-width:820px){
          h1{font-size:36px}
          .grid{grid-template-columns:1fr}
          .hero{padding:22px}
        }
      `}</style>
    </>
  );
}
