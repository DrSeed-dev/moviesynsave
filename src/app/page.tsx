import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { TOOLS } from "@/lib/tools";

export default function HomePage() {
  return (
    <main className="flex-1 bg-neutral-50 px-4 py-10 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 sm:py-16">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Work with your videos, right in your browser
        </h1>
        <p className="mt-3 max-w-2xl text-neutral-600 dark:text-neutral-400">
          Pick a tool below. Everything runs on your device, so your files are
          never uploaded.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link
                href={tool.href}
                className="group flex h-full flex-col justify-between gap-6 rounded-2xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
              >
                <span>
                  <span className="block text-lg font-medium">
                    {tool.title}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600 dark:text-neutral-400">
                    {tool.description}
                  </span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  Open
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}