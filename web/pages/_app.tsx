import type { AppProps } from "next/app";
import "../styles/globals.css";
import Layout from "../components/Layout";

export default function App({ Component, pageProps }: AppProps) {
  const title = (pageProps as any)?.title as string | undefined;
  return (
    <Layout title={title}>
      <Component {...pageProps} />
    </Layout>
  );
}
