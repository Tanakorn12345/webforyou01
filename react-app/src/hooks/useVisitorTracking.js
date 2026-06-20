import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UAParser } from 'ua-parser-js';

const TRACKING_KEY = 'last_visit_date';

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        // ใช้เวลาปัจจุบันแบบ YYYY-MM-DD เพื่อป้องกันการสแปมในวันเดียวกัน
        const today = new Date().toISOString().split('T')[0]; 
        const lastVisit = localStorage.getItem(TRACKING_KEY);

        // ถ้าวันนี้บันทึกไปแล้ว ไม่ต้องทำอะไรเพิ่ม
        if (lastVisit === today) {
          return;
        }

        // 1. ดึง IP Address ของผู้เข้าชม
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ipAddress = data.ip;

        // 2. แกะข้อมูล User-Agent
        const parser = new UAParser();
        const result = parser.getResult();
        
        const browser = `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim();
        const os = `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim();
        
        // จัดรูปแบบชื่อ Device ให้อ่านง่าย
        const deviceType = result.device.type || (result.device.vendor ? 'Mobile/Tablet' : 'Desktop');
        const deviceStr = result.device.vendor ? `${result.device.vendor} ${result.device.model || deviceType}` : deviceType;

        // 3. บันทึกลง Supabase
        const { error } = await supabase
          .from('visitor_logs')
          .insert([
            {
              ip_address: ipAddress,
              browser: browser,
              os: os,
              device: deviceStr
            }
          ]);

        // ถ้าบันทึกสำเร็จ ให้เก็บวันที่ลง LocalStorage
        if (!error) {
          localStorage.setItem(TRACKING_KEY, today);
        } else {
          console.error('Supabase Error tracking visitor:', error);
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
      }
    };

    trackVisitor();
  }, []);
};
