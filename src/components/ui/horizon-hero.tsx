/*
  Hero amb muntanyes 3D — adaptat del component "Horizon Hero Section" de 21st.dev.
  La part React (textos, progrés, animació d'entrada) és aquí; la de three.js és a
  horizon-scene.ts i es carrega sota demanda. Mentre es carrega, o amb
  prefers-reduced-motion, es veu un pòster SVG de la serra.
*/
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { HorizonScene } from "./horizon-scene";

interface HorizonHeroProps {
  kicker: string;
  title: string;
  lines: [string, string];
  stage2: { title: string; lines: [string, string] };
  scrollLabel: string;
  cta: { label: string; href: string };
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function HorizonHero({ kicker, title, lines, stage2, scrollLabel, cta }: HorizonHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stage1Ref = useRef<HTMLDivElement>(null);
  const stage2Ref = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const sceneRef = useRef<HorizonScene | null>(null);
  const [ready, setReady] = useState(false);

  /* Escena three.js (càrrega diferida) */
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const sticky = stickyRef.current;
    if (reduce || !canvas || !sticky) return;
    let cancelled = false;
    let observer: IntersectionObserver | undefined;
    const onResize = () => sceneRef.current?.resize();

    import("./horizon-scene")
      .then(({ createHorizonScene }) => {
        if (cancelled) return;
        try {
          sceneRef.current = createHorizonScene(canvas, sticky);
        } catch {
          return; // sense WebGL: es queda el pòster
        }
        setReady(true);
        observer = new IntersectionObserver(([entry]) => sceneRef.current?.setActive(entry.isIntersecting));
        observer.observe(sectionRef.current!);
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

  /* Progrés del scroll dins del hero */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const max = section.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / Math.max(1, max)));
      sceneRef.current?.setProgress(p);
      const a = 1 - smoothstep(0.14, 0.32, p);
      const b = smoothstep(0.62, 0.8, p);
      if (stage1Ref.current) {
        stage1Ref.current.style.opacity = String(a);
        stage1Ref.current.style.transform = `translateY(${(1 - a) * -40}px)`;
        stage1Ref.current.style.visibility = a < 0.01 ? "hidden" : "visible";
      }
      if (stage2Ref.current) {
        stage2Ref.current.style.opacity = String(b);
        stage2Ref.current.style.transform = `translateY(${(1 - b) * 40}px)`;
        stage2Ref.current.style.visibility = b < 0.01 ? "hidden" : "visible";
      }
      if (fillRef.current) fillRef.current.style.transform = `scaleX(${p})`;
      if (counterRef.current) counterRef.current.textContent = p < 0.55 ? "01" : "02";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* Entrada del títol, lletra a lletra */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = stage1Ref.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.from(".title-char", { yPercent: 110, opacity: 0, duration: 1.2, stagger: 0.035, ease: "power4.out" });
      tl.from(".hero-line", { y: 30, opacity: 0, duration: 0.9, stagger: 0.15, ease: "power3.out" }, "-=0.7");
    }, root);
    return () => ctx.revert();
  }, [title]);

  const words = title.split(" ");

  return (
    <section ref={sectionRef} className="relative h-[320svh]" aria-labelledby="hero-title">
      <div ref={stickyRef} className="sticky top-0 h-svh overflow-hidden">
        <HeroPoster />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full transition-opacity duration-[1500ms]"
          style={{ opacity: ready ? 1 : 0 }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-night to-transparent" />

        {/* Etapa 1 */}
        <div ref={stage1Ref} className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center [text-shadow:0_2px_24px_rgba(10,16,26,0.55)]">
          <p className="hud hero-line mb-6 text-amber">{kicker}</p>
          <h1
            id="hero-title"
            className="font-display text-[clamp(2.6rem,9vw,6.75rem)] font-bold leading-[0.88] tracking-[-0.045em] text-bone"
          >
            {words.map((word, w) => (
              <span key={w} className="inline-block overflow-hidden whitespace-nowrap pb-[0.06em] align-top">
                {word.split("").map((char, i) => (
                  <span key={i} className="title-char inline-block">
                    {char}
                  </span>
                ))}
                {w < words.length - 1 ? <span className="inline-block">&nbsp;</span> : null}
              </span>
            ))}
          </h1>
          <div className="mt-8 font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-snug text-bone/90">
            <p className="hero-line">{lines[0]}</p>
            <p className="hero-line">{lines[1]}</p>
          </div>
        </div>

        {/* Etapa 2 */}
        <div
          ref={stage2Ref}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center [text-shadow:0_2px_24px_rgba(10,16,26,0.55)]"
          style={{ opacity: 0, visibility: "hidden" }}
        >
          <p className="font-display text-[clamp(2.6rem,8vw,7.5rem)] font-bold leading-[0.9] tracking-[-0.045em] text-bone">
            {stage2.title}
          </p>
          <div className="mt-8 font-display text-[clamp(1.1rem,2vw,1.5rem)] leading-snug text-bone/90">
            <p>{stage2.lines[0]}</p>
            <p>{stage2.lines[1]}</p>
          </div>
          <a
            href={cta.href}
            className="mt-10 inline-flex items-center gap-3 border border-amber bg-amber px-6 py-3 font-medium text-night transition-colors hover:bg-transparent hover:text-amber"
          >
            {cta.label} <span aria-hidden="true">↓</span>
          </a>
        </div>

        {/* Progrés */}
        <div className="hud absolute inset-x-0 bottom-8 flex items-center justify-center gap-5 text-dim" aria-hidden="true">
          <span>{scrollLabel}</span>
          <div className="h-px w-32 bg-line sm:w-48">
            <div ref={fillRef} className="h-px w-full origin-left bg-amber" style={{ transform: "scaleX(0)" }} />
          </div>
          <span>
            <span ref={counterRef}>01</span> / 02
          </span>
        </div>
      </div>
    </section>
  );
}

/* Pòster estàtic: carenes en SVG amb el mateix ordre de colors que l'escena 3D */
function HeroPoster() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
    >
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
