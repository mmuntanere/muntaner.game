import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from "@/components/Header";
import { Home } from "@/pages/Home";
import { ProjectPage } from "@/pages/ProjectPage";
import { I18nProvider, useI18n } from "@/i18n";

function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line">
      <div className="wrap hud flex flex-wrap justify-between gap-4 py-8 text-[0.68rem] text-dim">
        <span>© {new Date().getFullYear()} Miquel Muntaner Estarellas</span>
        <span>{t("footer.place")}</span>
      </div>
    </footer>
  );
}

function Skip() {
  const { t } = useI18n();
  return (
    <a href="#main" className="fixed left-2 top-2 z-[100] -translate-y-24 bg-bone px-4 py-2 text-night focus:translate-y-0">
      {t("skip")}
    </a>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Skip />
        <Header />
        <main id="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projectes/:slug" element={<ProjectPage />} />
            <Route path="*" element={<ProjectPage />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </I18nProvider>
  );
}
