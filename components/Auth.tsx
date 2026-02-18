
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Code2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound, RefreshCw, ChevronLeft, ShieldCheck, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { UserAccount } from '../types';
import { supabase } from '../lib/supabase';

// Fix for framer-motion intrinsic element type errors
const MotionDiv = motion.div as any;

interface AuthProps {
  onLoginSuccess: (user: UserAccount) => void;
  initialStage?: AuthStage;
}

type AuthStage = 'input' | 'verify' | 'reset-request' | 'reset-verify' | 'reset-update';

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess, initialStage = 'input' }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [authStage, setAuthStage] = useState<AuthStage>(initialStage);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resetOtp, setResetOtp] = useState(''); // 8자리 리셋 코드
  const [rememberMe, setRememberMe] = useState(false);
  
  // 개별 가시성 상태
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAuthStage(initialStage);
  }, [initialStage]);

  useEffect(() => {
    const savedEmail = localStorage.getItem('stepcode_saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const cleanEmail = email.trim();
      if (isLoginView) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
          }
          throw loginError;
        }

        if (rememberMe) {
          localStorage.setItem('stepcode_saved_email', cleanEmail);
        } else {
          localStorage.removeItem('stepcode_saved_email');
        }

        if (data.user) {
          onLoginSuccess({
            id: data.user.id,
            name: data.user.user_metadata?.full_name || '학습자',
            email: data.user.email || '',
            level: 1,
            progress: 0,
            missed_concepts: [],
            last_track_id: null,
            completed_lesson_ids: []
          });
        }
      } else {
        if (!cleanEmail || !password || !name) throw new Error('모든 필드를 입력해주세요.');
        if (password !== confirmPassword) throw new Error('비밀번호가 일치하지 않습니다.');
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: name.trim() } },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          if (data.session) {
            onLoginSuccess({
              id: data.user.id,
              name: name.trim(),
              email: data.user.email || cleanEmail,
              level: 1,
              progress: 0,
              missed_concepts: [],
              last_track_id: null,
              completed_lesson_ids: []
            });
          } else {
            setAuthStage('verify');
            setSuccessMessage(`${cleanEmail}로 인증 코드가 발송되었습니다.`);
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. 비밀번호 재설정 코드 요청
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
      if (error) throw error;
      setAuthStage('reset-verify');
      setSuccessMessage('8자리 인증 코드가 이메일로 발송되었습니다.');
    } catch (err: any) {
      setError(err.message || '코드 발송에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 8자리 코드 검증
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetOtp.length < 8) {
      setError('8자리 코드를 정확히 입력해주세요.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: resetOtp,
        type: 'recovery',
      });
      if (error) throw error;
      if (data.user) {
        setAuthStage('reset-update');
        setSuccessMessage('인증에 성공했습니다. 새 비밀번호를 설정하세요.');
      }
    } catch (err: any) {
      setError('잘못된 코드이거나 만료되었습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 새 비밀번호 설정 완료
  const handleFinalPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      if (data.user) {
        alert('비밀번호가 변경되었습니다. 새로운 비밀번호로 로그인하세요.');
        setAuthStage('input');
        setIsLoginView(true);
        setPassword('');
        setConfirmPassword('');
        setShowPass(false);
        setShowConfirmPass(false);
      }
    } catch (err: any) {
      setError(err.message || '비밀번호 변경 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySignupOtp = async () => {
    if (verificationCode.length < 8) {
      setError('8자리 인증 코드를 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: verificationCode,
        type: 'signup', 
      });
      if (verifyError) throw verifyError;
      if (data.user) {
        onLoginSuccess({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || name || '학습자',
          email: data.user.email || email.trim(),
          level: 1,
          progress: 0,
          missed_concepts: [],
          last_track_id: null,
          completed_lesson_ids: []
        });
      }
    } catch (err: any) {
      setError('잘못된 인증 코드입니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const smoothSpring = { type: "spring" as const, stiffness: 350, damping: 30 };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#007AFF]/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[140px] rounded-full" />

      <LayoutGroup>
        <MotionDiv layout transition={smoothSpring} className="w-full max-w-[440px] z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#007AFF] rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-2xl text-white">
              <Code2 size={40} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">StepCode<span className="text-[#007AFF]">.</span></h1>
            <p className="text-gray-400 text-sm font-medium">직관적인 코딩 학습의 시작</p>
          </div>

          <MotionDiv layout className="glass p-8 lg:p-10 rounded-[44px] border-white/10 bg-white/[0.02] shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {authStage === 'input' && (
                <MotionDiv key="input" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl relative">
                    <button type="button" onClick={() => { setIsLoginView(true); setError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${isLoginView ? 'text-white' : 'text-gray-500'}`}>로그인</button>
                    <button type="button" onClick={() => { setIsLoginView(false); setError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${!isLoginView ? 'text-white' : 'text-gray-500'}`}>회원가입</button>
                    <MotionDiv layoutId="tab-bg" className="absolute inset-y-1 bg-white/10 rounded-xl shadow-inner" style={{ width: 'calc(50% - 4px)', left: isLoginView ? 4 : 'calc(50% + 0px)' }} />
                  </div>

                  <form onSubmit={handleAuth} className="flex flex-col gap-4">
                    {!isLoginView && (
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type="text" placeholder="이름" value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                      </div>
                    )}
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="email" placeholder="이메일" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type={showPass ? "text" : "password"} placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    {!isLoginView && (
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input type={showConfirmPass ? "text" : "password"} placeholder="비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                        <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                      </div>
                    )}

                    {isLoginView && (
                      <div className="flex items-center justify-between px-2 py-1">
                        <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                          <input type="checkbox" className="hidden" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                          <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${rememberMe ? 'bg-[#007AFF] border-[#007AFF]' : 'border-white/10 bg-white/5'}`}>
                            {rememberMe && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                          <span className="text-[11px] text-gray-500 group-hover:text-gray-400">기억하기</span>
                        </label>
                        <button type="button" onClick={() => { setAuthStage('reset-request'); setError(''); }} className="text-[11px] text-gray-500 hover:text-[#007AFF] transition-colors">비밀번호를 잊으셨나요?</button>
                      </div>
                    )}

                    {error && <div className="text-red-400 text-xs px-2 mt-1 flex items-center gap-1.5 font-medium"><AlertCircle size={12} /> {error}</div>}
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl transition-all hover:bg-[#007AFF]/90 active:scale-95 disabled:opacity-50 mt-2">
                      {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>{isLoginView ? '로그인' : '회원가입'} <ArrowRight size={18} /></>}
                    </button>
                  </form>
                </MotionDiv>
              )}

              {authStage === 'reset-request' && (
                <MotionDiv key="reset-request" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col">
                  <button type="button" onClick={() => setAuthStage('input')} className="self-start flex items-center gap-1 text-gray-500 text-xs mb-6 hover:text-white transition-colors"><ChevronLeft size={14} /> 돌아가기</button>
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#007AFF] mx-auto"><KeyRound size={32} /></div>
                  <h2 className="text-2xl font-bold mb-2 text-white text-center">비밀번호 찾기</h2>
                  <p className="text-gray-400 text-xs mb-8 text-center">가입하신 이메일을 입력하시면<br/>8자리 인증 코드를 보내드립니다.</p>
                  <form onSubmit={handleRequestResetCode} className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="email" placeholder="이메일 주소" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none" required />
                    </div>
                    {error && <div className="text-red-400 text-xs text-center">{error}</div>}
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl active:scale-95 disabled:opacity-30 transition-all">
                      {isLoading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '인증 코드 발송'}
                    </button>
                  </form>
                </MotionDiv>
              )}

              {authStage === 'reset-verify' && (
                <MotionDiv key="reset-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center">
                  <button type="button" onClick={() => setAuthStage('reset-request')} className="self-start flex items-center gap-1 text-gray-500 text-xs mb-6 hover:text-white transition-colors"><ChevronLeft size={14} /> 다시 입력</button>
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#007AFF]"><Fingerprint size={32} /></div>
                  <h2 className="text-2xl font-bold mb-2 text-white">코드 인증</h2>
                  <p className="text-gray-400 text-xs mb-8">{email}로 발송된<br/><span className="text-white font-bold">8자리 숫자 코드</span>를 입력하세요.</p>
                  <form onSubmit={handleVerifyResetOtp} className="w-full">
                    <input 
                      type="text" 
                      maxLength={8} 
                      autoFocus 
                      value={resetOtp} 
                      onChange={e => setResetOtp(e.target.value.replace(/[^0-9]/g, ''))} 
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.2em] text-white focus:border-[#007AFF] outline-none mb-8" 
                      placeholder="00000000" 
                    />
                    {error && <div className="text-red-400 text-xs mb-6">{error}</div>}
                    <button type="submit" disabled={isLoading || resetOtp.length < 8} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all disabled:opacity-30">
                      {isLoading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '인증 완료'}
                    </button>
                  </form>
                </MotionDiv>
              )}

              {authStage === 'reset-update' && (
                <MotionDiv key="reset-update" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-green-400 mx-auto"><ShieldCheck size={32} /></div>
                  <h2 className="text-2xl font-bold mb-2 text-white text-center">새 비밀번호 설정</h2>
                  <p className="text-gray-400 text-xs mb-8 text-center">인증에 성공했습니다. 사용할 새 비밀번호를 입력하세요.</p>
                  <form onSubmit={handleFinalPasswordUpdate} className="space-y-4">
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type={showPass ? "text" : "password"} placeholder="새 비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:border-[#007AFF] outline-none" required />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type={showConfirmPass ? "text" : "password"} placeholder="비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white focus:border-[#007AFF] outline-none" required />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">{showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                    </div>
                    {error && <div className="text-red-400 text-xs text-center">{error}</div>}
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all">
                      {isLoading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '비밀번호 변경 완료'}
                    </button>
                  </form>
                </MotionDiv>
              )}

              {authStage === 'verify' && (
                <MotionDiv key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center text-center">
                  <button type="button" onClick={() => setAuthStage('input')} className="self-start flex items-center gap-1 text-gray-500 text-xs mb-6 hover:text-white transition-colors"><ChevronLeft size={14} /> 돌아가기</button>
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#007AFF]"><ShieldCheck size={32} /></div>
                  <h2 className="text-2xl font-bold mb-2 text-white">이메일 인증</h2>
                  <p className="text-gray-400 text-xs mb-8">{email}로 발송된<br/><span className="text-white font-bold">8자리 인증 코드</span>를 입력하세요.</p>
                  <input 
                    type="text" 
                    maxLength={8} 
                    autoFocus 
                    value={verificationCode} 
                    onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 text-center text-4xl font-black tracking-[0.3em] text-white focus:border-[#007AFF] outline-none mb-8" 
                    placeholder="00000000" 
                  />
                  {error && <div className="text-red-400 text-xs mb-6">{error}</div>}
                  <button type="button" onClick={handleVerifySignupOtp} disabled={isLoading || verificationCode.length < 8} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl active:scale-95 transition-all disabled:opacity-30">
                    {isLoading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '인증 완료'}
                  </button>
                </MotionDiv>
              )}
            </AnimatePresence>
          </MotionDiv>
        </MotionDiv>
      </LayoutGroup>
    </div>
  );
};
