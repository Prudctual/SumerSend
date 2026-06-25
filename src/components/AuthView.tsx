import React, { useState } from 'react';
import { Mail, Lock, User, Globe, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';

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
      brand: 'Sumer Send',
      tagline: 'Transactional Messaging Infrastructure',
      signInTitle: 'Sign in to Sumer Send',
      signUpTitle: 'Create your developer account',
      signInDesc: 'Enter your credentials to access your dispatch dashboard',
      signUpDesc: 'Start sending SMS, WhatsApp, and Emails in minutes',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Jasim Kareem',
      emailAddress: 'Email Address',
      emailPlaceholder: 'name@company.com',
      password: 'Password',
      passwordPlaceholder: '••••••••',
      signInBtn: 'Sign In',
      signUpBtn: 'Create Account',
      loadingSignIn: 'Signing in...',
      loadingSignUp: 'Creating account...',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
      signUpLink: 'Sign up for free',
      signInLink: 'Sign in instead',
      backToHome: 'Back to Home',
      invalidEmail: 'Please enter a valid email address.',
      passwordLength: 'Password must be at least 6 characters.',
      nameRequired: 'Name is required.',
      or: 'or'
    },
    ar: {
      brand: 'سومر سيند',
      tagline: 'البنية التحتية لإرسال الإشعارات والمعاملات',
      signInTitle: 'تسجيل الدخول إلى سومر سيند',
      signUpTitle: 'إنشاء حساب مطور جديد',
      signInDesc: 'أدخل بيانات الاعتماد للوصول إلى لوحة التحكم والإرسال الخاصة بك',
      signUpDesc: 'ابدأ بإرسال رسائل الـ SMS، الواتساب، والبريد الإلكتروني خلال دقائق',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'جاسم كريم',
      emailAddress: 'البريد الإلكتروني',
      emailPlaceholder: 'name@company.com',
      password: 'كلمة المرور',
      passwordPlaceholder: '••••••••',
      signInBtn: 'تسجيل الدخول',
      signUpBtn: 'إنشاء حساب جديد',
      loadingSignIn: 'جاري التحقق من البيانات...',
      loadingSignUp: 'جاري تهيئة بيئة المطور...',
      noAccount: 'ليس لديك حساب مطور؟',
      haveAccount: 'لديك حساب مطور بالفعل؟',
      signUpLink: 'سجل مجاناً الآن',
      signInLink: 'تسجيل الدخول بدلاً من ذلك',
      backToHome: 'العودة للرئيسية',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صحيح.',
      passwordLength: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
      nameRequired: 'الاسم الكامل مطلوب.',
      or: 'أو'
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
      const response = await fetch(`http://127.0.0.1:3000${endpoint}`, {
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
      
      // Notify parent app of success
      onAuthSuccess(data.token, data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error, please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
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
          className="auth-back-btn"
        >
          {t.backToHome}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="auth-nav-btn"
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="auth-nav-btn"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      {/* Card wrapper */}
      <div style={{
        width: '100%',
        maxWidth: '430px',
        background: 'var(--panel-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: theme === 'dark' 
          ? '0 1px 1px rgba(0,0,0,0.02), 0 8px 16px -4px rgba(0,0,0,0.3), 0 24px 32px -8px rgba(0,0,0,0.4)' 
          : '0 1px 1px rgba(0,0,0,0.02), 0 8px 16px -4px rgba(0,0,0,0.04), 0 24px 32px -8px rgba(0,0,0,0.06)',
        zIndex: 1,
        transition: 'all 0.3s ease'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--panel-bg)',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--panel-bg)' }}>
              <path d="M12 3L3 12H7V20H17V12H21L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
            letterSpacing: '-0.3px'
          }}>
            {mode === 'signin' ? t.signInTitle : t.signUpTitle}
          </h1>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {mode === 'signin' ? t.signInDesc : t.signUpDesc}
          </p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div style={{
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--danger-color)',
            color: 'var(--danger-text)',
            borderRadius: '8px',
            padding: '10px 14px',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: lang === 'ar' ? 'right' : 'left'
          }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name Field (Sign Up Only) */}
          {mode === 'signup' && (
            <div>
              <label htmlFor="name-input" style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
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
                  className="auth-input"
                  style={{
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                />
                <User size={16} style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: lang === 'ar' ? 'auto' : '12px',
                  right: lang === 'ar' ? '12px' : 'auto',
                  color: 'var(--text-muted)',
                  pointerEvents: 'none'
                }} />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email-input" style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text-secondary)',
              marginBottom: '6px',
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
                className="auth-input auth-input-mono"
                style={{
                  textAlign: 'left'
                }}
              />
              <Mail size={16} style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: lang === 'ar' ? 'auto' : '12px',
                right: lang === 'ar' ? '12px' : 'auto',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <label htmlFor="password-input" style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-secondary)'
              }}>
                {t.password}
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                dir="ltr"
                className="auth-input auth-input-mono"
                style={{
                  textAlign: 'left'
                }}
              />
              <Lock size={16} style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: lang === 'ar' ? 'auto' : '12px',
                right: lang === 'ar' ? '12px' : 'auto',
                color: 'var(--text-muted)',
                pointerEvents: 'none'
              }} />
              
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="auth-submit-btn"
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

        {/* Separator / Switch Mode */}
        <div style={{
          marginTop: '28px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          textAlign: 'center',
          fontSize: '13px',
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
              color: 'var(--accent-color)',
              fontWeight: '600',
              padding: 0,
              fontSize: '13px'
            }}
          >
            {mode === 'signin' ? t.signUpLink : t.signInLink}
          </button>
        </div>

      </div>
    </div>
  );
};
