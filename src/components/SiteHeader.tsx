import Link from "next/link";
import { SITE_NAME } from "@/lib/site";
import { TOOLS } from "@/lib/tools";

// A slim bar at the top of every page: the site name (links home) and the
// tools. This is a server component, so it adds no JavaScript to the page.
export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <nav
        aria-label="Main"
        className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-3"
      >
        <Link href="/" className="font-semibold tracking-tight">
          {SITE_NAME}
        </Link>
        <ul className="flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="transition-colors hover:text-neutral-900 dark:hover:text-white"
              >
                {tool.shortTitle}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}