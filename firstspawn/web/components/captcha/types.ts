export enum CaptchaState {
  IDLE = 'IDLE',
  VERIFYING = 'VERIFYING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE'
}

export interface VerificationResult {
  success: boolean;
  message: string;
}
