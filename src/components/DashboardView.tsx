import React, { useState, useMemo, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  TrendingUp, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles, 
  Plus, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Settings, 
  ExternalLink,
  Zap, 
  RefreshCw, 
  Sliders,
  Bell,
  MailOpen,
  PlusCircle,
  Trash2,
  Lock,
  Globe,
  Key,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { ScrollReveal } from './LandingView';
import { TemplatesView } from './TemplatesView';

interface DashboardViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  setLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  setCurrentTab: (tab: string, subTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => void;
  domains?: any[];
  setDomains?: React.Dispatch<React.SetStateAction<any[]>>;
  apiKeys?: any[];
  setApiKeys?: React.Dispatch<React.SetStateAction<any[]>>;
  walletBalance?: number;
  setWalletBalance?: React.Dispatch<React.SetStateAction<number>>;
  transactions?: any[];
  setTransactions?: React.Dispatch<React.SetStateAction<any[]>>;
  phoneNotifications?: any[];
  setPhoneNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  activeSubTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates';
  setActiveSubTab?: React.Dispatch<React.SetStateAction<'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates'>> | ((tab: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => void);
  theme?: 'light' | 'dark';
  setEmailBody?: (body: string) => void;
  setEmailSubject?: (subject: string) => void;
  setMsgBody?: (body: string) => void;
  setPlaygroundChannel?: (channel: 'email' | 'sms' | 'whatsapp') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  lang, 
  logs = [], 
  setLogs,
  setCurrentTab,
  domains = [],
  setDomains,
  apiKeys = [],
  setApiKeys,
  walletBalance = 0,
  setWalletBalance,
  transactions = [],
  setTransactions,
  phoneNotifications = [],
  setPhoneNotifications,
  activeSubTab: propActiveSubTab,
  setActiveSubTab: propSetActiveSubTab,
  theme,
  setEmailBody,
  setEmailSubject,
  setMsgBody,
  setPlaygroundChannel
}) => {
  const [showStepsAnyway, setShowStepsAnyway] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(() => {
    return localStorage.getItem('sumer_onboarding_dismissed_v2') === 'true';
  });

  // Code coupon copy state
  const [promoCopied, setPromoCopied] = useState(false);

  // Active sub-view tab inside dashboard overview
  const [localActiveSubTab, setLocalActiveSubTab] = useState<'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates'>('channels');
  const activeSubTab = propActiveSubTab !== undefined ? propActiveSubTab : localActiveSubTab;
  const setActiveSubTab = propSetActiveSubTab !== undefined ? propSetActiveSubTab : setLocalActiveSubTab;

  // Interactive Month Offset for calendar monthly grid
  const [currentMonthOffset, setCurrentMonthOffset] = useState<number>(0);
  // Selected day number in the current month (defaults to 21 to match screenshot)
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(21);

  // --- Sub-Tab Form States ---
  // Domains Form
  const [newDomainInput, setNewDomainInput] = useState('');
  const [expandedDomainId, setExpandedDomainId] = useState<any>(null);
  
  // API Keys Form
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyPerm, setNewKeyPerm] = useState<'full' | 'readonly'>('full');
  const [generatedKeyVisible, setGeneratedKeyVisible] = useState<string | null>(null);

  // Wallet / Deposit Form
  const [depositAmountInput, setDepositAmountInput] = useState<number>(25000);
  const [walletPhoneInput, setWalletPhoneInput] = useState('07800000000');
  const [depositSuccessMsg, setDepositSuccessMsg] = useState(false);

  // --- Phone Mockup Notification Simulator ---
  const mockNotifications = useMemo(() => {
    return {
      ar: [
        {
          id: 1,
          appName: 'زين كاش',
          icon: '💸',
          time: 'الآن',
          title: 'دفع مستلم',
          desc: 'تم استلام دفعة بقيمة 50,000 د.ع بنجاح'
        },
        {
          id: 2,
          appName: 'Sumer OTP',
          icon: '💬',
          time: 'منذ دقيقة',
          title: 'رمز التحقق',
          desc: 'رمز التحقق الخاص بك هو 4892 لتوثيق الدخول'
        },
        {
          id: 3,
          appName: 'النظام',
          icon: '🌐',
          time: 'منذ دقيقتين',
          title: 'تم تفعيل النطاق',
          desc: 'نطاقك sumersend.com مرتبط ونشط الآن'
        },
        {
          id: 4,
          appName: 'واتساب',
          icon: '🟢',
          time: 'منذ 5 د',
          title: 'تم إرسال الحملة',
          desc: 'تم إرسال 120 رسالة للمشتركين بنجاح'
        }
      ],
      en: [
        {
          id: 1,
          appName: 'Zain Cash',
          icon: '💸',
          time: 'now',
          title: 'Payment Received',
          desc: 'Payment of 50,000 IQD received successfully'
        },
        {
          id: 2,
          appName: 'Sumer OTP',
          icon: '💬',
          time: '1m ago',
          title: 'Verification Code',
          desc: 'Your verification code is 4892 for login'
        },
        {
          id: 3,
          appName: 'System',
          icon: '🌐',
          time: '2m ago',
          title: 'Domain Verified',
          desc: 'Your domain sumersend.com is now active'
        },
        {
          id: 4,
          appName: 'WhatsApp',
          icon: '🟢',
          time: '5m ago',
          title: 'Campaign Sent',
          desc: 'Successfully sent 120 messages to subscribers'
        }
      ]
    };
  }, []);

  const [activeNotifIndex, setActiveNotifIndex] = useState(0);
  const [visibleNotifs, setVisibleNotifs] = useState<any[]>([]);

  useEffect(() => {
    const list = mockNotifications[lang];
    setVisibleNotifs([list[0], list[1]]);
    setActiveNotifIndex(2);
  }, [lang, mockNotifications]);

  useEffect(() => {
    const list = mockNotifications[lang];
    const interval = setInterval(() => {
      setActiveNotifIndex(prevIndex => {
        setVisibleNotifs(prevNotifs => {
          const nextNotif = list[prevIndex % list.length];
          const updatedNotif = { ...nextNotif, uniqueId: Date.now() };
          const nextList = [...prevNotifs, updatedNotif];
          if (nextList.length > 3) {
            nextList.shift();
          }
          return nextList;
        });
        return prevIndex + 1;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [lang, mockNotifications]);

  // --- Showcase Carousel States ---
  const showcaseItems = useMemo(() => {
    return {
      ar: [
        {
          tag: 'سرعة التوصيل',
          title: 'توصيل فوري لرموز الـ OTP',
          desc: 'تسليم رموز التحقق والرسائل الثنائية في أقل من 2.5 ثانية عبر شبكات الهاتف المحلية بالعراق.'
        },
        {
          tag: 'قنوات الإرسال',
          title: 'بوابة موحدة وشاملة',
          desc: 'أرسل عبر رسائل SMS، سحابة WhatsApp، والبريد الإلكتروني SMTP من منصة وواجهة برمجية واحدة.'
        },
        {
          tag: 'سهولة الربط برمجياً',
          title: 'مكتبات برمجية ذكية للمطورين',
          desc: 'أكواد برمجية جاهزة للدمج الفوري بلغات Node.js، Python، و cURL مع توثيق كامل.'
        },
        {
          tag: 'المحفظة والشحن',
          title: 'دفع محلي عبر زين كاش',
          desc: 'شحن فوري للمحفظة عبر بوابة زين كاش لتغطية تعرفة الإرسال والبدء بالبث ثوانٍ معدودة.'
        }
      ],
      en: [
        {
          tag: 'DELIVERY SPEED',
          title: 'Instant OTP Deliveries',
          desc: 'Verification codes and SMS messages delivered in under 2.5s across local carriers.'
        },
        {
          tag: 'MULTI-CHANNEL',
          title: 'Unified Dispatch Gateway',
          desc: 'Send via carrier SMS, WhatsApp Cloud, and SMTP Email from a single API.'
        },
        {
          tag: 'EASY INTEGRATION',
          title: 'Developer-First SDKs',
          desc: 'Integrate rapidly into your codebase with Node.js, Python, and cURL guides.'
        },
        {
          tag: 'WALLET DEPOSIT',
          title: 'Instant Zain Cash Top-up',
          desc: 'Recharge your account wallet in seconds to cover transmission rates instantly.'
        }
      ]
    };
  }, []);

  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState(0);

  useEffect(() => {
    const list = showcaseItems[lang];
    const interval = setInterval(() => {
      setActiveShowcaseIndex(prev => (prev + 1) % list.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [lang, showcaseItems]);


  // Onboarding status calculations
  const step1Done = domains.length > 0 && domains.every((d: any) => d.status === 'verified');
  const step2Done = transactions.length > 1;
  const step3Done = apiKeys.length > 1;
  const step4Done = logs.length > 3;

  let completedSteps = 0;
  if (step1Done) completedSteps++;
  if (step2Done) completedSteps++;
  if (step3Done) completedSteps++;
  if (step4Done) completedSteps++;
  const progressPercent = Math.round((completedSteps / 4) * 100);

  const nextStep = !step1Done ? 1 : (!step2Done ? 2 : (!step3Done ? 3 : (!step4Done ? 4 : 0)));
  const [activeStep, setActiveStep] = useState<number>(nextStep > 0 ? nextStep - 1 : 0);

  const onboardingSteps = useMemo(() => [
    {
      id: 1,
      titleAr: 'توثيق النطاق',
      titleEn: 'Domain Verification',
      descAr: 'قم بتفعيل النطاق المعلق (DNS) لتمكين توقيع البريد وإرسال موثوق.',
      descEn: 'Verify your pending domain DNS to enable digital signing (DKIM/SPF) for secure deliverability.',
      isDone: step1Done,
      actionTab: 'domains',
      actionTextAr: 'ربط النطاق',
      actionTextEn: 'Verify Domain',
    },
    {
      id: 2,
      titleAr: 'شحن رصيد المحفظة',
      titleEn: 'Deposit Credits',
      descAr: 'قم بعملية شحن المحفظة عبر بوابة زين كاش لتغطية تكاليف الإرسال والـ API.',
      descEn: 'Top up your account wallet via Zain Cash gateway to cover carrier API transmission fees.',
      isDone: step2Done,
      actionTab: 'wallet',
      actionTextAr: 'شحن الآن',
      actionTextEn: 'Top-up Wallet',
    },
    {
      id: 3,
      titleAr: 'توليد مفتاح API',
      titleEn: 'Create API Key',
      descAr: 'أضف مفتاح API مخصص لربطه بتطبيقاتك البرمجية والبدء بالإرسال التلقائي.',
      descEn: 'Generate a secure API key to authenticate and connect your backend services.',
      isDone: step3Done,
      actionTab: 'apikeys',
      actionTextAr: 'توليد مفتاح',
      actionTextEn: 'Generate Key',
    },
    {
      id: 4,
      titleAr: 'إرسال أول اختبار',
      titleEn: 'Send Test API',
      descAr: 'أرسل رسالة تجريبية من منصة الاختبار لترى وصولها الفوري إلى الهاتف.',
      descEn: 'Send a sandbox test notification in the playground to check instant delivery.',
      isDone: step4Done,
      actionTab: 'playground',
      actionTextAr: 'منصة الاختبار',
      actionTextEn: 'Go to Playground',
    }
  ], [step1Done, step2Done, step3Done, step4Done]);

  const activeOnboardingStep = onboardingSteps[activeStep] || onboardingSteps[0];

  const totalSent = logs.length;
  const deliveredLogs = logs.filter(l => l.status === 'delivered' || l.status === 'success').length;
  const deliveryRateValue = totalSent > 0 ? Math.round((deliveredLogs / totalSent) * 100) : 98;

  useEffect(() => {
    if (nextStep > 0) {
      setActiveStep(nextStep - 1);
    }
  }, [nextStep]);

  useEffect(() => {
    if (step1Done && step2Done && step3Done && step4Done) {
      const hasCelebrated = localStorage.getItem('sumer_onboarding_celebrated');
      if (!hasCelebrated) {
        localStorage.setItem('sumer_onboarding_celebrated', 'true');
        window.dispatchEvent(new CustomEvent('sumer-success-screen'));
      }
    } else {
      localStorage.removeItem('sumer_onboarding_celebrated');
    }
  }, [step1Done, step2Done, step3Done, step4Done]);

  // Handler for custom tab switches
  const handleTabClick = (tabKey: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => {
    setActiveSubTab(tabKey);
  };

  const handleCopyPromo = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('ZAIN10');
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 2000);
  };

  // --- Actions ---
  // Domains Actions
  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim() || !setDomains) return;
    const newDomain = {
      id: Date.now().toString(),
      name: newDomainInput.trim().toLowerCase(),
      status: 'pending',
      created_at: new Date().toISOString()
    };
    setDomains(prev => [...prev, newDomain]);
    setNewDomainInput('');
  };

  const handleVerifyDomain = (id: string) => {
    if (!setDomains) return;
    setDomains(prev => prev.map(d => d.id === id ? { ...d, status: 'verified' } : d));
  };

  const handleDeleteDomain = (id: string) => {
    if (!setDomains) return;
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  // API Keys Actions
  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || !setApiKeys) return;
    const randomHex = Math.random().toString(16).substring(2, 22);
    const newKeyStr = `sm_live_${randomHex}`;
    const newKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: newKeyStr,
      created_at: new Date().toISOString(),
      permissions: newKeyPerm,
      status: 'active'
    };
    setApiKeys(prev => [...prev, newKey]);
    setGeneratedKeyVisible(newKeyStr);
    setNewKeyName('');
  };

  const handleDeleteKey = (id: string) => {
    if (!setApiKeys) return;
    setApiKeys(prev => prev.filter(k => k.id !== id));
  };

  // Wallet / Deposit Actions
  const handleRechargeWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (depositAmountInput <= 0 || !setWalletBalance || !setTransactions) return;
    
    // Process recharge
    setWalletBalance(prev => prev + depositAmountInput);
    
    // Add transaction log
    const newTx = {
      id: `txn_${Date.now().toString().slice(-6)}`,
      amount: depositAmountInput,
      type: 'deposit',
      status: 'success',
      date: new Date().toISOString(),
      method: 'Zain Cash'
    };
    setTransactions(prev => [newTx, ...prev]);
    setDepositSuccessMsg(true);
    setTimeout(() => setDepositSuccessMsg(false), 4000);
  };

  // Translations
  const t = useMemo(() => {
    return {
      en: {
        dashboardTitle: 'Main Dashboard',
        manage: 'Manage System',
        tabOverview: 'Overview',
        tabWhatsApp: 'WhatsApp Connection',
        tabCampaigns: 'Campaigns',
        tabSubscribers: 'Audience & Lists',
        tabTemplates: 'Template Management',
        todaySends: "Today's Sends",
        activeKeys: 'Active Keys',
        availableBalance: 'Available Balance',
        sendsToday: 'Sends Today',
        successRate: 'Success Rate',
        promoTitle: 'Get 10% Extra Credit',
        promoDesc: 'Top up via Zain Cash gateway & apply code',
        apiStatusTitle: 'API Gateway Status',
        apiStatusDesc: 'Connected & Active',
        latency: 'Response Time',
        activeGateways: 'Active Delivery Channels',
        checkAll: 'Check All',
        zainSms: 'SMS Carrier Gateway',
        zainSmsSub: 'Zain / AsiaCell / Korek',
        smtpMailer: 'Sumer SMTP Mailer',
        smtpMailerSub: 'smtp.sumer.send',
        waGateway: 'WhatsApp Cloud API',
        waGatewaySub: 'graph.facebook.com',
        connected: 'Connected',
        onboardingTitle: 'Sumer Send Setup Guide',
        completed: 'Completed',
        otpVerify: 'Zain OTP Delivery Check',
        dnsSync: 'DNS Certificate Sync',
        sandboxUpdate: 'Developer Sandbox Sync',
        noActiveChannels: 'No active events on this day',
        trafficNotStarted: 'Traffic has not started yet',
        leadDev: 'Lead Developer',
        calendarTitle: 'Activity Planner',
        zainCashWebhookAudit: 'Zain Cash Webhook Audit',
        waTemplateSync: 'WhatsApp Cloud Template Sync',
        smtpTuning: 'SMTP Performance Tuning',
        billingCycleCheck: 'Billing Cycle Integrity Check',
        noEvents: 'No events scheduled for this date',
        
        // Tab Specific Translation
        domainsTitle: 'Sender Domains',
        addDomain: 'Link New Domain',
        domainPlaceholder: 'e.g. store.iq',
        status: 'Status',
        actions: 'Actions',
        dnsSettings: 'DNS Records Verification',
        verifyBtn: 'Verify DNS',
        deleteBtn: 'Remove',
        pending: 'Pending Verification',
        verified: 'Verified',
        apiKeysTitle: 'API Credentials',
        addKey: 'Generate API Key',
        keyNamePlaceholder: 'e.g. Production Live API',
        permissions: 'Permissions',
        fullAccess: 'Full Outbound (SMS/Email/WA)',
        readOnly: 'Logs & Metrics Read-Only',
        generateBtn: 'Generate Credentials',
        copiedKey: 'Key Copied!',
        generatedSuccess: 'API Key generated successfully! Make sure to copy it now as you won\'t see it again:',
        walletTitle: 'Iraqi Wallet Console',
        quickAmount: 'Quick Deposit Amount',
        depositBtn: 'Deposit via Zain Cash Gateway',
        phonePlaceholder: 'e.g. 07800000000',
        phoneLabel: 'Zain Cash Wallet Number',
        amountLabel: 'Amount (IQD)',
        depositSuccess: 'Wallet successfully topped up!',
        transactionHistory: 'Recharge & Billing History',
        method: 'Method',
        date: 'Date',
        amount: 'Amount'
      },
      ar: {
        dashboardTitle: 'لوحة التحكم',
        manage: 'إدارة النظام',
        tabOverview: 'نظرة عامة',
        tabWhatsApp: 'ربط واتساب',
        tabCampaigns: 'حملات الإرسال',
        tabSubscribers: 'إدارة المشتركين',
        tabTemplates: 'تصميم وإدارة القوالب',
        todaySends: 'إرسال اليوم',
        activeKeys: 'المفاتيح النشطة',
        availableBalance: 'الرصيد المتاح',
        sendsToday: 'نشاط إرسال اليوم',
        successRate: 'نسبة النجاح',
        promoTitle: 'رصيد شحن إضافي 10%',
        promoDesc: 'اشحن المحفظة عبر زين كاش واستخدم كود',
        apiStatusTitle: 'حالة بوابة الـ API',
        apiStatusDesc: 'متصل ونشط بالكامل',
        latency: 'زمن الاستجابة',
        activeGateways: 'قنوات الإرسال النشطة',
        checkAll: 'عرض الكل',
        zainSms: 'بوابة إرسال الـ SMS',
        zainSmsSub: 'زين / آسيا سيل / كورك',
        smtpMailer: 'خادم البريد Sumer SMTP',
        smtpMailerSub: 'smtp.sumer.send',
        waGateway: 'بوابة الواتساب السحابية',
        waGatewaySub: 'graph.facebook.com',
        connected: 'نشط ومتصل',
        onboardingTitle: 'دليل تفعيل بوابة سومر',
        completed: 'مكتمل',
        otpVerify: 'فحص وصول رسائل Zain OTP',
        dnsSync: 'مزامنة DNS وشهادة النطاق',
        sandboxUpdate: 'تحديث Sandbox للمطورين',
        noActiveChannels: 'لا توجد قنوات نشطة في هذا اليوم',
        trafficNotStarted: 'لم تبدأ حركة اليوم بعد',
        leadDev: 'المطور الرئيس',
        calendarTitle: 'مخطط الأنشطة اليومية',
        zainCashWebhookAudit: 'تدقيق ويب هوك زين كاش',
        waTemplateSync: 'مزامنة قوالب الواتساب السحابية',
        smtpTuning: 'ضبط أداء خادم SMTP',
        billingCycleCheck: 'فحص دورة الفوترة المالية',
        noEvents: 'لا توجد أحداث مجدولة لهذا التاريخ',
        
        // Tab Specific Translation
        domainsTitle: 'إدارة نطاقات الإرسال',
        addDomain: 'ربط نطاق إرسال جديد',
        domainPlaceholder: 'مثال: store.iq',
        status: 'الحالة',
        actions: 'الإجراءات',
        dnsSettings: 'سجلات DNS المطلوبة للتوثيق',
        verifyBtn: 'تحقق من السجلات',
        deleteBtn: 'حذف',
        pending: 'بانتظار التوثيق',
        verified: 'موثق ونشط',
        apiKeysTitle: 'مفاتيح الـ API للمطورين',
        addKey: 'توليد مفتاح API جديد',
        keyNamePlaceholder: 'مثال: مفتاح الإنتاج المباشر',
        permissions: 'الصلاحيات',
        fullAccess: 'إرسال كامل (SMS/البريد/واتساب)',
        readOnly: 'قراءة السجلات والإحصائيات فقط',
        generateBtn: 'توليد مفتاح الاتصال',
        copiedKey: 'تم نسخ المفتاح!',
        generatedSuccess: 'تم توليد مفتاح الـ API بنجاح! يرجى نسخه وحفظه الآن حيث لن يظهر لك مجدداً:',
        walletTitle: 'شحن رصيد المحفظة العراقية',
        quickAmount: 'مبلغ الشحن السريع',
        depositBtn: 'شحن فوري عبر بوابة زين كاش',
        phonePlaceholder: 'مثال: 07800000000',
        phoneLabel: 'رقم محفظة زين كاش المتلقية',
        amountLabel: 'المبلغ (د.ع)',
        depositSuccess: 'تم شحن المحفظة وتحديث الرصيد المتاح بنجاح!',
        transactionHistory: 'سجل عمليات شحن رصيد المحفظة',
        method: 'الوسيلة',
        date: 'التاريخ',
        amount: 'المبلغ'
      }
    }[lang];
  }, [lang]);

  // Weekdays headers
  const weekdays = useMemo(() => {
    return lang === 'en' 
      ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      : ['أحد', 'إثن', 'ثلا', 'أرب', 'خميس', 'جمع', 'سبت'];
  }, [lang]);

  // Month grid calculator
  const calendarMonthData = useMemo(() => {
    const now = new Date();
    const targetMonthDate = new Date(now.getFullYear(), now.getMonth() + currentMonthOffset, 1);
    const year = targetMonthDate.getFullYear();
    const month = targetMonthDate.getMonth();

    const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay();

    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthDays = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

    const grid = [];

    // Pad previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dNum = prevMonthDays - i;
      grid.push({
        num: dNum,
        isCurrentMonth: false,
        date: new Date(year, month - 1, dNum)
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        num: i,
        isCurrentMonth: true,
        date: new Date(year, month, i)
      });
    }

    // Next month padding to make a full grid of 35 cells
    const remaining = 35 - grid.length;
    const nextMonthPadding = remaining > 0 ? remaining : (42 - grid.length);
    for (let i = 1; i <= nextMonthPadding; i++) {
      grid.push({
        num: i,
        isCurrentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }

    const monthName = targetMonthDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', { month: 'short', year: 'numeric' });
    const selectedDateString = new Date(year, month, selectedDayNumber).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', { weekday: 'short', month: 'short', day: 'numeric' });

    return {
      grid,
      monthName,
      selectedDateString
    };
  }, [currentMonthOffset, selectedDayNumber, lang]);

  return (
    <ScrollReveal>
      {/* 1. Onboarding Checklist Banner (Conditional) */}
      {(!onboardingDismissed || showStepsAnyway) && (
        <div className="onboarding-split-card" style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative', marginBottom: '24px' }}>
          {/* Close button */}
          <button
            onClick={() => {
              localStorage.setItem('sumer_onboarding_dismissed_v2', 'true');
              setOnboardingDismissed(true);
              setShowStepsAnyway(false);
            }}
            style={{
              position: 'absolute',
              top: '16px',
              right: lang === 'ar' ? 'auto' : '16px',
              left: lang === 'ar' ? '16px' : 'auto',
              background: 'var(--panel-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'all 0.2s ease',
            }}
          >
            <X size={14} />
          </button>

          <div className="onboarding-split-info" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span className="sumer-badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)', fontWeight: 700, fontSize: '11px', padding: '3px 8px', borderRadius: '8px' }}>
                  {t.onboardingTitle}
                </span>
                <span className="tabular-nums-stat" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {completedSteps}/4 {t.completed} ({progressPercent}%)
                </span>
              </div>

              <div style={{ textAlign: 'start' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    backgroundColor: activeOnboardingStep.isDone ? 'var(--success-color)' : 'var(--text-primary)',
                    color: activeOnboardingStep.isDone ? '#fff' : 'var(--bg-color)',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 800,
                    flexShrink: 0
                  }}>
                    {activeOnboardingStep.isDone ? '✓' : activeOnboardingStep.id}
                  </span>
                  <span>{lang === 'ar' ? activeOnboardingStep.titleAr : activeOnboardingStep.titleEn}</span>
                  {activeOnboardingStep.isDone && (
                    <span className="sumer-badge success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                      ✓
                    </span>
                  )}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', minHeight: '50px' }}>
                  {lang === 'ar' ? activeOnboardingStep.descAr : activeOnboardingStep.descEn}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: 'auto' }}>
              <button
                onClick={() => handleTabClick(activeOnboardingStep.actionTab as any)}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600, borderRadius: '99px' }}
              >
                {lang === 'ar' ? activeOnboardingStep.actionTextAr : activeOnboardingStep.actionTextEn}
              </button>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <div className="onboarding-dots-container">
                {onboardingSteps.map((step, idx) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`onboarding-dot ${idx === activeStep ? 'active' : ''} ${step.isDone ? 'done' : ''}`}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => prev - 1)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: activeStep === 0 ? 0.4 : 1, cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
                    backgroundColor: 'var(--panel-muted)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'
                  }}
                >
                  {lang === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
                <button
                  disabled={activeStep === onboardingSteps.length - 1}
                  onClick={() => setActiveStep(prev => prev + 1)}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: activeStep === onboardingSteps.length - 1 ? 0.4 : 1, cursor: activeStep === onboardingSteps.length - 1 ? 'not-allowed' : 'pointer',
                    backgroundColor: 'var(--panel-muted)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'
                  }}
                >
                  {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="onboarding-split-visual" style={{ minHeight: '260px' }}>
            {activeStep === 0 && (
              <div className="mockup-floating-card" style={{ width: '100%', maxWidth: '280px', textAlign: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>DNS Records</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>domain.iq</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TXT (SPF)</span>
                      <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>v=spf1 include:sumer.send...</span>
                    </div>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#10b981', fontWeight: 600 }}>
                      <span className="pulse-dot-verified" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                      Verified
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="mockup-floating-card" style={{ width: '100%', maxWidth: '250px', padding: '0', overflow: 'hidden', borderBottomStyle: 'dashed', borderBottomWidth: '2px' }}>
                <div style={{ backgroundColor: '#ff9900', padding: '12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>ZAIN CASH</span>
                  <span style={{ fontSize: '9px', opacity: 0.9, fontWeight: 700 }}>RECEIPT</span>
                </div>
                <div style={{ padding: '16px', fontSize: '11px', textAlign: 'start' }}>
                  <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>Simulated Deposit</span>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>50,000 IQD</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout */}
      <div className="dashboard-layout-wrapper">
        
        {/* Left Area (2/3 width) */}
        <div className="dashboard-left-col">
          
          {/* Title Row */}
          <div style={{ textAlign: 'start', marginBottom: '4px' }}>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {t.dashboardTitle}
            </h1>
          </div>

          {/* Tabs & Actions Bar */}
          <div className="flex-between" style={{ 
            alignItems: 'center', 
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '8px',
            marginBottom: '20px'
          }}>
            <div className="dashboard-header-tabs" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: 0 }}>
              <button 
                onClick={() => handleTabClick('channels')} 
                className={`dashboard-tab-btn ${activeSubTab === 'channels' ? 'active' : ''}`}
              >
                {t.tabOverview}
              </button>
              <button 
                onClick={() => setCurrentTab('whatsapp')} 
                className="dashboard-tab-btn"
              >
                {t.tabWhatsApp}
              </button>
              <button 
                onClick={() => setCurrentTab('campaigns')} 
                className="dashboard-tab-btn"
              >
                {t.tabCampaigns}
              </button>
              <button 
                onClick={() => setCurrentTab('subscribers')} 
                className="dashboard-tab-btn"
              >
                {t.tabSubscribers}
              </button>
              <button 
                onClick={() => handleTabClick('templates')} 
                className={`dashboard-tab-btn ${activeSubTab === 'templates' ? 'active' : ''}`}
              >
                {t.tabTemplates}
              </button>
            </div>
            
            {/* Manage system dropdown */}
            <button 
              onClick={() => setCurrentTab('platform-settings')}
              className="btn btn-secondary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 700,
                borderRadius: '12px',
                height: '34px',
                padding: '0 14px',
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                alignSelf: 'center'
              }}
            >
              <span>{t.manage}</span>
              <Sliders size={13} style={{ opacity: 0.8 }} />
            </button>
          </div>

          {/* DYNAMIC CONTENT SWITCHING BASED ON SELECTED TAB */}
          
          {/* A. OVERVIEW SUB-VIEW */}
          {activeSubTab === 'channels' && (
            <>
              {/* Bento Grid */}
              <div className="dashboard-bento-grid">
                
                {/* Card 1: Today's Sends (Sparkline) */}
                <div className="bento-card-flat bento-card-sparkline">
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {t.todaySends}
                    </span>
                    <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                      {(totalSent * 3 + 120).toLocaleString()}
                    </h2>
                  </div>
                  <div className="sparkline-chart-container">
                    <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path 
                        d="M 0 35 Q 15 20 30 32 T 60 12 T 80 22 T 100 8" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                </div>

                {/* Card 2: Active Keys Count (Amber) */}
                <div 
                  className="bento-card-flat bento-card-demographics bento-card-orange"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTabClick('apikeys')}
                >
                  <span className="bento-label">{t.activeKeys}</span>
                  <h2 className="bento-number" style={{ fontFamily: 'monospace' }}>
                    {apiKeys.length || 3}
                  </h2>
                </div>

                {/* Card 3: Animated Phone Lock Screen Simulator */}
                <div 
                  className="bento-card-flat bento-card-phone-mockup"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTabClick('domains')}
                >
                  <div className="mock-phone-container">
                    <div className="mock-phone-glow"></div>
                    <div className="mock-phone-shell">
                      <div className="mock-phone-notch"></div>
                      <div className="mock-phone-status-bar">
                        <span>14:03</span>
                        <div className="mock-phone-icons">
                          <span style={{ fontSize: '8px' }}>📶</span>
                          <span style={{ fontSize: '8px' }}>🔋 85%</span>
                        </div>
                      </div>
                      <div className="mock-phone-notifications">
                        {visibleNotifs.map((notif) => (
                          <div 
                            key={notif.uniqueId || notif.id} 
                            className={`mock-phone-notif-card ${lang === 'ar' ? 'rtl' : 'ltr'}`}
                          >
                            <div className="mock-phone-notif-header">
                              <div className="mock-phone-notif-app">
                                <span className="mock-phone-notif-icon">{notif.icon}</span>
                                <span className="mock-phone-notif-appname">{notif.appName}</span>
                              </div>
                              <span className="mock-phone-notif-time">{notif.time}</span>
                            </div>
                            <div className="mock-phone-notif-title">{notif.title}</div>
                            <div className="mock-phone-notif-desc">{notif.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div className="mock-phone-home-indicator"></div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleTabClick('domains'); }}
                    className="bento-image-btn" 
                    title={lang === 'ar' ? 'إدارة النطاقات' : 'Manage Domains'}
                    style={{ zIndex: 12 }}
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>

                {/* Card 4: Stats Stacking */}
                <div className="bento-card-flat bento-card-stats stats-stacked-card">
                  {/* Top: Available Balance */}
                  <div 
                    className="stats-stack-item"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleTabClick('wallet')}
                  >
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.availableBalance}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {walletBalance.toLocaleString()} د.ع
                      </span>
                      <span style={{ color: 'var(--success-color)', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                        <TrendingUp size={10} style={{ marginInlineEnd: '2px' }} />
                        12%
                      </span>
                    </div>
                  </div>
                  <div className="stats-stack-divider" />
                  
                  {/* Middle: Sends Today */}
                  <div className="stats-stack-item">
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.sendsToday}
                    </span>
                    <div className="stats-stack-dashed-box">
                      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {logs.length || 24}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#10b981', fontWeight: 700 }}>
                        <span className="pulse-dot-verified" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="stats-stack-divider" />

                  {/* Bottom: Success rate */}
                  <div className="stats-stack-item">
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {t.successRate}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {deliveryRateValue}%
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        / 100%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 5: Professional Showcase / Status Slider */}
                <div 
                  className="bento-card-flat bento-card-promo bento-card-showcase" 
                  style={{ cursor: 'pointer', padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                  onClick={() => handleTabClick('domains')}
                >
                  <div className="showcase-card-container" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: 'start' }}>
                    <div key={activeShowcaseIndex} className="showcase-content-wrapper">
                      <span className="showcase-tag">
                        {showcaseItems[lang][activeShowcaseIndex]?.tag}
                      </span>
                      <h3 className="showcase-title">
                        {showcaseItems[lang][activeShowcaseIndex]?.title}
                      </h3>
                      <p className="showcase-desc">
                        {showcaseItems[lang][activeShowcaseIndex]?.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 6: Dark Forest Green API Status */}
                <div className="bento-card-flat bento-card-status bento-card-forest">
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.8, textTransform: 'uppercase' }}>
                      {t.apiStatusTitle}
                    </span>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '6px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="pulse-dot-verified" style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%' }} />
                      {t.apiStatusDesc}
                    </h4>
                  </div>
                  <div style={{ textAlign: 'start', marginTop: 'auto' }}>
                    <span style={{ fontSize: '9px', opacity: 0.7, textTransform: 'uppercase' }}>
                      {t.latency}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, fontFamily: 'monospace' }}>11 ms</span>
                      <button 
                        onClick={() => setCurrentTab('playground')}
                        style={{ background: 'none', border: 'none', color: '#ffb800', cursor: 'pointer', padding: '4px' }}
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Active Delivery Channels */}
              <div className="dispatch-channels-section">
                <div className="flex-between" style={{ alignItems: 'center', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textAlign: 'start' }}>
                    {t.activeGateways}
                  </h2>
                  <button 
                    onClick={() => handleTabClick('domains')}
                    style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>{t.checkAll}</span>
                    <ChevronRight size={12} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                  </button>
                </div>

                <div className="dispatch-grid">
                  
                  {/* 1. Zain SMS Gateway */}
                  <div className="dispatch-card-premium">
                    <div className="dispatch-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.zainSms}</span>
                      </div>
                      <label className="sumer-switch" style={{ width: '34px', height: '20px' }}>
                        <input type="checkbox" defaultChecked />
                        <span className="sumer-slider round" />
                      </label>
                    </div>
                    <div style={{ textAlign: 'start' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.zainSmsSub}</span>
                      <div className="dispatch-card-tags">
                        <span className="dispatch-tag yellow">SMS</span>
                        <span className="dispatch-tag pink">Zain Cash</span>
                      </div>
                    </div>
                    <div className="dispatch-card-footer">
                      <div className="dispatch-avatars">
                        <div className="dispatch-avatar-circle" style={{ backgroundColor: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>JK</div>
                        <div className="dispatch-avatar-circle" style={{ backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>MH</div>
                      </div>
                      <div className="dispatch-actions">
                        <button onClick={() => handleTabClick('domains')} className="dispatch-action-btn-round"><Settings size={13} /></button>
                        <button onClick={() => setCurrentTab('playground')} className="dispatch-action-btn-round"><ExternalLink size={13} /></button>
                      </div>
                    </div>
                  </div>

                  {/* 2. SMTP Mailer */}
                  <div className="dispatch-card-premium">
                    <div className="dispatch-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.smtpMailer}</span>
                      </div>
                      <label className="sumer-switch" style={{ width: '34px', height: '20px' }}>
                        <input type="checkbox" defaultChecked />
                        <span className="sumer-slider round" />
                      </label>
                    </div>
                    <div style={{ textAlign: 'start' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.smtpMailerSub}</span>
                      <div className="dispatch-card-tags">
                        <span className="dispatch-tag purple">SMTP</span>
                        <span className="dispatch-tag blue">TLS SSL</span>
                      </div>
                    </div>
                    <div className="dispatch-card-footer">
                      <div className="dispatch-avatars">
                        <div className="dispatch-avatar-circle" style={{ backgroundColor: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>JK</div>
                        <div className="dispatch-avatar-more">+3</div>
                      </div>
                      <div className="dispatch-actions">
                        <button onClick={() => handleTabClick('domains')} className="dispatch-action-btn-round"><Settings size={13} /></button>
                        <button onClick={() => setCurrentTab('playground')} className="dispatch-action-btn-round"><ExternalLink size={13} /></button>
                      </div>
                    </div>
                  </div>

                  {/* 3. WhatsApp Cloud API */}
                  <div className="dispatch-card-premium">
                    <div className="dispatch-card-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.waGateway}</span>
                      </div>
                      <label className="sumer-switch" style={{ width: '34px', height: '20px' }}>
                        <input type="checkbox" defaultChecked />
                        <span className="sumer-slider round" />
                      </label>
                    </div>
                    <div style={{ textAlign: 'start' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.waGatewaySub}</span>
                      <div className="dispatch-card-tags">
                        <span className="dispatch-tag green">WhatsApp</span>
                        <span className="dispatch-tag teal">API v18</span>
                      </div>
                    </div>
                    <div className="dispatch-card-footer">
                      <div className="dispatch-avatars">
                        <div className="dispatch-avatar-circle" style={{ backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>MH</div>
                        <div className="dispatch-avatar-circle" style={{ backgroundColor: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>JK</div>
                      </div>
                      <div className="dispatch-actions">
                        <button onClick={() => handleTabClick('domains')} className="dispatch-action-btn-round"><Settings size={13} /></button>
                        <button onClick={() => setCurrentTab('playground')} className="dispatch-action-btn-round"><ExternalLink size={13} /></button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}

          {/* B. DOMAINS INTEGRATED SUB-VIEW */}
          {activeSubTab === 'domains' && (
            <div className="dashboard-card" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', textAlign: 'start' }}>
              <div className="flex-between" style={{ alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} style={{ color: 'var(--accent-text)' }} />
                  <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{t.domainsTitle}</h2>
                </div>
              </div>

              {/* Add Domain Inline Form */}
              <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '10px', marginBottom: '24px', width: '100%', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder={t.domainPlaceholder}
                  style={{
                    flex: 1,
                    minWidth: '220px',
                    padding: '8px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--panel-muted)',
                    color: 'var(--text-primary)',
                    fontSize: '13px'
                  }}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', fontSize: '13px', borderRadius: '10px', height: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={14} />
                  <span>{t.addDomain}</span>
                </button>
              </form>

              {/* Domains list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {domains.map((dom: any) => {
                  const isExpanded = expandedDomainId === dom.id;
                  const isVerified = dom.status === 'verified';
                  return (
                    <div key={dom.id} style={{ border: '1px solid var(--border-color)', borderRadius: '16px', backgroundColor: 'var(--panel-bg)', overflow: 'hidden' }}>
                      <div className="flex-between" style={{ padding: '16px', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpandedDomainId(isExpanded ? null : dom.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>{dom.name}</span>
                          <span className={`sumer-badge ${isVerified ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                            {isVerified ? t.verified : t.pending}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {!isVerified && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleVerifyDomain(dom.id); }}
                              className="btn btn-secondary" 
                              style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '6px', height: '26px', border: '1px solid #10b981', color: '#10b981' }}
                            >
                              {t.verifyBtn}
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteDomain(dom.id); }}
                            style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                            title={t.deleteBtn}
                          >
                            <Trash2 size={14} />
                          </button>
                          <ChevronRight size={14} style={{ transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--panel-muted)', fontSize: '12px' }}>
                          <h4 style={{ fontWeight: 800, marginBottom: '10px', fontSize: '12px' }}>{t.dnsSettings}</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontFamily: 'monospace' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>TXT (SPF)</span>
                              <span style={{ color: 'var(--text-primary)' }}>v=spf1 include:sumer.send ~all</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border-color)', paddingBottom: '6px' }}>
                              <span style={{ color: 'var(--text-secondary)' }}>CNAME (DKIM)</span>
                              <span style={{ color: 'var(--text-primary)' }}>sumer._domainkey.domain.iq</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* C. API KEYS INTEGRATED SUB-VIEW */}
          {activeSubTab === 'apikeys' && (
            <div className="dashboard-card" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', textAlign: 'start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Key size={18} style={{ color: '#ffb800' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{t.apiKeysTitle}</h2>
              </div>

              {/* Generate Key Form */}
              <form onSubmit={handleGenerateKey} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder={t.keyNamePlaceholder}
                    style={{
                      flex: 2,
                      minWidth: '200px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--panel-muted)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  />
                  <select 
                    value={newKeyPerm}
                    onChange={(e: any) => setNewKeyPerm(e.target.value)}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--panel-muted)',
                      color: 'var(--text-primary)',
                      fontSize: '13px'
                    }}
                  >
                    <option value="full">{t.fullAccess}</option>
                    <option value="readonly">{t.readOnly}</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', fontSize: '13px', borderRadius: '10px', height: '36px', alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <PlusCircle size={14} />
                  <span>{t.generateBtn}</span>
                </button>
              </form>

              {/* Generated key alert */}
              {generatedKeyVisible && (
                <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', padding: '16px', borderRadius: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>{t.generatedSuccess}</span>
                    <button onClick={() => setGeneratedKeyVisible(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex-between" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', marginTop: '10px', alignItems: 'center' }}>
                    <code style={{ fontSize: '13px', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{generatedKeyVisible}</code>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKeyVisible);
                        alert(t.copiedKey);
                      }}
                      className="btn" 
                      style={{ padding: '4px 10px', fontSize: '11px', height: '24px', border: '1px solid var(--border-color)' }}
                    >
                      {t.copiedKey}
                    </button>
                  </div>
                </div>
              )}

              {/* Keys list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {apiKeys.map((k: any) => (
                  <div key={k.id} className="flex-between" style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '14px', alignItems: 'center', backgroundColor: 'var(--panel-muted)' }}>
                    <div style={{ textAlign: 'start' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>{k.name}</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                        <code style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {k.key.substring(0, 10)}••••••••••••••••••••
                        </code>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(k.key); alert('Copied!'); }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }}
                          title="Copy API Key"
                        >
                          <Copy size={11} />
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className="sumer-badge success" style={{ fontSize: '9px', padding: '1px 6px' }}>
                        {k.permissions === 'readonly' ? 'Read-Only' : 'Full Access'}
                      </span>
                      <button 
                        onClick={() => handleDeleteKey(k.id)}
                        style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                        title={t.deleteBtn}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* D. WALLET & BILLING INTEGRATED SUB-VIEW */}
          {activeSubTab === 'wallet' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Wallet Card */}
              <div className="bento-card-flat" style={{ padding: '24px', minHeight: 'auto', background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)', border: '1px solid rgba(2, 132, 199, 0.2)' }}>
                <div className="flex-between" style={{ alignItems: 'center', width: '100%' }}>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t.availableBalance}</span>
                    <h2 style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'monospace' }}>
                      {walletBalance.toLocaleString()} د.ع
                    </h2>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(2, 132, 199, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CreditCard size={20} style={{ color: 'var(--accent-text)', margin: 'auto' }} />
                  </div>
                </div>
              </div>

              {/* Zain Cash Recharge Form */}
              <div className="dashboard-card" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', textAlign: 'start' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>{t.walletTitle}</h3>

                {depositSuccessMsg && (
                  <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid #10b981', padding: '12px', borderRadius: '12px', color: '#047857', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
                    {t.depositSuccess}
                  </div>
                )}

                <form onSubmit={handleRechargeWallet} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.phoneLabel}</label>
                    <input 
                      type="text" 
                      value={walletPhoneInput}
                      onChange={(e) => setWalletPhoneInput(e.target.value)}
                      placeholder={t.phonePlaceholder}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--panel-muted)',
                        color: 'var(--text-primary)',
                        fontSize: '13px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.amountLabel}</label>
                    <input 
                      type="number" 
                      value={depositAmountInput}
                      onChange={(e) => setDepositAmountInput(parseInt(e.target.value) || 0)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--panel-muted)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {[10000, 25000, 50000, 100000].map(amount => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => setDepositAmountInput(amount)}
                        className="btn"
                        style={{
                          fontSize: '11px',
                          padding: '4px 12px',
                          borderRadius: '8px',
                          border: depositAmountInput === amount ? '1px solid var(--text-primary)' : '1px solid var(--border-color)',
                          backgroundColor: depositAmountInput === amount ? 'var(--text-primary)' : 'transparent',
                          color: depositAmountInput === amount ? 'var(--bg-color)' : 'var(--text-primary)'
                        }}
                      >
                        {amount.toLocaleString()} د.ع
                      </button>
                    ))}
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', fontSize: '13px', borderRadius: '10px', height: '38px', alignSelf: 'flex-start', marginTop: '6px' }}>
                    {t.depositBtn}
                  </button>
                </form>
              </div>

              {/* Transactions list */}
              <div className="dashboard-card" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', textAlign: 'start' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>{t.transactionHistory}</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table className="v-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>Txn ID</th>
                        <th>{t.method}</th>
                        <th>{t.date}</th>
                        <th style={{ textAlign: 'end' }}>{t.amount}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx: any) => (
                        <tr key={tx.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{tx.id}</td>
                          <td>{tx.method || 'Zain Cash'}</td>
                          <td>{new Date(tx.date).toLocaleDateString()}</td>
                          <td style={{ textAlign: 'end', fontWeight: 700, color: 'var(--success-color)', fontFamily: 'var(--font-mono)' }}>
                            +{tx.amount.toLocaleString()} د.ع
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'templates' && (
            <TemplatesView
              lang={lang}
              theme={theme || 'dark'}
              setEmailBody={setEmailBody || (() => {})}
              setEmailSubject={setEmailSubject || (() => {})}
              setMsgBody={setMsgBody || (() => {})}
              setPlaygroundChannel={setPlaygroundChannel || (() => {})}
              setCurrentTab={setCurrentTab}
              setLogs={setLogs || (() => {})}
              walletBalance={walletBalance}
              setWalletBalance={setWalletBalance || (() => {})}
              setPhoneNotifications={setPhoneNotifications || (() => {})}
              domains={domains}
            />
          )}

        </div>

        {/* Right Sidebar (1/3 width) */}
        <div className="dashboard-right-sidebar">
          
          {/* A. User Profile Section */}
          <div className="sidebar-profile-box">
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', color: '#ffffff', fontWeight: 800, fontSize: '15px' }}>
                JK
              </div>
              <div className="sidebar-profile-text">
                <h4>جاسم كريم</h4>
                <span>{t.leadDev}</span>
              </div>
            </div>
            <div className="sidebar-profile-actions">
              <button onClick={() => setCurrentTab('logs')} className="sidebar-icon-btn" title="View Mail logs"><MailOpen size={16} /></button>
              <button className="sidebar-icon-btn" title="Notifications">
                <span style={{ position: 'relative' }}>
                  <Bell size={16} />
                  <span style={{ position: 'absolute', top: '-1px', right: '-1px', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
                </span>
              </button>
            </div>
          </div>

          {/* B. Monthly Calendar Section */}
          <div className="sidebar-calendar-section">
            <div className="sidebar-calendar-header">
              <div style={{ textAlign: 'start' }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800 }}>{calendarMonthData.monthName}</h3>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{calendarMonthData.selectedDateString}</span>
              </div>
              <div className="calendar-arrows">
                <button className="calendar-arrow-btn" onClick={() => setCurrentMonthOffset(prev => prev - 1)}>
                  <ChevronLeft size={13} />
                </button>
                <button className="calendar-arrow-btn" onClick={() => setCurrentMonthOffset(prev => prev + 1)}>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="calendar-grid-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', marginBottom: '6px' }}>
              {weekdays.map((wHeader, idx) => (
                <span key={idx} className="calendar-day-header" style={{ fontSize: '9px', fontWeight: 700 }}>{wHeader}</span>
              ))}
            </div>

            {/* Grid Cells */}
            <div className="calendar-grid-row" style={{ rowGap: '6px' }}>
              {calendarMonthData.grid.map((cell, idx) => {
                const isSelected = cell.isCurrentMonth && cell.num === selectedDayNumber;
                
                let highlightClass = '';
                if (isSelected) {
                  highlightClass = 'active-yellow';
                } else if (cell.isCurrentMonth && (cell.num === 10 || cell.num === 12)) {
                  highlightClass = 'active-green';
                } else if (cell.isCurrentMonth && cell.num === 20) {
                  highlightClass = 'active-outline';
                }

                const hasRedDot = cell.isCurrentMonth && (cell.num === 6 || cell.num === 22 || cell.num === 25);
                const hasGreenDot = cell.isCurrentMonth && cell.num === 29;
                const hasYellowDot = cell.isCurrentMonth && cell.num === 16;

                return (
                  <button 
                    key={idx}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDayNumber(cell.num);
                      }
                    }}
                    className={`calendar-date-cell ${highlightClass}`}
                    style={{
                      border: highlightClass === 'active-outline' ? '2px solid #f43f5e' : 'none',
                      opacity: cell.isCurrentMonth ? 1 : 0.25,
                      cursor: cell.isCurrentMonth ? 'pointer' : 'default',
                      fontWeight: cell.isCurrentMonth ? '700' : '400',
                      pointerEvents: cell.isCurrentMonth ? 'auto' : 'none',
                    }}
                  >
                    {cell.num}
                    
                    {hasRedDot && <span className="calendar-date-dot red" style={{ backgroundColor: '#f43f5e' }} />}
                    {hasGreenDot && <span className="calendar-date-dot green" style={{ backgroundColor: '#10b981' }} />}
                    {hasYellowDot && <span className="calendar-date-dot yellow" style={{ backgroundColor: '#eab308' }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. Hourly Schedule Timeline */}
          {/* --- Timeline Row Renderers to support infinite seamless looping --- */}
          {(() => {
            const renderDay21Rows = () => (
              <>
                <div className="timeline-row-new">
                  <div className="timeline-time-col">08:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-empty-slot" />
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">08:30</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-empty-slot" />
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">09:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node green" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new green">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.otpVerify}</span>
                        <span className="timeline-card-time">09:00 AM - 10:00 AM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <MessageSquare size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">09:30</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-empty-slot" />
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">10:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node yellow" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new yellow">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.dnsSync}</span>
                        <span className="timeline-card-time">10:00 AM - 11:30 AM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <RefreshCw size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">10:30</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-empty-slot" />
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">11:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node red" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new red">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.sandboxUpdate}</span>
                        <span className="timeline-card-time">11:00 AM - 12:30 PM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <Zap size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );

            const renderDay10Rows = () => (
              <>
                <div className="timeline-row-new">
                  <div className="timeline-time-col">09:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node green" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new green">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.zainCashWebhookAudit}</span>
                        <span className="timeline-card-time">09:00 AM - 10:30 AM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <Settings size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">11:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node yellow" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new yellow">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.waTemplateSync}</span>
                        <span className="timeline-card-time">11:00 AM - 12:30 PM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <MessageSquare size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );

            const renderDay20Rows = () => (
              <>
                <div className="timeline-row-new">
                  <div className="timeline-time-col">10:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node red" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new red">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.smtpTuning}</span>
                        <span className="timeline-card-time">10:00 AM - 11:30 AM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <Mail size={13} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="timeline-row-new">
                  <div className="timeline-time-col">11:00</div>
                  <div className="timeline-line-col">
                    <div className="timeline-line-segment" />
                    <div className="timeline-pin-node green" />
                  </div>
                  <div className="timeline-card-col">
                    <div className="timeline-event-card-new green">
                      <div className="timeline-card-info">
                        <span className="timeline-card-title">{t.billingCycleCheck}</span>
                        <span className="timeline-card-time">11:00 AM - 12:30 PM</span>
                      </div>
                      <div className="timeline-card-icon">
                        <Zap size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );

            return (
              <div className="sidebar-timeline-section">
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textAlign: 'start' }}>
                  {t.calendarTitle}
                </h3>
                
                <div className="timeline-schedule-container">
                  {/* Subtle creative top & bottom fog layers */}
                  <div className="timeline-fog-overlay top" />
                  <div className="timeline-fog-overlay bottom" />
                  <div className="timeline-vertical-line" />

                  {selectedDayNumber === 21 ? (
                    <div className="timeline-scroll-wrapper">
                      {renderDay21Rows()}
                      {renderDay21Rows()}
                    </div>
                  ) : (selectedDayNumber === 10 || selectedDayNumber === 12) ? (
                    <div className="timeline-scroll-wrapper">
                      {renderDay10Rows()}
                      {renderDay10Rows()}
                    </div>
                  ) : selectedDayNumber === 20 ? (
                    <div className="timeline-scroll-wrapper">
                      {renderDay20Rows()}
                      {renderDay20Rows()}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '32px 16px', color: 'var(--text-secondary)', fontSize: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={20} style={{ opacity: 0.5 }} />
                        <span>{t.noEvents}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>

      </div>
    </ScrollReveal>
  );
};
