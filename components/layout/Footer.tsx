"use client";

import { useState } from "react";
import type { Locale } from "../../lib/i18n-config";
import PixelButton from "../pixel/PixelButton";
import { 
    ShieldCheck, 
    Activity, 
    Database, 
    Heart, 
    Twitch, 
    Twitter, 
    Github, 
    Youtube, 
    MessageCircle,
    ChevronDown
} from "lucide-react";

interface FooterProps {
    lang: Locale;
    dictionary: {
        footer: {
            cta: {
                title: string;
                titleHighlight: string;
                subtitle: string;
                getStarted: string;
                owners: string;
            };
            stats: {
                title: string;
                fakeVotes: string;
                fakeVotesValue: string;
                uptime: string;
                uptimeValue: string;
                filters: string;
                filtersValue: string;
            };
            brand: {
                name: string;
                description: string;
            };
            columns: {
                platform: {
                    title: string;
                    about: string;
                    trust: string;
                    badges: string;
                    api: string;
                };
                resources: {
                    title: string;
                    help: string;
                    api: string;
                    community: string;
                    partners: string;
                };
                legal: {
                    title: string;
                    terms: string;
                    privacy: string;
                    cookie: string;
                    acceptable: string;
                };
            };
            bottom: {
                copyright: string;
                systemsNormal: string;
                version: string;
                crafted: string;
            };
        };
    };
}

export default function Footer({ lang, dictionary }: FooterProps) {
    const SOCIAL_LINKS = [
        { platform: 'Discord', href: '#', icon: MessageCircle },
        { platform: 'Twitter', href: '#', icon: Twitter },
        { platform: 'GitHub', href: '#', icon: Github },
    ];
    
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const FooterSection = ({ 
        id, 
        title, 
        children 
    }: { 
        id: string; 
        title: string; 
        children: React.ReactNode 
    }) => (
        <div className="border-b border-gray-800 md:border-none pb-4 md:pb-0">
            <button 
                onClick={() => toggleSection(id)}
                className="w-full flex items-center justify-between py-2 md:py-0 md:cursor-default"
            >
                <h3 className="pixel-font text-xs text-white uppercase">{title}</h3>
                <ChevronDown 
                    size={16} 
                    className={`text-gray-500 transition-transform duration-200 md:hidden ${openSections[id] ? 'rotate-180' : ''}`} 
                />
            </button>
            <div className={`
                ${openSections[id] ? 'block' : 'hidden'} 
                md:block mt-4 md:mt-6 transition-all duration-200
            `}>
                <ul className="space-y-3 font-sans text-xl">
                    {children}
                </ul>
            </div>
        </div>
    );

    return (
        <footer className="bg-footer-bg border-t-8 border-footer-border relative overflow-hidden">
             {/* Decorative Pixel Grid Background */}
             <div className="absolute inset-0 opacity-5 pointer-events-none" 
                  style={{ backgroundImage: 'radial-gradient(var(--footer-grid) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
             </div>

             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                
                {/* Top Section: CTA & Stats */}
                <div className="hidden md:grid md:grid-cols-2 gap-8 mb-16 border-b-4 border-gray-800 pb-12">
                   <div>
                     <h2 className="pixel-font text-xl md:text-2xl text-white mb-4 leading-relaxed">
                       {dictionary.footer.cta.title} <br/><span className="text-accent-cyan">{dictionary.footer.cta.titleHighlight}</span>
                     </h2>
                     <p className="font-sans text-xl text-gray-400 max-w-md mb-6">
                       {dictionary.footer.cta.subtitle}
                     </p>
                     <div className="flex flex-wrap gap-4">
                       <PixelButton>{dictionary.footer.cta.getStarted}</PixelButton>
                       <PixelButton variant="outline">{dictionary.footer.cta.owners}</PixelButton>
                     </div>
                   </div>
                   
                   <div className="flex flex-col justify-center items-start md:items-end space-y-4">
                      <div className="bg-[#1a1a1a] p-4 border-2 border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] w-full max-w-sm hidden md:block">
                        <div className="flex items-center space-x-3 mb-2">
                           <ShieldCheck className="text-success" />
                           <span className="pixel-font text-xs text-success">{dictionary.footer.stats.title}</span>
                        </div>
                        <div className="space-y-2 font-sans text-lg text-gray-300">
                           <div className="flex justify-between">
                             <span>{dictionary.footer.stats.fakeVotes}</span>
                             <span className="text-white">{dictionary.footer.stats.fakeVotesValue}</span>
                           </div>
                           <div className="flex justify-between">
                             <span>{dictionary.footer.stats.uptime}</span>
                             <span className="text-white">{dictionary.footer.stats.uptimeValue}</span>
                           </div>
                           <div className="flex justify-between">
                             <span>{dictionary.footer.stats.filters}</span>
                             <span className="text-accent-cyan">{dictionary.footer.stats.filtersValue}</span>
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Main Links Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                  
                  <div className="col-span-2 lg:col-span-2">
                     <div className="flex items-center mb-6">
                        <div className="w-8 h-8 bg-fs-diamond border-2 border-black mr-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                        <span className="pixel-font text-white">{dictionary.footer.brand.name}</span>
                     </div>
                     <p className="font-sans text-lg text-gray-500 mb-6 max-w-xs">
                       {dictionary.footer.brand.description}
                     </p>
                     <div className="flex space-x-4">
                        {SOCIAL_LINKS.map(link => {
                          const Icon = link.icon;
                          return (
                            <a 
                              key={link.platform}
                              href={link.href}
                              className="text-gray-400 hover:text-accent-cyan transition-transform hover:-translate-y-1"
                              aria-label={link.platform}
                            >
                              <Icon size={24} />
                            </a>
                          )
                        })}
                     </div>
                  </div>

                  <FooterSection id="platform" title={dictionary.footer.columns.platform.title}>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.platform.about}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.platform.trust}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.platform.badges}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.platform.api}</a></li>
                  </FooterSection>

                  <FooterSection id="resources" title={dictionary.footer.columns.resources.title}>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.resources.help}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.resources.api}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.resources.community}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.resources.partners}</a></li>
                  </FooterSection>

                  <FooterSection id="legal" title={dictionary.footer.columns.legal.title}>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.legal.terms}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.legal.privacy}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.legal.cookie}</a></li>
                      <li><a href="#" className="text-gray-500 hover:text-accent-cyan transition-colors">{dictionary.footer.columns.legal.acceptable}</a></li>
                  </FooterSection>

                </div>

                {/* Bottom Bar */}
                <div className="border-t-4 border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 font-sans text-lg">
                   <p>{dictionary.footer.bottom.copyright.replace('{year}', new Date().getFullYear().toString())}</p>
                   <div className="flex space-x-6 mt-4 md:mt-0">
                      <div className="flex items-center space-x-2">
                        <Activity size={16} />
                        <span>{dictionary.footer.bottom.systemsNormal}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Database size={16} />
                        <span>{dictionary.footer.bottom.version}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-red-500">
                         <Heart size={16} fill="currentColor" />
                         <span>{dictionary.footer.bottom.crafted}</span>
                      </div>
                   </div>
                </div>
             </div>
        </footer>
    );
}
