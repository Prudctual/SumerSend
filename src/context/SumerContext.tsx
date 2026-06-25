/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { getTabFromPath, getPathFromTab, updateSEOMetadata } from '../utils/seo';

interface SumerContextType {
  // Navigation & Tabs
  currentTab: string;
  setCurrentTab: (tab: string, subTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => void;
  activeDashboardSubTab: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates';
  setActiveDashboardSubTab: React.Dispatch<React.SetStateAction<'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates'>>;
  viewLoading: boolean;
  setViewLoading: React.Dispatch<React.SetStateAction<boolean>>;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Theme & Language
  lang: 'en' | 'ar';
  setLang: React.Dispatch<React.SetStateAction<'en' | 'ar'>>;
  theme: 'light' | 'dark';
  setTheme: React.Dispatch<React.SetStateAction<'light' | 'dark'>>;

  // Alerts & Search Modals
  showSuccessOverlay: boolean;
  setShowSuccessOverlay: React.Dispatch<React.SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: React.Dispatch<React.SetStateAction<boolean>>;
  profileOpen: boolean;
  setProfileOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // Auth State
  token: string | null;
  setToken: React.Dispatch<React.SetStateAction<string | null>>;
  user: any | null;
  setUser: React.Dispatch<React.SetStateAction<any | null>>;
  authLoading: boolean;
  setAuthLoading: React.Dispatch<React.SetStateAction<boolean>>;

  // Data Lists
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  domains: any[];
  setDomains: React.Dispatch<React.SetStateAction<any[]>>;
  apiKeys: any[];
  setApiKeys: React.Dispatch<React.SetStateAction<any[]>>;
  webhooks: any[];
  setWebhooks: React.Dispatch<React.SetStateAction<any[]>>;
  logs: any[];
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
  phoneNotifications: any[];
  setPhoneNotifications: React.Dispatch<React.SetStateAction<any[]>>;

  // Custom Sending Templates Inputs (Playground View)
  emailSubject: string;
  setEmailSubject: React.Dispatch<React.SetStateAction<string>>;
  emailBody: string;
  setEmailBody: React.Dispatch<React.SetStateAction<string>>;
  msgBody: string;
  setMsgBody: React.Dispatch<React.SetStateAction<string>>;
  playgroundChannel: 'email' | 'sms' | 'whatsapp';
  setPlaygroundChannel: (channel: 'email' | 'sms' | 'whatsapp') => void;

  // Actions
  handleLogout: () => void;
  adminSettingsTrigger: number;
}

const SumerContext = createContext<SumerContextType | undefined>(undefined);

export const useSumer = () => {
  const context = useContext(SumerContext);
  if (!context) throw new Error('useSumer must be used within a SumerProvider');
  return context;
};

const now = Date.now();

const INITIAL_DOMAINS = [
  { id: '1', name: 'mystore.iq', status: 'verified', createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', name: 'iraqdev.org', status: 'pending', createdAt: new Date(now).toISOString(), cnames: [
    { type: 'CNAME', host: 'sm1._domainkey.iraqdev.org', value: 'dkim1.sumersend.com' },
    { type: 'CNAME', host: 'sm2._domainkey.iraqdev.org', value: 'dkim2.sumersend.com' },
    { type: 'CNAME', host: 'sm3._domainkey.iraqdev.org', value: 'dkim3.sumersend.com' },
  ]}
];

const INITIAL_API_KEYS = [
  { id: '1', name: 'Main Application Key', key: 'sm_live_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d', scope: 'full', createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString() }
];

const DEFAULT_WEBHOOKS = [
  { id: '1', url: 'https://mystore.iq/api/sumer-receiver', events: ['email.failed', 'sms.delivered'], secret: 'whsec_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_LOGS = [
  { id: '1', type: 'email', from: 'support@mystore.iq', to: 'customer@gmail.com', subject: 'Your Order #9283 has shipped!', body: '<p>Your order is on its way via Zain Delivery.</p>', status: 'delivered', timestamp: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
  { id: '2', type: 'sms', from: 'Sumer Send API', to: '07801234567', body: 'Your Zain Cash OTP is 9281. Do not share it.', status: 'delivered', timestamp: new Date(now - 1 * 60 * 60 * 1000).toISOString() },
  { id: '3', type: 'whatsapp', from: 'Sumer Send API', to: '07709876543', body: 'Hi Ahmed, your booking at Grand Millenium Basra is confirmed!', status: 'delivered', timestamp: new Date(now - 15 * 60 * 1000).toISOString() }
];

const INITIAL_TRANSACTIONS = [
  { id: 'TX928172', provider: 'Zain Cash', amount: 50000, status: 'completed', date: new Date(now - 6 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_PHONE_NOTIFICATIONS = [
  { id: '1', type: 'whatsapp', title: 'WhatsApp: Sumer Send', body: 'Hi Ahmed, your booking at Grand Millenium Basra is confirmed!', time: '15m ago' },
  { id: '2', type: 'sms', title: 'SMS: Sumer Send', body: 'Your Zain Cash OTP is 9281. Do not share it.', time: '1h ago' }
];

export const SumerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<string>(() => {
    const { tab } = getTabFromPath(window.location.pathname);
    return tab;
  });
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState<'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates'>(() => {
    const { subTab } = getTabFromPath(window.location.pathname);
    return subTab || 'channels';
  });
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const loadingTimerRef = useRef<any>(null);

  const handleTabChange = (newTab: string, subTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => {
    let targetTab = newTab;
    let targetSubTab: any = undefined;
    if (['dashboard', 'domains', 'apikeys', 'api', 'wallet', 'billing', 'templates'].includes(newTab)) {
      targetTab = 'dashboard';
      if (newTab === 'domains') {
        setActiveDashboardSubTab('domains');
        targetSubTab = 'domains';
      } else if (newTab === 'apikeys' || newTab === 'api') {
        setActiveDashboardSubTab('apikeys');
        targetSubTab = 'apikeys';
      } else if (newTab === 'wallet' || newTab === 'billing') {
        setActiveDashboardSubTab('wallet');
        targetSubTab = 'wallet';
      } else if (newTab === 'templates') {
        setActiveDashboardSubTab('templates');
        targetSubTab = 'templates';
      } else if (newTab === 'dashboard') {
        setActiveDashboardSubTab(subTab || 'channels');
        targetSubTab = subTab || 'channels';
      }
    }

    // Sync with browser history
    const newPath = getPathFromTab(targetTab, targetSubTab);
    if (window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }

    if (targetTab !== currentTab) {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      const isConsoleTab = !['landing', 'auth-signin', 'auth-signup', 'admin-portal'].includes(targetTab);
      
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

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sumer_theme') as 'light' | 'dark') || 'light';
  });
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // User Authentication State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('sumer_token'));
  const [user, setUser] = useState<any | null>(null);
  const [authLoading, setAuthLoading] = useState(() => !!localStorage.getItem('sumer_token'));
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

  // Pre-populated data
  const [domains, setDomains] = useState<any[]>(INITIAL_DOMAINS);

  const [apiKeys, setApiKeys] = useState<any[]>(INITIAL_API_KEYS);

  const [webhooks, setWebhooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('sumer_webhooks');
    return saved ? JSON.parse(saved) : DEFAULT_WEBHOOKS;
  });

  useEffect(() => {
    localStorage.setItem('sumer_webhooks', JSON.stringify(webhooks));
  }, [webhooks]);

  const [logs, setLogs] = useState<any[]>(INITIAL_LOGS);

  const [transactions, setTransactions] = useState<any[]>(INITIAL_TRANSACTIONS);

  const [phoneNotifications, setPhoneNotifications] = useState<any[]>(INITIAL_PHONE_NOTIFICATIONS);

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
      return;
    }
    if (user) {
      return;
    }
    
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
  }, [token, user]);

  // Load user data once authenticated via a single bootstrap call
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

  // Sync state from popstate (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const { tab, subTab } = getTabFromPath(window.location.pathname);
      setCurrentTab(tab);
      if (subTab) {
        setActiveDashboardSubTab(subTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [adminSettingsTrigger, setAdminSettingsTrigger] = useState(0);
  
  // Sync custom event from Admin portal
  useEffect(() => {
    const handleUpdate = () => {
      setAdminSettingsTrigger(prev => prev + 1);
    };
    window.addEventListener('sumer-admin-settings-updated', handleUpdate);
    return () => window.removeEventListener('sumer-admin-settings-updated', handleUpdate);
  }, []);

  // Dynamic SEO metadata updates
  useEffect(() => {
    updateSEOMetadata(currentTab, lang);
  }, [currentTab, lang, adminSettingsTrigger]);

  // Dynamic Analytics Script Injection
  useEffect(() => {
    const savedAnalytics = localStorage.getItem('sumer_admin_analytics');
    if (!savedAnalytics) return;
    try {
      const analytics = JSON.parse(savedAnalytics);
      
      const gaId = analytics.googleAnalyticsId;
      if (gaId) {
        const scriptExists = document.querySelector(`script[src*="googletagmanager.com/gtag"]`);
        if (!scriptExists) {
          const newScript = document.createElement('script');
          newScript.async = true;
          newScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(newScript);

          const inlineScript = document.createElement('script');
          inlineScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `;
          document.head.appendChild(inlineScript);
        }
      }

      const gtmId = analytics.gtmContainerId;
      if (gtmId) {
        const gtmScript = document.querySelector(`script[src*="gtm.js?id="]`);
        if (!gtmScript) {
          const scriptEl = document.createElement('script');
          scriptEl.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `;
          document.head.appendChild(scriptEl);
        }
      }

      const pixelId = analytics.metaPixelId;
      if (pixelId) {
        const pixelScript = document.querySelector(`script[src*="connect.facebook.net"]`);
        if (!pixelScript) {
          const scriptEl = document.createElement('script');
          scriptEl.innerHTML = `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `;
          document.head.appendChild(scriptEl);
        }
      }

      if (analytics.customHeadScript) {
        const id = 'sumer-custom-head-scripts';
        let wrapper = document.getElementById(id);
        if (wrapper) wrapper.remove();
        
        wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.style.display = 'none';
        wrapper.innerHTML = analytics.customHeadScript;
        document.head.appendChild(wrapper);
        const scripts = wrapper.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = document.createElement('script');
          if (scripts[i].src) s.src = scripts[i].src;
          s.innerHTML = scripts[i].innerHTML;
          document.head.appendChild(s);
        }
      }

      if (analytics.customBodyScript) {
        const id = 'sumer-custom-body-scripts';
        let wrapper = document.getElementById(id);
        if (wrapper) wrapper.remove();
        
        wrapper = document.createElement('div');
        wrapper.id = id;
        wrapper.style.display = 'none';
        wrapper.innerHTML = analytics.customBodyScript;
        document.body.appendChild(wrapper);
        const scripts = wrapper.getElementsByTagName('script');
        for (let i = 0; i < scripts.length; i++) {
          const s = document.createElement('script');
          if (scripts[i].src) s.src = scripts[i].src;
          s.innerHTML = scripts[i].innerHTML;
          document.body.appendChild(s);
        }
      }
    } catch (e) {
      console.error('Failed to inject analytics scripts', e);
    }
  }, [adminSettingsTrigger]);

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

  return (
    <SumerContext.Provider value={{
      currentTab,
      setCurrentTab: handleTabChange,
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
      setPlaygroundChannel: handlePlaygroundChannelChange,
      handleLogout,
      adminSettingsTrigger
    }}>
      {children}
    </SumerContext.Provider>
  );
};
