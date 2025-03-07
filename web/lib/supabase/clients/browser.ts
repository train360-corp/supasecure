import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClientConstructor } from "@train360-corp/supasecure";




export const createClient: SupabaseClientConstructor = () =>
  createBrowserClient(
    // @ts-expect-error custom injection into window
    window.SUPABASE_URL!,
    // @ts-expect-error custom injection into window
    window.SUPABASE_ANON_KEY!
  );