import { cn } from "@/lib/utils"

/** Tamu brand mark: a plate-and-steam monogram. Placeholder until real brand assets land. */
export function TamuMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex aspect-square shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand text-brand-foreground shadow-sm shadow-brand/30",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" className="size-[60%]" aria-hidden>
        <path d="M4 14a8 8 0 0 0 16 0H4Z" fill="currentColor" />
        <path
          d="M9 4c-.8 1 .8 2 0 3M12 3c-.8 1 .8 2 0 3M15 4c-.8 1 .8 2 0 3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M3 18h18"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/25 to-transparent" />
    </span>
  )
}
