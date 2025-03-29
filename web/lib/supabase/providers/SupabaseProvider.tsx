"use client";

import {ReactNode, useEffect, useState} from "react";

interface InitSupabaseProps {
    children: ReactNode;
}

export default function SupabaseProvider({children}: InitSupabaseProps) {
    const [keys, setKeys] = useState<{ supabaseUrl: string; supabaseAnonKey: string } | null>(null);

    useEffect(() => {
        fetch("/api/config")
            .then((res) => res.json())
            .then((data) => {
                // @ts-expect-error custom injection into window
                window.SUPABASE_PUBLIC_URL = data.supabaseUrl;
                // @ts-expect-error custom injection into window
                window.SUPABASE_ANON_KEY = data.supabaseAnonKey;
                setKeys(data);
            });
    }, []);

    if (!keys) return null; // or loading spinner

    return children;
}