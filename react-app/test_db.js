import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...val] = line.split('=');
  if (key && val) env[key] = val.join('=');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function test() {
  const { data: months } = await supabase.from('months').select('id, title, page_filename');
  console.log('Months:', months);
  const { data } = await supabase.from('cards').select('id, title, card_date, date_text, month_id').order('card_date', {ascending: true});
  console.log('Cards:', data);
}
test();
