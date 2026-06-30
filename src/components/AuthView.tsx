import React, { useState } from 'react';
import { Mail, Lock, User, Globe, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { backgroundData } from '../data/background_data';
import { API_BASE } from '../config';

interface AuthViewProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onAuthSuccess: (token: string, user: any) => void;
  onBackToLanding: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthView: React.FC<AuthViewProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  onAuthSuccess,
  onBackToLanding,
  initialMode = 'signin'
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const t = {
    en: {
      brand: 'sumer send',
      tagline: 'Transactional messaging infrastructure',
      signInTitle: 'Sign in to Sumer Send',
      signUpTitle: 'Create your developer account',
      signInDesc: 'People and agents sending messages in the same rooms.',
      signUpDesc: 'Start sending SMS, WhatsApp, and Emails in minutes.',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Jasim Kareem',
      emailAddress: 'Email',
      emailPlaceholder: 'you@company.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      signInBtn: 'Continue with email',
      signUpBtn: 'Create Account',
      loadingSignIn: 'Continuing...',
      loadingSignUp: 'Creating account...',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signUpLink: 'Sign up for free',
      signInLink: 'Sign in instead',
      backToHome: 'Back to Home',
      invalidEmail: 'Please enter a valid email address.',
      passwordLength: 'Password must be at least 6 characters.',
      nameRequired: 'Name is required.',
      or: 'or',
      githubLogin: 'Continue with GitHub',
      oauthNotice: 'OAuth is disabled. Please sign in using your email and password.'
    },
    ar: {
      brand: 'سومر سيند',
      tagline: 'البنية التحتية لإرسال الإشعارات والمعاملات',
      signInTitle: 'تسجيل الدخول إلى سومر سيند',
      signUpTitle: 'إنشاء حساب مطور جديد',
      signInDesc: 'الأشخاص والعملاء البرمجيون يرسلون الرسائل في نفس الغرف.',
      signUpDesc: 'ابدأ بإرسال رسائل الـ SMS، الواتساب، والبريد الإلكتروني خلال دقائق.',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'جاسم كريم',
      emailAddress: 'البريد الإلكتروني',
      emailPlaceholder: 'you@company.com',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      signInBtn: 'المتابعة بالبريد الإلكتروني',
      signUpBtn: 'إنشاء حساب جديد',
      loadingSignIn: 'جاري تسجيل الدخول...',
      loadingSignUp: 'جاري إنشاء الحساب...',
      noAccount: 'ليس لديك حساب مطور؟',
      haveAccount: 'لديك حساب مطور بالفعل؟',
      signUpLink: 'سجل مجاناً الآن',
      signInLink: 'تسجيل الدخول بدلاً من ذلك',
      backToHome: 'العودة للرئيسية',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
      passwordLength: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
      nameRequired: 'الاسم الكامل مطلوب.',
      or: 'أو',
      githubLogin: 'المتابعة باستخدام GitHub',
      oauthNotice: 'تسجيل الدخول عبر الحسابات الخارجية غير مفعل حالياً. يرجى استخدام البريد الإلكتروني وكلمة المرور.'
    }
  }[lang];

  const validateForm = () => {
    setErrorMsg(null);
    if (mode === 'signup' && !name.trim()) {
      setErrorMsg(t.nameRequired);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg(t.invalidEmail);
      return false;
    }
    if (password.length < 6) {
      setErrorMsg(t.passwordLength);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const endpoint = mode === 'signin' ? '/api/auth/login' : '/api/auth/signup';
    const payload = mode === 'signin' 
      ? { email, password }
      : { email, password, name };

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      let data: any = {};
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text.slice(0, 100) || (lang === 'ar' ? 'فشل الاتصال بالخادم. تأكد من تشغيل السيرفر.' : 'Server connection failed. Ensure server is running.'));
      }
      
      if (!response.ok) {
        throw new Error(data.error || (lang === 'ar' ? 'فشلت العملية. يرجى المحاولة مرة أخرى.' : 'Operation failed. Please try again.'));
      }
      
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error, please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthClick = () => {
    setErrorMsg(t.oauthNotice);
  };

  const toggleMode = () => {
    setErrorMsg(null);
    setMode(prev => prev === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div className="auth-layout" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'var(--bg-color)',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-family)',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Background Dot pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 0)',
        backgroundSize: '24px 24px',
        opacity: theme === 'dark' ? 0.15 : 0.4,
        pointerEvents: 'none'
      }} />

      {/* Behind Card Crowd (z_0) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {backgroundData.z_0.map((img: any, i: number) => (
          <img
            key={`bg-z0-${i}`}
            src={`${img.src}?v=4`}
            alt=""
            className="hilos-crowd-img"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              userSelect: 'none',
              left: img.style.left,
              top: img.style.top,
              width: img.style.width || 'var(--login-crowd-size)',
              transform: img.style.transform,
              transformOrigin: img.style['transform-origin'] || '50% 72%',
              transition: img.style.transition || 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',
              zIndex: parseInt(img.style['z-index'] || '0'),
              animationDelay: `${(i * -0.17).toFixed(2)}s`
            }}
          />
        ))}
      </div>

      {/* Top controls (Back, Language, Theme) */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '24px',
        right: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10
      }}>
        <button 
          onClick={onBackToLanding}
          className="hilos-secondary-btn"
          style={{ width: 'auto', height: '32px', padding: '0 12px', fontSize: '13px' }}
        >
          {t.backToHome}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="hilos-secondary-btn"
            style={{ width: 'auto', height: '32px', padding: '0 12px', fontSize: '13px', gap: '6px' }}
          >
            <Globe size={14} />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="hilos-secondary-btn"
            style={{ width: 'auto', height: '32px', padding: '0 10px', fontSize: '13px' }}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Brutalist Form Card matching hilos.sh */}
      <div className="hilos-card" style={{
        width: '100%',
        maxWidth: '300px',
        zIndex: 1,
        transition: 'all 0.3s ease'
      }}>
        
        {/* Header containing Sumer Send Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '12px' }}>
          <img 
            src="/artboard2.svg" 
            alt="Sumer Send Logo" 
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'contain',
              marginBottom: '8px',
              filter: 'drop-shadow(0 4px 12px rgba(114, 38, 255, 0.2))'
            }}
          />
          <h1 style={{
            fontSize: '22px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: '0 0 4px 0',
            letterSpacing: '-0.8px',
            lineHeight: '1'
          }}>
            {t.brand}
          </h1>
          <p style={{
            fontSize: '11.5px',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: '1.5',
            maxWidth: '240px'
          }}>
            {mode === 'signin' ? t.signInDesc : t.signUpDesc}
          </p>
        </div>

        {/* Error Message styled brutalist */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--danger-bg)',
            border: '2px solid var(--danger-color)',
            color: 'var(--danger-text)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '14px',
            textAlign: lang === 'ar' ? 'right' : 'left',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.05)'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Full Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="name-input" style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                textAlign: lang === 'ar' ? 'right' : 'left'
              }}>
                {t.fullName}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="name-input"
                  type="text"
                  placeholder={t.fullNamePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="hilos-input"
                  style={{
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                />
              </div>
            </div>
          )}

          {/* Email Address Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="email-input" style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              {t.emailAddress}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email-input"
                type="email"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                dir="ltr"
                className="hilos-input"
                style={{
                  textAlign: 'left'
                }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label htmlFor="password-input" style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              textAlign: lang === 'ar' ? 'right' : 'left'
            }}>
              {t.password}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                dir="ltr"
                className="hilos-input"
                style={{
                  textAlign: 'left',
                  paddingRight: lang === 'ar' ? '12px' : '40px',
                  paddingLeft: lang === 'ar' ? '40px' : '12px'
                }}
              />
              
              {/* Show/Hide Password Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: lang === 'ar' ? '12px' : 'auto',
                  right: lang === 'ar' ? 'auto' : '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Email Continue Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="hilos-primary-btn"
            style={{ marginTop: '4px' }}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{mode === 'signin' ? t.loadingSignIn : t.loadingSignUp}</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? t.signInBtn : t.signUpBtn}</span>
                <ArrowRight size={15} style={{
                  transform: lang === 'ar' ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s'
                }} />
              </>
            )}
          </button>
        </form>

        {/* Separator block matching Hilos */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          margin: '12px 0'
        }}>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.or}</span>
          <div style={{ height: '1px', flex: 1, backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* GitHub OAuth secondary button */}
        <button
          type="button"
          onClick={handleOAuthClick}
          className="hilos-secondary-btn"
          style={{ width: '100%' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" style={{ marginRight: lang === 'ar' ? '0' : '4px', marginLeft: lang === 'ar' ? '4px' : '0' }}>
            <path d="M216,104v8a56.06,56.06,0,0,1-48.44,55.47A39.8,39.8,0,0,1,176,192v40a8,8,0,0,1-8,8H104a8,8,0,0,1-8-8V216H72a40,40,0,0,1-40-40A24,24,0,0,0,8,152a8,8,0,0,1,0-16,40,40,0,0,1,40,40,24,24,0,0,0,24,24H96v-8a39.8,39.8,0,0,1,8.44-24.53A56.06,56.06,0,0,1,56,112v-8a58.14,58.14,0,0,1,7.69-28.32A59.78,59.78,0,0,1,69.07,28,8,8,0,0,1,76,24a59.75,59.75,0,0,1,48,24h24a59.75,59.75,0,0,1,48-24,8,8,0,0,1,6.93,4,59.74,59.74,0,0,1,5.37,47.68A58,58,0,0,1,216,104Z"></path>
          </svg>
          <span>{t.githubLogin}</span>
        </button>

        {/* Switch mode trigger link */}
        <div style={{
          marginTop: '16px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '12px',
          textAlign: 'center',
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>
            {mode === 'signin' ? t.noAccount : t.haveAccount}
          </span>
          <button
            type="button"
            onClick={toggleMode}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--accent-text)',
              fontWeight: '600',
              padding: 0,
              fontSize: '13px'
            }}
          >
            {mode === 'signin' ? t.signUpLink : t.signInLink}
          </button>
        </div>

      </div>

      {/* In front of Card Crowd (z_20) */}
      <div style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        width: 0,
        height: 0,
        zIndex: 0,
        pointerEvents: 'none'
      }}>
        {backgroundData.z_20.map((img: any, i: number) => (
          <img
            key={`bg-z20-${i}`}
            src={`${img.src}?v=4`}
            alt=""
            className="hilos-crowd-img"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              userSelect: 'none',
              left: img.style.left,
              top: img.style.top,
              width: img.style.width || 'var(--login-crowd-size)',
              transform: img.style.transform,
              transformOrigin: img.style['transform-origin'] || '50% 72%',
              transition: img.style.transition || 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',
              zIndex: parseInt(img.style['z-index'] || '10'),
              animationDelay: `${((i + 12) * -0.19).toFixed(2)}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};
