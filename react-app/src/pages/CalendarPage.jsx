import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { Bell, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Edit, MapPin, Plus, Save, Trash2, Users, X } from 'lucide-react';
import { renderToString } from 'react-dom/server';
import {
  addDays,
  addHours,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { th } from 'date-fns/locale';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [eventColors, setEventColors] = useState([]);
  const [userPairs, setUserPairs] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async (isMounted = true) => {
    setLoading(true);
    const [eventsRes, pairsRes, profilesRes, colorsRes] = await Promise.all([
      supabase.from('events').select('*').order('event_date', { ascending: true }),
      supabase.from('user_pairs').select('*'),
      supabase.from('user_profiles').select('*'),
      supabase.from('event_colors').select('*')
    ]);

    if (!isMounted) return;

    if (!eventsRes.error) setEvents(eventsRes.data || []);
    if (!pairsRes.error) setUserPairs(pairsRes.data || []);
    if (!profilesRes.error) setUserProfiles(profilesRes.data || []);
    if (!colorsRes.error) setEventColors(colorsRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (isMounted) setSession(session);
      await fetchEvents(isMounted);
    };
    void init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) setSession(session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

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

  const upcomingEvents = events
    .filter((event) => isAfter(parseISO(event.event_date), new Date()))
    .sort((a, b) => parseISO(a.event_date) - parseISO(b.event_date));
  const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

  const pastEvents = events
    .filter((event) => isBefore(parseISO(event.event_date), new Date()))
    .sort((a, b) => parseISO(b.event_date) - parseISO(a.event_date));
  const pastEvent = pastEvents.length > 0 ? pastEvents[0] : null;

  const getGoogleCalendarLink = (event) => {
    const startDate = new Date(event.event_date);
    const endDate = addHours(startDate, 1);

    const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const url = new URL('https://calendar.google.com/calendar/render');
    url.searchParams.append('action', 'TEMPLATE');
    url.searchParams.append('text', event.title);
    if (event.description) url.searchParams.append('details', event.description);
    if (event.location) url.searchParams.append('location', event.location);
    url.searchParams.append('dates', `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`);
    if (event.target_email) url.searchParams.append('add', event.target_email);

    return url.toString();
  };

  const getEventUIConfig = (event) => {
    let colorCode = '#ec4899';
    let bgColor = '#fdf2f8';
    let isPending = false;
    let isApproved = false;
    let avatars = [];

    const creatorProfile = userProfiles.find(u => u.email === event.created_by_email);
    if (creatorProfile?.avatar_url) avatars.push(creatorProfile.avatar_url);

    if (event.partner_email) {
      const u1 = event.created_by_email < event.partner_email ? event.created_by_email : event.partner_email;
      const u2 = event.created_by_email < event.partner_email ? event.partner_email : event.created_by_email;
      const pair = userPairs.find(p => p.user1_email === u1 && p.user2_email === u2);
      
      const partnerProfile = userProfiles.find(u => u.email === event.partner_email);
      if (partnerProfile?.avatar_url) avatars.push(partnerProfile.avatar_url);

      if (pair) {
        if (pair.status === 'approved') {
          isApproved = true;
          colorCode = pair.shared_color_code || '#8b5cf6';
          bgColor = colorCode + '20';
        } else {
          isPending = true;
          colorCode = '#9ca3af';
          bgColor = '#f3f4f6';
        }
      } else {
        isPending = true;
        colorCode = '#9ca3af';
        bgColor = '#f3f4f6';
      }
    } else {
      const eventColorItem = eventColors.find(c => c.email === event.created_by_email);
      if (eventColorItem) {
        colorCode = eventColorItem.color_code;
        bgColor = colorCode + '15';
      }
    }

    return { colorCode, bgColor, isPending, isApproved, avatars };
  };

  const handleDayClick = (selectedDay) => {
    const dayEvents = events
      .filter((event) => isSameDay(parseISO(event.event_date), selectedDay))
      .sort((a, b) => {
        const timeA = new Date(a.event_date).getTime();
        const timeB = new Date(b.event_date).getTime();
        if (timeA === timeB) {
          return new Date(a.created_at || a.event_date).getTime() - new Date(b.created_at || b.event_date).getTime();
        }
        return timeA - timeB;
      });

    let htmlContent = '<div class="text-left flex flex-col gap-3 max-h-[60vh] overflow-y-auto custom-scrollbar p-1">';

    if (dayEvents.length === 0) {
      htmlContent += '<div class="text-center text-gray-400 py-6 text-sm">ไม่มีกิจกรรมในวันนี้</div>';
    } else {
      dayEvents.forEach((event) => {
        const { colorCode, bgColor, isPending, isApproved, avatars } = getEventUIConfig(event);
        const timeStr = format(new Date(event.event_date), 'HH:mm');
        
        const startDate = new Date(event.event_date);
        const endDate = addHours(startDate, 1);
        const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
        const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}${event.description ? `&details=${encodeURIComponent(event.description)}` : ''}${event.location ? `&location=${encodeURIComponent(event.location)}` : ''}`;

        const iconClock = renderToString(<Clock size={14} style={{ color: colorCode }} className="inline-block" />);
        const iconMapPin = renderToString(<MapPin size={14} style={{ color: colorCode }} className="inline-block" />);
        const iconUsers = renderToString(<Users size={14} style={{ color: colorCode }} className="inline-block" />);
        const iconCalendar = renderToString(<CalendarIcon size={14} className="inline-block" />);
        const iconEdit = renderToString(<Edit size={22} />);
        const iconTrash = renderToString(<Trash2 size={22} />);

        const avatarsHtml = avatars.length > 0 
          ? `<div class="flex -space-x-2 mr-2">${avatars.map(url => `<img src="${url}" class="w-6 h-6 rounded-full border-2 border-white shadow-sm" onerror="this.style.display='none'"/>`).join('')}</div>`
          : '';

        const pendingBadge = isPending 
          ? `<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full ml-2">รออนุมัติ</span>`
          : '';

        htmlContent += `
          <div class="border rounded-xl p-4 transition-colors shadow-sm relative group mb-3" style="background-color: ${bgColor}; border-color: ${colorCode}40;">
            <div class="flex items-center mb-1">
              ${avatarsHtml}
              <h3 class="font-bold text-lg flex items-center" style="color: ${colorCode}">
                ${event.title} ${pendingBadge}
              </h3>
            </div>
            ${event.description ? `<p class="text-sm text-gray-600 mb-2">${event.description}</p>` : ''}
            <div class="flex flex-col gap-1 mt-2 text-xs text-gray-500 font-medium">
              <div class="flex items-center gap-1.5">${iconClock} เวลา ${timeStr} น.</div>
              ${event.location ? `<div class="flex items-center gap-1.5 truncate">${iconMapPin} ${event.location}</div>` : ''}
              ${event.partner_email ? `<div class="flex items-center gap-1.5 truncate">${iconUsers} จองร่วมกับ: ${event.partner_email}</div>` : ''}
              ${event.target_email ? `<div class="flex items-center gap-1.5 truncate">${iconUsers} แจ้งเตือน: ${event.target_email}</div>` : ''}
              ${event.created_by_email ? `<div class="flex items-center gap-1.5 truncate">${iconUsers} สร้างโดย: ${event.created_by_email}</div>` : ''}
            </div>
            <div class="mt-4 flex flex-col sm:flex-row gap-2">
              <a href="${googleLink}" target="_blank" rel="noopener noreferrer" class="flex-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm border border-blue-100">
                ${iconCalendar} เพิ่มลง Google Calendar
              </a>
              <div class="flex gap-1 shrink-0">
                <button type="button" data-action="edit" data-event-id="${event.id}" class="text-gray-400 hover:text-gray-800 hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none" title="แก้ไข">${iconEdit}</button>
                <button type="button" data-action="delete" data-event-id="${event.id}" class="text-gray-400 hover:text-red-600 hover:bg-red-50 w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none" title="ลบ">${iconTrash}</button>
              </div>
            </div>
          </div>
        `;
      });
    }

    htmlContent += '</div>';

    Swal.fire({
      title: `กิจกรรมวันที่ ${format(selectedDay, 'd MMMM yyyy', { locale: th })}`,
      html: htmlContent,
      showCloseButton: true,
      closeButtonHtml: renderToString(<X size={24} />),
      showConfirmButton: true,
      confirmButtonText: '+ เพิ่มกิจกรรมใหม่',
      confirmButtonColor: '#ec4899',
      customClass: { 
        popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]',
        closeButton: 'text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center transition-colors focus:outline-none mt-2 mr-2'
      },
      didOpen: () => {
        const popup = Swal.getPopup();

        // Use event delegation for maximum reliability
        popup.addEventListener('click', (e) => {
          // Handle Edit Button Click
          const editBtn = e.target.closest('[data-action="edit"]');
          if (editBtn) {
            const eventId = editBtn.getAttribute('data-event-id');
            const eventItem = events.find((item) => String(item.id) === String(eventId));
            if (eventItem) {
              showEventForm(eventItem);
            }
          }

          // Handle Delete Button Click
          const delBtn = e.target.closest('[data-action="delete"]');
          if (delBtn) {
            const eventId = delBtn.getAttribute('data-event-id');
            Swal.close();
            setTimeout(async () => {
              const confirmed = await Swal.fire({
                title: 'ลบกิจกรรมนี้?',
                text: 'คุณไม่สามารถกู้คืนได้',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
              }).then((result) => result.isConfirmed);

              if (confirmed) {
                const { error } = await supabase.from('events').delete().eq('id', eventId);
                if (!error) {
                  Swal.fire('สำเร็จ!', 'ลบกิจกรรมแล้ว', 'success');
                  fetchEvents();
                } else {
                  Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
                }
              }
            }, 150);
          }
        });
      },
    }).then((result) => {
      if (result.isConfirmed) {
        showEventForm(null, selectedDay);
      }
    });
  };

  const showEventPreview = (event) => {
    const { colorCode, bgColor, isPending, avatars } = getEventUIConfig(event);

    const iconClock = renderToString(<Clock size={16} className="text-gray-400" />);
    const iconMapPin = renderToString(<MapPin size={16} className="text-gray-400" />);
    const iconUsers = renderToString(<Users size={16} className="text-gray-400" />);
    const iconCalendar = renderToString(<CalendarIcon size={16} />);
    const iconEdit = renderToString(<Edit size={22} />);
    const iconTrash = renderToString(<Trash2 size={22} />);
    const iconClose = renderToString(<X size={24} />);

    const localDate = new Date(event.event_date);
    const timeStr = format(localDate, 'HH:mm');

    const startDate = new Date(event.event_date);
    const endDate = addHours(startDate, 1);
    const formatGoogleDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const googleLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}${event.description ? `&details=${encodeURIComponent(event.description)}` : ''}${event.location ? `&location=${encodeURIComponent(event.location)}` : ''}`;

    const avatarsHtml = avatars.length > 0 
      ? `<div class="flex justify-center -space-x-2 mb-3 pr-8">${avatars.map(url => `<img src="${url}" class="w-10 h-10 rounded-full border-2 border-white shadow-sm" onerror="this.style.display='none'"/>`).join('')}</div>`
      : '';

    const pendingBadge = isPending 
      ? `<span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full ml-2 align-middle">รออนุมัติ</span>`
      : '';

    const htmlContent = `
      <div class="text-left bg-white relative p-5 md:p-8">
        <!-- Close Button -->
        <button type="button" data-action="preview-close" class="absolute top-3 right-3 md:top-5 md:right-5 w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none">
          ${iconClose}
        </button>

        <!-- Title -->
        <div class="flex flex-col mb-5 md:mb-6">
          ${avatarsHtml}
          <div class="flex items-center gap-2 md:gap-3 pr-8 w-full">
             ${avatars.length === 0 ? `<div class="w-3 h-3 md:w-3.5 md:h-3.5 rounded-full shrink-0" style="background-color: ${colorCode}"></div>` : ''}
             <h3 class="font-bold text-xl md:text-2xl leading-tight flex flex-wrap items-center" style="color: ${colorCode}">${event.title} ${pendingBadge}</h3>
          </div>
        </div>
        
        <!-- Clean Details List -->
        <div class="flex flex-col gap-3 md:gap-4 text-xs md:text-sm mb-6 md:mb-8">
          <div class="flex items-start gap-2.5 md:gap-3">
            <div class="mt-0.5">${iconClock}</div>
            <div class="flex flex-col">
              <span class="text-gray-900 font-medium">${format(localDate, 'd MMMM yyyy', { locale: th })}</span>
              <span class="text-gray-500">${timeStr} น.</span>
            </div>
          </div>

          ${event.location ? `
          <div class="flex items-start gap-2.5 md:gap-3">
            <div class="mt-0.5">${iconMapPin}</div>
            <span class="text-gray-900 font-medium">${event.location}</span>
          </div>` : ''}

          ${(event.target_email || event.created_by_email || event.partner_email) ? `
          <div class="flex items-start gap-2.5 md:gap-3">
            <div class="mt-0.5">${iconUsers}</div>
            <div class="flex flex-col gap-1 md:gap-1.5">
              ${event.partner_email ? `<div><span class="text-gray-400 mr-2">จองร่วมกับ:</span><span class="text-gray-900 font-medium">${event.partner_email}</span></div>` : ''}
              ${event.target_email ? `<div><span class="text-gray-400 mr-2">แจ้งเตือน:</span><span class="text-gray-900 font-medium">${event.target_email}</span></div>` : ''}
              ${event.created_by_email ? `<div><span class="text-gray-400 mr-2">ผู้สร้าง:</span><span class="text-gray-900 font-medium">${event.created_by_email}</span></div>` : ''}
            </div>
          </div>` : ''}
        </div>

        <!-- Description -->
        ${event.description ? `
        <div class="mb-6 md:mb-8 border-t border-gray-100 pt-5 md:pt-6">
          <div class="text-gray-700 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">${event.description}</div>
        </div>` : ''}
        
        <!-- Actions -->
        <div class="flex items-center justify-between gap-3 border-t border-gray-100 pt-5 md:pt-6">
          <a href="${googleLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-semibold py-2 px-3 md:py-2.5 md:px-4 rounded-xl flex items-center gap-1.5 md:gap-2 transition-colors bg-blue-50 hover:bg-blue-100">
            ${iconCalendar} เพิ่มลง Google Calendar
          </a>
          <div class="flex gap-1 shrink-0">
            <button type="button" data-action="preview-edit" class="text-gray-400 hover:text-gray-800 hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none" title="แก้ไข">${iconEdit}</button>
            <button type="button" data-action="preview-delete" class="text-gray-400 hover:text-red-600 hover:bg-red-50 w-10 h-10 flex items-center justify-center rounded-xl transition-colors focus:outline-none" title="ลบ">${iconTrash}</button>
          </div>
        </div>
      </div>
    `;

    Swal.fire({
      html: htmlContent,
      showConfirmButton: false,
      showCloseButton: false,
      padding: 0,
      customClass: { popup: 'rounded-3xl border-0 shadow-2xl !w-[95%] md:!w-[480px] overflow-hidden' },
      didOpen: () => {
        const popup = Swal.getPopup();
        popup.addEventListener('click', (e) => {
          if (e.target.closest('[data-action="preview-close"]')) {
            Swal.close();
          }
          if (e.target.closest('[data-action="preview-edit"]')) {
            showEventForm(event);
          }
          if (e.target.closest('[data-action="preview-delete"]')) {
            Swal.fire({
              title: 'ยืนยันการลบ?',
              text: 'คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?',
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'ใช่, ลบเลย',
              cancelButtonText: 'ยกเลิก'
            }).then(async (result) => {
              if (result.isConfirmed) {
                const { error } = await supabase.from('events').delete().eq('id', event.id);
                if (!error) {
                  Swal.fire('สำเร็จ!', 'ลบกิจกรรมแล้ว', 'success');
                  fetchEvents();
                } else {
                  Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
                }
              }
            });
          }
        });
      }
    });
  };

  const showEventForm = (event = null, defaultDate = new Date()) => {
    let defaultDateTime = format(defaultDate, "yyyy-MM-dd'T'HH:mm");
    if (event) {
      const localDate = new Date(event.event_date);
      const tzOffset = localDate.getTimezoneOffset() * 60000;
      defaultDateTime = new Date(localDate - tzOffset).toISOString().slice(0, 16);
    }

    const partnerOptions = userProfiles
      .filter(u => u.email !== session?.user?.email)
      .map(u => `<option value="${u.email}" ${event?.partner_email === u.email ? 'selected' : ''}>${u.full_name || u.email}</option>`)
      .join('');

    Swal.fire({
      title: event ? 'แก้ไขกิจกรรม' : 'สร้างกิจกรรมใหม่',
      html: `
        <div class="flex flex-col gap-2.5 md:gap-3 text-left mt-1 md:mt-2 px-1">
          <div>
            <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">หัวข้อกิจกรรม <span class="text-pink-500">*</span></label>
            <input type="text" id="swal-ev-title" class="w-full border border-gray-300 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all text-gray-800" placeholder="เช่น ประชุมทีม, ไปเที่ยว" value="${event ? event.title : ''}">
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 md:gap-3">
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">วันที่ <span class="text-pink-500">*</span></label>
              <input type="date" id="swal-ev-date" class="w-full border border-gray-300 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-pink-500 outline-none transition-all text-gray-800" value="${defaultDateTime.split('T')[0]}">
            </div>
            <div>
              <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">เวลา <span class="text-pink-500">*</span></label>
              <input type="time" id="swal-ev-time" class="w-full border border-gray-300 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-pink-500 outline-none transition-all text-gray-800" value="${defaultDateTime.split('T')[1]}">
            </div>
          </div>
          
          <div>
            <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">สถานที่ (ถ้ามี)</label>
            <input type="text" id="swal-ev-location" class="w-full border border-gray-300 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-pink-500 outline-none transition-all text-gray-800" placeholder="ระบุสถานที่..." value="${event && event.location ? event.location : ''}">
          </div>
          
          <div>
            <label class="block text-xs md:text-sm font-semibold text-gray-700 mb-1">รายละเอียดเพิ่มเติม (ถ้ามี)</label>
            <textarea id="swal-ev-desc" rows="2" class="w-full border border-gray-300 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-pink-500 outline-none transition-all resize-none custom-scrollbar text-gray-800 min-h-[60px] md:min-h-[80px]" placeholder="รายละเอียดต่างๆ...">${event && event.description ? event.description : ''}</textarea>
          </div>
          
          <div class="bg-purple-50/50 p-2.5 md:p-3 rounded-lg border border-purple-100 mb-1">
            <label class="block text-xs md:text-sm font-semibold text-purple-800 mb-1">ชวนผู้ร่วมกิจกรรม (Co-booking)</label>
            <select id="swal-ev-partner" class="w-full border border-purple-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-purple-500 outline-none transition-all bg-white text-gray-800">
              <option value="">-- ไม่ระบุ (กิจกรรมเดี่ยว) --</option>
              ${partnerOptions}
            </select>
          </div>

          <div class="bg-blue-50/50 p-2.5 md:p-3 rounded-lg border border-blue-100">
            <label class="block text-xs md:text-sm font-semibold text-blue-800 mb-1">แชร์ให้ผู้อื่น (ส่งอีเมลแจ้งเตือน)</label>
            <input type="email" id="swal-ev-email" class="w-full border border-blue-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5 text-sm md:text-base focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white text-gray-800" placeholder="example@email.com" value="${event && event.target_email ? event.target_email : ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCloseButton: true,
      closeButtonHtml: renderToString(<X size={24} />),
      showCancelButton: true,
      showDenyButton: !!event,
      confirmButtonText: `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${renderToString(event ? <Save size={22} /> : <Plus size={22} />)}</div>`,
      denyButtonText: `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${renderToString(<Trash2 size={22} />)}</div>`,
      cancelButtonText: `<div style="display:flex; align-items:center; justify-content:center; width:100%; height:100%;">${renderToString(<X size={22} />)}</div>`,
      buttonsStyling: false,
      customClass: { 
        popup: 'rounded-3xl shadow-xl w-[95%] md:w-[500px] border border-gray-100 pb-2',
        title: 'text-lg md:text-xl font-bold text-gray-800 pt-4 md:pt-5',
        htmlContainer: '!m-0 p-3 md:p-4',
        closeButton: 'text-gray-400 hover:text-gray-800 hover:bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full transition-colors focus:outline-none mt-2 mr-2',
        actions: 'flex gap-2 md:gap-3 justify-end w-full px-4 md:px-5 pb-4 md:pb-5 pt-0 m-0',
        confirmButton: 'text-pink-600 hover:bg-pink-50 rounded-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors focus:outline-none !p-0',
        denyButton: 'text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors focus:outline-none mr-auto !p-0',
        cancelButton: 'text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center transition-colors focus:outline-none !p-0',
      },
      preConfirm: () => {
        const title = document.getElementById('swal-ev-title').value.trim();
        const dateStr = document.getElementById('swal-ev-date').value;
        const timeStr = document.getElementById('swal-ev-time').value;
        
        if (!title || !dateStr || !timeStr) {
          Swal.showValidationMessage('กรุณากรอกหัวข้อและวันเวลาให้ครบถ้วน');
          return false;
        }

        const localDate = new Date(`${dateStr}T${timeStr}`);
        // Overlap validation removed as per user request: allow overlapping events

        const payload = {
          title,
          description: document.getElementById('swal-ev-desc').value.trim() || null,
          location: document.getElementById('swal-ev-location').value.trim() || null,
          target_email: document.getElementById('swal-ev-email').value.trim() || null,
          event_date: localDate.toISOString(),
          partner_email: document.getElementById('swal-ev-partner')?.value || null
        };

        if (!event && session?.user?.email) {
          payload.created_by_email = session.user.email;
        }

        let isNewPendingPair = false;
        let isPendingPair = false;
        if (payload.partner_email && session?.user?.email) {
           const u1 = session.user.email < payload.partner_email ? session.user.email : payload.partner_email;
           const u2 = session.user.email < payload.partner_email ? payload.partner_email : session.user.email;
           const existingPair = userPairs.find(p => p.user1_email === u1 && p.user2_email === u2);
           if (!existingPair) {
               isNewPendingPair = true;
           } else if (existingPair.status === 'pending') {
               isPendingPair = true;
           }
        }

        return { payload, isNewPendingPair, isPendingPair };
      },
    }).then(async (result) => {
      if (result.isDenied && event) {
        const confirmed = await Swal.fire({
          title: 'ยืนยันการลบ?',
          text: 'คุณต้องการลบกิจกรรมนี้ใช่หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'ใช่, ลบเลย',
          cancelButtonText: 'ยกเลิก'
        }).then((res) => res.isConfirmed);

        if (confirmed) {
          const { error } = await supabase.from('events').delete().eq('id', event.id);
          if (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
          } else {
            Swal.fire('สำเร็จ!', 'ลบกิจกรรมแล้ว', 'success');
            fetchEvents();
          }
        }
      } else if (result.isConfirmed) {
        const { payload, isNewPendingPair, isPendingPair } = result.value;

        if (isNewPendingPair && session?.user?.email) {
           const u1 = session.user.email < payload.partner_email ? session.user.email : payload.partner_email;
           const u2 = session.user.email < payload.partner_email ? payload.partner_email : session.user.email;
           await supabase.from('user_pairs').insert([{ user1_email: u1, user2_email: u2, status: 'pending' }]);
        }

        if (event) {
          const { error } = await supabase.from('events').update(payload).eq('id', event.id);
          if (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
          } else {
            Swal.fire('สำเร็จ', 'อัปเดตกิจกรรมเรียบร้อย!', 'success');
            fetchEvents();
          }
        } else {
          const { error } = await supabase.from('events').insert([payload]);
          if (error) {
            Swal.fire('เกิดข้อผิดพลาด', error.message, 'error');
          } else {
            if (isNewPendingPair || isPendingPair) {
                Swal.fire('รอแอดมินอนุมัติ', 'ส่งคำขอจับคู่ให้แอดมินอนุมัติและจัดสีแล้ว กิจกรรมของคุณจะแสดงเป็นสถานะ "รออนุมัติ" จนกว่าจะได้รับการยืนยัน', 'info');
            } else {
                Swal.fire({
                  title: 'สร้างกิจกรรมสำเร็จ!',
                  text: 'อย่าลืมกดเข้ากิจกรรมเพื่อไปเพิ่มลง Google Calendar',
                  icon: 'success',
                  confirmButtonColor: '#ec4899',
                });
            }
            fetchEvents();
          }
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-pink-50/30 pt-24 pb-12 font-prompt">
      <div className="container mx-auto px-4 md:px-8 lg:max-w-[95%] xl:max-w-[90%]">
        
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 mt-4">
          
          <div className="order-1 lg:order-2 lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-400 rounded-[2rem] p-6 text-white shadow-[0_8px_30px_rgb(16,185,129,0.3)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="absolute -top-4 -right-4 p-4 opacity-10"><CalendarIcon size={120} /></div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                <Bell size={24} className="animate-bounce" /> Next Event
              </h2>

              {nextEvent ? (
                (() => {
                  const { colorCode: tagColor, isPending, avatars } = getEventUIConfig(nextEvent);
                  
                  return (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 relative z-10 shadow-inner">
                      <div className="text-xs md:text-sm font-bold mb-2 inline-block px-3 py-1.5 rounded-lg text-white shadow-sm bg-white/20 backdrop-blur-sm border border-white/30">
                        อีก {formatDistanceToNow(parseISO(nextEvent.event_date), { locale: th })}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mt-1 mb-3 leading-tight flex flex-wrap items-center gap-1" title={nextEvent.title}>
                        {avatars.length > 0 && (
                          <div className="flex -space-x-2 mr-1">
                            {avatars.map((url, i) => (
                              <img key={i} src={url} className="w-6 h-6 rounded-full border-2 border-white/80 shadow-sm" alt="avatar" />
                            ))}
                          </div>
                        )}
                        {nextEvent.title}
                        {isPending && <span className="px-1.5 py-0.5 bg-yellow-100/90 text-yellow-800 text-[10px] font-bold rounded-full backdrop-blur-sm">รออนุมัติ</span>}
                      </h3>
                      <div className="flex flex-col gap-2 text-sm text-pink-50">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock size={16} /> {format(parseISO(nextEvent.event_date), 'd MMM yyyy, HH:mm', { locale: th })} น.
                        </div>
                        {nextEvent.location && (
                          <div className="flex items-center gap-2 font-medium truncate">
                            <MapPin size={16} className="shrink-0" /> <span className="truncate">{nextEvent.location}</span>
                          </div>
                        )}
                        {nextEvent.created_by_email && (
                          <div className="flex items-center gap-2 font-medium truncate opacity-90 mt-1">
                            <Users size={14} className="shrink-0" /> 
                            <span className="truncate text-xs">สร้างโดย: {nextEvent.created_by_email}</span>
                            {tagColor !== '#ffffff' && (
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm ml-1 shrink-0" style={{ backgroundColor: tagColor }}></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 flex flex-col items-center justify-center gap-3 min-h-[180px] relative z-10">
                  <CalendarIcon size={40} className="text-emerald-200 opacity-60" />
                  <p className="text-sm font-bold text-emerald-100">ยังไม่มีการนัดหมาย</p>
                </div>
              )}
            </div>

            {/* Past Event */}
            <div className="bg-gradient-to-br from-red-500 to-rose-400 rounded-[2rem] p-6 text-white shadow-[0_8px_30px_rgb(239,68,68,0.3)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <div className="absolute -top-4 -right-4 p-4 opacity-10"><Clock size={120} /></div>

              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 relative z-10">
                <Clock size={24} /> Past Event
              </h2>

              {pastEvent ? (
                (() => {
                  const { colorCode: tagColor, isPending, avatars } = getEventUIConfig(pastEvent);
                  
                  return (
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 relative z-10 shadow-inner">
                      <div className="text-xs md:text-sm font-bold mb-2 inline-block px-3 py-1.5 rounded-lg text-white shadow-sm bg-white/20 backdrop-blur-sm border border-white/30">
                        {formatDistanceToNow(parseISO(pastEvent.event_date), { locale: th, addSuffix: true })}
                      </div>
                      <h3 className="text-lg md:text-xl font-bold mt-1 mb-3 leading-tight flex flex-wrap items-center gap-1" title={pastEvent.title}>
                        {avatars.length > 0 && (
                          <div className="flex -space-x-2 mr-1">
                            {avatars.map((url, i) => (
                              <img key={i} src={url} className="w-6 h-6 rounded-full border-2 border-white/80 shadow-sm" alt="avatar" />
                            ))}
                          </div>
                        )}
                        {pastEvent.title}
                        {isPending && <span className="px-1.5 py-0.5 bg-yellow-100/90 text-yellow-800 text-[10px] font-bold rounded-full backdrop-blur-sm">รออนุมัติ</span>}
                      </h3>
                      <div className="flex flex-col gap-2 text-sm text-gray-50">
                        <div className="flex items-center gap-2 font-medium">
                          <Clock size={16} /> {format(parseISO(pastEvent.event_date), 'd MMM yyyy, HH:mm', { locale: th })} น.
                        </div>
                        {pastEvent.location && (
                          <div className="flex items-center gap-2 font-medium truncate">
                            <MapPin size={16} className="shrink-0" /> <span className="truncate">{pastEvent.location}</span>
                          </div>
                        )}
                        {pastEvent.created_by_email && (
                          <div className="flex items-center gap-2 font-medium truncate opacity-90 mt-1">
                            <Users size={14} className="shrink-0" /> 
                            <span className="truncate text-xs">สร้างโดย: {pastEvent.created_by_email}</span>
                            {tagColor !== '#ffffff' && (
                              <div className="w-2.5 h-2.5 rounded-full shadow-sm ml-1 shrink-0" style={{ backgroundColor: tagColor }}></div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center border border-white/20 flex flex-col items-center justify-center gap-3 min-h-[180px] relative z-10">
                  <Clock size={40} className="text-red-200 opacity-60" />
                  <p className="text-sm font-bold text-red-100">ไม่มีกิจกรรมที่ผ่านมา</p>
                </div>
              )}
            </div>
            
          </div>

          {/* Calendar Section (Header + Grid) */}
          <div className="order-2 lg:order-1 lg:col-span-3 flex flex-col gap-6">
            
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row items-center justify-between gap-4 w-full">
              
              {/* Title & Mobile Create Button Container */}
              <div className="flex w-full xl:w-auto items-center justify-between gap-4">
                <div className="flex items-center gap-2 md:gap-3 text-pink-600 bg-white px-4 md:px-6 py-2.5 md:py-3 rounded-full shadow-sm border border-pink-100 animate-in fade-in slide-in-from-top-4 duration-500 shrink-0">
                  <CalendarIcon className="w-5 h-5 md:w-7 md:h-7 text-pink-500" />
                  <h1 className="text-lg md:text-2xl font-bold">ปฏิทินกิจกรรม</h1>
                </div>
                
                {/* Mobile Create Button - Only shows on < xl */}
                <button 
                  onClick={() => showEventForm()}
                  className="xl:hidden flex items-center justify-center w-11 h-11 bg-gradient-to-r from-pink-500 to-red-400 active:scale-95 text-white rounded-full font-bold shadow-lg shadow-pink-200/50 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500"
                >
                  <Plus size={24} />
                </button>
              </div>

              {/* Month Switcher */}
              <div className="flex items-center justify-between bg-white p-1 md:p-2 rounded-full shadow-sm border border-pink-100 w-full xl:w-auto animate-in fade-in slide-in-from-top-4 duration-700">
                <button onClick={prevMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500 active:bg-pink-100">
                  <ChevronLeft size={24} />
                </button>
                <div className="flex-1 xl:w-48 text-center font-bold text-gray-700 text-base md:text-lg">
                  {format(currentDate, 'MMMM yyyy', { locale: th })}
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500 active:bg-pink-100">
                  <ChevronRight size={24} />
                </button>
              </div>
              
              {/* Desktop Create Button - Only shows on >= xl */}
              <button 
                onClick={() => showEventForm()}
                className="hidden xl:flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 hover:from-pink-600 hover:to-red-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-200/50 hover:shadow-pink-300/50 hover:-translate-y-0.5 transition-all animate-in fade-in slide-in-from-top-4 duration-1000 shrink-0"
              >
                <Plus size={20} /> สร้างกิจกรรม
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50 p-4 md:p-8 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
                {['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'].map((dayName, index) => (
                  <div key={index} className="text-center text-xs md:text-sm font-bold text-gray-400 uppercase tracking-wide">
                    {dayName}
                  </div>
                ))}
              </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-sm font-medium text-pink-500">
                กำลังโหลดกิจกรรม...
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-1 md:gap-3">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const dayEvents = events.filter((event) => isSameDay(parseISO(event.event_date), day));

                  return (
                    <div
                      key={index}
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

                      <div className="mt-1 flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1">
                        {dayEvents.map((event) => {
                          const { colorCode, bgColor, isPending } = getEventUIConfig(event);
                          
                          return (
                            <div
                              key={event.id}
                              className={`hidden md:flex text-xs px-1.5 py-0.5 rounded-md truncate font-medium border items-center gap-1 shadow-sm cursor-pointer hover:brightness-95 transition-all ${isPending ? 'opacity-70 border-dashed' : ''}`}
                              style={{ backgroundColor: bgColor, color: isPending ? '#4b5563' : colorCode, borderColor: colorCode + '40' }}
                              title={event.title}
                              onClick={(e) => {
                                e.stopPropagation();
                                showEventPreview(event);
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colorCode }}></span>
                              <span className="truncate">{event.title} {isPending ? '(รอ)' : ''}</span>
                            </div>
                          );
                        })}

                        {dayEvents.length > 0 && (
                          <div className="md:hidden flex flex-wrap justify-center gap-1 mt-auto pb-1 px-1">
                            {dayEvents.slice(0, 3).map((event) => {
                              const { colorCode, isPending } = getEventUIConfig(event);
                              return (
                                <span 
                                  key={event.id} 
                                  className={`w-1.5 h-1.5 rounded-full cursor-pointer ${isPending ? 'opacity-50' : ''}`}
                                  style={{ backgroundColor: colorCode }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showEventPreview(event);
                                  }}
                                ></span>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <span className="w-1 h-1 rounded-full bg-pink-300 self-center"></span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="hidden md:block absolute inset-0 bg-pink-50/0 group-hover:bg-pink-50/30 rounded-2xl pointer-events-none transition-colors"></div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

