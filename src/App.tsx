import React, { useState, useEffect } from 'react';
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
import { SendConsoleView } from './components/SendConsoleView';
import { ChannelsView } from './components/ChannelsView';
import { AnalyticsLogsView } from './components/AnalyticsLogsView';
import { PlatformSettingsView } from './components/PlatformSettingsView';
import { SkeletonView } from './components/SkeletonView';


export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState<'channels' | 'domains' | 'apikeys' | 'wallet'>('channels');
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const loadingTimerRef = React.useRef<any>(null);

  const handleTabChange = (newTab: string, subTab?: 'channels' | 'domains' | 'apikeys' | 'wallet') => {
    let targetTab = newTab;
    if (['dashboard', 'domains', 'apikeys', 'api', 'wallet', 'billing'].includes(newTab)) {
      targetTab = 'dashboard';
      if (newTab === 'domains') {
        setActiveDashboardSubTab('domains');
      } else if (newTab === 'apikeys' || newTab === 'api') {
        setActiveDashboardSubTab('apikeys');
      } else if (newTab === 'wallet' || newTab === 'billing') {
        setActiveDashboardSubTab('wallet');
      } else if (newTab === 'dashboard') {
        setActiveDashboardSubTab(subTab || 'channels');
      }
    }

    if (targetTab !== currentTab) {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      const isConsoleTab = !['landing', 'auth-signin', 'auth-signup'].includes(targetTab);
      
      if (isConsoleTab) {
        setViewLoading(true);
        setCurrentTab(targetTab);
        loadingTimerRef.current = setTimeout(() => {
          setViewLoading(false);
        }, 250);
      } else {
        setCurrentTab(targetTab);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const [lang, setLang] = useState<'en' | 'ar'>('ar'); // Default to Arabic for Iraqi market!

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
      case 'templates':
        return `${mainSection} > ${lang === 'ar' ? 'معرض القوالب' : 'Templates Gallery'}`;
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sumer_theme') as 'light' | 'dark') || 'light';
  });
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // User Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sumer_token'));
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleSuccessOverlay = () => {
      setShowSuccessOverlay(true);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      const timer = setTimeout(() => {
        setShowSuccessOverlay(false);
      }, 1500);
      return () => clearTimeout(timer);
    };
    window.addEventListener('sumer-success-screen', handleSuccessOverlay);
    return () => window.removeEventListener('sumer-success-screen', handleSuccessOverlay);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger search modal if user is typing in form inputs
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable;
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === '/')) {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      } else if (e.key === '/') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Balance starts at 50,000 IQD
  const [walletBalance, setWalletBalance] = useState<number>(50000);

  // Pre-populated data for immersive demo
  const [domains, setDomains] = useState<any[]>([
    { id: '1', name: 'mystore.iq', status: 'verified', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
    { id: '2', name: 'iraqdev.org', status: 'pending', createdAt: new Date().toISOString(), cnames: [
      { type: 'CNAME', host: 'sm1._domainkey.iraqdev.org', value: 'dkim1.sumersend.com' },
      { type: 'CNAME', host: 'sm2._domainkey.iraqdev.org', value: 'dkim2.sumersend.com' },
      { type: 'CNAME', host: 'sm3._domainkey.iraqdev.org', value: 'dkim3.sumersend.com' },
    ]}
  ]);

  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: '1', name: 'Main Application Key', key: 'sm_live_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d', scope: 'full', createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() }
  ]);

  const [webhooks, setWebhooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('sumer_webhooks');
    return saved ? JSON.parse(saved) : [
      { id: '1', url: 'https://mystore.iq/api/sumer-receiver', events: ['email.failed', 'sms.delivered'], secret: 'whsec_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() }
    ];
  });

  useEffect(() => {
    localStorage.setItem('sumer_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  const [logs, setLogs] = useState<any[]>([
    { id: '1', type: 'email', from: 'support@mystore.iq', to: 'customer@gmail.com', subject: 'Your Order #9283 has shipped!', body: '<p>Your order is on its way via Zain Delivery.</p>', status: 'delivered', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', type: 'sms', from: 'Sumer Send API', to: '07801234567', body: 'Your Zain Cash OTP is 9281. Do not share it.', status: 'delivered', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: '3', type: 'whatsapp', from: 'Sumer Send API', to: '07709876543', body: 'Hi Ahmed, your booking at Grand Millenium Basra is confirmed!', status: 'delivered', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() }
  ]);

  const [transactions, setTransactions] = useState<any[]>([
    { id: 'TX928172', provider: 'Zain Cash', amount: 50000, status: 'completed', date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() }
  ]);

  const [phoneNotifications, setPhoneNotifications] = useState<any[]>([
    { id: '1', type: 'whatsapp', title: 'WhatsApp: Sumer Send', body: 'Hi Ahmed, your booking at Grand Millenium Basra is confirmed!', time: '15m ago' },
    { id: '2', type: 'sms', title: 'SMS: Sumer Send', body: 'Your Zain Cash OTP is 9281. Do not share it.', time: '1h ago' }
  ]);

  const [emailSubject, setEmailSubject] = useState<string>('Welcome to Sumer Send!');
  const [emailBody, setEmailBody] = useState<string>(`<div style="font-family: sans-serif; max-width: 550px; border: 1px solid #e4e4e7; border-radius: 8px; overflow: hidden; direction: rtl; text-align: right; background-color: #ffffff; margin: 0 auto;">
  <div style="background-color: #09090b; padding: 20px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px;">سومر سيند | Sumer Send</h2>
  </div>
  <div style="padding: 24px;">
    <h3 style="margin-top: 0; color: #09090b; font-size: 16px;">مرحباً بك من بغداد!</h3>
    <p style="color: #444444; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">هذه الرسالة تم إرسالها حياً عبر منصة الاختبار البرمجية. إليك نبذة عن إمكانيات قنوات الإشعارات المتوفرة لدينا:</p>
    
    <div style="margin-top: 15px; padding: 12px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
      <strong style="color: #2563eb; font-size: 13px; display: block; margin-bottom: 4px;">1. خدمة البريد الإلكتروني (Email API):</strong>
      <span style="color: #555555; font-size: 12px;">ربط النطاقات وتوصيل البريد مباشرة للصندوق الوارد بـ 10 د.ع فقط.</span>
    </div>
    
    <div style="margin-top: 10px; padding: 12px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
      <strong style="color: #10b981; font-size: 13px; display: block; margin-bottom: 4px;">2. إشعارات الـ SMS المحلية:</strong>
      <span style="color: #555555; font-size: 12px;">توصيل فوري لرموز الـ OTP لجميع الشبكات العراقية بـ 120 د.ع فقط.</span>
    </div>
    
    <div style="margin-top: 10px; padding: 12px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
      <strong style="color: #f59e0b; font-size: 13px; display: block; margin-bottom: 4px;">3. إشعارات الواتساب (WhatsApp):</strong>
      <span style="color: #555555; font-size: 12px;">إرسال رسائل وحجوزات تفاعلية وذكية لعملائك بـ 150 د.ع فقط.</span>
    </div>
  </div>
  <div style="background-color: #f4f4f5; padding: 12px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    بوابة Sumer Send للمطورين • بغداد، العراق
  </div>
</div>`);

  const [msgBody, setMsgBody] = useState<string>('Your OTP verification code is: 489271. Expires in 5 minutes.');
  const [playgroundChannel, setPlaygroundChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');

  const handlePlaygroundChannelChange = (channel: 'email' | 'sms' | 'whatsapp') => {
    setPlaygroundChannel(channel);
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sumer_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sumer_sidebar_collapsed', String(sidebarCollapsed));
    const width = sidebarCollapsed ? '72px' : '260px';
    document.documentElement.style.setProperty('--sidebar-width', width);
  }, [sidebarCollapsed]);

  // Collapse sidebar automatically on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Verify token and restore session on mount
  useEffect(() => {
    if (!token) {
      setAuthLoading(false);
      return;
    }
    setAuthLoading(true);
    fetch('http://127.0.0.1:3000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Session expired');
      return res.json();
    })
    .then(data => {
      setUser(data.user);
    })
    .catch(() => {
      localStorage.removeItem('sumer_token');
      setToken(null);
      setUser(null);
    })
    .finally(() => {
      setAuthLoading(false);
    });
  }, [token]);

  // Load user data once authenticated via a single bootstrap call to reduce network waterfalls and boost initial page load speed
  useEffect(() => {
    if (!token) return;

    fetch('http://127.0.0.1:3000/api/bootstrap')
      .then(res => {
        if (!res.ok) throw new Error('Failed to bootstrap dashboard data');
        return res.json();
      })
      .then(data => {
        if (data.logs && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
        if (data.wallet) {
          if (typeof data.wallet.balance === 'number') {
            setWalletBalance(data.wallet.balance);
          }
          if (Array.isArray(data.wallet.transactions)) {
            setTransactions(data.wallet.transactions);
          }
        }
        if (data.apiKeys && Array.isArray(data.apiKeys)) {
          setApiKeys(data.apiKeys);
        }
        if (data.webhooks && Array.isArray(data.webhooks)) {
          setWebhooks(data.webhooks);
        }
      })
      .catch(err => console.error('Bootstrap data fetch failed:', err));
  }, [token]);

  // Guard routing and redirect guest users to signin screen
  useEffect(() => {
    if (!authLoading && !token && currentTab !== 'landing' && !currentTab.startsWith('auth')) {
      handleTabChange('auth-signin');
    }
  }, [currentTab, token, authLoading]);


  // Handle HTML document adjustments (RTL and Theme toggles)
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sumer_theme', theme);
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('sumer_token');
    setToken(null);
    setUser(null);
    handleTabChange('landing');
  };

  const renderContent = () => {
    // Group tabs into our 7 new unified sections
    if (currentTab === 'dashboard') {
      return (
        <DashboardView 
          lang={lang} 
          logs={logs} 
          setCurrentTab={handleTabChange} 
          domains={domains}
          setDomains={setDomains}
          apiKeys={apiKeys}
          setApiKeys={setApiKeys}
          walletBalance={walletBalance}
          setWalletBalance={setWalletBalance}
          transactions={transactions}
          setTransactions={setTransactions}
          activeSubTab={activeDashboardSubTab}
          setActiveSubTab={setActiveDashboardSubTab}
        />
      );
    }
    
    // 1. Send Console: includes 'send', 'playground', 'campaigns', 'templates'
    if (['send', 'playground', 'campaigns', 'templates'].includes(currentTab)) {
      const initialSubTab = currentTab === 'send' ? 'playground' : (currentTab as any);
      return (
        <SendConsoleView
          lang={lang}
          theme={theme}
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
          playgroundChannel={playgroundChannel}
          setPlaygroundChannel={handlePlaygroundChannelChange}
          setCurrentTab={handleTabChange}
          initialTab={initialSubTab}
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
          initialSubTab={subTab}
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
          setCurrentTab={handleTabChange}
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
          setPlaygroundChannel={handlePlaygroundChannelChange}
          setCurrentTab={handleTabChange}
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
          setCurrentTab={handleTabChange}
          setEmailBody={setEmailBody}
          setEmailSubject={setEmailSubject}
          setMsgBody={setMsgBody}
          setPlaygroundChannel={handlePlaygroundChannelChange}
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
          setPlaygroundChannel={handlePlaygroundChannelChange}
          setCurrentTab={handleTabChange}
          setLogs={setLogs}
          setPhoneNotifications={setPhoneNotifications}
          initialTab={initialSubTab}
        />
      );
    }

    // Default Fallback (Dashboard)
    return (
      <DashboardView 
        lang={lang} 
        logs={logs} 
        setLogs={setLogs}
        setCurrentTab={handleTabChange} 
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
        setCurrentTab={handleTabChange}
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
          handleTabChange('dashboard');
        }}
        onBackToLanding={() => handleTabChange('landing')}
      />
    );
  }

  return (
    <>
    <a href="#main-content" className="skip-link">
      {lang === 'en' ? 'Skip to main content' : 'تخطي إلى المحتوى الرئيسي'}
    </a>
    <div className="app-container">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
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
        <div className="top-navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Left: Active Tab Title */}
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {currentTab === 'dashboard' ? (
                activeDashboardSubTab === 'channels' ? (lang === 'ar' ? 'لوحة التحكم > نظرة عامة' : 'Dashboard > Overview') :
                activeDashboardSubTab === 'domains' ? (lang === 'ar' ? 'لوحة التحكم > النطاقات' : 'Dashboard > Domains') :
                activeDashboardSubTab === 'apikeys' ? (lang === 'ar' ? 'لوحة التحكم > مفاتيح الـ API' : 'Dashboard > API Keys') :
                (lang === 'ar' ? 'لوحة التحكم > المحفظة والشحن' : 'Dashboard > Wallet & Billing')
               ) : 
               ['messaging', 'playground', 'campaigns'].includes(currentTab) ? (lang === 'ar' ? 'المراسلة والحملات' : 'Playground & Campaigns') :
               currentTab === 'templates' ? (lang === 'ar' ? 'معرض القوالب' : 'Templates Gallery') :
               ['logs', 'reports'].includes(currentTab) ? (lang === 'ar' ? 'السجلات والتحليلات' : 'Logs & Analytics') :
               currentTab === 'billing' ? (lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Billing') :
               (lang === 'ar' ? 'بوابة المطور والـ API' : 'Developer Hub')}
            </h2>
          </div>

          {/* Center: Search Capsule Shortcut */}
          <div className="navbar-search-container" onClick={() => setIsSearchOpen(true)}>
            <SearchIcon size={14} style={{ color: 'var(--text-muted)' }} />
            <span className="navbar-search-text">{lang === 'ar' ? 'بحث سريع... (⌘F)' : 'Search here... (⌘F)'}</span>
            <span className="navbar-search-badge">⌘F</span>
          </div>

          {/* Right: Notifications Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            {/* Notification Bell */}
            <button className="navbar-notification-btn" title={lang === 'ar' ? 'الإشعارات' : 'Notifications'}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="navbar-notification-dot"></span>
            </button>
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
      <CommandPalette 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        lang={lang}
        setCurrentTab={handleTabChange}
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
