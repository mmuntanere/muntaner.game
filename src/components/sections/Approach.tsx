import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHead } from "@/components/SectionHead";
import { useI18n } from "@/i18n";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { title: "step1.title", text: "step1.text", art: TargetArt },
  { title: "step2.title", text: "step2.text", art: BranchArt },
  { title: "step3.title", text: "step3.text", art: CubeArt },
  { title: "step4.title", text: "step4.text", art: ChartArt },
] as const;

/*
  Els quatre passos caben sempre a la pantalla (sense scroll horitzontal).
  Amb el scroll vertical, una línia de progrés avança i encén cada pas quan l'hi arriba.
  Les il·lustracions es "dibuixen" (stroke-dashoffset) quan el seu pas és actiu.
*/
export function Approach() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>(".approach-panel", track);
      // Preparació de les línies per "dibuixar-les"
      section.querySelectorAll<SVGGeometryElement>(".draw").forEach((el) => {
        const len = el.getTotalLength?.() ?? 300;
        el.style.strokeDasharray = `${len}`;
        el.style.strokeDashoffset = reduce ? "0" : `${len}`;
      });
      if (reduce) {
        panels.forEach((p) => p.classList.add("is-active"));
        return;
      }
      gsap.set(section.querySelectorAll(".pop"), { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
      gsap.set(panels, { y: 60, opacity: 0, scale: 0.96 });

      const activate = (panel: HTMLElement) => {
        if (panel.classList.contains("is-active")) return;
        panel.classList.add("is-active");
        gsap.to(panel, { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: "power3.out" });
        gsap.to(panel.querySelectorAll(".draw"), { strokeDashoffset: 0, duration: 1.3, ease: "power2.out", stagger: 0.08 });
        gsap.to(panel.querySelectorAll(".pop"), { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.1, delay: 0.5 });
      };

      // La línia de progrés avança amb el scroll i encén cada pas quan l'hi arriba
      ScrollTrigger.create({
        trigger: track,
        // En fila (escriptori) el recorregut s'allarga perquè aparegui d'una en una
        start: "top 92%",
        end: () => (window.matchMedia("(min-width: 1024px)").matches ? "top 12%" : "bottom 75%"),
        invalidateOnRefresh: true,
        scrub: true,
        refreshPriority: -2, // es mesura després de la galeria fixada de projectes
        onUpdate: (self) => {
          section.style.setProperty("--approach-progress", String(self.progress));
          panels.forEach((panel, i) => {
            if (self.progress >= 0.04 + (i / (panels.length - 1)) * 0.8) activate(panel);
          });
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="approach" className="wrap pb-12 pt-24 md:pb-16 md:pt-32" aria-labelledby="approach-title">
      <SectionHead id="approach-title" index="02" kicker={t("approach.kicker")} title={t("approach.title")} />

      <div className="relative mt-16">
        {/* Línia de progrés (horitzontal a escriptori, vertical al mòbil) */}
        <div className="absolute inset-x-0 top-0 hidden h-px bg-line lg:block" aria-hidden="true">
          <div className="h-px origin-left bg-amber" style={{ transform: "scaleX(var(--approach-progress, 0))" }} />
        </div>
        <div className="absolute bottom-0 left-0 top-0 w-px bg-line lg:hidden" aria-hidden="true">
          <div className="h-full w-px origin-top bg-amber" style={{ transform: "scaleY(var(--approach-progress, 0))" }} />
        </div>

        <ol ref={trackRef} className="grid gap-6 pl-6 sm:grid-cols-2 lg:grid-cols-4 lg:pl-0 lg:pt-10">
          {STEPS.map((s, i) => {
            const Art = s.art;
            return (
              <li
                key={s.title}
                className="approach-panel group relative flex flex-col border border-line bg-deep/50 p-7 transition-colors duration-700 [&.is-active]:border-amber/40"
              >
                {/* nus sobre la línia */}
                <span
                  className="absolute -top-[2.85rem] left-7 hidden size-2.5 -translate-x-1/2 rounded-full border border-line bg-night transition-colors duration-500 group-[.is-active]:border-amber group-[.is-active]:bg-amber lg:block"
                  aria-hidden="true"
                />
                <div className="aspect-square w-28 text-amber">
                  <Art />
                </div>
                <p className="mt-8 font-display text-5xl font-bold leading-none tracking-[-0.05em] text-line transition-colors duration-700 group-[.is-active]:text-amber/80">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-[-0.03em]">{t(s.title)}</h3>
                <p className="mt-3 leading-relaxed text-dim">{t(s.text)}</p>
              </li>
            );
          })}
        </ol>
      </div>
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
