"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import posthog from "posthog-js";
import PixelButton from "../pixel/PixelButton";
import { Cookie } from "lucide-react";

interface CookieConsentProps {
    dictionary: {
        cookie_consent: {
            message: string;
            accept: string;
            decline: string;
        };
    };
}

export default function CookieConsent({ dictionary }: CookieConsentProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("cookie_consent");
        if (consent === null) {
            // Small delay to not overwhelm the user immediately
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookie_consent", "true");
        posthog.capture('cookie_consent_accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem("cookie_consent", "false");
        posthog.capture('cookie_consent_declined');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 z-50 w-auto md:max-w-md"
                >
                    <div className="bg-[#1a1a1a] border-4 border-gray-800 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] relative">
                        {/* Pixel Corners */}
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-gray-800" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gray-800" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gray-800" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gray-800" />

                        <div className="flex items-start space-x-4">
                            <div className="bg-gray-800 p-2 border-2 border-dashed border-gray-600 hidden sm:block">
                                <Cookie className="text-accent-cyan w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="font-sans text-gray-300 text-sm leading-relaxed mb-4">
                                    {dictionary.cookie_consent.message}
                                </p>
                                <div className="flex items-center gap-3">
                                    <PixelButton 
                                        variant="success" 
                                        onClick={handleAccept}
                                        className="text-xs py-2"
                                    >
                                        {dictionary.cookie_consent.accept}
                                    </PixelButton>
                                    <PixelButton 
                                        variant="outline" 
                                        onClick={handleDecline}
                                        className="text-xs py-2 opacity-70 hover:opacity-100"
                                    >
                                        {dictionary.cookie_consent.decline}
                                    </PixelButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
