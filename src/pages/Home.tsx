import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HorizonHero } from "@/components/ui/horizon-hero";
import { Pillars } from "@/components/sections/Pillars";
import { Projects } from "@/components/sections/Projects";
import { Approach } from "@/components/sections/Approach";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { usePageMeta, useI18n } from "@/i18n";

export function Home() {
  const { t } = useI18n();
  const { hash } = useLocation();
  usePageMeta(t("meta.title"), t("meta.description"));

  // En arribar des d'una altra pàgina amb #seccio, hi baixa quan el pin ja està mesurat
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = window.setTimeout(() => document.getElementById(id)?.scrollIntoView(), 300);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <HorizonHero
        kicker={t("hero.kicker")}
        title="Miquel Muntaner"
        lines={[t("hero.line1"), t("hero.line2")]}
        stage2={{ title: t("hero.stage2.title"), lines: [t("hero.stage2.line1"), t("hero.stage2.line2")] }}
        scrollLabel={t("hero.scroll")}
        cta={{ label: t("hero.cta"), href: "#projects" }}
      />
      <Projects />
      <Approach />
      <About />
      <Pillars />
      <Contact />
    </>
  );
}
