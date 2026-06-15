import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { type Address, createWalletClient, custom, parseUnits } from "viem";

export async function getWalletClientWithPermissions() {
  if (typeof window === "undefined" || !window.ethereum) return null;

  const walletClient = createWalletClient({
    transport: custom(window.ethereum),
  }).extend(erc7715ProviderActions());

  return walletClient;
}

export async function checkSupportedPermissions() {
  const walletClient = await getWalletClientWithPermissions();
  if (!walletClient) return null;
  return (walletClient as any).getSupportedExecutionPermissions();
}

export async function requestUSDCPeriodicPermission(
  chainId: number,
  sessionAccountAddress: Address,
  tokenAddress: Address,
  amount: number,
  periodDuration: number = 86400,
  expiry: number = Math.floor(Date.now() / 1000) + 604800,
) {
  const walletClient = await getWalletClientWithPermissions();
  if (!walletClient) throw new Error("Wallet does not support ERC-7715 permissions");

  return (walletClient as any).requestExecutionPermissions([
    {
      chainId,
      expiry,
      to: sessionAccountAddress,
      permission: {
        type: "erc20-token-periodic",
        data: {
          tokenAddress,
          periodAmount: parseUnits(String(amount), 6),
          periodDuration,
          justification: "x402 gasless USDC deposit permission",
        },
        isAdjustmentAllowed: false,
      },
    },
  ]);
}

export async function getGrantedPermissions() {
  const walletClient = await getWalletClientWithPermissions();
  if (!walletClient) return [];
  return (walletClient as any).getGrantedExecutionPermissions();
}
