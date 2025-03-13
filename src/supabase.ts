import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   process.env.SUPABASE_URL || '',
//   process.env.SUPABASE_ANON_KEY || ''
// );

const supabase = createClient(
  "https://yzultmotrelptzwfwtjh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6dWx0bW90cmVscHR6d2Z3dGpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE2MzU0ODEsImV4cCI6MjA1NzIxMTQ4MX0.ufexaJGGRDo5Z6N6xY0rlpc0i1_36Y42R9sG_iMWHGI"
);

export default supabase;
