'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PixelCard, PixelButton, RetroOverlay } from './PixelComponents';
import { ScrewMechanic } from './ScrewMechanic';
import { verifyHumanityWithWit } from '@/app/actions/captcha';
import { CaptchaState } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import posthog from 'posthog-js';

interface NewsletterCaptchaProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: () => void;
}

// Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function NewsletterCaptcha({ isOpen, onClose, onVerify }: NewsletterCaptchaProps) {
  const [rotation, setRotation] = useState(50);
  const [targetRotation, setTargetRotation] = useState(0);
  const [captchaState, setCaptchaState] = useState<CaptchaState>(CaptchaState.IDLE);
  const [statusMessage, setStatusMessage] = useState<string>("ALIGN THE NUT");
  const [attempts, setAttempts] = useState(0);

  // Initialize random target
  const resetCaptcha = useCallback(() => {
    const newTarget = Math.floor(Math.random() * 500) + 100;
    
    // Start the user far away from the target
    let startPos = Math.floor(Math.random() * 500) + 100;
    while (Math.abs(startPos - newTarget) < 100) {
        startPos = Math.floor(Math.random() * 500) + 100;
    }

    setTargetRotation(newTarget);
    setRotation(startPos);
    setCaptchaState(CaptchaState.IDLE);
    setStatusMessage("ALIGN THE NUT");
  }, []);

  useEffect(() => {
    if (isOpen) {
        resetCaptcha();
        posthog.capture('captcha_opened', {
            captcha_type: 'screw_alignment',
        });
    }
  }, [isOpen, resetCaptcha]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (captchaState === CaptchaState.VERIFYING || captchaState === CaptchaState.SUCCESS) return;
    setRotation(Number(e.target.value));
  };

  const handleVerify = async () => {
    if (captchaState !== CaptchaState.IDLE) return;

    posthog.capture('captcha_verification_attempted', {
        captcha_type: 'screw_alignment',
        attempt_number: attempts + 1,
    });

    setCaptchaState(CaptchaState.VERIFYING);
    setStatusMessage("ANALYZING...");

    const delta = Math.abs(rotation - targetRotation);
    const tolerance = 15; // Degrees tolerance
    const isSuccess = delta <= tolerance;

    // Artificial delay for tension
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get witty message from Server Action
    const message = await verifyHumanityWithWit(isSuccess, delta);

    setStatusMessage(message);
    setCaptchaState(isSuccess ? CaptchaState.SUCCESS : CaptchaState.FAILURE);

    if (!isSuccess) {
        setAttempts(p => p + 1);
        posthog.capture('captcha_verification_failed', {
            captcha_type: 'screw_alignment',
            delta_degrees: delta,
            attempt_number: attempts + 1,
        });
    } else {
        posthog.capture('captcha_verification_succeeded', {
            captcha_type: 'screw_alignment',
            delta_degrees: delta,
            total_attempts: attempts + 1,
        });
        setTimeout(() => {
            onVerify();
        }, 1500);
    }
  };

  return (
    <AnimatePresence>
        {isOpen && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-md"
                >
                    <button 
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <PixelCard title={captchaState === CaptchaState.SUCCESS ? "ACCESS GRANTED" : "SECURITY CHECK"}>
                    <div className="flex flex-col gap-6">
                        
                        {/* Instruction / Status Display */}
                        <div className={`
                            p-4 border-2 border-black text-center text-xl uppercase transition-colors duration-300 font-pixel
                            ${captchaState === CaptchaState.IDLE ? 'bg-[#0B131A] text-[#ADCDE2]' : ''}
                            ${captchaState === CaptchaState.VERIFYING ? 'bg-yellow-900/50 text-yellow-200 animate-pulse' : ''}
                            ${captchaState === CaptchaState.SUCCESS ? 'bg-green-900/50 text-green-400' : ''}
                            ${captchaState === CaptchaState.FAILURE ? 'bg-red-900/50 text-red-400' : ''}
                        `}>
                        {statusMessage}
                        </div>

                        {/* Main Visual */}
                        <div className="bg-black/20 p-4 rounded border-2 border-black/50 inner-shadow">
                            <ScrewMechanic 
                                rotation={rotation} 
                                targetRotation={targetRotation} 
                                showTarget={captchaState !== CaptchaState.SUCCESS}
                            />
                        </div>

                        {/* Controls */}
                        <div className="space-y-4">
                            <div className="flex justify-between text-[#ADCDE2] text-lg uppercase font-mono">
                                <span>Rotate</span>
                                <span>{Math.round(rotation)}°</span>
                            </div>
                            
                            <input 
                                type="range" 
                                min="0" 
                                max="720" 
                                value={rotation} 
                                onChange={handleSliderChange}
                                className="w-full h-4 bg-[#2D3748] rounded-lg appearance-none cursor-pointer accent-[#4ADE80]"
                                disabled={captchaState === CaptchaState.SUCCESS || captchaState === CaptchaState.VERIFYING}
                            />
                            
                            <div className="flex justify-between text-xs text-[#ADCDE2]/50 uppercase font-sans">
                                <span>L</span>
                                <span>R</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4 border-t-2 border-[#2EBCDA]/20">
                            <PixelButton
                                variant="secondary"
                                onClick={() => {
                                    posthog.capture('captcha_reset', {
                                        captcha_type: 'screw_alignment',
                                        attempts_before_reset: attempts,
                                    });
                                    resetCaptcha();
                                }}
                                disabled={captchaState === CaptchaState.VERIFYING}
                                className="flex items-center gap-2 !px-4"
                                title="Reset Puzzle"
                            >
                                <RefreshIcon />
                            </PixelButton>

                            <PixelButton 
                                variant={captchaState === CaptchaState.FAILURE ? "danger" : "primary"}
                                className="flex-1 flex items-center justify-center gap-2 text-sm md:text-xl"
                                onClick={captchaState === CaptchaState.FAILURE ? resetCaptcha : handleVerify}
                                disabled={captchaState === CaptchaState.VERIFYING || captchaState === CaptchaState.SUCCESS}
                            >
                                {captchaState === CaptchaState.VERIFYING ? "PROCESSING..." : 
                                captchaState === CaptchaState.FAILURE ? "RETRY" : 
                                captchaState === CaptchaState.SUCCESS ? "CLEARED" : "VERIFY"}
                                
                                {captchaState === CaptchaState.SUCCESS && <CheckIcon />}
                                {captchaState === CaptchaState.FAILURE && <XIcon />}
                            </PixelButton>
                        </div>

                    </div>
                    </PixelCard>
                    
                    {/* Footer info */}
                    <div className="text-center text-[#ADCDE2]/40 text-xs font-sans mt-4">
                        BE SMART
                        <br/>
                        Attempts: {attempts}
                    </div>

                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
  );
}
