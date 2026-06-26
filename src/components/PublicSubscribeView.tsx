import React, { useState, useEffect } from 'react';
import { Mail, User, Phone, CheckCircle2, AlertCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicSubscribeViewProps {
  userId: string;
}

export function PublicSubscribeView({ userId }: PublicSubscribeViewProps) {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [publisherName, setPublisherName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Translation dictionary
  const t = {
    ar: {
      title: 'انضم إلينا',
      subtitle: 'انضم إلى القائمة البريدية ليصلك كل جديد ومميز',
      by: 'بواسطة',
      nameLabel: 'الاسم الكامل',
      emailLabel: 'البريد الإلكتروني',
      phoneLabel: 'رقم الهاتف (اختياري)',
      namePlaceholder: 'أدخل اسمك الكريم',
      emailPlaceholder: 'name@example.com',
      phonePlaceholder: '078xxxxxxxx',
      submitBtn: 'اشترك الآن',
      submittingBtn: 'جاري الاشتراك...',
      successTitle: 'تم الاشتراك بنجاح!',
      successDesc: 'شكراً لانضمامك إلينا. ستصلك رسالة ترحيبية على بريدك الإلكتروني قريباً.',
      backBtn: 'العودة',
      invalidEmail: 'يرجى إدخال بريد إلكتروني صالح.',
      loadingText: 'جاري تحميل الصفحة...',
      publisherNotFound: 'الناشر غير موجود أو غير معرف في المنصة.',
      secText: 'بياناتك آمنة ومحمية بالكامل.'
    },
    en: {
      title: 'Subscribe Now',
      subtitle: 'Join the mailing list to receive the latest updates directly in your inbox.',
      by: 'by',
      nameLabel: 'Full Name',
      emailLabel: 'Email Address',
      phoneLabel: 'Phone Number (Optional)',
      namePlaceholder: 'Enter your full name',
      emailPlaceholder: 'name@example.com',
      phonePlaceholder: '078xxxxxxxx',
      submitBtn: 'Subscribe',
      submittingBtn: 'Subscribing...',
      successTitle: 'Subscribed Successfully!',
      successDesc: 'Thank you for joining. A welcome email is on its way to your inbox.',
      backBtn: 'Back',
      invalidEmail: 'Please enter a valid email address.',
      loadingText: 'Loading page...',
      publisherNotFound: 'Publisher profile not found.',
      secText: 'Your data is fully secure and protected.'
    }
  }[lang];

  useEffect(() => {
    // Detect browser language or query parameter
    const params = new URLSearchParams(window.location.search);
    const queryLang = params.get('lang');
    if (queryLang === 'en' || queryLang === 'ar') {
      setLang(queryLang);
    } else {
      const browserLang = navigator.language.substring(0, 2);
      if (browserLang === 'en' || browserLang === 'ar') {
        setLang(browserLang as 'en' | 'ar');
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/public/users/${userId}/profile`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Not found');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          setPublisherName(data.name || '');
        } else {
          throw new Error('Invalid response type');
        }
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        setError(t.publisherNotFound);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError(t.invalidEmail);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/public/subscribers/join/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, phone, metadata: { source: 'hosted_page' } })
      });

      let data: any = {};
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || `Request failed with status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLanguageToggle = () => {
    setLang(prev => prev === 'ar' ? 'en' : 'ar');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#09090b', color: '#ffffff', fontFamily: 'Cairo, Inter, sans-serif' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#ffffff', marginBottom: '16px' }} />
        <span style={{ fontSize: '15px', color: '#a1a1aa' }}>{t.loadingText}</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#09090b',
      color: '#ffffff',
      fontFamily: lang === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Accent Gradients */}
      <div style={{
        position: 'absolute',
        top: '-15%',
        left: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-15%',
        right: '10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(147,51,234,0.05) 0%, rgba(0,0,0,0) 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <header style={{
        padding: '24px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} style={{ color: '#3b82f6' }} />
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>SUMER SEND</span>
        </div>
        <button
          onClick={handleLanguageToggle}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#a1a1aa',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </header>

      {/* Main Content Area */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          background: '#121214',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          padding: '40px 32px',
          direction: lang === 'ar' ? 'rtl' : 'ltr',
          textAlign: lang === 'ar' ? 'right' : 'left'
        }}>
          {success ? (
            /* Success State Card */
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 0',
              textAlign: 'center'
            }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(34,197,94,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px',
                border: '2px solid rgba(34,197,94,0.3)',
                color: '#22c55e'
              }}>
                <CheckCircle2 size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px 0' }}>{t.successTitle}</h2>
              <p style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.6', margin: '0 0 32px 0' }}>{t.successDesc}</p>
              
              <button
                onClick={() => {
                  setSuccess(false);
                  setName('');
                  setEmail('');
                  setPhone('');
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                {t.backBtn}
              </button>
            </div>
          ) : (
            /* Subscription Form Card */
            <>
              <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>{t.title}</h1>
                <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                  {t.subtitle} {publisherName && (
                    <>
                      {' '}
                      <span style={{ color: '#3b82f6', fontWeight: 700 }}>
                        {t.by} {publisherName}
                      </span>
                    </>
                  )}
                </p>
              </div>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '24px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Name Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="name" style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>
                    {t.nameLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: lang === 'ar' ? '16px' : '42px',
                        paddingRight: lang === 'ar' ? '42px' : '16px',
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <User size={18} style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: lang === 'ar' ? 'auto' : '14px',
                      right: lang === 'ar' ? '14px' : 'auto',
                      color: '#52525b'
                    }} />
                  </div>
                </div>

                {/* Email Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="email" style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>
                    {t.emailLabel} <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: lang === 'ar' ? '16px' : '42px',
                        paddingRight: lang === 'ar' ? '42px' : '16px',
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <Mail size={18} style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: lang === 'ar' ? 'auto' : '14px',
                      right: lang === 'ar' ? '14px' : 'auto',
                      color: '#52525b'
                    }} />
                  </div>
                </div>

                {/* Phone Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label htmlFor="phone" style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>
                    {t.phoneLabel}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingLeft: lang === 'ar' ? '16px' : '42px',
                        paddingRight: lang === 'ar' ? '42px' : '16px',
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        color: '#ffffff',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <Phone size={18} style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      left: lang === 'ar' ? 'auto' : '14px',
                      right: lang === 'ar' ? '14px' : 'auto',
                      color: '#52525b'
                    }} />
                  </div>
                </div>

                {/* Honeypot hidden input to catch bots */}
                <input type="text" name="honeypot" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(59,130,246,0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.3)';
                    }
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{t.submittingBtn}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.submitBtn}</span>
                      <ArrowRight size={18} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* Secure details footer */}
          <div style={{
            marginTop: '32px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#52525b',
            borderTop: '1px solid rgba(255,255,255,0.03)',
            paddingTop: '20px'
          }}>
            {t.secText}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        textAlign: 'center',
        fontSize: '12px',
        color: '#52525b',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10
      }}>
        &copy; {new Date().getFullYear()} Sumer Send. All rights reserved.
      </footer>
    </div>
  );
}
