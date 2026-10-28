import { useI18n } from "@/i18n";

const PILLARS = [
  { n: "01", title: "pillar1.title", text: "pillar1.text", icon: BookIcon },
  { n: "02", title: "pillar2.title", text: "pillar2.text", icon: HeadsetIcon },
  { n: "03", title: "pillar3.title", text: "pillar3.text", icon: PulseIcon },
] as const;

export function Pillars() {
  const { t } = useI18n();
  return (
    <section className="wrap pb-16 pt-8 md:pb-20" aria-labelledby="pillars-title">
      <p className="hud mb-5 text-dim">
        <span className="text-amber">04</span> — {t("pillars.kicker")}
      </p>
      <h2 id="pillars-title" className="max-w-5xl font-display text-[clamp(2.2rem,5.4vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
        {t("pillars.title")}
      </h2>

      <div className="mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
        {PILLARS.map((p) => {
          const Icon = p.icon;
          return (
            <article key={p.n} className="relative border-t border-amber/60 pt-8">
              <div className="flex items-center justify-between">
                <p className="hud text-amber">{p.n}</p>
                <div className="size-14 text-amber">
                  <Icon />
                </div>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold tracking-[-0.02em]">{t(p.title)}</h3>
              <p className="mt-4 leading-relaxed text-dim">{t(p.text)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function BookIcon() {
  return (
    <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden="true">
      <path className="draw" d="M28 16 C22 12 12 12 6 14 V44 C12 42 22 42 28 46 C34 42 44 42 50 44 V14 C44 12 34 12 28 16 Z" {...stroke} />
      <path className="draw" d="M28 16 V46" {...stroke} />
      <path className="draw" d="M12 22 H22 M12 28 H22 M34 22 H44 M34 28 H44" {...stroke} opacity="0.6" />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden="true">
      <path className="draw" d="M8 20 H48 C51 20 52 22 52 25 V35 C52 38 50 40 47 40 H36 L31 34 H25 L20 40 H9 C6 40 4 38 4 35 V25 C4 22 5 20 8 20 Z" {...stroke} />
      <path className="draw" d="M14 20 C16 13 21 10 28 10 C35 10 40 13 42 20" {...stroke} opacity="0.6" />
      <circle className="draw" cx="16" cy="30" r="4" {...stroke} />
      <circle className="draw" cx="40" cy="30" r="4" {...stroke} />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg viewBox="0 0 56 56" className="h-full w-full" aria-hidden="true">
      <path className="draw" d="M4 46 H52" {...stroke} opacity="0.5" />
      <path className="draw" d="M4 32 H14 L19 20 L26 40 L32 14 L38 32 H52" {...stroke} />
      <circle className="draw" cx="32" cy="14" r="2.5" {...stroke} />
    </svg>
  );
}
