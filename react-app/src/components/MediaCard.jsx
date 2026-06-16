import { useState } from 'react';

export default function MediaCard({ card }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isVideo = card.type === 'video';
  const src = card.media_url;

  return (
    <>
      <div 
        className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="h-56 overflow-hidden bg-gray-100 flex items-center justify-center relative group">
          {isVideo ? (
            <video className="w-full h-full object-cover" muted playsInline src={src} />
          ) : (
            <img src={src} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          )}
          {isVideo && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4l12 6-12 6V4z" />
                </svg>
              </div>
            </div>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <h5 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h5>
          <p className="text-gray-600 text-sm flex-grow whitespace-pre-line leading-relaxed">{card.description}</p>
          {(card.card_date || card.date_text) && (
            <div className="mt-4 bg-pink-50 self-start px-3 py-2 rounded-lg">
              <p className="text-sm font-bold text-pink-600">
                {card.card_date ? new Date(card.card_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : card.date_text}
              </p>
              {card.card_date && (() => {
                const diffTime = Math.abs(new Date() - new Date(card.card_date));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return <p className="text-xs text-pink-400 font-medium mt-0.5">({diffDays} วันที่ผ่านมาแล้ว)</p>;
              })()}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/70 backdrop-blur-md" 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-5xl max-h-full flex flex-col items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute -top-10 right-0 sm:-right-4 text-white hover:text-pink-300 transition-colors bg-black/50 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center z-50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {isVideo ? (
              <video 
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] object-contain bg-black/20" 
                controls 
                autoPlay 
                playsInline 
                src={src} 
              />
            ) : (
              <img 
                src={src} 
                alt={card.title} 
                className="w-auto h-auto max-w-full max-h-[85vh] rounded-lg shadow-[0_0_40px_rgba(0,0,0,0.5)] object-contain bg-black/20" 
              />
            )}
            
            <div className="mt-4 text-center max-w-3xl">
              <h3 className="text-2xl font-bold text-white drop-shadow-md mb-2">{card.title}</h3>
              <p className="text-gray-200 text-sm md:text-base drop-shadow">{card.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
