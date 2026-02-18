
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Shield, Save, LogOut, ChevronRight, Bell, ShieldCheck, 
  Zap, Sun, Moon, X, AlertCircle, Lock, RefreshCw, Eye, EyeOff
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
  const [activeModal, setActiveModal] = useState<'notifications' | 'privacy' | 'password' | null>(null);

  // 비밀번호 변경 상태
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [showPass, setShowPass] = useState(false);

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
    if (newPassword !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsChangingPass(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      alert('비밀번호가 성공적으로 변경되었습니다.');
      setActiveModal(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(`변경 실패: ${err.message}`);
    } finally {
      setIsChangingPass(false);
    }
  };

  const toggleTheme = () => {
    const nextTheme = user.theme === 'light' ? 'dark' : 'light';
    onUpdateUser({ theme: nextTheme });
  };

  return (
    <div className="p-6 lg:p-12 max-w-4xl mx-auto pb-32">
      <header className="mb-12">
        <h2 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4">설정</h2>
        <p className="text-gray-500 text-lg font-light leading-relaxed">
          프로필 정보와 학습 환경을 관리합니다.
        </p>
      </header>

      <div className="space-y-12">
        {/* Profile Card */}
        <section className="glass p-10 rounded-[48px] border-white/5 bg-gradient-to-br from-[#007AFF]/5 to-transparent shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-gradient-to-tr from-[#007AFF] to-cyan-400 flex items-center justify-center text-white text-5xl font-black shadow-2xl group-hover:scale-105 transition-transform">
                {user.name?.[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-black" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h3 className="text-3xl font-bold mb-1">{user.name}</h3>
                <p className="text-gray-500 font-mono text-sm">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 rounded-full bg-[#007AFF]/10 border border-[#007AFF]/20 text-[#007AFF] text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={12} /> {user.role || 'User'}
                </span>
                <span className="px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Zap size={12} /> Level {user.level}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Personal Information</h4>
            <div className="glass p-8 rounded-[40px] border-white/5 space-y-6 bg-card">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Display Name</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-black/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:border-[#007AFF] transition-all" 
                    />
                  </div>
                  <button 
                    onClick={handleUpdateName}
                    disabled={isUpdating || name.trim() === user.name}
                    className="px-6 py-3 bg-[#007AFF] text-white rounded-2xl font-bold text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> 저장
                  </button>
                </div>
                {saveMessage && <p className="text-green-500 text-[10px] font-bold ml-1">{saveMessage}</p>}
              </div>

              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative opacity-40">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="text" value={user.email} disabled className="w-full bg-black/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm cursor-not-allowed" />
                </div>
                <p className="text-[10px] text-gray-600 italic ml-1">이메일은 변경할 수 없습니다.</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black text-gray-600 uppercase tracking-[0.2em] ml-2">App Preferences</h4>
            <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col gap-2 bg-card">
              <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 transition-all mb-2">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.theme === 'light' ? 'bg-orange-500/10 text-orange-500' : 'bg-blue-500/10 text-blue-400'}`}>
                    {user.theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}
                  </div>
                  <span className="text-sm font-bold text-gray-400">화면 테마 ({user.theme === 'light' ? '라이트' : '다크'})</span>
                </div>
                <button onClick={toggleTheme} className="w-12 h-6 bg-white/10 rounded-full relative transition-colors border border-white/10">
                  <motion.div animate={{ x: user.theme === 'light' ? 24 : 4 }} className="w-4 h-4 bg-white rounded-full absolute top-1" />
                </button>
              </div>

              <button onClick={() => setActiveModal('notifications')} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 group">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center"><Bell size={18} /></div><span className="text-sm font-bold text-gray-400">알림 설정</span></div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
              </button>
              
              <button onClick={() => setActiveModal('password')} className="flex items-center justify-between p-4 rounded-2xl hover:bg-white/5 group">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center"><Lock size={18} /></div><span className="text-sm font-bold text-gray-400">비밀번호 변경</span></div>
                <ChevronRight size={16} className="text-gray-600 group-hover:text-white" />
              </button>

              <button onClick={onLogout} className="flex items-center justify-between p-4 rounded-2xl hover:bg-red-500/10 transition-all mt-4 border border-dashed border-white/5">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center"><LogOut size={18} /></div><span className="text-sm font-bold text-red-500">로그아웃</span></div>
              </button>
            </div>
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
                  <div className={`p-3 rounded-2xl ${activeModal === 'notifications' ? 'bg-purple-500/10 text-purple-400' : 'bg-green-500/10 text-green-400'}`}>
                    {activeModal === 'notifications' ? <Bell size={24} /> : <Lock size={24} />}
                  </div>
                  <h3 className="text-2xl font-black">{activeModal === 'notifications' ? '알림 설정' : '비밀번호 변경'}</h3>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
              </div>

              {activeModal === 'notifications' ? (
                <div className="space-y-6">
                  {[
                    { key: 'push', title: "Push 알림", desc: "새로운 소식 및 질문 답변 알림" },
                    { key: 'email', title: "이메일 소식지", desc: "매주 업데이트되는 학습 팁과 뉴스" },
                    { key: 'browser', title: "브라우저 알림", desc: "실시간 채점 및 오류 안내" }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div><p className="text-sm font-bold">{item.title}</p><p className="text-[10px] text-gray-500">{item.desc}</p></div>
                      <button 
                        onClick={() => handleUpdateSettings(item.key as any, !user.settings?.[item.key as keyof typeof user.settings])}
                        className={`w-10 h-5 rounded-full relative transition-colors ${user.settings?.[item.key as keyof typeof user.settings] ? 'bg-[#007AFF]' : 'bg-gray-700'}`}
                      >
                        <motion.div animate={{ x: user.settings?.[item.key as keyof typeof user.settings] ? 22 : 2 }} className="w-3 h-3 bg-white rounded-full absolute top-1" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                      <input type={showPass ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm outline-none focus:border-[#007AFF]" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <input type={showPass ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-sm outline-none focus:border-[#007AFF]" />
                  </div>
                  <button type="submit" disabled={isChangingPass} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 hover:bg-[#007AFF]/90 active:scale-95 disabled:opacity-50">
                    {isChangingPass ? <RefreshCw className="animate-spin" size={20} /> : <Save size={18} />} 비밀번호 업데이트
                  </button>
                </form>
              )}
            </MotionDiv>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
