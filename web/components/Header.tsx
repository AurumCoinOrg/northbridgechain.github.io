import Link from "next/link";
import { useRouter } from "next/router";

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
  { href: "/dex-analytics", label: "Analytics" }
];

const MORE_NAV: NavItem[] = [
  { href: "/staking", label: "Staking" },
  { href: "/wallet", label: "Wallet" },
  { href: "/swap", label: "Swap" },
  { href: "/liquidity", label: "Liquidity" },
  { href: "/pools", label: "Pools" },
  { href: "/chart", label: "Chart" },
  { href: "/depth", label: "Depth" },
  { href: "/trades", label: "Trades" },
  { href: "/contracts-registry", label: "Contracts Registry" },
  { href: "/contract-map", label: "Contract Map" },
  { href: "/network-status", label: "Network Status" },
  { href: "/supply", label: "Supply" },
  { href: "/richlist", label: "Rich List" },
  { href: "/network-health", label: "Network Health" },
  { href: "/transparency", label: "Transparency" },
  { href: "/tokenomics", label: "Tokenomics" },
  { href: "/architecture", label: "Architecture" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/governance", label: "Governance" },
  { href: "/whitepaper", label: "Whitepaper" }
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Header() {
  const router = useRouter();
  const pathname = router.pathname || "/";

  return (
    <header style={headerStyle}>
      <div style={utilityBarStyle}>
        <div style={utilityInnerStyle}>
          <div style={utilityLeftStyle}>
            <span style={utilityBadgeStyle}>Northbridge Testnet</span>
            <span style={utilityMutedStyle}>Gas: 0.01 NBCX</span>
          </div>
          <div style={utilityRightStyle}>
            <span style={utilityMutedStyle}>Network</span>
            <Link href="/wallet" style={walletButtonStyle}>
              Connect Wallet
            </Link>
          </div>
        </div>
      </div>

      <div style={mainBarStyle}>
        <div style={mainInnerStyle}>
          <Link href="/" style={brandStyle}>
            Northbridge
          </Link>

          <nav style={mainNavStyle}>
            {MAIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                style={isActive(pathname, item.href) ? activeNavLinkStyle : navLinkStyle}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <details style={moreWrapStyle}>
            <summary style={moreButtonStyle}>More</summary>
            <div style={moreMenuStyle}>
              {MORE_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  style={moreItemStyle}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  backdropFilter: "blur(12px)",
  background: "rgba(5,11,30,0.88)",
  borderBottom: "1px solid rgba(255,255,255,0.06)"
};

const utilityBarStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.06)"
};

const utilityInnerStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "10px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16
};

const utilityLeftStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  flexWrap: "wrap"
};

const utilityRightStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14
};

const utilityBadgeStyle: React.CSSProperties = {
  color: "#d8e3ff",
  fontSize: 13,
  fontWeight: 700
};

const utilityMutedStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.68)",
  fontSize: 13
};

const walletButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 16px",
  borderRadius: 12,
  color: "white",
  textDecoration: "none",
  fontWeight: 700,
  border: "1px solid rgba(122,162,255,0.45)",
  background: "linear-gradient(90deg, rgba(86,91,255,0.9) 0%, rgba(87,166,255,0.9) 100%)",
  boxShadow: "0 10px 30px rgba(53,112,255,0.2)"
};

const mainBarStyle: React.CSSProperties = {
  borderBottom: "1px solid rgba(255,255,255,0.04)"
};

const mainInnerStyle: React.CSSProperties = {
  maxWidth: 1400,
  margin: "0 auto",
  padding: "18px 20px",
  display: "grid",
  gridTemplateColumns: "220px 1fr auto",
  alignItems: "center",
  gap: 18
};

const brandStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: -0.4
};

const mainNavStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 28,
  flexWrap: "wrap"
};

const navLinkStyle: React.CSSProperties = {
  color: "rgba(255,255,255,0.86)",
  textDecoration: "none",
  fontSize: 16,
  fontWeight: 500
};

const activeNavLinkStyle: React.CSSProperties = {
  ...navLinkStyle,
  color: "#7ec1ff",
  borderBottom: "2px solid #49b7ff",
  paddingBottom: 8
};

const moreWrapStyle: React.CSSProperties = {
  position: "relative"
};

const moreButtonStyle: React.CSSProperties = {
  listStyle: "none",
  cursor: "pointer",
  color: "rgba(255,255,255,0.9)",
  fontSize: 16,
  fontWeight: 600
};

const moreMenuStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 12px)",
  right: 0,
  width: 260,
  maxHeight: 420,
  overflowY: "auto",
  borderRadius: 16,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(8,14,34,0.98)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  padding: 10,
  display: "grid",
  gap: 4
};

const moreItemStyle: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,0.92)",
  textDecoration: "none",
  fontSize: 14,
  padding: "10px 12px",
  borderRadius: 10
};
