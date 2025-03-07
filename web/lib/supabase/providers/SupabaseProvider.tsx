"use server";

import { ReactNode } from "react";
import SupabaseBrowserProvider from "@/lib/supabase/providers/SupabaseBrowserProvider";



const SupabaseProvider = ({ children }: {
  children: ReactNode;
}) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return (
    <SupabaseBrowserProvider supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey}>
      {children}
    </SupabaseBrowserProvider>
  );

};

export default SupabaseProvider;