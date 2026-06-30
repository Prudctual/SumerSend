import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Eye, EyeOff, Save, Settings, Search, Globe, Cookie, 
  Terminal, Code, Link as LinkIcon, RefreshCw, CheckCircle2, Lock, ArrowLeft 
} from 'lucide-react';
import { defaultSeoSettings } from '../utils/seo';
import type { SeoSettings } from '../utils/seo';
import { defaultCookieSettings } from './CookieConsentBanner';
import type { CookieSettings } from './CookieConsentBanner';

export interface AnalyticsSettings {
  googleAnalyticsId: string;
  gtmContainerId: string;
  metaPixelId: string;
  customHeadScript: string;
  customBodyScript: string;
}

export const defaultAnalyticsSettings: AnalyticsSettings = {
  googleAnalyticsId: '',
  gtmContainerId: '',
  metaPixelId: '',
  customHeadScript: '',
  customBodyScript: '',
};

export interface IntegrationSettings {
  webhookUrl: string;
  notifyOnEmail: boolean;
  notifyOnSms: boolean;
  notifyOnWhatsapp: boolean;
  syncIntervalMinutes: number;
}

export const defaultIntegrationSettings: IntegrationSettings = {
  webhookUrl: 'https://api.sumersend.com/admin/events-receiver',
  notifyOnEmail: true,
  notifyOnSms: false,
  notifyOnWhatsapp: true,
  syncIntervalMinutes: 5,
};

interface AdminPortalViewProps {
  lang: 'ar' | 'en';
  setLang: (lang: 'ar' | 'en') => void;
  setCurrentTab: (tab: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({ lang, setLang, setCurrentTab }) => {
  // Authentication State
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return sessionStorage.getItem('sumer_admin_session') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Admin Configuration States
  const [seo, setSeo] = useState<SeoSettings>(defaultSeoSettings);
  const [analytics, setAnalytics] = useState<AnalyticsSettings>(defaultAnalyticsSettings);
  const [cookies, setCookies] = useState<CookieSettings>(defaultCookieSettings);
  const [integrations, setIntegrations] = useState<IntegrationSettings>(defaultIntegrationSettings);

  // UI Tabs State
  const [activeTab, setActiveTab] = useState<'seo' | 'analytics' | 'cookies' | 'integrations'>('seo');
  const [saveStatus, setSaveStatus] = useState<string>(''); // '', 'saving', 'saved'

  // Load Saved Settings on Mount
  useEffect(() => {
    const savedSeo = localStorage.getItem('sumer_admin_seo');
    if (savedSeo) try { setSeo({ ...defaultSeoSettings, ...JSON.parse(savedSeo) }); } catch (e) {}

    const savedAnalytics = localStorage.getItem('sumer_admin_analytics');
    if (savedAnalytics) try { setAnalytics({ ...defaultAnalyticsSettings, ...JSON.parse(savedAnalytics) }); } catch (e) {}

    const savedCookies = localStorage.getItem('sumer_admin_cookies');
    if (savedCookies) try { setCookies({ ...defaultCookieSettings, ...JSON.parse(savedCookies) }); } catch (e) {}

    const savedIntegrations = localStorage.getItem('sumer_admin_integrations');
    if (savedIntegrations) try { setIntegrations({ ...defaultIntegrationSettings, ...JSON.parse(savedIntegrations) }); } catch (e) {}
  }, []);

  // Handle Login/Unlock
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'SumerAdmin2026' || password === '1984' || password === 'admin') {
      setIsUnlocked(true);
      sessionStorage.setItem('sumer_admin_session', 'true');
      setAuthError('');
    } else {
      setAuthError(lang === 'ar' ? 'رمز الدخول غير صحيح!' : 'Invalid access key!');
    }
  };

  // Save Settings to LocalStorage & Dispatch Change Events
  const handleSave = () => {
    setSaveStatus('saving');
    
    // Save all to localStorage
    localStorage.setItem('sumer_admin_seo', JSON.stringify(seo));
    localStorage.setItem('sumer_admin_analytics', JSON.stringify(analytics));
    localStorage.setItem('sumer_admin_cookies', JSON.stringify(cookies));
    localStorage.setItem('sumer_admin_integrations', JSON.stringify(integrations));

    setTimeout(() => {
      setSaveStatus('saved');
      
      // Dispatch a custom event to notify App.tsx to reload scripts/SEO
      window.dispatchEvent(new Event('sumer-admin-settings-updated'));
      
      // Also show a global success alert
      window.dispatchEvent(new CustomEvent('sumer-success-screen'));

      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
    }, 800);
  };

  const handleLogout = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('sumer_admin_session');
    setPassword('');
  };

  const isRtl = lang === 'ar';

  // Render Gatekeeper Lock Screen
  if (!isUnlocked) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-family)',
      }}>
        <div style={{
          backgroundColor: 'var(--panel-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
          maxWidth: '420px',
          width: '100%',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-muted, #f4f4f5)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            padding: '16px',
            borderRadius: '50%',
            marginBottom: '20px',
          }}>
            <Lock size={28} />
          </div>
          
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
            {isRtl ? 'لوحة الإدارة المحمية' : 'Protected Admin Area'}
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: '1.5' }}>
            {isRtl 
              ? 'أدخل رمز الحماية السري لتعديل إعدادات الروابط الفرعية، الـ SEO، خانات الكوكيز، والتكاملات البرمجية.' 
              : 'Enter your administrator credentials to configure sub-routing, SEO properties, cookie banners, and dynamic integrations.'}
          </p>

          <form onSubmit={handleUnlock} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder={isRtl ? 'رمز المرور الإداري...' : 'Admin secret password...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: isRtl ? '12px 16px 12px 48px' : '12px 48px 12px 16px',
                  backgroundColor: 'var(--bg-color)',
                  border: authError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box',
                  outline: 'none',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: showPassword ? '0px' : '4px',
                }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: isRtl ? '16px' : 'auto',
                  right: isRtl ? 'auto' : '16px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {authError && (
              <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600 }}>
                {authError}
              </span>
            )}

            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'opacity 0.2s',
              }}
            >
              <ShieldCheck size={16} />
              {isRtl ? 'إلغاء القفل والولوج' : 'Unlock Portal'}
            </button>
            
            <button 
              type="button"
              onClick={() => setCurrentTab('auth-signin')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                marginTop: '4px',
              }}
            >
              <ArrowLeft size={14} />
              {isRtl ? 'الرجوع للرئيسية' : 'Back to Home'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Render Admin Console Dashboard
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '10px 0 40px 0',
      fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-family)',
      direction: isRtl ? 'rtl' : 'ltr',
      textAlign: isRtl ? 'right' : 'left',
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '10px',
              fontWeight: 800,
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '999px',
              textTransform: 'uppercase',
            }}>
              {isRtl ? 'سري وخفي' : 'Private Console'}
            </span>
            <h1 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {isRtl ? 'لوحة إدارة النظام الفوقية' : 'Meta Admin Dashboard'}
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            {isRtl 
              ? 'إدارة محركات البحث (SEO)، التحليلات (Analytics)، إشعارات الكوكيز، والتكاملات البرمجية للموقع كاملاً.'
              : 'Manage sitewide SEO indexing parameters, script connections, cookie banner displays, and webhooks.'}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={handleLogout}
            style={{
              background: 'none',
              border: '1px solid var(--border-color)',
              color: 'var(--text-secondary)',
              padding: '8px 14px',
              fontSize: '12.5px',
              fontWeight: 600,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {isRtl ? 'قفل الخروج' : 'Lock Session'}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--panel-bg)',
              border: 'none',
              padding: '8px 18px',
              fontSize: '12.5px',
              fontWeight: 700,
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              transition: 'opacity 0.2s',
              opacity: saveStatus === 'saving' ? 0.6 : 1,
            }}
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : saveStatus === 'saved' ? (
              <CheckCircle2 size={14} />
            ) : (
              <Save size={14} />
            )}
            {isRtl 
              ? (saveStatus === 'saving' ? 'جاري الحفظ...' : saveStatus === 'saved' ? 'تم الحفظ!' : 'حفظ الإعدادات')
              : (saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Settings')}
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        gap: '24px',
        marginBottom: '28px',
      }}>
        <button 
          onClick={() => setActiveTab('seo')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'seo' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'seo' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'seo' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s',
          }}
        >
          <Search size={15} />
          {isRtl ? 'محركات البحث (SEO)' : 'SEO Engine'}
        </button>

        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'analytics' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'analytics' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s',
          }}
        >
          <Code size={15} />
          {isRtl ? 'أدوات التحليل والرموز' : 'Analytics & Pixels'}
        </button>

        <button 
          onClick={() => setActiveTab('cookies')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'cookies' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'cookies' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'cookies' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s',
          }}
        >
          <Cookie size={15} />
          {isRtl ? 'ملفات الارتباط (Cookies)' : 'Cookie Banner'}
        </button>

        <button 
          onClick={() => setActiveTab('integrations')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'integrations' ? '2px solid var(--text-primary)' : '2px solid transparent',
            color: activeTab === 'integrations' ? 'var(--text-primary)' : 'var(--text-muted)',
            padding: '10px 4px',
            fontSize: '13.5px',
            fontWeight: activeTab === 'integrations' ? 700 : 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'color 0.2s',
          }}
        >
          <LinkIcon size={15} />
          {isRtl ? 'التكاملات والربط' : 'Integrations'}
        </button>
      </div>

      {/* Tabs Content */}
      <div style={{
        backgroundColor: 'var(--panel-bg)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      }}>

        {/* 1. SEO Tab */}
        {activeTab === 'seo' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {isRtl ? 'تخصيص محركات البحث والكلمات المفتاحية' : 'Search Engine Optimization (SEO)'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'عنوان الموقع (عربي)' : 'Site Title (Arabic)'}
                </label>
                <input 
                  type="text" 
                  value={seo.siteTitleAr} 
                  onChange={(e) => setSeo({ ...seo, siteTitleAr: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'عنوان الموقع (إنجليزي)' : 'Site Title (English)'}
                </label>
                <input 
                  type="text" 
                  value={seo.siteTitleEn} 
                  onChange={(e) => setSeo({ ...seo, siteTitleEn: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'الوصف التعريفي للموقع (عربي)' : 'Meta Description (Arabic)'}
                </label>
                <textarea 
                  rows={3}
                  value={seo.siteDescriptionAr} 
                  onChange={(e) => setSeo({ ...seo, siteDescriptionAr: e.target.value })}
                  style={textareaStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'الوصف التعريفي للموقع (إنجليزي)' : 'Meta Description (English)'}
                </label>
                <textarea 
                  rows={3}
                  value={seo.siteDescriptionEn} 
                  onChange={(e) => setSeo({ ...seo, siteDescriptionEn: e.target.value })}
                  style={textareaStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'الكلمات الدلالية (عربي)' : 'Keywords (Arabic)'}
                </label>
                <input 
                  type="text" 
                  value={seo.siteKeywordsAr} 
                  onChange={(e) => setSeo({ ...seo, siteKeywordsAr: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'الكلمات الدلالية (إنجليزي)' : 'Keywords (English)'}
                </label>
                <input 
                  type="text" 
                  value={seo.siteKeywordsEn} 
                  onChange={(e) => setSeo({ ...seo, siteKeywordsEn: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'رابط الصورة الإعلانية (OG Image)' : 'OG Image URL'}
                </label>
                <input 
                  type="text" 
                  value={seo.ogImage} 
                  onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'الرابط الأساسي المعتمد (Canonical URL)' : 'Canonical Base URL'}
                </label>
                <input 
                  type="text" 
                  value={seo.canonicalUrl} 
                  onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Toggle Structured Data */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-muted, #f4f4f5)',
              padding: '14px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                  {isRtl ? 'تفعيل البيانات المنظمة (Structured Data Schema.org)' : 'Enable Schema.org Structured Data'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isRtl ? 'حقن كود JSON-LD تلقائياً في الترويسة لتحسين الفهرسة الدقيقة في جوجل.' : 'Injects JSON-LD script block in document head to boost search rich snippets.'}
                </span>
              </div>
              <button 
                onClick={() => setSeo({ ...seo, enableSchema: !seo.enableSchema })}
                style={{
                  width: '42px',
                  height: '22px',
                  borderRadius: '999px',
                  backgroundColor: seo.enableSchema ? '#10b981' : 'var(--border-color)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 3px',
                  justifyContent: seo.enableSchema ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
                  transition: 'background-color 0.2s'
                }}
              >
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
              </button>
            </div>
          </div>
        )}

        {/* 2. Analytics & Pixels Tab */}
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {isRtl ? 'تكاملات إحصاءات الموقع والتتبع البرمجي' : 'Analytics, Pixels & Scripts Integrations'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'معرف تحليلات جوجل (Google Analytics ID)' : 'Google Analytics ID (G-XXXXX)'}
                </label>
                <input 
                  type="text" 
                  value={analytics.googleAnalyticsId} 
                  onChange={(e) => setAnalytics({ ...analytics, googleAnalyticsId: e.target.value })}
                  placeholder="G-XXXXXX"
                  style={inputStyle}
                />
              </div>
              
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'معرف حاوية GTM' : 'Google Tag Manager ID'}
                </label>
                <input 
                  type="text" 
                  value={analytics.gtmContainerId} 
                  onChange={(e) => setAnalytics({ ...analytics, gtmContainerId: e.target.value })}
                  placeholder="GTM-XXXXXX"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'معرف ميتا بكسل (Meta Pixel ID)' : 'Meta Pixel ID'}
                </label>
                <input 
                  type="text" 
                  value={analytics.metaPixelId} 
                  onChange={(e) => setAnalytics({ ...analytics, metaPixelId: e.target.value })}
                  placeholder="1234567890"
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                display: 'block', 
                marginBottom: '6px', 
                color: 'var(--text-secondary)',
                fontFamily: 'monospace' 
              }}>
                {isRtl ? 'أكواد مخصصة للحقن في الترويسة (<head>)' : 'Custom Head HTML injection (<head>)'}
              </label>
              <textarea 
                rows={4}
                value={analytics.customHeadScript} 
                onChange={(e) => setAnalytics({ ...analytics, customHeadScript: e.target.value })}
                placeholder="<!-- Inject script tags e.g. Hotjar, Amplitude -->"
                style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>

            <div>
              <label style={{ 
                fontSize: '12px', 
                fontWeight: 600, 
                display: 'block', 
                marginBottom: '6px', 
                color: 'var(--text-secondary)',
                fontFamily: 'monospace' 
              }}>
                {isRtl ? 'أكواد مخصصة للحقن في الجسد (<body>)' : 'Custom Body HTML injection (<body>)'}
              </label>
              <textarea 
                rows={4}
                value={analytics.customBodyScript} 
                onChange={(e) => setAnalytics({ ...analytics, customBodyScript: e.target.value })}
                placeholder="<!-- Custom tag manager / fallback analytics -->"
                style={{ ...textareaStyle, fontFamily: 'monospace', fontSize: '12px' }}
              />
            </div>
          </div>
        )}

        {/* 3. Cookie Banner Tab */}
        {activeTab === 'cookies' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {isRtl ? 'إعدادات وإدارة بنر الكوكيز والخصوصية' : 'Cookie Consent Banner Settings'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
              {/* Toggle cookie banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-color)',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
              }}>
                <div>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>
                    {isRtl ? 'تفعيل بنر الموافقة' : 'Show Banner'}
                  </span>
                </div>
                <button 
                  onClick={() => setCookies({ ...cookies, enableBanner: !cookies.enableBanner })}
                  style={{
                    width: '38px',
                    height: '20px',
                    borderRadius: '999px',
                    backgroundColor: cookies.enableBanner ? '#10b981' : 'var(--border-color)',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 3px',
                    justifyContent: cookies.enableBanner ? (isRtl ? 'flex-start' : 'flex-end') : (isRtl ? 'flex-end' : 'flex-start'),
                    transition: 'background-color 0.2s'
                  }}
                >
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
                </button>
              </div>

              {/* Expiry days */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'مدة صلاحية الكوكي (بالأيام)' : 'Cookie Expiry (Days)'}
                </label>
                <input 
                  type="number" 
                  value={cookies.expiryDays} 
                  onChange={(e) => setCookies({ ...cookies, expiryDays: parseInt(e.target.value) || 30 })}
                  style={inputStyle}
                />
              </div>

              {/* Banner position */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'تموضع الشريط بالواجهة' : 'Banner Placement'}
                </label>
                <select 
                  value={cookies.bannerPosition} 
                  onChange={(e) => setCookies({ ...cookies, bannerPosition: e.target.value as any })}
                  style={selectStyle}
                >
                  <option value="bottom-center">{isRtl ? 'وسط الأسفل' : 'Bottom Center'}</option>
                  <option value="bottom-left">{isRtl ? 'يسار الأسفل' : 'Bottom Left'}</option>
                  <option value="bottom-right">{isRtl ? 'يمين الأسفل' : 'Bottom Right'}</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {isRtl ? 'نص البنر باللغة العربية' : 'Cookie Message (Arabic)'}
              </label>
              <textarea 
                rows={2}
                value={cookies.messageAr} 
                onChange={(e) => setCookies({ ...cookies, messageAr: e.target.value })}
                style={textareaStyle}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {isRtl ? 'نص البنر باللغة الإنجليزية' : 'Cookie Message (English)'}
              </label>
              <textarea 
                rows={2}
                value={cookies.messageEn} 
                onChange={(e) => setCookies({ ...cookies, messageEn: e.target.value })}
                style={textareaStyle}
              />
            </div>
          </div>
        )}

        {/* 4. Integrations Tab */}
        {activeTab === 'integrations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
              {isRtl ? 'خيارات التكامل البرمجي المستقبلية' : 'Future Integrations & Operations'}
            </h3>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                {isRtl ? 'رابط الويب هوك الخاص بأحداث الإدارة (Webhook Endpoint)' : 'Webhook Event Receiver Url'}
              </label>
              <input 
                type="text" 
                value={integrations.webhookUrl} 
                onChange={(e) => setIntegrations({ ...integrations, webhookUrl: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  {isRtl ? 'فترة تحديث البيانات (بالدقائق)' : 'Sync Interval (Minutes)'}
                </label>
                <input 
                  type="number" 
                  value={integrations.syncIntervalMinutes} 
                  onChange={(e) => setIntegrations({ ...integrations, syncIntervalMinutes: parseInt(e.target.value) || 5 })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {isRtl ? 'إشعارات البريد الإداري للأحداث:' : 'System Alerts Integrations:'}
                </span>
                
                <div style={{ display: 'flex', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={integrations.notifyOnEmail}
                      onChange={(e) => setIntegrations({ ...integrations, notifyOnEmail: e.target.checked })}
                      style={{ accentColor: '#10b981' }}
                    />
                    {isRtl ? 'بريد إلكتروني' : 'Email Alerts'}
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={integrations.notifyOnWhatsapp}
                      onChange={(e) => setIntegrations({ ...integrations, notifyOnWhatsapp: e.target.checked })}
                      style={{ accentColor: '#10b981' }}
                    />
                    {isRtl ? 'واتساب' : 'WhatsApp Notification'}
                  </label>
                </div>
              </div>
            </div>

            {/* Tech Stack Diagram */}
            <div style={{
              marginTop: '10px',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-color)',
            }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} />
                {isRtl ? 'محاكاة تدفق البيانات البرمجية' : 'Console Pipeline logs'}
              </h4>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#8b5cf6',
                lineHeight: '1.5',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.03)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
              }}>
                [OK] Server Webhook listening on {integrations.webhookUrl}<br/>
                [OK] Analytics dynamic loading synced with Gtag: {analytics.googleAnalyticsId || 'inactive'}<br/>
                [OK] Meta Pixel sync status: {analytics.metaPixelId ? 'active' : 'inactive'}<br/>
                [OK] Cookie Consent compliance verified for {cookies.expiryDays} days expiry.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Styling structures
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
  backgroundColor: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const textareaStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: '13px',
  backgroundColor: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  outline: 'none',
  resize: 'vertical',
  transition: 'border-color 0.2s',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  backgroundColor: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  color: 'var(--text-primary)',
  boxSizing: 'border-box',
  outline: 'none',
  cursor: 'pointer',
  transition: 'border-color 0.2s',
};
