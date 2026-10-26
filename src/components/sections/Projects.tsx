import { useMemo, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ScrollGallery, type ScrollGallerySlide } from "@/components/ui/scroll-gallery";
import { SectionHead } from "@/components/SectionHead";
import { StatusChip } from "@/components/StatusChip";
import { projects } from "@/content/projects";
import { useI18n } from "@/i18n";

const reduceQuery = "(prefers-reduced-motion: reduce)";
function useReducedMotion() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(reduceQuery);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(reduceQuery).matches,
  );
}

export function Projects() {
  const { t, tr, lang } = useI18n();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const slides = useMemo<ScrollGallerySlide[]>(
    () =>
      projects.map((p, i) => ({
        image: p.cover.src,
        alt: tr(p.cover.alt),
        title: p.title,
        url: `/projectes/${p.slug}`,
        linkLabel: `${t("projects.open")} →`,
        prefix: `${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")} · ${t(`status.${p.status}`)}`,
        badge: p.cover.conceptArt ? t("label.conceptArt") : t("label.gameArt"),
      })),
    [lang],
  );

  return (
    <section id="projects" aria-labelledby="projects-title">
      <div className="wrap pb-16 pt-8">
        <SectionHead id="projects-title" index="01" kicker={t("projects.kicker")} title={t("projects.title")} intro={t("projects.intro")} />
      </div>

      {!reduce ? (
        <ScrollGallery
          key={lang}
          slides={slides}
          scrollPerTransition={110}
          timing={{ initialDelay: 30, finalDelay: 50 }}
          onNavigate={(url) => navigate(url)}
          classNames={{
            root: "h-svh",
            info: "border-y border-bone/15 bg-night/35 py-5 backdrop-blur-[2px]",
            infoInner: "wrap items-center gap-4 md:gap-8",
            prefix: "hidden flex-1 flex-col gap-2 md:flex",
            prefixText: "hud text-bone/80",
            badge: "hud w-fit border border-bone/30 px-2 py-0.5 text-[0.62rem] text-bone/70",
            title: "h-[clamp(2.4rem,6vw,5.2rem)] flex-[2]",
            titleText:
              "font-display text-[clamp(2.2rem,6vw,5rem)] font-bold leading-none tracking-[-0.04em] text-bone [clip-path:polygon(0_0,100%_0,100%_100%,0%_100%)]",
            link: "flex flex-1 justify-end",
            linkText: "hud whitespace-nowrap border-b border-amber pb-1 text-amber hover:text-bone",
          }}
        >
          <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-night/50 via-transparent to-night/70" />
          <div className="absolute inset-x-0 bottom-0 z-[2] h-px bg-bone/10">
            <div className="h-px origin-left bg-amber" style={{ transform: "scaleX(var(--sg-progress, 0))" }} />
          </div>
        </ScrollGallery>
      ) : null}

      {/* Índex accessible de tots els projectes (i alternativa sense animació) */}
      <div className="wrap pt-20">
        <h3 className="hud mb-6 text-dim">{t("projects.index")}</h3>
        <ul className="border-t border-line">
          {projects.map((p, i) => (
            <li key={p.slug} className="border-b border-line">
              <Link
                to={`/projectes/${p.slug}`}
                className="group grid items-center gap-x-6 gap-y-3 py-6 md:grid-cols-[3rem_minmax(0,1.1fr)_minmax(0,1.6fr)_auto]"
              >
                <span className="hud text-amber">{String(i + 1).padStart(2, "0")}</span>
                {reduce ? (
                  <img src={p.cover.src} alt={tr(p.cover.alt)} loading="lazy" className="aspect-video w-full object-cover md:hidden" />
                ) : null}
                <span className="font-display text-3xl font-semibold tracking-[-0.03em] transition-colors group-hover:text-amber">
                  {p.title}
                </span>
                <span className="text-dim">{tr(p.tagline)}</span>
                <StatusChip status={p.status} className="justify-self-start md:justify-self-end" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
