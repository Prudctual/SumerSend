import React, { useState, useEffect, Suspense } from 'react';
import { 
  Mail, MessageSquare, Phone, Check, X, Search as SearchIcon, ChevronDown,
  LayoutDashboard, BarChart3, Activity, Wallet, Server, Globe, Key, 
  Webhook, ShieldCheck, Cpu, SunMoon, Languages, LogOut, Command, Terminal
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LogsView } from './components/LogsView';
import { ReportsView } from './components/ReportsView';
import { PlaygroundView } from './components/PlaygroundView';
import { CampaignsView } from './components/CampaignsView';
import { BillingView } from './components/BillingView';
import { SettingsIntegrationsView } from './components/SettingsIntegrationsView';
import { LandingView } from './components/LandingView';
import { SettingsView } from './components/SettingsView';
import { AuthView } from './components/AuthView';
import { SubscribersView } from './components/SubscribersView';
import { PublicSubscribeView } from './components/PublicSubscribeView';
import { ChannelsView } from './components/ChannelsView';
import { AnalyticsLogsView } from './components/AnalyticsLogsView';
import { PlatformSettingsView } from './components/PlatformSettingsView';
import { SkeletonView } from './components/SkeletonView';
import { getTabFromPath, getPathFromTab, updateSEOMetadata } from './utils/seo';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { AdminPortalView } from './components/AdminPortalView';
import NotificationsDropdown from './components/NotificationsDropdown';

import { useSumer } from './context/SumerContext';



export default function App() {
  const {
    currentTab,
    setCurrentTab,
    activeDashboardSubTab,
    setActiveDashboardSubTab,
    viewLoading,
    setViewLoading,
    sidebarCollapsed,
    setSidebarCollapsed,
    lang,
    setLang,
    theme,
    setTheme,
    showSuccessOverlay,
    setShowSuccessOverlay,
    isSearchOpen,
    setIsSearchOpen,
    profileOpen,
    setProfileOpen,
    token,
    setToken,
    user,
    setUser,
    authLoading,
    setAuthLoading,
    walletBalance,
    setWalletBalance,
    domains,
    setDomains,
    apiKeys,
    setApiKeys,
    webhooks,
    setWebhooks,
    logs,
    setLogs,
    transactions,
    setTransactions,
    phoneNotifications,
    setPhoneNotifications,
    emailSubject,
    setEmailSubject,
    emailBody,
    setEmailBody,
    msgBody,
    setMsgBody,
    playgroundChannel,
    setPlaygroundChannel,
    handleLogout
  } = useSumer();

  const renderBreadcrumb = () => {
    const mainSection = lang === 'ar' ? 'الخدمات الأساسية' : 'Core Services';
    const devSection = lang === 'ar' ? 'بوابة المطور' : 'Developer Hub';
    const settingsSection = lang === 'ar' ? 'إعدادات المنصة' : 'Platform Settings';

    switch (currentTab) {
      case 'dashboard':
        return `${mainSection} > ${lang === 'ar' ? 'لوحة التحكم' : 'Overview'}`;
      case 'messaging':
      case 'playground':
        return `${mainSection} > ${lang === 'ar' ? 'منصة الاختبار (Playground)' : 'API Playground'}`;
      case 'campaigns':
        return `${mainSection} > ${lang === 'ar' ? 'إرسال الحملات' : 'Campaigns'}`;
      case 'logs':
        return `${mainSection} > ${lang === 'ar' ? 'سجلات الإرسال' : 'Logs & Traces'}`;
      case 'reports':
        return `${mainSection} > ${lang === 'ar' ? 'التقارير التفصيلية' : 'Detailed Reports'}`;
      
      case 'billing':
        return `${settingsSection} > ${lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Billing'}`;
      case 'security':
        return `${settingsSection} > ${lang === 'ar' ? 'الأمان والـ 2FA' : 'Security & 2FA'}`;
      case 'system':
        return `${settingsSection} > ${lang === 'ar' ? 'حالة النظام والتعرفة' : 'System Rates & Status'}`;
      case 'smtp':
        return `${settingsSection} > ${lang === 'ar' ? 'إرسال البريد SMTP' : 'SMTP Server Config'}`;
      case 'whatsapp':
        return `${settingsSection} > ${lang === 'ar' ? 'ربط جلسة واتساب' : 'WhatsApp Sync'}`;
      
      case 'apikeys':
      case 'api':
        return `${devSection} > ${lang === 'ar' ? 'مفاتيح الـ API' : 'API Keys'}`;
      case 'domains':
        return `${devSection} > ${lang === 'ar' ? 'النطاقات والـ DNS' : 'Verified Domains'}`;
      case 'webhooks':
        return `${devSection} > ${lang === 'ar' ? 'الويب هوكس (Webhooks)' : 'Webhooks Setup'}`;
      case 'code':
        return `${devSection} > ${lang === 'ar' ? 'منشئ الأكواد التفاعلي' : 'Interactive Code Builder'}`;
      case 'settings':
        return `${devSection} > ${lang === 'ar' ? 'بوابة المطور والـ API' : 'Developer Hub'}`;
      
      default:
        return lang === 'ar' ? 'الرئيسية' : 'Home';
    }
  };

  const renderContent = () => {
    // Group tabs into our 7 new unified sections
    if (currentTab === 'dashboard') {
      return (
        <DashboardView 
          lang={lang} 
          theme={theme}
          logs={logs} 
          setLogs={setLogs}
          setCurrentTab={setCurrentTab} 
          domains={domains}
          setDomains={setDomains}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          transactions={transactions}
          setTransactions={setTransactions}
          phoneNotifications={phoneNotifications}
          setPhoneNotifications={setPhoneNotifications}
          activeSubTab={activeDashboardSubTab}
          setActiveSubTab={setActiveDashboardSubTab}
          setEmailBody={setEmailBody}
          setEmailSubject={setEmailSubject}
          setMsgBody={setMsgBody}
          setPlaygroundChannel={setPlaygroundChannel}
        />
      );
    }
    
    // 1. Composer Playground (المختبر التجريبي)
    if (['send', 'playground'].includes(currentTab)) {
      return (
        <PlaygroundView
          lang={lang}
          setLogs={setLogs}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          domains={domains}
          phoneNotifications={phoneNotifications}
          setPhoneNotifications={setPhoneNotifications}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          msgBody={msgBody}
          setMsgBody={setMsgBody}
          activeTab={playgroundChannel}
          setActiveTab={setPlaygroundChannel}
          hideHeader={false}
        />
      );
    }

    // 1.5 Broadcast Campaigns (حملات البث الجماعي)
    if (currentTab === 'campaigns') {
      return (
        <CampaignsView
          lang={lang}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          setLogs={setLogs}
          setPhoneNotifications={setPhoneNotifications}
          hideHeader={false}
        />
      );
    }

    // 2. Subscribers & Contacts: includes 'subscribers', 'subscribers-list', 'subscribers-settings'
    if (['subscribers', 'subscribers-list', 'subscribers-settings'].includes(currentTab)) {
      const subTab = (currentTab === 'subscribers' || currentTab === 'subscribers-list') ? 'list' : 'settings';
      return (
        <SubscribersView 
          lang={lang} 
          apiKeys={apiKeys} 
          user={user}
          initialSubTab={subTab}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          setPhoneNotifications={setPhoneNotifications}
          setLogs={setLogs}
          setCurrentTab={setCurrentTab}
        />
      );
    }

    // 3. Analytics & Logs: includes 'logs', 'reports', 'logs-list'
    if (['logs', 'reports', 'logs-list'].includes(currentTab)) {
      const initialSubTab = currentTab === 'logs' ? 'logs' : (currentTab as any);
      return (
        <AnalyticsLogsView
          lang={lang}
          logs={logs}
          setLogs={setLogs}
          walletBalance={walletBalance}
          transactions={transactions}
          domains={domains}
          setCurrentTab={setCurrentTab}
          initialTab={initialSubTab}
        />
      );
    }

    // 4. Delivery Channels: includes 'channels', 'whatsapp', 'smtp', 'domains'
    if (['channels', 'whatsapp', 'smtp', 'domains'].includes(currentTab)) {
      const initialSubTab = currentTab === 'channels' ? 'whatsapp' : (currentTab as any);
      return (
        <ChannelsView
          lang={lang}
          theme={theme}
          domains={domains}
          setDomains={setDomains}
          setEmailBody={setEmailBody}
          setEmailSubject={setEmailSubject}
          setMsgBody={setMsgBody}
          setPlaygroundChannel={setPlaygroundChannel}
          setCurrentTab={setCurrentTab}
          setLogs={setLogs}
          setPhoneNotifications={setPhoneNotifications}
          initialTab={initialSubTab}
        />
      );
    }

    // 5. Developer Hub: includes 'developer', 'apikeys', 'webhooks', 'code', 'api', 'settings' (legacy)
    if (['developer', 'apikeys', 'webhooks', 'code', 'api', 'settings'].includes(currentTab)) {
      const subTab = (currentTab === 'developer' || currentTab === 'api' || currentTab === 'settings') ? 'apikeys' : (currentTab as any);
      return (
        <SettingsIntegrationsView
          lang={lang}
          theme={theme}
          initialTab={subTab}
          domains={domains}
          setDomains={setDomains}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          webhooks={webhooks}
          setWebhooks={setWebhooks}
          logs={logs}
          setLogs={setLogs}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          setPhoneNotifications={setPhoneNotifications}
          setCurrentTab={setCurrentTab}
          setEmailBody={setEmailBody}
          setEmailSubject={setEmailSubject}
          setMsgBody={setMsgBody}
          setPlaygroundChannel={setPlaygroundChannel}
        />
      );
    }

    // 6. Platform Settings: includes 'platform-settings', 'billing', 'security', 'system'
    if (['platform-settings', 'billing', 'security', 'system'].includes(currentTab)) {
      const initialSubTab = currentTab === 'platform-settings' ? 'billing' : (currentTab as any);
      return (
        <PlatformSettingsView
          lang={lang}
          theme={theme}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          transactions={transactions}
          setTransactions={setTransactions}
          setEmailBody={setEmailBody}
          setEmailSubject={setEmailSubject}
          setMsgBody={setMsgBody}
          setPlaygroundChannel={setPlaygroundChannel}
          setCurrentTab={setCurrentTab}
          setLogs={setLogs}
          setPhoneNotifications={setPhoneNotifications}
          initialTab={initialSubTab}
        />
      );
    }

    if (currentTab === 'admin-portal') {
      return (
        <AdminPortalView 
          lang={lang}
          setLang={setLang}
          setCurrentTab={setCurrentTab}
        />
      );
    }

    // Default Fallback (Dashboard)
    return (
      <DashboardView 
        lang={lang} 
        theme={theme}
        logs={logs} 
        setLogs={setLogs}
        setCurrentTab={setCurrentTab} 
        domains={domains}
        setDomains={setDomains}
        apiKeys={apiKeys}
        setApiKeys={setApiKeys}
        walletBalance={walletBalance}
        setWalletBalance={setWalletBalance}
        transactions={transactions}
        setTransactions={setTransactions}
        phoneNotifications={phoneNotifications}
        setPhoneNotifications={setPhoneNotifications}
        activeSubTab={activeDashboardSubTab}
        setActiveSubTab={setActiveDashboardSubTab}
        setEmailBody={setEmailBody}
        setEmailSubject={setEmailSubject}
        setMsgBody={setMsgBody}
        setPlaygroundChannel={setPlaygroundChannel}
      />
    );
  };

  // Auth Loading View
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'var(--bg-color)',
        color: 'var(--text-primary)',
        fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-family)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--text-primary)',
            color: 'var(--panel-bg)',
            fontSize: '22px',
            fontWeight: 'bold',
            marginBottom: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            ✦
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {lang === 'ar' ? 'جاري تهيئة منصة المطور...' : 'Loading developer portal...'}
          </div>
        </div>
      </div>
    );
  }

  // Guest view routing (Landing)
  if (currentTab === 'landing') {
    return (
      <LandingView
        lang={lang}
        setLang={setLang}
        setCurrentTab={setCurrentTab}
        theme={theme}
        setTheme={setTheme}
        user={user}
      />
    );
  }

  // Auth View routing
  if (currentTab === 'auth-signin' || currentTab === 'auth-signup') {
    return (
      <AuthView
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        initialMode={currentTab === 'auth-signup' ? 'signup' : 'signin'}
        onAuthSuccess={(t, u) => {
          localStorage.setItem('sumer_token', t);
          setToken(t);
          setUser(u);
          setCurrentTab('dashboard');
        }}
        onBackToLanding={() => setCurrentTab('landing')}
      />
    );
  }

  // Public Subscriber Opt-In Page Routing
  if (currentTab === 'public-subscribe') {
    const pathParts = window.location.pathname.split('/');
    const subUserId = pathParts[2] || '';
    return (
      <PublicSubscribeView userId={subUserId} />
    );
  }

  const getBreadcrumbs = () => {
    let parent = '';
    let child = '';
    
    if (currentTab === 'dashboard') {
      parent = lang === 'ar' ? 'لوحة التحكم' : 'Dashboard';
      if (activeDashboardSubTab === 'channels') {
        child = lang === 'ar' ? 'نظرة عامة' : 'Overview';
      } else if (activeDashboardSubTab === 'domains') {
        child = lang === 'ar' ? 'النطاقات' : 'Domains';
      } else if (activeDashboardSubTab === 'apikeys') {
        child = lang === 'ar' ? 'مفاتيح الـ API' : 'API Keys';
      } else if (activeDashboardSubTab === 'templates') {
        child = lang === 'ar' ? 'قوالب المراسلة' : 'Message Templates';
      } else {
        child = lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Billing';
      }
    } else if (['messaging', 'playground', 'campaigns'].includes(currentTab)) {
      parent = lang === 'ar' ? 'المراسلة والحملات' : 'Playground & Campaigns';
      if (currentTab === 'messaging') {
        child = lang === 'ar' ? 'المراسلة الفورية' : 'Instant Dispatch';
      } else if (currentTab === 'playground') {
        child = lang === 'ar' ? 'منصة الاختبار (Playground)' : 'API Playground';
      } else {
        child = lang === 'ar' ? 'إرسال الحملات' : 'Bulk Campaigns';
      }
    } else if (['logs', 'reports'].includes(currentTab)) {
      parent = lang === 'ar' ? 'السجلات والتحليلات' : 'Logs & Analytics';
      if (currentTab === 'logs') {
        child = lang === 'ar' ? 'سجلات الإرسال' : 'Logs & Traces';
      } else {
        child = lang === 'ar' ? 'التقارير التفصيلية' : 'Detailed Reports';
      }
    } else if (currentTab === 'billing') {
      parent = lang === 'ar' ? 'إعدادات المنصة' : 'Platform Settings';
      child = lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Billing';
    } else if (currentTab === 'subscribers') {
      parent = lang === 'ar' ? 'الخدمات الأساسية' : 'Core Services';
      child = lang === 'ar' ? 'إدارة المشتركين' : 'Subscribers';
    } else if (currentTab === 'settings') {
      parent = lang === 'ar' ? 'إعدادات المنصة' : 'Platform Settings';
      child = lang === 'ar' ? 'إعدادات النظام' : 'Settings';
    } else if (currentTab === 'admin') {
      parent = lang === 'ar' ? 'بوابة المسؤول' : 'Admin Portal';
      child = lang === 'ar' ? 'إدارة النظام' : 'System Administration';
    } else {
      parent = lang === 'ar' ? 'بوابة المطور والـ API' : 'Developer Hub';
      child = lang === 'ar' ? 'بوابة المطور' : 'Developer Hub';
    }

    return (
      <div className="navbar-breadcrumbs">
        <span className="navbar-breadcrumb-parent">{parent}</span>
        <span className="navbar-breadcrumb-separator">/</span>
        <span className="navbar-breadcrumb-child">{child}</span>
      </div>
    );
  };

  return (
    <>
    <a href="#main-content" className="skip-link">
      {lang === 'en' ? 'Skip to main content' : 'تخطي إلى المحتوى الرئيسي'}
    </a>
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        walletBalance={walletBalance}
        theme={theme}
        setTheme={setTheme}
        user={user}
        onLogout={handleLogout}
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        domains={domains}
        apiKeys={apiKeys}
        onSearchClick={() => setIsSearchOpen(true)}
        activeDashboardSubTab={activeDashboardSubTab}
      />
      
      <main id="main-content" className="main-content" style={{ paddingTop: 'var(--header-height)' }}>
        <div className="top-navbar">
          {/* Left: Active Tab Title / Breadcrumbs */}
          <div className="navbar-breadcrumbs-wrapper">
            {getBreadcrumbs()}
          </div>

          {/* Center: Search Capsule Shortcut */}
          <div className="navbar-search-container" onClick={() => setIsSearchOpen(true)}>
            <SearchIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="navbar-search-text">{lang === 'ar' ? 'بحث سريع... (⌘F)' : 'Search here... (⌘F)'}</span>
            <span className="navbar-search-badge">⌘F</span>
          </div>

          {/* Right: Wallet & Notifications Widget */}
          <div className="navbar-right-widgets">
            <div className="header-wallet-badge" onClick={() => setCurrentTab('billing')} title={lang === 'ar' ? 'المحفظة والرصيد' : 'Wallet & Billing'}>
              <Wallet size={13} />
              <span>{walletBalance.toLocaleString()} {lang === 'ar' ? 'د.ع' : 'IQD'}</span>
            </div>
            <NotificationsDropdown lang={lang} />
          </div>
        </div>

        <div className="content-container tab-transition-wrapper">
          {viewLoading ? (
            <SkeletonView tab={currentTab} lang={lang} />
          ) : (
            renderContent()
          )}
        </div>
      </main>
      <ToastContainer lang={lang} />
      <CookieConsentBanner lang={lang} />
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        lang={lang}
        setCurrentTab={setCurrentTab}
        setTheme={setTheme}
        setLang={setLang}
        handleLogout={handleLogout}
      />
      {showSuccessOverlay && (
        <div className="sumer-success-overlay">
          <div className="sumer-success-circle">
            <svg className="sumer-success-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="sumer-success-checkmark-circle" cx="26" cy="26" r="25" fill="none" />
              <path className="sumer-success-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              <g className="sumer-success-sparks">
                <line x1="26" y1="6" x2="26" y2="0" className="spark-line" />
                <line x1="40" y1="12" x2="45" y2="7" className="spark-line" />
                <line x1="46" y1="26" x2="52" y2="26" className="spark-line" />
                <line x1="40" y1="40" x2="45" y2="45" className="spark-line" />
                <line x1="26" y1="46" x2="26" y2="52" className="spark-line" />
                <line x1="12" y1="40" x2="7" y2="45" className="spark-line" />
                <line x1="6" y1="26" x2="0" y2="26" className="spark-line" />
                <line x1="12" y1="12" x2="7" y2="7" className="spark-line" />
              </g>
            </svg>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

interface Toast {
  id: string;
  message: string;
  type: 'email' | 'sms' | 'whatsapp' | 'success' | 'error';
  title?: string;
  duration?: number;
  isExiting?: boolean;
}

const ToastContainer: React.FC<{ lang: 'en' | 'ar' }> = ({ lang }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { message, type, title, duration } = customEvent.detail;
      const id = Date.now().toString() + Math.random().toString();
      
      setToasts(prev => [...prev, { id, message, type, title, duration: duration || 4000 }]);

      // Auto dismiss
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, isExiting: true } : t));
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id));
        }, 300); // matches slide-out animation
      }, duration || 4000);
    };

    window.addEventListener('sumer-toast', handleToast);
    return () => window.removeEventListener('sumer-toast', handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, isExiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="sumer-toast-container">
      {toasts.map(toast => {
        let titleText = toast.title;
        if (!titleText) {
          if (toast.type === 'email') titleText = lang === 'ar' ? 'تم إرسال بريد إلكتروني' : 'Email Sent';
          else if (toast.type === 'sms') titleText = lang === 'ar' ? 'تم إرسال رسالة SMS' : 'SMS Sent';
          else if (toast.type === 'whatsapp') titleText = lang === 'ar' ? 'تم إرسال رسالة WhatsApp' : 'WhatsApp Sent';
          else if (toast.type === 'error') titleText = lang === 'ar' ? 'حدث خطأ ما' : 'Error Occurred';
          else titleText = lang === 'ar' ? 'عملية ناجحة' : 'Action Succeeded';
        }

        return (
          <div 
            key={toast.id} 
            className={`sumer-toast sumer-toast-${toast.type} ${toast.isExiting ? 'exit' : ''}`}
          >
            <div className="sumer-toast-icon-container">
              <svg className="sumer-toast-icon-ring" viewBox="0 0 42 42">
                <circle className="sumer-toast-icon-ring-circle" cx="21" cy="21" r="19.5" fill="none" />
              </svg>
              <div className="sumer-toast-icon-inner">
                {toast.type === 'email' && <Mail size={15} />}
                {toast.type === 'sms' && <Phone size={15} />}
                {toast.type === 'whatsapp' && <MessageSquare size={15} />}
                {toast.type === 'success' && <Check size={16} />}
                {toast.type === 'error' && <X size={16} />}
              </div>
            </div>

            <div className="sumer-toast-content">
              <div className="sumer-toast-title">{titleText}</div>
              <div className="sumer-toast-message">{toast.message}</div>
            </div>

            <button 
              className="sumer-toast-close"
              onClick={() => removeToast(toast.id)}
            >
              <X size={12} />
            </button>

            <div 
              className="sumer-toast-progress"
              style={{ animationDuration: `${toast.duration || 4000}ms` }}
            />
          </div>
        );
      })}
    </div>
  );
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ar';
  setCurrentTab: (tab: string) => void;
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;
  setLang: React.Dispatch<React.SetStateAction<'en' | 'ar'>>;
  handleLogout: () => void;
}
const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  lang,
  setCurrentTab,
  setTheme,
  setLang,
  handleLogout
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    // Navigation
    { id: 'dashboard', categoryAr: 'التنقل', categoryEn: 'Navigation', titleAr: 'لوحة التحكم', titleEn: 'Dashboard', shortcut: 'G D', icon: <LayoutDashboard size={14} />, action: () => setCurrentTab('dashboard') },
    { id: 'reports', categoryAr: 'التنقل', categoryEn: 'Navigation', titleAr: 'التقارير والتحليلات', titleEn: 'Detailed Reports / Analytics', shortcut: 'G R', icon: <BarChart3 size={14} />, action: () => setCurrentTab('reports') },
    { id: 'logs', categoryAr: 'التنقل', categoryEn: 'Navigation', titleAr: 'سجلات الإرسال والأنشطة', titleEn: 'Sending Logs & Traces', shortcut: 'G L', icon: <Activity size={14} />, action: () => setCurrentTab('logs') },
    { id: 'billing', categoryAr: 'التنقل', categoryEn: 'Navigation', titleAr: 'المحفظة والشحن والفواتير', titleEn: 'Wallet & Local Billing', shortcut: 'G B', icon: <Wallet size={14} />, action: () => setCurrentTab('billing') },

    // Dispatch
    { id: 'playground', categoryAr: 'قنوات الإرسال', categoryEn: 'Message Dispatch', titleAr: 'حقل التجربة البرمجية التفاعلي', titleEn: 'Interactive API Playground', shortcut: 'D P', icon: <Terminal size={14} />, action: () => setCurrentTab('playground') },
    { id: 'campaigns', categoryAr: 'قنوات الإرسال', categoryEn: 'Message Dispatch', titleAr: 'إدارة الحملات والتسويق', titleEn: 'Campaigns Manager', shortcut: 'D C', icon: <Mail size={14} />, action: () => setCurrentTab('campaigns') },

    // Settings
    { id: 'smtp', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'إعدادات خادم البريد SMTP', titleEn: 'SMTP Server Config', shortcut: 'S S', icon: <Server size={14} />, action: () => setCurrentTab('smtp') },
    { id: 'whatsapp', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'ربط حساب واتساب الشخصي/التجاري', titleEn: 'WhatsApp Sync Connection', shortcut: 'S W', icon: <MessageSquare size={14} />, action: () => setCurrentTab('whatsapp') },
    { id: 'domains', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'إدارة النطاقات والـ DNS والتوثيق', titleEn: 'Domains & DNS Setup', shortcut: 'S D', icon: <Globe size={14} />, action: () => setCurrentTab('domains') },
    { id: 'api', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'مفاتيح الـ API وصلاحيات المطور', titleEn: 'Developer API Keys', shortcut: 'S A', icon: <Key size={14} />, action: () => setCurrentTab('api') },
    { id: 'webhooks', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'الويب هوكس (Webhooks) للاستلام', titleEn: 'Webhooks Configuration', shortcut: 'S H', icon: <Webhook size={14} />, action: () => setCurrentTab('webhooks') },
    { id: 'security', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'الأمان والتحقق الثنائي (2FA)', titleEn: 'Security & 2FA Settings', shortcut: 'S E', icon: <ShieldCheck size={14} />, action: () => setCurrentTab('security') },
    { id: 'system', categoryAr: 'الإعدادات والربط', categoryEn: 'Settings & Integrations', titleAr: 'حالة النظام المتكامل وتعرفة الشبكات', titleEn: 'System Rates & Operator status', shortcut: 'S T', icon: <Cpu size={14} />, action: () => setCurrentTab('system') },

    // Quick Actions
    { id: 'theme', categoryAr: 'عمليات سريعة', categoryEn: 'Quick Actions', titleAr: 'تغيير المظهر (فاتح / داكن)', titleEn: 'Toggle Theme (Light / Dark)', shortcut: 'Q T', icon: <SunMoon size={14} />, action: () => setTheme(prev => prev === 'dark' ? 'light' : 'dark') },
    { id: 'lang', categoryAr: 'عمليات سريعة', categoryEn: 'Quick Actions', titleAr: 'تغيير لغة المنصة (عربي / English)', titleEn: 'Toggle Language (Arabic / English)', shortcut: 'Q L', icon: <Languages size={14} />, action: () => setLang(prev => prev === 'ar' ? 'en' : 'ar') },
    { id: 'logout', categoryAr: 'عمليات سريعة', categoryEn: 'Quick Actions', titleAr: 'تسجيل الخروج وإنهاء الجلسة', titleEn: 'Log Out Session', shortcut: 'Q O', icon: <LogOut size={14} />, action: handleLogout }
  ];

  // Filter based on search query
  const filteredItems = items.filter(item => {
    const searchStr = `${item.titleAr} ${item.titleEn} ${item.categoryAr} ${item.categoryEn}`.toLowerCase();
    return searchStr.includes(query.toLowerCase());
  });

  const handleSelectItem = (item: typeof items[0]) => {
    item.action();
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelectItem(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Group filtered items by category
  const categoriesMap: Record<string, typeof filteredItems> = {};
  filteredItems.forEach(item => {
    const cat = lang === 'ar' ? item.categoryAr : item.categoryEn;
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(item);
  });

  // Calculate flat index for selection highlights
  let flatIndexCounter = 0;

  return (
    <div className="command-palette-overlay" onClick={onClose}>
      <div 
        className="command-palette-container" 
        onClick={e => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Row */}
        <div className="command-palette-search-row">
          <SearchIcon size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'اكتب أمراً أو ابحث...' : 'Type a command or search...'}
          />
          <span className="command-palette-esc-badge">ESC</span>
        </div>

        {/* List Content */}
        <div className="command-palette-list">
          {filteredItems.length === 0 ? (
            <div className="command-palette-empty">
              {lang === 'ar' ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
            </div>
          ) : (
            Object.keys(categoriesMap).map((catName) => (
              <div key={catName} className="command-palette-category">
                <div className="command-palette-category-title">{catName}</div>
                {categoriesMap[catName].map((item) => {
                  const currentFlatIndex = flatIndexCounter++;
                  const isActive = currentFlatIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      className={`command-palette-item ${isActive ? 'active' : ''}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                    >
                      <div className="command-palette-item-content">
                        {item.icon}
                        <span>{lang === 'ar' ? item.titleAr : item.titleEn}</span>
                      </div>
                      <span className="command-palette-item-shortcut">{item.shortcut}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer info bar */}
        <div className="command-palette-footer">
          <div className="footer-tip">
            <span className="key-hint">↵</span>
            <span>{lang === 'ar' ? 'للاختيار' : 'to select'}</span>
          </div>
          <div className="footer-tip">
            <span className="key-hint">↑↓</span>
            <span>{lang === 'ar' ? 'للتنقل' : 'to navigate'}</span>
          </div>
          <div className="footer-tip">
            <span className="key-hint">ESC</span>
            <span>{lang === 'ar' ? 'للإغلاق' : 'to close'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
