import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Northbridge Chain</title>
        <meta name="description" content="Northbridge Chain — Governance-first blockchain with staking and emissions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />

        {/* OpenGraph */}
        <meta property="og:title" content="Northbridge Chain" />
        <meta property="og:description" content="Governance-first blockchain with live staking emissions." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://northbridgechain.com" />
        <meta property="og:image" content="https://northbridgechain.com/og.png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Northbridge Chain" />
        <meta name="twitter:description" content="Governance-first blockchain with staking." />
      </Head>

      <Component {...pageProps} />
    </>
  )
}
