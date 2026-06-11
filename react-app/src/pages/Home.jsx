import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div>
      <div className="relative text-center overflow-hidden min-h-[350px] flex items-center justify-center mb-8">
        <img src="/M.png" className="absolute w-full h-full top-0 left-0 sliding-bg object-cover object-center opacity-85 z-0" />
        <div className="relative z-10 bg-white/85 px-12 py-4 rounded-full shadow-[0_10px_25px_rgba(255,105,180,0.3)] backdrop-blur-sm">
          <h3 className="text-4xl md:text-5xl font-bold text-red-500 drop-shadow-md m-0">MY LOVE</h3>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 mb-12">
        <div className="bg-pink-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-pink-500 mb-4 text-center">ยินดีต้อนรับสู่ Pimmie Webpage 🎀</h2>
          <p className="text-center text-gray-700 leading-relaxed max-w-2xl mx-auto">
            ที่นี่คือพื้นที่เก็บความทรงจำดีๆ ของเราสองคน สามารถเข้าไปดูเรื่องราวในแต่ละเดือนได้ที่แท็บ Myaniversary นะครับ
          </p>
          <div className="text-center mt-6">
            <Link to="/mycollection" className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-all inline-block">
              ดูความทรงจำทั้งหมด
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
