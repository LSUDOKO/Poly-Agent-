"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useWeb3AuthLogin } from "~~/hooks/app/useWeb3AuthLogin";

export const MultisigConnectButton = () => {
  const { isConnected: wagmiConnected } = useAccount();
  const w3a = useWeb3AuthLogin();

  if (wagmiConnected || w3a.isConnected) return null;

  return (
    <button
      className="btn btn-primary btn-sm text-black cursor-pointer"
      onClick={w3a.login}
      disabled={w3a.connecting}
      type="button"
    >
      {w3a.connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
};
