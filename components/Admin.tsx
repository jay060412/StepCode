
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, Users, Activity, CheckCircle2, 
  BarChart3, Loader2, RefreshCw, 
  MessageCircle, UserX, UserCheck, 
  Send, AlertCircle, Search, Filter, 
  MessageSquare, Info, Database, Lock, ShieldAlert, Trash2,
  ExternalLink, HelpCircle, Inbox, CheckCircle, Settings
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
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'questions' | 'system'>('stats');
  const [userSearch, setUserSearch] = useState('');
  const [questionSubTab, setQuestionSubTab] = useState<'pending' | 'resolved'>('pending');
  const [answerInputs, setAnswerInputs] = useState<Record<string, string>>({});

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. 정확한 총 학습자 수 카운트 (Profiles 테이블 기준)
      const { count: totalCount, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // 2. 모든 학습자 프로필 로드
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileError) {
        throw new Error(`프로필 로드 실패: ${profileError.message}`);
      }

      if (profiles) {
        const profileList = profiles as UserProfile[];
        setUsers(profileList);
        
        const total = totalCount || profileList.length;
        const sumProgress = profileList.reduce((acc, curr) => acc + (Number(curr.progress) || 0), 0);
        const sumLevel = profileList.reduce((acc, curr) => acc + (Number(curr.level) || 1), 0);
        
        const todayStr = new Date().toISOString().split('T')[0];
        const activeTodayCount = profileList.filter(p => p.updated_at && p.updated_at.startsWith(todayStr)).length;

        setStats({
          totalUsers: total,
          avgProgress: profileList.length > 0 ? Math.round(sumProgress / profileList.length) : 0,
          avgLevel: profileList.length > 0 ? Number((sumLevel / profileList.length).toFixed(1)) : 1,
          activeToday: activeTodayCount
        });
      }

      // 지원 질문 로드
      const { data: qData, error: qError } = await supabase
        .from('support_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (qError) throw qError;
      setQuestions(qData || []);

    } catch (err: any) {
      console.error("Admin Data Fetch Error:", err);
      setError(err.message || '데이터 연동 중 오류 발생');
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

  // 질문 필터링 로직
  const pendingQuestions = useMemo(() => questions.filter(q => !q.is_resolved), [questions]);
  const resolvedQuestions = useMemo(() => questions.filter(q => q.is_resolved), [questions]);
  const displayQuestions = questionSubTab === 'pending' ? pendingQuestions : resolvedQuestions;

  const handleDeleteQuestion = async (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    if (!window.confirm('질문을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('support_questions').delete().eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      alert('권한이 변경되었습니다.');
    } catch (err: any) {
      alert(`권한 변경 실패: ${err.message}`);
    }
  };

  const handleToggleBan = async (userId: string, currentBan: boolean) => {
    try {
      const { error } = await supabase.from('profiles').update({ is_banned: !currentBan }).eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentBan } : u));
    } catch (err: any) {
      alert(`상태 변경 실패: ${err.message}`);
    }
  };

  const handleSubmitAnswer = async (questionId: string) => {
    const answer = answerInputs[questionId];
    if (!answer?.trim()) return;
    try {
      const { error } = await supabase.from('support_questions').update({ 
        answer: answer.trim(), is_resolved: true, answered_at: new Date().toISOString() 
      }).eq('id', questionId);
      if (error) throw error;
      setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, is_resolved: true, answer: answer.trim() } : q));
      setAnswerInputs(prev => { const n = {...prev}; delete n[questionId]; return n; });
    } catch (err: any) {
      alert(`답변 등록 실패: ${err.message}`);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-7xl mx-auto pb-32">
      <header className="mb-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <ShieldCheck size={12} /> System Admin Mode
          </div>
          <h2 className="text-4xl lg:text-7xl font-black tracking-tighter mb-2 text-white">관리 센터</h2>
          <p className="text-gray-500 font-light">전체 학습 데이터 및 시스템 정책을 관리합니다.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 glass rounded-2xl border-white/5 bg-white/5">
            <button type="button" onClick={() => setActiveTab('stats')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'stats' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>통계</button>
            <button type="button" onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>학습자</button>
            <button type="button" onClick={() => setActiveTab('questions')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'questions' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`}>질문</button>
            <button type="button" onClick={() => setActiveTab('system')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'system' ? 'bg-[#007AFF] text-white shadow-lg' : 'text-gray-500'}`} title="시스템 진단"><HelpCircle size={14} /></button>
          </div>
          <button type="button" onClick={fetchAdminData} className="p-4 glass rounded-2xl text-white hover:bg-white/10 transition-all border-white/5 cursor-pointer shadow-lg">
            <RefreshCw size={20} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-6">
          <Loader2 className="animate-spin text-[#007AFF]" size={48} />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">DB 연동 상태 확인 중...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* 유저 카운트 불일치 안내 배지 (3명인데 2명인 현상 대응) */}
              {stats.totalUsers < 3 && (
                <MotionDiv initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-6 glass border-yellow-500/30 bg-yellow-500/5 rounded-3xl flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0"><AlertCircle size={20} /></div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-yellow-500">데이터 불일치 감지</p>
                      <p className="text-xs text-gray-400 leading-relaxed">Supabase Auth에는 3명이 있지만, 프로필 테이블에는 {stats.totalUsers}명만 등록되어 있습니다. 해당 유저가 처음 로그인을 완료해야 프로필이 생성되어 여기에 집계됩니다.</p>
                   </div>
                </MotionDiv>
              )}

              <MotionDiv key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-[#007AFF]/10 to-transparent">
                  <Users className="text-[#007AFF] mb-6" size={32} />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">총 학습자 (프로필)</p>
                  <h4 className="text-5xl font-black text-white tracking-tighter">{stats.totalUsers}</h4>
                </div>
                <div className="glass p-10 rounded-[40px] border-white/5 bg-gradient-to-br from-red-500/10 to-transparent">
                  <MessageCircle className="text-red-500 mb-6" size={32} />
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">답변 대기 중</p>
                  <h4 className="text-5xl font-black text-white tracking-tighter">{pendingQuestions.length}</h4>
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
            </div>
          )}

          {activeTab === 'users' && (
            <MotionDiv key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              <div className="relative w-full sm:w-96 ml-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="검색..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none" />
              </div>

              <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <tr><th className="px-8 py-6">학습자</th><th className="px-8 py-6">진도</th><th className="px-8 py-6">권한</th><th className="px-8 py-6">상태</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-8"><p className="font-bold text-main">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                        <td className="px-8 py-8 text-sm font-mono text-gray-400">{u.progress}% (Lv.{u.level})</td>
                        <td className="px-8 py-8">
                          <select value={u.role || 'user'} onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)} className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white outline-none">
                            <option value="user">User</option><option value="staff">Staff</option><option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-8 py-8">
                          <button onClick={() => handleToggleBan(u.id, u.is_banned || false)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${u.is_banned ? 'bg-red-500 text-white' : 'glass text-gray-500 hover:bg-white/10'}`}>
                            {u.is_banned ? 'Banned' : 'Active'}
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
              {/* 질문 세부 탭 메뉴 */}
              <div className="flex items-center gap-2 p-1.5 glass rounded-2xl border-white/5 w-fit bg-white/5">
                <button 
                  onClick={() => setQuestionSubTab('pending')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${questionSubTab === 'pending' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Inbox size={14} /> 답변 대기 ({pendingQuestions.length})
                </button>
                <button 
                  onClick={() => setQuestionSubTab('resolved')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${questionSubTab === 'resolved' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <CheckCircle size={14} /> 답변 완료 ({resolvedQuestions.length})
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {displayQuestions.length === 0 ? (
                  <div className="col-span-full py-32 text-center glass rounded-[48px] border-dashed border-white/5">
                    <MessageSquare size={48} className="mx-auto text-gray-800 mb-4 opacity-20" />
                    <p className="text-gray-500">해당하는 질문이 없습니다.</p>
                  </div>
                ) : (
                  displayQuestions.map(q => (
                    <div key={q.id} className={`glass p-8 rounded-[40px] border-white/5 flex flex-col gap-6 relative transition-all group overflow-hidden ${q.is_resolved ? 'bg-green-500/[0.02]' : 'bg-orange-500/[0.02]'}`}>
                      <div className="flex justify-between items-start relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${q.is_resolved ? 'bg-green-600' : 'bg-orange-500'}`}>
                            {q.user_name?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-white">{q.user_name}</p>
                            <p className="text-[10px] text-gray-500">{new Date(q.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <button onClick={(e) => handleDeleteQuestion(e, q.id)} className="p-3 text-gray-700 hover:text-red-500 transition-colors cursor-pointer rounded-xl hover:bg-red-500/10"><Trash2 size={20} /></button>
                      </div>
                      
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 relative z-10 shadow-inner">
                        <p className="text-gray-300 text-sm leading-relaxed italic">"{q.content}"</p>
                      </div>

                      <div className="relative z-10">
                        {!q.is_resolved ? (
                          <div className="space-y-4">
                            <textarea 
                              placeholder="학습자에게 도움을 줄 답변을 입력하세요..." 
                              value={answerInputs[q.id] || ''} 
                              onChange={e => setAnswerInputs(prev => ({...prev, [q.id]: e.target.value}))} 
                              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-orange-500/50 transition-all custom-scrollbar" 
                            />
                            <button onClick={() => handleSubmitAnswer(q.id)} disabled={!answerInputs[q.id]?.trim()} className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-black shadow-xl transition-all disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2">
                              <Send size={14} /> 답변 전송하기
                            </button>
                          </div>
                        ) : (
                          <div className="p-6 rounded-2xl glass-blue border-green-500/20 bg-green-500/[0.03] shadow-lg">
                            <div className="flex items-center gap-2 mb-3 text-green-400 text-[10px] font-black uppercase tracking-widest">
                              <ShieldCheck size={14} /> Answered by Admin
                            </div>
                            <div className="text-sm text-gray-300 leading-relaxed"><FormattedText text={q.answer || ''} /></div>
                          </div>
                        )}
                      </div>

                      {/* 배경 데코레이션 */}
                      <div className={`absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none ${q.is_resolved ? 'text-green-500' : 'text-orange-500'}`}>
                        {q.is_resolved ? <CheckCircle size={160} /> : <Inbox size={160} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </MotionDiv>
          )}

          {activeTab === 'system' && (
            <MotionDiv key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
               {/* 테마 오류 해결 가이드 추가 */}
               <div className="p-10 glass rounded-[48px] border-white/10 bg-gradient-to-br from-[#007AFF]/10 to-transparent">
                  <div className="flex items-center gap-4 mb-6">
                    <Settings className="text-[#007AFF]" size={32} />
                    <h3 className="text-2xl font-black text-white">'theme' 컬럼 오류 해결 (Schema Cache)</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    신규 기능인 화면 테마(라이트/다크)를 사용하기 위해 데이터베이스에 새로운 컬럼이 필요합니다.<br/>
                    Supabase <strong>SQL Editor</strong>에 아래 코드를 복사하여 실행하면 즉시 해결됩니다.
                  </p>
                  
                  <div className="bg-black/60 p-6 rounded-2xl font-mono text-xs text-green-400 border border-white/5 mb-8 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
{`-- 테마 및 설정 컬럼 추가
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme text DEFAULT 'dark';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{"push": true, "email": false, "browser": true}'::jsonb;`}
                    </pre>
                  </div>
                  
                  <a href="https://supabase.com/dashboard/project/cysrtusjyexbhlzmrhgl/sql/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 active:scale-95">
                    Supabase SQL Editor 열기 <ExternalLink size={14} />
                  </a>
               </div>

               <div className="p-10 glass rounded-[48px] border-white/10 bg-gradient-to-br from-yellow-500/10 to-transparent">
                  <div className="flex items-center gap-4 mb-6">
                    <ShieldAlert className="text-yellow-500" size={32} />
                    <h3 className="text-2xl font-black text-white">학습자 수 불일치 해결 가이드</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed mb-8">
                    Supabase <strong>Auth</strong>에는 사용자가 있지만 <strong>Profiles</strong> 테이블에 정보가 없는 경우, 해당 사용자가 아직 한 번도 서비스를 시작하지 않았음을 의미합니다.<br/>
                    관리자 계정(`jay447233@gmail.com`)이 모든 프로필을 강제 조회할 수 있도록 아래 SQL을 실행하세요.
                  </p>
                  
                  <div className="bg-black/60 p-6 rounded-2xl font-mono text-xs text-cyan-400 border border-white/5 mb-8 overflow-x-auto">
                    <pre className="whitespace-pre-wrap">
{`-- 관리자(Admin)가 모든 프로필을 볼 수 있도록 RLS 수정
DROP POLICY IF EXISTS "관리자는 모든 프로필 열람 가능" ON profiles;
CREATE POLICY "관리자는 모든 프로필 열람 가능" 
ON profiles FOR SELECT 
TO authenticated 
USING (
  (auth.jwt() ->> 'email' = 'jay447233@gmail.com')
  OR (auth.uid() = id)
);`}
                    </pre>
                  </div>
                  
                  <div className="flex gap-4">
                    <a href="https://supabase.com/dashboard/project/cysrtusjyexbhlzmrhgl/sql/new" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-white transition-all shadow-lg">
                      Supabase SQL Editor 열기 <ExternalLink size={14} />
                    </a>
                    <button onClick={fetchAdminData} className="px-6 py-3 bg-[#007AFF] text-white rounded-xl text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all">데이터 다시 로드</button>
                  </div>
               </div>
            </MotionDiv>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
