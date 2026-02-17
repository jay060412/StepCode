
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
          // [Fix] Fixed property names to match UserProfile/UserAccount interface (snake_case).
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
        if (password.length < 6) throw new Error('비밀번호는 최소 6자 이상이어야 합니다.');

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: name.trim() },
          },
        });

        if (signUpError) throw signUpError;

        if (data.user) {
          if (data.session) {
            // [Fix] Fixed property names to match UserProfile/UserAccount interface (snake_case).
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
      setError(err.message || '인증 과정에서 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    // [Request] 인증코드 8자리 검증
    if (verificationCode.length < 8) {
      setError('8자리 인증 코드를 정확히 입력해주세요.');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const cleanEmail = email.trim();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: verificationCode,
        type: 'signup', 
      });

      if (verifyError) {
        const { data: retryData, error: retryError } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: verificationCode,
          type: 'email',
        });
        
        if (retryError) throw verifyError;
        if (retryData.user) {
          // [Fix] Fixed property names to match UserProfile/UserAccount interface (snake_case).
          onLoginSuccess({
            id: retryData.user.id,
            name: retryData.user.user_metadata?.full_name || name || '학습자',
            email: retryData.user.email || cleanEmail,
            level: 1,
            progress: 0,
            missed_concepts: [],
            last_track_id: null,
            completed_lesson_ids: []
          });
          return;
        }
      }

      if (data.user) {
        // [Fix] Fixed property names to match UserProfile/UserAccount interface (snake_case).
        onLoginSuccess({
          id: data.user.id,
          name: data.user.user_metadata?.full_name || name || '학습자',
          email: data.user.email || cleanEmail,
          level: 1,
          progress: 0,
          missed_concepts: [],
          last_track_id: null,
          completed_lesson_ids: []
        });
      }
    } catch (err: any) {
      setError(err.message || '잘못된 인증 코드이거나 만료되었습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const smoothSpring = {
    type: "spring" as const,
    stiffness: 350,
    damping: 30
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#050505]">
      <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#007AFF]/10 blur-[140px] rounded-full" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/10 blur-[140px] rounded-full" />

      <LayoutGroup>
        <motion.div layout transition={smoothSpring} className="w-full max-w-[420px] z-10">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-[#007AFF] rounded-[24px] mx-auto mb-6 flex items-center justify-center shadow-2xl text-white">
              <Code2 size={40} />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">StepCode<span className="text-[#007AFF]">.</span></h1>
            <p className="text-gray-400 text-sm">직관적인 코딩 학습의 시작</p>
          </div>

          <motion.div layout className="glass p-8 rounded-[40px] border-white/10 bg-white/[0.02] shadow-2xl overflow-hidden">
            {authStage === 'input' ? (
              <>
                <div className="flex gap-4 mb-8 p-1 bg-white/5 rounded-2xl relative">
                  <button type="button" onClick={() => setIsLoginView(true)} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${isLoginView ? 'text-white' : 'text-gray-500'}`}>로그인</button>
                  <button type="button" onClick={() => setIsLoginView(false)} className={`flex-1 py-3 rounded-xl text-sm font-bold z-10 transition-colors ${!isLoginView ? 'text-white' : 'text-gray-500'}`}>회원가입</button>
                  <motion.div layoutId="tab-bg" className="absolute inset-y-1 bg-white/10 rounded-xl shadow-inner" style={{ width: 'calc(50% - 4px)', left: isLoginView ? 4 : 'calc(50% + 0px)' }} />
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
                    <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                  </div>
                  {!isLoginView && (
                    <div className="relative">
                      <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                      <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-[#007AFF] outline-none transition-all" />
                    </div>
                  )}
                  {error && <div className="text-red-400 text-xs px-2">{error}</div>}
                  <button type="submit" disabled={isLoading} className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-2xl transition-all hover:bg-[#007AFF]/90 active:scale-95 disabled:opacity-50 mt-2">
                    {isLoading ? <RefreshCw className="animate-spin" size={18} /> : <>{isLoginView ? '로그인' : '회원가입 시작'} <ArrowRight size={18} /></>}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center">
                <button type="button" onClick={() => setAuthStage('input')} className="self-start flex items-center gap-1 text-gray-500 text-xs mb-6 hover:text-white transition-colors"><ChevronLeft size={14} /> 돌아가기</button>
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 text-[#007AFF]"><KeyRound size={32} /></div>
                <h2 className="text-2xl font-bold mb-2 text-white">인증 코드 입력</h2>
                <p className="text-gray-400 text-xs mb-8">{email}로 발송된 코드를 입력하세요.</p>
                <input 
                  type="text" 
                  maxLength={8} 
                  autoFocus 
                  value={verificationCode} 
                  onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 text-center text-3xl font-black tracking-[0.2em] text-white focus:border-[#007AFF] outline-none mb-8" 
                  placeholder="00000000" 
                />
                {error && <div className="text-red-400 text-xs mb-6">{error}</div>}
                <button 
                  type="button"
                  onClick={handleVerifyOtp} 
                  disabled={isLoading || verificationCode.length < 8} 
                  className="w-full py-4 bg-[#007AFF] text-white rounded-2xl font-bold shadow-xl hover:bg-[#007AFF]/90 active:scale-95 transition-all disabled:opacity-30"
                >
                  {isLoading ? <RefreshCw className="animate-spin mx-auto" size={20} /> : '인증 및 가입 완료'}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      </LayoutGroup>
    </div>
  );
};
