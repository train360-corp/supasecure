"use client";

import { createContext, useContext } from "react";



interface SupabaseContextType {
  url: string;
  keys: {
    anon: string;
  };
}

export const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function useSupabaseContext() {
  const context = useContext(SupabaseContext);
  if (context === null) {
    throw new Error("[useSupabaseContext] called outside of provider");
  }
  return context;
}