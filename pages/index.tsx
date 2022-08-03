import Head from "next/head";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { TTStaking } from "../components/contract";
import { useNetwork } from "wagmi";
import addresses from "@/contracts/addresses";

export default function Home() {
  const { chain } = useNetwork();
  const isMiningContract = chain?.id && addresses[chain?.id];

  return (
    <div>
      <Head>
        <title>NFT Transfer</title>
        <meta name="description" content="Mining transfer app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header style={{ padding: "1rem" }}>
        <ConnectButton />
      </header>

      <main
        style={{
          minHeight: "60vh",
          flex: "1",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isMiningContract && <TTStaking />}
      </main>
    </div>
  );
}
