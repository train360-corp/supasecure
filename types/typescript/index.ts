import { SupabaseClient as Client } from "@supabase/supabase-js";
import { Database as DB } from "./gen";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";



/**
 * Database Types
 */
export type Database = DB;
export type Tables = string & keyof DB["public"]["Tables"];
type RowModes<Table extends Tables> = string & keyof DB["public"]["Tables"][Table];
export type Row<Table extends Tables, Mode extends RowModes<Table> = "Row"> = DB["public"]["Tables"][Table][Mode];
export type Columns<Table extends Tables> = string & keyof Row<Table>;
export type ColumnDef<Table extends Tables, Column extends Columns<Table>> = Row<Table>[Column];

export type Enums = string & keyof DB["public"]["Enums"];
export type Enum<T extends Enums> = DB["public"]["Enums"][T];

export type CompositeTypes = string & keyof DB["public"]["CompositeTypes"];
export type CompositeType<T extends CompositeTypes> = string & DB["public"]["CompositeTypes"][T];

/**
 * Query Types
 */
export type SupabaseQuery<Table extends Tables> = PostgrestFilterBuilder<Database["public"], Database["public"]["Tables"][Table]["Row"], Row<Table>[]>;
export type SupabaseFilterChain<Table extends Tables> = (query: SupabaseQuery<Table>) => SupabaseQuery<Table>;


/**
 * Client Types
 */
export type SupabaseClient = Client<Database, "public">;
export type SupabaseClientConstructor = () => SupabaseClient;



