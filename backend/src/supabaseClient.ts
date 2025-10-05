import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const url = process.env.SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Use the appropriate key for your use-case.
// For normal server actions, a SERVICE_KEY (server-only) grants elevated privileges; keep it secret and store in env.
// For public usage / limited server operations, you can use anon key.
const supabase = createClient(url, serviceKey ?? anonKey);

export { supabase };
export type { SupabaseClient };
