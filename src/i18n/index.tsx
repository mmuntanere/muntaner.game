import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ui, type UiKey } from "./ui";

export const LANGS = ["ca", "es", "en"] as const;
export type Lang = (typeof LANGS)[number];
/** Text en els tres idiomes */
export type L = Record<Lang, string>;

const KEY = "lang";

function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

/* ?lang= → elecció guardada → idioma del navegador → anglès */
function detect(): Lang {
  const param = new URLSearchParams(location.search).get("lang");
  if (isLang(param)) return param;
  try {
    const saved = localStorage.getItem(KEY);
    if (isLang(saved)) return saved;
  } catch {}
  for (const pref of navigator.languages ?? [navigator.language]) {
    const code = pref.toLowerCase().slice(0, 2);
    if (isLang(code)) return code;
  }
  return "en";
}

interface I18n {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: UiKey) => string;
  tr: (text: L) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(KEY, next);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key) => ui[key][lang],
      tr: (text) => text[lang],
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fora d'I18nProvider");
  return ctx;
}

/** Actualitza el títol de la pestanya i la meta descripció */
export function usePageMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [title, description]);
}
