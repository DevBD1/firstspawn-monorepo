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
    dictionary: Record<string, any>;
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
        setShowCaptcha(false);
        setStatusMessage('INITIATING LINK...');
        
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

        posthog.capture('intro_started', {
            language: lang,
        });

        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.log("Audio play failed", e));
        }

        setAppState(AppState.WALKING);
        
        // Walk duration ~2.5s (slightly longer for the pan)
        setTimeout(() => {
            setAppState(AppState.ARRIVED);
        }, 2500);
    };

    return (
        <div className="relative h-[calc(100vh-80px)] w-full overflow-hidden">
             
            {/* 
                THE WORLD CONTAINER 
                - Width: 200% (2 screens)
                - Animates x to -100% (slides left)
            */}
            <motion.div 
                className="flex w-[200%] h-full relative"
                animate={appState === AppState.IDLE ? { x: 0 } : { x: "-50%" }}
                transition={{ 
                    duration: 2.5, 
                    ease: "easeInOut",
                    // Use a slightly delayed easing to give the character a head start? 
                    // Or linear for consistent "camera pan". standard easeInOut is usually fine.
                }}
            >
                {/* 
                    SCREEN 1: START 
                    - Contains the background for the start scene
                    - The Click Trigger
                */}
                        <div className="w-[50%] h-full relative flex items-center justify-center shrink-0">
                    
                     {/* Background Layers for Screen 1 */}
                     <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0B15] via-[#1A1025] to-[#2D1B4E]">
                        {/* Moving Stars */}
                        <div className="absolute inset-0 opacity-40 animate-pulse" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
                        {/* Planet - Left Side */}
                        <div className="absolute top-[10%] left-[10%] w-32 h-32 md:w-64 md:h-64 rounded-full bg-gradient-to-br from-purple-500/20 to-transparent blur-xl pixelated opacity-60" />
                        
                        {/* Gate/Structure on the left edge just for show */}
                         <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-black/20" />
                    </div>

                    {/* Click Trigger */}
                    <AnimatePresence>
                        {appState === AppState.IDLE && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="z-20 cursor-pointer text-center"
                                onClick={handleStart}
                            >
                                <motion.h2
                                    animate={{ 
                                        textShadow: [
                                            "4px 4px 0px #000",
                                            "-2px -2px 0px #2EBCDA",
                                            "4px 4px 0px #000"
                                        ]
                                    }}
                                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                                    className="text-[#4ADE80] text-3xl md:text-5xl tracking-widest uppercase pixel-font mb-4 drop-shadow-[0_4px_0_rgba(0,0,0,1)]"
                                >
                                    {dictionary.landing?.click_to_start || "CLICK TO START"}
                                </motion.h2>
                                <p className="text-[#ADCDE2]/60 text-xs md:text-sm font-mono tracking-[0.5em] animate-pulse">
                                    {dictionary.landing?.system_ready || "SYSTEM READY"}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>


                {/* 
                    SCREEN 2: CONTENT 
                    - Contains the Subscription Box
                */}
                <div className="w-[50%] h-full relative flex items-center justify-center shrink-0 bg-[#0B131A]">
                     {/* Background for Screen 2 (Seamless transition ideally, or distinct) */}
                     <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#2D1B4E] via-[#1A1025] to-[#0B0B15]">
                          {/* Grid Floor */}
                        <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-[linear-gradient(to_right,rgba(46,188,218,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,188,218,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50" />
                     </div>

                    {/* Content Box */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={appState === AppState.ARRIVED ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.95 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="relative z-10 bg-[#060B10] border-2 border-[#2EBCDA] p-8 md:p-12 rounded-sm max-w-4xl w-full text-center shadow-[0_0_40px_rgba(46,188,218,0.1)] mx-4"
                    >
                         <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#2EBCDA] to-[#2EBCDA]/80 mb-2 pixel-font tracking-tight drop-shadow-[0_4px_0_rgba(0,0,0,0.5)]">
                            {dictionary.common.brand || "FIRSTSPAWN"}
                        </h1>
                        <p className="text-[#6D8A99] mb-10 text-xs md:text-sm font-mono uppercase tracking-[0.2em]">
                            {dictionary.common.tagline || "Verified Discovery Node"}
                        </p>

                        {/* Countdown */}
                        <div className="mb-10 p-6 bg-[#0F161C] border border-[#1A2633] w-full max-w-2xl mx-auto relative shadow-inner">
                            <div className="text-[#2EBCDA] text-[10px] md:text-xs font-mono mb-4 tracking-widest uppercase opacity-80">
                                {dictionary.landing?.launch_protocol || "HYTALE LAUNCH PROTOCOL"}
                            </div>
                             <div className="grid grid-cols-4 gap-2 md:gap-8 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl md:text-5xl font-bold text-[#E5E7EB] pixel-font">{timeLeft.days}</div>
                                    <div className="text-[9px] text-[#4B5563] font-mono mt-2 uppercase tracking-wider">
                                        {dictionary.landing?.countdown?.days || "DAYS"}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl md:text-5xl font-bold text-[#E5E7EB] pixel-font">{timeLeft.hours}</div>
                                    <div className="text-[9px] text-[#4B5563] font-mono mt-2 uppercase tracking-wider">
                                        {dictionary.landing?.countdown?.hours || "HOURS"}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl md:text-5xl font-bold text-[#E5E7EB] pixel-font">{timeLeft.minutes}</div>
                                    <div className="text-[9px] text-[#4B5563] font-mono mt-2 uppercase tracking-wider">
                                        {dictionary.landing?.countdown?.minutes || "MINS"}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="text-3xl md:text-5xl font-bold text-[#E5E7EB] pixel-font">{timeLeft.seconds}</div>
                                    <div className="text-[9px] text-[#4B5563] font-mono mt-2 uppercase tracking-wider">
                                        {dictionary.landing?.countdown?.seconds || "SECS"}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-[8px] text-[#2EBCDA]/40 font-mono text-right hover:text-[#2EBCDA]/60 transition-colors cursor-help">
                                {dictionary.landing?.source || "SOURCE: HYTALE.COM/COUNTDOWN"}
                            </div>
                        </div>

                         <div className="space-y-6 max-w-lg mx-auto">
                            {/* Descriptive Headline */}
                            <div>
                                <h3 className="text-white font-pixel text-xl md:text-2xl mb-2 tracking-wide">
                                    {dictionary.landing?.join_alpha || dictionary.common.join_newsletter_title || "JOIN THE EXPEDITION"}
                                </h3>
                                <p className="text-[#6D8A99] text-[10px] md:text-xs font-mono leading-relaxed">
                                    {dictionary.common.join_newsletter_desc || "No spam - just launch news, previews, and early access opportunities for FirstSpawn.com."}
                                </p>
                            </div>

                            {isSubscribed ? (
                                <div className="p-4 bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] font-pixel text-center animate-pulse">
                                    {dictionary.landing?.subscription_verified || "SUBSCRIPTION VERIFIED"}
                                </div>
                            ) : confirmEmailSent ? (
                                <div className="p-4 bg-[#2EBCDA]/10 border border-[#2EBCDA]/30 text-[#2EBCDA] font-pixel text-center">
                                    {dictionary.landing?.check_inbox || "CHECK YOUR INBOX"}
                                </div>
                            ) : (
                                <form className="flex flex-col sm:flex-row gap-0 items-stretch border border-[#2EBCDA]/20 hover:border-[#2EBCDA]/40 transition-colors group" onSubmit={handleSubscribe}>
                                    <input 
                                        type="email" 
                                        placeholder={dictionary.common.enter_email}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-grow bg-[#0B131A]/50 text-white px-6 py-4 font-mono text-sm focus:outline-none placeholder-[#4B5563]"
                                        required
                                    />
                                    <PixelButton type="submit" variant="primary" className="!bg-[#4ADE80] !text-[#0F161C] !border-none !rounded-none min-w-[120px] font-bold tracking-wider hover:brightness-110 !m-0">
                                        {dictionary.common.scribe}
                                    </PixelButton>
                                </form>
                            )}
                         </div>
                    </motion.div>
                </div>

                {/* 
                    THE WALKING HERO
                    - Absolute position within the WORLD container.
                    - Moves from Center of Screen 1 (~50%) to Left Side of Content in Screen 2 (~130%?)
                */}
                <motion.div
                    className="absolute bottom-[25%] z-30"
                    initial={{ left: "25%", x: "-50%" }}
                    animate={
                        appState === AppState.IDLE ? { left: "25%" } : 
                        // Target: Center of Screen 2 is 75% of total width (since width is 200%).
                        // We want to be slightly left of center to be next to box.
                        { left: "55%" } 
                    }
                    transition={{ 
                        duration: 2.5, 
                        ease: "easeInOut" 
                    }}
                >
                    <PixelHero isWalking={appState === AppState.WALKING} />
                </motion.div>

            </motion.div>


            {/* Global Vignette (Fixed on Screen) */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 z-40" />
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-40 mix-blend-overlay" />

            <NewsletterCaptcha 
                isOpen={showCaptcha} 
                onClose={() => setShowCaptcha(false)} 
                onVerify={handleVerifySuccess} 
            />
        </div>
    );
}
