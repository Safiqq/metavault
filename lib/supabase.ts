import { createClient } from "@supabase/supabase-js";
import { LargeSecureStore } from "./largeSecureStore";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL environment variable is required");
}

if (!supabaseAnonKey) {
  throw new Error("EXPO_PUBLIC_SUPABASE_ANON_KEY environment variable is required");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error("EXPO_PUBLIC_SUPABASE_URL must be a valid URL");
}

const largeSecureStore = new LargeSecureStore();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: largeSecureStore,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'metavault-app',
    },
  },
});
