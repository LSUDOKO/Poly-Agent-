"use client";

import { useCallback, useState } from "react";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount, useConnect } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

export function useWeb3AuthLogin() {
  const { web3Auth, isConnected: w3aConnected, isInitializing: w3aLoading } = useWeb3Auth();
  const { connect } = useConnect();
  const { isConnected: wagmiConnected } = useAccount();
  const [connecting, setConnecting] = useState(false);

  const login = useCallback(async () => {
    if (w3aLoading || connecting) return;

    setConnecting(true);
    try {
      if (!web3Auth) {
        notification.error("Web3Auth not initialized");
        return null;
      }

      const connection = await web3Auth.connect();
      if (!connection) {
        return null;
      }

      const provider = (connection as any).ethereumProvider;
      if (!provider) {
        notification.error("No EVM provider from Web3Auth");
        return null;
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const address: `0x${string}` = accounts[0];
      const chainIdHex: string = await provider.request({ method: "eth_chainId" });

      const connector = {
        id: "web3auth",
        name: "Web3Auth",
        type: "web3auth",
        uid: "web3auth-" + Date.now(),
        connect: async () => {
          const accs = await provider.request({ method: "eth_requestAccounts" });
          const cId = await provider.request({ method: "eth_chainId" });
          return { accounts: [accs[0] as `0x${string}`], chainId: parseInt(cId as string, 16) };
        },
        disconnect: async () => {},
        getAccounts: async () => {
          const accs = await provider.request({ method: "eth_accounts" });
          return accs as `0x${string}`[];
        },
        getChainId: async () => 84532,
        getProvider: async () => provider,
        isAuthorized: async () => true,
        onAccountsChanged: () => {},
        onChainChanged: () => {},
        onDisconnect: () => {},
        emit: () => true,
      };

      (connect as any)({ connector });
      notification.success("Wallet connected via Web3Auth");
      return address;
    } catch (err: any) {
      if (err?.message?.includes("user declined") || err?.code === 4001) {
        return null;
      }
      notification.error("Web3Auth login failed");
      return null;
    } finally {
      setConnecting(false);
    }
  }, [web3Auth, w3aLoading, connecting, connect]);

  return { login, connecting, isConnected: w3aConnected || wagmiConnected };
}
