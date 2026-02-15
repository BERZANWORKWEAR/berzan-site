// assets/js/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://vfncwzwuelykytdoedqd.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbmN3end1ZWx5a3l0ZG9lZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzI0NDMsImV4cCI6MjA4NjY0ODQ0M30.tCQaCAaSdUbx6rFUFStrrH1Sb3kS5P5IBgR-kdBBB6c";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
