import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/* Retrat dins d'una esfera: retall circular, ombrejat de volum, ombra al terra i dues òrbites. */
export function PortraitSphere({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <figure className={cn("relative mx-auto w-full", className)}>
      <div className="relative aspect-square">
        <svg viewBox="-110 -110 220 220" className="pointer-events-none absolute -inset-[14%] h-[128%] w-[128%] overflow-visible" aria-hidden="true">
          <g transform="rotate(-18)">
            <path id="orbit-a" d="M -104 0 A 104 30 0 1 0 104 0 A 104 30 0 1 0 -104 0" fill="none" stroke="var(--color-amber)" strokeOpacity="0.55" strokeWidth="0.6" />
            <circle r="2.6" fill="var(--color-amber)">
              <animateMotion dur="14s" repeatCount="indefinite">
                <mpath href="#orbit-a" />
              </animateMotion>
            </circle>
          </g>
          <g transform="rotate(22)">
            <path id="orbit-b" d="M -98 0 A 98 20 0 1 1 98 0 A 98 20 0 1 1 -98 0" fill="none" stroke="var(--color-dim)" strokeOpacity="0.4" strokeWidth="0.5" strokeDasharray="2 3" />
            <circle r="1.6" fill="var(--color-bone)" opacity="0.8">
              <animateMotion dur="22s" repeatCount="indefinite">
                <mpath href="#orbit-b" />
              </animateMotion>
            </circle>
          </g>
        </svg>
        <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
          <img
            src="/img/miquel.jpg"
            alt={t("about.photoAlt")}
            width={1000}
            height={1000}
            className="h-full w-full scale-[1.04] object-cover object-[50%_35%]"
          />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_45%,transparent_52%,rgba(10,16,26,0.55)_78%,rgba(10,16,26,0.9)_100%)]" />
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.28),rgba(255,255,255,0.06)_22%,transparent_40%)] mix-blend-screen" />
          <div className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(240,160,75,0.35),inset_-14px_-20px_40px_rgba(240,160,75,0.12)]" />
        </div>
      </div>
      <div className="mx-auto mt-6 h-4 w-2/3 rounded-[50%] bg-black/40 blur-md" aria-hidden="true" />
    </figure>
  );
}
