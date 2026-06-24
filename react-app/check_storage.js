import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivikhwvodlzfxvlogrma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWtod3ZvZGx6Znh2bG9ncm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDY2MDgsImV4cCI6MjA5NjcyMjYwOH0.GEWYInLIrdpDoa6QbOoiBgDZ4qQw0UYPhZJOybBeXE4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkStorage() {
  const { data, error } = await supabase.storage.from('media').list();
  if (error) {
    console.error('Error listing files:', error);
    return;
  }
  
  console.log('Files in media bucket:');
  for (const f of data) {
    console.log(`- ${f.name} (size: ${f.metadata?.size})`);
  }
}

checkStorage();
