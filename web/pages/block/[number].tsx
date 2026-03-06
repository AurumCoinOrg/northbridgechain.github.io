import { useRouter } from "next/router";

export default function BlockPage() {
  const router = useRouter();
  const { number } = router.query;

  return (
    <main style={{maxWidth:1000,margin:"40px auto",padding:20}}>
      <h1>Block {number}</h1>
      <p>This is the block explorer page.</p>
    </main>
  );
}
