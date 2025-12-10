import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col justify-between py-24 px-8 sm:py-32 sm:px-16 bg-white dark:bg-black">
        {/* Top */}
        <div className="space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                sml-web
              </span>
            </div>
          </div>

          <div className="space-y-5">
            <h1 className="text-3xl sm:text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
              SML — Share Mo Lang
              <span className="block text-zinc-600 dark:text-zinc-400 font-normal mt-2">
                A Medium-inspired space for bookworms: short, medium, or long.
              </span>
            </h1>

            <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Post reviews, share reading lists, and discuss stories with other
              readers. We’re currently setting up the foundation: Supabase +
              Next.js + (later) Flutter.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/signup"
              className="rounded-full border border-zinc-200 dark:border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/auth/login"
              className="rounded-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-black px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-10 text-sm text-zinc-500 dark:text-zinc-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span>
            Next: create <span className="font-medium">posts</span>,{" "}
            <span className="font-medium">profiles</span>, and{" "}
            <span className="font-medium">reading lists</span>.
          </span>

          <div className="flex items-center gap-4">
            <a
              className="hover:underline"
              href="https://supabase.com/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Supabase Docs
            </a>
            <a
              className="hover:underline"
              href="https://nextjs.org/docs"
              target="_blank"
              rel="noopener noreferrer"
            >
              Next.js Docs
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
