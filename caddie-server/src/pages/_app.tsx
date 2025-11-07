import type { AppProps } from 'next/app';
import Head from 'next/head';
import { globalAnimations } from '../lib/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>HubSpot Contact Caddie</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⛳</text></svg>"
        />
        <style>{globalAnimations}</style>
      </Head>
      <Component {...pageProps} />
    </>
  );
}
