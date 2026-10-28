import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

/* Retrat petit i discret: cercle amb una vora fina, sense òrbites ni ombres. */
export function PortraitSphere({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <img
      src="/img/miquel.jpg"
      alt={t("about.photoAlt")}
      width={1000}
      height={1000}
      className={cn("aspect-square rounded-full object-cover object-[50%_35%] ring-1 ring-line ring-offset-4 ring-offset-night", className)}
    />
  );
}
