import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivikhwvodlzfxvlogrma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWtod3ZvZGx6Znh2bG9ncm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDY2MDgsImV4cCI6MjA5NjcyMjYwOH0.GEWYInLIrdpDoa6QbOoiBgDZ4qQw0UYPhZJOybBeXE4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
