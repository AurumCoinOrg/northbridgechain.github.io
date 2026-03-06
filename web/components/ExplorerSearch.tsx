import { useState } from "react";
import { useRouter } from "next/router";

export default function ExplorerSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function submit(e?: any) {
    if (e) e.preventDefault();
    const v = q.trim();
    if (!v) return;

    if (/^[0-9]+$/.test(v)) {
      router.push("/block/" + v);
      return;
    }

    if (/^0x[0-9a-fA-F]{64}$/.test(v)) {
      router.push("/tx/" + v);
      return;
    }

    if (/^0x[0-9a-fA-F]{40}$/.test(v)) {
      router.push("/address/" + v);
      return;
    }

    alert("Enter a block number, tx hash, or address");
  }

  return (
    <form
      onSubmit={submit}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        marginTop: 18,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search block / tx hash / address"
        style={{
          flex: "1 1 520px",
          minWidth: 260,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.05)",
          color: "white",
          outline: "none",
        }}
      />
      <button
        type="submit"
        style={{
          padding: "12px 18px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          cursor: "pointer",
          fontWeight: 700,
        }}
      >
        Search
      </button>
    </form>
  );
}
