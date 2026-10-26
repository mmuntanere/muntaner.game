import { cn } from "@/lib/utils";

export function SectionHead({ index, kicker, title, intro, id, className }: { index: string; kicker: string; title: string; intro?: string; id?: string; className?: string }) {
  return (
    <header className={cn("grid gap-6 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-7">
        <p className="hud mb-5 text-dim">
          <span className="text-amber">{index}</span> — {kicker}
        </p>
        <h2 id={id} className="font-display text-[clamp(2.4rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.04em]">
          {title}
        </h2>
      </div>
      {intro ? <p className="text-lg leading-relaxed text-dim md:col-span-5">{intro}</p> : null}
    </header>
  );
}
