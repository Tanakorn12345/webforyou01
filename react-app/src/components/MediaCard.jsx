export default function MediaCard({ card }) {
  const isVideo = card.type === 'video';
  const src = card.media_url;

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="h-56 overflow-hidden bg-gray-100 flex items-center justify-center relative group">
        {isVideo ? (
          <video className="w-full h-full object-cover" controls playsInline src={src} />
        ) : (
          <img src={src} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
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
  );
}
