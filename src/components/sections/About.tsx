import { SectionHead } from "@/components/SectionHead";
import { useI18n } from "@/i18n";

export function About() {
  const { t } = useI18n();
  return (
    <section id="about" className="wrap overflow-x-clip pb-20 pt-16 md:pb-28 md:pt-20" aria-labelledby="about-title">
      <div className="grid gap-12 md:grid-cols-12 md:items-start">
        <figure className="relative mx-auto w-[78%] max-w-[420px] md:col-span-4 md:mt-6 md:w-full">
          <div className="relative aspect-square">
            {/* Òrbites al voltant de l'esfera */}
            <svg viewBox="-110 -110 220 220" className="pointer-events-none absolute -inset-[14%] h-[128%] w-[128%] overflow-visible" aria-hidden="true">
              <g transform="rotate(-18)">
                <path id="orbit-a" d="M -104 0 A 104 30 0 1 0 104 0 A 104 30 0 1 0 -104 0" fill="none" stroke="var(--color-amber)" strokeOpacity="0.55" strokeWidth="0.6" />
                <circle r="2.6" fill="var(--color-amber)">
                  <animateMotion dur="14s" repeatCount="indefinite">
                    <mpath href="#orbit-a" />
                  </animateMotion>
                </circle>
              </g>
              <g transform="rotate(22)">
                <path id="orbit-b" d="M -98 0 A 98 20 0 1 1 98 0 A 98 20 0 1 1 -98 0" fill="none" stroke="var(--color-dim)" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="2 3" />
                <circle r="1.6" fill="var(--color-bone)" opacity="0.8">
                  <animateMotion dur="22s" repeatCount="indefinite">
                    <mpath href="#orbit-b" />
                  </animateMotion>
                </circle>
              </g>
            </svg>
            {/* L'esfera: retrat retallat en cercle + ombrejat de volum */}
            <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
              <img
                src="/img/miquel.jpg"
                alt={t("about.photoAlt")}
                loading="lazy"
                width={1000}
                height={1000}
                className="h-full w-full scale-[1.04] object-cover object-[50%_35%]"
              />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,transparent_52%,rgba(10,16,26,0.55)_78%,rgba(10,16,26,0.9)_100%)]" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.28),rgba(255,255,255,0.06)_22%,transparent_40%)] mix-blend-screen" />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(240,160,75,0.35),inset_-14px_-20px_40px_rgba(240,160,75,0.12)]" />
            </div>
          </div>
          {/* Ombra sobre el "terra" */}
          <div className="mx-auto mt-6 h-4 w-2/3 rounded-[50%] bg-black/40 blur-md" aria-hidden="true" />
          <figcaption className="mt-12">
            <p className="hud mb-4 text-dim">{t("about.eduTitle")}</p>
            <ul className="border-t border-line text-sm">
              {(["about.master", "about.grau", "about.masterTeach"] as const).map((key, i) => (
                <li key={key} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                  <span className="text-bone/90">{t(key)}</span>
                  {i === 0 ? <span className="hud shrink-0 text-[0.65rem] text-amber">{t("about.ongoing")}</span> : null}
                </li>
              ))}
            </ul>
          </figcaption>
        </figure>

        <div className="md:col-span-7 md:col-start-6">
          <SectionHead id="about-title" index="03" kicker={t("about.kicker")} title={t("about.title")} />
          <div className="mt-10 space-y-5 text-lg leading-relaxed text-bone/90">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p>{t("about.p3")}</p>
          </div>

        </div>
      </div>
    </section>
  );
}
