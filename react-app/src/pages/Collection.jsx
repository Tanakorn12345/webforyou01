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
      </div>
    </div>
  );
}
