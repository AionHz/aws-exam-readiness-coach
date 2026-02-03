import * as React from "react";

type Variant = "neutral" | "orange" | "red" | "green" | "indigo";
type Size = "sm" | "md";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const VARIANT: Record<Variant, string> = {
  neutral:
    "text-white/85 bg-gradient-to-b from-white/10 to-white/5 ring-white/12 hover:from-white/14 hover:to-white/8 hover:ring-white/20",
  orange:
    "text-orange-100 bg-gradient-to-b from-orange-400/25 to-orange-500/15 ring-orange-400/35 hover:from-orange-400/35 hover:to-orange-500/25 hover:ring-orange-300/50",
  red:
    "text-red-100 bg-gradient-to-b from-red-400/25 to-red-500/15 ring-red-400/35 hover:from-red-400/35 hover:to-red-500/25 hover:ring-red-300/50",
  green:
    "text-emerald-100 bg-gradient-to-b from-emerald-400/25 to-emerald-500/15 ring-emerald-400/35 hover:from-emerald-400/35 hover:to-emerald-500/25 hover:ring-emerald-300/50",
  indigo:
    "text-indigo-100 bg-gradient-to-b from-indigo-400/25 to-indigo-500/15 ring-indigo-400/35 hover:from-indigo-400/35 hover:to-indigo-500/25 hover:ring-indigo-300/50",
};

const SIZE: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export function PremiumButton({
  className,
  variant = "neutral",
  size = "sm",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      {...props}
      data-variant={variant}
      className={cx(
        "premium-btn relative overflow-visible rounded-full font-medium backdrop-blur ring-1 transition active:scale-[0.97] select-none",
        "shadow-[0_6px_18px_rgba(0,0,0,0.25)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/35",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        SIZE[size],
        VARIANT[variant],
        className
      )}
    />
  );
}

export function PremiumPill({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      {...props}
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs",
        "text-white/75 bg-white/5 ring-1 ring-white/10 backdrop-blur",
        className
      )}
    />
  );
}
