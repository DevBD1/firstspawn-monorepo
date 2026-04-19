import { Search } from "lucide-react";
import PixelButton from "@/components/ui/PixelButton";

interface HeroSearchBarProps {
  placeholder?: string;
  buttonText?: string;
}

export default function HeroSearchBar({
  placeholder = "SEARCH FOR A GAME SERVER...",
  buttonText = "FIND",
}: HeroSearchBarProps) {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div className="group relative flex items-center border-4 border-black bg-bg-panel p-2 shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all duration-150 focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <Search className="w-7 h-7 ml-3 text-fs-diamond shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          aria-label={placeholder}
          className="w-full bg-transparent border-none p-4 font-display text-sm tracking-[0.1em] text-foreground uppercase outline-none placeholder:text-foreground/40 md:text-lg"
        />
        <PixelButton
          variant="diamond"
          size="lg"
          className="ml-2 shrink-0 px-5 py-4 text-sm shadow-none hover:shadow-none active:translate-x-0 active:translate-y-0 active:shadow-none md:px-8 md:text-base"
        >
          {buttonText}
        </PixelButton>
      </div>
    </div>
  );
}
