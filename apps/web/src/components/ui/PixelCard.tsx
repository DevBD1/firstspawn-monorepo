import type { ReactNode } from "react";
import { PageSurface, joinClasses } from "./PagePrimitives";

export interface PixelCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

export default function PixelCard({ children, className, title }: PixelCardProps) {
  return (
    <PageSurface className={joinClasses("bg-bg-panel/95 p-1", className)}>
      <div className="h-full w-full border-2 border-fs-diamond/30 bg-background/60 p-4">
        {title ? (
          <div className="mb-4 w-full border-b-2 border-fs-diamond/30 pb-2 text-center">
            <h2 className="font-display text-2xl tracking-widest text-success">{title}</h2>
          </div>
        ) : null}
        {children}
      </div>
    </PageSurface>
  );
}
