
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Pin, Calendar, Loader2, Plus, X, Send, Trash2, AlertCircle, Database } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, Notice } from '../types';

const MotionDiv = motion.div as any;

interface NoticePageProps {
  user: UserProfile;
}

export const NoticePage: React.FC<NoticePageProps> = ({ user }) => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isWriteMode, setIsWriteMode] = useState(false);
  
  // 작성 폼 상태
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user.role === 'admin';

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('notices')
        .select('*')
        .order('is_important', { ascending: false })
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;
      setNotices(data || []);
    } catch (err: any) {
      console.error('Error fetching notices:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from('notices')
        .insert([
          {
            title: newTitle.trim(),
            content: newContent.trim(),
            is_important: isImportant,
            author_id: user.id
          }
        ]);

      if (insertError) throw insertError;
      
      setNewTitle('');
      setNewContent('');
      setIsImportant(false);
      setIsWriteMode(false);
      await fetchNotices();
      alert('공지사항이 성공적으로 등록되었습니다.');
    } catch (err: any) {
      console.error('Submit Error:', err);
      alert(`공지 등록 실패: ${err.message}\n\n도움말: SQL Editor에서 권한 설정(GRANT)을 확인하세요.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    try {
      const { data, error: deleteError } = await supabase
        .from('notices')
        .delete()
        .eq('id', id)
        .select();

      if (deleteError) throw deleteError;

      if (!data || data.length === 0) {
        throw new Error('데이터베이스 권한 정책(RLS)에 의해 삭제가 거부되었습니다. 관리자 권한을 확인하세요.');
      }

      setNotices(prev => prev.filter(n => n.id !== id));
      alert('삭제되었습니다.');
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}\n\n(참고: Supabase SQL Editor에서 DELETE 정책을 설정해야 합니다.)`);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto pb-32">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <Megaphone size={12} /> Latest Announcements
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-main">공지사항</h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            StepCode의 새로운 소식과 주요 업데이트 안내입니다.
          </p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsWriteMode(true)}
            className="p-4 bg-[#007AFF] text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={24} />
          </button>
        )}
      </header>

      {error && (
        <MotionDiv 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 glass border-red-500/30 bg-red-500/5 rounded-3xl flex items-center gap-4 text-red-500"
        >
          <AlertCircle size={24} />
          <div className="flex-1">
            <p className="font-bold text-sm">데이터베이스 접근 오류 (Error 42501)</p>
            <p className="text-xs opacity-70">Supabase SQL Editor에서 공지사항 테이블의 접근 권한(GRANT)을 설정해야 합니다.</p>
          </div>
          <button onClick={fetchNotices} className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">다시 시도</button>
        </MotionDiv>
      )}

      <AnimatePresence>
        {isWriteMode && (
          <MotionDiv 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="w-full max-w-2xl glass p-8 lg:p-10 rounded-[48px] border-white/10 bg-card shadow-3xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-main">새 공지 작성</h3>
                <button onClick={() => setIsWriteMode(false)} className="p-2 text-gray-500 hover:text-main transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="공지 제목을 입력하세요..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-main outline-none focus:border-[#007AFF]/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Content</label>
                  <textarea 
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="내용을 입력하세요..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-main outline-none focus:border-[#007AFF]/50 resize-none custom-scrollbar"
                    required
                  />
                </div>
                <div className="flex items-center gap-3 px-1">
                  <input 
                    type="checkbox" 
                    id="important" 
                    checked={isImportant}
                    onChange={e => setIsImportant(e.target.checked)}
                    className="accent-[#007AFF] w-4 h-4"
                  />
                  <label htmlFor="important" className="text-sm font-bold text-gray-400 cursor-pointer">중요 공지로 고정 (상단 노출)</label>
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim() || !newContent.trim()}
                  className="w-full py-5 bg-[#007AFF] text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 hover:bg-[#007AFF]/90 transition-all"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  공지 등록하기
                </button>
              </form>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-500">
            <Loader2 size={32} className="animate-spin text-[#007AFF]" />
            <p className="text-xs font-bold uppercase tracking-widest">데이터 로드 중...</p>
          </div>
        ) : notices.length > 0 ? (
          notices.map((notice) => (
            <MotionDiv 
              key={notice.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`glass p-8 lg:p-10 rounded-[40px] border-white/5 bg-white/[0.01] flex flex-col gap-6 relative group overflow-hidden ${notice.is_important ? 'border-l-4 border-l-[#007AFF]' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {notice.is_important && (
                      <span className="px-3 py-1 bg-[#007AFF]/10 text-[#007AFF] text-[10px] font-black uppercase tracking-widest rounded-full border border-[#007AFF]/20 flex items-center gap-1.5">
                        <Pin size={10} /> Important
                      </span>
                    )}
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={10} /> {new Date(notice.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl lg:text-2xl font-bold text-main">{notice.title}</h3>
                </div>
                {isAdmin && (
                  <button onClick={() => handleDelete(notice.id)} className="p-3 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={20} /></button>
                )}
              </div>
              <p className="text-gray-500 leading-relaxed font-light whitespace-pre-line text-base lg:text-lg">
                {notice.content}
              </p>
            </MotionDiv>
          ))
        ) : (
          <div className="py-32 text-center glass rounded-[48px] border-dashed border-white/5">
            {!error && (
              <>
                <Database size={48} className="mx-auto text-gray-700 mb-6" />
                <p className="text-gray-500 text-lg font-light">등록된 공지사항이 없습니다.</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
