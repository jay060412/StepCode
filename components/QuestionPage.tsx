
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, Clock, CheckCircle2, AlertCircle, Loader2, Sparkles, Bot, ShieldAlert, Trash2, Edit3, X, Save, Plus, Users, Shield, CornerDownRight, Reply } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { UserProfile, SupportQuestion, CommunityQuestion, CommunityComment } from '../types';
import { FormattedText } from './FormattedText';

const MotionDiv = motion.div as any;

interface QuestionPageProps {
  user: UserProfile;
}

export const QuestionPage: React.FC<QuestionPageProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'support' | 'community'>('community');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  // Data states
  const [mySupportQuestions, setMySupportQuestions] = useState<SupportQuestion[]>([]);
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  const [comments, setComments] = useState<Record<string, CommunityComment[]>>({});
  
  // Comment input states
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<{questionId: string, commentId: string | null} | null>(null);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Detail view state
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const fetchComments = async (questionId: string) => {
    try {
      const { data, error } = await supabase
        .from('community_comments')
        .select('*')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      setComments(prev => ({ ...prev, [questionId]: data || [] }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'support') {
        const { data, error } = await supabase
          .from('support_questions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setMySupportQuestions(data || []);
      } else {
        const { data, error } = await supabase
          .from('community_questions')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Error fetching community questions:', error);
          throw error;
        }
        setCommunityQuestions(data || []);
        
        // Fetch comments for all questions
        if (data) {
          for (const q of data) {
            fetchComments(q.id);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user.id, activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.is_banned) {
      alert('접근이 제한된 계정입니다. 질문을 등록할 수 없습니다.');
      return;
    }
    if (!content.trim() || (activeTab === 'community' && !title.trim()) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (activeTab === 'support') {
        const { error } = await supabase.from('support_questions').insert([
          {
            user_id: user.id,
            user_name: user.name || 'Anonymous',
            content: content.trim(),
            is_resolved: false
          }
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('community_questions').insert([
          {
            user_id: user.id,
            user_name: user.name || 'Anonymous',
            title: title.trim(),
            content: content.trim()
          }
        ]);
        if (error) {
          console.error('Community Question Insert Error:', error);
          throw error;
        }
      }

      setTitle('');
      setContent('');
      setIsModalOpen(false);
      await fetchData();
      alert('질문이 성공적으로 등록되었습니다.');
    } catch (err: any) {
      console.error('Submission Error:', err);
      alert(`질문 등록에 실패했습니다: ${err.message || '알 수 없는 오류가 발생했습니다.'}\n\n(참고: 데이터베이스에 community_questions 테이블이 생성되어 있는지 확인해주세요.)`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentSubmit = async (questionId: string) => {
    const commentContent = commentInputs[questionId];
    if (!commentContent?.trim()) return;

    try {
      const { error } = await supabase.from('community_comments').insert([
        {
          question_id: questionId,
          user_id: user.id,
          user_name: user.name || 'Anonymous',
          content: commentContent.trim(),
          parent_id: replyingTo?.questionId === questionId ? replyingTo.commentId : null
        }
      ]);
      if (error) throw error;

      setCommentInputs(prev => ({ ...prev, [questionId]: '' }));
      setReplyingTo(null);
      await fetchComments(questionId);
    } catch (err: any) {
      alert(`댓글 등록 실패: ${err.message}`);
    }
  };

  const handleDelete = async (questionId: string, table: 'support_questions' | 'community_questions') => {
    if (!window.confirm('정말로 이 질문을 삭제하시겠습니까?')) return;
    
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', questionId);
        
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert(`삭제 실패: ${err.message}`);
    }
  };

  const handleDeleteComment = async (commentId: string, questionId: string) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    try {
      const { error } = await supabase.from('community_comments').delete().eq('id', commentId);
      if (error) throw error;
      await fetchComments(questionId);
    } catch (err: any) {
      alert(`댓글 삭제 실패: ${err.message}`);
    }
  };

  const handleStartEdit = (q: any) => {
    setEditingId(q.id);
    setEditTitle(q.title || '');
    setEditContent(q.content);
  };

  const handleUpdate = async (questionId: string, table: 'support_questions' | 'community_questions') => {
    if (!editContent.trim() || (table === 'community_questions' && !editTitle.trim())) return;
    try {
      const updateData: any = { content: editContent.trim(), updated_at: new Date().toISOString() };
      if (table === 'community_questions') updateData.title = editTitle.trim();

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('id', questionId);
      if (error) throw error;
      
      setEditingId(null);
      await fetchData();
      alert('수정되었습니다.');
    } catch (err: any) {
      alert(`수정에 실패했습니다: ${err.message}`);
    }
  };

  return (
    <div className="p-6 lg:p-12 max-w-6xl mx-auto pb-32">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest mb-4">
            <Sparkles size={12} /> Community & Support
          </div>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-white">질문하기</h2>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            {activeTab === 'community' ? '다른 학습자들과 질문을 공유하고 함께 성장하세요.' : '운영진에게 1:1 문의를 남겨주세요.'}
          </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-[#007AFF] text-white rounded-2xl font-black shadow-2xl shadow-[#007AFF]/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 cursor-pointer"
        >
          <Plus size={20} /> 질문 남기기
        </button>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-12 p-1.5 glass rounded-[24px] border-white/5 w-fit">
        <button 
          onClick={() => setActiveTab('community')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'community' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Users size={18} /> 유저에게 질문하기
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'support' ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <Shield size={18} /> 관리자에게 질문하기
        </button>
      </div>

      {user.is_banned && (
        <div className="mb-12 p-8 glass border-red-500/30 bg-red-500/5 rounded-[32px] flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h4 className="text-xl font-bold text-red-500 mb-1">질문 권한이 제한되었습니다</h4>
            <p className="text-sm text-gray-500">커뮤니티 가이드라인 준수 위반으로 인해 활동이 제한된 상태입니다.</p>
          </div>
        </div>
      )}

      {/* List Content */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-4">
            <Loader2 size={48} className="animate-spin text-[#007AFF]" />
            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">데이터 불러오는 중...</p>
          </div>
        ) : activeTab === 'community' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {communityQuestions.length > 0 ? (
              communityQuestions.map((q) => (
                <MotionDiv 
                  key={q.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedQuestionId(q.id)}
                  className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex flex-col gap-6 group cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center font-bold">
                        {q.user_name[0]}
                      </div>
                      <div>
                        <p className="text-white font-bold">{q.user_name}</p>
                        <p className="text-[10px] text-gray-500">{new Date(q.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {q.user_id === user.id && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleStartEdit(q)} className="p-2 text-gray-500 hover:text-[#007AFF] transition-all cursor-pointer"><Edit3 size={16} /></button>
                        <button onClick={() => handleDelete(q.id, 'community_questions')} className="p-2 text-gray-500 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 relative z-10">
                    <h4 className="text-xl font-bold text-white leading-tight line-clamp-1">{q.title}</h4>
                    <p className="text-sm text-gray-400 font-light line-clamp-2 leading-relaxed">{q.content}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 relative z-10">
                    <div className="flex items-center gap-2 text-[#007AFF] text-[10px] font-black uppercase tracking-widest">
                      <MessageSquare size={14} /> 답변 {comments[q.id]?.length || 0}
                    </div>
                    <div className="text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors">자세히 보기 →</div>
                  </div>
                </MotionDiv>
              ))
            ) : (
              <div className="col-span-full py-32 text-center glass rounded-[48px] border-dashed border-white/5">
                <p className="text-gray-500 italic">등록된 커뮤니티 질문이 없습니다.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {mySupportQuestions.length > 0 ? (
              mySupportQuestions.map((q) => (
                <MotionDiv 
                  key={q.id}
                  layout
                  className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01] flex flex-col gap-6"
                >
                  <div className="flex justify-between items-start">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${q.is_resolved ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                      {q.is_resolved ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {q.is_resolved ? '답변 완료' : '답변 대기 중'}
                    </div>
                    <div className="flex items-center gap-1">
                      {!q.is_resolved && editingId !== q.id && (
                        <button onClick={() => handleStartEdit(q)} className="p-2 text-gray-500 hover:text-[#007AFF] transition-all cursor-pointer"><Edit3 size={16} /></button>
                      )}
                      <button onClick={() => handleDelete(q.id, 'support_questions')} className="p-2 text-gray-500 hover:text-red-500 transition-all cursor-pointer"><Trash2 size={16} /></button>
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
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 glass rounded-xl text-xs font-bold text-gray-500 cursor-pointer">취소</button>
                        <button onClick={() => handleUpdate(q.id, 'support_questions')} className="px-4 py-2 bg-[#007AFF] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"><Save size={12} /> 저장</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-300 font-light italic bg-black/20 p-6 rounded-2xl border border-white/5">"{q.content}"</p>
                  )}
                  
                  {q.is_resolved && q.answer && (
                    <div className="p-8 glass-blue border-[#007AFF]/20 bg-[#007AFF]/5 rounded-[32px]">
                      <div className="flex items-center gap-2 mb-4 text-[#007AFF] text-[10px] font-black uppercase tracking-widest">
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
              <div className="py-32 text-center glass rounded-[48px] border-dashed border-white/5">
                <p className="text-gray-500 italic">남긴 1:1 문의가 없습니다.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <MotionDiv 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl glass p-8 lg:p-12 rounded-[48px] border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white transition-all cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="mb-10">
                <h3 className="text-3xl font-black text-white tracking-tighter mb-2">
                  {activeTab === 'community' ? '커뮤니티 질문하기' : '관리자에게 문의하기'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {activeTab === 'community' ? '다른 유저들과 공유하고 싶은 질문을 남겨주세요.' : '운영진에게만 전달되는 비공개 문의입니다.'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'community' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Title</label>
                    <input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="질문의 핵심 내용을 제목으로 적어주세요"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-sm text-white outline-none focus:border-[#007AFF]/50 transition-all"
                      required
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Content</label>
                  <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="궁금한 내용을 상세히 적어주세요..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm text-white outline-none focus:border-[#007AFF]/50 transition-all resize-none custom-scrollbar"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting || !content.trim() || (activeTab === 'community' && !title.trim())}
                  className="w-full py-6 bg-[#007AFF] text-white rounded-2xl font-black shadow-2xl shadow-[#007AFF]/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 flex items-center justify-center gap-3 cursor-pointer mt-4"
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  질문 제출하기
                </button>
              </form>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>

      {/* Community Question Detail Modal */}
      <AnimatePresence>
        {selectedQuestionId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
            <MotionDiv 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedQuestionId(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <MotionDiv 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl glass p-8 lg:p-12 rounded-[48px] border-white/10 bg-[#0a0a0a] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <button 
                onClick={() => setSelectedQuestionId(null)}
                className="absolute top-8 right-8 p-3 text-gray-500 hover:text-white transition-all cursor-pointer z-50"
              >
                <X size={24} />
              </button>

              <div className="overflow-y-auto custom-scrollbar pr-4">
                {communityQuestions.find(q => q.id === selectedQuestionId) && (
                  <div className="space-y-10">
                    {/* Question Header */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#007AFF]/20 text-[#007AFF] flex items-center justify-center font-black text-2xl shadow-lg">
                        {communityQuestions.find(q => q.id === selectedQuestionId)!.user_name[0]}
                      </div>
                      <div>
                        <p className="text-white font-black text-xl">{communityQuestions.find(q => q.id === selectedQuestionId)!.user_name}</p>
                        <p className="text-xs text-gray-500 font-medium">{new Date(communityQuestions.find(q => q.id === selectedQuestionId)!.created_at).toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="space-y-6">
                      <h3 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                        {communityQuestions.find(q => q.id === selectedQuestionId)!.title}
                      </h3>
                      <div className="bg-white/[0.02] p-8 rounded-[32px] border border-white/5">
                        <p className="text-gray-300 text-lg font-light leading-relaxed whitespace-pre-wrap">
                          {communityQuestions.find(q => q.id === selectedQuestionId)!.content}
                        </p>
                      </div>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-8 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <MessageSquare size={24} className="text-[#007AFF]" />
                        <h5 className="text-xl font-bold text-white">답변 {comments[selectedQuestionId]?.length || 0}</h5>
                      </div>

                      <div className="space-y-6 pl-2 lg:pl-8 border-l-2 border-white/5">
                        {comments[selectedQuestionId]?.map((c) => (
                          <div key={c.id} className={`flex flex-col gap-3 ${c.parent_id ? 'ml-10 mt-2' : ''}`}>
                            <div className="flex items-start gap-4 group">
                              {c.parent_id && <CornerDownRight size={20} className="text-gray-600 mt-2 shrink-0" />}
                              <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                {c.user_name[0]}
                              </div>
                              <div className="flex-1 bg-white/[0.03] p-5 rounded-3xl border border-white/5 group-hover:bg-white/[0.05] transition-all">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-bold text-[#007AFF]">{c.user_name}</span>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600">{new Date(c.created_at).toLocaleString()}</span>
                                    {c.user_id === user.id && (
                                      <button onClick={() => handleDeleteComment(c.id, selectedQuestionId)} className="text-gray-600 hover:text-red-500 transition-colors cursor-pointer"><Trash2 size={14} /></button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-base text-gray-300 font-light leading-relaxed">{c.content}</p>
                                {!c.parent_id && (
                                  <button 
                                    onClick={() => setReplyingTo({questionId: selectedQuestionId, commentId: c.id})}
                                    className="mt-3 text-xs font-bold text-gray-500 hover:text-[#007AFF] flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <Reply size={14} /> 답글 달기
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Comment Input */}
                      <div className="mt-12 space-y-4 sticky bottom-0 bg-[#0a0a0a] pt-4">
                        {replyingTo?.questionId === selectedQuestionId && (
                          <div className="flex items-center justify-between bg-[#007AFF]/10 px-5 py-3 rounded-2xl border border-[#007AFF]/20">
                            <span className="text-sm text-[#007AFF] font-bold flex items-center gap-2">
                              <Reply size={16} /> 답글 작성 중...
                            </span>
                            <button onClick={() => setReplyingTo(null)} className="text-gray-500 hover:text-white"><X size={16} /></button>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <textarea 
                            value={commentInputs[selectedQuestionId] || ''}
                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [selectedQuestionId]: e.target.value }))}
                            placeholder="답변이나 의견을 남겨주세요..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-[24px] p-5 text-base text-white outline-none focus:border-[#007AFF]/50 transition-all resize-none h-24 custom-scrollbar"
                          />
                          <button 
                            onClick={() => handleCommentSubmit(selectedQuestionId)}
                            disabled={!commentInputs[selectedQuestionId]?.trim()}
                            className="px-8 bg-[#007AFF] text-white rounded-[24px] font-black hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-30 cursor-pointer flex items-center justify-center"
                          >
                            <Send size={24} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
