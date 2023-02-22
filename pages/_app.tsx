import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import Navbar from "../components/Navbar";
// import { Poppins } from "@next/font/google";

// Chain
const activeChainId = ChainId.Mumbai;

// Font
// const poppins = Poppins({
//   weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
//   subsets: ["latin"],
//   style: "normal",
//   variable: "--font-poppins",
// });

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <main>
      <ThirdwebProvider desiredChainId={activeChainId}>
        <Navbar />
        <Component {...pageProps} />
      </ThirdwebProvider>
    </main>
  );
}

export default MyApp;
