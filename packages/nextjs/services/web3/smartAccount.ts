import { Implementation, toMetaMaskSmartAccount } from "@metamask/smart-accounts-kit";
import { getSmartAccountsEnvironment } from "@metamask/smart-accounts-kit";
import { type Address, type PublicClient, type WalletClient } from "viem";

export interface SmartAccountConfig {
  publicClient: PublicClient;
  walletClient: WalletClient;
  address: Address;
}

export async function createSmartAccount({ publicClient, walletClient, address }: SmartAccountConfig) {
  const smartAccount = await (toMetaMaskSmartAccount as any)({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [address, [], [], []],
    deploySalt: "0x",
    signer: { walletClient },
  });

  return smartAccount;
}

export async function deploySmartAccount(smartAccount: any, publicClient: PublicClient) {
  const { factory, factoryData } = await smartAccount.getFactoryArgs();
  const hash = await publicClient.sendRawTransaction({
    serializedTransaction: factoryData,
  } as any);
  return hash;
}

export function getEnvironment(chainId: number) {
  return getSmartAccountsEnvironment(chainId);
}
