import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const links = useMemo(
    () => [
      { href: "/staking", label: "Staking" },
      { href: "/wallet", label: "Wallet" },
      { href: "/swap", label: "Swap" },
      { href: "/liquidity", label: "Liquidity" },
      { href: "/pools", label: "Pools" },
      { href: "/analytics", label: "Analytics" },
      { href: "/contracts", label: "Contracts" },
      { href: "/contracts-registry", label: "Contracts Registry" },
  { href: "/contract-map", label: "Contract Map" },
  { href: "/network", label: "Network Status" },
  { href: "/supply", label: "Supply" },
      { href: "/richlist", label: "Rich List" },
  { href: "/network-health", label: "Network Health" },
  { href: "/explorer", label: "Explorer" },
      { href: "/tokens", label: "Tokens" },
      { href: "/transparency", label: "Transparency" },
      { href: "/tokenomics", label: "Tokenomics" },
      { href: "/architecture", label: "Architecture" },
      { href: "/roadmap", label: "Roadmap" },
      { href: "/governance", label: "Governance" },
      { href: "/whitepaper-v0-1", label: "Whitepaper" },
    ],
    []
  );

  function NavLink({ href, label }: { href: string; label: string }) {
    const active = router.pathname === href;
    return (
      <Link
        href={href}
        className={"nb-navlink" + (active ? " nb-navlink-active" : "")}
        onClick={() => setOpen(false)}
      >
        {label}
      </Link>
    );
  }

  return (
    <>
      <style jsx global>{`
        /* NB_MOBILE_HEADER_FIX */

        .nb-header {
          position: sticky;
          top: 0;
          z-index: 9999;
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          background: rgba(10, 12, 20, 0.65);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: env(safe-area-inset-top);
        }

        .nb-header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px 16px;
        }

        .nb-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .nb-brand-title {
          font-weight: 800;
          font-size: 28px;
          letter-spacing: 0.2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nb-burger {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.92);
          display: grid;
          place-items: center;
          cursor: pointer;
          user-select: none;
        }

        .nb-menu {
          display: none;
        }

        .nb-menu-open {
          display: block;
          padding: 10px 12px 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .nb-menu-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .nb-navlink {
          display: block;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 700;
          text-decoration: none;
          text-align: center;
          line-height: 1.15;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nb-navlink-active {
          border-color: rgba(120, 170, 255, 0.55);
          background: rgba(40, 90, 180, 0.22);
        }

        /* Desktop: show pills inline, hide burger */
        @media (min-width: 901px) {
          .nb-burger {
            display: none;
          }
          .nb-menu {
            display: block !important;
            padding: 0 16px 14px;
          }
          .nb-menu-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .nb-navlink {
            text-align: left;
            padding: 10px 14px;
          }
        }

        /* The important part: content is NEVER hidden under the header */
        .nb-page {
          min-height: 100vh;
        }

        /* Fix “cut off / squished” long strings on mobile (addresses, hashes, etc.) */
        pre,
        code,
        .mono,
        .addr,
        .address,
        .hash {
          overflow-wrap: anywhere !important;
          word-break: break-word !important;
        }

        /* If any page uses wide tables/rows, allow horizontal scroll instead of crushing text */
        .nb-content,
        main,
        section {
          max-width: 100%;
        }
      `}</style>

      <header className="nb-header">
        <div className="nb-header-inner">
          <div className="nb-brand">
            <Link href="/" className="nb-brand-title">Northbridge Chain</Link>
          </div>

          <button className="nb-burger" aria-label="Menu" onClick={() => setOpen((v) => !v)}>
            ☰
          </button>
        </div>

        <div className={"nb-menu " + (open ? "nb-menu-open" : "")}>
          <div className="nb-menu-grid">
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} label={l.label} />
            ))}
          </div>
        </div>
</header>

      <div className="nb-page">{children}</div>
    </>
  );
}
