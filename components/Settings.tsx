
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Save, LogOut, ChevronRight, Bell, ShieldCheck, 
  Zap, Sun, Moon, X, AlertCircle, Lock, RefreshCw, Eye, EyeOff, Key, UserX
} from 'lucide-react';
import { UserProfile } from '../types';
import { supabase } from '../lib/supabase';

const MotionDiv = motion.div as any;

interface SettingsProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onLogout, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // 모달 제어 상태
  const [activeModal, setActiveModal] = useState<'notifications' | 'privacy' | 'password' | 'delete-account' | null>(null);

  // 비밀번호 변경 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // 계정 삭제 확인용
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdateName = async () => {
    if (name.trim() === user.name) return;
    setIsUpdating(true);
    setSaveMessage('');

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: name.trim(), updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) throw error;
      
      onUpdateUser({ name: name.trim() });
      setSaveMessage('성공적으로 변경되었습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      alert('이름 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSettings = async (key: 'push' | 'email' | 'browser', value: boolean) => {
    const nextSettings = { ...(user.settings || { push: true, email: false, browser: true }), [key]: value };
    onUpdateUser({ settings: nextSettings });
    await supabase.from('profiles').update({ settings: nextSettings }).eq('id', user.id);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) { alert('현재 비밀번호를 입력해주세요.'); return; }
    if (newPassword !== confirmPassword) { alert('새 비밀번호가 일치하지 않습니다.'); return; }
    if (newPassword.length < 6) { alert('비밀번호는 최소 6자 이상이어야 합니다.'); return; }

    setIsChangingPass(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) throw new Error('현재 비밀번호가 올바르지 않습니다.');

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) throw updateError;

      alert('비밀번호가 성공적으로 변경되었습니다.');
      resetPasswordModal();
      setActiveModal(null);
    } catch (err: any) {
      alert(err.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정삭제') {
      alert("'계정삭제'라고 정확히 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    try {
      // 1. 프로필 정보 삭제 (RLS 정책에 의해 본인만 가능)
      // select()를 사용하여 실제 삭제가 일어났는지 확인
      const { data, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
        .select();

      if (profileError) throw profileError;

      if (!data || data.length === 0) {
        throw new Error('데이터 삭제 권한이 없거나 이미 삭제된 계정입니다. (RLS 정책 확인 필요)');
      }

      // 2. 완전 탈퇴 성공 안내 및 로그아웃
      alert('모든 학습 데이터가 성공적으로 삭제되었습니다. 이용해 주셔서 감사합니다.');
      
      // onLogout 내부에 supabase.auth.signOut()이 포함되어 있어야 합니다.
      onLogout();
    } catch (err: any) {
      console.error('Account Delete Error:', err);
      alert(`탈퇴 실패: ${err.message}\n\n(참고: Supabase SQL Editor에서 DELETE 정책이 설정되어 있는지 확인하세요.)`);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetPasswordModal = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPass(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
  };

  const toggleTheme = () => {
    const nextTheme = user.theme === 'light' ? 'dark' : 'light';
    onUpdateUser({ theme: nextTheme });
  };

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto pb-32">
      <header className="mb-12">
        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-main">설정</h2>
        <p className="text-gray-500 text-lg font-light leading-relaxed">프로필 정보와 학습 환경을 관리합니다.</p>
      </header>

      <div className="space-y-12">
        <section className="glass p-10 rounded-[48px] border-white/5 bg-gradient-to-br from-[#007AFF]/5 to-transparent shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-[#007AFF] to-cyan-400 flex items-center justify-center text-white text-5xl font-black shadow-2xl">{user.name?.[0]}</div>
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="text-3xl font-bold mb-1 text-main">{user.name}</h3>
                <p className="text-gray-500 font-mono text-sm">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><ShieldCheck size={12} /> {user.role === 'admin' ? '관리자' : user.role === 'staff' ? '운영진' : '학습자'}</span>
                <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Zap size={12} /> 레벨 {user.level}</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] ml-2">개인 정보 설정</h4>
            <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 bg-card">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">사용자 이름</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-main outline-none focus:border-[#007AFF] transition-all" />
                  </div>
                  <button onClick={handleUpdateName} disabled={isUpdating || name.trim() === user.name} className="px-6 py-3 bg-[#007AFF] text-white rounded-2xl font-bold text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"><Save size={16} /> 저장</button>
                </div>
                {saveMessage && <p className="text-green-500 text-[10px] font-bold ml-1">{saveMessage}</p>}
              </div>
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">이메일 주소</label>
                <div className="relative opacity-40"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} /><input type="text" value={user.email} disabled className="w-full bg-black/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-main cursor-not-allowed" /></div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] ml-2">앱 환경 설정</h4>
            <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col gap-2 bg-card">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all mb-2">
                <div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.theme === 'light' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>{user.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}</div><span className="text-sm font-bold text-gray-400">화면 테마 ({user.theme === 'light' ? '라이트' : '다크'})</span></div>
                <button onClick={toggleTheme} className="w-12 h-6 bg-white/10 rounded-full relative transition-colors border border-white/10"><MotionDiv animate={{ x: user.theme === 'light' ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1" /></button>
              </div>
              <button onClick={() => setActiveModal('notifications')} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center"><Bell size={18} /></div><span className="text-sm font-bold text-gray-400">알림 설정</span></div><ChevronRight size={16} className="text-gray-600 group-hover:text-white" /></button>
              <button onClick={() => setActiveModal('password')} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 group"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center"><Lock size={18} /></div><span className="text-sm font-bold text-gray-400">비밀번호 변경</span></div><ChevronRight size={16} className="text-gray-600 group-hover:text-white" /></button>
              <button onClick={onLogout} className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/10 transition-all mt-4 border border-dashed border-white/5"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><LogOut size={18} /></div><span className="text-sm font-bold text-red-500">로그아웃</span></div></button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 mt-8 border-t border-white/5">
          <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.2em] ml-2 mb-6">Danger Zone</h4>
          <div className="glass p-8 rounded-[40px] border-red-500/10 bg-red-500/[0.02] flex flex-col sm:flex-row items-center justify-between gap-6">
             <div className="text-center sm:text-left">
               <p className="text-lg font-bold text-white mb-1">회원 탈퇴</p>
               <p className="text-sm text-gray-500 leading-relaxed">회원 탈퇴 시 모든 학습 데이터와 질문 내역이 즉시 삭제되며 복구할 수 없습니다.</p>
             </div>
             <button onClick={() => setActiveModal('delete-account')} className="px-8 py-4 bg-red-600/10 border border-red-600/30 text-red-500 rounded-2xl text-xs font-black hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-600/5">계정 삭제</button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <MotionDiv initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="w-full max-w-lg glass p-10 rounded-[50px] bg-card border-white/10 shadow-3xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${activeModal === 'notifications' ? 'bg-purple-500/10 text-purple-400' : activeModal === 'delete-account' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'}`}>
                    {activeModal === 'notifications' ? <Bell size={24} /> : activeModal === 'delete-account' ? <UserX size={24} /> : <Lock size={24} />}
                  </div>
                  <h3 className="text-2xl font-black text-main">
                    {activeModal === 'notifications' ? '알림 설정' : activeModal === 'delete-account' ? '회원 탈퇴' : '비밀번호 변경'}
                  </h3>
                </div>
                <button onClick={() => { setActiveModal(null); resetPasswordModal(); }} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
              </div>

              {activeModal === 'notifications' && (
                <div className="space-y-6">
                  {['push', 'email', 'browser'].map(key => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div><p className="text-sm font-bold text-main">{key === 'push' ? '푸시 알림' : key === 'email' ? '이메일 소식지' : '브라우저 알림'}</p></div>
                      <button onClick={() => handleUpdateSettings(key as any, !user.settings?.[key as keyof typeof user.settings])} className={`w-10 h-5 rounded-full relative transition-colors ${user.settings?.[key as keyof typeof user.settings] ? 'bg-[#007AFF]' : 'bg-gray-700'}`}><MotionDiv animate={{ x: user.settings?.[key as keyof typeof user.settings] ? 22 : 2 }} className="w-3 h-3 bg-white rounded-full absolute top-1" /></button>
                    </div>
                  ))}
                </div>
              )}

              {activeModal === 'password' && (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">현재 비밀번호</label>
                    <div className="relative"><Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} /><input type={showCurrentPass ? "text" : "password"} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="현재 비밀번호" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-main outline-none focus:border-[#007AFF]" /><button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">새 비밀번호</label>
                    <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} /><input type={showNewPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="6자 이상 입력" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-main outline-none focus:border-[#007AFF]" /><button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">새 비밀번호 확인</label>
                    <div className="relative"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} /><input type={showConfirmPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="비밀번호 다시 입력" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-main outline-none focus:border-[#007AFF]" /><button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                  </div>
                  <button type="submit" disabled={isChangingPass} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:bg-[#007AFF]/90 active:scale-95 disabled:opacity-50">{isChangingPass ? <RefreshCw className="animate-spin" size={20} /> : <Save size={18} />} 비밀번호 변경 완료</button>
                </form>
              )}

              {activeModal === 'delete-account' && (
                <div className="space-y-6">
                   <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-start gap-4">
                     <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                     <p className="text-sm text-gray-400 leading-relaxed">정말로 탈퇴하시겠습니까? 학습 기록, 정복한 문제, 질문 내역 등 모든 활동 데이터가 삭제되며 이 작업은 <strong>복구할 수 없습니다.</strong></p>
                   </div>
                   <div className="space-y-3">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">탈퇴 확인을 위해 <span className="text-white">'계정삭제'</span>를 입력하세요.</p>
                     <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} placeholder="계정삭제" className="w-full bg-black/40 border border-red-500/30 rounded-2xl py-4 px-6 text-sm text-white outline-none focus:border-red-500" />
                   </div>
                   <button onClick={handleDeleteAccount} disabled={isDeleting || deleteConfirmText !== '계정삭제'} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black shadow-xl disabled:opacity-30 hover:bg-red-700 transition-all flex items-center justify-center gap-3">{isDeleting ? <RefreshCw className="animate-spin" size={20} /> : <UserX size={20} />} 회원 탈퇴 확정</button>
                </div>
              )}
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
