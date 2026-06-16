import { supabase } from '../lib/supabase';
import { BookHeart } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Login() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).single().then(({ data }) => {
      if (data) setSettings(data);
    });
  }, []);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      console.error("Error logging in:", error.message);
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-prompt relative overflow-hidden">
      {settings?.login_bg_url && (
        <>
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url(${settings.login_bg_url})`,
              filter: `blur(${settings.login_bg_blur || 0}px)`,
              transform: 'scale(1.1)',
            }}
          ></div>
          <div 
            className="absolute inset-0 z-0 bg-black transition-all duration-500"
            style={{ opacity: (settings.login_bg_overlay_opacity ?? 50) / 100 }}
          ></div>
        </>
      )}

      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-[40px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-10 max-w-sm w-full text-center border-4 border-white/50">
        <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <BookHeart size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-400 mb-2">Pimmie Webpage</h2>
        <p className="text-gray-500 mb-8 text-sm">กรุณาเข้าสู่ระบบเพื่อเข้าชมเว็บไซต์</p>
        
        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-pink-300 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-6 h-6" alt="Google logo" />
          เข้าสู่ระบบด้วย Google
        </button>
      </div>
    </div>
  );
}
