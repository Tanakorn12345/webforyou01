import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import Swal from 'sweetalert2';
import { 
  Smartphone, Monitor, Tablet, Globe, Apple, LayoutGrid, 
  Trash2, MapPin, RefreshCw, ArrowLeft, Signal
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Analytics() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState({}); // { ip: { location, isp } }
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('visitor_logs')
        .select('*')
        .order('visited_at', { ascending: false });

      if (error) throw error;
      
      setLogs(data || []);
      
      // หา IP ที่ไม่ซ้ำกันเพื่อไปดึงข้อมูลสถานที่
      const uniqueIps = [...new Set((data || []).map(log => log.ip_address))];
      fetchGeoData(uniqueIps);
      
    } catch (error) {
      console.error('Error fetching logs:', error);
      Swal.fire('Error', 'Failed to load visitor logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchGeoData = async (ips) => {
    const newData = { ...geoData };
    
    for (const ip of ips) {
      // ถ้ามีข้อมูล IP นี้แล้ว ให้ข้ามไป
      if (newData[ip]) continue;
      
      try {
        const res = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
        const json = await res.json();
        
        if (json && !json.error) {
          newData[ip] = {
            location: [json.city, json.region, json.country].filter(Boolean).join(', '),
            isp: json.organization_name || json.organization || 'Unknown'
          };
        } else {
          newData[ip] = { location: 'Unknown', isp: 'Unknown' };
        }
      } catch (err) {
        console.error(`Failed to fetch geo for IP: ${ip}`, err);
        newData[ip] = { location: 'Error', isp: 'Error' };
      }
    }
    
    setGeoData(newData);
  };

  const handleClearLogs = () => {
    Swal.fire({
      title: 'ยืนยันการลบประวัติ?',
      text: "การลบจะไม่สามารถกู้คืนได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบทิ้งทั้งหมด!',
      cancelButtonText: 'ยกเลิก'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from('visitor_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all trick
            
          if (error) throw error;
          
          setLogs([]);
          Swal.fire('Deleted!', 'ลบประวัติทั้งหมดแล้ว', 'success');
        } catch (error) {
          console.error('Error deleting logs:', error);
          Swal.fire('Error', 'ไม่สามารถลบข้อมูลได้', 'error');
        }
      }
    });
  };

  // Helper functions for icons
  const getDeviceIcon = (device) => {
    if (!device) return <Monitor size={18} className="text-gray-600" />;
    const d = device.toLowerCase();
    if (d.includes('mobile')) return <Smartphone size={18} className="text-blue-500" />;
    if (d.includes('tablet')) return <Tablet size={18} className="text-purple-500" />;
    return <Monitor size={18} className="text-gray-600" />;
  };

  const getOsIcon = (os) => {
    if (!os) return <Globe size={18} className="text-gray-400" />;
    const o = os.toLowerCase();
    if (o.includes('mac') || o.includes('ios')) return <Apple size={18} className="text-gray-800" />;
    if (o.includes('windows')) return <LayoutGrid size={18} className="text-blue-600" />;
    if (o.includes('android')) return <Smartphone size={18} className="text-green-500" />;
    return <Globe size={18} className="text-gray-400" />;
  };

  if (!loading && (!session || session.user?.email !== 'hoing11111@gmail.com')) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-md flex-grow flex items-center min-h-screen">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-red-100 w-full text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-4">⛔ Access Denied</h2>
          <p className="text-gray-600 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้<br/>(เฉพาะผู้ดูแลระบบ hoing11111@gmail.com เท่านั้น)</p>
          <Link to="/" className="inline-block bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-colors font-bold shadow-sm">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-gray-600" />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">📊 สถิติผู้เข้าชมเว็บ</h1>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchLogs}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span className="hidden md:inline">รีเฟรช</span>
          </button>
          
          <button 
            onClick={handleClearLogs}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
          >
            <Trash2 size={18} />
            <span className="hidden md:inline">ล้างประวัติ</span>
          </button>
        </div>
      </div>

      {loading && logs.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="px-6 py-4">เวลาเข้าชม</th>
                  <th className="px-6 py-4">อุปกรณ์ (Device)</th>
                  <th className="px-6 py-4">ระบบปฏิบัติการ (OS)</th>
                  <th className="px-6 py-4">เบราว์เซอร์</th>
                  <th className="px-6 py-4">สถานที่ (Location)</th>
                  <th className="px-6 py-4">IP / เครือข่าย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      ยังไม่มีข้อมูลผู้เข้าชม
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const geo = geoData[log.ip_address] || {};
                    return (
                      <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-700">
                          {new Date(log.visited_at).toLocaleString('th-TH')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(log.device)}
                            <span className="text-gray-800 font-medium">{log.device || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {getOsIcon(log.os)}
                            <span className="text-gray-800">{log.os || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Globe size={18} className="text-gray-400" />
                            <span className="text-gray-800">{log.browser || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={16} className="text-red-400 shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {geo.location || <span className="inline-block animate-pulse bg-gray-200 h-4 w-24 rounded"></span>}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-gray-500">{log.ip_address}</span>
                            <div className="flex items-center gap-1 mt-1 text-xs text-gray-600">
                              <Signal size={12} className="text-green-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{geo.isp || 'กำลังค้นหา...'}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
