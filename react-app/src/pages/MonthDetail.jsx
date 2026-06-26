import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import MediaCard from '../components/MediaCard';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

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

  // Function to convert hex to rgba
  const hexToRgba = (hex, opacity) => {
    let r = 255, g = 255, b = 255;
    if (hex && /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      let c = hex.substring(1).split('');
      if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      c = '0x' + c.join('');
      r = (c >> 16) & 255;
      g = (c >> 8) & 255;
      b = c & 255;
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const overlayColor = monthData.bg_overlay_color || '#ffffff';
  const overlayOpacity = monthData.bg_overlay_opacity !== undefined ? monthData.bg_overlay_opacity : 40;
  const overlayRgba = hexToRgba(overlayColor, overlayOpacity / 100);

  const imgOpacity = (monthData.bg_overlay_image_opacity ?? 50) / 100;
  const imgBlur = monthData.bg_overlay_blur ?? 0;
  const imgBright = monthData.bg_overlay_brightness ?? 100;

  return (
    <div className="min-h-screen flex flex-col">
      <div className="relative text-center overflow-hidden min-h-[350px] flex items-center justify-center shrink-0" style={heroStyle}>
        
        {/* Color Overlay (Base) */}
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ backgroundColor: overlayRgba }}></div>
        
        {/* Text Content */}
        <div className="relative z-10 bg-white/85 px-6 md:px-12 py-4 md:py-6 mx-4 md:mx-0 rounded-[50px] shadow-[0_10px_25px_rgba(0,0,0,0.1)] backdrop-blur-sm">
          <h3 className="text-3xl md:text-5xl font-bold m-0" style={{ color: textMainColor, textShadow: '1px 1px 2px rgba(255,255,255,0.8)' }}>
            {monthData.title}
          </h3>
        </div>
      </div>
      
      <div className="relative flex-grow py-12">
        {/* Image Overlay (Behind Cards) */}
        {monthData.bg_overlay_image_url && (
          <div className="absolute inset-0 pointer-events-none" 
               style={{ 
                 backgroundImage: `url('${monthData.bg_overlay_image_url}')`,
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 backgroundAttachment: 'fixed',
                 opacity: imgOpacity,
                 filter: `blur(${imgBlur}px) brightness(${imgBright}%)`
               }}>
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          {monthData.subtitle && (
          <p className="text-center text-lg mb-8" style={{ color: textSubColor }}>
            {monthData.subtitle}
          </p>
          )}
          {cards.length > 0 ? (
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8 justify-items-center"
            >
              {cards.map(card => (
                <motion.div variants={item} key={card.id} className="w-full">
                  <MediaCard card={card} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">ยังไม่มีการ์ดในเดือนนี้</div>
          )}
        </div>
      </div>
    </div>
  );
}
