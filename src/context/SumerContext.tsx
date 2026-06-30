import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { getTabFromPath, getPathFromTab, updateSEOMetadata } from '../utils/seo';
import { apiFetch, API_BASE } from '../config';

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
  behaviorProfile: {
    insights: any[];
    summaryAr: string;
    summaryEn: string;
  };
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
  { id: '1', url: 'https://mystore.iq/api/sumer-receiver', events: ['email.failed', 'sms.delivered'], secret: 'sumer_wh_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d', createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() }
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
    const hasToken = !!localStorage.getItem('sumer_token');
    const isConsoleTab = !['landing', 'auth-signin', 'auth-signup', 'public-subscribe'].includes(tab);
    if (!hasToken && isConsoleTab) {
      return 'auth-signin';
    }
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
    
    const isConsoleTab = !['landing', 'auth-signin', 'auth-signup', 'public-subscribe'].includes(targetTab);
    if (!token && isConsoleTab) {
      targetTab = 'auth-signin';
    } else {
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
      
      const isConsoleTabNow = !['landing', 'auth-signin', 'auth-signup', 'admin-portal', 'public-subscribe'].includes(targetTab);
      
      if (isConsoleTabNow) {
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
  const [domains, setDomains] = useState<any[]>(() => {
    const saved = localStorage.getItem('sumer_domains');
    return saved ? JSON.parse(saved) : INITIAL_DOMAINS;
  });

  const [apiKeys, setApiKeys] = useState<any[]>(() => {
    const saved = localStorage.getItem('sumer_api_keys');
    return saved ? JSON.parse(saved) : INITIAL_API_KEYS;
  });

  const [webhooks, setWebhooks] = useState<any[]>(() => {
    const saved = localStorage.getItem('sumer_webhooks');
    return saved ? JSON.parse(saved) : DEFAULT_WEBHOOKS;
  });

  useEffect(() => {
    localStorage.setItem('sumer_domains', JSON.stringify(domains));
  }, [domains]);

  useEffect(() => {
    localStorage.setItem('sumer_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

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
      const isConsoleTab = !['landing', 'auth-signin', 'auth-signup', 'public-subscribe'].includes(currentTab);
      if (isConsoleTab) {
        setCurrentTab('auth-signin');
      }
      setAuthLoading(false);
      return;
    }
    if (user) {
      return;
    }
    
    apiFetch('/api/auth/me')
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
      setCurrentTab('auth-signin');
    })
    .finally(() => {
      setAuthLoading(false);
    });
  }, [token, user, currentTab]);

  // Load user data once authenticated via a single bootstrap call
  useEffect(() => {
    if (!token) return;

    apiFetch('/api/bootstrap')
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
      // Validate GA ID (G-XXXXXXX or UA-XXXXXXX-Y)
      if (gaId && /^(G|UA)-[A-Z0-9-]+$/i.test(gaId)) {
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
      // Validate GTM ID (GTM-XXXXXX)
      if (gtmId && /^GTM-[A-Z0-9]{4,10}$/i.test(gtmId)) {
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
      // Validate Pixel ID (numeric only, 10-20 digits)
      if (pixelId && /^[0-9]{10,20}$/.test(pixelId)) {
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

  const behaviorProfile = useMemo(() => {
    const insights: any[] = [];
    
    // 1. Balance check
    if (walletBalance < 15000) {
      insights.push({
        id: 'ins_balance_low',
        type: 'weakness',
        section: 'billing',
        titleAr: '⚠️ رصيد محفظتك منخفض',
        titleEn: '⚠️ Low Wallet Balance',
        descAr: `رصيدك الحالي (${walletBalance.toLocaleString()} د.ع) منخفض. قد تتوقف بوابات الإرسال بمجرد استهلاك الرصيد المتبقي.`,
        descEn: `Your current balance (${walletBalance.toLocaleString()} IQD) is low. Gateways may pause once depleted.`,
        actionLabelAr: 'شحن المحفظة الآن',
        actionLabelEn: 'Recharge Wallet Now',
        tab: 'billing'
      });
      insights.push({
        id: 'pred_balance_depletion',
        type: 'prediction',
        section: 'billing',
        titleAr: '🔮 توقع نفاد الرصيد',
        titleEn: '🔮 Balance Depletion Prediction',
        descAr: 'بناءً على معدل الإرسال اليومي، نتوقع نفاد رصيدك بالكامل خلال 48 ساعة. نقترح تفعيل الشحن التلقائي.',
        descEn: 'Based on your sending velocity, we predict your balance will empty in 48 hours. Activate auto-recharge.',
        actionLabelAr: 'تفعيل الشحن التلقائي',
        actionLabelEn: 'Enable Auto-Topup',
        tab: 'billing'
      });
    } else {
      insights.push({
        id: 'ins_balance_healthy',
        type: 'strength',
        section: 'billing',
        titleAr: '🟢 ملاءة مالية ممتازة',
        titleEn: '🟢 Healthy Capital Runway',
        descAr: `لديك رصيد تشغيلي كافٍ (${walletBalance.toLocaleString()} د.ع) لتغطية أكثر من 50,000 رسالة بريد أو 400 رسالة واتساب.`,
        descEn: `You have sufficient operational runway (${walletBalance.toLocaleString()} IQD) covering 50,000+ emails.`,
        tab: 'billing'
      });
    }

    // 2. Domains check
    const pendingDomains = domains.filter(d => d.status !== 'verified');
    const verifiedDomains = domains.filter(d => d.status === 'verified');
    if (domains.length === 0) {
      insights.push({
        id: 'ins_domain_none',
        type: 'weakness',
        section: 'developer',
        titleAr: '⚠️ إرسال بدون نطاقات موثقة',
        titleEn: '⚠️ Sending without Verified Domains',
        descAr: 'لم تقم بربط أي نطاق DNS خاص بك. إرسال البريد الإلكتروني بدون توثيق يزيد من نسبة تصنيفه كرسائل غير مرغوب فيها.',
        descEn: 'No custom domains added. Sending emails without authentication triggers spam filters.',
        actionLabelAr: 'إضافة نطاق DNS',
        actionLabelEn: 'Add DNS Domain',
        tab: 'domains'
      });
    } else if (pendingDomains.length > 0) {
      insights.push({
        id: 'ins_domain_pending',
        type: 'weakness',
        section: 'developer',
        titleAr: `⚠️ سجلات معلقة لنطاق ${pendingDomains[0].name}`,
        titleEn: `⚠️ Pending DNS validation for ${pendingDomains[0].name}`,
        descAr: `النطاق البريدي (${pendingDomains[0].name}) ينقصه ربط مفاتيح CNAME بسجل DNS الخاص بك لإكمال التوثيق.`,
        descEn: `Domain (${pendingDomains[0].name}) requires CNAME DNS records configuration to complete setup.`,
        actionLabelAr: 'عرض سجلات التحقق',
        actionLabelEn: 'View Verification Records',
        tab: 'domains'
      });
    }
    if (verifiedDomains.length > 0) {
      insights.push({
        id: 'ins_domain_verified',
        type: 'strength',
        section: 'developer',
        titleAr: `🟢 توثيق DNS نشط: ${verifiedDomains[0].name}`,
        titleEn: `🟢 Active DNS Trust: ${verifiedDomains[0].name}`,
        descAr: `النطاق الموثق (${verifiedDomains[0].name}) يعمل بكفاءة تامة ومعايير SPF/DKIM مفعّلة تضمن تسليم البريد للصندوق الوارد مباشرة.`,
        descEn: `Domain (${verifiedDomains[0].name}) is fully validated with SPF/DKIM keys ensuring direct inbox delivery.`,
        tab: 'domains'
      });
    }

    // 3. Webhooks check
    if (webhooks.length === 0) {
      insights.push({
        id: 'ins_webhook_none',
        type: 'weakness',
        section: 'developer',
        titleAr: '⚠️ غياب خوارزمية تسليم الأحداث (Webhooks)',
        titleEn: '⚠️ Absent Webhook Delivery Pipeline',
        descAr: 'لم تقم بتهيئة أي عنوان ويب هوك. ربط الويب هوك يضمن وصول إشعارات تسليم وفشل الرسائل لسيرفراتك حياً.',
        descEn: 'No webhook endpoints registered. Webhooks are critical to stream real-time delivery and failure events.',
        actionLabelAr: 'ربط ويب هوك جديد',
        actionLabelEn: 'Register Webhook',
        tab: 'webhooks'
      });
    } else {
      insights.push({
        id: 'ins_webhook_active',
        type: 'strength',
        section: 'developer',
        titleAr: '🟢 استقبال الأحداث مفعل (Webhooks)',
        titleEn: '🟢 Webhook Pipeline Connected',
        descAr: `الويب هوك الموجه لـ (\`${webhooks[0].url.length > 25 ? webhooks[0].url.substring(0, 22) + '...' : webhooks[0].url}\`) يستمع بفعالية لأحداث المنصة.`,
        descEn: `Webhook targeting (\`${webhooks[0].url.length > 25 ? webhooks[0].url.substring(0, 22) + '...' : webhooks[0].url}\`) is listening to events.`,
        tab: 'webhooks'
      });
    }

    // 4. Logs Delivery rate
    const failedLogs = logs.filter(l => l.status === 'failed');
    if (failedLogs.length > 0) {
      insights.push({
        id: 'ins_logs_failed',
        type: 'weakness',
        section: 'dashboard',
        titleAr: '⚠️ رصد عمليات إرسال فاشلة',
        titleEn: '⚠️ Recent Delivery Failures Detected',
        descAr: `تم تسجيل رسائل فاشلة في سجلات الإرسال الأخيرة. نقترح مراجعة صحة صياغة الأرقام أو التحقق من ربط بوابات الإرسال.`,
        descEn: `Recent messaging attempts failed. Verify phone numbers format or check active gateways status.`,
        actionLabelAr: 'فحص سجلات الفشل',
        actionLabelEn: 'Inspect Failed Logs',
        tab: 'logs'
      });
    } else if (logs.length > 0) {
      insights.push({
        id: 'ins_logs_perfect',
        type: 'strength',
        section: 'dashboard',
        titleAr: '🟢 كفاءة التوصيل 100%',
        titleEn: '🟢 100% Delivery Success Rate',
        descAr: 'جميع رسائل الاختبار والحملات الأخيرة تم تسليمها بنجاح. البنية التحتية مستقرة تماماً.',
        descEn: 'All recent campaign and test messages were delivered successfully. Core infrastructure is stable.',
        tab: 'logs'
      });
    }

    // 5. Channel Diversification Check
    const usedChannels = new Set(logs.map(l => l.type));
    if (usedChannels.size === 1) {
      const activeChan = Array.from(usedChannels)[0];
      const suggestionAr = activeChan === 'whatsapp' 
        ? 'أنت تعتمد بالكامل على قنوات الواتساب. نقترح ربط Zain SMS كقناة احتياطية وتفعيل الـ SMTP لتغطية مراسلات البريد.'
        : activeChan === 'sms'
        ? 'أنت تستخدم الـ SMS فقط. نقترح تفعيل إشعارات واتساب لتقليل تكلفة الإرسال بنسبة 60% وزيادة التفاعل.'
        : 'أنت ترسل البريد الإلكتروني فقط. نقترح ربط إشعارات الواتساب لتوصيل عاجل لرموز الأمان والمعاملات.';
      
      const suggestionEn = activeChan === 'whatsapp'
        ? 'You only use WhatsApp. We recommend configuring Zain SMS as a backup channel and activating SMTP emails.'
        : activeChan === 'sms'
        ? 'You only use SMS. We suggest enabling WhatsApp notifications to cut sending costs by 60%.'
        : 'You only send email. We recommend syncing WhatsApp to route urgent OTP codes directly.';

      insights.push({
        id: 'pred_channel_div',
        type: 'prediction',
        section: 'playground',
        titleAr: '🔮 خوارزمية تنويع قنوات الإرسال',
        titleEn: '🔮 Channel Diversification Recommendation',
        descAr: suggestionAr,
        descEn: suggestionEn,
        actionLabelAr: 'تجربة قنوات أخرى',
        actionLabelEn: 'Test Other Channels',
        tab: 'playground'
      });
    }

    // Summary text
    let summaryAr = 'سلوك الحساب مستقر بوجود قنوات نشطة ورصيد كافٍ.';
    let summaryEn = 'Account behavior is stable with active channels and sufficient balance.';
    if (insights.some(i => i.type === 'weakness')) {
      summaryAr = 'الخوارزميات توصي بمعالجة معوقات تسليم البريد وسجلات الـ DNS المعلقة لتحسين الأداء.';
      summaryEn = 'Algorithms recommend resolving DNS pending keys and email deliverability bottlenecks.';
    }

    return { insights, summaryAr, summaryEn };
  }, [walletBalance, domains, webhooks, logs]);

  const handleLogout = () => {
    localStorage.removeItem('sumer_token');
    setToken(null);
    setUser(null);
    handleTabChange('auth-signin');
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
      adminSettingsTrigger,
      behaviorProfile
    }}>
      {children}
    </SumerContext.Provider>
  );
};
