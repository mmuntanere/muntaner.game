import { SectionHead } from "@/components/SectionHead";
import { useI18n } from "@/i18n";

/* El retrat ja és a la portada: aquí, el text a la dreta i la formació a l'esquerra. */
export function About() {
  const { t } = useI18n();
  return (
    <section id="about" className="wrap pb-16 pt-16 md:pb-20 md:pt-20" aria-labelledby="about-title">
      <SectionHead id="about-title" index="03" kicker={t("about.kicker")} title={t("about.title")} />

      <div className="mt-12 grid gap-12 md:grid-cols-12">
        <div className="space-y-5 text-lg leading-relaxed text-bone/90 md:col-span-7">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
          <p>{t("about.p3")}</p>
        </div>

        <div className="md:col-span-4 md:col-start-9">
          <p className="hud mb-4 text-dim">{t("about.eduTitle")}</p>
          <ul className="border-t border-line text-sm">
            {(["about.master", "about.grau", "about.masterTeach"] as const).map((key, i) => (
              <li key={key} className="flex items-baseline justify-between gap-4 border-b border-line py-3">
                <span className="text-bone/90">{t(key)}</span>
                {i === 0 ? <span className="hud shrink-0 text-[0.65rem] text-amber">{t("about.ongoing")}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
