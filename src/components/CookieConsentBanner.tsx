import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Settings, Check } from 'lucide-react';

export interface CookieSettings {
  enableBanner: boolean;
  expiryDays: number;
  bannerPosition: 'bottom-center' | 'bottom-left' | 'bottom-right';
  messageAr: string;
  messageEn: string;
  primaryColor: string;
}

export const defaultCookieSettings: CookieSettings = {
  enableBanner: true,
  expiryDays: 30,
  bannerPosition: 'bottom-center',
  messageAr: 'نستخدم ملفات تعريف الارتباط (Cookies) لتحسين تجربتك البرمجية وتوفير سجلات إرسال دقيقة. هل توافق على سياسة الاستخدام الخاصة بنا؟',
  messageEn: 'We use cookies to enhance your developer experience and provide accurate delivery analytics. Do you accept our cookie policy?',
  primaryColor: '#09090b', // Sleek dark/zinc theme
};

interface CookieConsentBannerProps {
  lang: 'ar' | 'en';
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ lang }) => {
  const [show, setShow] = useState(false);
  const [settings, setSettings] = useState<CookieSettings>(defaultCookieSettings);
  const [showCustomize, setShowCustomize] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // 1. Check if banner is enabled in admin settings
    const adminSaved = localStorage.getItem('sumer_admin_cookies');
    let activeSettings = defaultCookieSettings;
    if (adminSaved) {
      try {
        activeSettings = { ...defaultCookieSettings, ...JSON.parse(adminSaved) };
        setSettings(activeSettings);
      } catch (e) {
        console.error('Failed to parse cookie settings', e);
      }
    }

    if (!activeSettings.enableBanner) {
      setShow(false);
      return;
    }

    // 2. Check if user already consented
    const userConsent = localStorage.getItem('sumer_cookie_consent');
    if (!userConsent) {
      // Delay showing the banner slightly for a premium feel
      const timer = setTimeout(() => {
        setShow(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Accept all cookies
  const handleAcceptAll = () => {
    localStorage.setItem('sumer_cookie_consent', JSON.stringify({
      status: 'accepted',
      categories: { essential: true, analytics: true, marketing: true },
      timestamp: new Date().toISOString()
    }));
    setShow(false);
  };

  // Save customized preferences
  const handleSavePreferences = () => {
    localStorage.setItem('sumer_cookie_consent', JSON.stringify({
      status: 'customized',
      categories: preferences,
      timestamp: new Date().toISOString()
    }));
    setShow(false);
  };

  // Decline non-essential cookies
  const handleDeclineAll = () => {
    localStorage.setItem('sumer_cookie_consent', JSON.stringify({
      status: 'declined',
      categories: { essential: true, analytics: false, marketing: false },
      timestamp: new Date().toISOString()
    }));
    setShow(false);
  };

  if (!show) return null;

  // Determine positioning style
  let positionStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    zIndex: 9999,
    maxWidth: '540px',
    width: 'calc(100% - 48px)',
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  };

  if (settings.bannerPosition === 'bottom-left') {
    positionStyle.left = '24px';
  } else if (settings.bannerPosition === 'bottom-right') {
    positionStyle.right = '24px';
  } else {
    // bottom-center
    positionStyle.left = '50%';
    positionStyle.transform = 'translateX(-50%)';
  }

  const isRtl = lang === 'ar';

  return (
    <div 
      style={positionStyle}
      className="cookie-banner-animated"
    >
      <div style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: '0 16px 32px -8px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-family)',
        color: 'var(--text-primary)',
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
      }}>
        {/* Banner Header */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: '10px',
            borderRadius: '8px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Cookie size={20} />
          </div>
          <div style={{ flex: 1, paddingTop: '2px' }}>
            <h4 style={{
              margin: '0 0 6px 0',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {isRtl ? 'ملفات تعريف الارتباط والخصوصية' : 'Cookies & Privacy Policy'}
            </h4>
            <p style={{
              margin: 0,
              fontSize: '12.5px',
              lineHeight: '1.6',
              color: 'var(--text-secondary)',
              fontWeight: 500
            }}>
              {isRtl ? settings.messageAr : settings.messageEn}
            </p>
          </div>
          <button 
            onClick={handleDeclineAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '2px'
            }}
            title={isRtl ? 'إغلاق' : 'Close'}
          >
            <X size={15} />
          </button>
        </div>

        {/* Customization Details Accordion */}
        {showCustomize && (
          <div style={{
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px dashed var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'fadeIn 0.2s ease'
          }}>
            {/* Essential */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                  {isRtl ? 'الأساسية (إجبارية)' : 'Essential (Required)'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {isRtl ? 'تُستخدم لحفظ التفضيلات وإدارة الجلسات بشكل آمن.' : 'Used for secure authentication and saving consent choices.'}
                </span>
              </div>
              <div style={{
                width: '38px',
                height: '20px',
                borderRadius: '999px',
                backgroundColor: 'var(--border-color)',
                position: 'relative',
                opacity: 0.6,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                padding: '0 4px',
                justifyContent: isRtl ? 'flex-start' : 'flex-end'
              }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--text-secondary)' }}></div>
              </div>
            </div>

            {/* Analytics */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                  {isRtl ? 'التحليلات والمتابعة' : 'Analytics & Performance'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {isRtl ? 'تساعدنا في فهم سلوك المطورين وأداء إرسال الإشعارات.' : 'Helps us measure traffic and monitor server notification loads.'}
                </span>
              </div>
              <button 
                onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                style={{
                  width: '38px',
                  height: '20px',
                  borderRadius: '999px',
                  backgroundColor: preferences.analytics ? 'var(--accent-text, #10b981)' : 'var(--border-color)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 3px',
                  justifyContent: preferences.analytics ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </button>
            </div>

            {/* Marketing */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ textAlign: isRtl ? 'right' : 'left' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                  {isRtl ? 'التسويق والتكامل' : 'Marketing & Integrations'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                  {isRtl ? 'مشاركة الإحصاءات مع قنوات الدعاية وشركائنا الإعلانيين.' : 'Enables custom targeting and shared pixel analytics.'}
                </span>
              </div>
              <button 
                onClick={() => setPreferences(p => ({ ...p, marketing: !p.marketing }))}
                style={{
                  width: '38px',
                  height: '20px',
                  borderRadius: '999px',
                  backgroundColor: preferences.marketing ? 'var(--accent-text, #10b981)' : 'var(--border-color)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 3px',
                  justifyContent: preferences.marketing ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </button>
            </div>
          </div>
        )}

        {/* Buttons Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '10px',
          marginTop: '16px',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setShowCustomize(!showCustomize)}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '7px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={13} />
            {isRtl ? (showCustomize ? 'إخفاء التخصيص' : 'تخصيص الخيارات') : (showCustomize ? 'Hide Settings' : 'Customize')}
          </button>
          
          <button 
            onClick={handleDeclineAll}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '7px 12px',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
          >
            {isRtl ? 'رفض الكل' : 'Decline'}
          </button>

          {showCustomize ? (
            <button 
              onClick={handleSavePreferences}
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'opacity 0.2s'
              }}
            >
              <Check size={13} />
              {isRtl ? 'حفظ تفضيلاتي' : 'Save Choices'}
            </button>
          ) : (
            <button 
              onClick={handleAcceptAll}
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                padding: '7px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'opacity 0.2s'
              }}
            >
              {isRtl ? 'قبول الكل' : 'Accept All'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
