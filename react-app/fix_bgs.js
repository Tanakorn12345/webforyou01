import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ivikhwvodlzfxvlogrma.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2aWtod3ZvZGx6Znh2bG9ncm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDY2MDgsImV4cCI6MjA5NjcyMjYwOH0.GEWYInLIrdpDoa6QbOoiBgDZ4qQw0UYPhZJOybBeXE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const updates = [
  { page_filename: 'ani1', bg_image_url: '/08BCC940-2DFE-4659-8255-58E8376D3DB7.JPG' },
  { page_filename: 'ani2', bg_image_url: '/public/6D3A728D-2691-4C74-854A-56CD56D2CC45.JPG' },
  { page_filename: 'ani3', bg_image_url: '/3monthspic/0408D242-0732-48F6-8DA5-1285808BC6E5.JPG' },
  { page_filename: 'ani4', bg_image_url: '/4monthspic/1854EF76-1277-4D04-A9C4-DDAA523974CA.JPG' },
  { page_filename: 'ani5', bg_image_url: '/5momthspic/57D2B9EC-CBC2-4D98-AF29-13CABE2B595D.JPG' },
  { page_filename: 'ani6', bg_image_url: '/6monthspic/overview pic 6 month.jpg' },
  { page_filename: 'ani7', bg_image_url: '/7monthspic/overview pic 7 month.jpg' },
  { page_filename: 'ani8', bg_image_url: '/8monthspic/overview pic 8 month.jpg' },
  { page_filename: 'ani9', bg_image_url: '/9monthspic/photood9months.jpg' }
];

async function update() {
  for (const u of updates) {
    const { error } = await supabase.from('months').update({ bg_image_url: u.bg_image_url }).eq('page_filename', u.page_filename);
    if (error) console.error("Error for", u.page_filename, ":", error);
  }
  console.log("Done");
}
update();
