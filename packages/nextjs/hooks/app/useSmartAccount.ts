"use client";

import { useCallback, useState } from "react";
import { Implementation, toMetaMaskSmartAccount } from "@metamask/smart-accounts-kit";
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi";
import { useSmartAccountStore } from "~~/services/store/useSmartAccountStore";
import { notification } from "~~/utils/scaffold-eth/notification";

export function useSmartAccount() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const chainId = useChainId();
  const { isUpgraded, smartAccountAddress, setUpgraded, reset } = useSmartAccountStore();
  const [isLoading, setIsLoading] = useState(false);

  const upgradeToSmartAccount = useCallback(async () => {
    if (!address || !walletClient || !publicClient) {
      notification.error("Wallet not connected");
      return null;
    }

    setIsLoading(true);
    try {
      const smartAccount = await (toMetaMaskSmartAccount as any)({
        client: publicClient,
        implementation: Implementation.Hybrid,
        deployParams: [address, [], [], []],
        deploySalt: "0x",
        signer: { walletClient },
      });

      const code = await publicClient.getCode({ address: smartAccount.address as `0x${string}` });
      if (!code) {
        notification.info("Deploying smart account...");
        const hash = await (smartAccount as any).deploy();
        await publicClient.waitForTransactionReceipt({ hash });
      }

      setUpgraded(smartAccount.address as `0x${string}`);
      notification.success("Account upgraded to MetaMask Smart Account");
      return smartAccount;
    } catch (err) {
      notification.error("Failed to upgrade to smart account");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [address, walletClient, publicClient, setUpgraded]);

  const getSmartAccount = useCallback(async () => {
    if (!address || !walletClient || !publicClient) return null;

    return (toMetaMaskSmartAccount as any)({
      client: publicClient,
      implementation: Implementation.Hybrid,
      deployParams: [address, [], [], []],
      deploySalt: "0x",
      signer: { walletClient },
    });
  }, [address, walletClient, publicClient]);

  return {
    isUpgraded,
    smartAccountAddress,
    isLoading,
    upgradeToSmartAccount,
    getSmartAccount,
    reset,
    chainId,
  };
}
