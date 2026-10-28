import { SectionHead } from "@/components/SectionHead";
import { useI18n } from "@/i18n";

const STEPS = [
  { title: "step1.title", text: "step1.text", art: TargetArt },
  { title: "step2.title", text: "step2.text", art: BranchArt },
  { title: "step3.title", text: "step3.text", art: CubeArt },
  { title: "step4.title", text: "step4.text", art: ChartArt },
] as const;

/* Els quatre passos, sempre visibles i sense animacions de scroll. */
export function Approach() {
  const { t } = useI18n();
  return (
    <section id="approach" className="wrap pb-16 pt-16 md:pb-24 md:pt-20" aria-labelledby="approach-title">
      <SectionHead id="approach-title" index="02" kicker={t("approach.kicker")} title={t("approach.title")} />

      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => {
          const Art = s.art;
          return (
            <li key={s.title} className="relative flex flex-col border border-line bg-deep/50 p-7">
              <div className="aspect-square w-24 text-amber">
                <Art />
              </div>
              <p className="mt-8 font-display text-5xl font-bold leading-none tracking-[-0.05em] text-amber/80">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em]">{t(s.title)}</h3>
              <p className="mt-3 leading-relaxed text-dim">{t(s.text)}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* --- Il·lustracions (línia àmbar, es dibuixen en entrar) --- */
const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function TargetArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <circle className="draw" cx="60" cy="60" r="50" {...stroke} opacity="0.4" />
      <circle className="draw" cx="60" cy="60" r="34" {...stroke} opacity="0.7" />
      <circle className="draw" cx="60" cy="60" r="18" {...stroke} />
      <circle className="pop" cx="60" cy="60" r="5" fill="currentColor" />
      <path className="draw" d="M104 16 L64 56" {...stroke} />
      <path className="draw" d="M96 12 L104 16 L108 24" {...stroke} />
    </svg>
  );
}

function BranchArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <path className="draw" d="M14 60 H44 M44 60 L76 30 H104 M44 60 H104 M44 60 L76 90 H104" {...stroke} />
      <circle className="pop" cx="14" cy="60" r="5" fill="currentColor" />
      <circle className="pop" cx="104" cy="30" r="5" fill="currentColor" />
      <g className="pop">
        <path d="M99 55 L109 65 M109 55 L99 65" {...stroke} stroke="var(--color-ember)" />
      </g>
      <g className="pop">
        <path d="M99 85 L109 95 M109 85 L99 95" {...stroke} stroke="var(--color-ember)" />
      </g>
    </svg>
  );
}

function CubeArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <g>
        <path className="draw" d="M60 14 L100 36 L100 82 L60 104 L20 82 L20 36 Z" {...stroke} />
        <path className="draw" d="M20 36 L60 58 L100 36 M60 58 L60 104" {...stroke} />
        <path className="draw" d="M60 14 L60 58 M20 82 L60 58 L100 82" {...stroke} opacity="0.3" strokeDasharray="3 4" />
      </g>
      <circle className="pop" cx="60" cy="58" r="3.5" fill="currentColor" />
    </svg>
  );
}

function ChartArt() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <path className="draw" d="M14 14 V104 H108" {...stroke} opacity="0.5" />
      <rect className="pop" x="26" y="74" width="12" height="30" fill="currentColor" opacity="0.35" />
      <rect className="pop" x="46" y="60" width="12" height="44" fill="currentColor" opacity="0.5" />
      <rect className="pop" x="66" y="44" width="12" height="60" fill="currentColor" opacity="0.7" />
      <rect className="pop" x="86" y="26" width="12" height="78" fill="currentColor" />
      <path className="draw" d="M24 70 L50 52 L70 40 L96 18" {...stroke} />
    </svg>
  );
}
