
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Code2, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2, KeyRound, RefreshCw, ChevronLeft } from 'lucide-react';
import { UserAccount } from '../types';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onLoginSuccess: (user: UserAccount) => void;
}

type AuthStage = 'input' | 'verify';

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [authStage, setAuthStage] = useState<AuthStage>('input');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
      if (isLoginView) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
          }
          throw loginError;
        }

        if (rememberMe) {
          localStorage.setItem('stepcode_saved_email', email);
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
            missedConcepts: [],
            selectedTrackId: null,
            completedLessonIds: []
          });
        }
      } else {
        if (!email || !password || !name) throw new Error('모든 필드를 입력해주세요.');
        if (password !== confirmPassword) throw new Error('비밀번호가 일치하지 않습니다.');
        if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() }, // 이름 앞뒤 공백 제거 후 전송
            emailRedirectTo: window.location.origin,
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          setAuthStage('verify');
          setSuccessMessage(`${email}로 인증 코드가 발송되었습니다.`);
        }
      }
    } catch (err: any) {
      setError(err.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (verificationCode.length < 6) {
      setError('인증 코드를 정확히 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup',
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        // 회원가입 인증 성공 시, 입력했던 이름을 metadata에서 명확히 추출
        const finalName = data.user.user_metadata?.full_name || name.trim();
        
        onLoginSuccess({
          id: data.user.id,
          name: finalName,
          email: data.user.email || email,
          level: 1,
          progress: 0,
          missedConcepts: [],
          selectedTrackId: null,
          completedLessonIds: []
        });
      }
    } catch (err: any) {
      setError('잘못된 인증 코드이거나 만료되었습니다.');
      setVerificationCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (resendError) throw resendError;
      setSuccessMessage('인증 코드가 재발송되었습니다.');
    } catch (err: any) {
      setError('재발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const smoothSpring = {
    type: "spring",
    stiffness: 350,
    damping: 30,
    mass: 1,
    restDelta: 0.001
  } as const;

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#050505] selection:bg-[#007AFF]/30 font-pretendard">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#007AFF]/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[140px] rounded-full" />

      <LayoutGroup>
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={smoothSpring}
          className="w-full max-w-[420px] z-10 will-change-transform"
        >
          <motion.div layout className="text-center mb-10">
            <motion.div 
              layout
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 bg-[#007AFF] rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-[#007AFF]/40 text-white"
            >
              <Code2 size={40} />
            </motion.div>
            <motion.h1 layout className="text-4xl font-bold tracking-tight text-white mb-2">
              StepCode<span className="text-[#007AFF]">.</span>
            </motion.h1>
            <motion.p layout className="text-gray-400 text-sm font-light">
              직관적인 코딩 학습의 시작
            </motion.p>
          </motion.div>

          <motion.div 
            layout
            transition={smoothSpring}
            className="glass p-8 lg:p-10 rounded-[40px] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-white/[0.02] overflow-hidden"
          >
            {authStage === 'input' ? (
              <>
                <motion.div layout className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl relative">
                  <button 
                    type="button"
                    onClick={() => { setIsLoginView(true); setError(''); setSuccessMessage(''); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-300 z-10 ${isLoginView ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    로그인
                  </button>
                  <button 
                    type="button"
                    onClick={() => { setIsLoginView(false); setError(''); setSuccessMessage(''); }}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors duration-300 z-10 ${!isLoginView ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    회원가입
                  </button>
                  <motion.div 
                    layoutId="active-tab-bg"
                    transition={smoothSpring}
                    className="absolute inset-y-1 bg-white/10 rounded-xl shadow-lg pointer-events-none"
                    style={{ 
                      width: 'calc(50% - 4px)',
                      left: isLoginView ? 4 : 'calc(50% + 0px)' 
                    }}
                  />
                </motion.div>

                <form onSubmit={handleAuth} className="flex flex-col gap-4">
                  <AnimatePresence initial={false} mode="sync">
                    {!isLoginView && (
                      <motion.div 
                        key="field-name"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={smoothSpring}
                        className="overflow-hidden"
                      >
                        <div className="relative pt-1 pb-1">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                          <input 
                            type="text" 
                            placeholder="이름" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div layout className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" 
                      placeholder="이메일" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </motion.div>

                  <motion.div layout className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      placeholder="비밀번호" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </motion.div>

                  {!isLoginView && (
                    <motion.div layout className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input 
                        type="password" 
                        placeholder="비밀번호 확인" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </motion.div>
                  )}

                  {isLoginView && (
                    <motion.div layout className="flex items-center gap-2 px-1">
                      <input 
                        type="checkbox" 
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-[#007AFF]"
                      />
                      <label htmlFor="rememberMe" className="text-xs text-gray-500 cursor-pointer select-none">아이디 저장</label>
                    </motion.div>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 text-xs px-2">
                        <AlertCircle size={14} /> {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button 
                    layout
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl transition-all disabled:opacity-50 mt-2"
                  >
                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : <>{isLoginView ? '로그인' : '회원가입 시작'} <ArrowRight size={18} /></>}
                  </motion.button>
                </form>

                <motion.div layout className="mt-8 pt-8 border-t border-white/5 text-center">
                  <p className="text-gray-500 text-xs">
                    {isLoginView ? '처음이신가요?' : '계정이 있으신가요?'} 
                    <button onClick={() => setIsLoginView(!isLoginView)} className="ml-2 text-[#007AFF] font-bold hover:underline">
                      {isLoginView ? '가입하기' : '로그인하기'}
                    </button>
                  </p>
                </motion.div>
              </>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col items-center text-center">
                <button 
                  onClick={() => { setAuthStage('input'); setError(''); }}
                  className="self-start flex items-center gap-1 text-gray-500 text-xs mb-6 hover:text-white transition-colors"
                >
                  <ChevronLeft size={14} /> 돌아가기
                </button>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#007AFF]">
                  <KeyRound size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">인증 코드 입력</h2>
                <p className="text-gray-400 text-xs mb-8 leading-relaxed">
                  <span className="text-white font-medium">{email}</span>로<br/>발송된 코드를 입력해주세요.
                </p>

                <input 
                  type="text"
                  maxLength={10}
                  autoFocus
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 text-center text-3xl font-black tracking-widest text-white focus:border-[#007AFF] outline-none mb-8"
                  placeholder="CODE"
                />

                {error && <div className="text-red-400 text-xs mb-6">{error}</div>}
                {successMessage && <div className="text-green-400 text-xs mb-6">{successMessage}</div>}

                <button 
                  onClick={handleVerifyOtp}
                  disabled={isLoading || verificationCode.length < 6}
                  className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold transition-all disabled:opacity-30 mb-4"
                >
                  {isLoading ? '인증 중...' : '인증 완료'}
                </button>
                
                <button onClick={handleResendCode} className="text-gray-500 text-xs hover:text-white flex items-center gap-2">
                  <RefreshCw size={12} /> 코드 재발송
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
