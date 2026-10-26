import type { Status } from "@/content/projects";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

const styles: Record<Status, string> = {
  concept: "border-dim/60 text-dim",
  prototype: "border-amber/70 text-amber",
  playable: "border-amber bg-amber text-night",
};

export function StatusChip({ status, className }: { status: Status; className?: string }) {
  const { t } = useI18n();
  return (
    <span className={cn("hud inline-flex items-center gap-2 border px-2.5 py-1 text-[0.68rem]", styles[status], className)}>
      <span className={cn("size-1.5 rounded-full", status === "playable" ? "bg-night" : "bg-current")} aria-hidden="true" />
      {t(`status.${status}`)}
    </span>
  );
}
