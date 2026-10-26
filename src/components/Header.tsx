import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LANGS, useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const NAV = [
  { hash: "projects", key: "nav.projects" },
  { hash: "approach", key: "nav.approach" },
  { hash: "about", key: "nav.about" },
  { hash: "contact", key: "nav.contact" },
] as const;

export function Header() {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "border-b border-line/70 bg-night/80 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="wrap flex h-16 items-center gap-6">
        <Link to="/" className="font-mono text-sm tracking-tight text-bone">
          muntaner<span className="text-amber">.game</span>
        </Link>
        <nav aria-label={t("nav.label")} className="hidden md:block">
          <ul className="flex gap-1">
            {NAV.map((item) => (
              <li key={item.hash}>
                <Link
                  to={{ pathname: "/", hash: item.hash }}
                  className="rounded-sm px-3 py-2 text-sm text-dim transition-colors hover:text-bone"
                  onClick={() => {
                    if (pathname === "/") document.getElementById(item.hash)?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div role="group" aria-label={t("lang.label")} className="ml-auto flex border border-line">
          {LANGS.map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
              className={cn(
                "px-2.5 py-1.5 font-mono text-xs uppercase tracking-wider transition-colors",
                lang === code ? "bg-bone text-night" : "text-dim hover:text-bone",
              )}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
      {/* Al mòbil, la navegació va en una segona fila */}
      <nav aria-label={t("nav.label")} className="wrap -mt-2 pb-2 md:hidden">
        <ul className="flex justify-between">
          {NAV.map((item) => (
            <li key={item.hash}>
              <Link
                to={{ pathname: "/", hash: item.hash }}
                className="block py-1 text-[0.8rem] text-dim hover:text-bone"
                onClick={() => {
                  if (pathname === "/") document.getElementById(item.hash)?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
