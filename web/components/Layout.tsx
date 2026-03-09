import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
};

const MAIN_NAV: NavItem[] = [
  { href: "/explorer", label: "Explorer" },
  { href: "/tokens", label: "Tokens" },
  { href: "/contracts", label: "Contracts" },
  { href: "/dex", label: "DEX" },
  { href: "/markets", label: "Markets" },
  { href: "/dex-analytics", label: "Analytics" },
  { href: "/wallet", label: "Wallet" }
];

const DEX_NAV: NavItem[] = [
  { href: "/swap", label: "Swap" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/remove-liquidity", label: "Remove LP" },
  { href: "/pools", label: "Pools" },
  { href: "/chart", label: "Chart" },
  { href: "/depth", label: "Depth" },
  { href: "/trades", label: "Trades" }
];

function isDexRoute(pathname: string) {
  return [
    "/dex",
    "/markets",
    "/swap",
    "/liquidity",
    "/remove-liquidity",
    "/pools",
    "/chart",
    "/depth",
    "/trades",
    "/dex-activity",
    "/dex-analytics",
    "/create-pair"
  ].some((x) => pathname === x || pathname.startsWith(x + "/"));
}

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = router.pathname || "";

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <div style={headerInnerStyle}>
          <div style={brandRowStyle}>
            <Link href="/" style={brandStyle}>
              Northbridge Chain
            </Link>

            <div style={rightToolsStyle}>
              <span style={networkBadgeStyle}>Mainnet</span>
            </div>
          </div>

          <nav style={mainNavStyle}>
            {MAIN_NAV.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={active ? activePillStyle : pillStyle}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {isDexRoute(pathname) ? (
            <div style={subnavWrapStyle}>
              <div style={subnavLabelStyle}>DEX</div>
              <nav style={subnavStyle}>
                {DEX_NAV.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={active ? activeSubPillStyle : subPillStyle}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ) : null}
        </div>
      </header>

      <main style={mainStyle}>{children}</main>
    </div>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "linear-gradient(90deg, rgba(24,32,86,0.35) 0%, rgba(5,11,30,1) 35%, rgba(5,11,30,1) 70%, rgba(15,57,52,0.35) 100%)",
  color: "white"
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  backdropFilter: "blur(10px)",
  background: "rgba(5,11,30,0.86)",
  borderBottom: "1px solid rgba(255,255,255,0.08)"
};

const headerInnerStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "18px 20px 16px"
};

const brandRowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 16
};

const brandStyle: React.CSSProperties = {
  color: "#c7d7ff",
  textDecoration: "none",
  fontSize: 28,
  fontWeight: 800,
  letterSpacing: -0.5
};

const rightToolsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10
};

const networkBadgeStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  fontSize: 13,
  opacity: 0.9
};

const mainNavStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 12,
  marginBottom: 12
};

const subnavWrapStyle: React.CSSProperties = {
  marginTop: 4,
  paddingTop: 12,
  borderTop: "1px solid rgba(255,255,255,0.08)"
};

const subnavLabelStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 1.2,
  opacity: 0.6,
  marginBottom: 10
};

const subnavStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "white",
  textDecoration: "none",
  fontWeight: 700
};

const activePillStyle: React.CSSProperties = {
  ...pillStyle,
  border: "1px solid rgba(122,162,255,0.6)",
  background: "rgba(78,110,220,0.18)"
};

const subPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 14px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.025)",
  color: "rgba(255,255,255,0.92)",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: 14
};

const activeSubPillStyle: React.CSSProperties = {
  ...subPillStyle,
  border: "1px solid rgba(122,162,255,0.55)",
  background: "rgba(78,110,220,0.16)"
};

const mainStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "0 20px 40px"
};
