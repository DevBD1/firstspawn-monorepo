import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import PixelButton from "@/components/ui/PixelButton";

interface ChatComposerProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUpdate: (value: string) => void;
  placeholder: string;
  submitLabel: string;
  value: string;
}

/**
 * Shared single-line chat input used by demo and live chat surfaces.
 */
export default function ChatComposer({
  onSubmit,
  onUpdate,
  placeholder,
  submitLabel,
  value,
}: ChatComposerProps) {
  return (
    <form onSubmit={onSubmit} className="mt-auto">
      <div className="flex items-stretch gap-3 border-4 border-black bg-background/80 p-2 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <input
          type="text"
          value={value}
          onChange={(event) => onUpdate(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 font-body text-sm text-foreground outline-none placeholder:text-foreground/35 sm:text-[15px]"
        />
        <PixelButton
          type="submit"
          size="md"
          variant="diamond"
          className="shrink-0 px-4 text-[10px]"
          aria-label={submitLabel}
        >
          <span className="inline-flex items-center gap-2">
            <SendHorizontal className="h-4 w-4" aria-hidden="true" />
            <span>{submitLabel}</span>
          </span>
        </PixelButton>
      </div>
    </form>
  );
}
