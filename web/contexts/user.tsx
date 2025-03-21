"use client";

import { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";
import { Row } from "@train360-corp/supasecure";
import { createClient } from "@/lib/supabase/clients/browser";
import { User } from "@supabase/auth-js";
import { useRealtimeData } from "@/lib/supabase/realtime";
import { NIL } from "uuid";
import { redirect } from "next/navigation";



type UserContextType = {
  user: Row<"users">;
  preferences: Row<"preferences">;
  auth: {
    user: User;
  }
}

export const UserContext = createContext<UserContextType | null>(null);

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("[useUserContext] called outside of provider");
  }
  return context;
}

export const UserContextProvider: FC<{
  children: ReactNode;
}> = ({ children }) => {

  const supabase = createClient();
  const [ authUser, setAuthUser ] = useState<User | null>(null);

  const user = useRealtimeData.MaybeSingle({
    table: "users",
    filter: q => q.eq("id", authUser?.id ?? NIL)
  }, [ authUser?.id ]);

  const preferences = useRealtimeData.MaybeSingle({
    table: "preferences",
    filter: q => q.eq("id", authUser?.id ?? NIL)
  }, [ authUser?.id ]);

  useEffect(() => {
    supabase.auth.onAuthStateChange((_, session) => {
      setAuthUser(session?.user ?? null);
      if (!session?.user) redirect("/");
    });
  }, []);

  if (!user.result?.data || !preferences.result?.data || !authUser) return null;

  return (
    <UserContext
      value={{
        user: user.result.data,
        preferences: preferences.result.data,
        auth: {
          user: authUser
        }
      }}
    >
      {children}
    </UserContext>
  );
};