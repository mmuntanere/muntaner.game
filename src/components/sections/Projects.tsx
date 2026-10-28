import { Link } from "react-router-dom";
import { SectionHead } from "@/components/SectionHead";
import { StatusChip } from "@/components/StatusChip";
import { projects } from "@/content/projects";
import { useI18n } from "@/i18n";

/* Rejilla 2×2: els quatre projectes es veuen de seguida, cada targeta és un enllaç clar. */
export function Projects() {
  const { t, tr } = useI18n();
  return (
    <section id="projects" className="wrap pb-24 pt-12 md:pb-32 md:pt-14" aria-labelledby="projects-title">
      <SectionHead id="projects-title" index="01" kicker={t("projects.kicker")} title={t("projects.title")} intro={t("projects.intro")} />

      <ul className="mt-10 grid gap-x-8 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <li key={p.slug}>
            <Link to={`/projectes/${p.slug}`} className="group block">
              <div className="relative aspect-video overflow-hidden border border-line bg-deep">
                <img
                  src={p.cover.src}
                  alt={tr(p.cover.alt)}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <div className="absolute left-4 top-4">
                  <StatusChip status={p.status} className="bg-night" />
                </div>
                <span className="hud absolute bottom-4 left-4 border border-line bg-night px-2 py-1 text-[0.62rem] text-bone">
                  {p.cover.conceptArt ? t("label.conceptArt") : t("label.gameArt")}
                </span>
              </div>

              <div className="mt-6 flex items-baseline justify-between gap-4">
                <h3 className="font-display text-[clamp(1.8rem,3vw,2.5rem)] font-semibold leading-none tracking-[-0.035em] transition-colors group-hover:text-amber">
                  {p.title}
                </h3>
                <span className="hud text-dim">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="mt-3 max-w-xl leading-relaxed text-dim">{tr(p.tagline)}</p>
              <span className="hud mt-5 inline-flex items-center gap-2 text-amber transition-transform duration-300 group-hover:translate-x-1">
                {t("projects.open")} <span aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
