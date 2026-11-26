/** Joins class names, skipping empty values. Keeps the project free of extra class-merging dependencies. */
export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-[-0.015em] whitespace-nowrap transition-colors duration-200";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-electric text-ink hover:bg-electric-soft",
  secondary: "border border-line-strong text-paper hover:border-electric hover:text-electric",
  ghost: "text-paper hover:text-electric",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-7 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md"): string {
  return cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size]);
}
