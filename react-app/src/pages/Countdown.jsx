import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Countdown() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [elapsedTime, setElapsedTime] = useState({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
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
    if (loading) return;

    const calculateElapsedTime = () => {
      const anniversaryStr = siteSettings?.anniversary_date || '2023-01-26';
      const startDate = new Date(`${anniversaryStr}T00:00:00`);
      const now = new Date();

      if (now.getTime() < startDate.getTime()) {
         setElapsedTime({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
         return;
      }

      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();

      if (days < 0) {
        months -= 1;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }

      if (months < 0) {
        years -= 1;
        months += 12;
      }

      setElapsedTime({
        years,
        months,
        days,
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds()
      });
    };

    calculateElapsedTime();
    const timer = setInterval(calculateElapsedTime, 1000);
    return () => clearInterval(timer);
  }, [siteSettings, loading]);

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
        <div className="bg-white/20 backdrop-blur-md p-8 md:p-12 rounded-[40px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/30 text-center max-w-4xl w-full">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Our Journey <span className="text-pink-300">💖</span>
          </h1>
          <p className="text-pink-100 text-lg md:text-xl mb-10 drop-shadow">
            ระยะเวลาที่เราอยู่ด้วยกัน
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.years}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">ปี</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.months}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">เดือน</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.days}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">วัน</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.hours.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">ชั่วโมง</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.minutes.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">นาที</span>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/30 backdrop-blur-sm rounded-2xl w-full aspect-square flex items-center justify-center shadow-inner border border-white/20 mb-2">
                <span className="text-3xl md:text-5xl font-bold text-white drop-shadow">{elapsedTime.seconds.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-white text-xs md:text-sm font-medium drop-shadow">วินาที</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
