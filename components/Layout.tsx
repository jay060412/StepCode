
import React, { useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { AppRoute, UserProfile } from '../types';
import { User, Bell, ChevronRight, LogOut, ChevronLeft, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Fix for framer-motion intrinsic element type errors
const MotionAside = motion.aside as any;
const MotionButton = motion.button as any;
const MotionH1 = motion.h1 as any;

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  setActiveRoute: (route: AppRoute) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeRoute, setActiveRoute, user, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const userRole = user?.role || 'user';
  const isManagementMember = userRole === 'admin' || userRole === 'staff';

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.id === AppRoute.ADMIN) return userRole === 'admin';
    return true;
  });

  return (
    <div className="flex h-[100dvh] w-screen bg-[#050505] text-white overflow-hidden flex-col lg:flex-row">
      {/* Sidebar Navigation - [PC Only] */}
      <MotionAside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex border-r border-white/5 bg-black flex-col shrink-0 relative z-20"
      >
        {/* Sidebar Toggle Floating Button */}
        <MotionButton
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          initial={false}
          animate={{ x: isSidebarCollapsed ? 40 : 12 }}
          whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-50 w-8 h-12 glass border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-2xl"
          title={isSidebarCollapsed ? "메뉴 확장" : "메뉴 축소"}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </MotionButton>

        <div className="p-8 flex items-center justify-center lg:justify-start gap-3 h-20">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => setActiveRoute(AppRoute.HOME)}
          >
            <div className="w-8 h-8 bg-[#007AFF] rounded-lg shrink-0 flex items-center justify-center font-black text-white text-xl">S</div>
            <AnimatePresence mode="wait">
              {!isSidebarCollapsed && (
                <MotionH1 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent whitespace-nowrap"
                >
                  StepCode<span className="text-[#007AFF]">.</span>
                </MotionH1>
              )}
            </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                activeRoute === item.id 
                ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              } ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}
            >
              <div className="shrink-0">{item.icon}</div>
              {!isSidebarCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className={`glass rounded-2xl flex items-center gap-3 transition-all ${isSidebarCollapsed ? 'p-2 justify-center' : 'p-4'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#007AFF] to-cyan-400 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">
              {user?.name?.[0] || 'U'}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold truncate">{user?.name || '학습자'}</p>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{userRole}</p>
              </div>
            )}
          </div>
          <button onClick={onLogout} className={`w-full flex items-center gap-2 py-3 text-xs text-gray-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/5 ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}>
            <LogOut size={16} />
            {!isSidebarCollapsed && <span>로그아웃</span>}
          </button>
        </div>
      </MotionAside>

      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-black/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
            <span className="hidden sm:inline cursor-pointer hover:text-white transition-colors" onClick={() => setActiveRoute(AppRoute.HOME)}>나의 학습</span>
            <span className="hidden sm:inline"><ChevronRight size={14} /></span>
            <h2 className="text-white font-medium capitalize truncate">{activeRoute}</h2>
          </div>
          {isManagementMember && (
            <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-full border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]">
              <ShieldCheck size={16} />
              <span className="text-xs font-bold uppercase">{userRole}</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#001a33_0%,_#050505_40%)] custom-scrollbar">
          {children}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[50]">
        {filteredNavItems.map((item) => (
          <button key={item.id} onClick={() => setActiveRoute(item.id)} className={`flex flex-col items-center justify-center gap-1 min-w-[64px] ${activeRoute === item.id ? 'text-[#007AFF]' : 'text-gray-500'}`}>
            <div className={`p-1 rounded-lg ${activeRoute === item.id ? 'bg-[#007AFF]/10' : ''}`}>{item.icon}</div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
