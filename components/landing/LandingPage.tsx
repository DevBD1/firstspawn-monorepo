'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';
import PixelHero from './PixelHero';
import PixelButton from '../pixel/PixelButton';
import NewsletterCaptcha from '../captcha/NewsletterCaptcha';

// Enum for state
enum AppState {
    IDLE = 'IDLE',
    WALKING = 'WALKING',
    ARRIVED = 'ARRIVED'
}

interface LandingPageProps {
    lang: string;
    dictionary: any; // We can type this properly if we read dictionary types, but any is fine for now
}

export default function LandingPage({ lang, dictionary }: LandingPageProps) {
    const [appState, setAppState] = useState<AppState>(AppState.IDLE);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    // Hytale Launch Date: Jan 13, 2026 04:00:00
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [confirmEmailSent, setConfirmEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        // Check for confirmation param
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === 'true') {
            setIsSubscribed(true);
        }

        // Initialize retro click/jump sound
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'); 
        audioRef.current.volume = 0.4;

        const targetDate = new Date('2026-01-13T18:00:00');
        const interval = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);
                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        posthog.capture('newsletter_form_submitted', {
            email_domain: email.split('@')[1] || 'unknown',
            language: lang,
        });
        setShowCaptcha(true);
    };

    const handleVerifySuccess = async () => {
        // Trigger server action
        setShowCaptcha(false);
        setStatusMessage('INITIATING LINK...');
        
        // Dynamic import to avoid server-only module issues in client component if strict
        const { subscribeToNewsletter } = await import('@/app/actions/newsletter');
        const result = await subscribeToNewsletter(email);

        if (result.success) {
            setConfirmEmailSent(true);
            setStatusMessage('');
        } else {
            setStatusMessage(result.message || 'ERROR. TRY AGAIN.');
            setTimeout(() => setStatusMessage(''), 3000);
        }
    };

    const handleStart = () => {
        if (appState !== AppState.IDLE) return;

        // Track intro started event
        posthog.capture('intro_started', {
            language: lang,
        });

        // Play sound
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }

        setAppState(AppState.WALKING);
        
        // Walk duration ~1.5s
        setTimeout(() => {
            setAppState(AppState.ARRIVED);
        }, 1500);
    };

    return (
        <div className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center p-4">
            {/* 
              MAIN CONTENT (Visible underneath or after overlay)
              On mobile (max-md), we show this immediately.
            */}
            <div className={`transition-all duration-1000 flex flex-col md:flex-row items-center gap-16 ${appState === AppState.ARRIVED ? 'opacity-100 translate-y-0' : 'max-md:opacity-100 max-md:translate-y-0 opacity-0 translate-y-10'}`}>
                
                {/* Character stands next to the box when arrived */}
                 <div className="hidden md:block">
                     <PixelHero isWalking={false} />
                 </div>

                <div className="bg-[#0B131A]/95 border-4 border-[#2EBCDA]/40 p-8 rounded-none max-w-4xl w-full text-center shadow-[8px_8px_0_rgba(0,0,0,0.5)] relative">
                    {/* Connection Line decoration */}
                     <div className="hidden md:block absolute left-[-64px] top-1/2 w-16 h-1 bg-[#2EBCDA]/40" />
                    
                    <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#2EBCDA] to-[#4ADE80] mb-2 pixel-font tracking-tighter">
                        {dictionary.common.brand || "FIRSTSPAWN"}
                    </h1>
                    <p className="text-[#ADCDE2] mb-8 text-sm md:text-xl font-retro uppercase tracking-widest opacity-80">
                        {dictionary.common.tagline || "Verified Discovery Node"}
                    </p>

                    {/* Countdown */}
                    <div className="mb-12 p-6 bg-black/80 border-2 border-[#2EBCDA]/30 w-full max-w-2xl mx-auto pixel-border-dark relative overflow-hidden group hover:border-[#4ADE80]/50 transition-colors">
                         <div className="absolute inset-0 bg-[#2EBCDA]/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        <p className="text-xs text-[#2EBCDA] mb-4 uppercase tracking-widest pixel-font">Hytale Launch Protocol</p>
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div className="flex flex-col items-center">
                                <div className="text-2xl md:text-5xl font-bold text-white mb-2 pixel-font drop-shadow-[0_0_10px_rgba(46,188,218,0.3)]">{timeLeft.days}</div>
                                <div className="text-[10px] md:text-xs text-[#ADCDE2]/60 font-retro uppercase tracking-widest">DAYS</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-2xl md:text-5xl font-bold text-white mb-2 pixel-font drop-shadow-[0_0_10px_rgba(46,188,218,0.3)]">{timeLeft.hours}</div>
                                <div className="text-[10px] md:text-xs text-[#ADCDE2]/60 font-retro uppercase tracking-widest">HOURS</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-2xl md:text-5xl font-bold text-white mb-2 pixel-font drop-shadow-[0_0_10px_rgba(46,188,218,0.3)]">{timeLeft.minutes}</div>
                                <div className="text-[10px] md:text-xs text-[#ADCDE2]/60 font-retro uppercase tracking-widest">MINS</div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="text-2xl md:text-5xl font-bold text-white mb-2 pixel-font drop-shadow-[0_0_10px_rgba(46,188,218,0.3)]">{timeLeft.seconds}</div>
                                <div className="text-[10px] md:text-xs text-[#ADCDE2]/60 font-retro uppercase tracking-widest">SECS</div>
                            </div>
                        </div>
                        <a
                            href="https://hytale.com/countdown"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#2EBCDA]/50 hover:text-[#4ADE80] font-mono uppercase mt-4 block transition-colors"
                            onClick={() => posthog.capture('external_link_clicked', {
                                link_url: 'https://hytale.com/countdown',
                                link_text: 'hytale.com/countdown',
                                link_location: 'countdown_source',
                            })}
                        >
                            {dictionary.common.source || "Source"}: hytale.com/countdown
                        </a>
                    </div>

                    {/* Newsletter */}
                    <div className="space-y-6 max-w-lg mx-auto">
                        <div>
                            <h3 className="text-lg font-bold text-white pixel-font text-[#4ADE80]">{dictionary.common.join_newsletter_title}</h3>
                            <p className="text-xs text-[#ADCDE2]/70 mt-2 font-retro leading-relaxed">
                                {dictionary.common.join_newsletter_desc}
                            </p>
                        </div>
                        
                        {isSubscribed ? (
                             <div className="bg-[#4ADE80]/10 border-2 border-[#4ADE80] p-4 text-[#4ADE80] font-pixel text-center animate-pulse">
                                 SUBSCRIPTION VERIFIED. WELCOME, TRAVELER.
                             </div>
                        ) : confirmEmailSent ? (
                            <div className="bg-[#2EBCDA]/10 border-2 border-[#2EBCDA] p-4 text-[#2EBCDA] font-pixel text-center">
                                <span className="animate-pulse">CONFIRMATION LINK SENT.</span> <br/> 
                                <span className="text-xs font-sans opacity-70">CHECK YOUR INBOX TO INITIALIZE CONNECTION.</span>
                            </div>
                        ) : (
                            <form className="flex flex-col sm:flex-row gap-0 items-stretch" onSubmit={handleSubscribe}>
                                <input 
                                    type="email" 
                                    placeholder={dictionary.common.enter_email}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="flex-grow bg-[#0B131A] border-2 border-r-0 border-[#2EBCDA]/20 text-white placeholder:text-gray-700 px-4 py-3 font-mono text-sm focus:outline-none focus:border-[#4ADE80] transition-colors"
                                    required
                                />
                                <PixelButton 
                                    type="submit" 
                                    variant="primary"
                                    className="rounded-none sm:w-auto w-full !bg-[#4ADE80] !text-black !border-[#4ADE80]"
                                >
                                    {dictionary.common.scribe}
                                </PixelButton>
                            </form>
                        )}
                        {statusMessage && (
                            <div className="text-xs text-red-400 font-mono mt-2 uppercase">{statusMessage}</div>
                        )}
                    </div>
                </div>
            </div>

            <NewsletterCaptcha 
                isOpen={showCaptcha} 
                onClose={() => setShowCaptcha(false)} 
                onVerify={handleVerifySuccess} 
            />


            {/* 
              INTRO OVERLAY (The Game Scene)
              Hidden on mobile to skip interaction layer.
            */}
            <AnimatePresence>
                {appState !== AppState.ARRIVED && (
                    <motion.div 
                        key="intro-overlay"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, pointerEvents: 'none' }}
                        transition={{ duration: 0.8 }}
                        className="fixed inset-0 z-[200] bg-[#111] overflow-hidden hidden md:flex flex-col items-center justify-center select-none"
                    >
                        {/* Background: Starfield & Planet */}
                        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0B15] via-[#1A1025] to-[#2D1B4E]">
                             {/* Moving Stars */}
                            <div className="absolute inset-0 opacity-40 animate-pulse" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                             {/* Distant Planet/Moon */}
                            <div className="absolute top-[10%] right-[10%] w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl pixelated opacity-60" />
                            <div className="absolute top-[12%] right-[12%] w-24 h-24 md:w-56 md:h-56 rounded-full bg-yellow-100/5 blur-sm" />
                            
                            {/* Grid Floor */}
                             <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-[linear-gradient(to_right,rgba(128,90,213,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,90,213,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50" />
                        </div>

                        {/* Gate (Left Side) - Enhanced */}
                        <div className="absolute left-[-5%] top-0 bottom-0 w-[45%] md:w-[35%] bg-[#080808] z-10 drop-shadow-[20px_0_30px_rgba(0,0,0,0.9)] flex flex-col justify-end"
                             style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)' }}>
                            {/* Gate Texture / Pipes */}
                            <div className="absolute right-0 top-0 bottom-0 w-12 bg-[#111] border-l border-gray-800 flex flex-col justify-around py-10 items-center">
                                 <div className="w-2 h-full bg-gradient-to-b from-purple-900/50 to-purple-600/50 blur-sm" />
                            </div>
                            {/* Control Panel Lights */}
                            <div className="absolute right-[20px] top-[40%] flex flex-col gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                            </div>
                        </div>

                        {/* Click to Start Trigger */}
                        {appState === AppState.IDLE && (
                             <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-50 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/5 transition-colors"
                                onClick={handleStart}
                            >
                                <div className="text-center px-4 mt-[-5%] relative">
                                     {/* Glitch Effect Text - Changed to Hytale Green */}
                                    <motion.h2
                                        animate={{ 
                                            opacity: [1, 0.8, 1],
                                            textShadow: [
                                                "4px 4px 0px #000",
                                                "-2px -2px 0px #2EBCDA",
                                                "4px 4px 0px #000"
                                            ]
                                        }}
                                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                                        className="text-[#4ADE80] text-3xl md:text-6xl tracking-widest uppercase pixel-font mb-4"
                                    >
                                        CLICK TO START
                                    </motion.h2>
                                    <p className="text-[#ADCDE2]/60 text-xs md:text-sm font-mono tracking-[0.5em] animate-pulse">SYSTEM READY</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Character - Hidden on mobile intro as well for cleaner UI */}
                        <div className="absolute bottom-[28%] left-0 w-full z-20 pointer-events-none hidden md:block">
                            <motion.div
                                initial={{ x: '8vw' }} 
                                animate={
                                    appState === AppState.IDLE ? { x: '8vw' } :
                                    appState === AppState.WALKING ? { x: '35vw' } :
                                    { x: '35vw' }
                                }
                                transition={{ 
                                    type: "tween", 
                                    ease: "linear", 
                                    duration: 1.5 
                                }}
                            >
                                <PixelHero isWalking={appState === AppState.WALKING} />
                            </motion.div>
                        </div>
                        
                        {/* Vignette & scanlines */}
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 z-30" />
                        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-30 mix-blend-overlay" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
