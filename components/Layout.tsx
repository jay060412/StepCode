
import React, { useState, useEffect, useCallback } from 'react';
import { NAV_ITEMS } from '../constants';
import { AppRoute, UserProfile, Notification } from '../types';
import { User, Bell, ChevronRight, LogOut, ChevronLeft, ShieldCheck, X, CheckCircle2, Clock, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

const MotionAside = motion.aside as any;
const MotionButton = motion.button as any;
const MotionH1 = motion.h1 as any;
const MotionDiv = motion.div as any;

interface LayoutProps {
  children: React.ReactNode;
  activeRoute: AppRoute;
  setActiveRoute: (route: AppRoute) => void;
  user: UserProfile;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeRoute, setActiveRoute, user, onLogout }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const userRole = user?.role || 'user';
  const isManagementMember = userRole === 'admin' || userRole === 'staff';

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (!error && data) setNotifications(data);
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
    
    // 실시간 알림 구독
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (item.id === AppRoute.ADMIN) return userRole === 'admin';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="flex h-[100dvh] w-screen bg-main text-main overflow-hidden flex-col lg:flex-row">
      {/* Sidebar - [PC Only] */}
      <MotionAside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden lg:flex border-r border-white/5 bg-card flex-col shrink-0 relative z-20"
      >
        <MotionButton
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          initial={false}
          animate={{ x: isSidebarCollapsed ? 40 : 12 }}
          className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2 z-50 w-8 h-12 glass border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors shadow-2xl"
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </MotionButton>

        <div className="p-8 flex items-center justify-center lg:justify-start gap-3 h-20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveRoute(AppRoute.HOME)}>
            <div className="w-8 h-8 bg-[#007AFF] rounded-lg shrink-0 flex items-center justify-center font-black text-white text-xl">S</div>
            {!isSidebarCollapsed && (
              <MotionH1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-main whitespace-nowrap">
                StepCode<span className="text-[#007AFF]">.</span>
              </MotionH1>
            )}
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {filteredNavItems.map((item) => (
            <button key={item.id} onClick={() => setActiveRoute(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative group ${activeRoute === item.id ? 'bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20' : 'text-gray-500 hover:text-[#007AFF] hover:bg-[#007AFF]/5'} ${isSidebarCollapsed ? 'justify-center px-0' : ''}`}>
              <div className="shrink-0">{item.icon}</div>
              {!isSidebarCollapsed && <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <div className={`glass rounded-2xl flex items-center gap-3 transition-all ${isSidebarCollapsed ? 'p-2 justify-center' : 'p-4'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#007AFF] to-cyan-400 flex items-center justify-center font-bold text-white shrink-0 shadow-lg">{user?.name?.[0]}</div>
            {!isSidebarCollapsed && <div className="flex-1 overflow-hidden"><p className="text-xs font-bold truncate">{user?.name}</p><p className="text-[10px] text-gray-500 uppercase tracking-widest">{userRole}</p></div>}
          </div>
        </div>
      </MotionAside>

      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-8 bg-card backdrop-blur-md z-40 shrink-0">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-gray-500">
            <span className="hidden sm:inline cursor-pointer hover:text-main" onClick={() => setActiveRoute(AppRoute.HOME)}>나의 학습</span>
            <span className="hidden sm:inline"><ChevronRight size={14} /></span>
            <h2 className="text-main font-medium capitalize truncate">{activeRoute}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Center */}
            <div className="relative">
              <button 
                onClick={() => setIsNotiOpen(!isNotiOpen)}
                className="p-2.5 rounded-xl hover:bg-white/5 transition-all relative text-gray-500 hover:text-white"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-card">
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {isNotiOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNotiOpen(false)} />
                    <MotionDiv
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 lg:w-96 glass rounded-3xl border-white/10 bg-card shadow-3xl z-50 overflow-hidden"
                    >
                      <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="font-bold text-sm">알림 센터</h3>
                        <span className="text-[10px] font-bold text-gray-500">{notifications.length}개의 최신 알림</span>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markAsRead(n.id)}
                              className={`p-4 rounded-2xl transition-all cursor-pointer mb-1 ${n.is_read ? 'opacity-50 hover:bg-white/5' : 'bg-[#007AFF]/5 border border-[#007AFF]/10 hover:bg-[#007AFF]/10'}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${n.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-[#007AFF]/10 text-[#007AFF]'}`}>
                                  {n.type === 'success' ? <CheckCircle2 size={16} /> : <Megaphone size={16} />}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-main mb-1">{n.title}</p>
                                  <p className="text-[11px] text-gray-500 leading-relaxed mb-2">{n.content}</p>
                                  <span className="text-[9px] text-gray-600 flex items-center gap-1">
                                    <Clock size={10} /> {new Date(n.created_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-12 text-center text-gray-600 text-xs italic">새로운 알림이 없습니다.</div>
                        )}
                      </div>
                    </MotionDiv>
                  </>
                )}
              </AnimatePresence>
            </div>

            {isManagementMember && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-full border-[#007AFF]/30 bg-[#007AFF]/10 text-[#007AFF]">
                <ShieldCheck size={16} />
                <span className="text-xs font-bold uppercase">{userRole}</span>
              </div>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-main custom-scrollbar">
          {children}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-card backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-4 z-[50]">
        {filteredNavItems.slice(0, 5).map((item) => (
          <button key={item.id} onClick={() => setActiveRoute(item.id)} className={`flex flex-col items-center justify-center gap-1 min-w-[64px] ${activeRoute === item.id ? 'text-[#007AFF]' : 'text-gray-500'}`}>
            <div className={`p-1 rounded-lg ${activeRoute === item.id ? 'bg-[#007AFF]/10' : ''}`}>{item.icon}</div>
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};
