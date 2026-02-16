
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Users, Activity, CheckCircle2, BarChart3, LayoutGrid, Loader2, RefreshCw, MessageCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SupportQuestion } from '../types';

interface UserStats {
  totalUsers: number;
  avgProgress: number;
  avgLevel: number;
  activeToday: number;
}

interface ActivityLog {
  id: string;
  name: string;
  action: string;
  time: string;
}

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, avgProgress: 0, avgLevel: 0, activeToday: 0 });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<SupportQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, level, progress, updated_at');

      if (profileError) throw profileError;

      if (profiles) {
        const total = profiles.length;
        const sumProgress = profiles.reduce((acc, curr) => acc + (curr.progress || 0), 0);
        const sumLevel = profiles.reduce((acc, curr) => acc + (curr.level || 1), 0);
        const todayStr = new Date().toISOString().split('T')[0];
        const activeTodayCount = profiles.filter(p => p.updated_at && p.updated_at.startsWith(todayStr)).length;

        setStats({
          totalUsers: total,
          avgProgress: total > 0 ? Math.round(sumProgress / total) : 0,
          avgLevel: total > 0 ? Number((sumLevel / total).toFixed(1)) : 1,
          activeToday: activeTodayCount
        });

        const sorted = [...profiles]
          .sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime())
          .slice(0, 5);

        const logs = sorted.map(p => ({
          id: p.id || Math.random().toString(),
          name: p.name || '익명',
          action: (p.progress || 0) > 0 ? `학습 진척도 ${p.progress}% 달성` : '플랫폼 가입 완료',
          time: getTimeAgo(p.updated_at)
        }));
        setActivities(logs);
      }

      const { data: questions, error: qError } = await supabase
        .from('support_questions')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (qError) throw qError;
      setPendingQuestions(questions || []);

    } catch (error) {
      console.error("Admin Data Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const { error } = await supabase
        .from('support_questions')
        .update({ is_resolved: true })
        .eq('id', id);

      if (error) throw error;
      setPendingQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert('상태 업데이트 실패');
    }
  };

  useEffect(() => {
    fetchAdminData();
    const channel = supabase
      .channel('admin_realtime')
      .on('postgres_changes', { event: '*', table: 'profiles' }, () => { fetchAdminData(); })
      .on('postgres_changes', { event: '*', table: 'support_questions' }, () => { fetchAdminData(); })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAdminData]);

  function getTimeAgo(dateStr?: string) {
    if (!dateStr) return '방금 전';
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금 전';
    if (diffMin < 60) return `${diffMin}분 전`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}시간 전`;
    return `${Math.floor(diffMin / 1440)}일 전`;
  }

  const dashboardStats = [
    { label: '전체 학습자', value: stats.totalUsers.toLocaleString(), icon: <Users />, color: 'bg-blue-500' },
    { label: '미해결 질문', value: pendingQuestions.length.toString(), icon: <MessageCircle />, color: 'bg-red-500' },
    { label: '평균 완료율', value: `${stats.avgProgress}%`, icon: <Activity />, color: 'bg-green-500' },
    { label: '평균 레벨', value: `Lv.${stats.avgLevel}`, icon: <BarChart3 />, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      <header className="mb-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> System Administrator
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-2 text-white">대시보드</h2>
          <p className="text-gray-500 font-light text-lg">실시간 데이터 및 학습자 지원을 관리합니다.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { fetchAdminData(); }}
            disabled={isLoading}
            className="flex items-center gap-3 px-6 py-4 glass rounded-2xl text-sm font-bold hover:bg-white/10 transition-all border-white/10 text-white"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            새로고침
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {dashboardStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.02]"
          >
            <div className={`w-12 h-12 rounded-2xl ${stat.color} bg-opacity-10 flex items-center justify-center mb-6`}>
              {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 24, className: "text-white" })}
            </div>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">{stat.label}</p>
            <h4 className="text-4xl font-black tracking-tighter text-white">
              {isLoading ? '...' : stat.value}
            </h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="glass rounded-[40px] border-white/5 overflow-hidden">
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white"><LayoutGrid size={20} className="text-[#007AFF]" /> 최근 활동</h3>
          </div>
          <div className="p-6">
             <div className="space-y-4">
               {isLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-700">
                   <Loader2 size={40} className="animate-spin" />
                 </div>
               ) : activities.length > 0 ? (
                 activities.map((act) => (
                   <div key={act.id} className="flex items-center justify-between p-5 glass bg-white/[0.01] rounded-2xl border-white/5 group hover:bg-white/[0.05] transition-all">
                     <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#007AFF] to-cyan-500 flex items-center justify-center font-bold text-xs text-white">
                         {act.name[0]}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-white">{act.name}</p>
                         <p className="text-xs text-gray-500">{act.action}</p>
                       </div>
                     </div>
                     <div className="text-[10px] text-gray-700 font-mono">{act.time}</div>
                   </div>
                 ))
               ) : (
                 <div className="py-20 text-center text-gray-600 italic">표시할 활동 내역이 없습니다.</div>
               )}
             </div>
          </div>
        </div>

        <div className="glass rounded-[40px] border-white/5 overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent">
          <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white"><MessageCircle size={20} className="text-red-400" /> 미답변 질문 피드</h3>
            <span className="text-[10px] text-red-400 font-black uppercase tracking-widest">{pendingQuestions.length} Pending</span>
          </div>
          <div className="p-6">
             <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
               {isLoading ? (
                 <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-700">
                   <Loader2 size={40} className="animate-spin" />
                 </div>
               ) : pendingQuestions.length > 0 ? (
                 pendingQuestions.map((q) => (
                   <motion.div 
                    key={q.id}
                    layout
                    className="p-6 glass bg-white/[0.02] rounded-3xl border-white/5 flex flex-col gap-4 relative"
                   >
                     <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 font-bold text-[10px]">{q.user_name ? q.user_name[0] : '?'}</div>
                         <div>
                           <p className="text-xs font-bold text-white">{q.user_name || '익명'}</p>
                           <p className="text-[8px] text-gray-600 font-mono">{getTimeAgo(q.created_at)}</p>
                         </div>
                       </div>
                       <button 
                        onClick={() => { handleResolve(q.id); }}
                        className="px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-[10px] font-bold transition-all border border-green-500/20"
                       >
                         해결 완료
                       </button>
                     </div>
                     <p className="text-sm text-gray-300 leading-relaxed bg-black/40 p-4 rounded-2xl italic">
                       "{q.content}"
                     </p>
                   </motion.div>
                 ))
               ) : (
                 <div className="py-32 flex flex-col items-center justify-center text-gray-700 gap-4">
                   <CheckCircle2 size={40} className="text-green-500/30" />
                   <p className="text-sm font-medium">모든 질문이 해결되었습니다!</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
