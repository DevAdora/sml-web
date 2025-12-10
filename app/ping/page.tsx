import { createClient } from "@/app/lib/supabase/server";

export default async function PingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("ping").select("*").limit(5);

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
