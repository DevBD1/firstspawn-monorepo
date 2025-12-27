import React from 'react';
import { motion } from 'framer-motion';

interface PixelHeroProps {
    isWalking: boolean;
}

const PixelHero: React.FC<PixelHeroProps> = ({ isWalking }) => {
    // A simple SVG representation of a pixel hero
    return (
        <div className="relative w-24 h-24 md:w-36 md:h-36">
            <motion.div
                animate={isWalking ? { y: [0, -4, 0] } : { y: 0 }}
                transition={{ repeat: Infinity, duration: 0.3, ease: "linear" }}
                className="w-full h-full"
            >
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-xl">
                    {/* Cape/Hair Flowing */}
                    <path d="M4 6H8V8H10V10H12V12H10V14H8V16H4V6Z" fill="#DC2626" />
                    
                    {/* Body/Armor */}
                    <path d="M10 6H14V8H16V14H14V16H12V20H10V16H8V14H10V6Z" fill="#4B5563" />
                    <path d="M12 8H14V12H12V8Z" fill="#9CA3AF" />
                    
                    {/* Legs */}
                    <path d="M10 20H12V24H8V22H10V20Z" fill="#1F2937" />
                    <path d="M14 20H16V22H18V24H14V20Z" fill="#1F2937" />

                    {/* Sword */}
                    <path d="M16 10H20V12H22V14H20V16H18V14H16V10Z" fill="#E5E7EB" />
                    <path d="M16 14H18V18H16V14Z" fill="#9CA3AF" />
                    
                    {/* Head */}
                    <path d="M10 2H14V6H10V2Z" fill="#FCA5A5" /> 
                    <path d="M11 3H12V4H11V3Z" fill="#000" />
                </svg>
            </motion.div>
        </div>
    );
};

export default PixelHero;
