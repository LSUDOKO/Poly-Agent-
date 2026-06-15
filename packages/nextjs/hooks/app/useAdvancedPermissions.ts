"use client";

import { useCallback, useState } from "react";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { type Address, createWalletClient, custom, parseUnits } from "viem";
import { useChainId } from "wagmi";
import { useSmartAccountStore } from "~~/services/store/useSmartAccountStore";
import { notification } from "~~/utils/scaffold-eth/notification";

export function useAdvancedPermissions() {
  const chainId = useChainId();
  const { smartAccountAddress } = useSmartAccountStore();
  const [isRequesting, setIsRequesting] = useState(false);

  const getPermissionsWallet = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return null;
    return createWalletClient({ transport: custom((window as any).ethereum) }).extend(erc7715ProviderActions());
  }, []);

  const requestUSDCx402Permission = useCallback(
    async (tokenAddress: Address, amount: number) => {
      if (!smartAccountAddress) {
        notification.error("Please upgrade to a smart account first");
        return null;
      }

      setIsRequesting(true);
      try {
        const walletClient = await getPermissionsWallet();
        if (!walletClient) throw new Error("ERC-7715 not supported");

        const expiry = Math.floor(Date.now() / 1000) + 604800;

        const params = [
          {
            chainId: chainId as number,
            expiry,
            to: smartAccountAddress,
            permission: {
              type: "erc20-token-periodic" as const,
              data: {
                tokenAddress: tokenAddress as string,
                periodAmount: parseUnits(String(amount), 6),
                periodDuration: 86400,
                justification: "x402 gasless USDC deposit via ERC-7710 delegation",
              },
              isAdjustmentAllowed: false,
            },
          },
        ];
        const granted = await (walletClient as any).requestExecutionPermissions(params);

        notification.success("x402 deposit permission granted");
        return granted;
      } catch (err) {
        notification.error("Permission request denied or failed");
        return null;
      } finally {
        setIsRequesting(false);
      }
    },
    [chainId, smartAccountAddress, getPermissionsWallet],
  );

  return {
    isRequesting,
    requestUSDCx402Permission,
  };
}
