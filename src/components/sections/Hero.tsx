/*
  Portada simple i clara: es veu de seguida qui sóc, què faig i on anar.
  Al fons, unes carenes suaus (SVG) amb un minijoc opcional. El retrat és petit i discret.
*/
import { RidgeBand, RidgeGame } from "@/components/sections/HeroGame";
import { PortraitSphere } from "@/components/ui/PortraitSphere";
import { site } from "@/content/site";
import { useI18n } from "@/i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <RidgeBand />

      <div className="wrap grid items-center gap-10 pb-36 pt-28 md:grid-cols-12 md:pb-40 md:pt-36">
        <div className="md:col-span-9">
          <p className="hud rise text-amber" style={{ animationDelay: "0ms" }}>
            {t("hero.kicker")}
          </p>
          <h1
            id="hero-title"
            className="rise mt-5 font-display text-[clamp(2.8rem,7.4vw,6.2rem)] font-bold leading-[0.92] tracking-[-0.045em] text-bone"
            style={{ animationDelay: "80ms" }}
          >
            Miquel
            <br />
            Muntaner
          </h1>
          <p className="rise mt-7 max-w-xl font-display text-[clamp(1.2rem,2.2vw,1.65rem)] leading-snug text-bone/90" style={{ animationDelay: "160ms" }}>
            {t("hero.line1")} {t("hero.line2")}
          </p>
          <div className="rise mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <a
              href="#projects"
              className="inline-flex items-center gap-3 border border-amber bg-amber px-6 py-3.5 font-medium text-night transition-colors hover:bg-transparent hover:text-amber"
            >
              {t("hero.cta")} <span aria-hidden="true">↓</span>
            </a>
            {site.cv.available ? (
              <a href={site.cv.href} download className="inline-flex items-center border border-bone/40 px-6 py-3.5 transition-colors hover:border-amber hover:text-amber">
                {t("contact.cv")}
              </a>
            ) : null}
            <a href="#contact" className="inline-flex items-center border border-bone/40 px-6 py-3.5 transition-colors hover:border-amber hover:text-amber">
              {t("nav.contact")}
            </a>
          </div>
        </div>

        <div className="rise md:col-span-3 md:justify-self-end" style={{ animationDelay: "200ms" }}>
          <PortraitSphere className="w-28 md:w-36" />
        </div>
      </div>
      <RidgeGame />
    </section>
  );
}
