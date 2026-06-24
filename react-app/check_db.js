import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivikhwvodlzfxvlogrma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWtod3ZvZGx6Znh2bG9ncm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDY2MDgsImV4cCI6MjA5NjcyMjYwOH0.GEWYInLIrdpDoa6QbOoiBgDZ4qQw0UYPhZJOybBeXE4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function check() {
  console.log('--- Checking site_settings ---');
  const { data: settings } = await supabase.from('site_settings').select('*');
  console.log(settings);

  console.log('\n--- Checking months ---');
  const { data: months } = await supabase.from('months').select('*');
  if (months) {
    for (const m of months) {
      console.log(`Month ${m.id} (${m.title}): bg=${m.bg_image_url}`);
    }
  }

  console.log('\n--- Checking cards ---');
  const { data: cards } = await supabase.from('cards').select('*');
  if (cards) {
    for (const c of cards) {
      console.log(`Card ${c.id} (${c.title}): media=${c.media_url}`);
    }
  }
}

check();
