"use client";

import { ReactNode } from "react";
import { Web3AuthProvider } from "@web3auth/modal/react";

const WEB3AUTH_CLIENT_ID = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || "";

const web3authConfig = {
  clientId: WEB3AUTH_CLIENT_ID,
  web3AuthNetwork: "sapphire_devnet",
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x2105",
    rpcTarget: "https://base-mainnet.g.alchemy.com/v2",
    displayName: "Base",
    blockExplorerUrl: "https://basescan.org",
    ticker: "ETH",
    tickerName: "Ethereum",
  },
  uiConfig: {
    theme: "dark",
    loginMethodsOrder: ["google", "apple", "email_passwordless"],
  },
} as any;

export function Web3AuthAppProvider({ children }: { children: ReactNode }) {
  return <Web3AuthProvider config={web3authConfig}>{children}</Web3AuthProvider>;
}
