import PixelButton from "@/components/ui/PixelButton";

interface QuickTagsProps {
  lang: string;
  label?: string;
  tags?: string[];
}

const DEFAULT_TAGS = ["SURVIVAL", "PVP", "FACTION", "SKYBLOCK", "MINIGAMES"];

export default function QuickTags({
  lang,
  label = "POPULAR",
  tags = DEFAULT_TAGS,
}: QuickTagsProps) {
  const resolvedTags = tags.length > 0 ? tags : DEFAULT_TAGS;

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:mt-6">
      <span className="mr-2 font-ui text-sm tracking-widest text-foreground/60 md:mr-4">
        {label}:
      </span>
      {resolvedTags.map((tag) => (
        <PixelButton
          key={tag}
          variant="outline"
          size="sm"
          href={`/${lang}/discover?tag=${encodeURIComponent(tag.toLowerCase())}`}
          className="text-xs py-2 px-3 border-foreground/30 text-foreground hover:bg-foreground/10 hover:border-foreground/50 shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
        >
          {tag}
        </PixelButton>
      ))}
    </div>
  );
}
