import Link from "next/link";
import { Activity, Gamepad2, Globe } from "lucide-react";
import { motion } from "framer-motion";

interface ServerCardProps {
  id: string;
  slug: string;
  name: string;
  gameVersion: string;
  onlinePlayers: number;
  maxPlayers: number;
  isOnline: boolean;
  modsRequired: boolean;
  lang: string;
}

export default function ServerCard({
  id,
  slug,
  name,
  gameVersion,
  onlinePlayers,
  maxPlayers,
  isOnline,
  modsRequired,
  lang,
}: ServerCardProps) {
  return (
    <Link
      href={`/${lang}/server/${slug}`}
      className="group block border-4 border-black bg-bg-panel shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-150 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
    >
      <div className="flex flex-col gap-4 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg md:text-xl tracking-[0.1em] text-foreground group-hover:text-fs-diamond transition-colors duration-150 truncate max-w-[60%]">
            {name}
          </h3>
          <div className="flex items-center gap-2 border-2 border-black bg-background px-3 py-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <span className="font-ui text-sm tracking-widest text-foreground">
              {onlinePlayers} <span className="opacity-50">/ {maxPlayers}</span>
            </span>
            <span className="relative flex h-3 w-3 items-center justify-center">
              {isOnline ? (
                <motion.span
                  className="relative inline-flex h-2.5 w-2.5 bg-success border border-black"
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <span className="relative inline-flex h-2.5 w-2.5 bg-danger border border-black" />
              )}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-1 border-2 border-black bg-background p-2 text-center items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Globe className="h-5 w-5 text-fs-diamond mb-1" />
            <span className="font-ui text-[10px] tracking-widest text-foreground/60">VERSION</span>
            <span className="font-body text-xs font-bold text-foreground">{gameVersion}</span>
          </div>
          <div className="flex flex-col gap-1 border-2 border-black bg-background p-2 text-center items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Activity className="h-5 w-5 text-fs-diamond mb-1" />
            <span className="font-ui text-[10px] tracking-widest text-foreground/60">PING</span>
            <span className="font-body text-xs font-bold text-foreground">
              {isOnline ? "GOOD" : "N/A"}
            </span>
          </div>
          <div className="flex flex-col gap-1 border-2 border-black bg-background p-2 text-center items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <Gamepad2 className="h-5 w-5 text-fs-diamond mb-1" />
            <span className="font-ui text-[10px] tracking-widest text-foreground/60">MODS</span>
            <span className="font-body text-xs font-bold text-foreground">
              {modsRequired ? "YES" : "NO"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
