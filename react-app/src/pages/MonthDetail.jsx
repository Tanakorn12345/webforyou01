import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MediaCard from '../components/MediaCard';

export default function MonthDetail() {
  const { filename } = useParams();
  const [monthData, setMonthData] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: mData, error: mError } = await supabase
        .from('months')
        .select('*')
        .eq('page_filename', filename)
        .single();
        
      if (mError || !mData) {
        setLoading(false);
        return;
      }
      setMonthData(mData);

      const { data: cData } = await supabase
        .from('cards')
        .select('*')
        .eq('month_id', mData.id)
        .order('card_date', { ascending: true, nullsFirst: false })
        .order('order_num', { ascending: true });
        
      if (cData) setCards(cData);
      setLoading(false);
    }
    loadData();
  }, [filename]);

  if (loading) return <div className="text-center py-24 text-pink-500 font-bold text-xl">กำลังโหลดข้อมูล...</div>;
  if (!monthData) return <div className="text-center py-24 text-gray-500">ไม่พบข้อมูลเดือนนี้</div>;

  const heroStyle = {
    background: monthData.bg_image_url ? `url('${monthData.bg_image_url}') center/cover no-repeat` : 'url(/sea_bg.png) center/cover no-repeat',
  };
  
  const textMainColor = monthData.theme_main_text_color || '#003366';
  const textSubColor = monthData.theme_sub_text_color || '#005b9f';

  return (
    <div>
      <div className="relative text-center overflow-hidden min-h-[350px] flex items-center justify-center mb-8" style={heroStyle}>
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]"></div>
        <div className="relative z-10 bg-white/85 px-12 py-6 rounded-[50px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] backdrop-blur-sm">
          <h3 className="text-4xl md:text-5xl font-bold m-0" style={{ color: textMainColor, textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
            {monthData.title}
          </h3>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mb-12">
        {monthData.subtitle && (
          <p className="text-center text-lg mb-8" style={{ color: textSubColor }}>
            {monthData.subtitle}
          </p>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <MediaCard key={card.id} card={card} />
          ))}
          {cards.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">ยังไม่มีการ์ดในเดือนนี้</div>
          )}
        </div>
      </div>
    </div>
  );
}
