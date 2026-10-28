/*
  Portada simple: es veu de seguida qui sóc, què faig i on anar.
  L'escena 3D de la Serra és només un fons discret (es carrega sota demanda;
  sense WebGL o amb prefers-reduced-motion es queda el pòster SVG).
*/
import { useEffect, useRef, useState } from "react";
import type { HorizonScene } from "@/components/ui/horizon-scene";
import { PortraitSphere } from "@/components/ui/PortraitSphere";
import { site } from "@/content/site";
import { useI18n } from "@/i18n";

export function Hero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<HorizonScene | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (reduce || !canvas || !section) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const onResize = () => sceneRef.current?.resize();

    import("@/components/ui/horizon-scene")
      .then(({ createHorizonScene }) => {
        if (cancelled) return;
        try {
          sceneRef.current = createHorizonScene(canvas, section);
        } catch {
          return;
        }
        sceneRef.current.setProgress(0.1);
        setReady(true);
        observer = new IntersectionObserver(([entry]) => sceneRef.current?.setActive(entry.isIntersecting));
        observer.observe(section);
        window.addEventListener("resize", onResize);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      observer?.disconnect();
      window.removeEventListener("resize", onResize);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden" aria-labelledby="hero-title">
      <HeroPoster />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full transition-opacity duration-[1500ms]"
        style={{ opacity: ready ? 1 : 0 }}
      />
      {/* Velo perquè el text es llegeixi bé sobre l'escena */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-night/85 via-night/55 to-night/10" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-night to-transparent" />

      <div className="wrap grid items-center gap-10 pb-10 pt-28 md:grid-cols-12 md:pb-12 md:pt-32">
        <div className="md:col-span-7">
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
              <a
                href={site.cv.href}
                download
                className="inline-flex items-center border border-bone/40 px-6 py-3.5 transition-colors hover:border-amber hover:text-amber"
              >
                {t("contact.cv")}
              </a>
            ) : null}
            <a href="#contact" className="inline-flex items-center border border-bone/40 px-6 py-3.5 transition-colors hover:border-amber hover:text-amber">
              {t("nav.contact")}
            </a>
          </div>
        </div>

        <div className="rise mx-auto w-[min(70%,22rem)] md:col-span-5 md:w-[min(100%,24rem)] md:justify-self-end" style={{ animationDelay: "200ms" }}>
          <PortraitSphere />
        </div>
      </div>
    </section>
  );
}

/* Pòster estàtic: carenes en SVG amb els colors de l'escena 3D */
function HeroPoster() {
  return (
    <svg aria-hidden="true" className="absolute inset-0 -z-20 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice">
      <defs>
        <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#152440" />
          <stop offset="0.45" stopColor="#3a5079" />
          <stop offset="0.68" stopColor="#c58457" />
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#dusk)" />
      <path d="M0 560 L140 500 L260 530 L380 440 L470 480 L600 410 L720 470 L840 395 L960 455 L1080 410 L1210 480 L1330 430 L1460 490 L1600 450 V900 H0Z" fill="#40547a" />
      <path d="M0 610 L120 570 L240 600 L360 530 L500 580 L620 520 L760 570 L900 505 L1040 560 L1180 525 L1320 590 L1460 540 L1600 580 V900 H0Z" fill="#354865" />
      <path d="M0 680 L160 640 L300 670 L420 615 L560 655 L640 700 L960 700 L1040 640 L1140 670 L1290 620 L1440 660 L1600 630 V900 H0Z" fill="#223044" />
      <path d="M0 760 L180 700 L340 730 L520 690 L620 780 L980 780 L1080 700 L1240 720 L1420 680 L1600 720 V900 H0Z" fill="#16202d" />
    </svg>
  );
}
