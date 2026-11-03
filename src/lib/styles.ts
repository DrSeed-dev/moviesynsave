// Shared button styles, so every tool's buttons look and behave the same.
// Tailwind finds these class names because it scans all source files.

export const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-300";

export const secondaryButton =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-neutral-300 px-5 text-sm font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-700 dark:hover:bg-neutral-800";