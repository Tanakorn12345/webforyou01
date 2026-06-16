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
            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 bg-white/90 hover:bg-white rounded-full w-10 h-10 flex items-center justify-center z-50 backdrop-blur-sm shadow-sm transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-gray-100/50 flex-shrink flex items-center justify-center relative min-h-[40vh] max-h-[65vh]">
              {isVideo ? (
                <video 
                  className="w-full h-full max-h-[65vh] object-contain" 
                  controls 
                  autoPlay 
                  playsInline 
                  src={src} 
                />
              ) : (
                <img 
                  src={src} 
                  alt={card.title} 
                  className="w-full h-full max-h-[65vh] object-contain" 
                />
              )}
            </div>
            
            <div className="p-6 md:p-8 bg-white overflow-y-auto">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">{card.title}</h3>
              <p className="text-gray-600 text-base md:text-lg whitespace-pre-line leading-relaxed mb-6">{card.description}</p>
              
              {(card.card_date || card.date_text) && (
                <div className="inline-block bg-pink-50 px-4 py-3 rounded-xl border border-pink-100">
                  <p className="text-sm md:text-base font-bold text-pink-600 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {card.card_date ? new Date(card.card_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : card.date_text}
                  </p>
                  {card.card_date && (() => {
                    const diffTime = Math.abs(new Date() - new Date(card.card_date));
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return <p className="text-xs md:text-sm text-pink-400 font-medium mt-1 ml-7">({diffDays} วันที่ผ่านมาแล้ว)</p>;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
