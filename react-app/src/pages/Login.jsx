import { supabase } from '../lib/supabase';
import { LockKeyhole } from 'lucide-react';

export default function Login() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error("Error logging in:", error.message);
      alert('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-prompt">
      <div className="bg-white rounded-[40px] shadow-[0_10px_40px_rgba(236,72,153,0.1)] p-10 max-w-sm w-full text-center border-4 border-white">
        <div className="w-20 h-20 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <LockKeyhole size={40} strokeWidth={2.5} />
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
