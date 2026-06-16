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
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12 bg-black/80 backdrop-blur-xl" 
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] bg-white rounded-3xl sm:rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in fade-in zoom-in-[0.98] duration-300" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-3 right-3 sm:top-5 sm:right-5 z-50 p-2 sm:p-2.5 bg-black/10 hover:bg-pink-100 text-gray-700 hover:text-pink-600 rounded-full transition-all backdrop-blur-md"
              onClick={() => setIsModalOpen(false)}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image/Video Container (Responsive height) */}
            <div className="p-3 sm:p-6 pb-0 flex-shrink-0 flex items-center justify-center bg-white">
              <div className="relative w-full bg-gray-50/80 rounded-2xl overflow-hidden flex items-center justify-center max-h-[45vh] sm:max-h-[55vh]">
                {isVideo ? (
                  <video 
                    className="w-full max-h-[45vh] sm:max-h-[55vh] object-contain rounded-2xl" 
                    controls 
                    autoPlay 
                    playsInline 
                    src={src} 
                  />
                ) : (
                  <img 
                    src={src} 
                    alt={card.title} 
                    className="w-full max-h-[45vh] sm:max-h-[55vh] object-contain rounded-2xl drop-shadow-sm" 
                  />
                )}
              </div>
            </div>
            
            {/* Text & Date Content (Scrollable area) */}
            <div className="p-5 sm:p-8 bg-white flex-1 overflow-y-auto min-h-0 custom-scrollbar">
              <h3 className="text-xl sm:text-3xl font-extrabold text-gray-800 mb-2 sm:mb-3 leading-tight">{card.title}</h3>
              <p className="text-gray-600 text-sm sm:text-lg whitespace-pre-line leading-relaxed mb-5 sm:mb-6">{card.description}</p>
              
              {(card.card_date || card.date_text) && (
                <div className="inline-flex items-center gap-2 sm:gap-3.5 bg-pink-50/80 border border-pink-100/50 pr-4 sm:pr-5 pl-2 sm:pl-3 py-2 sm:py-3 rounded-2xl transition-all hover:bg-pink-50 w-full sm:w-auto">
                  <div className="bg-pink-100 text-pink-500 p-2 sm:p-2.5 rounded-xl flex-shrink-0">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex flex-col sm:block flex-1">
                    <p className="text-xs sm:text-base font-bold text-pink-700">
                      {card.card_date ? new Date(card.card_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }) : card.date_text}
                    </p>
                    {card.card_date && (() => {
                      const diffTime = Math.abs(new Date() - new Date(card.card_date));
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return <p className="text-[10px] sm:text-xs text-pink-400/80 font-semibold sm:mt-0.5">ผ่านไปแล้ว {diffDays} วัน</p>;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
