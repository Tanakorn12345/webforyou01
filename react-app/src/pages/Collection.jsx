import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

export default function Collection() {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div>
      <div className="relative text-center overflow-hidden min-h-[350px] flex items-center justify-center mb-8">
        <img src="/M.png" className="absolute w-full h-full top-0 left-0 sliding-bg object-cover object-center opacity-85 z-0" />
        <div className="relative z-10 bg-white/85 px-8 md:px-12 py-4 mx-4 md:mx-0 rounded-full shadow-[0_10px_25px_rgba(255,105,180,0.3)] backdrop-blur-sm">
          <h3 className="text-3xl md:text-5xl font-bold text-red-500 drop-shadow-md m-0">MY LOVE</h3>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">คอลเลกชันเดือนทั้งหมด</h2>
        
        {loading ? (
          <div className="text-center py-12 text-pink-500">กำลังโหลดข้อมูล...</div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {months.map(month => (
              <motion.div variants={item} key={month.id}>
                <Link to={`/month/${month.page_filename}`} className="block group h-full">
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col">
                    <div className="h-48 bg-gray-200 overflow-hidden relative flex-shrink-0">
                      {month.bg_image_url ? (
                        <img src={month.bg_image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <img src="/sea_bg.png" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all"></div>
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <h5 className="text-xl font-bold text-gray-800 mb-2">{month.title}</h5>
                      {month.month_date && (
                        <div className="mb-3 bg-pink-50 self-start px-2.5 py-1.5 rounded-lg border border-pink-100">
                          <p className="text-xs font-bold text-pink-600">
                            {new Date(month.month_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          {(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const mDate = new Date(month.month_date);
                            mDate.setHours(0, 0, 0, 0);
                            const diffTime = today.getTime() - mDate.getTime();
                            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays < 0) {
                              return <p className="text-[10px] text-pink-400 font-medium mt-0.5">(อีก {Math.abs(diffDays)} วันจะถึง)</p>;
                            } else if (diffDays === 0) {
                              return <p className="text-[10px] text-pink-400 font-medium mt-0.5">(วันนี้! 🎉)</p>;
                            } else {
                              return <p className="text-[10px] text-pink-400 font-medium mt-0.5">({diffDays} วันที่ผ่านมาแล้ว)</p>;
                            }
                          })()}
                        </div>
                      )}
                      <p className="text-gray-500 text-sm line-clamp-2">{month.subtitle || 'คลิกเพื่อดูความทรงจำ'}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {months.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">ยังไม่มีข้อมูลเดือนในระบบ</div>
            )}
          </motion.div>
        )}

        {/* Anniversary Banner (Moved to bottom) */}
        {!loading && (
          <div className="mt-20 pt-16 border-t border-pink-100">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 max-w-5xl mx-auto px-2"
            >
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(255,192,203,0.3)] group cursor-pointer h-72 md:h-96 flex items-center justify-center">
                <img src="/M.png" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="My Anniversary" />
                
                {/* Dark/Romantic Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-700"></div>

                {/* Content */}
                <Link to="/anniversary" className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-8 text-center">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-12 rounded-3xl flex flex-col items-center transform transition-transform duration-500 group-hover:-translate-y-2 w-[95%] sm:w-[90%] max-w-xl">
                    <p className="text-pink-200 tracking-[0.3em] text-[10px] sm:text-xs md:text-sm font-semibold uppercase mb-2 sm:mb-3 drop-shadow-md">
                      Special Chapter
                    </p>
                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold text-white drop-shadow-xl mb-3 sm:mb-4 font-prompt tracking-tight">
                      My Anniversary
                    </h2>
                    <p className="text-gray-100 text-sm md:text-base max-w-md mx-auto mb-8 drop-shadow-md">
                      ย้อนรอยความทรงจำตลอด 1 ปีที่แสนพิเศษของเรา
                    </p>

                    <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/50 text-white font-medium py-3 px-8 rounded-full shadow-lg group-hover:bg-white group-hover:text-pink-600 transition-all duration-500">
                      คลิกเพื่อดูความทรงจำ
                    </div>
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
