"use client";

import { Row, SupabaseClient, SupabaseFilterChain, SupabaseQuery, Tables } from "@train360-corp/supasecure";
import { createClient } from "@/lib/supabase/clients/browser";
import { useEffect, useMemo, useState } from "react";
import { PostgrestMaybeSingleResponse, PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js";
import { v4 } from "uuid";



export enum Modes {
  Single = "SINGLE",
  MaybeSingle = "MAYBE_SINGLE",
  Many = "MANY"
}

type ModeResult<Table extends Tables, Mode extends Modes> =
  Mode extends Modes.Single ? PostgrestSingleResponse<Row<Table>> :
    Mode extends Modes.MaybeSingle ? PostgrestMaybeSingleResponse<Row<Table>> :
      Mode extends Modes.Many ? PostgrestResponse<Row<Table>> :
        never;

type UseRealtimeDataProps<Table extends Tables, Mode extends Modes> = {
  table: Table;
  mode: Mode;
  filter?: SupabaseFilterChain<Table>;
};

type UseRealtimeDataResult<Table extends Tables, Mode extends Modes> = {
  realtime: {
    channel: string;
    isSubscribed: boolean;
  };
  result: ModeResult<Table, Mode> | undefined;
}

type Deps = readonly (string | number | undefined | null)[];

type SingletonUseRealtimeDataHook<Mode extends Modes> = <Table extends Tables>(props: Omit<UseRealtimeDataProps<Table, Mode>, "mode">, deps?: Deps) => UseRealtimeDataResult<Table, Mode>;

const get = async <Table extends Tables, Mode extends Modes>({ table, supabase, filter, mode }: {
  table: Table;
  supabase: SupabaseClient;
  mode: Mode;
  filter?: SupabaseFilterChain<Table>;
}): Promise<ModeResult<Table, Mode>> => {
  let query: SupabaseQuery<Table> = supabase.from(table).select();
  if (filter) query = filter(query);
  switch (mode) {
    case Modes.MaybeSingle:
      const maybeSingle: PostgrestMaybeSingleResponse<Row<Table>> = await query.maybeSingle();
      return maybeSingle as ModeResult<Table, Mode>;
    case Modes.Single:
      const single: PostgrestSingleResponse<Row<Table>> = await query.single();
      return single as ModeResult<Table, Mode>;
    case Modes.Many:
    default:
      const many: PostgrestResponse<Row<Table>> = await query;
      return many as ModeResult<Table, Mode>;
  }
};


type $UseRealtimeData = <Table extends Tables, Mode extends Modes>(props: UseRealtimeDataProps<Table, Mode>, deps?: Deps) => UseRealtimeDataResult<Table, Mode>;


type UseRealtimeData = $UseRealtimeData & {
  Many: SingletonUseRealtimeDataHook<Modes.Many>;
  MaybeSingle: SingletonUseRealtimeDataHook<Modes.MaybeSingle>;
  Single: SingletonUseRealtimeDataHook<Modes.Single>;
};
export const useRealtimeData: UseRealtimeData = <Table extends Tables, Mode extends Modes>(props: UseRealtimeDataProps<Table, Mode>, deps: Deps = []) => {

  const supabase = createClient();
  const channel = useMemo(() => v4(), []);
  const [ data, setData ] = useState<ModeResult<Table, Mode> | undefined>(undefined);
  const [ subscribed, setSubscribed ] = useState(false);

  useEffect(() => {
    let mounted = true;

    const subscription = supabase
      .channel(channel)
      .on("postgres_changes", {
        schema: "public",
        table: props.table,
        event: "*",
      }, () => { // reload the data
        if (!mounted) return;
        get({ supabase, ...props }).then((result) => {
          if (mounted) setData(result);
        });
      })
      .subscribe((status, err) => {

        // set the initial row
        if (status === "SUBSCRIBED") {
          get({ supabase, ...props }).then((result) => {
            if (mounted) setData(result);
          });
        }

        // handle changes generally
        setSubscribed(status === "SUBSCRIBED");
        if (err) console.error(`[useRealtimeListener channel=${channel}] err:`, err);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ ...deps ]);

  return ({
    result: data,
    realtime: {
      channel,
      isSubscribed: subscribed
    },
  });
};

const useRealtimeDataMany: SingletonUseRealtimeDataHook<Modes.Many> = (props, deps) =>
  useRealtimeData({
    ...props,
    mode: Modes.Many
  }, deps);
useRealtimeData.Many = useRealtimeDataMany;

const useRealtimeDataSingle: SingletonUseRealtimeDataHook<Modes.Single> = (props, deps) =>
  useRealtimeData({
    ...props,
    mode: Modes.Single
  }, deps);
useRealtimeData.Single = useRealtimeDataSingle;

const useRealtimeDataMaybeSingle: SingletonUseRealtimeDataHook<Modes.MaybeSingle> = (props, deps) =>
  useRealtimeData({
    ...props,
    mode: Modes.MaybeSingle
  }, deps);
useRealtimeData.MaybeSingle = useRealtimeDataMaybeSingle;