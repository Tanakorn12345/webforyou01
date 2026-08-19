import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home from '../pages/Home';
import Contact from '../pages/Contact';
import Collection from '../pages/Collection';
import MonthDetail from '../pages/MonthDetail';
import Admin from '../pages/Admin';
import Analytics from '../pages/Analytics';
import Countdown from '../pages/Countdown';
import CalendarPage from '../pages/CalendarPage';
import Anniversary from '../pages/Anniversary';

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
        <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
        <Route path="/mycollection" element={<PageWrapper><Collection /></PageWrapper>} />
        <Route path="/calendar" element={<PageWrapper><CalendarPage /></PageWrapper>} />
        <Route path="/anniversary" element={<PageWrapper><Anniversary /></PageWrapper>} />
        <Route path="/countdown" element={<PageWrapper><Countdown /></PageWrapper>} />
        <Route path="/month/:filename" element={<PageWrapper><MonthDetail /></PageWrapper>} />
        <Route path="/admin" element={<PageWrapper><Admin /></PageWrapper>} />
        <Route path="/admin/analytics" element={<PageWrapper><Analytics /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}
