import Head from "next/head";
import Link from "next/link";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <div style={statLabelStyle}>{label}</div>
      <div style={statValueStyle}>{value}</div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  ctaLabel,
  ctaHref
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <section style={panelStyle}>
      <div style={panelHeaderStyle}>
        <h3 style={panelTitleStyle}>{title}</h3>
        <Link href={ctaHref} style={panelButtonStyle}>
          {ctaLabel}
        </Link>
      </div>
      <p style={panelTextStyle}>{subtitle}</p>
      <div style={placeholderStyle}>
        <div style={placeholderLineStyle} />
        <div style={{ ...placeholderLineStyle, width: "82%" }} />
        <div style={{ ...placeholderLineStyle, width: "68%" }} />
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Northbridge Chain Explorer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <section style={heroSectionStyle}>
        <div style={heroInnerStyle}>
          <div style={eyebrowStyle}>Northbridge Chain • Testnet</div>
          <h1 style={heroTitleStyle}>Northbridge Blockchain Explorer</h1>
          <p style={heroSubtitleStyle}>
            Search blocks, transactions, addresses, tokens and DEX markets.
          </p>

          <div style={searchRowStyle}>
            <div style={searchShellStyle}>
              <input
                placeholder="Search by Address / Tx Hash / Block / Token"
                style={searchInputStyle}
              />
            </div>
            <button style={searchButtonStyle}>Search</button>
          </div>

          <div style={statsGridStyle}>
            <StatCard label="Network" value="Northbridge Testnet" />
            <StatCard label="Price" value="$0.00" />
            <StatCard label="Transactions" value="4" />
            <StatCard label="Latest Block" value="1" />
          </div>
        </div>
      </section>

      <section style={dashboardGridStyle}>
        <Panel
          title="Latest Blocks"
          subtitle="Recent block production and validator activity."
          ctaLabel="View All Blocks"
          ctaHref="/explorer"
        />
        <Panel
          title="Latest Transactions"
          subtitle="Recent on-chain transfers, swaps and contract calls."
          ctaLabel="View All Transactions"
          ctaHref="/explorer"
        />
        <Panel
          title="Top Tokens"
          subtitle="Tracked token contracts, supply and transfer activity."
          ctaLabel="View All Tokens"
          ctaHref="/tokens"
        />
        <Panel
          title="DEX Markets"
          subtitle="Markets, liquidity and 24h activity across Northbridge DEX."
          ctaLabel="View All Markets"
          ctaHref="/markets"
        />
      </section>
    </>
  );
}

const heroSectionStyle: React.CSSProperties = {
  padding: "60px 0 34px"
};

const heroInnerStyle: React.CSSProperties = {
  maxWidth: 1180
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 2,
  opacity: 0.62,
  marginBottom: 18
};

const heroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 56,
  lineHeight: 1.02,
  letterSpacing: -1.4,
  fontWeight: 800,
  maxWidth: 920
};

const heroSubtitleStyle: React.CSSProperties = {
  marginTop: 20,
  marginBottom: 30,
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 760,
  color: "rgba(255,255,255,0.74)"
};

const searchRowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 140px",
  gap: 14,
  maxWidth: 1040
};

const searchShellStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.035)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)"
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 20px",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "white",
  fontSize: 17
};

const searchButtonStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(122,162,255,0.45)",
  background: "linear-gradient(90deg, rgba(86,91,255,0.9) 0%, rgba(87,166,255,0.9) 100%)",
  color: "white",
  fontWeight: 800,
  fontSize: 18,
  cursor: "pointer",
  boxShadow: "0 14px 40px rgba(53,112,255,0.22)"
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: 18,
  marginTop: 28
};

const statCardStyle: React.CSSProperties = {
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  padding: "20px 24px",
  minHeight: 112,
  boxShadow: "0 12px 40px rgba(0,0,0,0.16)"
};

const statLabelStyle: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.60)",
  marginBottom: 10
};

const statValueStyle: React.CSSProperties = {
  fontSize: 24,
  lineHeight: 1.15,
  fontWeight: 800,
  letterSpacing: -0.4
};

const dashboardGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 22,
  paddingBottom: 28
};

const panelStyle: React.CSSProperties = {
  borderRadius: 22,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.028)",
  padding: 26,
  minHeight: 260,
  boxShadow: "0 18px 60px rgba(0,0,0,0.18)"
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  marginBottom: 14
};

const panelTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 800,
  letterSpacing: -0.4
};

const panelButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 700
};

const panelTextStyle: React.CSSProperties = {
  marginTop: 0,
  color: "rgba(255,255,255,0.68)",
  fontSize: 15,
  lineHeight: 1.6
};

const placeholderStyle: React.CSSProperties = {
  marginTop: 26,
  display: "grid",
  gap: 14
};

const placeholderLineStyle: React.CSSProperties = {
  height: 46,
  borderRadius: 14,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.06)"
};
