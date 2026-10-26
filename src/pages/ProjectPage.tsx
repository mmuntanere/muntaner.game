import { useEffect, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { StatusChip } from "@/components/StatusChip";
import { getProject, projects, type Shot } from "@/content/projects";
import { usePageMeta, useI18n } from "@/i18n";
import type { UiKey } from "@/i18n/ui";

export function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  const { t, tr } = useI18n();

  usePageMeta(project ? `${project.title} — Miquel Muntaner` : t("meta.title"), project ? tr(project.tagline) : t("meta.description"));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!project) {
    return (
      <section className="wrap flex min-h-svh flex-col justify-center gap-8 pt-24">
        <p className="hud text-amber">404</p>
        <h1 className="font-display text-5xl font-bold">{t("case.notFound")}</h1>
        <Link to="/#projects" className="hud text-amber underline underline-offset-4">
          ← {t("case.back")}
        </Link>
      </section>
    );
  }

  const index = projects.indexOf(project);
  const nextProject = projects[(index + 1) % projects.length];
  const isConcept = project.status === "concept";

  const sections: { key: UiKey; body: ReactNode }[] = [
    { key: "case.problem", body: <p>{tr(project.problem)}</p> },
    {
      key: "case.objectives",
      body: (
        <ol className="space-y-4">
          {project.objectives.map((o, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr]">
              <span className="hud pt-1.5 text-amber">{String(i + 1).padStart(2, "0")}</span>
              <span>{tr(o)}</span>
            </li>
          ))}
        </ol>
      ),
    },
    { key: "case.scenario", body: <p>{tr(project.scenario)}</p> },
    ...(project.measure ? [{ key: "case.measure" as const, body: <p>{tr(project.measure)}</p> }] : []),
    { key: "case.next", body: <p>{tr(project.next)}</p> },
  ];

  return (
    <article>
      {/* Capçalera a sang */}
      <header className="relative flex min-h-[88svh] items-end overflow-hidden">
        <img src={project.cover.src} alt={tr(project.cover.alt)} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/55 to-night/10" />
        <div className="wrap relative pb-14 pt-32">
          <Link to="/#projects" className="hud text-bone/80 hover:text-amber">
            ← {t("case.back")}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <StatusChip status={project.status} />
            <ArtLabel shot={project.cover} />
          </div>
          <h1 className="mt-5 font-display text-[clamp(3rem,9vw,8rem)] font-bold leading-[0.9] tracking-[-0.045em]">{project.title}</h1>
          <p className="mt-6 max-w-3xl font-display text-[clamp(1.2rem,2.2vw,1.7rem)] leading-snug text-bone/90">{tr(project.tagline)}</p>
        </div>
      </header>

      {/* Fitxa */}
      <div className="wrap">
        <dl className="grid gap-px border-y border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {(
            [
              ["case.role", tr(project.meta.role)],
              ["case.platform", tr(project.meta.platform)],
              ["case.tools", project.meta.tools],
              ["case.audience", tr(project.meta.audience)],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="bg-night py-6 sm:px-6 sm:first:pl-0">
              <dt className="hud text-dim">{t(key)}</dt>
              <dd className="mt-2 leading-snug">{value}</dd>
            </div>
          ))}
        </dl>

        {isConcept ? <p className="mt-8 max-w-3xl border-l-2 border-amber pl-4 text-sm leading-relaxed text-dim">{t("case.conceptNote")}</p> : null}

        {project.play ? (
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border border-amber/50 bg-amber/5 p-6">
            <a
              href={project.play.url}
              target="_blank"
              rel="noopener"
              className="border border-amber bg-amber px-6 py-3 font-medium text-night transition-colors hover:bg-transparent hover:text-amber"
            >
              {t("case.play")} ↗
            </a>
            {project.play.password ? (
              <p className="hud text-bone/80">
                {t("case.password")}: <span className="select-all text-amber">{project.play.password}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Seccions del cas */}
        <div className="py-20 md:py-28">
          {sections.map((s, i) => (
            <section key={s.key} className="grid gap-6 border-t border-line py-12 md:grid-cols-12">
              <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] md:col-span-4">
                <span className="hud mr-3 align-middle text-amber">{String(i + 1).padStart(2, "0")}</span>
                {t(s.key)}
              </h2>
              <div className="max-w-2xl text-lg leading-relaxed text-bone/90 md:col-span-7 md:col-start-6">{s.body}</div>
            </section>
          ))}
        </div>

        {/* Galeria */}
        {project.gallery.length ? (
          <div className="space-y-6 pb-24">
            {project.gallery.map((shot) => (
              <figure key={shot.src} className="relative">
                <img src={shot.src} alt={tr(shot.alt)} loading="lazy" className="w-full border border-line" />
                <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-3 text-sm text-dim">
                  <span className="max-w-3xl">{tr(shot.alt)}</span>
                  <ArtLabel shot={shot} />
                </figcaption>
              </figure>
            ))}
          </div>
        ) : null}
      </div>

      {/* Següent projecte */}
      <Link to={`/projectes/${nextProject.slug}`} className="group relative block overflow-hidden border-t border-line">
        <img src={nextProject.cover.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-opacity duration-500 group-hover:opacity-50" />
        <div className="wrap relative py-24">
          <p className="hud text-dim">{t("case.nextProject")}</p>
          <p className="mt-4 font-display text-[clamp(2.4rem,7vw,6rem)] font-bold leading-none tracking-[-0.045em] transition-colors group-hover:text-amber">
            {nextProject.title} →
          </p>
        </div>
      </Link>
    </article>
  );
}

function ArtLabel({ shot }: { shot: Shot }) {
  const { t } = useI18n();
  return (
    <span className="hud border border-bone/30 px-2 py-1 text-[0.62rem] text-bone/70">
      {shot.conceptArt ? t("label.conceptArt") : t("label.gameArt")}
    </span>
  );
}
