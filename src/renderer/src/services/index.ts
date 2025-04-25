const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsYmp3emxub3pxbW9pY29meHR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMDgxMzc2NSwiZXhwIjoyMDQ2Mzg5NzY1fQ.0C8B6y3HXAXzBthtk3Zoyh83DhTS6euUSap4xq2eEyw";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./supabase";
const supabaseUrl = "https://ylbjwzlnozqmoicofxty.supabase.co";

export const supabase = createClient<Database>(supabaseUrl, SUPABASE_KEY);

export const getTypes = async () => {
  const { data, error } = await supabase.from("types").select("*");
  if (error) {
    throw error;
  }
  return data;
};
