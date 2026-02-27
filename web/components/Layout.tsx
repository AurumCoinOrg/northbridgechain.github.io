import Link from "next/link";
import Head from "next/head";
import { ReactNode } from "react";

export default function Layout({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <>
      <Head>
        <title>{title ? `${title} — Northbridge Chain` : "Northbridge Chain"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Northbridge Chain — staking, contracts, architecture and roadmap." />
      </Head>

      <div className="nav">
        <div className="navInner">
          <Link href="/" className="brand">
            <img src="/logo-northbridge.svg" alt="Northbridge Chain" />
            <span>Northbridge Chain</span>
          </Link>

          <div className="links">
            <Link className="pill" href="/staking">Staking</Link>
            <Link className="pill" href="/wallet">Wallet</Link>
            <Link className="pill" href="/contracts">Contracts</Link>
            <Link className="pill" href="/architecture">Architecture</Link>
            <Link className="pill" href="/roadmap">Roadmap</Link>
            <Link className="pill" href="/whitepaper-v0-1">Whitepaper</Link>
          </div>
        </div>
      </div>

      <div className="container">{children}</div>

      <div className="container" style={{ paddingTop: 0 }}>
        <div className="footer">
          <div>© {new Date().getFullYear()} Northbridge Chain</div>
          <div>Multisig governance • On-chain emissions • Staking live</div>
        </div>
      </div>
    </>
  );
}
