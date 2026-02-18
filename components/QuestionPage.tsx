
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Bot, ShieldAlert, Trash2, Edit3, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, SupportQuestion } from '../types';
import { FormattedText } from './FormattedText';

const MotionDiv = motion.div as any;

interface QuestionPageProps {
  user: UserProfile;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({ user }) => {
  const [content, setContent] = useState('');
  const [myQuestions, setMyQuestions] = useState<SupportQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const fetchMyQuestions = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyQuestions(data || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchMyQuestions();
  }, [fetchMyQuestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.is_banned) {
      alert('접근이 제한된 계정입니다. 질문을 등록할 수 없습니다.');
      return;
    }
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('support_questions').insert([
        {
          user_id: user.id,
          user_name: user.name,
          content: content.trim(),
          is_resolved: false
        }
      ]);

      if (error) throw error;
      setContent('');
      await fetchMyQuestions();
    } catch (err: any) {
      alert(`질문 등록에 실패했습니다: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, questionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('정말로 이 질문을 삭제하시겠습니까?')) return;
    
    const originalQuestions = [...myQuestions];
    setMyQuestions(prev => prev.filter(q => String(q.id) !== String(questionId)));
    
    try {
      // .select()를 붙이면 실제로 삭제된 데이터를 반환받으려 시도합니다.
      // 반환된 데이터가 없다면 RLS에 의해 차단된 것입니다.
      const { data, error, status } = await supabase
        .from('support_questions')
        .delete()
        .eq('id', questionId)
        .select();
        
      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error("데이터베이스 권한 정책(RLS)에 의해 삭제가 거부되었습니다. 본인의 글이 맞는지 확인해주세요.");
      }
      
      console.log('Successfully deleted:', questionId);
    } catch (err: any) {
      setMyQuestions(originalQuestions);
      console.error('Delete failed:', err);
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleStartEdit = (e: React.MouseEvent, q: SupportQuestion) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingId(q.id);
    setEditContent(q.content);
  };

  const handleUpdate = async (questionId: string) => {
    if (!editContent.trim()) return;
    try {
      const { error } = await supabase
        .from('support_questions')
        .update({ content: editContent.trim() })
        .eq('id', questionId);
      if (error) throw error;
      
      setMyQuestions(prev => prev.map(q => q.id === questionId ? { ...q, content: editContent.trim() } : q));
      setEditingId(null);
      alert('질문이 수정되었습니다.');
    } catch (err: any) {
      alert(`수정에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto pb-32">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles size={12} /> Support & Feedback
        </div>
        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-white">질문하기</h2>
        <p className="text-gray-500 text-lg font-light leading-relaxed">
          운영진이 확인 후 빠른 시일 내에 답변해 드립니다.
        </p>
      </header>

      {user.is_banned && (
        <div className="mb-12 p-8 glass-blue border-red-500/30 bg-red-500/5 rounded-[32px] flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-red-500 mb-1">질문 권한이 제한되었습니다</h4>
            <p className="text-sm text-gray-500">커뮤니티 가이드라인 준수 위반으로 인해 활동이 제한된 상태입니다.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 lg:p-10 rounded-[40px] border-white/10 bg-white/[0.02] shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">New Message</label>
              <textarea 
                value={content}
                disabled={user.is_banned}
                onChange={(e) => setContent(e.target.value)}
                placeholder={user.is_banned ? "질문 권한이 없습니다." : "궁금한 내용을 상세히 적어주세요..."}
                className="w-full h-48 bg-black/40 border border-white/5 rounded-3xl p-6 text-sm text-gray-200 outline-none focus:border-[#007AFF]/50 transition-all resize-none custom-scrollbar disabled:opacity-50"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !content.trim() || user.is_banned}
              className="w-full py-5 bg-[#007AFF] text-white rounded-2xl font-black shadow-2xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              질문 제출하기
            </button>
          </form>
        </MotionDiv>

        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-3 text-white"><MessageSquare size={20} className="text-[#007AFF]" /> 내 질문 내역</h3>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-700">
                <Loader2 size={32} className="animate-spin text-[#007AFF]" />
              </div>
            ) : myQuestions.length > 0 ? (
              myQuestions.map((q) => (
                <MotionDiv 
                  key={q.id}
                  layout
                  className="glass p-6 lg:p-8 rounded-[32px] border-white/5 bg-white/[0.01] flex flex-col gap-4 relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${q.is_resolved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {q.is_resolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {q.is_resolved ? '답변 완료' : '답변 대기 중'}
                    </div>
                    <div className="flex items-center gap-1 relative z-[100]">
                      {!q.is_resolved && editingId !== q.id && (
                        <button 
                          type="button"
                          onClick={(e) => handleStartEdit(e, q)} 
                          className="p-3 text-gray-500 hover:text-[#007AFF] transition-all cursor-pointer rounded-lg hover:bg-white/5 pointer-events-auto"
                          title="수정"
                        >
                          <Edit3 size={16} className="pointer-events-none" />
                        </button>
                      )}
                      <button 
                        type="button"
                        onClick={(e) => handleDelete(e, q.id)} 
                        className="p-3 text-gray-500 hover:text-red-500 transition-all cursor-pointer rounded-lg hover:bg-red-500/10 pointer-events-auto shadow-sm"
                        title="삭제"
                      >
                        <Trash2 size={16} className="pointer-events-none" />
                      </button>
                    </div>
                  </div>

                  {editingId === q.id ? (
                    <div className="space-y-4">
                      <textarea 
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-32 bg-black/40 border border-[#007AFF]/30 rounded-2xl p-4 text-sm text-white outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 glass rounded-xl text-xs font-bold text-gray-500 cursor-pointer">취소</button>
                        <button type="button" onClick={() => handleUpdate(q.id)} className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"><Save size={12} /> 저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 font-light italic bg-black/20 p-4 rounded-xl border border-white/5">"{q.content}"</p>
                  )}
                  
                  {q.is_resolved && q.answer && (
                    <div className="mt-4 p-5 lg:p-6 glass-blue border-[#007AFF]/20 bg-[#007AFF]/5 rounded-[24px]">
                      <div className="flex items-center gap-2 mb-3 text-[#007AFF] text-xs font-black uppercase tracking-widest">
                        <Bot size={16} /> Admin Response
                      </div>
                      <div className="text-sm text-gray-200 leading-relaxed">
                        <FormattedText text={q.answer} />
                      </div>
                    </div>
                  )}
                </MotionDiv>
              ))
            ) : (
              <div className="py-20 text-center text-gray-700 italic glass rounded-[32px] border-dashed border-white/5">
                남긴 질문이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
