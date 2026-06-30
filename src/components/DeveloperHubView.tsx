


import React, { useState, useEffect } from 'react';
import { apiFetch, API_BASE } from '../config';
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
  Bell,
  Monitor,
  Lock,
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { ScrollReveal } from './LandingView';
import { renderTemplateIcon } from './IconHelper';

const highlightCode = (code: string) => {
  if (!code) return null;
  
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Comments: // ... or # ...
  escaped = escaped.replace(/(\/\/.*)/g, '<span style="color: #71717a; font-style: italic;">$1</span>');
  escaped = escaped.replace(/(^#.*)/gm, '<span style="color: #71717a; font-style: italic;">$1</span>');

  // Strings: "..." or '...'
  escaped = escaped.replace(/(["'])(.*?)\1/g, '<span style="color: #a3e635;">$1$2$1</span>');

  // Numbers
  escaped = escaped.replace(/\b(\d+)\b/g, '<span style="color: #fb923c;">$1</span>');

  // Key keywords
  const keywords = [
    'const', 'require', 'function', 'return', 'import', 'package', 'func', 'main', 'var', 'let', 'define',
    'CURLOPT_POSTFIELDS', 'CURLOPT_HTTPHEADER', 'CURLOPT_POST', 'CURLOPT_RETURNTRANSFER', 'curl_setopt_array',
    'curl_init', 'curl_exec', 'curl_close', 'print_r', 'json_decode', 'json_encode', 'echo', 'file_get_contents',
    'requests', 'requests.post', 'requests.get',
    'MAIL_MAILER', 'MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_PASSWORD', 'MAIL_ENCRYPTION', 'MAIL_FROM_ADDRESS', 'MAIL_FROM_NAME',
    'SUMERSEND_API_KEY'
  ];
  
  keywords.forEach(kw => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    escaped = escaped.replace(regex, '<span style="color: #38bdf8; font-weight: 600;">$1</span>');
  });
  
  return <span dangerouslySetInnerHTML={{ __html: escaped }} />;
};

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
  controlledSubTab?: 'apikeys' | 'webhooks' | 'code';
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
    if (tab === 'code') return 'code';
    return 'apikeys';
  };

  const [activeSubTab, setActiveSubTab] = useState<'apikeys' | 'webhooks' | 'code'>(() => getSubTabName(controlledSubTab));

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

  useEffect(() => {
    apiFetch('/api/security/config')
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

  // Focus states for input styling
  const [isWebhookUrlFocused, setIsWebhookUrlFocused] = useState(false);
  const [isSimRecipientFocused, setIsSimRecipientFocused] = useState(false);
  const [isSimMessageFocused, setIsSimMessageFocused] = useState(false);
  const [isConsoleRecipientFocused, setIsConsoleRecipientFocused] = useState(false);

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
        apiFetch('/api/webhooks/logs')
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
      setConsoleRecipient(localStorage.getItem('sumer_admin_test_phone') || '07739396298');
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
      setConsoleLogs((prev: string[]) => [...prev, `> ${msg}`]);
    };
    
    const endpoint = selectedChannel === 'email' ? 'emails' : selectedChannel;
    const url = `${import.meta.env.VITE_API_URL || API_BASE}/v1/${endpoint}`;
    
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
            apiFetch('/api/logs')
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
    apiFetch('/api/smtp/config')
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

    const translations = {
    en: {
      title: 'Developer Integration Hub',
      subtitle: 'Connect your application to Sumer Send and manage your developer environment.',
      tabApiKeys: 'API Keys',
      tabWebhooks: 'Webhooks & Flow',
      tabCode: 'SDK & Code Builder',
      
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
      tabApiKeys: 'مفاتيح الـ API',
      tabWebhooks: 'الويب هوكس وتوقيع الأحداث',
      tabCode: 'SDK ومنشئ الأكواد',
      
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

    const getSelectedApiKeyText = () => {
    if (!selectedApiKeyId) return 'YOUR_API_KEY';
    const keyObj = apiKeys.find(k => k.id === selectedApiKeyId);
    return keyObj ? keyObj.key : 'YOUR_API_KEY';
  };

  const executeCreateKey = async (name: string, scope: string) => {
    setIsGenerating(true);
    try {
      const res = await apiFetch('/api/apikeys', {
        method: 'POST',
        body: JSON.stringify({ name, scope })
      });
      if (!res.ok) {
        throw new Error('Failed to create API key on backend');
      }
      const newObj = await res.json();
      setApiKeys([...apiKeys, newObj]);
      setSelectedApiKeyId(newObj.id);
      setKeyName('');
      setKeyScope('full');
    } catch (err) {
      console.error('Failed to create API Key on backend, falling back to local:', err);
      // local fallback
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
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = keyName.trim() || (lang === 'en' ? 'Default API Key' : 'مفتاح API افتراضي');

    if (securityConfig && securityConfig.verified && securityConfig.requireApiKey2FA) {
      try {
        setVerificationOtpError(null);
        setVerificationOtpInput('');
        
        const res = await apiFetch('/api/security/verify-phone', {
          method: 'POST',
          body: JSON.stringify({ phone: securityConfig.phone })
        });
        const data = await res.json();
        
        if (res.ok) {
          setIs2faModalOpen(true);
        } else {
          setVerificationOtpError(lang === 'ar' ? 'فشل إرسال رمز التحقق.' : 'Failed to send OTP.');
        }
      } catch (err) {
        setVerificationOtpError(lang === 'ar' ? 'فشل الاتصال بالخادم.' : 'Failed to connect to server.');
      }
      return;
    }

    executeCreateKey(name, keyScope);
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await apiFetch(`/api/apikeys/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error('Failed to delete API Key from backend:', err);
    }
    
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
    setVisibleKeys((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets((prev: Record<string, boolean>) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEventToggle = (event: string) => {
    setWebhookEvents((prev: string[]) => 
      prev.includes(event) 
        ? prev.filter((e: string) => e !== event) 
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
      secret: `sumer_wh_${randomHex}`
    };

    apiFetch('/api/webhooks', {
      method: 'POST',
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
    apiFetch(`/api/webhooks/${id}`, {
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
    const secret = webhooks[0]?.secret || 'sumer_wh_your_secret_key';
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
    const endpointHost = import.meta.env.VITE_API_URL || API_BASE;
    
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
      <style>{`
        @keyframes zentraFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        :root {
          --zentra-shadow: 0 10px 40px -10px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.01), 0 0 0 1px rgba(0,0,0,0.015);
        }
        [data-theme="dark"] {
          --zentra-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px #1a1a1e;
        }
        .zentra-card-shadow {
          box-shadow: var(--zentra-shadow);
        }
      `}</style>
      
      {/* API KEYS SUB-TAB */}
      {activeSubTab === 'apikeys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.25s ease-out' }}>

          {/* Create API Key Form — Zentra soft card */}
          <div className="zentra-card-shadow" style={{ 
            padding: '24px 28px', 
            borderRadius: '24px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: 'var(--panel-bg)', 
            position: 'relative', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* Decorative radial blurs */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '140px', height: '140px', background: 'var(--accent-color)', opacity: 0.04, borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-15px', left: '-15px', width: '100px', height: '100px', background: '#0070f3', opacity: 0.025, borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '44px', 
                height: '44px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(99, 102, 241, 0.06))',
                color: 'var(--accent-text)',
                border: '1px solid rgba(37, 99, 235, 0.1)',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)'
              }}>
                <Key size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                  {lang === 'en' ? 'Create New API Key' : 'إنشاء مفتاح API جديد'}
                </h3>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                  {lang === 'en' ? 'Generate a secure API token with custom permissions to authenticate your app requests.' : 'قم بتوليد مفتاح أمان مخصص لمصادقة طلبات تطبيقاتك مع بوابتنا بأمان.'}
                </p>
              </div>
            </div>
            
            <form onSubmit={handleCreateKey} style={{ display: 'flex', flexDirection: 'column', gap: '18px', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
                gap: '16px' 
              }}>
                {/* Field 1: Key Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'en' ? 'Key Name' : 'اسم المفتاح'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      [lang === 'ar' ? 'right' : 'left']: '14px', 
                      color: 'var(--text-muted)', 
                      display: 'flex', 
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <FileText size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-input"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      style={{ 
                        height: '44px', 
                        width: '100%',
                        paddingLeft: lang === 'ar' ? '12px' : '40px', 
                        paddingRight: lang === 'ar' ? '40px' : '12px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-color)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.08), inset 0 1px 2px rgba(0,0,0,0.02)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
                      }}
                    />
                  </div>
                </div>
                
                {/* Field 2: Scope */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {lang === 'en' ? 'Permissions Scope' : 'صلاحية الاستخدام'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ 
                      position: 'absolute', 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      [lang === 'ar' ? 'right' : 'left']: '14px', 
                      color: 'var(--text-muted)', 
                      display: 'flex', 
                      alignItems: 'center',
                      pointerEvents: 'none'
                    }}>
                      <Lock size={15} />
                    </span>
                    <select
                      className="form-input"
                      value={keyScope}
                      onChange={(e) => setKeyScope(e.target.value)}
                      style={{ 
                        height: '44px', 
                        width: '100%',
                        paddingLeft: lang === 'ar' ? '32px' : '40px', 
                        paddingRight: lang === 'ar' ? '40px' : '32px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        appearance: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                        backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: lang === 'en' ? 'right 14px center' : 'left 14px center', 
                        backgroundSize: '14px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-color)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.08), inset 0 1px 2px rgba(0,0,0,0.02)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
                      }}
                    >
                      <option value="full">{t.scopeFull}</option>
                      <option value="send">{t.scopeSending}</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div style={{ 
                display: 'flex', 
                justifyContent: lang === 'ar' ? 'flex-start' : 'flex-end',
                marginTop: '2px'
              }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isGenerating}
                  style={{ 
                    height: '44px', 
                    padding: '0 28px',
                    borderRadius: '99px',
                    fontWeight: 600,
                    fontSize: '13px',
                    opacity: isGenerating ? 0.7 : 1, 
                    cursor: isGenerating ? 'not-allowed' : 'pointer', 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.18)',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {isGenerating ? (
                    <>
                      <span style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                      <span>{lang === 'en' ? 'Generating...' : 'جاري الإنشاء...'}</span>
                    </>
                  ) : (
                    <>
                      <Plus size={15} />
                      <span>{t.addBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* API Keys List — Zentra Card-Based Layout */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Section Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={15} color="var(--accent-text)" />
                <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                  {lang === 'en' ? 'Active Credentials' : 'المفاتيح النشطة'}
                </h3>
              </div>
              {apiKeys.length > 0 && (
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '99px', backgroundColor: 'var(--panel-muted)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  {apiKeys.length} {lang === 'en' ? 'keys' : 'مفاتيح'}
                </span>
              )}
            </div>

            {apiKeys.length === 0 ? (
              <div className="zentra-card-shadow" style={{ 
                padding: '56px 40px', 
                textAlign: 'center', 
                borderRadius: '24px', 
                border: '1px dashed var(--border-color)', 
                backgroundColor: 'var(--panel-bg)' 
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--panel-muted), var(--bg-color))', marginBottom: '16px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                  <Key size={24} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{t.emptyKeys}</h4>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  {lang === 'en' ? 'Generate your first API key to start connecting and sending.' : 'قم بتوليد أول مفتاح API خاص بك للبدء في الربط والتكامل المباشر.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {apiKeys.map((item, idx) => {
                  const isVisible = visibleKeys[item.id];
                  const displayKey = isVisible 
                    ? item.key 
                    : `${item.key.slice(0, 12)}${'•'.repeat(32)}`;

                  return (
                    <div 
                      key={item.id} 
                      className="zentra-card-shadow"
                      style={{ 
                        borderRadius: '20px', 
                        border: '1px solid var(--border-color)', 
                        backgroundColor: 'var(--panel-bg)',
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                        cursor: 'default',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: `zentraFadeIn 0.3s ease-out ${idx * 0.05}s both`
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.15)';
                        e.currentTarget.style.boxShadow = '0 12px 40px -10px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(37, 99, 235, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.boxShadow = '';
                      }}
                    >
                      {/* Top row: Name + Scope + Date + Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '34px',
                            height: '34px',
                            borderRadius: '10px',
                            backgroundColor: item.scope === 'full' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)',
                            border: `1px solid ${item.scope === 'full' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}`,
                            color: item.scope === 'full' ? 'var(--success-color)' : 'var(--warning-color)',
                            flexShrink: 0
                          }}>
                            <Key size={16} />
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{item.name}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', flexWrap: 'wrap' }}>
                              <span style={{ 
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '99px',
                                fontSize: '10.5px',
                                fontWeight: 600,
                                letterSpacing: '0.02em',
                                backgroundColor: item.scope === 'full' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                                color: item.scope === 'full' ? 'var(--success-text)' : 'var(--warning-text)',
                                border: `1px solid ${item.scope === 'full' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'}`
                              }}>
                                <span style={{ 
                                  display: 'inline-block', 
                                  width: '5px', 
                                  height: '5px', 
                                  borderRadius: '50%', 
                                  backgroundColor: item.scope === 'full' ? 'var(--success-color)' : 'var(--warning-color)' 
                                }} />
                                {item.scope === 'full' ? t.scopeFull : t.scopeSending}
                              </span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={11} />
                                {new Date(item.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions group */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={() => toggleVisibility(item.id)}
                            style={{ 
                              border: '1px solid var(--border-color)', 
                              background: 'var(--bg-color)', 
                              cursor: 'pointer', 
                              padding: '7px 8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: 'var(--text-secondary)', 
                              transition: 'all 0.2s', 
                              borderRadius: '10px' 
                            }}
                            title={isVisible ? (lang === 'en' ? 'Hide key' : 'إخفاء المفتاح') : (lang === 'en' ? 'Show key' : 'إظهار المفتاح')}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.id, item.key)}
                            style={{ 
                              border: '1px solid var(--border-color)', 
                              background: copiedId === item.id ? 'rgba(16,185,129,0.06)' : 'var(--bg-color)', 
                              cursor: 'pointer', 
                              padding: '7px 8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: copiedId === item.id ? 'var(--success-color)' : 'var(--text-secondary)', 
                              transition: 'all 0.2s', 
                              borderRadius: '10px',
                              borderColor: copiedId === item.id ? 'rgba(16,185,129,0.2)' : 'var(--border-color)'
                            }}
                            title={lang === 'en' ? 'Copy key' : 'نسخ المفتاح'}
                            onMouseEnter={(e) => { if (copiedId !== item.id) { e.currentTarget.style.borderColor = 'var(--accent-color)'; e.currentTarget.style.color = 'var(--accent-text)'; } }}
                            onMouseLeave={(e) => { if (copiedId !== item.id) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                          >
                            {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteKey(item.id)}
                            style={{ 
                              border: '1px solid var(--border-color)', 
                              background: 'var(--bg-color)', 
                              cursor: 'pointer', 
                              padding: '7px 8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: 'var(--text-secondary)', 
                              transition: 'all 0.2s', 
                              borderRadius: '10px' 
                            }}
                            title={lang === 'en' ? 'Revoke Key' : 'إبطال المفتاح'}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.04)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = 'var(--danger-color)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-color)'; e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Key display row — monospace in a distinct code strip */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        background: 'var(--bg-color)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '12px', 
                        padding: '10px 14px', 
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '12.5px',
                        color: isVisible ? 'var(--text-primary)' : 'var(--text-muted)',
                        letterSpacing: '0.03em',
                        direction: 'ltr',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {displayKey}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Security Guide Card — Zentra amber accent */}
          <div className="zentra-card-shadow" style={{ 
            padding: '20px 24px', 
            borderRadius: '20px', 
            border: '1px solid rgba(245,158,11,0.12)', 
            backgroundColor: 'var(--panel-bg)',
            backgroundImage: 'linear-gradient(135deg, rgba(245,158,11,0.02), transparent)', 
            display: 'flex', 
            gap: '16px',
            alignItems: 'flex-start',
            direction: lang === 'ar' ? 'rtl' : 'ltr'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: '38px', 
              height: '38px', 
              borderRadius: '12px', 
              background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.05))',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.15)',
              flexShrink: 0 
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 5px 0', color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{t.guideTitle}</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.55 }}>{t.guideText}</p>
            </div>
          </div>

        </div>
      )}

      {/* WEBHOOKS & SECURITY FLOW SUB-TAB */}
      {activeSubTab === 'webhooks' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.25s ease-out' }}>
          
          {/* Visual Webhook Flow Diagram */}
          <div className="card" style={{ 
            padding: '28px', 
            borderRadius: '24px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: 'var(--panel-bg)', 
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)' 
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
              <Layers size={18} color="var(--accent-text)" />
              <span>{t.wfTitle}</span>
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
              <div style={{ 
                flex: 1, 
                minWidth: '180px', 
                padding: '20px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '20px', 
                backgroundColor: 'var(--bg-color)', 
                textAlign: 'center', 
                transition: 'all 0.2s ease', 
                boxShadow: 'none' 
              }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--panel-bg)', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    color: 'var(--text-primary)'
                  }}>
                    <Bell size={20} />
                  </div>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{t.wfStep1}</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{t.wfStep1Desc}</p>
              </div>

              {/* Direction aware custom SVG arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', color: 'var(--text-muted)', transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, overflow: 'visible' }}>
                  <path d="M0 8H28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M24 4L28 8L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ 
                flex: 1, 
                minWidth: '180px', 
                padding: '20px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '20px', 
                backgroundColor: 'var(--bg-color)', 
                textAlign: 'center', 
                transition: 'all 0.2s ease', 
                boxShadow: 'none' 
              }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--panel-bg)', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    color: 'var(--text-primary)'
                  }}>
                    <Lock size={18} />
                  </div>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{t.wfStep2}</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{t.wfStep2Desc}</p>
              </div>

              {/* Direction aware custom SVG arrow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', color: 'var(--text-muted)', transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }}>
                <svg width="32" height="16" viewBox="0 0 32 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, overflow: 'visible' }}>
                  <path d="M0 8H28" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M24 4L28 8L24 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <div style={{ 
                flex: 1, 
                minWidth: '180px', 
                padding: '20px', 
                border: '1px solid var(--border-color)', 
                borderRadius: '20px', 
                backgroundColor: 'var(--bg-color)', 
                textAlign: 'center', 
                transition: 'all 0.2s ease', 
                boxShadow: 'none' 
              }}>
                <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--panel-bg)', 
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    color: 'var(--text-primary)'
                  }}>
                    <Monitor size={18} />
                  </div>
                </div>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>{t.wfStep3}</h4>
                <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{t.wfStep3Desc}</p>
              </div>
            </div>
          </div>

          <div className="devhub-layout">
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Webhook Configuration form */}
              <div className="card" style={{ 
                padding: '28px', 
                borderRadius: '24px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--panel-bg)', 
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)' 
              }}>
                <div style={{ marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '12px', 
                    backgroundColor: 'rgba(16, 185, 129, 0.06)', 
                    color: 'var(--channel-sms)',
                    border: '1px solid rgba(16, 185, 129, 0.08)',
                    flexShrink: 0
                  }}>
                    <Webhook size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{lang === 'en' ? 'Register Webhook Endpoint' : 'إضافة عنوان ويب هوك جديد'}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0', lineHeight: 1.4 }}>{lang === 'en' ? 'Configure a target URL to receive secure HTTP POST payloads on transaction events.' : 'قم بتهيئة رابط خادمك لاستقبال طلبات HTTP POST فورية عند تغيير حالات الرسائل.'}</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateWebhook} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t.endpointLabel}</label>
                    <div style={{ 
                      display: 'flex', 
                      borderRadius: '12px', 
                      border: isWebhookUrlFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                      overflow: 'hidden', 
                      backgroundColor: 'var(--bg-color)',
                      alignItems: 'stretch',
                      boxShadow: isWebhookUrlFocused ? '0 0 0 3px rgba(37, 99, 235, 0.08)' : 'none',
                      transition: 'all 0.2s ease',
                      direction: 'ltr'
                    }}>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        padding: '0 14px', 
                        background: 'var(--panel-muted)', 
                        borderRight: '1px solid var(--border-color)', 
                        color: 'var(--text-secondary)', 
                        fontSize: '13px', 
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
                        userSelect: 'none'
                      }}>
                        https://
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        value={webhookUrl.replace(/^https?:\/\//i, '')}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWebhookUrl(val ? `https://${val}` : '');
                        }}
                        onFocus={() => setIsWebhookUrlFocused(true)}
                        onBlur={() => setIsWebhookUrlFocused(false)}
                        placeholder={t.endpointPlaceholder.replace(/^https?:\/\//i, '')}
                        style={{ 
                          flex: 1, 
                          border: 'none', 
                          background: 'none', 
                          height: '42px', 
                          padding: '0 14px', 
                          boxShadow: 'none', 
                          outline: 'none',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t.eventsLabel}</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      {[
                        { id: 'email.delivered', labelEn: 'Email Delivered', labelAr: 'تم توصيل البريد (email.delivered)' },
                        { id: 'email.failed', labelEn: 'Email Delivery Failed', labelAr: 'فشل البريد (email.failed)' },
                        { id: 'sms.delivered', labelEn: 'SMS Delivered', labelAr: 'تم توصيل SMS (sms.delivered)' },
                        { id: 'whatsapp.delivered', labelEn: 'WhatsApp Delivered', labelAr: 'تم توصيل الواتساب (whatsapp.delivered)' },
                      ].map((evt) => {
                        const isChecked = webhookEvents.includes(evt.id);
                        return (
                          <div 
                            key={evt.id}
                            onClick={() => handleEventToggle(evt.id)}
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '12px 16px', 
                              border: `1px solid ${isChecked ? 'var(--text-primary)' : 'var(--border-color)'}`, 
                              borderRadius: '12px', 
                              backgroundColor: isChecked ? 'var(--accent-bg)' : 'var(--panel-bg)',
                              cursor: 'pointer',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              userSelect: 'none',
                              boxShadow: isChecked ? '0 0 0 1px var(--text-primary)' : 'none'
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: isChecked ? 600 : 500, color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                              {lang === 'en' ? evt.labelEn : evt.labelAr}
                            </span>
                            <div style={{ 
                              width: '18px', 
                              height: '18px', 
                              borderRadius: '50%', 
                              border: `1px solid ${isChecked ? 'var(--text-primary)' : 'var(--border-color)'}`, 
                              backgroundColor: isChecked ? 'var(--text-primary)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                              flexShrink: 0
                            }}>
                              {isChecked && <Check size={11} color="var(--panel-bg)" strokeWidth={3} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: lang === 'ar' ? 'flex-start' : 'flex-end', marginTop: '4px' }}>
                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      style={{ 
                        height: '42px', 
                        padding: '0 26px',
                        borderRadius: '99px',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    >
                      <Webhook size={15} />
                      <span>{t.createWebhookBtn}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Configured Webhooks List */}
              <div className="card" style={{ 
                padding: '0', 
                overflow: 'hidden', 
                borderRadius: '24px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--panel-bg)', 
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)' 
              }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Webhook size={16} color="var(--accent-text)" />
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {lang === 'en' ? 'Registered Endpoints' : 'عناوين الاستقبال المسجلة'}
                    </h3>
                  </div>
                  {webhooks.length > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '20px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                      {webhooks.length} {lang === 'en' ? 'Endpoints' : 'عناوين'}
                    </span>
                  )}
                </div>

                {webhooks.length === 0 ? (
                  <div style={{ padding: '50px 30px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--panel-muted)', marginBottom: '16px', color: 'var(--text-muted)', border: '1px dashed var(--border-color)' }}>
                      <Webhook size={24} />
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 6px 0', color: 'var(--text-primary)' }}>{t.emptyWebhooks}</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                      {lang === 'en' ? 'Add a webhook URL to subscribe to messaging events.' : 'أضف رابط ويب هوك للبدء في تلقي إشعارات التوصيل التلقائية.'}
                    </p>
                  </div>
                ) : (
                  <div className="table-container" style={{ overflowX: 'auto', margin: 0 }}>
                    <table className="v-table" style={{ margin: 0, width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: lang === 'ar' ? 'right' : 'left' }}>{t.whTableUrl}</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: lang === 'ar' ? 'right' : 'left' }}>{t.whTableEvents}</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: lang === 'ar' ? 'right' : 'left', width: '30%' }}>{t.whTableSecret}</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: lang === 'ar' ? 'right' : 'left' }}>{t.whTableStatus}</th>
                          <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', width: '90px' }}>{t.whTableActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {webhooks.map((item) => {
                          const isSecretVisible = visibleSecrets[item.id];
                          const displaySecret = isSecretVisible 
                            ? item.secret 
                            : `${item.secret.slice(0, 10)}••••••••••••••••`;

                          return (
                            <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                              <td style={{ padding: '16px 18px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.url}>
                                {item.url}
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {item.events.map((ev: string) => (
                                    <span key={ev} style={{ fontSize: '10.5px', padding: '2px 8px', backgroundColor: 'var(--panel-muted)', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                                      {ev}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <div style={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  background: 'var(--bg-color)', 
                                  border: '1px solid var(--border-color)', 
                                  borderRadius: '12px', 
                                  padding: '6px 12px', 
                                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                  fontSize: '11.5px',
                                  color: 'var(--text-primary)',
                                  gap: '10px',
                                  direction: 'ltr',
                                  boxShadow: 'none'
                                }}>
                                  <span style={{ letterSpacing: '0.02em', color: isSecretVisible ? 'var(--text-primary)' : 'var(--text-muted)' }}>{displaySecret}</span>
                                  <div style={{ width: '1px', height: '12px', background: 'var(--border-color)' }} />
                                  <div style={{ display: 'flex', gap: '4px' }}>
                                    <button 
                                      type="button"
                                      onClick={() => toggleSecretVisibility(item.id)}
                                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', borderRadius: '4px' }}
                                      title={isSecretVisible ? (lang === 'en' ? 'Hide secret' : 'إخفاء المفتاح السري') : (lang === 'en' ? 'Show secret' : 'إظهار المفتاح السري')}
                                    >
                                      {isSecretVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                    </button>
                                    <button 
                                      type="button"
                                      onClick={() => handleCopy(item.id + '_sec', item.secret)}
                                      style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', color: copiedId === item.id + '_sec' ? 'var(--success-text)' : 'var(--text-secondary)', transition: 'color 0.2s', borderRadius: '4px' }}
                                      title={lang === 'en' ? 'Copy secret' : 'نسخ المفتاح السري'}
                                    >
                                      {copiedId === item.id + '_sec' ? <Check size={13} color="var(--success-color)" /> : <Copy size={13} />}
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '16px 18px' }}>
                                <span 
                                  className="badge badge-success" 
                                  style={{ 
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '5px',
                                    padding: '4px 10px', 
                                    borderRadius: '99px', 
                                    fontWeight: 600,
                                    backgroundColor: 'var(--success-bg)',
                                    color: 'var(--success-text)',
                                    border: '1px solid rgba(16,185,129,0.15)'
                                  }}
                                >
                                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                                  {t.whStatusActive}
                                </span>
                              </td>
                              <td style={{ padding: '16px 18px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  className="btn btn-danger"
                                  style={{ 
                                    width: '28px',
                                    height: '28px',
                                    borderRadius: '50%', 
                                    padding: '0',
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    backgroundColor: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--danger-bg)';
                                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                                    e.currentTarget.style.color = 'var(--danger-color)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.color = 'var(--text-secondary)';
                                  }}
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
                  </div>
                )}
              </div>

              {/* Webhook Signature Verification Guide */}
              {webhooks.length > 0 && (
                <div className="card" style={{ 
                  padding: '28px', 
                  borderRadius: '24px', 
                  border: '1px solid var(--border-color)', 
                  backgroundColor: 'var(--panel-bg)', 
                  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <Key size={16} color="var(--accent-text)" />
                        <span>{t.wvcTitle}</span>
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>{t.wvcDesc}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {/* Segmented language controller tab group */}
                      <div style={{ display: 'flex', backgroundColor: 'var(--panel-muted)', padding: '4px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
                        <button 
                          onClick={() => setSelectedLang('node')} 
                          style={{ 
                            fontSize: '11px', 
                            padding: '6px 14px', 
                            borderRadius: '99px', 
                            border: 'none', 
                            background: selectedLang === 'node' ? 'var(--accent-color)' : 'transparent',
                            color: selectedLang === 'node' ? 'var(--panel-bg)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: selectedLang === 'node' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          Node.js
                        </button>
                        <button 
                          onClick={() => setSelectedLang('php')} 
                          style={{ 
                            fontSize: '11px', 
                            padding: '6px 14px', 
                            borderRadius: '99px', 
                            border: 'none', 
                            background: selectedLang === 'php' ? 'var(--accent-color)' : 'transparent',
                            color: selectedLang === 'php' ? 'var(--panel-bg)' : 'var(--text-secondary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            boxShadow: selectedLang === 'php' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          PHP
                        </button>
                      </div>

                      <button 
                        onClick={() => handleCopy('webhook_verify', getSignatureVerificationSnippet())}
                        className="btn btn-primary"
                        style={{ padding: '0 14px', fontSize: '11.5px', gap: '6px', height: '32px', borderRadius: '99px' }}
                      >
                        {copiedId === 'webhook_verify' ? <Check size={12} color="var(--success-color)" /> : <Copy size={12} />}
                        <span>{copiedId === 'webhook_verify' ? t.copied : t.cbCopyBtn}</span>
                      </button>
                    </div>
                  </div>

                  {/* Code Editor Mockup wrapper */}
                  <div className="mac-code-window" style={{ backgroundColor: '#08080a', overflow: 'hidden', direction: 'ltr', textAlign: 'left', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'flex', gap: '6px', backgroundColor: '#101012', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '12px 18px', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                      </div>
                      <span style={{ color: '#71717a', fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>
                        {selectedLang === 'php' ? 'verify_signature.php' : 'webhook.js'}
                      </span>
                    </div>
                    <div style={{ padding: '16px', overflowX: 'auto' }}>
                      <pre style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', color: '#e4e4e7', lineHeight: 1.6 }}>
                        <code>{highlightCode(getSignatureVerificationSnippet())}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* WEBHOOK SIMULATOR / DEBUGGER TOOL */}
            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="card" style={{ 
                padding: '28px', 
                borderRadius: '24px', 
                border: '1px solid var(--border-color)', 
                backgroundColor: 'var(--panel-bg)', 
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)', 
                position: 'sticky', 
                top: '100px' 
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play size={16} color="var(--accent-text)" />
                  <span>{t.simTitle}</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t.simEventLabel}</label>
                    <select 
                      className="form-input" 
                      value={simEvent}
                      onChange={(e) => {
                        setSimEvent(e.target.value);
                        if (e.target.value.startsWith('email')) {
                          setSimRecipient('customer@gmail.com');
                          setSimMessage(e.target.value.endsWith('failed') ? 'Message rejected: quota exceeded.' : 'Delivered successfully.');
                        } else {
                          setSimRecipient(localStorage.getItem('sumer_admin_test_phone') || '07739396298');
                          setSimMessage('OTP successfully delivered to device.');
                        }
                      }}
                      style={{ 
                        height: '42px', 
                        fontSize: '13px',
                        width: '100%',
                        padding: '0 12px',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', 
                        backgroundSize: '12px',
                        outline: 'none'
                      }}
                    >
                      <option value="email.delivered">email.delivered</option>
                      <option value="email.failed">email.failed</option>
                      <option value="sms.delivered">sms.delivered</option>
                      <option value="whatsapp.delivered">whatsapp.delivered</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t.simRecipientLabel}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={simRecipient}
                      onChange={(e) => setSimRecipient(e.target.value)}
                      onFocus={() => setIsSimRecipientFocused(true)}
                      onBlur={() => setIsSimRecipientFocused(false)}
                      style={{ 
                        height: '42px', 
                        fontSize: '13px', 
                        width: '100%', 
                        padding: '0 12px', 
                        borderRadius: '12px', 
                        border: isSimRecipientFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                        backgroundColor: 'var(--bg-color)', 
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxShadow: isSimRecipientFocused ? '0 0 0 3px rgba(37, 99, 235, 0.08)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>{t.simMessageLabel}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={simMessage}
                      onChange={(e) => setSimMessage(e.target.value)}
                      onFocus={() => setIsSimMessageFocused(true)}
                      onBlur={() => setIsSimMessageFocused(false)}
                      style={{ 
                        height: '42px', 
                        fontSize: '13px', 
                        width: '100%', 
                        padding: '0 12px', 
                        borderRadius: '12px', 
                        border: isSimMessageFocused ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                        backgroundColor: 'var(--bg-color)', 
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxShadow: isSimMessageFocused ? '0 0 0 3px rgba(37, 99, 235, 0.08)' : 'none',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <button 
                    onClick={runWebhookSimulation} 
                    disabled={isSimulating || webhooks.length === 0}
                    className="btn btn-primary" 
                    style={{ 
                      height: '42px', 
                      width: '100%', 
                      fontSize: '13px', 
                      gap: '8px', 
                      opacity: (isSimulating || webhooks.length === 0) ? 0.6 : 1, 
                      borderRadius: '99px', 
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    {isSimulating ? (
                      <>
                        <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                        <span>{lang === 'en' ? 'Simulating...' : 'جاري المحاكاة...'}</span>
                      </>
                    ) : (
                      <>
                        <Play size={13} />
                        <span>{t.simBtn}</span>
                      </>
                    )}
                  </button>
                </div>

                {(simulationLogs.length > 0 || isSimulating) && (
                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.simLogsLabel}</h4>
                    {/* Simulated developer terminal */}
                    <div style={{ backgroundColor: '#050507', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', height: '220px', overflowY: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace', fontSize: '11.5px', color: '#10b981', display: 'flex', flexDirection: 'column', gap: '6px', direction: 'ltr', textAlign: 'left', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)' }}>
                      {/* Terminal window tab bar */}
                      <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', borderBottom: '1px solid #18181b', paddingBottom: '6px', alignItems: 'center' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                        <span style={{ color: '#52525b', fontSize: '9px', marginLeft: '6px' }}>sumer-webhook-simulator</span>
                      </div>
                      {simulationLogs.map((log: string, index: number) => (
                        <div key={index} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{log}</div>
                      ))}
                      {isSimulating && (
                        <div style={{ animation: 'pulse 1s infinite', color: '#71717a', fontWeight: 'bold' }}>█</div>
                      )}
                    </div>

                    {simulationResult && (
                      <div style={{ marginTop: '12px', padding: '12px', borderRadius: '12px', backgroundColor: simulationResult.success ? 'var(--success-bg)' : 'var(--danger-bg)', border: `1px solid ${simulationResult.success ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: simulationResult.success ? 'var(--success-color)' : 'var(--danger-color)' }}></span>
                        <strong style={{ color: simulationResult.success ? 'var(--success-text)' : 'var(--danger-text)' }}>
                          {simulationResult.success ? t.simResultSuccess : t.simResultFail}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Webhook Delivery Logs Table */}
          <div className="card" style={{ 
            marginTop: '24px', 
            padding: '28px', 
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--panel-bg)',
            boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.01), 0 0 0 1px var(--border-color)'
          }}>
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
                    {webhookLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{log.event}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.url}>{log.url}</td>
                        <td>
                          <span className={`badge badge-${log.status === 'success' ? 'success' : 'warning'}`} style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '99px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: log.status === 'success' ? 'var(--success-bg)' : 'var(--warning-bg)',
                            color: log.status === 'success' ? 'var(--success-text)' : 'var(--warning-text)',
                            border: log.status === 'success' ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(245,158,11,0.15)'
                          }}>
                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: log.status === 'success' ? 'var(--success-color)' : 'var(--warning-color)' }} />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.25s ease-out' }}>
          
          <div className="codebuilder-layout">
            {/* Input Options Panel */}
            <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', backgroundColor: 'var(--panel-bg)', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: 'var(--zentra-shadow)' }}>
              
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>{t.cbChannelLabel}</label>
                {/* Segmented notification channel selector */}
                <div style={{ display: 'flex', backgroundColor: 'var(--panel-muted)', padding: '4px', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => setSelectedChannel('email')}
                    style={{ 
                      flex: 1, 
                      fontSize: '12px', 
                      fontWeight: 600,
                      padding: '8px 12px', 
                      borderRadius: '99px', 
                      border: 'none',
                      background: selectedChannel === 'email' ? 'var(--accent-color)' : 'transparent',
                      color: selectedChannel === 'email' ? 'var(--panel-bg)' : 'var(--text-secondary)',
                      boxShadow: selectedChannel === 'email' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lang === 'en' ? 'Email API' : 'البريد الإلكتروني'}
                  </button>
                  <button 
                    onClick={() => setSelectedChannel('sms')}
                    style={{ 
                      flex: 1, 
                      fontSize: '12px', 
                      fontWeight: 600,
                      padding: '8px 12px', 
                      borderRadius: '99px', 
                      border: 'none',
                      background: selectedChannel === 'sms' ? 'var(--accent-color)' : 'transparent',
                      color: selectedChannel === 'sms' ? 'var(--panel-bg)' : 'var(--text-secondary)',
                      boxShadow: selectedChannel === 'sms' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lang === 'en' ? 'SMS API' : 'الرسائل القصيرة'}
                  </button>
                  <button 
                    onClick={() => setSelectedChannel('whatsapp')}
                    style={{ 
                      flex: 1, 
                      fontSize: '12px', 
                      fontWeight: 600,
                      padding: '8px 12px', 
                      borderRadius: '99px', 
                      border: 'none',
                      background: selectedChannel === 'whatsapp' ? 'var(--accent-color)' : 'transparent',
                      color: selectedChannel === 'whatsapp' ? 'var(--panel-bg)' : 'var(--text-secondary)',
                      boxShadow: selectedChannel === 'whatsapp' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {lang === 'en' ? 'WhatsApp API' : 'الواتساب'}
                  </button>
                </div>
              </div>

              {/* Grid Framework selector */}
              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px', display: 'block' }}>{t.cbLangLabel}</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px' }}>
                  {frameworks.map(fw => {
                    const isSelected = selectedLang === fw.id;
                    return (
                      <button
                        key={fw.id}
                        onClick={() => setSelectedLang(fw.id as any)}
                        style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center', 
                          padding: '12px 6px', 
                          fontSize: '11px', 
                          gap: '6px',
                          background: isSelected ? 'var(--panel-bg)' : 'transparent',
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                          border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-color)'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 600,
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.04)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-hover)';
                            e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.borderColor = 'var(--border-color)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <span style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)' 
                        }}>
                          {renderTemplateIcon(fw.icon, 16)}
                        </span>
                        <span>{fw.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>{t.cbKeyLabel}</label>
                {apiKeys.length === 0 ? (
                  <div style={{ color: 'var(--danger-text)', fontSize: '12px', padding: '10px', borderRadius: '8px', backgroundColor: 'var(--danger-bg)', border: '1px solid rgba(239,68,68,0.1)', fontWeight: 500 }}>
                    {t.cbKeyNone}
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="form-input" 
                      value={selectedApiKeyId}
                      onChange={(e) => setSelectedApiKeyId(e.target.value)}
                      style={{ 
                        height: '40px', 
                        width: '100%',
                        padding: '0 12px',
                        paddingLeft: lang === 'ar' ? '32px' : '12px',
                        paddingRight: lang === 'ar' ? '12px' : '32px',
                        borderRadius: '8px', 
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        outline: 'none',
                        cursor: 'pointer',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', 
                        backgroundRepeat: 'no-repeat', 
                        backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', 
                        backgroundSize: '14px'
                      }}
                    >
                      {apiKeys.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.key.slice(0, 15)}...)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Code Output Card */}
            <div className="card" style={{ padding: '24px', borderRadius: '24px', border: '1px solid var(--border-color)', backgroundColor: 'var(--panel-bg)', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: 'var(--zentra-shadow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Code size={16} color="var(--accent-text)" />
                  <span>{t.cbCodeHeader}</span>
                </h3>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => handleCopy('code_block', getGeneratedCode())}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11.5px', gap: '6px', borderRadius: '8px', height: '32px' }}
                  >
                    {copiedId === 'code_block' ? <Check size={12} color="var(--success-color)" /> : <Copy size={12} />}
                    <span>{copiedId === 'code_block' ? t.copied : t.cbCopyBtn}</span>
                  </button>
                  <button 
                    onClick={handleDownloadCode}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11.5px', border: '1px solid var(--border-color)', background: 'none', borderRadius: '8px', height: '32px', color: 'var(--text-secondary)' }}
                  >
                    <span>{t.cbDownloadBtn}</span>
                  </button>
                </div>
              </div>

              {/* Code Monospace Box with VS-Code/Vercel syntax highlight */}
              <div style={{ flex: 1, backgroundColor: '#09090b', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', direction: 'ltr', textAlign: 'left', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {/* Simulated editor header */}
                <div style={{ display: 'flex', gap: '6px', backgroundColor: '#101012', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '10px 16px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }}></span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
                  </div>
                  <span style={{ color: '#71717a', fontSize: '10px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace' }}>
                    {selectedLang === 'curl' ? 'send.sh' : selectedLang === 'node' ? 'send.js' : selectedLang === 'php' ? 'send.php' : selectedLang === 'python' ? 'send.py' : selectedLang === 'go' ? 'send.go' : selectedLang === 'laravel' ? '.env' : 'wp-config.php'}
                  </span>
                </div>
                <div style={{ padding: '16px', overflowX: 'auto' }}>
                  <pre style={{ margin: 0, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', fontSize: '12px', color: '#e4e4e7', lineHeight: 1.6 }}>
                    <code>
                      {highlightCode(getGeneratedCode())}
                    </code>
                  </pre>
                </div>
              </div>

              {/* Interactive Terminal Section */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                {!showConsole ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
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
                        alignSelf: 'flex-start',
                        borderRadius: '8px'
                      }}
                    >
                      <Terminal size={14} />
                      <span>{lang === 'en' ? 'Open Interactive Terminal' : 'افتح وحدة التحكم التفاعلية'}</span>
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Terminal size={16} color="var(--accent-text)" />
                        <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                          {lang === 'en' ? 'Interactive Terminal Console' : 'وحدة التحكم والطرفية التفاعلية'}
                        </h4>
                      </div>
                      <button
                        onClick={() => setShowConsole(false)}
                        className="btn"
                        style={{ 
                          padding: '5px 12px', 
                          fontSize: '11px', 
                          border: '1px solid var(--border-color)', 
                          background: 'none', 
                          color: 'var(--text-secondary)',
                          borderRadius: '8px'
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
                      <div style={{ flex: 1, minWidth: '220px' }}>
                        <label className="form-label" style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
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
                          style={{ height: '38px', fontSize: '13px', borderRadius: '6px', padding: '0 10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', width: '100%' }}
                          disabled={isExecuting}
                        />
                      </div>
                      
                      <button
                        onClick={executeConsoleRequest}
                        className="btn btn-primary"
                        disabled={isExecuting || apiKeys.length === 0}
                        style={{ 
                          height: '38px', 
                          padding: '0 16px', 
                          fontSize: '13px', 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderRadius: '8px'
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

                    {/* Shell Console Display */}
                    <div style={{ 
                      backgroundColor: '#020202', 
                      border: '1px solid #1f1f23', 
                      borderRadius: '10px', 
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
                          {consoleLogs.map((log: string, idx: number) => {
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
          <div className="card" id="docs" style={{ padding: '24px', borderRadius: '24px' }}>
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
            borderRadius: '24px',
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
                    const res = await apiFetch('/api/security/confirm-otp', {
                      method: 'POST',
                      body: JSON.stringify({ otp: verificationOtpInput })
                    });
                    
                    if (res.ok) {
                      setIs2faModalOpen(false);
                      setVerificationOtpInput('');
                      executeCreateKey(targetName, keyScope);
                    } else {
                      const errData = await res.json();
                      setVerificationOtpError(errData.error || (lang === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid code.'));
                    }
                  } catch (e) {
                    setVerificationOtpError(lang === 'ar' ? 'حدث خطأ في الاتصال بالخادم.' : 'Failed to connect to server.');
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
