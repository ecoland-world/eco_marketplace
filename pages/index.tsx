import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import hub from "../public/images/hub.png";
import hero from "../public/images/hero.png";

import { ConnectWallet, useAddress } from "@thirdweb-dev/react";

const Home: NextPage = () => {
  const address = useAddress();
  console.log(address);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Eco Marketplace</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen w-full flex-1 flex-col mt-10">
        <div className="flex justify-around items-center">
          <div className="w-[500px] flex flex-col space-y-10">
            <h1 className="text-[56px] leading-none uppercase">
              Eco-friendly Marketplace
            </h1>
            <p className="text-[24px]">
              Eco Market is a marketplace that adds a layer of eco-friendly rewards 
              to the NFT purchase experience. 
            </p>
          </div>
          <div>
            <Image src={hub} alt="hero" className="w-[320px] animate-updown" />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
