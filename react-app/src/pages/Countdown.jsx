import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Countdown() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
      if (data) {
        setSiteSettings(data);
      }
      setLoading(false);
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let targetDate = new Date(now.getFullYear(), now.getMonth(), 26, 0, 0, 0);

      // If current time is past the 26th at 00:00:00, target the 26th of next month
      if (now.getTime() >= targetDate.getTime()) {
        targetDate = new Date(now.getFullYear(), now.getMonth() + 1, 26, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / 1000 / 60) % 60),
          seconds: Math.floor((diff / 1000) % 60)
        });
      }
    };

    calculateTimeLeft(); // run once immediately
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const bgStyle = siteSettings?.countdown_bg_url
    ? `url('${siteSettings.countdown_bg_url}') center/cover no-repeat fixed`
    : 'url(/sea_bg.png) center/cover no-repeat fixed';

  const overlayOpacity = siteSettings?.countdown_bg_overlay_opacity !== undefined ? siteSettings.countdown_bg_overlay_opacity / 100 : 0.5;
  const blurValue = siteSettings?.countdown_bg_blur || 0;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center relative overflow-hidden font-prompt py-12">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 scale-105" 
        style={{ 
          background: bgStyle,
          filter: `blur(${blurValue}px)`
        }}
      ></div>
      
      {/* Black Overlay */}
      <div 
        className="absolute inset-0 bg-black z-10" 
        style={{ opacity: overlayOpacity }}
      ></div>

      {/* Main Content */}
      <div className="relative z-20 container mx-auto px-4 flex flex-col items-center justify-center h-full">
        <div className="bg-white/20 backdrop-blur-md p-8 md:p-16 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/30 text-center max-w-3xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            รอคอยวันครบรอบของเรา 💕
          </h1>
          <p className="text-pink-100 text-lg md:text-xl mb-12 drop-shadow">
            วันที่ 26 ของเดือนถัดไป
          </p>

          <div className="grid grid-cols-4 gap-3 md:gap-6">
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-4xl md:text-6xl font-bold text-white drop-shadow">{timeLeft.days}</span>
              </div>
              <span className="text-white text-sm md:text-base font-medium drop-shadow">วัน</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-4xl md:text-6xl font-bold text-white drop-shadow">{timeLeft.hours.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-sm md:text-base font-medium drop-shadow">ชั่วโมง</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-4xl md:text-6xl font-bold text-white drop-shadow">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-sm md:text-base font-medium drop-shadow">นาที</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-4xl md:text-6xl font-bold text-white drop-shadow">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-sm md:text-base font-medium drop-shadow">วินาที</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
