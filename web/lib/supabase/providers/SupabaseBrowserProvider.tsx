"use client";
import { ReactNode, useEffect, useState } from "react";



interface InitSupabaseProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  children: ReactNode;
}

export default function SupabaseBrowserProvider({ supabaseUrl, supabaseAnonKey, children }: InitSupabaseProps) {
  const [ isInitialized, setIsInitialized ] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // @ts-expect-error custom injection into window
      window.SUPABASE_URL = supabaseUrl;
      // @ts-expect-error custom injection into window
      window.SUPABASE_ANON_KEY = supabaseAnonKey;
      setIsInitialized(true);
    }
  }, [ typeof window ]);

  if (!isInitialized) return null;

  return children;
}