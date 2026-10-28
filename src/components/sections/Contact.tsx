import { useRef, useState } from "react";
import { site } from "@/content/site";
import { useI18n } from "@/i18n";

export function Contact() {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
    } catch {
      // Alternativa per a navegadors sense Clipboard API
      const ta = document.createElement("textarea");
      ta.value = site.email;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section id="contact" className="relative overflow-hidden border-t border-line" aria-labelledby="contact-title">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(60%_80%_at_70%_100%,rgba(154,74,10,0.07),transparent_70%)]" />
      <div className="wrap relative pb-28 pt-16 md:pb-40 md:pt-20">
        <p className="hud mb-5 text-dim">
          <span className="text-amber">05</span> — {t("contact.kicker")}
        </p>
        <h2 id="contact-title" className="max-w-5xl font-display text-[clamp(2.6rem,7vw,6.2rem)] font-bold leading-[0.95] tracking-[-0.045em]">
          {t("contact.title")}
        </h2>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-dim">{t("contact.text")}</p>

        <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-bone/20 py-7">
          <a
            href={`mailto:${site.email}`}
            className="font-display text-[clamp(1.4rem,4.4vw,3.4rem)] font-medium tracking-[-0.03em] [overflow-wrap:anywhere] hover:text-amber"
          >
            {site.email}
          </a>
          <button
            type="button"
            onClick={copy}
            aria-label={t("contact.copyLabel")}
            className="hud border border-bone/40 px-4 py-2.5 transition-colors hover:border-amber hover:text-amber"
          >
            {t("contact.copy")}
          </button>
          <span role="status" aria-live="polite" className="hud text-amber">
            {copied ? t("contact.copied") : ""}
          </span>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <a href={site.linkedin} target="_blank" rel="me noopener" className="border border-bone/40 px-5 py-3 text-sm transition-colors hover:border-amber hover:text-amber">
            LinkedIn ↗
          </a>
          {site.cv.available ? (
            <a href={site.cv.href} download className="border border-amber bg-amber px-5 py-3 text-sm font-medium text-night hover:bg-transparent hover:text-amber">
              {t("contact.cv")}
            </a>
          ) : (
            <span className="border border-dashed border-line px-5 py-3 text-sm text-dim">{t("contact.cvPending")}</span>
          )}
        </div>
      </div>
    </section>
  );
}
