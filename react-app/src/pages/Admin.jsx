import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { LogOut, Plus, Edit, Trash2, ArrowLeft, BarChart2, Calendar, Settings, Heart, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const [cards, setCards] = useState([]);
  const [activeMonth, setActiveMonth] = useState(null);
  const [siteSettings, setSiteSettings] = useState(null);
  const [eventColors, setEventColors] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState('months');

  const fetchSiteSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).single();
    if (data) setSiteSettings(data);
  };

  const fetchMonths = async () => {
    const { data } = await supabase.from('months').select('*').order('month_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
    if (data) setMonths(data);
  };

  const fetchCards = async (monthId) => {
    const { data } = await supabase.from('cards').select('*').eq('month_id', monthId).order('card_date', { ascending: true, nullsFirst: false }).order('order_num', { ascending: true });
    if (data) setCards(data);
  };

  const fetchEventColors = async () => {
    const { data } = await supabase.from('event_colors').select('*');
    if (data) setEventColors(data);
  };

  const fetchUserProfiles = async () => {
    const { data } = await supabase.from('user_profiles').select('*');
    if (data) setUserProfiles(data);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) { fetchMonths(); fetchSiteSettings(); fetchEventColors(); fetchUserProfiles(); }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) { fetchMonths(); fetchSiteSettings(); fetchEventColors(); fetchUserProfiles(); }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const showSettingsForm = () => {
    Swal.fire({
      title: 'จัดการพื้นหลังหน้า Login',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div class="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden relative shadow-inner mb-2" id="swal-s-preview-container">
            ${siteSettings?.login_bg_url ? `
              <img id="swal-s-preview-img" src="${siteSettings.login_bg_url}" class="w-full h-full object-cover" style="filter: blur(${siteSettings.login_bg_blur || 0}px); transform: scale(1.1);" />
              <div id="swal-s-preview-overlay" class="absolute inset-0 bg-black" style="opacity: ${(siteSettings.login_bg_overlay_opacity ?? 50) / 100}"></div>
            ` : `
              <div class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>
            `}
          </div>

          <div class="border-2 border-dashed border-pink-300 rounded-xl p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors">
            <label class="block text-sm font-bold text-pink-600 mb-2 text-center cursor-pointer">อัปโหลดรูปภาพใหม่ 📸</label>
            <input type="file" id="swal-s-file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 file:cursor-pointer file:transition-colors cursor-pointer"/>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">ความเบลอ (Blur): <span id="swal-s-blur-val" class="text-pink-500">${siteSettings?.login_bg_blur || 0}px</span></label>
            <input type="range" id="swal-s-blur" min="0" max="20" value="${siteSettings?.login_bg_blur || 0}" class="w-full accent-pink-500">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">ความมืด/สว่าง (Overlay): <span id="swal-s-overlay-val" class="text-pink-500">${siteSettings?.login_bg_overlay_opacity ?? 50}%</span></label>
            <input type="range" id="swal-s-overlay" min="0" max="100" value="${siteSettings?.login_bg_overlay_opacity ?? 50}" class="w-full accent-pink-500">
          </div>

          <div class="mt-2 text-right">
            <button id="swal-s-remove-btn" class="text-red-500 hover:text-red-700 text-sm font-bold underline cursor-pointer">ลบรูปภาพพื้นหลังปัจจุบัน</button>
          </div>
          <input type="hidden" id="swal-s-remove-flag" value="false">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]' },
      didOpen: () => {
        const blurInput = document.getElementById('swal-s-blur');
        const overlayInput = document.getElementById('swal-s-overlay');
        const blurVal = document.getElementById('swal-s-blur-val');
        const overlayVal = document.getElementById('swal-s-overlay-val');

        blurInput.addEventListener('input', (e) => {
          blurVal.textContent = e.target.value + 'px';
          if(document.getElementById('swal-s-preview-img')) {
             document.getElementById('swal-s-preview-img').style.filter = `blur(${e.target.value}px)`;
          }
        });
        overlayInput.addEventListener('input', (e) => {
          overlayVal.textContent = e.target.value + '%';
          if(document.getElementById('swal-s-preview-overlay')) {
             document.getElementById('swal-s-preview-overlay').style.opacity = e.target.value / 100;
          }
        });

        const removeBtn = document.getElementById('swal-s-remove-btn');
        const removeFlag = document.getElementById('swal-s-remove-flag');
        const previewContainer = document.getElementById('swal-s-preview-container');
        const fileInput = document.getElementById('swal-s-file');

        removeBtn.addEventListener('click', () => {
          removeFlag.value = 'true';
          previewContainer.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>';
          fileInput.value = '';
        });
        
        fileInput.addEventListener('change', (e) => {
           removeFlag.value = 'false';
           if(e.target.files && e.target.files[0]) {
             const reader = new FileReader();
             reader.onload = (eLoad) => {
               previewContainer.innerHTML = `
                  <img id="swal-s-preview-img" src="${eLoad.target.result}" class="w-full h-full object-cover" style="filter: blur(${blurInput.value}px); transform: scale(1.1);" />
                  <div id="swal-s-preview-overlay" class="absolute inset-0 bg-black" style="opacity: ${overlayInput.value / 100}"></div>
               `;
             };
             reader.readAsDataURL(e.target.files[0]);
           }
        });
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('swal-s-file');
        const blur = parseInt(document.getElementById('swal-s-blur').value);
        const overlay = parseInt(document.getElementById('swal-s-overlay').value);
        const removeFlag = document.getElementById('swal-s-remove-flag').value === 'true';

        let mediaUrl = siteSettings?.login_bg_url;

        if (removeFlag) {
          mediaUrl = null;
        } else if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `login_bg_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('media').upload(fileName, file);
          if (error) {
            Swal.showValidationMessage(`Upload failed: ${error.message}`);
            return false;
          }
          const { data: pubUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          mediaUrl = pubUrl.publicUrl;
        }

        return {
          login_bg_url: mediaUrl,
          login_bg_blur: blur,
          login_bg_overlay_opacity: overlay
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const payload = { id: 1, ...result.value };
        const { error } = await supabase.from('site_settings').upsert(payload);
        if (error) Swal.fire('Error', error.message, 'error');
        else {
          Swal.fire('Success', 'บันทึกการตั้งค่าสำเร็จ', 'success');
          fetchSiteSettings();
        }
      }
    });
  };

  const showCountdownSettingsForm = () => {
    Swal.fire({
      title: 'จัดการพื้นหลังหน้า Countdown',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div class="w-full aspect-video bg-gray-100 rounded-xl overflow-hidden relative shadow-inner mb-2" id="swal-cd-preview-container">
            ${siteSettings?.countdown_bg_url ? `
              <img id="swal-cd-preview-img" src="${siteSettings.countdown_bg_url}" class="w-full h-full object-cover" style="filter: blur(${siteSettings.countdown_bg_blur || 0}px); transform: scale(1.1);" />
              <div id="swal-cd-preview-overlay" class="absolute inset-0 bg-black" style="opacity: ${(siteSettings.countdown_bg_overlay_opacity ?? 50) / 100}"></div>
            ` : `
              <div class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>
            `}
          </div>

          <div class="border-2 border-dashed border-pink-300 rounded-xl p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors">
            <label class="block text-sm font-bold text-pink-600 mb-2 text-center cursor-pointer">อัปโหลดรูปภาพใหม่ 📸</label>
            <input type="file" id="swal-cd-file" accept="image/*" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 file:cursor-pointer file:transition-colors cursor-pointer"/>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">ความเบลอ (Blur): <span id="swal-cd-blur-val" class="text-pink-500">${siteSettings?.countdown_bg_blur || 0}px</span></label>
            <input type="range" id="swal-cd-blur" min="0" max="20" value="${siteSettings?.countdown_bg_blur || 0}" class="w-full accent-pink-500">
          </div>
          <div class="mb-4 mt-2">
            <label class="block text-sm font-bold text-gray-700 mb-1">วันที่เริ่มต้นคบกัน (Anniversary Date):</label>
            <input type="date" id="swal-cd-anniversary" value="${siteSettings?.anniversary_date || '2023-01-26'}" class="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-gray-700 bg-white">
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">ความมืด/สว่าง (Overlay): <span id="swal-cd-overlay-val" class="text-pink-500">${siteSettings?.countdown_bg_overlay_opacity ?? 50}%</span></label>
            <input type="range" id="swal-cd-overlay" min="0" max="100" value="${siteSettings?.countdown_bg_overlay_opacity ?? 50}" class="w-full accent-pink-500">
          </div>

          <div class="mt-2 text-right">
            <button id="swal-cd-remove-btn" class="text-red-500 hover:text-red-700 text-sm font-bold underline cursor-pointer">ลบรูปภาพพื้นหลังปัจจุบัน</button>
          </div>
          <input type="hidden" id="swal-cd-remove-flag" value="false">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]' },
      didOpen: () => {
        const blurInput = document.getElementById('swal-cd-blur');
        const overlayInput = document.getElementById('swal-cd-overlay');
        const blurVal = document.getElementById('swal-cd-blur-val');
        const overlayVal = document.getElementById('swal-cd-overlay-val');
        
        blurInput.addEventListener('input', (e) => {
          blurVal.textContent = e.target.value + 'px';
          if(document.getElementById('swal-cd-preview-img')) {
             document.getElementById('swal-cd-preview-img').style.filter = `blur(${e.target.value}px)`;
          }
        });
        overlayInput.addEventListener('input', (e) => {
          overlayVal.textContent = e.target.value + '%';
          if(document.getElementById('swal-cd-preview-overlay')) {
             document.getElementById('swal-cd-preview-overlay').style.opacity = e.target.value / 100;
          }
        });

        const removeBtn = document.getElementById('swal-cd-remove-btn');
        const removeFlag = document.getElementById('swal-cd-remove-flag');
        const previewContainer = document.getElementById('swal-cd-preview-container');
        const fileInput = document.getElementById('swal-cd-file');

        removeBtn.addEventListener('click', () => {
          removeFlag.value = 'true';
          previewContainer.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>';
          fileInput.value = '';
        });
        
        fileInput.addEventListener('change', (e) => {
           removeFlag.value = 'false';
           if(e.target.files && e.target.files[0]) {
             const reader = new FileReader();
             reader.onload = (eLoad) => {
               previewContainer.innerHTML = `
                  <img id="swal-cd-preview-img" src="${eLoad.target.result}" class="w-full h-full object-cover" style="filter: blur(${blurInput.value}px); transform: scale(1.1);" />
                  <div id="swal-cd-preview-overlay" class="absolute inset-0 bg-black" style="opacity: ${overlayInput.value / 100}"></div>
               `;
             };
             reader.readAsDataURL(e.target.files[0]);
           }
        });
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('swal-cd-file');
        const blur = parseInt(document.getElementById('swal-cd-blur').value);
        const overlay = parseInt(document.getElementById('swal-cd-overlay').value);
        const removeFlag = document.getElementById('swal-cd-remove-flag').value === 'true';
        const anniversaryDate = document.getElementById('swal-cd-anniversary').value;

        let mediaUrl = siteSettings?.countdown_bg_url;

        if (removeFlag) {
          mediaUrl = null;
        } else if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `cd_bg_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('media').upload(fileName, file);
          if (error) {
            Swal.fire('Error', error.message, 'error');
            return false;
          }
          const { data: pubUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          mediaUrl = pubUrl.publicUrl;
        }

        return {
          countdown_bg_url: mediaUrl,
          countdown_bg_blur: blur,
          countdown_bg_overlay_opacity: overlay,
          anniversary_date: anniversaryDate
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const payload = { id: 1, ...result.value };
        const { error } = await supabase.from('site_settings').upsert(payload);
        if (error) Swal.fire('Error', error.message, 'error');
        else {
          Swal.fire('Success', 'บันทึกการตั้งค่าหน้า Countdown สำเร็จ', 'success');
          fetchSiteSettings();
        }
      }
    });
  };

  const showMonthForm = (month = null) => {
    Swal.fire({
      title: month ? 'แก้ไขเดือน' : 'เพิ่มเดือนใหม่',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <input id="swal-filename" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="ชื่อไฟล์ (เช่น ani10)">
          <input type="date" id="swal-m-date" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full text-gray-600">
          <input id="swal-title" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="ชื่อเดือน (Title)">
          <input id="swal-subtitle" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="คำบรรยายย่อย (Subtitle)">
          
          <div class="border border-pink-100 rounded-xl p-4 bg-gray-50/50 mt-2">
            <h4 class="font-bold text-pink-600 mb-3 text-sm">🎨 การปรับแต่งธีม (Theme)</h4>
            
            <div class="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">สีข้อความหลัก</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="swal-main-color" value="${month?.theme_main_text_color || '#003366'}" class="w-8 h-8 rounded cursor-pointer border-0 p-0">
                  <span class="text-xs text-gray-500 uppercase" id="main-color-hex">${month?.theme_main_text_color || '#003366'}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">สีคำบรรยาย</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="swal-sub-color" value="${month?.theme_sub_text_color || '#005b9f'}" class="w-8 h-8 rounded cursor-pointer border-0 p-0">
                  <span class="text-xs text-gray-500 uppercase" id="sub-color-hex">${month?.theme_sub_text_color || '#005b9f'}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">สีแผ่นใส (Color Overlay)</label>
                <div class="flex items-center gap-2">
                  <input type="color" id="swal-overlay-color" value="${month?.bg_overlay_color || '#ffffff'}" class="w-8 h-8 rounded cursor-pointer border-0 p-0">
                  <span class="text-xs text-gray-500 uppercase" id="overlay-color-hex">${month?.bg_overlay_color || '#ffffff'}</span>
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">ความเข้มสีแผ่นใส: <span id="opacity-val">${month?.bg_overlay_opacity !== undefined ? month.bg_overlay_opacity : 40}%</span></label>
                <input type="range" id="swal-overlay-opacity" min="0" max="100" value="${month?.bg_overlay_opacity !== undefined ? month.bg_overlay_opacity : 40}" class="w-full accent-pink-500 cursor-pointer">
              </div>
            </div>
            
            <hr class="my-3 border-pink-200 border-dashed">
            
            <h4 class="font-bold text-blue-600 mb-2 text-sm">🖼️ รูปภาพแผ่นใส (Image Overlay)</h4>
            <div class="border border-blue-200 rounded-lg p-2 bg-white mb-2">
              <label class="block text-xs font-bold text-blue-500 mb-1 cursor-pointer text-center">อัปโหลดรูปแผ่นใส (ไม่บังคับ)</label>
              <input type="file" id="swal-overlay-file" class="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 cursor-pointer"/>
              <input type="hidden" id="swal-overlay-bg" value="${month?.bg_overlay_image_url || ''}">
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block text-xs text-gray-600 mb-1">ความโปร่งใส: <span id="img-opacity-val">${month?.bg_overlay_image_opacity ?? 50}%</span></label>
                <input type="range" id="swal-img-opacity" min="0" max="100" value="${month?.bg_overlay_image_opacity ?? 50}" class="w-full accent-blue-500 cursor-pointer">
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">ความเบลอ: <span id="img-blur-val">${month?.bg_overlay_blur ?? 0}px</span></label>
                <input type="range" id="swal-img-blur" min="0" max="20" value="${month?.bg_overlay_blur ?? 0}" class="w-full accent-blue-500 cursor-pointer">
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">ความสว่าง: <span id="img-bright-val">${month?.bg_overlay_brightness ?? 100}%</span></label>
                <input type="range" id="swal-img-brightness" min="0" max="200" value="${month?.bg_overlay_brightness ?? 100}" class="w-full accent-blue-500 cursor-pointer">
              </div>
            </div>
            
          </div>

          <div class="border-2 border-dashed border-pink-300 rounded-xl p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors mt-2">
            <label class="block text-sm font-bold text-pink-600 mb-2 text-center cursor-pointer">เลือกภาพปกเดือนใหม่ 📸</label>
            <input type="file" id="swal-m-file" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 file:cursor-pointer file:transition-colors cursor-pointer"/>
          </div>
          <input type="hidden" id="swal-bg" value="${month?.bg_image_url || ''}">
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: month ? 'บันทึกการแก้ไข' : 'เพิ่มเดือน',
      cancelButtonText: 'ยกเลิก',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px]' },
      didOpen: () => {
        // Securely assign values to prevent XSS (String Interpolation Injection)
        if (month) {
          document.getElementById('swal-filename').value = month.page_filename || '';
          document.getElementById('swal-m-date').value = month.month_date || '';
          document.getElementById('swal-title').value = month.title || '';
          document.getElementById('swal-subtitle').value = month.subtitle || '';
          document.getElementById('swal-bg').value = month.bg_image_url || '';
          document.getElementById('swal-overlay-bg').value = month.bg_overlay_image_url || '';
        }

        // For specific fields that don't match the generic naming pattern:
        const mainInput = document.getElementById('swal-main-color');
        const mainHex = document.getElementById('main-color-hex');
        mainInput.value = month?.theme_main_text_color || '#003366';
        mainHex.textContent = mainInput.value;
        mainInput.addEventListener('input', (e) => mainHex.textContent = e.target.value);

        const subInput = document.getElementById('swal-sub-color');
        const subHex = document.getElementById('sub-color-hex');
        subInput.value = month?.theme_sub_text_color || '#005b9f';
        subHex.textContent = subInput.value;
        subInput.addEventListener('input', (e) => subHex.textContent = e.target.value);

        const overlayInput = document.getElementById('swal-overlay-color');
        const overlayHex = document.getElementById('overlay-color-hex');
        overlayInput.value = month?.bg_overlay_color || '#ffffff';
        overlayHex.textContent = overlayInput.value;
        overlayInput.addEventListener('input', (e) => overlayHex.textContent = e.target.value);

        const bindSlider = (sliderId, valId, suffix = '', value) => {
          const slider = document.getElementById(sliderId);
          const valDisplay = document.getElementById(valId);
          if (slider && valDisplay) {
            slider.value = value;
            valDisplay.textContent = value + suffix;
            slider.addEventListener('input', (e) => {
              valDisplay.textContent = e.target.value + suffix;
            });
          }
        };

        bindSlider('swal-overlay-opacity', 'opacity-val', '%', month?.bg_overlay_opacity !== undefined ? month.bg_overlay_opacity : 40);
        bindSlider('swal-img-opacity', 'img-opacity-val', '%', month?.bg_overlay_image_opacity ?? 50);
        bindSlider('swal-img-blur', 'img-blur-val', 'px', month?.bg_overlay_blur ?? 0);
        bindSlider('swal-img-brightness', 'img-bright-val', '%', month?.bg_overlay_brightness ?? 100);
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('swal-m-file');
        const overlayFileInput = document.getElementById('swal-overlay-file');
        let bgUrl = document.getElementById('swal-bg').value;
        let overlayBgUrl = document.getElementById('swal-overlay-bg').value;
        
        // Upload Main Image
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('media').upload(fileName, file);
          if (error) {
            Swal.showValidationMessage(`Upload failed: ${error.message}`);
            return false;
          }
          const { data: pubUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          bgUrl = pubUrl.publicUrl;
        }

        // Upload Overlay Image
        if (overlayFileInput.files.length > 0) {
          const file = overlayFileInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `overlay_${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('media').upload(fileName, file);
          if (error) {
            Swal.showValidationMessage(`Overlay upload failed: ${error.message}`);
            return false;
          }
          const { data: pubUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          overlayBgUrl = pubUrl.publicUrl;
        }

        return {
          page_filename: document.getElementById('swal-filename').value,
          month_date: document.getElementById('swal-m-date').value || null,
          title: document.getElementById('swal-title').value,
          subtitle: document.getElementById('swal-subtitle').value,
          theme_main_text_color: document.getElementById('swal-main-color').value,
          theme_sub_text_color: document.getElementById('swal-sub-color').value,
          bg_overlay_color: document.getElementById('swal-overlay-color').value,
          bg_overlay_opacity: parseInt(document.getElementById('swal-overlay-opacity').value),
          bg_image_url: bgUrl,
          bg_overlay_image_url: overlayBgUrl,
          bg_overlay_image_opacity: parseInt(document.getElementById('swal-img-opacity').value),
          bg_overlay_blur: parseInt(document.getElementById('swal-img-blur').value),
          bg_overlay_brightness: parseInt(document.getElementById('swal-img-brightness').value),
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = result.value;
        if (month) {
          const { error } = await supabase.from('months').update(payload).eq('id', month.id);
          if (error) Swal.fire('Error', error.message, 'error');
          else { Swal.fire('Success', 'อัปเดตสำเร็จ', 'success'); fetchMonths(); }
        } else {
          const { error } = await supabase.from('months').insert([payload]);
          if (error) Swal.fire('Error', error.message, 'error');
          else { Swal.fire('Success', 'เพิ่มสำเร็จ', 'success'); fetchMonths(); }
        }
      }
    });
  };

  const showCardForm = (card = null) => {
    Swal.fire({
      title: card ? 'แก้ไขการ์ด' : 'เพิ่มการ์ดใหม่',
      html: `
        <div class="flex flex-col gap-3 text-left">
          <select id="swal-c-type" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full text-gray-700 bg-white">
            <option value="image">รูปภาพ (Image)</option>
            <option value="video">วิดีโอ (Video)</option>
          </select>
          <div class="border-2 border-dashed border-pink-300 rounded-xl p-4 bg-pink-50/50 hover:bg-pink-50 transition-colors mt-2">
            <label class="block text-sm font-bold text-pink-600 mb-2 text-center cursor-pointer">เลือกสื่อที่จะอัปโหลด 📸</label>
            <input type="file" id="swal-c-file" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-500 file:text-white hover:file:bg-pink-600 file:cursor-pointer file:transition-colors cursor-pointer"/>
          </div>
          <input type="hidden" id="swal-c-url">
          <input id="swal-c-title" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="ชื่อการ์ด (Title)">
          
          <div class="relative">
            <input id="swal-c-location" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full" placeholder="📍 พิมพ์ชื่อสถานที่เพื่อค้นหา...">
            <div id="swal-c-location-results" class="absolute z-50 w-full bg-white border border-pink-200 rounded-xl mt-1 shadow-lg max-h-40 overflow-y-auto hidden"></div>
          </div>

          <textarea id="swal-c-desc" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full min-h-[100px] resize-none" placeholder="คำบรรยาย"></textarea>
          <div class="flex gap-3">
            <input type="date" id="swal-c-date" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-1/2 text-gray-600">
            <input id="swal-c-order" type="number" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-1/2" placeholder="ลำดับ (0,1,2...)">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      confirmButtonText: card ? 'บันทึกการแก้ไข' : 'เพิ่มการ์ด',
      cancelButtonText: 'ยกเลิก',
      customClass: { 
        popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[500px] !overflow-visible',
        htmlContainer: '!overflow-visible'
      },
      didOpen: () => {
        const locationInput = document.getElementById('swal-c-location');
        const resultsDiv = document.getElementById('swal-c-location-results');
        
        let debounceTimer;
        locationInput.addEventListener('input', (e) => {
          clearTimeout(debounceTimer);
          const val = e.target.value.trim();
          if (!val) {
            resultsDiv.classList.add('hidden');
            return;
          }
          debounceTimer = setTimeout(async () => {
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&addressdetails=1&limit=5&accept-language=th&email=hoing11111@gmail.com`);
              const data = await res.json();
              if (data && data.length > 0) {
                resultsDiv.innerHTML = data.map(item => 
                  `<div class="location-item p-3 border-b border-pink-50 hover:bg-pink-50 cursor-pointer text-sm" data-name="${item.display_name.replace(/"/g, '&quot;')}">
                    <div class="font-bold text-gray-800 truncate">${item.name || item.display_name.split(',')[0]}</div>
                    <div class="text-xs text-gray-500 truncate mt-0.5">${item.display_name}</div>
                  </div>`
                ).join('');
                resultsDiv.classList.remove('hidden');
              } else {
                resultsDiv.innerHTML = '<div class="p-3 text-sm text-gray-500 text-center">ไม่พบสถานที่</div>';
                resultsDiv.classList.remove('hidden');
              }
            } catch (err) {
              console.error(err);
            }
          }, 500);
        });

        resultsDiv.addEventListener('click', (e) => {
          const itemDiv = e.target.closest('.location-item');
          if (itemDiv) {
             locationInput.value = itemDiv.dataset.name;
             resultsDiv.classList.add('hidden');
          }
        });

        document.addEventListener('click', (e) => {
          if (e.target !== locationInput && !resultsDiv.contains(e.target)) {
            resultsDiv.classList.add('hidden');
          }
        });

        if (card) {
          document.getElementById('swal-c-type').value = card.type || 'image';
          document.getElementById('swal-c-url').value = card.media_url || '';
          document.getElementById('swal-c-title').value = card.title || '';
          document.getElementById('swal-c-desc').value = card.description || '';
          document.getElementById('swal-c-date').value = card.card_date || '';
          document.getElementById('swal-c-order').value = card.order_num !== undefined ? card.order_num : '';
          document.getElementById('swal-c-location').value = card.location || '';
        }
      },
      preConfirm: async () => {
        const fileInput = document.getElementById('swal-c-file');
        let mediaUrl = document.getElementById('swal-c-url').value;
        
        if (fileInput.files.length > 0) {
          const file = fileInput.files[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const { error } = await supabase.storage.from('media').upload(fileName, file);
          if (error) {
            Swal.showValidationMessage(`Upload failed: ${error.message}`);
            return false;
          }
          const { data: pubUrl } = supabase.storage.from('media').getPublicUrl(fileName);
          mediaUrl = pubUrl.publicUrl;
        }
        
        return {
          month_id: activeMonth.id,
          type: document.getElementById('swal-c-type').value,
          media_url: mediaUrl,
          title: document.getElementById('swal-c-title').value,
          description: document.getElementById('swal-c-desc').value,
          card_date: document.getElementById('swal-c-date').value || null,
          location: document.getElementById('swal-c-location').value || null,
          order_num: parseInt(document.getElementById('swal-c-order').value) || 0,
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const payload = result.value;
        if (card) {
          const { error } = await supabase.from('cards').update(payload).eq('id', card.id);
          if (error) Swal.fire('Error', error.message, 'error');
          else { Swal.fire('Success', 'อัปเดตสำเร็จ', 'success'); fetchCards(activeMonth.id); }
        } else {
          const { error } = await supabase.from('cards').insert([payload]);
          if (error) Swal.fire('Error', error.message, 'error');
          else { Swal.fire('Success', 'เพิ่มสำเร็จ', 'success'); fetchCards(activeMonth.id); }
        }
      }
    });
  };

  const deleteMonth = async (id) => {
    if (await Swal.fire({ title: 'แน่ใจหรือไม่?', text: 'การลบเดือนจะลบการ์ดทั้งหมดข้างในด้วย', icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
      await supabase.from('months').delete().eq('id', id);
      fetchMonths();
    }
  };

  const deleteCard = async (id) => {
    if (await Swal.fire({ title: 'ลบการ์ด?', icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
      await supabase.from('cards').delete().eq('id', id);
      fetchCards(activeMonth.id);
    }
  };

  const showEventColorForm = (colorItem = null) => {
    const userOptions = userProfiles.map(u => 
      `<option value="${u.email}" ${colorItem?.email === u.email ? 'selected' : ''}>${u.email}</option>`
    ).join('');

    Swal.fire({
      title: colorItem ? 'แก้ไขสีกิจกรรม' : 'กำหนดสีกิจกรรมใหม่',
      html: `
        <div class="flex flex-col gap-4 text-left">
          <div>
            <label class="block text-sm font-bold text-pink-600 mb-1">เลือกอีเมลผู้ใช้</label>
            ${colorItem ? `
              <input type="text" id="swal-ec-email" class="border border-gray-200 rounded-xl px-4 py-3 bg-gray-100 w-full text-gray-500 cursor-not-allowed" value="${colorItem.email}" disabled readonly>
            ` : `
              <select id="swal-ec-email" class="border border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400 w-full text-gray-700 bg-white">
                <option value="">-- เลือกอีเมล --</option>
                ${userOptions}
              </select>
            `}
          </div>
          <div>
            <label class="block text-sm font-bold text-pink-600 mb-1">เลือกสีประจำตัว</label>
            <div class="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input type="color" id="swal-ec-color" value="${colorItem?.color_code || '#ec4899'}" class="w-12 h-12 rounded cursor-pointer border-0 p-0 shadow-sm">
              <span class="text-gray-500 font-mono font-medium" id="ec-color-hex">${colorItem?.color_code || '#ec4899'}</span>
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#d1d5db',
      customClass: { popup: 'rounded-3xl border-2 border-pink-100 shadow-xl !w-[90%] md:!w-[400px]' },
      didOpen: () => {
        const colorInput = document.getElementById('swal-ec-color');
        const colorHex = document.getElementById('ec-color-hex');
        if (colorInput && colorHex) {
          colorInput.addEventListener('input', (e) => {
            colorHex.textContent = e.target.value.toUpperCase();
          });
        }
      },
      preConfirm: async () => {
        const email = document.getElementById('swal-ec-email').value;
        const color_code = document.getElementById('swal-ec-color').value;

        if (!email) {
          Swal.showValidationMessage('กรุณาเลือกอีเมล');
          return false;
        }

        return { email, color_code };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const payload = result.value;
        const { error } = await supabase.from('event_colors').upsert(payload);
        if (error) Swal.fire('Error', error.message, 'error');
        else {
          Swal.fire('Success', 'บันทึกสีสำเร็จ', 'success');
          fetchEventColors();
        }
      }
    });
  };

  const deleteEventColor = async (email) => {
    if (await Swal.fire({ title: 'ลบสีนี้?', text: 'กิจกรรมของคนนี้จะกลับไปใช้สีเริ่มต้น', icon: 'warning', showCancelButton: true }).then(r => r.isConfirmed)) {
      await supabase.from('event_colors').delete().eq('email', email);
      fetchEventColors();
    }
  };

  if (loading) return <div className="text-center py-24 text-pink-500 font-bold">Loading...</div>;

  if (!session || session.user?.email !== 'hoing11111@gmail.com') {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md flex-grow flex items-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 w-full text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">⛔ Access Denied</h2>
          <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้<br/>(เฉพาะผู้ดูแลระบบ hoing11111@gmail.com เท่านั้น)</p>
          <a href="/" className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-sm">
            กลับหน้าแรก
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50/50 flex flex-col md:flex-row font-prompt overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-white shadow-xl md:min-h-screen flex flex-col z-20 border-r border-pink-100/60 shrink-0">
        <div className="p-6 md:p-8 flex flex-col items-center border-b border-pink-50 bg-gradient-to-b from-pink-50/50 to-white">
          <div className="w-16 h-16 bg-gradient-to-tr from-pink-400 to-red-400 rounded-2xl flex items-center justify-center mb-4 shadow-[0_8px_16px_-6px_rgba(236,72,153,0.5)] transform rotate-3 hover:rotate-6 transition-transform">
             <Heart className="text-white w-8 h-8" fill="currentColor" />
          </div>
          <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-red-500 tracking-tight text-center">webpageforpimmie</h1>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">Admin Panel</p>
        </div>
        
        <div className="flex-grow p-4 md:p-6 flex flex-col gap-2 overflow-y-auto">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-2">เมนูหลัก</p>
          <button 
            onClick={() => { setActiveTab('months'); setActiveMonth(null); }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'months' ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-lg shadow-pink-200 translate-x-1' : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}`}
          >
            <Calendar size={20} className={activeTab === 'months' ? 'text-white' : 'text-pink-400'} /> 
            จัดการเดือน
          </button>
          <button 
            onClick={() => { setActiveTab('event_colors'); setActiveMonth(null); }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'event_colors' ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-lg shadow-pink-200 translate-x-1' : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}`}
          >
            <Palette size={20} className={activeTab === 'event_colors' ? 'text-white' : 'text-pink-400'} /> 
            ตั้งค่าสีกิจกรรม
          </button>
          <button 
            onClick={() => { setActiveTab('settings'); setActiveMonth(null); }}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${activeTab === 'settings' ? 'bg-gradient-to-r from-pink-500 to-red-400 text-white shadow-lg shadow-pink-200 translate-x-1' : 'text-gray-500 hover:bg-pink-50 hover:text-pink-600'}`}
          >
            <Settings size={20} className={activeTab === 'settings' ? 'text-white' : 'text-pink-400'} /> 
            ตั้งค่าเว็บไซต์
          </button>
          <Link 
            to="/admin/analytics" 
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 mt-2"
          >
            <BarChart2 size={20} className="text-blue-400" /> 
            ดูสถิติเข้าชม
          </Link>
        </div>

        <div className="p-4 md:p-6 border-t border-pink-50 bg-gray-50/50 mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
             <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold uppercase text-xs shrink-0">
               {session?.user?.email?.[0] || 'A'}
             </div>
             <div className="flex flex-col min-w-0">
               <span className="text-xs font-bold text-gray-700 truncate">{session?.user?.email}</span>
               <span className="text-[10px] text-green-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</span>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-red-50 hover:border-red-100 text-gray-600 hover:text-red-600 font-bold px-4 py-3 rounded-xl transition-all shadow-sm">
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto h-screen custom-scrollbar relative bg-gray-50/30">
        <div className="p-4 md:p-8 lg:p-10 max-w-6xl mx-auto">
          
          {activeTab === 'settings' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">การตั้งค่าเว็บไซต์</h2>
                    <p className="text-sm text-gray-500 mt-1">จัดการพื้นหลังหน้า Login และ Countdown</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button onClick={() => showSettingsForm()} className="w-full sm:w-auto justify-center flex items-center gap-2 bg-white border-2 border-purple-100 text-purple-600 hover:bg-purple-50 px-5 py-2.5 rounded-full font-bold transition-all hover:-translate-y-0.5 text-sm shadow-sm">
                      <Edit size={16} /> หน้า Login
                    </button>
                    <button onClick={() => showCountdownSettingsForm()} className="w-full sm:w-auto justify-center flex items-center gap-2 bg-white border-2 border-blue-100 text-blue-600 hover:bg-blue-50 px-5 py-2.5 rounded-full font-bold transition-all hover:-translate-y-0.5 text-sm shadow-sm">
                      <Edit size={16} /> หน้า Countdown
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100 group">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Login Page</h3>
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                        {siteSettings?.login_bg_url ? (
                          <>
                            <img src={siteSettings.login_bg_url} className="w-full h-full object-cover" style={{ filter: `blur(${siteSettings.login_bg_blur || 0}px)`, transform: 'scale(1.1)' }} />
                            <div className="absolute inset-0 bg-black" style={{ opacity: (siteSettings.login_bg_overlay_opacity ?? 50) / 100 }}></div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>
                        )}
                    </div>
                  </div>

                  <div className="flex flex-col bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100 group">
                    <h3 className="text-lg font-bold text-gray-700 mb-4 text-center">Countdown Page</h3>
                    <div className="w-full aspect-video bg-gray-200 rounded-2xl overflow-hidden relative shadow-inner group-hover:shadow-md transition-shadow">
                      {siteSettings?.countdown_bg_url ? (
                        <>
                          <img src={siteSettings.countdown_bg_url} className="w-full h-full object-cover" style={{ filter: `blur(${siteSettings.countdown_bg_blur || 0}px)`, transform: 'scale(1.1)' }} />
                          <div className="absolute inset-0 bg-black" style={{ opacity: (siteSettings.countdown_bg_overlay_opacity ?? 50) / 100 }}></div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium text-sm">ไม่มีรูปภาพพื้นหลัง</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'event_colors' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">ตั้งค่าสีกิจกรรม (Event Colors)</h2>
                    <p className="text-sm text-gray-500 mt-1">กำหนดสีประจำตัวให้แต่ละอีเมล เพื่อแสดงในปฏิทิน</p>
                  </div>
                  <button onClick={() => showEventColorForm()} className="w-full md:w-auto justify-center flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-pink-200 font-bold transition-all hover:-translate-y-0.5">
                    <Plus size={18} /> กำหนดสีใหม่
                  </button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {eventColors.map(color => (
                    <div key={color.email} className="flex flex-col p-5 border border-pink-50 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-md transition-all group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: color.color_code }}></div>
                      <div className="pl-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: color.color_code + '20', color: color.color_code }}>
                            <Palette size={20} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-gray-800 truncate text-sm" title={color.email}>{color.email}</h3>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">{color.color_code.toUpperCase()}</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                          <button onClick={() => showEventColorForm(color)} className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"><Edit size={16} /></button>
                          <button onClick={() => deleteEventColor(color.email)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {eventColors.length === 0 && (
                    <div className="text-center text-gray-400 py-12 col-span-full font-medium">
                      ยังไม่มีการกำหนดสี กด "กำหนดสีใหม่"
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'months' && !activeMonth && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">จัดการเดือน (Months)</h2>
                    <p className="text-sm text-gray-500 mt-1">เพิ่ม ลบ หรือแก้ไขข้อมูลของแต่ละเดือน</p>
                  </div>
                  <button onClick={() => showMonthForm()} className="w-full md:w-auto justify-center flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-pink-200 font-bold transition-all hover:-translate-y-0.5">
                    <Plus size={18} /> เพิ่มเดือนใหม่
                  </button>
                </div>
                <div className="grid gap-4">
                  {months.map(m => (
                    <div key={m.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 border border-pink-50 rounded-2xl hover:shadow-md transition-all bg-gray-50 hover:bg-white group cursor-pointer" onClick={(e) => {
                      if(!e.target.closest('button')) {
                        setActiveMonth(m); fetchCards(m.id);
                      }
                    }}>
                      <div className="flex-grow w-full md:w-auto mb-4 md:mb-0 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
                          <Calendar className="text-pink-500 w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 group-hover:text-pink-600 transition-colors mb-1">{m.title}</h3>
                          <p className="text-sm text-gray-500 font-mono bg-white border border-gray-200 px-2 py-0.5 rounded-md inline-block shadow-sm">{m.page_filename}</p>
                        </div>
                      </div>
                      <div className="mt-2 md:mt-0 flex justify-end gap-2 w-full md:w-auto">
                        <button onClick={(e) => { e.stopPropagation(); showMonthForm(m); }} className="flex-1 md:flex-none justify-center p-2.5 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-xl transition-colors"><Edit size={20} /></button>
                        <button onClick={(e) => { e.stopPropagation(); deleteMonth(m.id); }} className="flex-1 md:flex-none justify-center p-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  ))}
                  {months.length === 0 && (
                    <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">ยังไม่มีข้อมูลเดือน กดปุ่ม "เพิ่มเดือนใหม่" เพื่อเริ่มต้น</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'months' && activeMonth && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="bg-white/90 backdrop-blur-sm p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-pink-100/50">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-pink-100 pb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => setActiveMonth(null)} className="p-3 text-pink-500 bg-pink-50 hover:bg-pink-100 hover:text-pink-600 rounded-full transition-all hover:scale-105"><ArrowLeft size={24} /></button>
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">จัดการการ์ด: <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-400">{activeMonth.title}</span></h2>
                      <p className="text-sm text-gray-500 mt-0.5">เพิ่มภาพ/วิดีโอ ลงในเดือนนี้</p>
                    </div>
                  </div>
                  <button onClick={() => showCardForm()} className="w-full md:w-auto justify-center flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-400 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-pink-200 font-bold transition-all hover:-translate-y-0.5">
                    <Plus size={18} /> เพิ่มการ์ดใหม่
                  </button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {cards.map(c => (
                    <div key={c.id} className="flex flex-col gap-4 p-5 border border-pink-50 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all group">
                      <div className="w-full h-48 bg-gray-200 rounded-xl overflow-hidden relative">
                        {c.type === 'video' ? (
                          <video src={c.media_url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={c.media_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider">{c.type}</div>
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-gray-800 text-lg leading-tight mb-1 line-clamp-1">{c.title}</h4>
                          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{c.description}</p>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <span className="text-xs font-bold bg-pink-100 text-pink-600 px-2.5 py-1 rounded-lg">ลำดับ: {c.order_num}</span>
                          <div className="flex justify-end gap-2">
                            <button onClick={() => showCardForm(c)} className="p-2 text-yellow-600 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"><Edit size={16} /></button>
                            <button onClick={() => deleteCard(c.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && <p className="text-center text-gray-400 py-12 col-span-full font-medium">ยังไม่มีการ์ดในเดือนนี้ กด "เพิ่มการ์ดใหม่"</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
