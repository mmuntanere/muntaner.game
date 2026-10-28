/*
  Portada simple i clara: es veu de seguida qui sóc, què faig i on anar.
  Al fons, unes carenes suaus (SVG). El retrat és petit i discret.
*/
import { PortraitSphere } from "@/components/ui/PortraitSphere";
import { site } from "@/content/site";
import { useI18n } from "@/i18n";

export function Hero() {
  const { t } = useI18n();
  return (
    <section className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <Ridges />

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
    </section>
  );
}

/* Carenes suaus al peu de la portada, en tons de paper i blau pàl·lid */
function Ridges() {
  return (
    <svg aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-48 w-full md:h-56" viewBox="0 0 1600 240" preserveAspectRatio="xMidYMax slice">
      <circle cx="1330" cy="64" r="26" fill="#e8b878" opacity="0.55" />
      <path d="M0 150 L140 110 L260 135 L380 80 L470 112 L600 60 L720 108 L840 50 L960 100 L1080 66 L1210 116 L1330 78 L1460 120 L1600 90 V240 H0Z" fill="#dfe6ee" />
      <path d="M0 178 L120 146 L240 168 L360 118 L500 160 L620 112 L760 156 L900 104 L1040 150 L1180 122 L1320 168 L1460 130 L1600 160 V240 H0Z" fill="#cdd9e6" />
      <path d="M0 208 L160 176 L300 198 L420 160 L560 192 L700 150 L860 190 L1000 160 L1140 198 L1290 168 L1440 200 L1600 180 V240 H0Z" fill="#b9c9db" />
      <path d="M0 232 L200 214 L420 228 L640 210 L860 226 L1080 212 L1320 228 L1600 216 V240 H0Z" fill="#a4b7cd" />
    </svg>
  );
}
