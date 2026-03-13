import type { ReactNode } from "react";

export interface PixelCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function PixelCard({ children, className, title }: PixelCardProps) {
  return (
    <div
      className={[
        "relative bg-[#0B131A] border-4 border-black p-1 shadow-[8px_8px_0_rgba(0,0,0,0.5)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute -top-1 -left-1 h-2 w-2 bg-[#2EBCDA]" />
      <div className="absolute -top-1 -right-1 h-2 w-2 bg-[#2EBCDA]" />
      <div className="absolute -bottom-1 -left-1 h-2 w-2 bg-[#2EBCDA]" />
      <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-[#2EBCDA]" />

      <div className="h-full w-full border-2 border-[#2EBCDA]/40 bg-[#0B131A] p-4">
        {title ? (
          <div className="mb-4 w-full border-b-2 border-[#2EBCDA]/40 pb-2 text-center">
            <h2 className="font-display text-2xl tracking-widest text-[#4ADE80] animate-pulse">
              {title}
            </h2>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
