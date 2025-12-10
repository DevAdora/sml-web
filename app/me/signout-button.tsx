"use client";

import { createClient } from "@/app/lib/supabase/browser";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function SignOutButton() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="w-full h-11 rounded-xl border border-zinc-200 dark:border-zinc-800 font-medium text-zinc-900 dark:text-zinc-50 disabled:opacity-60"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await supabase.auth.signOut();
        router.push("/auth");
        router.refresh();
      }}
    >
      {loading ? "Signing out..." : "Sign out"}
    </button>
  );
}
