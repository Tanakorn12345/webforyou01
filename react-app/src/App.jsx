import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Collection from './pages/Collection';
import MonthDetail from './pages/MonthDetail';
import Admin from './pages/Admin';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Countdown from './pages/Countdown';
import { useVisitorTracking } from './hooks/useVisitorTracking';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // เริ่มระบบเก็บสถิติคนเข้าเว็บ
  useVisitorTracking();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col font-prompt">
        <Navbar session={session} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/mycollection" element={<Collection />} />
            <Route path="/countdown" element={<Countdown />} />
            <Route path="/month/:filename" element={<MonthDetail />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/analytics" element={<Analytics />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
