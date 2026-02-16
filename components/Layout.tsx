
import React, { useState } from 'react';
import { NAV_ITEMS } from '../constants';
import { AppRoute, UserProfile } from '../types';
import { User, Bell, ChevronRight, LogOut, ChevronLeft, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  setActiveRoute: (route: AppRoute) => void;
  user: UserProfile;
  onLogout: () => void;
}

const ADMIN_EMAIL = 'jay447233@gmail.com';

export const Layout: React.FC<LayoutProps> = ({ children, activeRoute, setActiveRoute, user, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isAdmin = user.email === ADMIN_EMAIL;

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.id === AppRoute.ADMIN) return isAdmin;
    return true;
  });

  return (
    <div className="flex h-[100dvh] w-screen bg-[#050505] text-white overflow-hidden flex-col lg:flex-row">
      {/* Sidebar Navigation - [PC Only] */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex border-r border-white/5 bg-black flex-col shrink-0 relative overflow-hidden"
      >
        {/* Logo Section */}
        <div 
          className="p-8 cursor-pointer flex items-center gap-3" 
          onClick={() => setActiveRoute(AppRoute.HOME)}
        >
          <div className="w-8 h-8 bg-[#007AFF] rounded-lg shrink-0 flex items-center justify-center font-black text-white text-xl">S</div>
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.h1 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent whitespace-nowrap"
              >
                StepCode<span className="text-[#007AFF]">.</span>
              </motion.h1>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-2">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${
                activeRoute === item.id 
                ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="shrink-0">{item.icon}</div>
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {!isSidebarCollapsed && activeRoute === item.id && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#007AFF]" />
              )}

              {/* Tooltip for Collapsed State */}
              {isSidebarCollapsed && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile & Sidebar Toggle */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className={`glass rounded-2xl flex items-center gap-3 transition-all ${isSidebarCollapsed ? 'p-2 justify-center' : 'p-4'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#007AFF] to-cyan-400 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">
              {user.name.slice(0, 1)}
            </div>
            {!isSidebarCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500">Lv.{user.level} {isAdmin ? '관리자' : '학습자'}</p>
              </motion.div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <button 
              onClick={onLogout}
              className={`w-full flex items-center gap-2 py-3 text-xs text-gray-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/5 ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}
            >
              <LogOut size={16} />
              {!isSidebarCollapsed && <span>로그아웃</span>}
            </button>
            
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`w-full flex items-center gap-2 py-3 text-xs text-gray-600 hover:text-white transition-colors rounded-xl hover:bg-white/5 ${isSidebarCollapsed ? 'justify-center' : 'px-4'}`}
            >
              {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              {!isSidebarCollapsed && <span>사이드바 접기</span>}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        {/* Header */}
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-black/50 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-400">
            <span className="hidden sm:inline cursor-pointer hover:text-white transition-colors" onClick={() => setActiveRoute(AppRoute.HOME)}>나의 학습</span>
            <span className="hidden sm:inline"><ChevronRight size={14} /></span>
            <h2 className="text-white font-medium capitalize truncate max-w-[120px] sm:max-w-none">{activeRoute}</h2>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 glass rounded-full text-gray-400 hover:text-white transition-colors relative">
              <Bell size={18} className="lg:w-5 lg:h-5" />
              <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#007AFF] rounded-full border border-black" />
            </button>
            <div className="h-6 w-[1px] bg-white/10 mx-1" />
            
            {isAdmin && (
              <button 
                onClick={() => setActiveRoute(AppRoute.ADMIN)}
                className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 glass rounded-full border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF]/20 transition-all"
              >
                <ShieldCheck size={16} className="lg:w-[18px] lg:h-[18px]" />
                <span className="text-xs lg:text-sm font-bold">Admin</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#001a33_0%,_#050505_40%)] custom-scrollbar">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - [Mobile Only] */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[50]">
        {filteredNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveRoute(item.id)}
            className={`flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${
              activeRoute === item.id ? 'text-[#007AFF]' : 'text-gray-500'
            }`}
          >
            <div className={`p-1 rounded-lg ${activeRoute === item.id ? 'bg-[#007AFF]/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
