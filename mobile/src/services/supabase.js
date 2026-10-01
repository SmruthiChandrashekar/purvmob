import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const SUPABASE_URL = extra.supabaseUrl || 'https://qcnxzravgrjdpwfqamzn.supabase.co';
const SUPABASE_ANON_KEY = extra.supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjbnh6cmF2Z3JqZHB3ZnFhbXpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNjMzMzQsImV4cCI6MjA4OTkzOTMzNH0.Sam3JHUp17-_lAdjQOA9jwFmTHSbuOFNohGIOaVkmVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
