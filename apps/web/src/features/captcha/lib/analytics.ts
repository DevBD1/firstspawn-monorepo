import posthog from "posthog-js";

export const trackCaptchaOpened = (): void => {
  posthog.capture("captcha_opened", {
    captcha_type: "screw_alignment",
  });
};

export const trackCaptchaVerificationAttempted = (attemptNumber: number): void => {
  posthog.capture("captcha_verification_attempted", {
    captcha_type: "screw_alignment",
    attempt_number: attemptNumber,
  });
};

export const trackCaptchaVerificationFailed = (delta: number, attemptNumber: number): void => {
  posthog.capture("captcha_verification_failed", {
    captcha_type: "screw_alignment",
    delta_degrees: delta,
    attempt_number: attemptNumber,
  });
};

export const trackCaptchaVerificationSucceeded = (delta: number, totalAttempts: number): void => {
  posthog.capture("captcha_verification_succeeded", {
    captcha_type: "screw_alignment",
    delta_degrees: delta,
    total_attempts: totalAttempts,
  });
};

export const trackCaptchaReset = (attemptsBeforeReset: number): void => {
  posthog.capture("captcha_reset", {
    captcha_type: "screw_alignment",
    attempts_before_reset: attemptsBeforeReset,
  });
};
