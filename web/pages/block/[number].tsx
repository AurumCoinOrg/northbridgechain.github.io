import { useRouter } from "next/router";

export default function BlockPage() {
  const router = useRouter();
  const { number } = router.query;

  return (
    <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>Block {number}</h1>

        <div style={{marginTop:16,display:"flex",gap:14,flexWrap:"wrap"}}>
          <a href="/explorer" style={{textDecoration:"none",color:"inherit"}}>← Explorer</a>
          <a href="/network" style={{textDecoration:"none",color:"inherit"}}>Network Stats →</a>
        </div>
      <p>This is the block explorer page.</p>
    </main>
  );
}
