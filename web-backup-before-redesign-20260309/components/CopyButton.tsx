import { useState } from "react";
import { copyText } from "../lib/copy";

export default function CopyButton({ value }: { value: string }) {

  const [copied,setCopied] = useState(false);

  async function doCopy(){
    await copyText(value);
    setCopied(true);
    setTimeout(()=>setCopied(false),1200);
  }

  return (
    <button
      onClick={doCopy}
      style={{
        marginLeft:6,
        fontSize:12,
        border:"1px solid rgba(255,255,255,0.15)",
        background:"rgba(0,0,0,0.35)",
        borderRadius:6,
        padding:"2px 6px",
        cursor:"pointer"
      }}
      title="Copy"
    >
      {copied ? "✓" : "📋"}
    </button>
  );
}
