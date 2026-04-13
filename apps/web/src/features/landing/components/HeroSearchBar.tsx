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
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="group relative border-4 border-black bg-bg-panel shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex items-center p-2 transition-all duration-150 focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <Search className="w-7 h-7 ml-3 text-fs-diamond shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full bg-transparent border-none outline-none font-display text-base md:text-lg tracking-[0.1em] text-foreground p-4 placeholder:text-foreground/40 uppercase"
        />
        <PixelButton
          variant="diamond"
          size="lg"
          className="ml-2 py-4 px-8 text-base shadow-none hover:shadow-none active:shadow-none active:translate-x-0 active:translate-y-0 shrink-0"
        >
          {buttonText}
        </PixelButton>
      </div>
    </div>
  );
}
