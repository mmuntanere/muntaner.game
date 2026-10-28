/*
  Carenes de la portada + minijoc "Apaga el foc".
  El joc és opcional: només comença en prémer el botó. Es juga amb el ratolí
  (o el dit): cada clic sobre una flama l'apaga. Dura 20 s.
  Les carenes es dibuixen amb preserveAspectRatio="none", així una posició del
  viewBox (1600×240) és directament un percentatge de la caixa.
*/
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const VB_W = 1600;
const VB_H = 240;

// Línia de la segona carena (la que fa de "terra" del joc)
const RIDGE: [number, number][] = [
  [0, 178], [120, 146], [240, 168], [360, 118], [500, 160], [620, 112],
  [760, 156], [900, 104], [1040, 150], [1180, 122], [1320, 168], [1460, 130], [1600, 160],
];

function ridgeY(x: number) {
  for (let i = 1; i < RIDGE.length; i++) {
    const [x1, y1] = RIDGE[i - 1];
    const [x2, y2] = RIDGE[i];
    if (x <= x2) return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
  }
  return RIDGE[RIDGE.length - 1][1];
}

export function RidgeBand() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-48 md:h-56" aria-hidden="true">
      <div className="absolute left-[83%] top-[18%] size-10 rounded-full bg-[#e8b878]/55" />
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
        <path d="M0 150 L140 110 L260 135 L380 80 L470 112 L600 60 L720 108 L840 50 L960 100 L1080 66 L1210 116 L1330 78 L1460 120 L1600 90 V240 H0Z" fill="#dfe6ee" />
        <path d="M0 178 L120 146 L240 168 L360 118 L500 160 L620 112 L760 156 L900 104 L1040 150 L1180 122 L1320 168 L1460 130 L1600 160 V240 H0Z" fill="#cdd9e6" />
        <path d="M0 208 L160 176 L300 198 L420 160 L560 192 L700 150 L860 190 L1000 160 L1140 198 L1290 168 L1440 200 L1600 180 V240 H0Z" fill="#b9c9db" />
        <path d="M0 232 L200 214 L420 228 L640 210 L860 226 L1080 212 L1320 228 L1600 216 V240 H0Z" fill="#a4b7cd" />
      </svg>
    </div>
  );
}

type Status = "idle" | "playing" | "over";
type Flame = { id: number; x: number; born: number; state: "burning" | "out" | "lost"; ended: number };

const DURATION = 20000; // ms
const LIFETIME = 3200; // ms que triga una flama a "cremar-se" si no l'apagues
const MAX_FLAMES = 5;

export function RidgeGame() {
  const { t } = useI18n();
  const [status, setStatus] = useState<Status>("idle");
  const [flames, setFlames] = useState<Flame[]>([]);
  const [saved, setSaved] = useState(0);
  const [lost, setLost] = useState(0);
  const [left, setLeft] = useState(DURATION);

  // Estat mutable del joc (el bucle el llegeix sense dependre de renders)
  const game = useRef({ start: 0, nextSpawn: 0, id: 0, saved: 0, lost: 0, flames: [] as Flame[] });

  const start = useCallback(() => {
    const now = performance.now();
    game.current = { start: now, nextSpawn: now + 450, id: 0, saved: 0, lost: 0, flames: [] };
    setFlames([]);
    setSaved(0);
    setLost(0);
    setLeft(DURATION);
    setStatus("playing");
  }, []);

  const close = useCallback(() => {
    game.current.flames = [];
    setFlames([]);
    setStatus("idle");
  }, []);

  // Bucle del joc
  useEffect(() => {
    if (status !== "playing") return;
    const timer = window.setInterval(() => {
      const g = game.current;
      const now = performance.now();
      const elapsed = now - g.start;

      for (const f of g.flames) {
        if (f.state === "burning" && now - f.born > LIFETIME) {
          f.state = "lost";
          f.ended = now;
          g.lost++;
        }
      }
      g.flames = g.flames.filter((f) => f.state === "burning" || now - f.ended < 500);

      if (elapsed < DURATION && now >= g.nextSpawn && g.flames.filter((f) => f.state === "burning").length < MAX_FLAMES) {
        g.flames.push({ id: ++g.id, x: 80 + Math.random() * (VB_W - 160), born: now, state: "burning", ended: 0 });
        const progress = elapsed / DURATION;
        g.nextSpawn = now + 700 - progress * 320 + Math.random() * 300; // cada vegada més ràpid
      }

      setFlames([...g.flames]);
      setLost(g.lost);
      setLeft(Math.max(0, DURATION - elapsed));
      if (elapsed >= DURATION) {
        g.flames = [];
        setFlames([]);
        setStatus("over");
      }
    }, 90);
    return () => window.clearInterval(timer);
  }, [status]);

  // Esc tanca el joc
  useEffect(() => {
    if (status === "idle") return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [status, close]);

  const douse = (id: number) => {
    const g = game.current;
    const flame = g.flames.find((f) => f.id === id);
    if (!flame || flame.state !== "burning") return;
    flame.state = "out";
    flame.ended = performance.now();
    g.saved++;
    setSaved(g.saved);
    setFlames([...g.flames]);
  };

  const seconds = Math.ceil(left / 1000);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 md:h-56">
      {/* Zona de joc: dóna el cursor de gota sense tapar els botons de la portada */}
      {status !== "idle" ? <div className="cursor-drop pointer-events-auto absolute inset-x-0 bottom-0 h-32 md:h-36" /> : null}

      {flames.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => douse(f.id)}
          aria-label={t("game.douse")}
          data-flame={f.state}
          className={cn(
            "cursor-drop pointer-events-auto absolute h-10 w-8 -translate-x-1/2 -translate-y-full transition-all duration-300 md:h-12 md:w-9",
            f.state === "out" && "scale-50 opacity-0",
            f.state === "lost" && "opacity-0 grayscale duration-500",
          )}
          style={{ left: `${(f.x / VB_W) * 100}%`, top: `${((ridgeY(f.x) + 8) / VB_H) * 100}%` }}
        >
          <svg viewBox="0 0 28 36" className="flame-art h-full w-full" aria-hidden="true">
            <path d="M14 2 C16 10 25 14 25 24 a11 11 0 0 1 -22 0 C3 16 9 14 10 8 C12 10 13 6 14 2Z" fill="#d9531e" />
            <path d="M14 16 C15 21 20 22 20 27 a6 6 0 0 1 -12 0 C8 23 12 22 14 16Z" fill="#f6a93b" />
          </svg>
        </button>
      ))}

      <div className="wrap relative h-full">
        {status === "idle" ? (
          <button
            type="button"
            onClick={start}
            className="pointer-events-auto absolute bottom-4 right-[clamp(16px,4vw,56px)] inline-flex items-center gap-2 border border-line bg-night px-4 py-2.5 text-sm text-bone shadow-sm transition-colors hover:border-amber hover:text-amber"
          >
            <svg viewBox="0 0 28 36" className="h-4 w-3.5" aria-hidden="true">
              <path d="M14 2 C16 10 25 14 25 24 a11 11 0 0 1 -22 0 C3 16 9 14 10 8 C12 10 13 6 14 2Z" fill="#d9531e" />
            </svg>
            {t("game.play")}
          </button>
        ) : null}

        {status === "playing" ? (
          <div className="pointer-events-auto absolute bottom-3 left-[clamp(16px,4vw,56px)] flex items-center gap-4 border border-line bg-night px-3 py-2 hud text-[0.7rem] text-bone shadow-sm">
            <span>
              {t("game.saved")} <b className="text-amber">{saved}</b>
            </span>
            <span>
              {t("game.lost")} <b>{lost}</b>
            </span>
            <span aria-hidden="true">0:{String(seconds).padStart(2, "0")}</span>
            <button type="button" onClick={close} aria-label={t("game.close")} className="-mr-1 px-1 text-dim hover:text-amber">
              ×
            </button>
          </div>
        ) : null}

        {status === "over" ? (
          <div
            role="status"
            className="pointer-events-auto absolute bottom-3 left-1/2 flex w-[min(92%,34rem)] -translate-x-1/2 flex-wrap items-center justify-between gap-x-6 gap-y-3 border border-line bg-night px-5 py-4 shadow-sm"
          >
            <div>
              <p className="hud text-amber">{t("game.over")}</p>
              <p className="mt-1 text-sm text-bone">
                {t("game.saved")}: <b>{saved}</b> · {t("game.lost")}: <b>{lost}</b>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={start}
                className="border border-amber bg-amber px-4 py-2 text-sm font-medium text-night transition-colors hover:bg-transparent hover:text-amber"
              >
                {t("game.again")}
              </button>
              <Link to="/projectes/foc-a-la-serra" className="text-sm underline decoration-line underline-offset-4 hover:text-amber">
                {t("game.more")}
              </Link>
              <button type="button" onClick={close} className="text-sm text-dim hover:text-amber">
                {t("game.close")}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
