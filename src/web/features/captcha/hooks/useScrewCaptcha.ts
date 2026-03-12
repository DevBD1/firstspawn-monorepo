"use client";

import { useCallback, useEffect, useState } from "react";
import { verifyHumanityWithWit } from "@/app/actions/captcha";
import {
  CAPTCHA_MESSAGES,
  CAPTCHA_MIN_DISTANCE,
  CAPTCHA_RANDOM_BASE,
  CAPTCHA_RANDOM_RANGE,
  CAPTCHA_ROTATION_TOLERANCE,
  CAPTCHA_SUCCESS_DELAY_MS,
  CAPTCHA_VERIFY_DELAY_MS,
} from "@/features/captcha/lib/constants";
import {
  trackCaptchaOpened,
  trackCaptchaReset,
  trackCaptchaVerificationAttempted,
  trackCaptchaVerificationFailed,
  trackCaptchaVerificationSucceeded,
} from "@/features/captcha/lib/analytics";
import { CaptchaState } from "@/features/captcha/types";

interface UseScrewCaptchaParams {
  isOpen: boolean;
  onVerify: () => void;
}

interface UseScrewCaptchaReturn {
  attempts: number;
  captchaState: CaptchaState;
  rotation: number;
  statusMessage: string;
  targetRotation: number;
  handleReset: () => void;
  handleSliderChange: (value: number) => void;
  handleVerify: () => Promise<void>;
}

const randomRotation = (): number => Math.floor(Math.random() * CAPTCHA_RANDOM_RANGE) + CAPTCHA_RANDOM_BASE;

export function useScrewCaptcha({ isOpen, onVerify }: UseScrewCaptchaParams): UseScrewCaptchaReturn {
  const [rotation, setRotation] = useState(50);
  const [targetRotation, setTargetRotation] = useState(0);
  const [captchaState, setCaptchaState] = useState<CaptchaState>(CaptchaState.IDLE);
  const [statusMessage, setStatusMessage] = useState<string>(CAPTCHA_MESSAGES.idle);
  const [attempts, setAttempts] = useState(0);

  const resetCaptcha = useCallback(() => {
    const nextTarget = randomRotation();
    let start = randomRotation();

    while (Math.abs(start - nextTarget) < CAPTCHA_MIN_DISTANCE) {
      start = randomRotation();
    }

    setTargetRotation(nextTarget);
    setRotation(start);
    setCaptchaState(CaptchaState.IDLE);
    setStatusMessage(CAPTCHA_MESSAGES.idle);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      resetCaptcha();
      trackCaptchaOpened();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [isOpen, resetCaptcha]);

  const handleSliderChange = (value: number) => {
    if (captchaState === CaptchaState.VERIFYING || captchaState === CaptchaState.SUCCESS) {
      return;
    }

    setRotation(value);
  };

  const handleReset = () => {
    trackCaptchaReset(attempts);
    resetCaptcha();
  };

  const handleVerify = async () => {
    if (captchaState !== CaptchaState.IDLE) {
      return;
    }

    const attemptNumber = attempts + 1;
    trackCaptchaVerificationAttempted(attemptNumber);

    setCaptchaState(CaptchaState.VERIFYING);
    setStatusMessage(CAPTCHA_MESSAGES.verifying);

    const delta = Math.abs(rotation - targetRotation);
    const isSuccess = delta <= CAPTCHA_ROTATION_TOLERANCE;

    await new Promise((resolve) => setTimeout(resolve, CAPTCHA_VERIFY_DELAY_MS));

    const message = await verifyHumanityWithWit(isSuccess, delta);
    setStatusMessage(message);
    setCaptchaState(isSuccess ? CaptchaState.SUCCESS : CaptchaState.FAILURE);

    if (!isSuccess) {
      setAttempts((previous) => previous + 1);
      trackCaptchaVerificationFailed(delta, attemptNumber);
      return;
    }

    trackCaptchaVerificationSucceeded(delta, attemptNumber);

    setTimeout(() => {
      onVerify();
    }, CAPTCHA_SUCCESS_DELAY_MS);
  };

  return {
    attempts,
    captchaState,
    rotation,
    statusMessage,
    targetRotation,
    handleReset,
    handleSliderChange,
    handleVerify,
  };
}
