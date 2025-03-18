import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bxemmrkbsnygfipesymp.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4ZW1tcmtic255Z2ZpcGVzeW1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMTcwMDgsImV4cCI6MjA1Njg5MzAwOH0.HpzQLRevq_q6wTV7AgT8y_evLouHXdZ4OSGMFr3tNm8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
