
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, SupportQuestion } from '../types';

interface QuestionPageProps {
  user: UserProfile;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({ user }) => {
  const [content, setContent] = useState('');
  const [myQuestions, setMyQuestions] = useState<SupportQuestion[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMyQuestions = async () => {
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
  };

  useEffect(() => {
    fetchMyQuestions();
  }, [user.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      fetchMyQuestions();
    } catch (err) {
      alert('질문 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-5xl mx-auto pb-32">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
          <Sparkles size={12} /> Support Center
        </div>
        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">질문하기</h2>
        <p className="text-gray-500 text-lg font-light leading-relaxed">
          학습 중 궁금한 점이나 건의사항이 있으신가요?<br/>
          운영진이 확인 후 빠른 시일 내에 답변해 드립니다.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Question Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 lg:p-10 rounded-[40px] border-white/10 bg-white/[0.02] shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Message</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="궁금한 내용을 상세히 적어주세요..."
                className="w-full h-48 bg-black/40 border border-white/5 rounded-3xl p-6 text-sm text-gray-200 outline-none focus:border-[#007AFF]/50 transition-all resize-none custom-scrollbar"
                required
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-5 bg-[#007AFF] text-white rounded-2xl font-black shadow-2xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              질문 제출하기
            </button>
          </form>
        </motion.div>

        {/* My History */}
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-bold flex items-center gap-3"><MessageSquare size={20} className="text-[#007AFF]" /> 내 질문 내역</h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{myQuestions.length} Total</span>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-700">
                <Loader2 size={32} className="animate-spin" />
                <p className="text-sm font-bold">기록을 불러오는 중...</p>
              </div>
            ) : myQuestions.length > 0 ? (
              myQuestions.map((q, i) => (
                <motion.div 
                  key={q.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass p-6 rounded-3xl border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${q.is_resolved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {q.is_resolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {q.is_resolved ? '답변 완료' : '답변 대기 중'}
                    </div>
                    <span className="text-[10px] text-gray-700 font-mono">{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                    {q.content}
                  </p>
                </motion.div>
              ))
            ) : (
              <div className="py-20 glass rounded-3xl border-dashed border-white/5 flex flex-col items-center justify-center text-gray-700 gap-4">
                <AlertCircle size={40} />
                <p className="text-sm font-medium">아직 남긴 질문이 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
