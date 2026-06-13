"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { WLButton, WLCard } from "@firstspawn/ui";
import { useScrewCaptcha } from "@/features/captcha/hooks/useScrewCaptcha";
import { CaptchaState } from "@/features/captcha/types";
import { CAPTCHA_MAX_ROTATION } from "@/features/captcha/lib/constants";
import type { AppDictionary } from "@/lib/dictionaries/schema";
import { ScrewMechanic } from "./ScrewMechanic";

interface NewsletterCaptchaProps {
  dictionary: AppDictionary;
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function NewsletterCaptcha({
  dictionary,
  isOpen,
  onClose,
  onVerify,
}: NewsletterCaptchaProps) {
  const copy = dictionary.captcha.modal;
  const {
    attempts,
    captchaState,
    rotation,
    statusMessage,
    targetRotation,
    handleReset,
    handleSliderChange,
    handleVerify,
  } = useScrewCaptcha({ dictionary, isOpen, onVerify });

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md"
          >
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 text-white/50 transition-colors hover:text-white"
              aria-label={copy.closeAriaLabel}
            >
              <X size={32} />
            </button>

            <WLCard>
              <div className="mb-6 w-full border-b border-border pb-3 text-center">
                <h2 className="font-display text-2xl tracking-normal text-foreground font-semibold">
                  {captchaState === CaptchaState.SUCCESS ? copy.successTitle : copy.title}
                </h2>
              </div>
              <div className="flex flex-col gap-6">
                <div
                  className={`border border-border rounded-xl p-4 text-center font-display text-base uppercase transition-colors duration-300 ${
                    captchaState === CaptchaState.IDLE ? "bg-secondary/40 text-foreground" : ""
                  } ${captchaState === CaptchaState.VERIFYING ? "animate-pulse bg-yellow-900/10 border-yellow-500/20 text-yellow-600" : ""} ${
                    captchaState === CaptchaState.SUCCESS
                      ? "bg-success/10 border-success/20 text-success"
                      : ""
                  } ${captchaState === CaptchaState.FAILURE ? "bg-danger/10 border-danger/20 text-danger" : ""}`}
                >
                  {statusMessage}
                </div>

                <div className="bg-secondary border border-border rounded-xl p-4">
                  <ScrewMechanic
                    rotation={rotation}
                    targetRotation={targetRotation}
                    showTarget={captchaState !== CaptchaState.SUCCESS}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between font-ui text-lg uppercase text-foreground">
                    <span>{copy.rotateLabel}</span>
                    <span>{Math.round(rotation)}°</span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={CAPTCHA_MAX_ROTATION}
                    value={rotation}
                    onChange={(event) => handleSliderChange(Number(event.target.value))}
                    className="h-4 w-full cursor-pointer appearance-none rounded-lg bg-background accent-success"
                    disabled={
                      captchaState === CaptchaState.SUCCESS ||
                      captchaState === CaptchaState.VERIFYING
                    }
                  />

                  <div className="flex justify-between font-ui text-xs uppercase text-foreground/50">
                    <span>{copy.sliderLeftLabel}</span>
                    <span>{copy.sliderRightLabel}</span>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-border pt-4">
                  <WLButton
                    variant="secondary"
                    onClick={handleReset}
                    disabled={captchaState === CaptchaState.VERIFYING}
                    style={{ paddingLeft: 16, paddingRight: 16 }}
                    title={copy.resetAriaLabel}
                  >
                    <RefreshIcon />
                  </WLButton>

                  <WLButton
                    variant={captchaState === CaptchaState.FAILURE ? "danger" : "primary"}
                    className="flex flex-1 items-center justify-center gap-2 text-sm md:text-xl"
                    onClick={captchaState === CaptchaState.FAILURE ? handleReset : handleVerify}
                    disabled={
                      captchaState === CaptchaState.VERIFYING ||
                      captchaState === CaptchaState.SUCCESS
                    }
                  >
                    {captchaState === CaptchaState.VERIFYING
                      ? copy.processingLabel
                      : captchaState === CaptchaState.FAILURE
                        ? copy.retryLabel
                        : captchaState === CaptchaState.SUCCESS
                          ? copy.clearedLabel
                          : copy.verifyLabel}

                    {captchaState === CaptchaState.SUCCESS ? <CheckIcon /> : null}
                    {captchaState === CaptchaState.FAILURE ? <XIcon /> : null}
                  </WLButton>
                </div>
              </div>
            </WLCard>

            <div className="mt-4 text-center font-ui text-xs text-foreground/40">
              {copy.subtitle}
              <br />
              {copy.attemptsLabel}: {attempts}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
