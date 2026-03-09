import { useRouter } from "next/router";
import { FormEvent, useState } from "react";

function looksLikeAddress(v: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(v);
}

function looksLikeTx(v: string) {
  return /^0x[a-fA-F0-9]{64}$/.test(v);
}

function looksLikeBlock(v: string) {
  return /^[0-9]+$/.test(v);
}

export default function ExplorerSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    const v = q.trim();
    if (!v) return;

    if (looksLikeTx(v)) {
      router.push(`/tx/${v}`);
      return;
    }

    if (looksLikeAddress(v)) {
      router.push(`/address/${v}`);
      return;
    }

    if (looksLikeBlock(v)) {
      router.push(`/block/${v}`);
      return;
    }

    router.push(`/tokens?q=${encodeURIComponent(v)}`);
  }

  return (
    <form onSubmit={submit} style={wrapStyle}>
      <div style={titleWrapStyle}>
        <div style={eyebrowStyle}>Northbridge Explorer</div>
        <h1 style={titleStyle}>Search the chain</h1>
        <div style={subStyle}>
          Search by address, transaction hash, block number, or token symbol.
        </div>
      </div>

      <div style={barWrapStyle}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by address / tx hash / block / token"
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          Search
        </button>
      </div>

      <div style={quickWrapStyle}>
        <span style={quickLabelStyle}>Popular:</span>
        <a href="/tokens" style={quickLinkStyle}>Tokens</a>
        <a href="/contracts" style={quickLinkStyle}>Contracts</a>
        <a href="/markets" style={quickLinkStyle}>Markets</a>
        <a href="/dex" style={quickLinkStyle}>DEX</a>
      </div>
    </form>
  );
}

const wrapStyle: React.CSSProperties = {
  padding: "28px 0 8px"
};

const titleWrapStyle: React.CSSProperties = {
  marginBottom: 16
};

const eyebrowStyle: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: 1.2,
  textTransform: "uppercase",
  opacity: 0.6,
  marginBottom: 8
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 42,
  lineHeight: 1.05,
  fontWeight: 800
};

const subStyle: React.CSSProperties = {
  marginTop: 10,
  fontSize: 15,
  opacity: 0.72,
  maxWidth: 760
};

const barWrapStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 140px",
  gap: 12,
  maxWidth: 920
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "18px 20px",
  borderRadius: 18,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.04)",
  color: "white",
  fontSize: 16,
  outline: "none"
};

const buttonStyle: React.CSSProperties = {
  padding: "18px 20px",
  borderRadius: 18,
  border: "1px solid rgba(122,162,255,0.45)",
  background: "rgba(78,110,220,0.22)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer"
};

const quickWrapStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 10,
  alignItems: "center",
  marginTop: 14
};

const quickLabelStyle: React.CSSProperties = {
  fontSize: 13,
  opacity: 0.6
};

const quickLinkStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 12px",
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.03)",
  color: "white",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 700
};
