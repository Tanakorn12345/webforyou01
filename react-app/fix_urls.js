import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivikhwvodlzfxvlogrma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWtod3ZvZGx6Znh2bG9ncm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDY2MDgsImV4cCI6MjA5NjcyMjYwOH0.GEWYInLIrdpDoa6QbOoiBgDZ4qQw0UYPhZJOybBeXE4';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fixUrls() {
  console.log('Fetching cards...');
  const { data: cards } = await supabase.from('cards').select('*');
  
  for (const card of cards) {
    if (card.media_url && card.media_url.startsWith('/public/')) {
      const fixedUrl = card.media_url.replace('/public/', '/');
      console.log(`Fixing Card ${card.id}: ${card.media_url} -> ${fixedUrl}`);
      await supabase.from('cards').update({ media_url: fixedUrl }).eq('id', card.id);
    }
  }

  console.log('Fetching months...');
  const { data: months } = await supabase.from('months').select('*');
  for (const month of months) {
    if (month.bg_image_url && month.bg_image_url.startsWith('/public/')) {
      const fixedUrl = month.bg_image_url.replace('/public/', '/');
      console.log(`Fixing Month ${month.id}: ${month.bg_image_url} -> ${fixedUrl}`);
      await supabase.from('months').update({ bg_image_url: fixedUrl }).eq('id', month.id);
    }
  }
  
  console.log('Done!');
}

fixUrls();
