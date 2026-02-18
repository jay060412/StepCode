
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, CheckCircle2, 
  BarChart3, Loader2, RefreshCw, 
  MessageCircle, UserX, UserCheck, 
  Send, AlertCircle, Search, Filter, 
  MessageSquare, Info, Database, Lock, ShieldAlert, Trash2
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SupportQuestion, UserProfile, UserRole } from '../types';
import { FormattedText } from './FormattedText';

const MotionDiv = motion.div as any;

interface UserStats {
  totalUsers: number;
  avgProgress: number;
  avgLevel: number;
  activeToday: number;
}

export const Admin: React.FC = () => {
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, avgProgress: 0, avgLevel: 0, activeToday: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [questions, setQuestions] = useState<SupportQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'questions'>('stats');
  const [userSearch, setUserSearch] = useState('');
  const [questionFilter, setQuestionFilter] = useState<'pending' | 'resolved'>('pending');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (profileError) {
        throw new Error(`프로필 로드 실패: ${profileError.message}`);
      }

      if (profiles) {
        setUsers(profiles as UserProfile[]);
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
      }

      const { data: qData, error: qError } = await supabase
        .from('support_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (qError) throw qError;
      setQuestions(qData || []);

    } catch (err: any) {
      console.error("Admin Data Fetch Error:", err);
      setError(err.message || '관리자 데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      (u.name?.toLowerCase() || '').includes(userSearch.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(userSearch.toLowerCase())
    );
  }, [users, userSearch]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => 
      questionFilter === 'pending' ? !q.is_resolved : q.is_resolved
    );
  }, [questions, questionFilter]);

  const handleDeleteQuestion = async (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('관리자 권한으로 이 질문을 영구 삭제하시겠습니까?')) return;
    
    const originalQuestions = [...questions];
    setQuestions(prev => prev.filter(q => String(q.id) !== String(questionId)));

    try {
      const { data, error } = await supabase
        .from('support_questions')
        .delete()
        .eq('id', questionId)
        .select();
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error("관리자 권한 정책(RLS)에 의해 삭제가 거부되었습니다.");
      }
    } catch (err: any) {
      setQuestions(originalQuestions);
      console.error('Admin delete error:', err);
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('권한이 성공적으로 변경되었습니다.');
    } catch (err: any) {
      alert(`권한 변경 실패: ${err.message}`);
    }
  };

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBan, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentBan } : u));
      alert(`사용자 상태가 ${!currentBan ? '정지' : '활성화'}로 변경되었습니다.`);
    } catch (err: any) {
      alert(`상태 업데이트 실패: ${err.message}`);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answer = answerInputs[questionId];
    if (!answer?.trim()) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('support_questions')
        .update({ 
          answer: answer.trim(),
          is_resolved: true,
          answered_by: authUser?.id,
          answered_at: new Date().toISOString()
        })
        .eq('id', questionId);

      if (error) throw error;
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId 
        ? { ...q, is_resolved: true, answer: answer.trim(), answered_at: new Date().toISOString() } 
        : q
      ));

      setAnswerInputs(prev => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
      alert('답변이 전송되었습니다.');
    } catch (err: any) {
      alert(`답변 등록 실패: ${err.message}`);
    }
  };

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center gap-6">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-white">데이터 로드 실패</h2>
        <p className="text-gray-500">{error}</p>
        <button type="button" onClick={fetchAdminData} className="px-8 py-3 bg-[#007AFF] rounded-xl text-white font-bold flex items-center gap-2 cursor-pointer"><RefreshCw size={18} /> 다시 시도</button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      <header className="mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> System Admin Mode
          </div>
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-2 text-white">관리 센터</h2>
          <p className="text-gray-500 font-light">모든 학습자의 데이터 및 권한을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 glass rounded-2xl border-white/5 bg-white/5">
            <button type="button" onClick={() => setActiveTab('stats')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'stats' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>통계</button>
            <button type="button" onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>학습자</button>
            <button type="button" onClick={() => setActiveTab('questions')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'questions' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>질문</button>
          </div>
          <button type="button" onClick={fetchAdminData} className="p-4 glass rounded-2xl text-white hover:bg-white/10 transition-all border-white/5 cursor-pointer shadow-lg">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-[#007AFF]" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">데이터 연동 중...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <MotionDiv key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-[#007AFF]/10 to-transparent">
                <Users className="text-[#007AFF] mb-6" size={32} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">총 학습자</p>
                <h4 className="text-5xl font-black text-white tracking-tighter">{stats.totalUsers}</h4>
              </div>
              <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                <MessageCircle className="text-red-500 mb-6" size={32} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">대기 중인 질문</p>
                <h4 className="text-5xl font-black text-white tracking-tighter">{questions.filter(q => !q.is_resolved).length}</h4>
              </div>
              <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-green-500/10 to-transparent">
                <Activity className="text-green-500 mb-6" size={32} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">평균 진도율</p>
                <h4 className="text-5xl font-black text-white tracking-tighter">{stats.avgProgress}%</h4>
              </div>
              <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-purple-500/10 to-transparent">
                <BarChart3 className="text-purple-500 mb-6" size={32} />
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">평균 레벨</p>
                <h4 className="text-5xl font-black text-white tracking-tighter">Lv.{stats.avgLevel}</h4>
              </div>
            </MotionDiv>
          )}

          {activeTab === 'users' && (
            <MotionDiv key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="relative w-full sm:w-96 ml-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="이름 또는 이메일로 검색..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none" />
              </div>

              <div className="glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <tr>
                      <th className="px-8 py-6">학습자</th>
                      <th className="px-8 py-6">진도</th>
                      <th className="px-8 py-6">권한 설정</th>
                      <th className="px-8 py-6">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold">{user.name?.[0]}</div>
                            <div>
                              <p className="font-bold text-white">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8 text-sm font-mono text-gray-400">{user.progress}% (Lv.{user.level})</td>
                        <td className="px-8 py-8">
                          <select value={user.role || 'user'} onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)} className="bg-black border border-white/10 rounded-lg p-2 text-xs cursor-pointer text-white">
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-8 py-8">
                          <button type="button" onClick={() => handleToggleBan(user.id, user.is_banned || false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase cursor-pointer transition-all ${user.is_banned ? 'bg-red-500 text-white' : 'glass text-gray-500 hover:bg-white/10'}`}>
                            {user.is_banned ? '정지 해제' : '정지'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </MotionDiv>
          )}

          {activeTab === 'questions' && (
            <MotionDiv key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border-white/5 w-fit">
                <button type="button" onClick={() => setQuestionFilter('pending')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${questionFilter === 'pending' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500 hover:text-white'}`}>Pending</button>
                <button type="button" onClick={() => setQuestionFilter('resolved')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${questionFilter === 'resolved' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-500 hover:text-white'}`}>Resolved</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredQuestions.map(q => (
                  <MotionDiv layout key={q.id} className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01] flex flex-col gap-6 relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-bold text-white">{q.user_name?.[0]}</div>
                        <div>
                          <p className="font-bold text-white">{q.user_name}</p>
                          <p className="text-[10px] text-gray-600 font-mono">{new Date(q.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteQuestion(e, q.id)} 
                        className="p-3 text-gray-600 hover:text-red-500 transition-colors z-[100] cursor-pointer rounded-xl hover:bg-red-500/10 relative pointer-events-auto shadow-sm"
                        title="영구 삭제"
                      >
                        <Trash2 size={20} className="pointer-events-none" />
                      </button>
                    </div>

                    <div className="bg-black/40 p-6 rounded-2xl border border-white/5">
                      <p className="text-gray-300 leading-relaxed text-sm italic">"{q.content}"</p>
                    </div>

                    {!q.is_resolved ? (
                      <div className="space-y-4">
                        <textarea 
                          placeholder="답변을 작성하세요..."
                          value={answerInputs[q.id] || ''}
                          onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm outline-none focus:border-[#007AFF]/50 transition-all text-white"
                        />
                        <button type="button" onClick={() => handleSubmitAnswer(q.id)} disabled={!answerInputs[q.id]?.trim()} className="w-full py-3 bg-[#007AFF] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-[#007AFF]/80 transition-all disabled:opacity-30">
                          <Send size={14} className="pointer-events-none" /> 답변 전송
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 rounded-2xl glass-blue border-green-500/20 bg-green-500/[0.02]">
                        <FormattedText text={q.answer || ''} />
                      </div>
                    )}
                  </MotionDiv>
                ))}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
