import { createClient } from "@/lib/supabase/clients/server";
import { redirect } from "next/navigation";



export default async function Home() {

  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (user) return redirect("/dashboard");
  else return redirect("/login");
}
