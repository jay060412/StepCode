
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, CheckCircle2, 
  BarChart3, Loader2, RefreshCw, 
  MessageCircle, UserX, UserCheck, 
  Send, AlertCircle, Search, Filter, 
  MessageSquare, Info, Database, Lock, ShieldAlert
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SupportQuestion, UserProfile, UserRole } from '../types';
import { FormattedText } from './FormattedText';

// Fix for framer-motion intrinsic element type errors
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
        throw new Error(`프로필 로드 실패: ${profileError.message}\n(RLS SELECT 정책을 확인하세요)`);
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

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        alert(`권한 변경 실패: ${error.message}\n\n[해결 방법]\nSupabase SQL Editor에서 profiles 테이블의 UPDATE 정책을 활성화해야 합니다.`);
        return;
      }
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('사용자 권한이 성공적으로 변경되었습니다.');
    } catch (err: any) {
      alert(err.message || '권한 변경 실패');
    }
  };

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: !currentBan, updated_at: new Date().toISOString() })
        .eq('id', userId);
      
      if (error) {
        alert(`상태 업데이트 실패: ${error.message}\n\nSupabase RLS 정책 설정을 확인하세요.`);
        return;
      }

      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentBan } : u));
      alert(currentBan ? '제재가 해제되었습니다.' : '해당 사용자가 학습 정지 처리되었습니다.');
    } catch (err: any) {
      alert(err.message || '상태 업데이트 실패');
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
    } catch (err) {
      alert('답변 등록 실패');
    }
  };

  if (error) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center gap-6">
        <AlertCircle size={48} className="text-red-500" />
        <h2 className="text-2xl font-bold text-white">보안 정책 설정 필요</h2>
        <div className="max-w-md text-gray-500 space-y-4">
          <p>데이터베이스의 보안 정책(RLS)으로 인해 정보를 불러올 수 없습니다.</p>
          <div className="p-6 bg-white/5 rounded-2xl text-left text-xs font-mono border border-white/10 space-y-4">
            <p className="text-[#007AFF] font-bold"># 아래 명령어를 Supabase SQL Editor에 실행하세요:</p>
            <div className="space-y-1 opacity-80">
              <p>ALTER POLICY "Enable read for all authenticated" ON "public"."profiles"</p>
              <p>USING (true);</p>
              <br/>
              <p>ALTER POLICY "Enable update for all authenticated" ON "public"."profiles"</p>
              <p>USING (true) WITH CHECK (true);</p>
            </div>
          </div>
        </div>
        <button onClick={fetchAdminData} className="px-8 py-3 bg-[#007AFF] rounded-xl text-white font-bold flex items-center gap-2"><RefreshCw size={18} /> 다시 시도</button>
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
            <button onClick={() => setActiveTab('stats')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'stats' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>통계</button>
            <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>학습자 ({users.length})</button>
            <button onClick={() => setActiveTab('questions')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'questions' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>질문 ({questions.filter(q => !q.is_resolved).length})</button>
          </div>
          <button onClick={fetchAdminData} className="p-4 glass rounded-2xl text-white hover:bg-white/10 transition-all border-white/5">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-[#007AFF]" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">보안 데이터 연동 중...</p>
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
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-4">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="이름 또는 이메일로 검색..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none" />
                </div>
                <div className="flex items-center gap-2 text-yellow-500/80 text-[10px] font-bold uppercase">
                  <ShieldAlert size={14} /> 권한 변경이 작동하지 않으면 Supabase 정책을 업데이트하세요.
                </div>
              </div>

              <div className="glass rounded-[40px] border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                      <tr>
                        <th className="px-8 py-6">학습자</th>
                        <th className="px-8 py-6">진도</th>
                        <th className="px-8 py-6">권한 설정</th>
                        <th className="px-8 py-6">계정 상태</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers.length > 0 ? filteredUsers.map(user => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-8 py-8">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-xl ${user.is_banned ? 'bg-red-500/20 text-red-500' : 'bg-gradient-to-tr from-[#007AFF] to-cyan-400'}`}>
                                {user.name?.[0] || '?'}
                              </div>
                              <div>
                                <span className={`block font-bold text-lg leading-tight ${user.is_banned ? 'text-red-500 line-through opacity-50' : 'text-white'}`}>{user.name}</span>
                                <span className="text-xs text-gray-500 font-light">{user.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <div className="flex flex-col gap-1.5">
                               <div className="flex items-center gap-2">
                                  <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                     <div className="h-full bg-green-400" style={{ width: `${user.progress}%` }} />
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{user.progress}%</span>
                               </div>
                               <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Lv.{user.level}</span>
                            </div>
                          </td>
                          <td className="px-8 py-8">
                            <select 
                              value={user.role || 'user'} 
                              onChange={(e) => handleUpdateRole(user.id, e.target.value as UserRole)}
                              className="bg-black border border-white/10 rounded-xl text-[10px] font-black uppercase p-2.5 text-white outline-none focus:border-[#007AFF] transition-all cursor-pointer shadow-inner"
                            >
                              <option value="user">일반 학습자</option>
                              <option value="staff">운영진</option>
                              <option value="admin">최고 관리자</option>
                            </select>
                          </td>
                          <td className="px-8 py-8">
                            <button 
                              onClick={() => handleToggleBan(user.id, user.is_banned || false)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                user.is_banned 
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                                : 'glass text-gray-500 hover:text-red-400 border-white/10'
                              }`}
                            >
                              {user.is_banned ? <UserCheck size={14} /> : <Lock size={14} />}
                              {user.is_banned ? '정지 해제' : '학습 정지'}
                            </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-20 text-center text-gray-600 font-light">
                            데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </MotionDiv>
          )}

          {activeTab === 'questions' && (
            <MotionDiv key="questions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
              <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border-white/5 w-fit">
                <button onClick={() => setQuestionFilter('pending')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${questionFilter === 'pending' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-gray-500'}`}>Pending</button>
                <button onClick={() => setQuestionFilter('resolved')} className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${questionFilter === 'resolved' ? 'bg-green-500 text-black shadow-lg shadow-green-500/20' : 'text-gray-500'}`}>Resolved</button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredQuestions.length > 0 ? filteredQuestions.map(q => (
                  <MotionDiv 
                    layout
                    key={q.id} 
                    className={`glass p-8 lg:p-10 rounded-[48px] border-white/5 bg-white/[0.01] flex flex-col gap-8 group transition-all ${!q.is_resolved ? 'border-yellow-500/20 bg-yellow-500/[0.02]' : 'border-green-500/10'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white font-black text-lg border border-white/10">
                          {q.user_name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white leading-tight">{q.user_name}</p>
                          <p className="text-[10px] text-gray-600 font-mono tracking-tight">{new Date(q.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      {!q.is_resolved && (
                        <div className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-[10px] text-yellow-500 font-black uppercase tracking-widest">Waiting</div>
                      )}
                    </div>

                    <div className="bg-black/40 p-6 lg:p-8 rounded-3xl border border-white/5 relative shadow-inner">
                      <p className="text-gray-300 leading-relaxed text-base italic font-light">"{q.content}"</p>
                    </div>

                    {!q.is_resolved ? (
                      <div className="space-y-4">
                        <textarea 
                          placeholder="답변을 작성하세요..."
                          value={answerInputs[q.id] || ''}
                          onChange={(e) => setAnswerInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                          className="w-full h-40 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-gray-200 outline-none focus:border-[#007AFF] transition-all resize-none custom-scrollbar"
                        />
                        <button 
                          onClick={() => handleSubmitAnswer(q.id)}
                          disabled={!answerInputs[q.id]?.trim()}
                          className="w-full py-4 bg-[#007AFF] text-white rounded-2xl text-xs font-black flex items-center gap-3 shadow-2xl shadow-[#007AFF]/30 disabled:opacity-30"
                        >
                          <Send size={16} /> 답변 전송
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 lg:p-8 rounded-3xl glass-blue border-green-500/20 bg-green-500/[0.02] relative">
                        <div className="text-sm text-gray-400 leading-relaxed">
                           <FormattedText text={q.answer || ''} />
                        </div>
                      </div>
                    )}
                  </MotionDiv>
                )) : (
                  <div className="col-span-full py-40 flex flex-col items-center justify-center text-center gap-6 glass rounded-[64px] border-dashed border-white/5">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-gray-700">
                      <Filter size={32} />
                    </div>
                    <p className="text-gray-500 text-xl font-light">해당하는 질문이 없습니다.</p>
                  </div>
                )}
              </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
