import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Calendar as CalendarIcon, Users, Edit, Trash2 } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  parseISO,
  addHours
} from 'date-fns';
import { th } from 'date-fns/locale';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    setLoading(true);
    // Fetch events for the current viewed month (to be optimal, but we can just fetch all for now since it's a small app)
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
      
    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar generation logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = [];
  let day = startDate;
  while (day <= endDate) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // SweetAlert: Generate Google Calendar Link
  const getGoogleCalendarLink = (event) => {
    const startDate = new Date(event.event_date);
    const endDate = addHours(startDate, 1); // Default duration 1 hour
    
    // Format to YYYYMMDDTHHMMSSZ (UTC)
    const formatGoogleDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    
    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    if (event.description) url.searchParams.append('details', event.description);
    if (event.location) url.searchParams.append('location', event.location);
    url.searchParams.append('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    if (event.target_email) url.searchParams.append('add', event.target_email);
    
    return url.toString();
  };

  // SweetAlert: View Events on a Day
  const handleDayClick = (selectedDay) => {
    const dayEvents = events.filter(e => isSameDay(parseISO(e.event_date), selectedDay));
    
    let htmlContent = `<div class="text-left flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">`;
    
    if (dayEvents.length === 0) {
      htmlContent += `<div class="text-center text-gray-400 py-6 text-sm">ไม่มีกิจกรรมในวันนี้</div>`;
    } else {
      dayEvents.forEach(evt => {
        const timeStr = format(parseISO(evt.event_date), 'HH:mm');
        const googleLink = getGoogleCalendarLink(evt);
        const iconClock = renderToString(<Clock size={14} className="text-pink-400 inline-block" />);
        const iconMapPin = renderToString(<MapPin size={14} className="text-pink-400 inline-block" />);
        const iconUsers = renderToString(<Users size={14} className="text-pink-400 inline-block" />);
        const iconCalendar = renderToString(<CalendarIcon size={14} className="inline-block" />);
        const iconEdit = renderToString(<Edit size={16} />);
        const iconTrash = renderToString(<Trash2 size={16} />);

        htmlContent += `
          <div class="border border-pink-100 rounded-xl p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors shadow-sm relative group">
            <h3 class="font-bold text-pink-600 text-lg mb-1">${evt.title}</h3>
            ${evt.description ? `<p class="text-sm text-gray-600 mb-2">${evt.description}</p>` : ''}
            
            <div class="flex flex-col gap-1 mt-2 text-xs text-gray-500 font-medium">
              <div class="flex items-center gap-1.5">
                ${iconClock} เวลา ${timeStr} น.
              </div>
              ${evt.location ? `
                <div class="flex items-center gap-1.5 truncate">
                  ${iconMapPin} ${evt.location}
                </div>
              ` : ''}
              ${evt.target_email ? `
                <div class="flex items-center gap-1.5 truncate">
                  ${iconUsers} เป้าหมายแจ้งเตือน: ${evt.target_email}
                </div>
              ` : ''}
            </div>

            <div class="mt-4 flex flex-col sm:flex-row gap-2">
              <a href="${googleLink}" target="_blank" rel="noopener noreferrer" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm">
                ${iconCalendar} เพิ่มลง Google Calendar
              </a>
              <div class="flex gap-2 justify-end">
                <button onclick="window.editEvent('${evt.id}')" class="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors flex items-center justify-center">${iconEdit}</button>
                <button onclick="window.deleteEvent('${evt.id}')" class="bg-red-50 hover:bg-red-100 text-red-500 p-2 rounded-lg transition-colors flex items-center justify-center">${iconTrash}</button>
              </div>
            </div>
          </div>
        `;
      });
    }
    htmlContent += `</div>`;

    Swal.fire({
      title: `กิจกรรมวันที่ ${format(selectedDay, 'd MMMM yyyy', { locale: th })}`,
      html: htmlContent,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: '+ เพิ่มกิจกรรมใหม่',
      confirmButtonColor: '#ec4899',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]' },
    }).then((result) => {
      if (result.isConfirmed) {
        showEventForm(null, selectedDay);
      }
    });
  };

  // Expose edit and delete to window for SweetAlert HTML buttons
  window.editEvent = (id) => {
    Swal.close();
    const evt = events.find(e => e.id === id);
    if (evt) showEventForm(evt);
  };

  window.deleteEvent = async (id) => {
    Swal.close();
    if (await Swal.fire({ title: 'ลบกิจกรรมนี้?', text: 'คุณไม่สามารถกู้คืนได้', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' }).then(r => r.isConfirmed)) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (!error) {
        Swal.fire('สำเร็จ!', 'ลบกิจกรรมแล้ว', 'success');
        fetchEvents();
      }
    }
  };

  // SweetAlert: Add / Edit Event Form
  const showEventForm = (event = null, defaultDate = new Date()) => {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    let defaultDateTime = format(defaultDate, "yyyy-MM-dd'T'12:00");
    if (event) {
      // Convert UTC ISO to local datetime string for the input
      const localDate = new Date(event.event_date);
      const tzOffset = localDate.getTimezoneOffset() * 60000;
      defaultDateTime = (new Date(localDate - tzOffset)).toISOString().slice(0, 16);
    }

    Swal.fire({
      title: event ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <div>
            <label class="block text-xs font-bold text-pink-500 mb-1">หัวข้อกิจกรรม *</label>
            <input id="swal-ev-title" class="border border-pink-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="เช่น ดินเนอร์วันครบรอบ" value="${event?.title || ''}">
          </div>
          <div>
            <label class="block text-xs font-bold text-pink-500 mb-1">รายละเอียด (ไม่บังคับ)</label>
            <textarea id="swal-ev-desc" class="border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full min-h-[60px] resize-none" placeholder="รายละเอียดเพิ่มเติม...">${event?.description || ''}</textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-pink-500 mb-1">วันและเวลา *</label>
              <input type="datetime-local" id="swal-ev-date" class="border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full text-gray-700 bg-white" value="${defaultDateTime}">
            </div>
            <div>
              <label class="block text-xs font-bold text-pink-500 mb-1">สถานที่</label>
              <input id="swal-ev-location" class="border border-pink-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="ระบุสถานที่" value="${event?.location || ''}">
            </div>
          </div>
          <div class="bg-blue-50/50 p-3 rounded-xl border border-blue-100 mt-1">
            <label class="block text-xs font-bold text-blue-600 mb-1 flex items-center gap-1">${renderToString(<Users size={14} />)} ผู้เข้าร่วม (แอดแฟน)</label>
            <p class="text-[10px] text-gray-500 mb-2 leading-tight">ใส่อีเมลแฟนลงไป (หลายคนคั่นด้วยลูกน้ำ , ) เวลากดปุ่มเพิ่มลงปฏิทิน ระบบจะชวนแฟนอัตโนมัติ ทำให้กิจกรรมไปโผล่ที่ปฏิทินแฟนด้วยครับ!</p>
            <input type="email" id="swal-ev-email" class="border border-blue-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full" placeholder="อีเมลแฟน (เช่น pimmie@gmail.com)" value="${event?.target_email || ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: event ? 'บันทึกการแก้ไข' : 'สร้างกิจกรรม',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]' },
      preConfirm: () => {
        const title = document.getElementById('swal-ev-title').value.trim();
        const dateStr = document.getElementById('swal-ev-date').value;
        if (!title || !dateStr) {
          Swal.showValidationMessage('กรุณากรอกหัวข้อและวันเวลาให้ครบถ้วน');
          return false;
        }
        
        // Parse local datetime back to UTC for Supabase
        const localDate = new Date(dateStr);
        
        return {
          title,
          description: document.getElementById('swal-ev-desc').value.trim() || null,
          location: document.getElementById('swal-ev-location').value.trim() || null,
          target_email: document.getElementById('swal-ev-email').value.trim() || null,
          event_date: localDate.toISOString()
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = result.value;
        if (event) {
          const { error } = await supabase.from('events').update(payload).eq('id', event.id);
          if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
          else { Swal.fire('สำเร็จ', 'อัปเดตกิจกรรมเรียบร้อย!', 'success'); fetchEvents(); }
        } else {
          const { error } = await supabase.from('events').insert([payload]);
          if (error) Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
          else { 
            Swal.fire({
              title: 'สร้างกิจกรรมสำเร็จ!',
              text: 'อย่าลืมกดเข้ากิจกรรมเพื่อไปเพิ่มลง Google Calendar ของคุณนะครับ',
              icon: 'success',
              confirmButtonColor: '#ec4899'
            }); 
            fetchEvents(); 
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-pink-50/30 pt-24 pb-12 font-prompt">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 mt-4">
          <div className="flex items-center gap-4 text-pink-600 bg-white px-6 py-3 rounded-full shadow-sm border border-pink-100 animate-in fade-in slide-in-from-top-4 duration-500">
            <CalendarIcon size={28} className="text-pink-500" />
            <h1 className="text-2xl font-bold">ปฏิทินกิจกรรม</h1>
          </div>

          <div className="flex items-center gap-4 bg-white p-2 rounded-full shadow-sm border border-pink-100 animate-in fade-in slide-in-from-top-4 duration-700">
            <button onClick={prevMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500">
              <ChevronLeft size={24} />
            </button>
            <div className="w-48 text-center font-bold text-gray-700 text-lg">
              {format(currentDate, 'MMMM yyyy', { locale: th })}
            </div>
            <button onClick={nextMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <button 
            onClick={() => showEventForm()}
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 hover:from-pink-600 hover:to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center animate-in fade-in slide-in-from-top-4 duration-1000"
          >
            <Plus size={20} /> สร้างกิจกรรม
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50 p-4 md:p-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
            {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName, idx) => (
              <div key={idx} className="text-center text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide">
                {dayName}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              
              // Find events for this day
              const dayEvents = events.filter(e => isSameDay(parseISO(e.event_date), day));
              
              return (
                <div 
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`
                    min-h-[70px] md:min-h-[110px] p-1 md:p-2 rounded-xl md:rounded-2xl border transition-all cursor-pointer flex flex-col relative group
                    ${!isCurrentMonth ? 'bg-gray-50/50 border-transparent text-gray-400' : 'bg-white border-pink-50 hover:border-pink-200 hover:shadow-md hover:-translate-y-0.5 text-gray-700'}
                    ${isToday ? '!border-pink-400 bg-pink-50/30' : ''}
                  `}
                >
                  <div className={`
                    text-xs md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full mx-auto md:mx-0
                    ${isToday ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-sm' : ''}
                  `}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Event indicators */}
                  <div className="mt-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                    {dayEvents.map(evt => (
                      <div 
                        key={evt.id} 
                        className="bg-pink-100 text-pink-700 text-[9px] md:text-xs px-1 md:px-1.5 py-0.5 rounded-md truncate font-medium border border-pink-200/50 flex items-center gap-1"
                        title={evt.title}
                      >
                        <span className="hidden md:block w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-pink-400 shrink-0"></span>
                        <span className="truncate">{evt.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 0 && (
                      <div className="md:hidden flex justify-center mt-auto pb-1">
                         <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover indicator (desktop only) */}
                  <div className="hidden md:block absolute inset-0 bg-pink-50/0 group-hover:bg-pink-50/30 rounded-2xl pointer-events-none transition-colors"></div>
                </div>
              );
            })}
          </div>
          
        </div>
      </div>
    </div>
  );
}
