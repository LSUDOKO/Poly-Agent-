"use client";

import React from "react";
import ModalContainer from "./ModalContainer";
import { ArrowLeft, Sparkles, Wallet, X } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { useModalApp } from "~~/hooks/app/useModalApp";
import { useSmartAccount } from "~~/hooks/app/useSmartAccount";
import type { ModalProps } from "~~/types/modal";

const SmartAccountUpgradeModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { isUpgraded, isLoading, upgradeToSmartAccount } = useSmartAccount();
  const { openModal } = useModalApp();

  const handleUpgrade = async () => {
    const account = await upgradeToSmartAccount();
    if (account) {
      openModal("confirm", {
        title: "Smart Account Ready",
        description:
          "Your wallet has been upgraded to a MetaMask Smart Account. You can now use advanced permissions and ERC-7710 delegations for gasless x402 deposits.",
        confirmText: "Great!",
        onConfirm: onClose,
      });
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      isCloseButton={false}
      className="bg-white rounded-3xl w-[min(480px,92vw)] p-0 shadow-modal overflow-hidden"
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            <ArrowLeft className="w-5 h-5 text-grey-1000 cursor-pointer" onClick={onClose} />
            <span className="text-grey-1000 text-base font-semibold">Smart Account Upgrade</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-grey-200 hover:bg-grey-50 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-grey-1000" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-6 px-5 py-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-grey-1000 text-xl font-semibold">Upgrade to Smart Account</h3>
            <p className="text-sm text-grey-600 leading-relaxed max-w-sm">
              Upgrade your wallet to a MetaMask Smart Account to unlock advanced permissions, ERC-7710 delegations, and
              gasless x402 USDC deposits.
            </p>
          </div>

          <div className="w-full space-y-3 px-2">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-grey-50">
              <Wallet className="w-5 h-5 text-main-pink shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-grey-1000">Advanced Permissions</p>
                <p className="text-xs text-grey-500">Grant fine-grained spending limits to agents</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-grey-50">
              <Sparkles className="w-5 h-5 text-main-pink shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-grey-1000">ERC-7710 Delegations</p>
                <p className="text-xs text-grey-500">Authorize x402 deposits with time-bound permissions</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-grey-100">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="basis-1/3 h-11 bg-white hover:bg-grey-50 text-grey-1000 border border-grey-200 rounded-xl cursor-pointer"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={handleUpgrade}
            disabled={isUpgraded || isLoading}
            className="flex-1 h-11 bg-main-pink hover:bg-pink-550 text-grey-1000 rounded-xl cursor-pointer disabled:opacity-50"
          >
            {isUpgraded ? "Already Upgraded" : isLoading ? "Upgrading..." : "Upgrade Now"}
          </Button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default SmartAccountUpgradeModal;
