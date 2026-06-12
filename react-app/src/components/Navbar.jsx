import { Link, useLocation } from 'react-router-dom';
import { Settings, Menu, X, LogOut } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Navbar({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `hover:text-pink-100 transition-colors ${isActive(path) ? 'font-semibold border-b-2 border-white' : ''}`;

  return (
    <nav className="bg-pink-400 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold uppercase tracking-wider text-white hover:text-pink-100">
          Pimmie Webpage
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Content</Link>
          <Link to="/contact" className={linkClass('/contact')}>Contact</Link>
          <Link to="/mycollection" className={linkClass('/mycollection')}>Myaniversary</Link>
          
          <div className="flex items-center gap-4 border-l border-pink-300 pl-4 ml-2">
            {session?.user?.user_metadata && (
              <div className="flex items-center gap-2">
                <img 
                  src={session.user.user_metadata.avatar_url} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-sm font-semibold truncate max-w-[100px]">
                  {session.user.user_metadata.full_name?.split(' ')[0]}
                </span>
              </div>
            )}
            
            <Link to="/admin" className="border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-pink-500 rounded-full px-4 py-2 font-bold flex items-center gap-2 transition-all shadow-sm">
              <Settings size={18} /> Admin
            </Link>

            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-white hover:text-pink-100 flex items-center gap-1 text-sm font-semibold transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-pink-500 pb-4 px-4 flex flex-col gap-4 shadow-inner">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkClass('/')}>Content</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={linkClass('/contact')}>Contact</Link>
          <Link to="/mycollection" onClick={() => setIsOpen(false)} className={linkClass('/mycollection')}>Myaniversary</Link>
          
          <hr className="border-pink-400 my-2" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {session?.user?.user_metadata && (
                <div className="flex items-center gap-2">
                  <img 
                    src={session.user.user_metadata.avatar_url} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-sm font-semibold">
                    {session.user.user_metadata.full_name}
                  </span>
                </div>
              )}
              <Link to="/admin" onClick={() => setIsOpen(false)} className="border-2 border-yellow-300 text-yellow-300 hover:bg-yellow-300 hover:text-pink-500 rounded-full px-3 py-1 text-sm font-bold flex items-center gap-1 transition-all">
                <Settings size={16} /> Admin
              </Link>
            </div>
            <button 
              onClick={() => { setIsOpen(false); supabase.auth.signOut(); }}
              className="text-white hover:text-pink-200"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
