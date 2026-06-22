


import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Copy, 
  Check, 
  Trash2, 
  Eye, 
  EyeOff, 
  Webhook, 
  Code, 
  Terminal, 
  Play, 
  ExternalLink, 
  FileText,
  Layers,
  CheckCircle2,
  Bell,
  Monitor,
  Lock
} from 'lucide-react';
import { ScrollReveal, BentoCard } from './LandingView';
import { renderTemplateIcon } from './IconHelper';

interface DeveloperHubViewProps {
  lang: 'en' | 'ar';
  apiKeys: any[];
  setApiKeys: React.Dispatch<React.SetStateAction<any[]>>;
  webhooks: any[];
  setWebhooks: React.Dispatch<React.SetStateAction<any[]>>;
  logs?: any[];
  setLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  setWalletBalance?: React.Dispatch<React.SetStateAction<number>>;
  walletBalance?: number;
  setPhoneNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  smtpConfig?: {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    from: string;
  };
  setCurrentTab: (tab: string) => void;
  controlledSubTab?: 'quickstart' | 'apikeys' | 'webhooks' | 'code';
}

export const DeveloperHubView: React.FC<DeveloperHubViewProps> = ({ 
  lang, 
  apiKeys, 
  setApiKeys, 
  webhooks, 
  setWebhooks,
  logs = [],
  setLogs,
  setWalletBalance,
  walletBalance,
  setPhoneNotifications,
  smtpConfig = { host: 'smtp.sumersend.com', port: '587', secure: false, user: 'onboarding@sumersend.com', from: 'Sumer Send <onboarding@sumersend.com>' },
  setCurrentTab,
  controlledSubTab
}) => {
  const getSubTabName = (tab?: string) => {
    if (tab === 'apikeys') return 'apikeys';
    if (tab === 'webhooks') return 'webhooks';
    if (tab === 'quickstart') return 'quickstart';
    if (tab === 'code') return 'code';
    return 'quickstart';
  };

  const [activeSubTab, setActiveSubTab] = useState<'quickstart' | 'apikeys' | 'webhooks' | 'code'>(() => getSubTabName(controlledSubTab));

  useEffect(() => {
    if (controlledSubTab) {
      setActiveSubTab(getSubTabName(controlledSubTab));
    }
  }, [controlledSubTab]);
  
  // Security 2FA states
  const [securityConfig, setSecurityConfig] = useState<any>(null);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [verificationOtpInput, setVerificationOtpInput] = useState('');
  const [verificationOtpError, setVerificationOtpError] = useState<string | null>(null);
  const [pendingOtpCode, setPendingOtpCode] = useState<string | null>(null);

  // Load security config
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/security/config')
      .then(res => res.json())
      .then(data => setSecurityConfig(data))
      .catch(err => console.warn('Could not load security config in developer hub:', err));
  }, [apiKeys]);

  // API Keys States
  const [keyName, setKeyName] = useState('');
  const [keyScope, setKeyScope] = useState('full');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<{ [id: string]: boolean }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Webhook States
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>(['email.failed']);
  const [visibleSecrets, setVisibleSecrets] = useState<{ [id: string]: boolean }>({});

  // Webhook Simulator States
  const [simEvent, setSimEvent] = useState('email.failed');
  const [simRecipient, setSimRecipient] = useState('customer@gmail.com');
  const [simMessage, setSimMessage] = useState('Message rejected by recipient mail server (quota exceeded).');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [simulationResult, setSimulationResult] = useState<{ success: boolean; data: any } | null>(null);

  // Local state for fetched SMTP settings
  const [localSmtpConfig, setLocalSmtpConfig] = useState(smtpConfig);

  // Webhook Logs State
  const [webhookLogs, setWebhookLogs] = useState<any[]>([]);

  useEffect(() => {
    if (activeSubTab === 'webhooks') {
      const fetchLogs = () => {
        fetch('http://127.0.0.1:3000/api/webhooks/logs')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              setWebhookLogs(data);
            }
          })
          .catch(err => console.warn('Failed to load webhook logs:', err));
      };
      
      fetchLogs();
      const interval = setInterval(fetchLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [activeSubTab]);


  // Quickstart Test Console States
  const [testChannel, setTestChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [testRecipient, setTestRecipient] = useState('');
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [testSuccess, setTestSuccess] = useState(false);
  const [localTestDispatched, setLocalTestDispatched] = useState(() => {
    return localStorage.getItem('sumer_quickstart_tested') === 'true';
  });

  // Code Builder States
  const [selectedChannel, setSelectedChannel] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [selectedLang, setSelectedLang] = useState<'curl' | 'node' | 'php' | 'python' | 'go' | 'wordpress' | 'laravel'>('curl');
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');

  // Interactive Console States
  const [showConsole, setShowConsole] = useState(false);
  const [consoleRecipient, setConsoleRecipient] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (selectedChannel === 'email') {
      setConsoleRecipient(localStorage.getItem('sumer_admin_test_email') || 'customer@gmail.com');
    } else {
      setConsoleRecipient('07801234567');
    }
  }, [selectedChannel]);

  const executeConsoleRequest = () => {
    if (!consoleRecipient.trim()) {
      alert(lang === 'en' ? 'Please enter a recipient.' : 'يرجى إدخال اسم المستلم.');
      return;
    }
    
    setIsExecuting(true);
    setConsoleLogs([]);
    
    const apiKey = getSelectedApiKeyText();
    const cost = selectedChannel === 'email' ? 10 : selectedChannel === 'sms' ? 120 : 150;
    
    const addLog = (msg: string) => {
      setConsoleLogs(prev => [...prev, `> ${msg}`]);
    };
    
    const endpoint = selectedChannel === 'email' ? 'emails' : selectedChannel;
    const url = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000'}/v1/${endpoint}`;
    
    addLog(`POST ${url}`);
    addLog(`Authorization: Bearer ${apiKey.slice(0, 15)}...`);
    addLog(`Content-Type: application/json`);
    addLog(`Sending request payload...`);
    
    const payload = selectedChannel === 'email' ? {
      from: localSmtpConfig?.from || 'support@mystore.iq',
      to: consoleRecipient,
      subject: 'Sumer Send - Code Builder Test!',
      html: '<h3>Hello!</h3><p>This message was dispatched directly from the interactive Code Builder console.</p>'
    } : {
      to: consoleRecipient,
      body: selectedChannel === 'sms' 
        ? 'Sumer Send SMS: Your OTP verification code is 4829.' 
        : 'Sumer Send WhatsApp: Hi, your order #9283 is successfully confirmed!'
    };
    
    setTimeout(() => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error?.message || data.error || `HTTP ${res.status}`);
          }
          return { data, status: res.status };
        })
        .then(({ data, status }) => {
          addLog(`Status: ${status} OK`);
          addLog(`Body: ${JSON.stringify(data, null, 2)}`);
          
          if (setWalletBalance && walletBalance !== undefined) {
            setWalletBalance(prev => prev - cost);
          }
          
          if (setLogs) {
            fetch('http://127.0.0.1:3000/api/logs')
              .then(r => r.json())
              .then(serverLogs => {
                if (Array.isArray(serverLogs)) setLogs(serverLogs);
              })
              .catch(() => setLogs(prev => [...prev, data]));
          }
          
          if (setPhoneNotifications) {
            const newNoti = {
              id: Date.now().toString(),
              type: selectedChannel,
              title: selectedChannel === 'email' ? 'Code Builder Test!' : selectedChannel === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
              body: selectedChannel === 'email' ? 'This message was dispatched directly from the interactive Code Builder console.' : payload.body,
              rawBody: selectedChannel === 'email' ? payload.html : undefined,
              time: 'Now'
            };
            setPhoneNotifications(prev => [newNoti, ...prev]);
          }
          const successText = selectedChannel === 'email' 
            ? (lang === 'en' ? 'Console test email delivered successfully!' : 'تم إرسال بريد إلكتروني تجريبي بنجاح!')
            : selectedChannel === 'sms'
              ? (lang === 'en' ? 'Console test SMS delivered successfully!' : 'تم إرسال رسالة SMS تجريبية بنجاح!')
              : (lang === 'en' ? 'Console test WhatsApp delivered successfully!' : 'تم إرسال رسالة واتساب تجريبية بنجاح!');
          window.dispatchEvent(new CustomEvent('sumer-toast', {
            detail: { message: successText, type: selectedChannel }
          }));
          window.dispatchEvent(new CustomEvent('sumer-success-screen'));
        })
        .catch((err) => {
          addLog(`Error: ${err.message}`);
          addLog(`Checking local fallback connection...`);
          
          setTimeout(() => {
            if (walletBalance !== undefined && walletBalance < cost) {
              addLog(`Error: Insufficient funds (Wallet balance: ${walletBalance} IQD)`);
              setIsExecuting(false);
              return;
            }
            
            addLog(`[Local Simulation] Status: 200 OK`);
            const mockId = (selectedChannel === 'email' ? 'msg_' : selectedChannel === 'sms' ? 'sms_' : 'wa_') + Math.floor(100000 + Math.random() * 900000).toString();
            const mockResponse = {
              id: mockId,
              type: selectedChannel,
              from: selectedChannel === 'email' ? (localSmtpConfig?.from || 'support@mystore.iq') : 'Sumer Send API',
              to: consoleRecipient,
              subject: selectedChannel === 'email' ? 'Sumer Send - Code Builder Test!' : undefined,
              body: selectedChannel === 'email' ? '<h3>Hello!</h3>' : (payload as any).body,
              status: 'delivered',
              timestamp: new Date().toISOString()
            };
            addLog(`Body: ${JSON.stringify(mockResponse, null, 2)}`);
            
            if (setWalletBalance) setWalletBalance(prev => prev - cost);
            if (setLogs) setLogs(prev => [...prev, mockResponse]);
            if (setPhoneNotifications) {
              const newNoti = {
                id: Date.now().toString(),
                type: selectedChannel,
                title: selectedChannel === 'email' ? 'Code Builder Test!' : selectedChannel === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
                body: selectedChannel === 'email' ? 'This message was dispatched directly from the interactive Code Builder console.' : (payload as any).body,
                rawBody: selectedChannel === 'email' ? payload.html : undefined,
                time: 'Now'
              };
              setPhoneNotifications(prev => [newNoti, ...prev]);
            }
            const simSuccessText = selectedChannel === 'email' 
              ? (lang === 'en' ? 'Simulated console test email delivered successfully!' : 'تم إرسال بريد إلكتروني تجريبي محاكى بنجاح!')
              : selectedChannel === 'sms'
                ? (lang === 'en' ? 'Simulated console test SMS delivered successfully!' : 'تم إرسال رسالة SMS تجريبية محاكاة بنجاح!')
                : (lang === 'en' ? 'Simulated console test WhatsApp delivered successfully!' : 'تم إرسال رسالة واتساب تجريبية محاكاة بنجاح!');
            window.dispatchEvent(new CustomEvent('sumer-toast', {
              detail: { message: simSuccessText, type: selectedChannel }
            }));
            window.dispatchEvent(new CustomEvent('sumer-success-screen'));
          }, 800);
        })
        .finally(() => {
          setIsExecuting(false);
        });
    }, 1000);
  };

  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.host) {
          setLocalSmtpConfig({
            host: data.host,
            port: data.port ? data.port.toString() : '587',
            secure: !!data.secure,
            user: data.user || 'onboarding@sumersend.com',
            from: data.from || 'Sumer Send <onboarding@sumersend.com>'
          });
        }
      })
      .catch(err => console.warn('Could not fetch SMTP config in DeveloperHub:', err));
  }, []);

  // Render-time state synchronization for selectedApiKeyId
  if (apiKeys.length > 0 && !selectedApiKeyId) {
    setSelectedApiKeyId(apiKeys[0].id);
  }

  // Render-time state synchronization for testRecipient when channel changes
  const [prevTestChannel, setPrevTestChannel] = useState(testChannel);
  if (testChannel !== prevTestChannel) {
    setPrevTestChannel(testChannel);
    setTestRecipient(testChannel === 'email' ? 'developer@gmail.com' : '07801234567');
  }

  // Checklist Validation
  const isStep1Done = apiKeys.length > 0;
  const isStep2Done = !!(localSmtpConfig.host && localSmtpConfig.user);
  const isStep3Done = localTestDispatched || logs.some(l => l.id.startsWith('msg') || l.id.startsWith('sms') || l.id.startsWith('wa') || l.id.startsWith('test'));
  const isStep4Done = webhooks.length > 0;

  const completedStepsCount = [isStep1Done, isStep2Done, isStep3Done, isStep4Done].filter(Boolean).length;
  const progressPercent = (completedStepsCount / 4) * 100;

  const translations = {
    en: {
      title: 'Developer Integration Hub',
      subtitle: 'Connect your application to Sumer Send and manage your developer environment.',
      tabQuickstart: 'Quick Start Checklist',
      tabApiKeys: 'API Keys',
      tabWebhooks: 'Webhooks & Flow',
      tabCode: 'SDK & Code Builder',
      
      // Onboarding Tracker
      obProgressTitle: 'Your Onboarding Progress',
      obProgressDesc: 'Complete these steps to fully connect and automate notifications on your website.',
      obStepsDone: 'of 4 steps completed',
      obPending: 'Pending Action',
      obCompleted: 'Completed',
      
      // Quickstart
      qsTitle: 'Setup Wizard & Live Verification',
      qsStep1Title: '1. Create API Keys',
      qsStep1Desc: 'Generate a secure API token with access scopes for your server.',
      qsStep1Btn: 'Generate API Key',
      qsStep1Done: 'Active API Key found:',
      
      qsStep2Title: '2. Setup Dispatcher Bridge',
      qsStep2Desc: 'Configure your SMTP settings to allow email deliveries from your domain.',
      qsStep2Btn: 'Go to SMTP Settings',
      qsStep2Done: 'SMTP Connection ready:',

      qsStep3Title: '3. Execute Live Test Request',
      qsStep3Desc: 'Trigger a mock API request directly from this portal to verify endpoint configuration.',
      qsStep3Btn: 'Open Testing Console',
      qsStep3Done: 'API Dispatch successfully verified!',

      qsStep4Title: '4. Register Webhook Endpoint',
      qsStep4Desc: 'Receive HTTP push notifications on your backend whenever message delivery statuses change.',
      qsStep4Btn: 'Add Webhook Endpoint',
      qsStep4Done: 'Webhook configured:',

      // API Test Console
      tcTitle: 'Live API Testing Console',
      tcChannel: 'Select Channel',
      tcRecipient: 'Recipient',
      tcSendBtn: 'Execute API Request',
      tcLogsLabel: 'Request / Response Raw Logs',
      tcSuccess: 'Test Request Succeeded! Step 3 completed.',

      // API Keys
      apiKeyTitle: 'Manage API Keys',
      apiKeySubtitle: 'Use these tokens to authenticate direct API requests to the dispatch endpoints.',
      addBtn: 'Create API Key',
      inputPlaceholder: 'e.g. Production Mobile App',
      nameCol: 'Key Name',
      keyCol: 'API Key',
      scopeCol: 'Scope',
      createdCol: 'Created At',
      actionsCol: 'Actions',
      scopeFull: 'Full Access',
      scopeSending: 'Sending Only',
      emptyKeys: 'No API keys generated yet. Create one above to start sending.',
      copied: 'Copied!',
      keyLabel: 'Key Name / Label',
      scopeLabel: 'Permissions Scope',
      guideTitle: 'Understanding API Key Security',
      guideText: 'API keys authenticate your server requests. Live keys (sm_live_...) have sending and billing permissions. Keep these keys secure: never expose them in client-side code or public repositories. Store them in backend environment variables.',

      // Webhooks
      webhookTitle: 'Webhook Endpoints',
      webhookSubtitle: 'Sumer Send can send real-time HTTP POST notifications to your server whenever delivery events occur.',
      endpointLabel: 'Payload URL Endpoint',
      endpointPlaceholder: 'https://api.yourwebsite.com/v1/sumer-webhook',
      eventsLabel: 'Trigger Events',
      createWebhookBtn: 'Add Webhook Endpoint',
      emptyWebhooks: 'No webhooks configured yet. Set one up below to listen for live events.',
      whTableUrl: 'Endpoint URL',
      whTableEvents: 'Events',
      whTableSecret: 'Signing Secret',
      whTableActions: 'Actions',
      whTableStatus: 'Status',
      whStatusActive: 'Active',
      whSecLabel: 'Signing Secret',
      
      // Webhook Flow
      wfTitle: 'How Webhooks Work',
      wfStep1: 'Event Triggers',
      wfStep1Desc: 'Email bounced or SMS delivered.',
      wfStep2: 'Cryptographic Signing',
      wfStep2Desc: 'Sumer signs body with secret.',
      wfStep3: 'Your Server Receives',
      wfStep3Desc: 'You verify signature & update database.',
      
      // Webhook Verification Code
      wvcTitle: 'Verifying Webhook Signatures',
      wvcDesc: 'To ensure webhook requests are authentic, calculate the HMAC-SHA256 signature using the raw payload and your signing secret, then compare it with the X-Sumer-Signature header.',
      
      // Simulator
      simTitle: 'Webhook Simulator & Debugger',
      simSubtitle: 'Test your backend webhook receiver locally without waiting for real dispatch events.',
      simEventLabel: 'Choose Event Type',
      simRecipientLabel: 'Recipient Value (Email / Phone)',
      simMessageLabel: 'Event Details / Error Message',
      simBtn: 'Simulate Webhook Delivery',
      simLogsLabel: 'Real-time Webhook Dispatcher Terminal',
      simResultSuccess: 'Webhook accepted successfully by client!',
      simResultFail: 'Failed to deliver webhook. Client returned an error.',
      
      // Code Builder
      cbTitle: 'Dynamic Integration Guide',
      cbSubtitle: 'Select your preferred stack, choose an API Key, and get custom integration code.',
      cbChannelLabel: 'Select Notification Channel',
      cbLangLabel: 'Select Framework / Language',
      cbKeyLabel: 'Select API Key for Interpolation',
      cbKeyNone: 'No API keys available. Generate one to view code.',
      cbCopyBtn: 'Copy Snippet',
      cbDownloadBtn: 'Download Config',
      cbCodeHeader: 'Ready to Run Integration Code',
      cbDocsTitle: 'API Endpoint Specifications',
      cbDocsDesc: 'All requests must be directed to the Sumer Send dispatch engine with appropriate payloads.'
    },
    ar: {
      title: 'بوابة المطورين والربط البرمجي',
      subtitle: 'اربط موقعك أو نظامك ببوابة سومر سيند تلقائياً وقم بإدارة بيئتك البرمجية بالكامل.',
      tabQuickstart: 'دليل البدء السريع التفاعلي',
      tabApiKeys: 'مفاتيح الـ API',
      tabWebhooks: 'الويب هوكس وتوقيع الأحداث',
      tabCode: 'SDK ومنشئ الأكواد',
      
      // Onboarding Tracker
      obProgressTitle: 'مؤشر تقدم تهيئة الاتصال والربط',
      obProgressDesc: 'أكمل هذه الخطوات لربط موقعك وتفعيل الإرسال التلقائي من نظامك البرمي.',
      obStepsDone: 'من أصل 4 خطوات مكتملة',
      obPending: 'مطلوب إجراء',
      obCompleted: 'مكتمل بنجاح',

      // Quickstart
      qsTitle: 'معالج الإعداد التفاعلي وفحص الاتصال حياً',
      qsStep1Title: '1. إنشاء مفاتيح الـ API',
      qsStep1Desc: 'قم بتوليد مفتاح اتصال برمي آمن بصلاحيات محددة لاستخدامه في تطبيقك.',
      qsStep1Btn: 'إنشاء مفتاح API الآن',
      qsStep1Done: 'تم العثور على مفتاح نشط:',

      qsStep2Title: '2. تهيئة جسر إرسال SMTP',
      qsStep2Desc: 'قم بإعداد خادم SMTP الخاص بك ليقوم النظام الخلفي بالإرسال من نطاقك.',
      qsStep2Btn: 'الذهاب لإعدادات SMTP',
      qsStep2Done: 'جسر إرسال SMTP جاهز:',

      qsStep3Title: '3. تجربة طلب فحص حي للـ API',
      qsStep3Desc: 'نفذ طلب إرسال تجريبي مباشرة من هذا المعالج للتحقق من الاتصال وعمل النظام الخلفي.',
      qsStep3Btn: 'افتح وحدة الاختبار الفوري',
      qsStep3Done: 'تم التحقق من نجاح إرسال الـ API بنجاح!',

      qsStep4Title: '4. ربط موقعك بالويب هوك (Webhook)',
      qsStep4Desc: 'استقبل إشعارات POST حية في خادمك فور تسليم الرسائل أو فشلها لمزامنة العمليات.',
      qsStep4Btn: 'إضافة رابط ويب هوك',
      qsStep4Done: 'تم تسجيل الويب هوك بنجاح:',

      // API Test Console
      tcTitle: 'وحدة اختبار وتجربة الـ API فوراً',
      tcChannel: 'اختر قناة الإرسال',
      tcRecipient: 'المستلم (البريد / الهاتف)',
      tcSendBtn: 'توجيه طلب API حقيقي للخلفية',
      tcLogsLabel: 'مخرجات الطلب البرمجي والاستجابة',
      tcSuccess: 'تم الإرسال بنجاح! تم إكمال الخطوة الثالثة.',

      // API Keys
      apiKeyTitle: 'إدارة مفاتيح الـ API',
      apiKeySubtitle: 'استخدم هذه المفاتيح لمصادقة طلبات تطبيقاتك وخودامك مع بوابتنا.',
      addBtn: 'إنشاء مفتاح API جديد',
      inputPlaceholder: 'مثال: تطبيق المتجر الرئيسي',
      nameCol: 'اسم المفتاح',
      keyCol: 'مفتاح الـ API',
      scopeCol: 'الصلاحية',
      createdCol: 'تاريخ الإنشاء',
      actionsCol: 'العمليات',
      scopeFull: 'وصول كامل',
      scopeSending: 'إرسال فقط',
      emptyKeys: 'لم يتم إنشاء مفاتيح API بعد. أنشئ مفتاحك الأول للبدء.',
      copied: 'تم النسخ!',
      keyLabel: 'اسم المفتاح / الوصف',
      scopeLabel: 'صلاحية الاستخدام',
      guideTitle: 'دليل أمان مفاتيح الـ API',
      guideText: 'تُستخدم مفاتيح الـ API لمصادقة طلبات خادمك. احرص على سرية هذه المفاتيح: لا تنشرها في الأكواد الواجهية (Frontend) أو المستودعات العامة، وقم بتخزينها بأمان في متغيرات البيئة لخادمك.',

      // Webhooks
      webhookTitle: 'عناوين الويب هوك (Webhooks)',
      webhookSubtitle: 'يمكن لمنصة سومر سيند إرسال إشعارات HTTP POST حية ومباشرة إلى خادمك فور حدوث أي حدث إرسال أو تسليم.',
      endpointLabel: 'رابط استقبال الإشعارات (Payload URL)',
      endpointPlaceholder: 'https://api.yourwebsite.com/v1/sumer-webhook',
      eventsLabel: 'الأحداث المراد مراقبتها',
      createWebhookBtn: 'إضافة رابط الويب هوك',
      emptyWebhooks: 'لم يتم إعداد روابط ويب هوك بعد. أضف رابطك أدناه لتلقي التنبيهات.',
      whTableUrl: 'رابط الاستقبال',
      whTableEvents: 'الأحداث المفعّلة',
      whTableSecret: 'مفتاح التشفير (Secret)',
      whTableActions: 'العمليات',
      whTableStatus: 'الحالة',
      whStatusActive: 'نشط',
      whSecLabel: 'مفتاح توقيع الأحداث (Signing Secret)',

      // Webhook Flow
      wfTitle: 'كيف تعمل الويب هوكس؟',
      wfStep1: 'حدث إرسال وتوصيل',
      wfStep1Desc: 'فشل بريد أو تسليم OTP للمستلم.',
      wfStep2: 'تشفير الطلب وتوقيعه',
      wfStep2Desc: 'يقوم خادمنا بتشفير الطلب بمفتاحك السري.',
      wfStep3: 'خادمك يستقبل ويتحقق',
      wfStep3Desc: 'تتحقق من التوقيع وتحدث حالة الطلب بقاعدتك.',

      // Webhook Verification Code
      wvcTitle: 'التحقق من توقيع الويب هوك بخادمك',
      wvcDesc: 'لضمان أمان الاتصال وأن الطلب قادم من سومر سيند فعلاً، احسب توقيع HMAC-SHA256 باستخدام المدخلات الخام ومفتاح التوقيع السري الخاص بك، وقارنه بالقيمة المرسلة بالترويسة `X-Sumer-Signature`.',

      // Simulator
      simTitle: 'محاكي ومصحح الويب هوك (Simulator)',
      simSubtitle: 'اختبر كود خادمك البرمجي الذي يستقبل الإشعارات محلياً دون الحاجة لإرسال رسائل حقيقية.',
      simEventLabel: 'نوع الحدث للتجربة',
      simRecipientLabel: 'المستلم (البريد الإلكتروني / رقم الهاتف)',
      simMessageLabel: 'تفاصيل الحدث / رسالة الخطأ',
      simBtn: 'بدء محاكاة إرسال الويب هوك',
      simLogsLabel: 'منصة تتبع إرسال الويب هوك حياً',
      simResultSuccess: 'تم قبول الويب هوك بنجاح من خادمك الخاص!',
      simResultFail: 'فشل تسليم الويب هوك. خادمك أعاد كود خطأ.',

      // Code Builder
      cbTitle: 'منشئ أكواد الربط الذكي',
      cbSubtitle: 'اختر قناة التوصيل، لغة البرمجة المفضلة، ومفتاح الـ API وسنقوم بصياغة كود متكامل جاهز للنسخ والتثبيت.',
      cbChannelLabel: 'اختر قناة الإرسال',
      cbLangLabel: 'اختر لغة البرمجة أو إطار العمل',
      cbKeyLabel: 'اختر مفتاح API لتضمينه في الكود',
      cbKeyNone: 'لا توجد مفاتيح API حالية. قم بإنشاء مفتاح أولاً لعرض الكود.',
      cbCopyBtn: 'نسخ الكود البرمجي',
      cbDownloadBtn: 'تحميل ملف التكوين',
      cbCodeHeader: 'كود الربط والتكامل المباشر',
      cbDocsTitle: 'تفاصيل مسارات الـ API (Endpoints)',
      cbDocsDesc: 'يتم توجيه كافة طلبات الإرسال مباشرة إلى محرك سومر سيند البرمجي على المنفذ 3000.'
    }
  };

  const t = translations[lang];

  // Quickstart API testing simulation
  const handleTestApiCall = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient.trim()) {
      alert(lang === 'en' ? 'Recipient is required.' : 'يرجى إدخال المستلم.');
      return;
    }

    setIsTestingApi(true);
    setTestLogs([]);
    setTestSuccess(false);

    const logsList: string[] = [];
    const addLog = (msg: string) => {
      logsList.push(`$ ${msg}`);
      setTestLogs([...logsList]);
    };

    const activeKey = getSelectedApiKeyText();
    const headers = {
      'Authorization': `Bearer ${activeKey.slice(0, 15)}...`,
      'Content-Type': 'application/json'
    };

    addLog(lang === 'en' ? 'Initializing API Request Client...' : 'بدء تشغيل عميل اختبار طلبات الـ API...');
    
    setTimeout(() => {
      if (testChannel === 'email') {
        addLog(`POST http://127.0.0.1:3000/v1/emails`);
        addLog(`Headers: ${JSON.stringify(headers, null, 2)}`);
        addLog(`Body: ${JSON.stringify({
          from: localSmtpConfig.from || 'support@mystore.iq',
          to: testRecipient,
          subject: 'Sumer Send Quickstart Test!',
          html: '<h3>Test succeeded!</h3>'
        }, null, 2)}`);
      } else {
        const path = testChannel === 'sms' ? 'sms' : 'whatsapp';
        addLog(`POST http://127.0.0.1:3000/v1/${path}`);
        addLog(`Headers: ${JSON.stringify(headers, null, 2)}`);
        addLog(`Body: ${JSON.stringify({
          to: testRecipient,
          body: 'Sumer Send Verification OTP: 928371'
        }, null, 2)}`);
      }
    }, 400);

    setTimeout(() => {
      addLog(lang === 'en' ? 'Sending payload to Baghdad Gateway...' : 'توجيه محتوى الطلب إلى بوابة بغداد الإقليمية...');
    }, 1200);

    setTimeout(() => {
      // Execute the real mock call
      const path = testChannel === 'email' ? 'emails' : testChannel;
      const url = `http://127.0.0.1:3000/v1/${path}`;
      const payload = testChannel === 'email' 
        ? { from: localSmtpConfig.from || 'support@mystore.iq', to: testRecipient, subject: 'Quickstart Test Call', html: '<p>Test</p>' }
        : { to: testRecipient, body: 'Sumer Send quickstart verification test.' };

      fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKeys[0]?.key || 'sm_live_demo'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(res => {
        addLog(`HTTP/1.1 ${res.status} ${res.statusText}`);
        return res.json();
      })
      .then(data => {
        addLog(`Response Payload: ${JSON.stringify(data, null, 2)}`);
        setIsTestingApi(false);
        setTestSuccess(true);
        setLocalTestDispatched(true);
        localStorage.setItem('sumer_quickstart_tested', 'true');
      })
      .catch(err => {
        addLog(`HTTP/1.1 500 Connection Failed`);
        addLog(`Error Message: ${err.message}`);
        setIsTestingApi(false);
        setTestSuccess(false);
      });
    }, 2000);
  };

  const getSelectedApiKeyText = () => {
    if (!selectedApiKeyId) return 'YOUR_API_KEY';
    const keyObj = apiKeys.find(k => k.id === selectedApiKeyId);
    return keyObj ? keyObj.key : 'YOUR_API_KEY';
  };

  const executeCreateKey = (name: string, scope: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const randomHex = Array.from({ length: 32 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const generatedKey = `sm_${scope === 'full' ? 'live' : 'send'}_${randomHex}`;

      const newObj = {
        id: Date.now().toString(),
        name,
        key: generatedKey,
        scope: scope,
        createdAt: new Date().toISOString(),
      };

      setApiKeys([...apiKeys, newObj]);
      setSelectedApiKeyId(newObj.id);
      setKeyName('');
      setKeyScope('full');
      setIsGenerating(false);
    }, 600);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = keyName.trim() || (lang === 'en' ? 'Default API Key' : 'مفتاح API افتراضي');

    if (securityConfig && securityConfig.verified && securityConfig.requireApiKey2FA) {
      try {
        setVerificationOtpError(null);
        setVerificationOtpInput('');
        
        const res = await fetch('http://127.0.0.1:3000/api/security/verify-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: securityConfig.phone })
        });
        const data = await res.json();
        
        if (res.ok && data.otp) {
          setPendingOtpCode(data.otp);
          setIs2faModalOpen(true);
          
          if (setPhoneNotifications) {
            setPhoneNotifications(prev => [
              {
                id: 'security_2fa_api_' + Date.now(),
                type: 'sms',
                title: 'SMS: Sumer Security',
                body: `رمز التحقق لإنشاء مفتاح API الجديد "${name}" هو: ${data.otp}. لا تشارك هذا الرمز.`,
                time: 'Now'
              },
              ...prev
            ]);
          }
        } else {
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setPendingOtpCode(code);
          setIs2faModalOpen(true);
        }
      } catch (err) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingOtpCode(code);
        setIs2faModalOpen(true);
      }
      return;
    }

    executeCreateKey(name, keyScope);
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(k => k.id !== id));
    if (selectedApiKeyId === id) {
      setSelectedApiKeyId('');
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleVisibility = (id: string) => {
    setVisibleKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEventToggle = (event: string) => {
    setWebhookEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event) 
        : [...prev, event]
    );
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || !webhookUrl.startsWith('http')) {
      alert(lang === 'en' ? 'Please enter a valid HTTP/HTTPS URL.' : 'يرجى إدخال رابط HTTP/HTTPS صحيح.');
      return;
    }

    const randomHex = Array.from({ length: 24 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const body = {
      url: webhookUrl.trim(),
      events: [...webhookEvents],
      secret: `whsec_${randomHex}`
    };

    fetch('http://127.0.0.1:3000/api/webhooks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to save webhook');
        return res.json();
      })
      .then(data => {
        setWebhooks([...webhooks, data]);
        setWebhookUrl('');
        setWebhookEvents(['email.failed']);
      })
      .catch(err => {
        alert(lang === 'en' ? `Failed: ${err.message}` : `فشلت العملية: ${err.message}`);
      });
  };

  const handleDeleteWebhook = (id: string) => {
    fetch(`http://127.0.0.1:3000/api/webhooks/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete webhook');
        return res.json();
      })
      .then(() => {
        setWebhooks(prev => prev.filter(w => w.id !== id));
      })
      .catch(err => {
        alert(lang === 'en' ? `Failed: ${err.message}` : `فشلت العملية: ${err.message}`);
      });
  };

  const runWebhookSimulation = () => {
    if (webhooks.length === 0) {
      alert(lang === 'en' ? 'Please configure at least one Webhook endpoint first.' : 'يرجى إعداد رابط ويب هوك واحد على الأقل أولاً.');
      return;
    }

    setIsSimulating(true);
    setSimulationLogs([]);
    setSimulationResult(null);

    const logsList: string[] = [];
    const addLog = (msg: string) => {
      logsList.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
      setSimulationLogs([...logsList]);
    };

    const targetWebhook = webhooks[0];

    setTimeout(() => {
      addLog(lang === 'en' ? `Initializing Webhook test to target: ${targetWebhook.url}` : `بدء تكوين اختبار الويب هوك للرابط: ${targetWebhook.url}`);
    }, 200);

    setTimeout(() => {
      addLog(lang === 'en' ? `Filtering target events... Event matched: ${simEvent}` : `تصفية أحداث التسليم... تطابق الحدث: ${simEvent}`);
    }, 700);

    setTimeout(() => {
      const payload = {
        event: simEvent,
        timestamp: new Date().toISOString(),
        id: `evt_${Math.random().toString(36).substring(2, 12)}`,
        data: {
          recipient: simRecipient,
          channel: simEvent.split('.')[0],
          status: simEvent.split('.')[1] || 'failed',
          details: simMessage,
          attempts: 1
        }
      };

      const mockSignature = `sha256=${Array.from({ length: 64 }, () => Math.floor(Math.random()*16).toString(16)).join('')}`;
      
      addLog(lang === 'en' ? 'Generating cryptographic signature...' : 'توليد توقيع التشفير الإلكتروني للطلب...');
      addLog(`Headers: { X-Sumer-Signature: "${mockSignature}", Content-Type: "application/json" }`);
      addLog(`Payload: ${JSON.stringify(payload, null, 2)}`);

      setTimeout(() => {
        addLog(lang === 'en' ? `Sending POST request...` : `إرسال طلب POST البرمجي...`);
        
        const isSuccess = webhookUrl.startsWith('http://localhost') || Math.random() > 0.1;
        
        setTimeout(() => {
          setIsSimulating(false);
          if (isSuccess) {
            addLog(lang === 'en' ? 'HTTP Response: 200 OK (Webhook Handled)' : 'استجابة الخادم المستلم: 200 OK (تم استقبال الويب هوك بنجاح)');
            setSimulationResult({
              success: true,
              data: { status: 200, message: 'Webhook successfully processed.' }
            });
          } else {
            addLog(lang === 'en' ? 'HTTP Response: 502 Bad Gateway (Failed to connect)' : 'استجابة الخادم المستلم: 502 Bad Gateway (فشل الاتصال بخادمك)');
            setSimulationResult({
              success: false,
              data: { status: 502, error: 'Connection refused / Timeout.' }
            });
          }
        }, 1200);
      }, 1000);
    }, 1400);
  };

  // Webhook Signature verification code snippets
  const getSignatureVerificationSnippet = () => {
    const secret = webhooks[0]?.secret || 'whsec_your_secret_key';
    if (lang === 'en') {
      return `// Node.js Express Webhook Receiver Example
const express = require('express');
const crypto = require('crypto');

const app = express();
const WEBHOOK_SECRET = '${secret}';

app.post('/sumer-webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-sumer-signature'];
  if (!signature) {
    return res.status(401).send('Missing signature');
  }

  // Calculate HMAC-SHA256 signature using raw body and secret
  const calculatedSignature = 'sha256=' + crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  // Securely compare signatures to prevent timing attacks
  const isAuthentic = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );

  if (!isAuthentic) {
    return res.status(403).send('Invalid signature');
  }

  // Parse payload and update database
  const event = JSON.parse(req.body.toString());
  console.log('Event Verified:', event.event, event.data);
  
  res.status(200).send('Webhook Received');
});`;
    } else {
      return `<?php
// PHP Webhook Receiver Verification Example
$webhookSecret = '${secret}';

$signature = $_SERVER['HTTP_X_SUMER_SIGNATURE'] ?? '';
if (empty($signature)) {
    http_response_code(401);
    exit('Missing signature');
}

// Fetch the raw HTTP request body
$rawPayload = file_get_contents('php://input');

// Calculate HMAC-SHA256 signature
$calculatedSignature = 'sha256=' . hash_hmac('sha256', $rawPayload, $webhookSecret);

// Secure comparison
if (!hash_equals($signature, $calculatedSignature)) {
    http_response_code(403);
    exit('Invalid signature');
}

// Signature is valid! Process event
$event = json_decode($rawPayload, true);
file_put_contents('webhooks.log', "Verified Event: " . $event['event'] . PHP_EOL, FILE_APPEND);

http_response_code(200);
echo "Webhook Processed";
?>`;
    }
  };

  // Code Block Templates Generator
  const getGeneratedCode = () => {
    const apiKey = getSelectedApiKeyText();
    const endpointHost = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000';
    
    switch (selectedLang) {
      case 'curl':
        if (selectedChannel === 'email') {
          return `curl -X POST "${endpointHost}/v1/emails" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "from": "${localSmtpConfig?.from || 'support@mystore.iq'}",\n    "to": "customer@gmail.com",\n    "subject": "Order #9283 Dispatch Success",\n    "html": "<h3>Your package is on its way!</h3><p>Sent via Sumer Send API.</p>"\n  }'`;
        } else if (selectedChannel === 'sms') {
          return `curl -X POST "${endpointHost}/v1/sms" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "to": "07801234567",\n    "body": "Your Sumer Send validation code is: 4892"\n  }'`;
        } else {
          return `curl -X POST "${endpointHost}/v1/whatsapp" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "to": "07709876543",\n    "body": "Hi Ahmed, your reservation is confirmed for tonight!"\n  }'`;
        }

      case 'node':
        if (selectedChannel === 'email') {
          return `// Node.js - Send Transactional Email\nconst fetch = require('node-fetch');\n\nconst payload = {\n  from: "${localSmtpConfig?.from || 'support@mystore.iq'}",\n  to: "customer@gmail.com",\n  subject: "Welcome to our platform!",\n  html: "<h2>Welcome!</h2><p>Thanks for subscribing.</p>"\n};\n\nfetch('${endpointHost}/v1/emails', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(payload)\n})\n.then(res => res.json())\n.then(data => console.log('Successfully dispatched:', data))\n.catch(err => console.error('Dispatch failed:', err));`;
        } else if (selectedChannel === 'sms') {
          return `// Node.js - Send local Iraqi SMS OTP\nconst fetch = require('node-fetch');\n\nconst payload = {\n  to: "07801234567",\n  body: "Verification OTP: 9283"\n};\n\nfetch('${endpointHost}/v1/sms', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(payload)\n})\n.then(res => res.json())\n.then(data => console.log('SMS Sent:', data))\n.catch(err => console.error(err));`;
        } else {
          return `// Node.js - Send WhatsApp Client Notification\nconst fetch = require('node-fetch');\n\nconst payload = {\n  to: "07709876543",\n  body: "Hello, order #8271 is ready for pick up at Basra branch."\n};\n\nfetch('${endpointHost}/v1/whatsapp', {\n  method: 'POST',\n  headers: {\n    'Authorization': 'Bearer ${apiKey}',\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(payload)\n})\n.then(res => res.json())\n.then(data => console.log('WhatsApp message sent:', data))\n.catch(err => console.error(err));`;
        }

      case 'php':
        if (selectedChannel === 'email') {
          return `<?php\n// PHP - Dispatch Email transactional\n$ch = curl_init('${endpointHost}/v1/emails');\n\n$payload = [\n    "from" => "${localSmtpConfig?.from || 'support@mystore.iq'}",\n    "to" => "customer@gmail.com",\n    "subject" => "Invoice for purchase",\n    "html" => "<h3>Thank you!</h3><p>Your payment has cleared.</p>"\n];\n\ncurl_setopt_array($ch, [\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_POST => true,\n    CURLOPT_HTTPHEADER => [\n        'Authorization: Bearer ${apiKey}',\n        'Content-Type: application/json'\n    ],\n    CURLOPT_POSTFIELDS => json_encode($payload)\n]);\n\n$response = curl_exec($ch);\ncurl_close($ch);\nprint_r(json_decode($response, true));\n?>`;
        } else {
          const type = selectedChannel === 'sms' ? 'sms' : 'whatsapp';
          const toNum = selectedChannel === 'sms' ? '07801234567' : '07709876543';
          const bodyTxt = selectedChannel === 'sms' ? 'OTP: 1928' : 'Hi Ahmed, your food order is prepared!';
          return `<?php\n// PHP - Send ${type.toUpperCase()} alert\n$ch = curl_init('${endpointHost}/v1/${type}');\n\n$payload = [\n    "to" => "${toNum}",\n    "body" => "${bodyTxt}"\n];\n\ncurl_setopt_array($ch, [\n    CURLOPT_RETURNTRANSFER => true,\n    CURLOPT_POST => true,\n    CURLOPT_HTTPHEADER => [\n        'Authorization: Bearer ${apiKey}',\n        'Content-Type: application/json'\n    ],\n    CURLOPT_POSTFIELDS => json_encode($payload)\n]);\n\n$response = curl_exec($ch);\ncurl_close($ch);\necho $response;\n?>`;
        }

      case 'python': {
        const ch = selectedChannel === 'email' ? 'emails' : selectedChannel;
        const bodyContent = selectedChannel === 'email' 
          ? `{\n    "from": "${localSmtpConfig?.from || 'support@mystore.iq'}",\n    "to": "customer@gmail.com",\n    "subject": "Greetings!",\n    "html": "<h3>Hello from Python!</h3>"\n  }`
          : `{\n    "to": "07801234567",\n    "body": "Alert from Sumer Python SDK"\n  }`;
        return `import requests\n\nurl = "${endpointHost}/v1/${ch}"\nheaders = {\n    "Authorization": "Bearer ${apiKey}",\n    "Content-Type": "application/json"\n}\npayload = ${bodyContent}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.status_code)\nprint(response.json())`;
      }

      case 'go': {
        const endpoint = selectedChannel === 'email' ? 'emails' : selectedChannel;
        const jsonPayload = selectedChannel === 'email'
          ? `\`{"from":"${localSmtpConfig?.from || 'support@mystore.iq'}", "to":"customer@gmail.com", "subject":"Go API Test", "html":"<b>Go!</b>"}\``
          : `\`{"to":"07801234567", "body":"Message from Go compiler!"}\``;
        return `package main\n\nimport (\n\t"bytes"\n\t"fmt"\n\t"net/http"\n\t"io/ioutil"\n)\n\nfunc main() {\n\turl := "${endpointHost}/v1/${endpoint}"\n\tpayload := []byte(${jsonPayload})\n\n\treq, _ := http.NewRequest("POST", url, bytes.NewBuffer(payload))\n\treq.Header.Set("Authorization", "Bearer ${apiKey}")\n\treq.Header.Set("Content-Type", "application/json")\n\n\tclient := &http.Client{}\n\tresp, err := client.Do(req)\n\tif err != nil {\n\t\tpanic(err)\n\t}\n\tdefer resp.Body.Close()\n\n\tbody, _ := ioutil.ReadAll(resp.Body)\n\tfmt.Println("Response Status:", resp.Status)\n\tfmt.Println("Body:", string(body))\n}`;
      }

      case 'wordpress':
        return `WordPress SMTP Configuration (WP Mail SMTP Setup):\n------------------------------------------------------\nInstall any WordPress SMTP plugin and enter the following settings manually:\n\nSMTP Host:        ${localSmtpConfig?.host || 'mail.sumersend.com'}\nSMTP Port:        ${localSmtpConfig?.port || '587'}\nEncryption:       ${localSmtpConfig?.secure ? 'SSL/TLS (Port 465)' : 'STARTTLS (Port 587)'}\nSMTP Auth:        ON (Yes)\nSMTP Username:    ${localSmtpConfig?.user || 'your-user-smtp@sumersend.com'}\nSMTP Password:    [SMTP password configured in settings]\n\nNote: All WooCommerce and WordPress transactional notifications will automatically route via Sumer Send.`;

      case 'laravel':
        return `# Laravel .env Mail Configuration\n# Put these parameters inside your local .env file:\n\nMAIL_MAILER=smtp\nMAIL_HOST=${localSmtpConfig?.host || 'mail.sumersend.com'}\nMAIL_PORT=${localSmtpConfig?.port || '587'}\nMAIL_USERNAME="${localSmtpConfig?.user || 'your-smtp-username'}"\nMAIL_PASSWORD="YOUR_SMTP_PASSWORD"  # Input password set in SMTP Config\nMAIL_ENCRYPTION=${localSmtpConfig?.secure ? 'ssl' : 'tls'}\nMAIL_FROM_ADDRESS="${localSmtpConfig?.from || 'sender@yourdomain.iq'}"\nMAIL_FROM_NAME="\${APP_NAME}"\n\n# To send custom SMS/WhatsApp notifications via Sumer Send API, add the following token key:\nSUMERSEND_API_KEY="${apiKey}"`;

      default:
        return '';
    }
  };

  const handleDownloadCode = () => {
    const code = getGeneratedCode();
    const ext = selectedLang === 'node' ? 'js' : selectedLang === 'python' ? 'py' : selectedLang === 'go' ? 'go' : selectedLang === 'php' ? 'php' : 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sumersend_integration.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const frameworks = [
    { id: 'curl', name: 'cURL', icon: 'Terminal' },
    { id: 'node', name: 'Node.js', icon: 'Code' },
    { id: 'php', name: 'PHP', icon: 'Code' },
    { id: 'python', name: 'Python', icon: 'Code' },
    { id: 'go', name: 'Go', icon: 'Code' },
    { id: 'wordpress', name: 'WordPress', icon: 'Globe' },
    { id: 'laravel', name: 'Laravel', icon: 'Code' }
  ];

  return (
    <ScrollReveal>
      {!controlledSubTab && (
        <>
          <div style={{ marginBottom: '20px' }} className="flex-between">
            <div>
              <h1 style={{ 
                fontSize: '32px', 
                fontWeight: 800, 
                letterSpacing: lang === 'ar' ? '0' : '-1.5px', 
                lineHeight: 1.15,
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>{t.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>{t.subtitle}</p>
            </div>
          </div>

          {/* Sub tabs navigation */}
          <div className="vercel-tabs-container" style={{ overflowX: 'auto', marginBottom: '16px' }}>
            <button 
              onClick={() => setActiveSubTab('quickstart')}
              className={`vercel-tab-btn ${activeSubTab === 'quickstart' ? 'active' : ''}`}
            >
              <span>{t.tabQuickstart}</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('apikeys')}
              className={`vercel-tab-btn ${activeSubTab === 'apikeys' ? 'active' : ''}`}
            >
              <span>{t.tabApiKeys}</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('webhooks')}
              className={`vercel-tab-btn ${activeSubTab === 'webhooks' ? 'active' : ''}`}
            >
              <span>{t.tabWebhooks}</span>
            </button>
            <button 
              onClick={() => setActiveSubTab('code')}
              className={`vercel-tab-btn ${activeSubTab === 'code' ? 'active' : ''}`}
            >
              <span>{t.tabCode}</span>
            </button>
          </div>
        </>
      )}

      {/* QUICKSTART / SETUP CHECKLIST SUB-TAB */}
      {activeSubTab === 'quickstart' && (
        <div>
          {/* Onboarding Progress Dashboard */}
          <BentoCard className="card" style={{ padding: '20px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '120px', height: '120px', background: 'var(--accent-color)', opacity: 0.05, borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '-10px', left: '-10px', width: '100px', height: '100px', background: '#0070f3', opacity: 0.03, borderRadius: '50%', filter: 'blur(35px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>{t.obProgressTitle}</h2>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{t.obProgressDesc}</p>
                </div>
                <div style={{ textAlign: lang === 'en' ? 'right' : 'left' }}>
                  <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-color)' }}>{progressPercent}%</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>{completedStepsCount} {t.obStepsDone}</span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-color)', borderRadius: '10px', marginTop: '18px', overflow: 'hidden' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-color) 0%, #0070f3 100%)', transition: 'width 0.4s ease-in-out', borderRadius: '10px' }}></div>
              </div>
            </div>
          </BentoCard>

          <div className="devhub-layout">
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Step 1: Create API Keys */}
              <div className="card card-checklist" style={{ padding: '20px', border: isStep1Done ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isStep1Done ? 'var(--success-bg)' : 'var(--warning-bg)', color: isStep1Done ? 'var(--success-text)' : 'var(--warning-text)', flexShrink: 0, fontWeight: 700, fontSize: '13px' }}>
                      {isStep1Done ? '✓' : '1'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{t.qsStep1Title}</span>
                        <span className={`badge badge-${isStep1Done ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {isStep1Done ? t.obCompleted : t.obPending}
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {isStep1Done ? `${t.qsStep1Done} "${apiKeys[0]?.name}"` : t.qsStep1Desc}
                      </p>
                    </div>
                  </div>

                  {!isStep1Done ? (
                    <button className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setActiveSubTab('apikeys')}>
                      {t.qsStep1Btn}
                    </button>
                  ) : (
                    <code style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                      {apiKeys[0]?.key.slice(0, 15)}...
                    </code>
                  )}
                </div>
              </div>

              {/* Step 2: Setup Dispatcher Bridge */}
              <div className="card card-checklist" style={{ padding: '20px', border: isStep2Done ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isStep2Done ? 'var(--success-bg)' : 'var(--warning-bg)', color: isStep2Done ? 'var(--success-text)' : 'var(--warning-text)', flexShrink: 0, fontWeight: 700, fontSize: '13px' }}>
                      {isStep2Done ? '✓' : '2'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{t.qsStep2Title}</span>
                        <span className={`badge badge-${isStep2Done ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {isStep2Done ? t.obCompleted : t.obPending}
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {isStep2Done ? `${t.qsStep2Done} ${localSmtpConfig.host}:${localSmtpConfig.port}` : t.qsStep2Desc}
                      </p>
                    </div>
                  </div>

                  <button className="btn" style={{ fontSize: '11px', padding: '6px 12px', background: isStep2Done ? 'none' : '', border: isStep2Done ? '1px solid var(--border-color)' : '' }} onClick={() => setCurrentTab('settings')}>
                    {t.qsStep2Btn}
                  </button>
                </div>
              </div>

              {/* Step 3: Execute Live Test Request */}
              <div className="card card-checklist" style={{ padding: '20px', border: isStep3Done ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isStep3Done ? 'var(--success-bg)' : 'var(--warning-bg)', color: isStep3Done ? 'var(--success-text)' : 'var(--warning-text)', flexShrink: 0, fontWeight: 700, fontSize: '13px' }}>
                      {isStep3Done ? '✓' : '3'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{t.qsStep3Title}</span>
                        <span className={`badge badge-${isStep3Done ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {isStep3Done ? t.obCompleted : t.obPending}
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {t.qsStep3Desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inline API test console expander */}
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <form onSubmit={handleTestApiCall} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Terminal size={14} color="var(--accent-color)" />
                      <span>{t.tcTitle}</span>
                    </h4>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '160px' }}>
                        <label className="form-label" style={{ fontSize: '10px', marginBottom: '2px' }}>{t.tcChannel}</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {(['email', 'sms', 'whatsapp'] as const).map(ch => (
                            <button
                              key={ch}
                              type="button"
                              onClick={() => setTestChannel(ch)}
                              className={`btn ${testChannel === ch ? 'btn-primary' : ''}`}
                              style={{ flex: 1, fontSize: '10px', padding: '4px 6px', background: testChannel === ch ? '' : 'none', border: '1px solid var(--border-color)' }}
                            >
                              {ch.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ flex: 1.5, minWidth: '200px' }}>
                        <label className="form-label" style={{ fontSize: '10px', marginBottom: '2px' }}>{t.tcRecipient}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={testRecipient}
                          onChange={(e) => setTestRecipient(e.target.value)}
                          placeholder={testChannel === 'email' ? 'e.g. name@domain.com' : 'e.g. 07801234567'}
                          style={{ height: '32px', fontSize: '11px' }}
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={isTestingApi}
                      style={{ height: '34px', fontSize: '11px', gap: '6px', opacity: isTestingApi ? 0.7 : 1 }}
                    >
                      {isTestingApi ? (
                        <>
                          <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                          <span>{lang === 'en' ? 'Executing API call...' : 'جاري فحص الـ API...'}</span>
                        </>
                      ) : (
                        <>
                          <Play size={10} />
                          <span>{t.tcSendBtn}</span>
                        </>
                      )}
                    </button>

                    {testLogs.length > 0 && (
                      <div style={{ marginTop: '8px' }}>
                        <label className="form-label" style={{ fontSize: '10px', marginBottom: '4px' }}>{t.tcLogsLabel}</label>
                        <div style={{ backgroundColor: '#09090b', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', maxHeight: '150px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '10px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '4px', direction: 'ltr', textAlign: 'left' }}>
                          {testLogs.map((log, index) => (
                            <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{log}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {testSuccess && (
                      <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: 'var(--success-bg)', border: '1px solid var(--success-text)', color: 'var(--success-text)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <CheckCircle2 size={12} />
                        <span>{t.tcSuccess}</span>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Step 4: Register Webhook Endpoint */}
              <div className="card card-checklist" style={{ padding: '20px', border: isStep4Done ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--border-color)' }}>
                <div className="flex-between">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: isStep4Done ? 'var(--success-bg)' : 'var(--warning-bg)', color: isStep4Done ? 'var(--success-text)' : 'var(--warning-text)', flexShrink: 0, fontWeight: 700, fontSize: '13px' }}>
                      {isStep4Done ? '✓' : '4'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{t.qsStep4Title}</span>
                        <span className={`badge badge-${isStep4Done ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '1px 6px' }}>
                          {isStep4Done ? t.obCompleted : t.obPending}
                        </span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {isStep4Done ? `${t.qsStep4Done} "${webhooks[0]?.url.slice(0, 30)}..."` : t.qsStep4Desc}
                      </p>
                    </div>
                  </div>

                  <button className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 12px', background: isStep4Done ? 'none' : '', border: isStep4Done ? '1px solid var(--border-color)' : '', color: isStep4Done ? 'var(--text-primary)' : '' }} onClick={() => setActiveSubTab('webhooks')}>
                    {t.qsStep4Btn}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick documentation info sidebar */}
            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} color="var(--accent-color)" />
                  <span>{lang === 'en' ? 'API Documentation' : 'المواصفات الفنية للـ API'}</span>
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px' }}>
                  {lang === 'en' 
                    ? 'Access the comprehensive HTTP API details. Learn about auth schemas, request headers, error models, and standard JSON response shapes.' 
                    : 'تصفح مواصفات المسارات البرمجية المباشرة. تفاصيل الهيدرز، نظام التحقق بالأمان، بنية الطلبات ومعاني أكواد الاستجابة والفشل.'}
                </p>
                <button onClick={() => setActiveSubTab('code')} className="btn" style={{ fontSize: '11px', width: '100%', gap: '6px', justifyContent: 'center' }}>
                  <span>{lang === 'en' ? 'Explore API Endpoints' : 'استكشاف مسارات الـ API'}</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              <BentoCard className="card" style={{ padding: '20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '80px', height: '80px', background: 'var(--success-text)', opacity: 0.05, borderRadius: '50%', filter: 'blur(25px)', pointerEvents: 'none' }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    {lang === 'en' ? 'Active Local Bridges' : 'حالة قنوات الاتصال المحلية'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11px' }}>
                    <div className="flex-between" style={{ paddingBottom: '6px', borderBottom: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Email (SMTP Bridge)' : 'البريد الإلكتروني (SMTP)'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{lang === 'en' ? 'CONNECTED' : 'متصل'}</span>
                    </div>
                    <div className="flex-between" style={{ paddingBottom: '6px', borderBottom: '1px dashed var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'SMS (Zain/Asiacell)' : 'رسائل الهاتف (زين/آسيا سيل)'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{lang === 'en' ? 'ACTIVE' : 'فعال'}</span>
                    </div>
                    <div className="flex-between">
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'WhatsApp (Meta Cloud API)' : 'الواتساب (بوابة سحابية)'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--success-text)' }}>{lang === 'en' ? 'ACTIVE' : 'فعال'}</span>
                    </div>
                  </div>
                </div>
              </BentoCard>
            </div>
          </div>
        </div>
      )}

      {/* API KEYS SUB-TAB */}
      {activeSubTab === 'apikeys' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.apiKeySubtitle}</p>
          </div>

          <BentoCard className="card" style={{ marginBottom: '20px', padding: '20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'var(--accent-color)', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{t.guideTitle}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{t.guideText}</p>
            </div>
          </BentoCard>

          {/* Create API Key Form */}
          <div className="card" style={{ marginBottom: '20px', padding: '24px' }}>
            <form onSubmit={handleCreateKey} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '220px' }}>
                <label className="form-label">{t.keyLabel}</label>
                <input
                  type="text"
                  className="form-input"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  style={{ height: '42px' }}
                />
              </div>
              
              <div style={{ flex: 1, minWidth: '150px' }}>
                <label className="form-label">{t.scopeLabel}</label>
                <select
                  className="form-input"
                  value={keyScope}
                  onChange={(e) => setKeyScope(e.target.value)}
                  style={{ height: '42px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', backgroundSize: '16px' }}
                >
                  <option value="full">{t.scopeFull}</option>
                  <option value="send">{t.scopeSending}</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isGenerating}
                style={{ height: '42px', minWidth: '150px', opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? 'not-allowed' : 'pointer' }}
              >
                {isGenerating ? (
                  <>
                    <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '4px', marginLeft: '4px' }}></span>
                    <span>{lang === 'en' ? 'Generating...' : 'جاري الإنشاء...'}</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>{t.addBtn}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* API Keys Table */}
          <div className="table-container">
            {apiKeys.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                <Key size={32} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
                <p>{t.emptyKeys}</p>
              </div>
            ) : (
              <table className="v-table">
                <thead>
                  <tr>
                    <th>{t.nameCol}</th>
                    <th style={{ width: '45%' }}>{t.keyCol}</th>
                    <th>{t.scopeCol}</th>
                    <th>{t.createdCol}</th>
                    <th>{t.actionsCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((item) => {
                    const isVisible = visibleKeys[item.id];
                    const displayKey = isVisible 
                      ? item.key 
                      : `${item.key.slice(0, 12)}••••••••••••••••••••••••••••••••`;

                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.name}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <code style={{ fontFamily: 'monospace', fontSize: '13px', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                              {displayKey}
                            </code>
                            <button 
                              className="btn" 
                              style={{ padding: '4px 8px', border: 'none', background: 'none' }}
                              onClick={() => toggleVisibility(item.id)}
                            >
                              {isVisible ? <EyeOff size={14} color="var(--text-secondary)" /> : <Eye size={14} color="var(--text-secondary)" />}
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${item.scope === 'full' ? 'success' : 'warning'}`}>
                            {item.scope === 'full' ? t.scopeFull : t.scopeSending}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn"
                              style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                              onClick={() => handleCopy(item.id, item.key)}
                            >
                              {copiedId === item.id ? <Check size={12} color="#50e3c2" /> : <Copy size={12} />}
                              <span>{copiedId === item.id ? t.copied : (lang === 'en' ? 'Copy' : 'نسخ')}</span>
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{ padding: '6px 10px' }}
                              onClick={() => handleDeleteKey(item.id)}
                              title="Delete API Key"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* WEBHOOKS & SECURITY FLOW SUB-TAB */}
      {activeSubTab === 'webhooks' && (
        <div>
          {/* Visual Webhook flow diagram */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-color)" />
              <span>{t.wfTitle}</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '150px', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-color)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Bell size={22} /></div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.wfStep1}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{t.wfStep1Desc}</p>
              </div>

              <div className="webhook-flow-arrow">➔</div>

              <div style={{ flex: 1, minWidth: '150px', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center', position: 'relative' }}>
                <div style={{ color: 'var(--accent-color)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Key size={22} /></div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.wfStep2}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{t.wfStep2Desc}</p>
              </div>

              <div className="webhook-flow-arrow">➔</div>

              <div style={{ flex: 1, minWidth: '150px', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: '6px', textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-color)', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Monitor size={22} /></div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{t.wfStep3}</h4>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{t.wfStep3Desc}</p>
              </div>
            </div>
          </div>

          <div className="devhub-layout">
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Webhook Configuration form */}
              <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
                <form onSubmit={handleCreateWebhook}>
                  <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">{t.endpointLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      placeholder={t.endpointPlaceholder}
                      style={{ height: '42px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label className="form-label">{t.eventsLabel}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes('email.delivered')}
                          onChange={() => handleEventToggle('email.delivered')}
                        />
                        <span>{lang === 'en' ? 'Email Delivered' : 'تم توصيل البريد (email.delivered)'}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes('email.failed')}
                          onChange={() => handleEventToggle('email.failed')}
                        />
                        <span>{lang === 'en' ? 'Email Delivery Failed' : 'فشل البريد (email.failed)'}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes('sms.delivered')}
                          onChange={() => handleEventToggle('sms.delivered')}
                        />
                        <span>{lang === 'en' ? 'SMS Delivered' : 'تم توصيل SMS (sms.delivered)'}</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={webhookEvents.includes('whatsapp.delivered')}
                          onChange={() => handleEventToggle('whatsapp.delivered')}
                        />
                        <span>{lang === 'en' ? 'WhatsApp Read' : 'تم قراءة الواتساب (whatsapp.read)'}</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ height: '42px', width: '100%', gap: '6px' }}>
                    <Webhook size={16} />
                    <span>{t.createWebhookBtn}</span>
                  </button>
                </form>
              </div>

              {/* Configured Webhooks List */}
              <div className="table-container" style={{ marginBottom: '24px' }}>
                {webhooks.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    <Webhook size={32} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
                    <p>{t.emptyWebhooks}</p>
                  </div>
                ) : (
                  <table className="v-table">
                    <thead>
                      <tr>
                        <th>{t.whTableUrl}</th>
                        <th>{t.whTableEvents}</th>
                        <th>{t.whTableSecret}</th>
                        <th>{t.whTableStatus}</th>
                        <th>{t.whTableActions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {webhooks.map((item) => {
                        const isSecretVisible = visibleSecrets[item.id];
                        const displaySecret = isSecretVisible 
                          ? item.secret 
                          : `${item.secret.slice(0, 10)}••••••••••••••••`;

                        return (
                          <tr key={item.id}>
                            <td style={{ fontWeight: 600, fontSize: '13px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.url}>
                              {item.url}
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {item.events.map((ev: string) => (
                                  <span key={ev} style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                                    {ev}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <code style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                  {displaySecret}
                                </code>
                                <button 
                                  className="btn" 
                                  style={{ padding: '2px 4px', border: 'none', background: 'none' }}
                                  onClick={() => toggleSecretVisibility(item.id)}
                                >
                                  {isSecretVisible ? <EyeOff size={12} color="var(--text-secondary)" /> : <Eye size={12} color="var(--text-secondary)" />}
                                </button>
                                <button 
                                  className="btn" 
                                  style={{ padding: '2px 4px', border: 'none', background: 'none' }}
                                  onClick={() => handleCopy(item.id + '_sec', item.secret)}
                                  title="Copy Secret Key"
                                >
                                  {copiedId === item.id + '_sec' ? <Check size={12} color="#50e3c2" /> : <Copy size={12} color="var(--text-secondary)" />}
                                </button>
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {t.whStatusActive}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-danger"
                                style={{ padding: '6px 8px' }}
                                onClick={() => handleDeleteWebhook(item.id)}
                                title="Delete Webhook"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Webhook HMAC calculations signature guides */}
              {webhooks.length > 0 && (
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Key size={16} color="var(--accent-color)" />
                    <span>{t.wvcTitle}</span>
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '16px' }}>{t.wvcDesc}</p>

                  <div className="flex-between" style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => setSelectedLang(selectedLang === 'php' ? 'node' : 'php')} 
                        className="btn" 
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                      >
                        {selectedLang === 'php' ? 'Switch to Node.js' : 'تحويل للغة PHP'}
                      </button>
                    </div>
                    <button 
                      onClick={() => handleCopy('webhook_verify', getSignatureVerificationSnippet())}
                      className="btn"
                      style={{ padding: '4px 10px', fontSize: '11px', gap: '4px' }}
                    >
                      {copiedId === 'webhook_verify' ? <Check size={10} color="#50e3c2" /> : <Copy size={10} />}
                      <span>{copiedId === 'webhook_verify' ? t.copied : t.cbCopyBtn}</span>
                    </button>
                  </div>

                  <div style={{ backgroundColor: '#09090b', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)', overflowX: 'auto', direction: 'ltr', textAlign: 'left' }}>
                    <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#eaeaea', lineHeight: 1.4 }}>
                      <code>{getSignatureVerificationSnippet()}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* WEBHOOK SIMULATOR / DEBUGGER TOOL */}
            <div className="card" style={{ flex: 0.8, padding: '24px', position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Play size={16} color="var(--accent-color)" />
                <span>{t.simTitle}</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '20px' }}>{t.simSubtitle}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>{t.simEventLabel}</label>
                  <select 
                    className="form-input" 
                    value={simEvent}
                    onChange={(e) => {
                      setSimEvent(e.target.value);
                      if (e.target.value.startsWith('email')) {
                        setSimRecipient('customer@gmail.com');
                        setSimMessage(e.target.value.endsWith('failed') ? 'Message rejected: quota exceeded.' : 'Delivered successfully.');
                      } else {
                        setSimRecipient('07801234567');
                        setSimMessage('OTP successfully delivered to device.');
                      }
                    }}
                    style={{ height: '36px', fontSize: '12px' }}
                  >
                    <option value="email.delivered">email.delivered</option>
                    <option value="email.failed">email.failed</option>
                    <option value="sms.delivered">sms.delivered</option>
                    <option value="whatsapp.delivered">whatsapp.delivered</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>{t.simRecipientLabel}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={simRecipient}
                    onChange={(e) => setSimRecipient(e.target.value)}
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '11px', marginBottom: '4px' }}>{t.simMessageLabel}</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={simMessage}
                    onChange={(e) => setSimMessage(e.target.value)}
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                </div>

                <button 
                  onClick={runWebhookSimulation} 
                  disabled={isSimulating || webhooks.length === 0}
                  className="btn btn-primary" 
                  style={{ height: '38px', width: '100%', fontSize: '12px', gap: '6px', opacity: (isSimulating || webhooks.length === 0) ? 0.6 : 1 }}
                >
                  {isSimulating ? (
                    <>
                      <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      <span>{lang === 'en' ? 'Simulating...' : 'جاري المحاكاة...'}</span>
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      <span>{t.simBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {(simulationLogs.length > 0 || isSimulating) && (
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.simLogsLabel}</h4>
                  <div style={{ backgroundColor: '#09090b', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', height: '180px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '11px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {simulationLogs.map((log, index) => (
                      <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{log}</div>
                    ))}
                    {isSimulating && (
                      <div style={{ animation: 'pulse 1s infinite', color: 'var(--text-muted)' }}>_</div>
                    )}
                  </div>

                  {simulationResult && (
                    <div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: simulationResult.success ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${simulationResult.success ? 'var(--success-text)' : 'var(--danger-text)'}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: simulationResult.success ? 'var(--success-text)' : 'var(--danger-text)' }}></span>
                      <strong style={{ color: simulationResult.success ? 'var(--success-text)' : 'var(--danger-text)' }}>
                        {simulationResult.success ? t.simResultSuccess : t.simResultFail}
                      </strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Webhook Delivery Logs Table */}
          <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Webhook size={16} color="var(--accent-color)" />
              <span>{lang === 'en' ? 'Live Webhook Logs & Delivery Traces' : 'سجل استدعاء الويب هوك المباشر'}</span>
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '20px' }}>
              {lang === 'en' ? 'Inspect the HTTP response status, payload delivery latency, and target headers of your local webhook dispatches.' : 'راقب حالات استجابة خوادم الاستقبال، زمن التأخير، ورؤوس الطلبات الخاصة باتصالات الويب هوك الخاصة بك.'}
            </p>

            <div className="table-container">
              {webhookLogs.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  {lang === 'en' ? 'No webhook dispatches logged yet. Send a message to trigger webhooks!' : 'لا توجد طلبات ويب هوك مسجلة بعد. أرسل رسالة لتحفيز الاتصال.'}
                </div>
              ) : (
                <table className="v-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>{lang === 'en' ? 'Event' : 'الحدث'}</th>
                      <th>{lang === 'en' ? 'Target URL' : 'رابط الاستقبال'}</th>
                      <th>{lang === 'en' ? 'Status' : 'الحالة'}</th>
                      <th>{lang === 'en' ? 'Response Code' : 'رمز الاستجابة'}</th>
                      <th>{lang === 'en' ? 'Latency' : 'التأخير'}</th>
                      <th>{lang === 'en' ? 'Timestamp' : 'الوقت'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookLogs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.event}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.url}>{log.url}</td>
                        <td>
                          <span className={`badge badge-${log.status === 'success' ? 'success' : 'warning'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>
                          {log.statusCode || (lang === 'en' ? 'Network Error' : 'خطأ اتصال')}
                        </td>
                        <td>{log.latency}ms</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          {new Date(log.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SDK & CODE BUILDER SUB-TAB */}
      {activeSubTab === 'code' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.cbSubtitle}</p>
          </div>

          <div className="codebuilder-layout">
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">{t.cbChannelLabel}</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button 
                    onClick={() => setSelectedChannel('email')}
                    className={`btn ${selectedChannel === 'email' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, fontSize: '12px', background: selectedChannel === 'email' ? '' : 'none', border: '1px solid var(--border-color)' }}
                  >
                    {lang === 'en' ? 'Email API' : 'البريد الإلكتروني'}
                  </button>
                  <button 
                    onClick={() => setSelectedChannel('sms')}
                    className={`btn ${selectedChannel === 'sms' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, fontSize: '12px', background: selectedChannel === 'sms' ? '' : 'none', border: '1px solid var(--border-color)' }}
                  >
                    {lang === 'en' ? 'SMS API' : 'الرسائل القصيرة'}
                  </button>
                  <button 
                    onClick={() => setSelectedChannel('whatsapp')}
                    className={`btn ${selectedChannel === 'whatsapp' ? 'btn-primary' : ''}`}
                    style={{ flex: 1, fontSize: '12px', background: selectedChannel === 'whatsapp' ? '' : 'none', border: '1px solid var(--border-color)' }}
                  >
                    {lang === 'en' ? 'WhatsApp API' : 'الواتساب'}
                  </button>
                </div>
              </div>

              {/* Grid Framework selector */}
              <div>
                <label className="form-label" style={{ marginBottom: '6px' }}>{t.cbLangLabel}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '6px' }}>
                  {frameworks.map(fw => (
                    <button
                      key={fw.id}
                      onClick={() => setSelectedLang(fw.id as any)}
                      className={`btn ${selectedLang === fw.id ? 'btn-primary' : ''}`}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        padding: '10px 4px', 
                        fontSize: '11px', 
                        gap: '6px',
                        background: selectedLang === fw.id ? '' : 'none',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px'
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: selectedLang === fw.id ? 'var(--bg-color)' : 'var(--text-secondary)' }}>
                        {renderTemplateIcon(fw.icon, 16)}
                      </span>
                      <span style={{ fontWeight: 600 }}>{fw.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">{t.cbKeyLabel}</label>
                {apiKeys.length === 0 ? (
                  <div style={{ color: 'var(--danger-color)', fontSize: '12px', marginTop: '6px', fontWeight: 500 }}>
                    {t.cbKeyNone}
                  </div>
                ) : (
                  <select 
                    className="form-input" 
                    value={selectedApiKeyId}
                    onChange={(e) => setSelectedApiKeyId(e.target.value)}
                    style={{ height: '40px', marginTop: '6px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', backgroundSize: '16px' }}
                  >
                    {apiKeys.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.key.slice(0, 15)}...)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Code Output Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div className="flex-between" style={{ marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Code size={16} color="var(--accent-color)" />
                  <span>{t.cbCodeHeader}</span>
                </h3>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleCopy('code_block', getGeneratedCode())}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11px', gap: '4px' }}
                  >
                    {copiedId === 'code_block' ? <Check size={12} color="#50e3c2" /> : <Copy size={12} />}
                    <span>{copiedId === 'code_block' ? t.copied : t.cbCopyBtn}</span>
                  </button>
                  <button 
                    onClick={handleDownloadCode}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11px', border: '1px solid var(--border-color)', background: 'none' }}
                  >
                    <span>{t.cbDownloadBtn}</span>
                  </button>
                </div>
              </div>

              {/* Code Monospace Box */}
              <div style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', overflowX: 'auto', direction: 'ltr', textAlign: 'left' }}>
                <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '11px', color: '#eaeaea', lineHeight: 1.5 }}>
                  <code>
                    {getGeneratedCode()}
                  </code>
                </pre>
              </div>

              {/* Interactive Terminal Integration */}
              <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                {!showConsole ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                      {lang === 'en' 
                        ? 'Want to test this generated code block live? Run it in our interactive web terminal mock.' 
                        : 'هل تريد اختبار كود التكامل البرمجي المولد حياً؟ قم بتشغيله في وحدة التحكم التفاعلية المحاكاة.'}
                    </p>
                    <button
                      onClick={() => setShowConsole(true)}
                      className="btn btn-primary"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        padding: '8px 16px', 
                        fontSize: '13px', 
                        fontWeight: 600,
                        alignSelf: 'flex-start'
                      }}
                    >
                      <Terminal size={14} />
                      <span>{lang === 'en' ? 'Open Interactive Terminal' : 'افتح وحدة التحكم التفاعلية'}</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="flex-between" style={{ alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={16} color="var(--accent-color)" />
                        <h4 style={{ fontSize: '14px', fontWeight: 600, margin: 0 }}>
                          {lang === 'en' ? 'Interactive Terminal Console' : 'وحدة التحكم والطرفية التفاعلية'}
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowConsole(false)}
                        className="btn"
                        style={{ 
                          padding: '4px 10px', 
                          fontSize: '11px', 
                          border: '1px solid var(--border-color)', 
                          background: 'none', 
                          color: 'var(--text-secondary)'
                        }}
                      >
                        {lang === 'en' ? 'Hide Terminal' : 'إخفاء الطرفية'}
                      </button>
                    </div>

                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
                      {lang === 'en' 
                        ? 'Execute a simulated POST request from the web interface. This logs transactions to the dashboard logs, updates your persistent wallet balance, and pushes live SMS/WhatsApp notification previews to the simulated iPhone mockup.'
                        : 'قم بتنفيذ طلب إرسال حقيقي للخلفية مباشرة. سيؤدي هذا لتحديث رصيد المحفظة المستمر، وتسجيل العملية في سجلات النظام، وإطلاق إشعار حي على شاشة الهاتف المحاكي.'}
                    </p>

                    {/* Inputs panel */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px', display: 'block' }}>
                          {selectedChannel === 'email' 
                            ? (lang === 'en' ? 'Recipient Email Address' : 'البريد الإلكتروني للمستلم')
                            : (lang === 'en' ? 'Recipient Phone Number (078xxxx / 077xxxx)' : 'رقم الهاتف المستلم (078xxxx / 077xxxx)')}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={consoleRecipient}
                          onChange={(e) => setConsoleRecipient(e.target.value)}
                          placeholder={selectedChannel === 'email' ? 'customer@gmail.com' : '07801234567'}
                          style={{ height: '36px', fontSize: '13px' }}
                          disabled={isExecuting}
                        />
                      </div>
                      
                      <button
                        onClick={executeConsoleRequest}
                        className="btn btn-primary"
                        disabled={isExecuting || apiKeys.length === 0}
                        style={{ 
                          height: '36px', 
                          padding: '0 16px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isExecuting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" style={{ width: '12px', height: '12px', border: '2px solid transparent', borderTopColor: 'currentColor', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                            <span>{lang === 'en' ? 'Executing...' : 'جاري التنفيذ...'}</span>
                          </>
                        ) : (
                          <>
                            <Play size={12} fill="currentColor" />
                            <span>{lang === 'en' ? 'Run Request' : 'تنفيذ الطلب'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Terminal Display */}
                    <div style={{ 
                      backgroundColor: '#000000', 
                      border: '1px solid #27272a', 
                      borderRadius: '6px', 
                      padding: '16px', 
                      fontFamily: 'monospace', 
                      fontSize: '12px', 
                      color: '#00ff66', 
                      minHeight: '150px',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      direction: 'ltr',
                      textAlign: 'left',
                      boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
                    }}>
                      {/* Window Dot controls */}
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', borderBottom: '1px solid #18181b', paddingBottom: '8px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                        <span style={{ color: '#71717a', fontSize: '10px', marginLeft: '8px', fontFamily: 'sans-serif' }}>sumersend-terminal</span>
                      </div>

                      {consoleLogs.length === 0 ? (
                        <div style={{ color: '#71717a' }}>
                          <p style={{ margin: '0 0 4px 0' }}>sumersend-terminal v1.0.0</p>
                          <p style={{ margin: 0 }}>&gt; {lang === 'en' ? 'Ready to execute API request. Click "Run Request" to test.' : 'جاهز لتنفيذ طلب الـ API. اضغط على "تنفيذ الطلب" للتجربة.'}</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {consoleLogs.map((log, idx) => {
                            let color = '#eaeaea';
                            if (log.startsWith('> POST') || log.startsWith('> GET')) {
                              color = '#60a5fa'; // Blue
                            } else if (log.includes('Status: 200 OK') || log.includes('Status: 201 Created')) {
                              color = '#34d399'; // Green
                            } else if (log.includes('Error:') || log.includes('Failed') || log.includes('Checking local fallback')) {
                              color = '#f87171'; // Red
                            } else if (log.startsWith('> Body:') || log.startsWith('> Authorization:') || log.startsWith('> Content-Type:')) {
                              color = '#a1a1aa'; // Muted Gray
                            } else if (log.startsWith('> ')) {
                              color = '#e4e4e7';
                            }
                            return (
                              <pre 
                                key={idx} 
                                style={{ 
                                  margin: 0, 
                                  whiteSpace: 'pre-wrap', 
                                  wordBreak: 'break-all',
                                  color: color,
                                  fontFamily: 'monospace',
                                  fontSize: '11px',
                                  lineHeight: 1.4
                                }}
                              >
                                {log}
                              </pre>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* API Specifications Docs details */}
          <div className="card" id="docs" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{t.cbDocsTitle}</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>{t.cbDocsDesc}</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}>POST</span>
                  <code style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>/v1/emails</code>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {lang === 'en' 
                    ? 'Sends a single transaction email using configured SMTP settings. Parameters from, to, subject, and html are required.' 
                    : 'إرسال رسالة بريد إلكتروني فردية فوراً. المعاملات المطلوبة هي: to (المستلم)، subject (العنوان)، html (محتوى الرسالة).'}
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}>POST</span>
                  <code style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>/v1/sms</code>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {lang === 'en' 
                    ? 'Dispatches an SMS notification to the local mobile phone number. Parameters to and body are required.' 
                    : 'إرسال رسالة نصية قصيرة SMS فورية إلى الهواتف المحمولة في العراق. المعاملات المطلوبة هي: to (رقم الهاتف المستلم مثل 0780xxxx)، body (نص الرسالة).'}
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="badge badge-success" style={{ padding: '4px 8px', fontSize: '10px', fontWeight: 800 }}>POST</span>
                  <code style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>/v1/whatsapp</code>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {lang === 'en' 
                    ? 'Dispatches a WhatsApp transaction confirmation using the Meta API channel. Parameters to and body are required.' 
                    : 'إرسال إشعار فوري عبر قناة الواتساب التفاعلية. المعاملات المطلوبة هي: to (رقم الهاتف)، body (محتوى الرسالة).'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {is2faModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--gray-alpha-500)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '28px',
            boxShadow: 'var(--shadow-large)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--panel-bg)',
            borderRadius: '12px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <Lock size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'تأكيد الهوية ثنائي العامل (2FA)' : 'Two-Factor Verification (2FA)'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'حماية الحساب والأمان الإضافي' : 'Additional account security verification'}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {lang === 'ar' 
                ? `لقد قمنا بإرسال رمز تحقق OTP مكون من 6 أرقام إلى هاتفك المرتبط (${securityConfig?.phone || '078xxxxxxxx'}). يرجى إدخال الرمز أدناه للمتابعة.`
                : `We have sent a 6-digit OTP code to your linked phone (${securityConfig?.phone || '078xxxxxxxx'}). Please enter the code below to continue.`}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                maxLength={6}
                value={verificationOtpInput}
                onChange={(e) => {
                  setVerificationOtpInput(e.target.value.replace(/\D/g, ''));
                  setVerificationOtpError(null);
                }}
                placeholder="000000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '8px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: verificationOtpError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--panel-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              {verificationOtpError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', margin: '6px 0 0 0' }}>
                  {verificationOtpError}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn"
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setIs2faModalOpen(false);
                  setVerificationOtpInput('');
                  setVerificationOtpError(null);
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className="btn btn-primary"
                style={{
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  if (verificationOtpInput.length !== 6) {
                    setVerificationOtpError(lang === 'ar' ? 'يجب إدخال 6 أرقام.' : 'Code must be 6 digits.');
                    return;
                  }
                  
                  const targetName = keyName.trim() || (lang === 'en' ? 'Default API Key' : 'مفتاح API افتراضي');
                  try {
                    const res = await fetch('http://127.0.0.1:3000/api/security/confirm-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ otp: verificationOtpInput })
                    });
                    
                    if (res.ok) {
                      setIs2faModalOpen(false);
                      setVerificationOtpInput('');
                      executeCreateKey(targetName, keyScope);
                    } else {
                      if (pendingOtpCode && verificationOtpInput === pendingOtpCode) {
                        setIs2faModalOpen(false);
                        setVerificationOtpInput('');
                        executeCreateKey(targetName, keyScope);
                      } else {
                        const errData = await res.json();
                        setVerificationOtpError(errData.error || (lang === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid code.'));
                      }
                    }
                  } catch (e) {
                    if (pendingOtpCode && verificationOtpInput === pendingOtpCode) {
                      setIs2faModalOpen(false);
                      setVerificationOtpInput('');
                      executeCreateKey(targetName, keyScope);
                    } else {
                      setVerificationOtpError(lang === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid code.');
                    }
                  }
                }}
              >
                {lang === 'ar' ? 'تأكيد وإنشاء' : 'Confirm & Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};
