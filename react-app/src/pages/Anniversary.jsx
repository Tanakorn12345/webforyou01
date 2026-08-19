import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gift, Sparkles, Heart } from 'lucide-react';

export default function Anniversary() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Parallax for the banner
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

  useEffect(() => {
    async function fetchMonths() {
      const { data, error } = await supabase
        .from('months')
        .select('*')
        .order('month_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: true });
      
      if (!error && data) {
        setMonths(data);
      }
      setLoading(false);
    }
    fetchMonths();
  }, []);

  return (
    <div className="bg-[#fcfaf9] min-h-screen pb-32 overflow-hidden font-prompt">
      {/* 1. Immersive Hero Section */}
      <div className="relative h-[60vh] md:h-[70vh] w-full flex flex-col items-center justify-center overflow-hidden mb-24 md:mb-32 shadow-[0_20px_50px_rgba(255,192,203,0.3)]">
        
        {/* Parallax Sliding Banner */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 w-full h-[130%] -top-[15%] z-0">
          <img 
            src="/M.png" 
            alt="Anniversary Banner" 
            className="w-full h-full object-cover sliding-bg"
          />
        </motion.div>
        
        {/* Dark Overlay for Text Legibility */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        {/* Bottom Gradient blending into page background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf9] via-transparent to-transparent z-10"></div>

        {/* Typography */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center z-20 px-4"
        >
          <p className="text-sm md:text-base font-semibold tracking-[0.3em] text-pink-200 uppercase mb-4 drop-shadow-md">
            Our Journey Together
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-xl mb-6 tracking-tight">
            1 Year <span className="text-pink-300">Anniversary</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            มาจนถึงวันนี้แล้วนะ ขอบคุณสำหรับทุกอย่างที่ทำร่วมกัน รักเธอที่สุดเลย เรามาดูกันคับว่าตลอด 1 ปีที่ผ่านมาเราเจออะไรกันบ้างนะ
          </p>
        </motion.div>
      </div>

      {/* 2 & 3. Dynamic Timeline & Premium Cards */}
      {loading ? (
        <div className="text-center py-20 text-rose-400 text-xl font-bold animate-pulse">กำลังโหลดความทรงจำ...</div>
      ) : (
        <div className="container mx-auto px-4 max-w-6xl relative">
          
          {/* Glowing Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-rose-200 via-pink-300 to-rose-200 transform -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(244,114,182,0.5)] z-0"></div>

          {months.length === 0 ? (
            <div className="text-center py-20 text-gray-400 relative z-10 text-lg">ยังไม่มีเรื่องราวถูกเพิ่มเข้ามา</div>
          ) : (
            <div className="relative z-10 space-y-20 md:space-y-12">
              {months.map((month, index) => {
                const isEven = index % 2 === 0;
                const mDate = month.month_date ? new Date(month.month_date) : null;
                const dateString = mDate ? mDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';

                return (
                  <motion.div 
                    key={month.id}
                    initial={{ opacity: 0, y: 80 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className={`relative flex flex-col md:flex-row items-center w-full ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Timeline Node (Pulsing ring) */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 flex items-center justify-center z-0 hidden sm:flex">
                      <div className="w-10 h-10 rounded-full bg-pink-100/50 flex items-center justify-center animate-pulse">
                        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]"></div>
                      </div>
                    </div>

                    {/* Empty space for the other side on desktop */}
                    <div className="hidden md:block md:w-1/2"></div>

                    {/* Content Section */}
                    <div className="w-full px-2 sm:px-6 md:px-0 md:w-1/2 lg:px-8 flex flex-col justify-center relative z-10">
                      
                      {/* Capsule Card Design */}
                      <div className={`flex flex-row items-center bg-white/85 backdrop-blur-xl border border-white/70 shadow-[0_15px_35px_rgb(0,0,0,0.08)] rounded-[3rem] p-2 sm:p-2.5 w-full max-w-[460px] lg:max-w-[520px] mx-auto transition-transform duration-500 hover:-translate-y-1 ${isEven ? 'md:ml-auto md:mr-4' : 'md:mr-auto md:ml-4'}`}>
                        
                        {/* Image Circle */}
                        <div className={`relative w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 shrink-0 rounded-full overflow-hidden shadow-inner border-[3px] border-white group bg-rose-50 flex items-center justify-center ${isEven ? 'order-2' : 'order-1'}`}>
                          {month.bg_image_url ? (
                            <img src={month.bg_image_url} alt={month.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          ) : (
                            <img src="/sea_bg.png" alt={month.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                          )}
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-500 rounded-full"></div>
                        </div>

                        {/* Text Section */}
                        <div className={`flex-grow px-4 sm:px-6 py-2 ${isEven ? 'text-right order-1' : 'text-left order-2'}`}>
                          {dateString && (
                            <p className="text-[10px] sm:text-xs font-bold tracking-widest text-rose-500 uppercase mb-1 drop-shadow-sm">
                              {dateString}
                            </p>
                          )}
                          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-1 sm:mb-2 leading-tight">{month.title}</h3>
                          <p className="text-gray-600 leading-snug text-xs sm:text-sm line-clamp-2 sm:line-clamp-3">
                            {month.subtitle || 'ความทรงจำที่แสนพิเศษ...'}
                          </p>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 4. Elegant Letter Section (Gift Box) */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mt-40 mb-10 max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-[2rem] shadow-xl p-1 relative overflow-hidden">
              {/* Premium Border effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-pink-100 to-rose-200 opacity-50"></div>
              
              <div className="relative bg-[#fffdfc] rounded-[1.8rem] p-10 md:p-16 border border-rose-50/50 min-h-[400px] flex flex-col items-center justify-center">
                
                {!isLetterOpen ? (
                  <motion.div 
                    className="flex flex-col items-center justify-center cursor-pointer group w-full h-full py-10"
                    onClick={() => setIsLetterOpen(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative mb-6">
                      <div className="w-28 h-28 bg-gradient-to-tr from-pink-100 to-rose-50 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                        <Gift className="w-14 h-14 text-rose-500 drop-shadow-md group-hover:rotate-12 transition-transform duration-300" strokeWidth={1.5} />
                      </div>
                      {/* Sparkles */}
                      <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <Heart className="absolute bottom-2 -left-4 w-7 h-7 text-pink-400 fill-pink-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                    </div>
                    <h2 className="text-2xl md:text-4xl font-bold text-gray-800 mb-3 font-prompt tracking-wide group-hover:text-pink-500 transition-colors">
                      A Special Gift For You
                    </h2>
                    <p className="text-pink-400 font-medium text-lg animate-pulse">คลิกเพื่อเปิดดูของขวัญชิ้นสุดท้าย</p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                    className="w-full relative"
                  >
                    {/* Decoration corners */}
                    <svg className="absolute -top-4 -left-4 md:-top-6 md:-left-6 w-8 h-8 md:w-10 md:h-10 text-rose-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>
                    <svg className="absolute -top-4 -right-4 md:-top-6 md:-right-6 w-8 h-8 md:w-10 md:h-10 text-rose-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>
                    <svg className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 w-8 h-8 md:w-10 md:h-10 text-rose-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>
                    <svg className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 w-8 h-8 md:w-10 md:h-10 text-rose-200" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0l3.09 8.91L24 12l-8.91 3.09L12 24l-3.09-8.91L0 12l8.91-3.09z"/></svg>
                    
                    <h2 className="text-3xl md:text-5xl font-bold text-center text-gray-800 mb-10 font-prompt tracking-wide flex items-center justify-center gap-3">
                      To My Love <Heart className="w-8 h-8 md:w-10 md:h-10 text-rose-500 fill-rose-500 animate-pulse" />
                    </h2>
                    
                    <div className="max-w-2xl mx-auto text-center">
                      <p className="text-gray-600 text-base md:text-xl leading-loose italic font-light mb-10 relative">
                        <span className="text-5xl text-pink-200 absolute -top-6 -left-6 opacity-50">"</span>
                        ขอบคุณสำหรับ 1 ปีที่ผ่านมานะ เค้าขอโทษสำหรับทุกอย่างที่ผ่านมาทั้งหมดเลย ที่ผ่านมาเป็นคนที่อาจจะไม่ดีที่สุด ทำเธอน้อยใจบ่อยครั้ง ทำเทอลำบากใจเพราะเค้า แต่เค้ามีความสุขทุกครั้งที่เจอกัน ได้คุยกัน แค่ได้กินข้าวมื้อเล็กก็พิเศษมากเลย เค้าชอบอยู่กับเทอในทุกช่วงเวลาเลยนะคั้บ เลือกตั้งแต่วันแรกเพราะเทอเข้าใจเค้ามากๆเลย ขอบคุณที่เทอตอบรับเค้าเป็นแฟนนะคั้บ อะไรที่ไม่ดีก็จะปรับปรุงตัวให้ดีขึ้น เค้ารักเธอที่สุดเลยนะคั้บ เจอปัญหาอะไรก็นึกถึงหน้าเทอเสมอเลย ธนกรรักพิมพิชชา ที่สุดในใจเลยนะคั้บ
                        <span className="text-5xl text-pink-200 absolute -bottom-8 -right-4 opacity-50">"</span>
                      </p>
                      
                      <div className="w-20 h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent mx-auto mb-6"></div>
                      
                      <p className="text-rose-500 font-bold text-lg tracking-[0.2em] uppercase mb-1">
                        Tanakorn
                      </p> 
                      <p className="text-pink-300 font-medium text-sm tracking-widest uppercase">
                        26/08/2026
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      )}
    </div>
  );
}
