import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import SignOutButton from "./signout-button";

export default async function MePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/auth");

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-950 shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          You’re signed in ✅
        </h1>

        <div className="text-sm text-zinc-700 dark:text-zinc-300 space-y-1">
          <p>
            <span className="font-medium">User ID:</span> {data.user.id}
          </p>
          <p>
            <span className="font-medium">Email:</span> {data.user.email}
          </p>
        </div>

        <SignOutButton />
      </div>
    </div>
  );
}
