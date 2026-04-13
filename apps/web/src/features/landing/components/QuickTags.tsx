import PixelButton from "@/components/ui/PixelButton";

interface QuickTagsProps {
  lang: string;
}

export default function QuickTags({ lang }: QuickTagsProps) {
  const tags = ["SURVIVAL", "PVP", "FACTION", "SKYBLOCK", "MINIGAMES"];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
      <span className="font-ui text-sm tracking-widest text-foreground/60 mr-2 md:mr-4">
        POPULAR:
      </span>
      {tags.map((tag) => (
        <PixelButton
          key={tag}
          variant="outline"
          size="sm"
          href={`/${lang}/discover?tag=${tag.toLowerCase()}`}
          className="text-xs py-2 px-3 border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-foreground/50 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          {tag}
        </PixelButton>
      ))}
    </div>
  );
}
