'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import posthog from 'posthog-js';
import PixelButton from '../pixel/PixelButton';
import NewsletterCaptcha from '../captcha/NewsletterCaptcha';

interface LandingPageProps {
    lang: string;
    dictionary: Record<string, any>;
}

// Animated pixelated construction worker/crane component
const ConstructionWorker = () => {
    return (
        <motion.div 
            className="relative"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
            {/* Hard Hat */}
            <div className="w-8 h-4 bg-[#FFD700] rounded-t-sm mx-auto border-b-2 border-[#DAA520]" />
            {/* Head */}
            <div className="w-6 h-6 bg-[#FDBF6F] mx-auto" />
            {/* Body */}
            <div className="w-8 h-8 bg-[#FF6B00] mx-auto border-2 border-[#CC5500]" />
            {/* Legs */}
            <div className="flex justify-center gap-1">
                <motion.div 
                    className="w-3 h-6 bg-[#4A4A4A]"
                    animate={{ rotate: [-5, 5, -5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
                <motion.div 
                    className="w-3 h-6 bg-[#4A4A4A]"
                    animate={{ rotate: [5, -5, 5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
            </div>
        </motion.div>
    );
};

// Animated crane hook
const CraneHook = () => {
    return (
        <motion.div 
            className="absolute top-0 right-[15%]"
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: 'top center' }}
        >
            {/* Cable */}
            <div className="w-1 h-32 bg-[#666] mx-auto" />
            {/* Hook */}
            <div className="w-6 h-3 bg-[#FF6B00] mx-auto rounded-b-lg border-2 border-[#CC5500]" />
            {/* Dangling server block */}
            <motion.div 
                className="w-12 h-8 bg-[#2EBCDA] mx-auto mt-1 border-2 border-[#1A8A9F] flex items-center justify-center"
                animate={{ rotate: [-3, 3, -3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse" />
            </motion.div>
        </motion.div>
    );
};

// Animated construction barrier
const ConstructionBarrier = ({ delay = 0 }: { delay?: number }) => {
    return (
        <motion.div 
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <div className="w-16 h-12 relative">
                {/* Stripes */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <motion.div 
                            key={i}
                            className="h-3 bg-gradient-to-r from-[#FFD700] via-[#1A1A1A] to-[#FFD700]"
                            style={{ backgroundSize: '200% 100%' }}
                            animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                    ))}
                </div>
            </div>
            {/* Post */}
            <div className="w-3 h-8 bg-[#FF6B00]" />
        </motion.div>
    );
};

// Floating pixel blocks animation
const FloatingBlocks = () => {
    const blocks = [
        { size: 12, color: '#2EBCDA', delay: 0, x: '10%', duration: 4 },
        { size: 8, color: '#4ADE80', delay: 0.5, x: '30%', duration: 5 },
        { size: 16, color: '#FFD700', delay: 1, x: '60%', duration: 3.5 },
        { size: 10, color: '#FF6B00', delay: 1.5, x: '80%', duration: 4.5 },
        { size: 6, color: '#2EBCDA', delay: 2, x: '90%', duration: 3 },
    ];
    
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {blocks.map((block, i) => (
                <motion.div
                    key={i}
                    className="absolute bottom-0"
                    style={{ 
                        left: block.x,
                        width: block.size,
                        height: block.size,
                        backgroundColor: block.color,
                        boxShadow: `inset -2px -2px 0 rgba(0,0,0,0.3), inset 2px 2px 0 rgba(255,255,255,0.2)`
                    }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ 
                        y: [0, -300, -300],
                        opacity: [0, 1, 0]
                    }}
                    transition={{ 
                        duration: block.duration, 
                        repeat: Infinity, 
                        delay: block.delay,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};

export default function LandingPage({ lang, dictionary }: LandingPageProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [confirmEmailSent, setConfirmEmailSent] = useState(false);
    const [email, setEmail] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Loading dots animation
    const [dots, setDots] = useState('');
    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        // Check for confirmation param
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === 'true') {
            setIsSubscribed(true);
        }

        // Initialize retro click sound
        audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3'); 
        audioRef.current.volume = 0.4;
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

    const landing = dictionary.landing || {};

    return (
        <div className="relative min-h-[calc(100vh-80px)] w-full overflow-hidden flex items-center justify-center">
             
            {/* Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0B0B15] via-[#1A1025] to-[#2D1B4E]">
                {/* Stars */}
                <div className="absolute inset-0 opacity-40 animate-pulse" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                
                {/* Grid Floor */}
                <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-[linear-gradient(to_right,rgba(46,188,218,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(46,188,218,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [transform:perspective(500px)_rotateX(60deg)] origin-bottom opacity-50" />
                
                {/* Floating blocks */}
                <FloatingBlocks />
            </div>

            {/* Crane Hook */}
            <CraneHook />

            {/* Construction Barriers */}
            <div className="absolute bottom-[10%] left-0 right-0 flex justify-around px-8 z-10">
                <ConstructionBarrier delay={0.2} />
                <ConstructionBarrier delay={0.4} />
                <ConstructionBarrier delay={0.6} />
            </div>

            {/* Main Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-20 bg-[#060B10] border-4 border-[#FFD700] p-8 md:p-12 max-w-4xl w-full text-center mx-4"
                style={{
                    boxShadow: '8px 8px 0 #CC5500, 0 0 60px rgba(255,215,0,0.2)',
                }}
            >
                {/* Construction Warning Top */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD700] px-6 py-2 border-2 border-[#1A1A1A]">
                    <span className="text-[#1A1A1A] font-bold pixel-font text-sm tracking-wider">
                        ⚠ {landing.under_construction || "UNDER CONSTRUCTION"} ⚠
                    </span>
                </div>

                {/* Title */}
                <motion.h1 
                    className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFD700] to-[#FF6B00] mb-4 pixel-font tracking-tight mt-4"
                    animate={{ textShadow: ['0 0 20px rgba(255,215,0,0.5)', '0 0 40px rgba(255,215,0,0.8)', '0 0 20px rgba(255,215,0,0.5)'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    {dictionary.common?.brand || "FIRSTSPAWN"}
                </motion.h1>

                {/* Main Message */}
                <div className="mb-8 p-6 bg-[#0F161C] border-2 border-dashed border-[#FFD700]/50 relative">
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FFD700]" />
                    <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FFD700]" />
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FFD700]" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FFD700]" />

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <ConstructionWorker />
                            <div className="text-left">
                        <h2 className="text-lg md:text-xl text-[#2EBCDA] pixel-font mb-2">
                                    {landing.building_title || "BUILDING THE ULTIMATE DISCOVERY ECOSYSTEM"}
                                </h2>
                                <p className="text-[#6D8A99] font-mono text-sm">
                                    {landing.status || "STATUS"}: <span className="text-[#4ADE80]">{landing.active || "ACTIVE"}{dots}</span>
                                </p>
                            </div>
                        </div>

                        <p className="text-[#9CA3AF] font-mono text-sm md:text-base leading-relaxed mb-4 max-w-xl mx-auto">
                            {landing.building_desc || "More than just a server list — FirstSpawn is a social network for Minecraft & Hytale players. Sync your cross-platform identity, leave reviews backed by verified playtime, solve puzzles to win prizes, form Guilds, and earn reputation badges."}
                        </p>

                        {/* Progress Bar */}
                        <div className="max-w-md mx-auto">
                            <div className="flex justify-between text-xs font-mono text-[#6D8A99] mb-2">
                                <span>{landing.progress || "PROGRESS"}</span>
                                <span>42%</span>
                            </div>
                            <div className="h-4 bg-[#1A2633] border border-[#2EBCDA]/30 overflow-hidden">
                                <motion.div 
                                    className="h-full bg-gradient-to-r from-[#4ADE80] via-[#2EBCDA] to-[#4ADE80]"
                                    style={{ backgroundSize: '200% 100%' }}
                                    initial={{ width: '0%' }}
                                    animate={{ 
                                        width: '42%',
                                        backgroundPosition: ['0% 0%', '100% 0%']
                                    }}
                                    transition={{ 
                                        width: { duration: 1.5, ease: "easeOut" },
                                        backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" }
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Features Coming */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: '⛏️', label: landing.feature_servers || 'MINECRAFT & HYTALE' },
                        { icon: '⏱️', label: landing.feature_verified || 'VERIFIED PLAYTIME' },
                        { icon: '🏰', label: landing.feature_uptime || 'GUILDS & BADGES' },
                        { icon: '🏆', label: landing.feature_anticheat || 'WIN PRIZES' },
                    ].map((feature, i) => (
                        <motion.div 
                            key={i}
                            className="p-3 bg-[#0F161C] border border-[#2EBCDA]/20 hover:border-[#2EBCDA]/60 transition-colors"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <div className="text-2xl mb-1">{feature.icon}</div>
                            <div className="text-[8px] md:text-xs font-mono text-[#6D8A99]">{feature.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Newsletter Signup */}
                <div className="space-y-4 max-w-lg mx-auto">
                    <div>
                        <h3 className="text-white font-pixel text-lg md:text-xl mb-2 tracking-wide">
                            {landing.notify_title || "BE FIRST TO SPAWN"}
                        </h3>
                        <p className="text-[#6D8A99] text-[10px] md:text-xs font-mono leading-relaxed">
                            {landing.notify_desc || "Join thousands of players waiting for launch. Early subscribers get exclusive access & founding member perks!"}
                        </p>
                    </div>

                    {isSubscribed ? (
                        <div className="p-4 bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] font-pixel text-center animate-pulse">
                            {landing.subscription_verified || "SUBSCRIPTION VERIFIED"}
                        </div>
                    ) : confirmEmailSent ? (
                        <div className="p-4 bg-[#2EBCDA]/10 border border-[#2EBCDA]/30 text-[#2EBCDA] font-pixel text-center">
                            {landing.check_inbox || "CHECK YOUR INBOX"}
                        </div>
                    ) : (
                        <form className="flex flex-col sm:flex-row gap-0 items-stretch border-2 border-[#FFD700]/40 hover:border-[#FFD700]/80 transition-colors group" onSubmit={handleSubscribe}>
                            <input 
                                type="email" 
                                placeholder={dictionary.common?.enter_email || "Enter your email"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-grow bg-[#0B131A]/50 text-white px-6 py-4 font-mono text-sm focus:outline-none placeholder-[#4B5563]"
                                required
                            />
                            <PixelButton type="submit" variant="primary" className="!bg-[#FFD700] !text-[#0F161C] !border-none !rounded-none min-w-[120px] font-bold tracking-wider hover:brightness-110 !m-0">
                                {landing.notify_btn || dictionary.common?.scribe || "NOTIFY ME"}
                            </PixelButton>
                        </form>
                    )}

                    {statusMessage && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[#2EBCDA] font-mono text-sm"
                        >
                            {statusMessage}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Global Vignette */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40 z-30" />
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-30 mix-blend-overlay" />

            <NewsletterCaptcha 
                isOpen={showCaptcha} 
                onClose={() => setShowCaptcha(false)} 
                onVerify={handleVerifySuccess} 
            />
        </div>
    );
}
