import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Countdown() {
  const [siteSettings, setSiteSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
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

    const calculateTimes = () => {
      const now = new Date();
      
      // 1. Calculate Countdown to next 26th
      let targetDate = new Date(now.getFullYear(), now.getMonth(), 26, 0, 0, 0);
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

      // 2. Calculate Elapsed Time since Anniversary
      const anniversaryStr = siteSettings?.anniversary_date || '2023-01-26';
      const startDate = new Date(`${anniversaryStr}T00:00:00`);

      if (now.getTime() < startDate.getTime()) {
         setElapsedTime({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
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
      }
    };

    calculateTimes();
    const timer = setInterval(calculateTimes, 1000);
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
          
          {/* Section 1: Countdown */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Happy Anniversary! <span className="text-pink-300">🎉</span>
          </h1>
          <p className="text-pink-100 text-lg md:text-xl mb-8 drop-shadow">
            นับถอยหลังสู่วันที่ 26 ของเดือนถัดไป
          </p>

          <div className="grid grid-cols-4 gap-3 md:gap-6 mb-10">
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

          <div className="w-full h-[1px] bg-white/20 mb-10"></div>

          {/* Section 2: Count Up */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 drop-shadow-md">
            ระยะเวลาที่เราอยู่ด้วยกัน 💖
          </h2>

          <div className="flex justify-center flex-wrap gap-4 md:gap-8 max-w-2xl mx-auto">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.years}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">ปี</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.months}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">เดือน</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.days}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">วัน</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.hours.toString().padStart(2, '0')}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">ชม.</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.minutes.toString().padStart(2, '0')}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">นาที</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-white drop-shadow-md">{elapsedTime.seconds.toString().padStart(2, '0')}</span>
              <span className="text-white/80 text-sm md:text-base font-medium">วิ</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
