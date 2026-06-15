import { type Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SmartAccountState {
  isUpgraded: boolean;
  smartAccountAddress: Address | null;
  hasDelegation: boolean;
  setUpgraded: (address: Address) => void;
  setDelegation: (has: boolean) => void;
  reset: () => void;
}

export const useSmartAccountStore = create<SmartAccountState>()(
  persist(
    set => ({
      isUpgraded: false,
      smartAccountAddress: null,
      hasDelegation: false,
      setUpgraded: address => set({ isUpgraded: true, smartAccountAddress: address }),
      setDelegation: has => set({ hasDelegation: has }),
      reset: () => set({ isUpgraded: false, smartAccountAddress: null, hasDelegation: false }),
    }),
    { name: "smart-account-storage" },
  ),
);
