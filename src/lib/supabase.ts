import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { config, supabaseEstConfigure } from "./config";

/**
 * Client Supabase partagé par toute l'application.
 * Si aucune variable d'environnement n'est fournie, l'app reste utilisable
 * grâce aux données d'exemple locales (voir src/data/sampleData.ts).
 */
export const supabase = supabaseEstConfigure
  ? createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
