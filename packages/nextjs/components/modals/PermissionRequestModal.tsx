"use client";

import React from "react";
import ModalContainer from "./ModalContainer";
import { ArrowLeft, Check, Shield, X } from "lucide-react";
import { Button } from "~~/components/ui/button";
import { useAdvancedPermissions } from "~~/hooks/app/useAdvancedPermissions";
import type { ModalProps } from "~~/types/modal";

export interface PermissionRequestModalProps extends ModalProps {
  tokenAddress?: `0x${string}`;
  amount?: number;
  onPermissionGranted?: () => void;
}

const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({
  isOpen,
  onClose,
  tokenAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  amount = 100,
  onPermissionGranted,
}) => {
  const { isRequesting, requestUSDCx402Permission } = useAdvancedPermissions();
  const [granted, setGranted] = React.useState(false);

  const handleGrant = async () => {
    const result = await requestUSDCx402Permission(tokenAddress, amount);
    if (result) {
      setGranted(true);
      onPermissionGranted?.();
    }
  };

  const handleClose = () => {
    setGranted(false);
    onClose();
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={handleClose}
      isCloseButton={false}
      className="bg-white rounded-3xl w-[min(480px,92vw)] p-0 shadow-modal overflow-hidden"
    >
      {!granted ? (
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5 text-grey-1000 cursor-pointer" onClick={handleClose} />
              <span className="text-grey-1000 text-base font-semibold">Authorize x402 Deposit</span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-grey-200 hover:bg-grey-50 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-grey-1000" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 px-5 py-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <Shield className="w-10 h-10 text-white" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-grey-1000 text-xl font-semibold">Grant Deposit Permission</h3>
              <p className="text-sm text-grey-600 leading-relaxed max-w-sm">
                Authorize your smart account to deposit up to {amount} USDC per day via x402 gasless deposits. This uses
                ERC-7710 delegation for fine-grained permission control.
              </p>
            </div>

            <div className="w-full bg-grey-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-grey-500">Permission</span>
                <span className="text-grey-1000 font-medium">USDC x402 Deposit</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-grey-500">Daily Limit</span>
                <span className="text-grey-1000 font-medium">{amount} USDC</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-grey-500">Duration</span>
                <span className="text-grey-1000 font-medium">7 days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-grey-500">Standard</span>
                <span className="text-grey-1000 font-medium">ERC-7715</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-grey-100">
            <Button
              type="button"
              onClick={handleClose}
              disabled={isRequesting}
              className="basis-1/3 h-11 bg-white hover:bg-grey-50 text-grey-1000 border border-grey-200 rounded-xl cursor-pointer"
            >
              Deny
            </Button>
            <Button
              type="button"
              onClick={handleGrant}
              disabled={isRequesting}
              className="flex-1 h-11 bg-main-pink hover:bg-pink-550 text-grey-1000 rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isRequesting ? "Authorizing..." : "Grant Permission"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          <div className="flex items-center justify-end px-5 pt-5 pb-3">
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-grey-200 hover:bg-grey-50 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-grey-1000" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-4 px-5 py-6">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-9 h-9 text-white" strokeWidth={3} />
            </div>
            <h3 className="text-grey-1000 text-2xl font-semibold">Permission Granted</h3>
            <p className="text-sm text-grey-600 text-center">
              Your smart account can now deposit up to {amount} USDC per day via x402.
            </p>
          </div>

          <div className="flex gap-3 px-5 py-4 border-t border-grey-100">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 bg-main-pink hover:bg-pink-550 text-grey-1000 rounded-xl cursor-pointer"
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </ModalContainer>
  );
};

export default PermissionRequestModal;
