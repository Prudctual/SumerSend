

import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Send, 
  Shield, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  Settings, 
  Info, 
  Copy, 
  ExternalLink, 
  Mail, 
  Phone, 
  MessageSquare,
  BookOpen,
  Layers,
  Check,
  Monitor,
  Smartphone,
  Plus,
  Trash2,
  Sliders
} from 'lucide-react';
import { templatesDb } from '../data/templates';
import type { TemplateItem } from '../data/templates';
import { ScrollReveal, BentoCard } from './LandingView';
import { TemplateBuilder } from './TemplateBuilder';

interface SettingsViewProps {
  lang: 'en' | 'ar';
  setEmailBody: (body: string) => void;
  setEmailSubject: (sub: string) => void;
  setMsgBody: (body: string) => void;
  setPlaygroundChannel: (channel: 'email' | 'sms' | 'whatsapp') => void;
  setCurrentTab: (tab: string) => void;
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  setPhoneNotifications?: React.Dispatch<React.SetStateAction<any[]>>;
  controlledSubTab?: 'smtp' | 'whatsapp' | 'templates' | 'system' | 'security';
  onBuilderToggle?: (active: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  lang, 
  setEmailBody, 
  setEmailSubject,
  setMsgBody,
  setPlaygroundChannel,
  setCurrentTab,
  setLogs,
  setPhoneNotifications,
  controlledSubTab,
  onBuilderToggle
}) => {
  const getSubTabName = (tab?: string) => {
    if (tab === 'smtp') return 'smtp';
    if (tab === 'whatsapp') return 'whatsapp';
    if (tab === 'templates') return 'templates';
    if (tab === 'system') return 'system';
    if (tab === 'security') return 'security';
    return 'smtp';
  };

  const [activeSubTab, setActiveSubTab] = useState<'smtp' | 'whatsapp' | 'templates' | 'system' | 'security'>(() => getSubTabName(controlledSubTab));

  useEffect(() => {
    if (controlledSubTab) {
      setActiveSubTab(getSubTabName(controlledSubTab));
    }
  }, [controlledSubTab]);
  
  // WhatsApp state
  const [waStatus, setWaStatus] = useState<{ connected: boolean, qr: string | null }>({ connected: false, qr: null });
  const [waLoading, setWaLoading] = useState(false);
  
  // SMTP settings state
  const [host, setHost] = useState('');
  const [port, setPort] = useState('587');
  const [secure, setSecure] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [from, setFrom] = useState('');
  
  // Test states
  const [testRecipient, setTestRecipient] = useState(() => localStorage.getItem('sumer_admin_test_email') || '');
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // Template gallery states
  const [activeCategory, setActiveCategory] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome_substack');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [searchQuery, setSearchQuery] = useState('');

  // Custom user templates state
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>([]);
  const [isBuildingTemplate, setIsBuildingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});

  useEffect(() => {
    if (onBuilderToggle) {
      onBuilderToggle(isBuildingTemplate);
    }
    return () => {
      if (onBuilderToggle) {
        onBuilderToggle(false);
      }
    };
  }, [isBuildingTemplate, onBuilderToggle]);

  const fetchCustomTemplates = () => {
    fetch('http://127.0.0.1:3000/api/templates/custom')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomTemplates(data);
        }
      })
      .catch(err => console.warn('Could not load custom templates in SettingsView:', err));
  };

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const getMergedTemplates = () => {
    const staticList = templatesDb[activeCategory] || [];
    const customList = customTemplates.filter(t => t.type === activeCategory) || [];
    return [...staticList, ...customList];
  };

  // Synchronize selected template ID when category changes
  useEffect(() => {
    const list = getMergedTemplates();
    if (list.length > 0) {
      const exists = list.some(t => t.id === selectedTemplateId);
      if (!exists) {
        setSelectedTemplateId(list[0].id);
      }
    }
  }, [activeCategory, customTemplates, selectedTemplateId]);

  // Synchronize dynamic preview variables when template changes
  useEffect(() => {
    const list = getMergedTemplates();
    const current = list.find(temp => temp.id === selectedTemplateId) || list[0];
    if (current && current.variables) {
      const initialVars: Record<string, string> = {};
      current.variables.forEach(v => {
        initialVars[v.key] = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
      });
      setPreviewVars(initialVars);
    } else {
      setPreviewVars({});
    }
  }, [selectedTemplateId, lang, activeCategory, customTemplates]);

  const handleSaveCustomTemplate = async (payload: TemplateItem) => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/templates/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomTemplates(prev => {
          const idx = prev.findIndex(t => t.id === saved.id);
          if (idx !== -1) {
            return prev.map(t => t.id === saved.id ? saved : t);
          } else {
            return [...prev, saved];
          }
        });
        setSelectedTemplateId(saved.id);
        setIsBuildingTemplate(false);
        setEditingTemplate(null);
      }
    } catch (err) {
      console.error('Failed to save template:', err);
      alert(lang === 'ar' ? 'فشل حفظ القالب. تأكد من تشغيل السيرفر.' : 'Failed to save template. Make sure server is running.');
    }
  };

  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = lang === 'ar' ? 'هل أنت متأكد من حذف هذا القالب المخصص؟' : 'Are you sure you want to delete this custom template?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`http://127.0.0.1:3000/api/templates/custom/${templateId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
        if (selectedTemplateId === templateId) {
          const merged = getMergedTemplates().filter(t => t.id !== templateId);
          setSelectedTemplateId(merged[0]?.id || templatesDb[activeCategory][0]?.id || '');
        }
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const [prevActiveCategory, setPrevActiveCategory] = useState(activeCategory);
  if (activeCategory !== prevActiveCategory) {
    setPrevActiveCategory(activeCategory);
    const staticList = templatesDb[activeCategory] || [];
    const customList = customTemplates.filter(t => t.type === activeCategory) || [];
    const merged = [...staticList, ...customList];
    const defaultId = merged[0]?.id || '';
    setSelectedTemplateId(defaultId);
  }

  // Sync admin test email across app
  useEffect(() => {
    if (testRecipient) {
      localStorage.setItem('sumer_admin_test_email', testRecipient);
    }
  }, [testRecipient]);

  // Security settings states
  const [securityPhone, setSecurityPhone] = useState('');
  const [securityVerified, setSecurityVerified] = useState(false);
  const [requireCampaign2FA, setRequireCampaign2FA] = useState(false);
  const [requireApiKey2FA, setRequireApiKey2FA] = useState(false);
  const [securityOtp, setSecurityOtp] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);

  // Load security config
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/security/config')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSecurityPhone(data.phone || '');
          setSecurityVerified(!!data.verified);
          setRequireCampaign2FA(!!data.requireCampaign2FA);
          setRequireApiKey2FA(!!data.requireApiKey2FA);
        }
      })
      .catch(err => console.warn('Could not load security config, using fallback:', err));
  }, []);

  // Fetch WhatsApp status
  const fetchWaStatus = () => {
    fetch('http://127.0.0.1:3000/api/whatsapp/status')
      .then(res => res.json())
      .then(data => {
        setWaStatus(data);
      })
      .catch(err => console.error('Failed to fetch WA status:', err));
  };

  useEffect(() => {
    if (activeSubTab === 'whatsapp') {
      fetchWaStatus();
      const interval = setInterval(fetchWaStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [activeSubTab]);

  const handleWaLogout = async () => {
    setWaLoading(true);
    try {
      await fetch('http://127.0.0.1:3000/api/whatsapp/logout', { method: 'POST' });
      fetchWaStatus();
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  // Countdown timer for resend otp
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendSecurityOtp = async () => {
    if (!securityPhone.trim()) {
      setSecurityError(lang === 'en' ? 'Please enter a valid phone number.' : 'يرجى إدخال رقم هاتف صالح.');
      return;
    }
    
    setSecurityError(null);
    setSecuritySuccess(null);
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/security/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: securityPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setSecuritySuccess(lang === 'en' ? 'Verification code sent!' : 'تم إرسال رمز التحقق بنجاح!');
      setIsVerifyingOtp(true);
      setCountdown(60);

      // Push mockup notification if callback exists
      if (setPhoneNotifications && data.otp) {
        setPhoneNotifications(prev => [
          {
            id: 'security_otp_' + Date.now(),
            type: 'sms',
            title: 'SMS: Sumer Security',
            body: `رمز التحقق الخاص بك لتأمين حساب سومر سيند هو: ${data.otp}. لا تشارك هذا الرمز مع أي شخص.`,
            time: 'Now'
          },
          ...prev
        ]);
      }
      
      // Local log sync
      if (data.log) {
        setLogs(prev => [data.log, ...prev]);
      }
    } catch (err: any) {
      setSecurityError(err.message);
    }
  };

  const handleConfirmSecurityOtp = async () => {
    if (!securityOtp.trim()) {
      setSecurityError(lang === 'en' ? 'Please enter the code.' : 'يرجى إدخال الرمز.');
      return;
    }
    
    setSecurityError(null);
    setSecuritySuccess(null);
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/security/confirm-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: securityOtp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setSecuritySuccess(lang === 'en' ? 'Phone number verified successfully!' : 'تم تأكيد رقم الهاتف بنجاح!');
      setSecurityVerified(true);
      setIsVerifyingOtp(false);
      setSecurityOtp('');
    } catch (err: any) {
      setSecurityError(err.message);
    }
  };

  const handleToggle2FA = async (type: 'campaign' | 'apikey', checked: boolean) => {
    const payload: any = {};
    if (type === 'campaign') {
      setRequireCampaign2FA(checked);
      payload.requireCampaign2FA = checked;
    } else {
      setRequireApiKey2FA(checked);
      payload.requireApiKey2FA = checked;
    }

    try {
      await fetch('http://127.0.0.1:3000/api/security/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to update 2FA configuration:', err);
    }
  };

  const handleUnlinkPhone = async () => {
    if (!window.confirm(lang === 'en' ? 'Are you sure you want to unlink your phone number?' : 'هل أنت متأكد من إلغاء ربط رقم الهاتف؟')) return;
    
    try {
      const res = await fetch('http://127.0.0.1:3000/api/security/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '', verified: false, requireCampaign2FA: false, requireApiKey2FA: false })
      });
      if (res.ok) {
        setSecurityPhone('');
        setSecurityVerified(false);
        setRequireCampaign2FA(false);
        setRequireApiKey2FA(false);
        setSecuritySuccess(lang === 'en' ? 'Phone unlinked.' : 'تم إلغاء ربط رقم الهاتف.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const translations = {
    en: {
      title: 'Security & Settings',
      subtitle: 'Manage account security, creative templates gallery, and system configurations.',
      smtpTab: 'SMTP Server Config',
      templatesTab: 'Creative Templates',
      systemTab: 'System & Configuration',
      hostLabel: 'SMTP Server Host',
      portLabel: 'SMTP Port',
      secureLabel: 'Use SSL/TLS (Port 465)',
      userLabel: 'SMTP Username (Email)',
      passLabel: 'SMTP Password / App Password',
      fromLabel: 'Default From Sender',
      saveBtn: 'Save Settings',
      testTitle: 'Verify SMTP Connection',
      testDesc: 'Send a test email to ensure your SMTP credentials work correctly.',
      testRecLabel: 'Recipient Email Address',
      testBtn: 'Test Connection & Send Email',
      guideTitle: 'SMTP Configuration Guide',
      guideText: 'Configure your SMTP credentials to enable delivery of real emails to user inboxes when triggered via the API Playground or your direct system integration.',
      successSave: 'SMTP configuration saved successfully.',
      successTest: 'Test email delivered successfully! Check your inbox.',
      errorFail: 'Operation failed. Please check server logs.',
      categoryEmail: 'Email Templates',
      categorySms: 'SMS Messages',
      categoryWa: 'WhatsApp Messages',
      loadBtn: 'Load in Playground',
      copyBtn: 'Copy Code',
      copiedAlert: 'Copied to clipboard!',
      subjectLabel: 'Subject line:',
      systemTitle: 'Sumer Send System Bridges',
      systemDesc: 'Explore active connections, delivery servers, and local Iraqi API gateways.',
      gatewayStatus: 'Gateway Service Connectivity',
      tariffTitle: 'Iraqi Local Rates & Tariff'
    },
    ar: {
      title: 'الأمان والإعدادات',
      subtitle: 'إدارة أمان الحساب، ومعرض القوالب الإبداعية، والتحقق من إعدادات النظام.',
      smtpTab: 'إعدادات SMTP',
      templatesTab: 'معرض القوالب الإبداعية',
      systemTab: 'النظام والتهيئة',
      hostLabel: 'عنوان خادم SMTP (Host)',
      portLabel: 'منفذ الاتصال (Port)',
      secureLabel: 'تفعيل التشفير SSL/TLS (المنفذ 465)',
      userLabel: 'اسم المستخدم للـ SMTP (البريد الإلكتروني)',
      passLabel: 'كلمة مرور الـ SMTP / رمز التطبيق (App Password)',
      fromLabel: 'اسم وصندوق بريد المرسل الافتراضي',
      saveBtn: 'حفظ الإعدادات',
      testTitle: 'اختبار خادم الإرسال',
      testDesc: 'أرسل رسالة تجريبية للتأكد من صحة بيانات الاتصال بالـ SMTP.',
      testRecLabel: 'البريد الإلكتروني للمستلم التجريبي',
      testBtn: 'فحص الاتصال وإرسال بريد تجريبي',
      guideTitle: 'دليل ربط وتكوين خوادم البريد SMTP',
      guideText: 'قم بتهيئة إعدادات الـ SMTP لتفعيل إرسال رسائل البريد الإلكتروني الحقيقية للمستخدمين عند تحفيز الـ API أو استخدام منصة الاختبار البرمجية.',
      successSave: 'تم حفظ إعدادات الـ SMTP بنجاح.',
      successTest: 'تم إرسال البريد التجريبي بنجاح! يرجى التحقق من صندوق الوارد.',
      errorFail: 'فشلت العملية. يرجى التحقق من صحة البيانات أو سجلات الخادم.',
      categoryEmail: 'قوالب البريد الإلكتروني',
      categorySms: 'رسائل الـ SMS القصيرة',
      categoryWa: 'رسائل الواتساب تفاعلية',
      loadBtn: 'تحميل في منصة الاختبار',
      copyBtn: 'نسخ الكود',
      copiedAlert: 'تم النسخ للحافظة!',
      subjectLabel: 'عنوان الرسالة:',
      systemTitle: 'بوابات اتصالات ومخدمات سومر سيند',
      systemDesc: 'استعراض البنية التحتية، بوابات الاتصال والتعريفة الخاصة بالشبكات العراقية المحلية.',
      gatewayStatus: 'حالة بوابات وقنوات الاتصال',
      tariffTitle: 'جدول الأسعار والتعرفة العراقية'
    }
  };

  const t = translations[lang];

  // Fetch current config on load
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        setHost(data.host || '');
        setPort(data.port ? data.port.toString() : '587');
        setSecure(!!data.secure);
        setUser(data.user || '');
        setFrom(data.from || '');
      })
      .catch(err => {
        console.error('Failed to connect to backend server:', err);
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    fetch('http://127.0.0.1:3000/api/smtp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        port,
        secure,
        user,
        pass: pass || undefined, // only send password if not empty
        from
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsSaving(false);
        if (data.success) {
          setStatusMsg({ type: 'success', text: t.successSave });
        } else {
          setStatusMsg({ type: 'error', text: data.error || t.errorFail });
        }
      })
      .catch(err => {
        console.error(err);
        setIsSaving(false);
        setStatusMsg({ type: 'error', text: lang === 'en' ? 'Could not connect to Sumer Send backend server.' : 'تعذر الاتصال بخادم سومر سيند الخلفي.' });
      });
  };

  const handleTestConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testRecipient) {
      setStatusMsg({ type: 'error', text: lang === 'en' ? 'Recipient email is required.' : 'يرجى إدخال البريد الإلكتروني للمستلم التجريبي.' });
      return;
    }

    setIsTesting(true);
    setStatusMsg(null);

    fetch('http://127.0.0.1:3000/api/smtp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        host,
        port,
        secure,
        user,
        pass,
        from,
        testRecipient
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => { throw new Error(err.error || t.errorFail); });
        }
        return res.json();
      })
      .then(data => {
        setIsTesting(false);
        if (data.success) {
          setStatusMsg({ type: 'success', text: t.successTest });
        }
        // Sync logs from server (test dispatch is saved in server logs)
        fetch('http://127.0.0.1:3000/api/logs')
          .then(res => res.json())
          .then(serverLogs => {
            if (Array.isArray(serverLogs)) {
              setLogs(serverLogs);
            }
          })
          .catch(err => console.error('Failed to sync logs:', err));
      })
      .catch(err => {
        setIsTesting(false);
        setStatusMsg({ type: 'error', text: err.message });
        
        // Sync logs from server (failed test dispatch is also saved in server logs)
        fetch('http://127.0.0.1:3000/api/logs')
          .then(res => res.json())
          .then(serverLogs => {
            if (Array.isArray(serverLogs)) {
              setLogs(serverLogs);
            }
          })
          .catch(syncErr => console.error('Failed to sync logs after test failure:', syncErr));
      });
  };

  // Copy template content
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Load template in playground and switch view
  const handleLoadTemplate = (template: TemplateItem) => {
    let compiledBody = template.body;
    let compiledSubject = lang === 'ar' ? (template.subjectAr || '') : (template.subjectEn || '');
    
    if (template.variables) {
      template.variables.forEach(v => {
        const defaultVal = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
        const val = previewVars[v.key] !== undefined && previewVars[v.key] !== ''
          ? previewVars[v.key] 
          : (defaultVal !== '' ? defaultVal : `{{${v.key}}}`);
        compiledBody = compiledBody.replaceAll(`{{${v.key}}}`, val);
        compiledSubject = compiledSubject.replaceAll(`{{${v.key}}}`, val);
      });
    }

    if (activeCategory === 'email') {
      setEmailSubject(compiledSubject || 'Welcome to Sumer Send!');
      setEmailBody(compiledBody);
    } else {
      setMsgBody(compiledBody);
    }
    setPlaygroundChannel(activeCategory);
    setCurrentTab('playground');
  };

  const getIframeSrcDoc = (bodyHtml: string) => {
    return `
      <!DOCTYPE html>
      <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              background-color: #ffffff;
              font-family: 'Cairo', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            }
            body {
              padding: 16px;
              box-sizing: border-box;
            }
            * {
              box-sizing: border-box;
            }
            img, table, td, div {
              max-width: 100% !important;
            }
            /* Clean custom scrollbar */
            ::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            ::-webkit-scrollbar-track {
              background: transparent;
            }
            ::-webkit-scrollbar-thumb {
              background: rgba(0,0,0,0.1);
              border-radius: 4px;
            }
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(0,0,0,0.2);
            }
          </style>
        </head>
        <body>
          <div style="width: 100%; display: flex; justify-content: center;">
            <div style="width: 100%; max-width: 100%;">
              ${bodyHtml}
            </div>
          </div>
        </body>
      </html>
    `;
  };

  // Find active template using merged list
  const mergedTemplatesList = getMergedTemplates();
  const selectedTemplate = mergedTemplatesList.find(temp => temp.id === selectedTemplateId) || mergedTemplatesList[0] || templatesDb[activeCategory][0];

  const compileTemplateWithDefaults = (template: TemplateItem) => {
    let body = template.body;
    let subject = lang === 'ar' ? (template.subjectAr || '') : (template.subjectEn || '');
    
    if (template.variables) {
      template.variables.forEach(v => {
        const defaultVal = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
        const val = previewVars[v.key] !== undefined && previewVars[v.key] !== ''
          ? previewVars[v.key] 
          : (defaultVal !== '' ? defaultVal : `{{${v.key}}}`);
        body = body.replaceAll(`{{${v.key}}}`, val);
        subject = subject.replaceAll(`{{${v.key}}}`, val);
      });
    }
    return { ...template, body, subjectAr: subject, subjectEn: subject };
  };

  const compiledSelectedTemplate = compileTemplateWithDefaults(selectedTemplate);

  return (
    <ScrollReveal>
      {(!controlledSubTab || ['security', 'templates', 'system'].includes(controlledSubTab)) && (
        <>
          {/* View Header */}
          <div style={{ marginBottom: '20px' }} className="flex-between">
            <div>
              <h1 style={{ 
                fontSize: '26px', 
                fontWeight: 800, 
                letterSpacing: lang === 'ar' ? '0' : '-0.5px', 
                lineHeight: 1.15,
                marginBottom: '6px',
                color: 'var(--text-primary)'
              }}>{t.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{t.subtitle}</p>
            </div>
          </div>

          {/* Main Sub-Tab Selectors */}
          <div className="vercel-tabs-container" style={{ overflowX: 'auto', marginBottom: '20px' }}>
            <button 
              onClick={() => {
                setActiveSubTab('security');
                setCurrentTab('security');
              }}
              className={`vercel-tab-btn ${activeSubTab === 'security' ? 'active' : ''}`}
            >
              <Shield size={15} />
              <span>{lang === 'en' ? 'Security & 2FA' : 'الأمان والتحقق ثنائي العامل'}</span>
            </button>
            <button 
              onClick={() => {
                setActiveSubTab('templates');
                setCurrentTab('templates');
              }}
              className={`vercel-tab-btn ${activeSubTab === 'templates' ? 'active' : ''}`}
            >
              <BookOpen size={15} />
              <span>{t.templatesTab}</span>
            </button>
            <button 
              onClick={() => {
                setActiveSubTab('system');
                setCurrentTab('system');
              }}
              className={`vercel-tab-btn ${activeSubTab === 'system' ? 'active' : ''}`}
            >
              <Info size={15} />
              <span>{t.systemTab}</span>
            </button>
          </div>
        </>
      )}

      {/* 1. SMTP TAB */}
      {activeSubTab === 'smtp' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px' }}>
            <button 
              type="button"
              className="btn" 
              style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }} 
              onClick={() => setShowGuide(!showGuide)}
            >
              <Info size={12} />
              <span>{showGuide ? (lang === 'en' ? 'Hide Guide' : 'إخفاء الدليل') : (lang === 'en' ? 'Show Guide' : 'عرض الدليل')}</span>
            </button>
          </div>
          {showGuide && (
            <BentoCard className="onboarding-split-card" style={{ minHeight: '260px', borderRadius: '16px', marginBottom: '20px', overflow: 'hidden' }}>
              {/* Left Info Column */}
              <div className="onboarding-split-info" style={{ padding: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{t.guideTitle}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500, margin: '0 0 16px 0', textAlign: 'start' }}>
                    {t.guideText}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="sumer-badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)', border: '1px solid var(--border-color)', padding: '3px 8px', fontSize: '11px' }}>
                    {lang === 'ar' ? 'المنفذ: 587 (TLS)' : 'Port: 587 (TLS)'}
                  </span>
                  <span className="sumer-badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--border-color)', padding: '3px 8px', fontSize: '11px' }}>
                    {lang === 'ar' ? 'التتشغيل: STARTTLS' : 'Encryption: STARTTLS'}
                  </span>
                </div>
              </div>

              {/* Right Visual Column */}
              <div className="onboarding-split-visual" style={{ padding: '20px' }}>
                <div className="mockup-floating-card" style={{ padding: '12px 16px', maxWidth: '240px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'بيانات اتصال SMTP' : 'SMTP Server Config'}
                    </span>
                    <span style={{ 
                      fontSize: '9px', 
                      fontWeight: 700,
                      color: 'var(--success-text)',
                      backgroundColor: 'var(--success-bg)',
                      padding: '1px 6px',
                      borderRadius: '4px'
                    }}>
                      {lang === 'ar' ? 'متصل' : 'Online'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الخادم:' : 'Server:'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>smtp.sumersend.com</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المنفذ:' : 'Port:'}</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'monospace' }}>587</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المستخدم:' : 'User:'}</span>
                      <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>mail@mystore.iq</span>
                    </div>
                  </div>
                </div>
              </div>
            </BentoCard>
          )}

          {statusMsg && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '6px', 
              fontSize: '13px', 
              marginBottom: '20px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: statusMsg.type === 'success' ? 'var(--success-color)' : 'var(--danger-color)',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
            }}>
              {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
            
            {/* SMTP form */}
            <div className="card" style={{ flex: 2, minWidth: '320px', padding: '24px' }}>
              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.hostLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.portLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="587"
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <input
                    type="checkbox"
                    id="secure-checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <label htmlFor="secure-checkbox" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {t.secureLabel}
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.userLabel}</label>
                    <input
                      type="email"
                      className="form-input"
                      value={user}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUser(val);
                        if (!from || from === user) {
                          setFrom(val);
                        }
                      }}
                      placeholder="username@gmail.com"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.passLabel}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder={pass ? '••••••••' : 'Enter SMTP password'}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">{t.fromLabel}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder='e.g. "Sumer Send" <onboarding@sumersend.com>'
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSaving}
                  style={{ width: '100%', opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer' }}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '6px', marginLeft: '6px' }}></span>
                      <span>{lang === 'en' ? 'Saving...' : 'جاري الحفظ...'}</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{t.saveBtn}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Test connection */}
            <div className="card" style={{ flex: 1, minWidth: '280px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <Shield size={22} color="var(--accent-color)" />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t.testTitle}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                {t.testDesc}
              </p>

              <form onSubmit={handleTestConnection}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label">{t.testRecLabel}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="recipient@gmail.com"
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn" 
                  disabled={isTesting}
                  style={{ width: '100%', opacity: isTesting ? 0.7 : 1, cursor: isTesting ? 'not-allowed' : 'pointer' }}
                >
                  {isTesting ? (
                    <>
                      <span className="spinner-icon" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid var(--text-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '6px', marginLeft: '6px' }}></span>
                      <span>{lang === 'en' ? 'Testing...' : 'جاري فحص الاتصال...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{t.testBtn}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1.5 WHATSAPP TAB */}
      {activeSubTab === 'whatsapp' && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div className="card" style={{ flex: 1, minWidth: '320px', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <Smartphone size={48} color={waStatus.connected ? 'var(--success-color)' : 'var(--text-muted)'} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
              {lang === 'en' ? 'WhatsApp Dispatcher' : 'خادم إرسال واتساب'}
            </h3>
            
            {waStatus.connected ? (
              <div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px', 
                  padding: '8px 16px', backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                  color: 'var(--success-color)', borderRadius: '20px', fontWeight: 600,
                  marginBottom: '24px'
                }}>
                  <CheckCircle size={16} />
                  <span>{lang === 'en' ? 'Connected & Ready' : 'متصل وجاهز للإرسال'}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                  {lang === 'en' 
                    ? 'Your WhatsApp account is securely connected via Baileys WebSocket. You can now dispatch real WhatsApp messages using the /v1/whatsapp endpoint or from the Playground.'
                    : 'حساب واتساب الخاص بك متصل بنجاح عبر Baileys WebSocket. يمكنك الآن إرسال رسائل حقيقية عبر مسار /v1/whatsapp أو منصة الاختبار.'}
                </p>
                <button 
                  className="btn btn-outline" 
                  onClick={handleWaLogout}
                  disabled={waLoading}
                  style={{ color: 'var(--danger-color)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  {waLoading ? '...' : (lang === 'en' ? 'Disconnect Session' : 'قطع الاتصال')}
                </button>
              </div>
            ) : (
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.6 }}>
                  {lang === 'en' 
                    ? 'To enable real WhatsApp messaging, scan the QR code below using your WhatsApp mobile app (Linked Devices).'
                    : 'لتفعيل إرسال رسائل واتساب حقيقية، قم بمسح الرمز (QR Code) أدناه باستخدام تطبيق واتساب على هاتفك (الأجهزة المرتبطة).'}
                </p>
                
                {waStatus.qr ? (
                  <div className="phone-mockup" style={{ marginBottom: '20px' }}>
                    <div className="mockup-phone-screen">
                      <div className="mockup-phone-notch"></div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
                        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px', marginBottom: '16px' }}>
                          {lang === 'en' ? 'Scan QR Code' : 'امسح الرمز'}
                        </span>
                        <div className="qr-pulse-overlay" style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #eaeaea', display: 'inline-block', overflow: 'hidden' }}>
                          <div className="qr-pulse-line"></div>
                          <img src={waStatus.qr} alt="WhatsApp QR Code" style={{ width: '180px', height: '180px', display: 'block' }} />
                        </div>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center', padding: '0 10px', lineHeight: 1.4 }}>
                          {lang === 'en' ? 'Open WhatsApp > Linked Devices > Link a Device' : 'افتح واتساب > الأجهزة المرتبطة > ربط جهاز'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '40px 20px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', marginBottom: '20px' }}>
                    <span className="spinner-icon" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--text-muted)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    <p style={{ marginTop: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {lang === 'en' ? 'Generating QR Code...' : 'جاري توليد رمز الاستجابة...'}
                    </p>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button 
                    className="btn btn-outline" 
                    onClick={fetchWaStatus}
                  >
                    {lang === 'en' ? 'Refresh Status' : 'تحديث الحالة'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="onboarding-split-card" style={{ flex: 1, minWidth: '320px', borderRadius: '16px', overflow: 'hidden' }}>
            {/* Left Info Column */}
            <div className="onboarding-split-info" style={{ padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Shield size={20} color="var(--accent-color)" />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{lang === 'en' ? 'Baileys WebSockets Engine' : 'محرك Baileys WebSockets'}</h3>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px', textAlign: 'start' }}>
                  {lang === 'en'
                    ? 'Sumer Send uses the lightweight Baileys library instead of Puppeteer. This connects directly to WhatsApp servers via WebSockets, using 90% less memory and providing instant dispatch speeds.'
                    : 'تستخدم سومر سيند مكتبة Baileys الخفيفة بدلاً من Puppeteer. هذا المحرك يتصل مباشرة بسيرفرات واتساب عبر الـ WebSockets مما يوفر 90% من استهلاك الذاكرة ويوفر سرعة إرسال لحظية.'}
                </p>
              </div>
              
              <div style={{ padding: '12px', backgroundColor: 'rgba(245, 158, 11, 0.08)', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'start' }}>
                  <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#b45309', margin: '0 0 2px 0' }}>{lang === 'en' ? 'Anti-Spam Warning' : 'تحذير مكافحة الاسبام'}</h4>
                    <p style={{ fontSize: '11px', color: '#92400e', margin: 0, lineHeight: 1.4 }}>
                      {lang === 'en'
                        ? 'Avoid sending bulk spam. Meta may ban numbers sending unsolicited links.'
                        : 'تجنب إرسال الرسائل المزعجة. قد تقوم Meta بحظر الأرقام التي ترسل روابط غير مرغوب فيها.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: WebSocket Memory Ticker */}
            <div className="onboarding-split-visual" style={{ padding: '20px' }}>
              <div className="mockup-floating-card" style={{ padding: '12px 16px', maxWidth: '240px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'أداء محرك الواتساب' : 'WhatsApp Engine Metrics'}
                  </span>
                  <span style={{ 
                    fontSize: '9px', 
                    fontWeight: 700,
                    color: 'var(--success-text)',
                    backgroundColor: 'var(--success-bg)',
                    padding: '1px 6px',
                    borderRadius: '4px'
                  }}>
                    {lang === 'ar' ? 'نشط' : 'Active'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'البروتوكول:' : 'Protocol:'}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>WebSockets (WS)</span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 600, marginBottom: '2px' }}>
                      <span>{lang === 'ar' ? 'استهلاك الذاكرة (Baileys):' : 'RAM usage (Baileys):'}</span>
                      <span className="tabular-nums-stat" style={{ color: 'var(--success-color)' }}>12 MB</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '10%', backgroundColor: 'var(--success-color)' }} />
                    </div>
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 600, marginBottom: '2px' }}>
                      <span>{lang === 'ar' ? 'استهلاك الذاكرة (Puppeteer):' : 'RAM usage (Puppeteer):'}</span>
                      <span className="tabular-nums-stat" style={{ color: 'var(--danger-color)' }}>120 MB</span>
                    </div>
                    <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--danger-color)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEMPLATES GALLERY TAB */}
      {activeSubTab === 'templates' && (
        isBuildingTemplate ? (
          <TemplateBuilder
            lang={lang}
            template={editingTemplate}
            initialCategory={activeCategory}
            onSave={handleSaveCustomTemplate}
            onCancel={() => {
              setIsBuildingTemplate(false);
              setEditingTemplate(null);
            }}
          />
        ) : (
          (() => {
            const mergedTemplates = getMergedTemplates();
            return (
              <div>
                {/* Category Selectors */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                  <div style={{ 
                    display: 'flex', 
                    gap: '4px',
                    padding: '4px',
                    backgroundColor: 'var(--panel-muted)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <button 
                      onClick={() => setActiveCategory('email')}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '13px', 
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: activeCategory === 'email' ? 'var(--panel-bg)' : 'transparent',
                        color: activeCategory === 'email' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: activeCategory === 'email' ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeCategory === 'email' ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Mail size={14} />
                      <span>{t.categoryEmail}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCategory('sms')}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '13px', 
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: activeCategory === 'sms' ? 'var(--panel-bg)' : 'transparent',
                        color: activeCategory === 'sms' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: activeCategory === 'sms' ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeCategory === 'sms' ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <Phone size={14} />
                      <span>{t.categorySms}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCategory('whatsapp')}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '13px', 
                        padding: '6px 16px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: activeCategory === 'whatsapp' ? 'var(--panel-bg)' : 'transparent',
                        color: activeCategory === 'whatsapp' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: activeCategory === 'whatsapp' ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: activeCategory === 'whatsapp' ? '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)' : 'none'
                      }}
                    >
                      <MessageSquare size={14} />
                      <span>{t.categoryWa}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setEditingTemplate(null); setIsBuildingTemplate(true); }}
                    className="btn"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '13px', 
                      padding: '8px 16px', 
                      fontWeight: 650,
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-color)',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Plus size={14} />
                    <span>{lang === 'ar' ? 'إنشاء قالب مخصص' : 'Create Custom Template'}</span>
                  </button>
                </div>

                <div className="templates-grid">
                  
                  {/* Left side list of templates */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Search Input Box */}
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'ar' ? 'البحث عن قالب...' : 'Search templates...'}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          paddingRight: lang === 'ar' ? '12px' : '32px',
                          paddingLeft: lang === 'ar' ? '32px' : '12px',
                          fontSize: '13px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--panel-muted)',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          transition: 'all 0.15s ease'
                        }}
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            left: lang === 'ar' ? '10px' : 'auto',
                            right: lang === 'ar' ? 'auto' : '10px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            padding: '4px'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Templates Scrollable List */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '10px',
                      maxHeight: '560px',
                      overflowY: 'auto',
                      paddingRight: lang === 'en' ? '4px' : '0',
                      paddingLeft: lang === 'ar' ? '4px' : '0',
                    }}>
                      {(() => {
                        const filteredTemplates = mergedTemplates.filter(temp => {
                          const name = lang === 'ar' ? temp.nameAr : temp.nameEn;
                          const desc = lang === 'ar' ? temp.descAr : temp.descEn;
                          const query = searchQuery.toLowerCase().trim();
                          return (
                            name.toLowerCase().includes(query) ||
                            desc.toLowerCase().includes(query) ||
                            temp.id.toLowerCase().includes(query)
                          );
                        });

                        if (filteredTemplates.length === 0) {
                          return (
                            <div style={{ padding: '30px 15px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                              <span style={{ fontSize: '12.5px' }}>
                                {lang === 'ar' ? 'لا توجد قوالب تطابق بحثك' : 'No templates match your search'}
                              </span>
                            </div>
                          );
                        }

                        return filteredTemplates.map((temp) => {
                          const isCustom = customTemplates.some(ct => ct.id === temp.id);
                          const isActive = selectedTemplateId === temp.id;
                          return (
                            <div 
                              key={temp.id}
                              onClick={() => setSelectedTemplateId(temp.id)}
                              style={{
                                padding: '14px 16px',
                                borderRadius: '8px',
                                border: `1px solid ${isActive ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                backgroundColor: isActive 
                                  ? 'var(--panel-muted)' 
                                  : 'var(--panel-bg)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'all 0.15s ease',
                                boxShadow: isActive ? '0 0 0 1px var(--accent-color), 0 2px 8px rgba(0, 0, 0, 0.02)' : 'none',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', gap: '10px' }}>
                                <h4 style={{ fontSize: '13px', fontWeight: 650, margin: 0, color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                  {lang === 'ar' ? temp.nameAr : temp.nameEn}
                                </h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  {isCustom ? (
                                    <span style={{
                                      fontSize: '9px',
                                      fontWeight: 600,
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      backgroundColor: 'rgba(var(--accent-rgb), 0.08)',
                                      border: '1px solid rgba(var(--accent-rgb), 0.15)',
                                      color: 'var(--accent-color)',
                                      display: 'inline-block',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {lang === 'ar' ? 'مخصص' : 'Custom'}
                                    </span>
                                  ) : (
                                    <span style={{
                                      fontSize: '9px',
                                      fontWeight: 600,
                                      padding: '1px 5px',
                                      borderRadius: '4px',
                                      backgroundColor: 'var(--panel-muted)',
                                      border: '1px solid var(--border-color)',
                                      color: 'var(--text-muted)',
                                      display: 'inline-block',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {lang === 'ar' ? 'افتراضي' : 'System'}
                                    </span>
                                  )}
                                  {isCustom && isActive && (
                                    <div style={{ display: 'flex', gap: '4px', marginLeft: '4px', marginRight: '4px' }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setEditingTemplate(temp);
                                          setIsBuildingTemplate(true);
                                        }}
                                        className="btn"
                                        style={{ padding: '2px 4px', fontSize: '10px', display: 'flex', alignItems: 'center', border: 'none', background: 'none', color: 'var(--accent-color)', cursor: 'pointer' }}
                                        title={lang === 'ar' ? 'تعديل' : 'Edit'}
                                      >
                                        {lang === 'ar' ? 'تعديل' : 'Edit'}
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteTemplate(temp.id, e);
                                        }}
                                        className="btn"
                                        style={{ padding: '2px 4px', fontSize: '10px', display: 'flex', alignItems: 'center', border: 'none', background: 'none', color: 'var(--danger-color)', cursor: 'pointer' }}
                                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                                      >
                                        <Trash2 size={10} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                                {lang === 'ar' ? temp.descAr : temp.descEn}
                              </p>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Right side live preview pane */}
                  <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FileText size={18} color="var(--accent-color)" />
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                            {lang === 'ar' ? selectedTemplate.nameAr : selectedTemplate.nameEn}
                          </h3>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {selectedTemplate.id}</span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {customTemplates.some(ct => ct.id === selectedTemplate.id) && (
                          <>
                            <button
                              onClick={() => { setEditingTemplate(selectedTemplate); setIsBuildingTemplate(true); }}
                              className="btn"
                              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>{lang === 'ar' ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteTemplate(selectedTemplate.id, e)}
                              className="btn"
                              style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger-color)' }}
                            >
                              <span>{lang === 'ar' ? 'حذف' : 'Delete'}</span>
                            </button>
                          </>
                        )}
                        <button 
                          onClick={() => handleCopy(selectedTemplate.body, selectedTemplate.id)}
                          className="btn"
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          {copiedId === selectedTemplate.id ? <Check size={14} color="var(--success-color)" /> : <Copy size={14} />}
                          <span>{copiedId === selectedTemplate.id ? t.copiedAlert : t.copyBtn}</span>
                        </button>
                        <button 
                          onClick={() => handleLoadTemplate(selectedTemplate)}
                          className="btn btn-primary"
                          style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <ExternalLink size={14} />
                          <span>{t.loadBtn}</span>
                        </button>
                      </div>
                    </div>

                    {/* Subject display for email */}
                    {activeCategory === 'email' && compiledSelectedTemplate.subjectAr && (
                      <div style={{ 
                        padding: '10px 14px', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '6px', 
                        backgroundColor: 'var(--bg-color)', 
                        fontSize: '13px', 
                        marginBottom: '15px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <strong style={{ color: 'var(--text-secondary)' }}>{t.subjectLabel}</strong>
                        <span>{lang === 'ar' ? compiledSelectedTemplate.subjectAr : compiledSelectedTemplate.subjectEn}</span>
                      </div>
                    )}

                    {/* Device Selector Switcher for Email Templates */}
                    {activeCategory === 'email' && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '4px', 
                        marginBottom: '15px',
                        backgroundColor: 'var(--bg-color)',
                        padding: '4px',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        alignSelf: 'flex-start'
                      }}>
                        <button 
                          type="button"
                          onClick={() => setPreviewDevice('desktop')}
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: previewDevice === 'desktop' ? 'var(--panel-bg)' : 'transparent',
                            color: previewDevice === 'desktop' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: previewDevice === 'desktop' ? '600' : 'normal',
                            boxShadow: previewDevice === 'desktop' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Monitor size={14} />
                          <span>{lang === 'en' ? 'Desktop' : 'حاسوب'}</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setPreviewDevice('mobile')}
                          className="btn"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: 'pointer',
                            backgroundColor: previewDevice === 'mobile' ? 'var(--panel-bg)' : 'transparent',
                            color: previewDevice === 'mobile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                            fontWeight: previewDevice === 'mobile' ? '600' : 'normal',
                            boxShadow: previewDevice === 'mobile' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Smartphone size={14} />
                          <span>{lang === 'en' ? 'Mobile' : 'هاتف'}</span>
                        </button>
                      </div>
                    )}

                    {/* Dynamic Variables Playground Form */}
                    {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                      <div style={{ 
                        marginBottom: '20px', 
                        padding: '16px', 
                        borderRadius: '8px', 
                        border: '1px dashed var(--border-color)',
                        backgroundColor: 'var(--panel-muted)',
                        direction: lang === 'ar' ? 'rtl' : 'ltr'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                          <Sliders size={14} color="var(--accent-color)" />
                          <h4 style={{ fontSize: '13px', fontWeight: 650, margin: 0, color: 'var(--text-primary)' }}>
                            {lang === 'ar' ? 'تعديل متغيرات المعاينة التفاعلية' : 'Interactive Preview Variables'}
                          </h4>
                        </div>
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
                          gap: '12px' 
                        }}>
                          {selectedTemplate.variables.map(v => (
                            <div key={v.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, textAlign: lang === 'ar' ? 'right' : 'left' }}>
                                {lang === 'ar' ? v.labelAr : v.labelEn}
                                <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginLeft: '4px', marginRight: '4px', fontFamily: 'monospace' }}>
                                  ({`{{${v.key}}}`})
                                </span>
                              </label>
                              <input 
                                type="text"
                                value={previewVars[v.key] || ''}
                                onChange={(e) => {
                                  setPreviewVars(prev => ({
                                    ...prev,
                                    [v.key]: e.target.value
                                  }));
                                }}
                                className="input"
                                style={{ 
                                  padding: '6px 10px', 
                                  fontSize: '12px', 
                                  borderRadius: '5px',
                                  border: '1px solid var(--border-color)',
                                  backgroundColor: 'var(--panel-bg)',
                                  color: 'var(--text-primary)',
                                  width: '100%',
                                  boxSizing: 'border-box'
                                }}
                                placeholder={lang === 'ar' ? v.defaultValAr : v.defaultValEn}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preview Window Box */}
                    <div style={{ 
                      flex: 1, 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '8px', 
                      backgroundColor: activeCategory === 'email' ? '#f4f4f5' : '#efeae2', 
                      padding: activeCategory === 'email' ? '20px' : '30px', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: activeCategory === 'email' ? 'flex-start' : 'center',
                      overflow: 'auto',
                      transition: 'all 0.3s ease'
                    }}>
                      {activeCategory === 'email' ? (
                        previewDevice === 'mobile' ? (
                          <div style={{
                            width: '320px',
                            height: '500px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
                            borderRadius: '36px',
                            border: '12px solid #18181b',
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                          }}>
                            {/* Dynamic Island / Notch */}
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '74px',
                              height: '18px',
                              borderRadius: '9px',
                              backgroundColor: '#000',
                              zIndex: 100
                            }} />

                            {/* Status Bar */}
                            <div style={{
                              height: '30px',
                              padding: lang === 'ar' ? '0 12px 0 20px' : '0 20px 0 12px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '10px',
                              fontWeight: '600',
                              color: '#000',
                              backgroundColor: '#ffffff',
                              borderBottom: '1px solid #f4f4f5',
                              zIndex: 90,
                              userSelect: 'none'
                            }}>
                              <span>9:41 AM</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ fontSize: '9px' }}>📶</span>
                                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>🔋</span>
                              </div>
                            </div>

                            {/* Phone Screen Frame Content */}
                            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                              <iframe
                                srcDoc={getIframeSrcDoc(compiledSelectedTemplate.body)}
                                title="Template HTML Preview"
                                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                              />
                            </div>

                            {/* Home Indicator */}
                            <div style={{
                              position: 'absolute',
                              bottom: '5px',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '100px',
                              height: '4px',
                              borderRadius: '2px',
                              backgroundColor: '#888',
                              zIndex: 100
                            }} />
                          </div>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '500px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                          }}>
                            {/* Browser Mockup Top bar */}
                            <div style={{
                              height: '36px',
                              backgroundColor: 'var(--panel-muted)',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 12px',
                              gap: '12px',
                              userSelect: 'none'
                            }}>
                              {/* Window Controls */}
                              <div style={{ display: 'flex', gap: '5px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                              </div>

                              {/* Address bar */}
                              <div style={{
                                backgroundColor: 'var(--panel-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '5px',
                                padding: '3px 10px',
                                fontSize: '10px',
                                color: 'var(--text-secondary)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                flex: 1,
                                maxWidth: '380px',
                                margin: '0 auto',
                                justifyContent: 'center'
                              }}>
                                <span style={{ fontSize: '9px' }}>🔒</span>
                                <span>sumersend.com/templates/preview/{selectedTemplateId}</span>
                              </div>

                              {/* Spacer for centering */}
                              <div style={{ width: '38px' }} />
                            </div>

                            {/* Browser Mockup Content */}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <iframe
                                srcDoc={getIframeSrcDoc(compiledSelectedTemplate.body)}
                                title="Template HTML Preview"
                                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                              />
                            </div>
                          </div>
                        )
                      ) : activeCategory === 'whatsapp' ? (
                        <div style={{
                          width: '320px',
                          height: '500px',
                          backgroundColor: 'var(--bg-color)',
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
                          borderRadius: '36px',
                          border: '12px solid var(--text-primary)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }}>
                          {/* Dynamic Island / Notch */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '74px',
                            height: '18px',
                            borderRadius: '9px',
                            backgroundColor: '#000',
                            zIndex: 100
                          }} />

                          {/* Status Bar */}
                          <div style={{
                            height: '30px',
                            padding: lang === 'ar' ? '0 12px 0 20px' : '0 20px 0 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--panel-bg)',
                            borderBottom: '1px solid var(--border-color)',
                            zIndex: 90,
                            userSelect: 'none'
                          }}>
                            <span>9:41 AM</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px' }}>📶</span>
                              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>🔋</span>
                            </div>
                          </div>

                          {/* WhatsApp Chat Header */}
                          <div style={{
                            height: '48px',
                            backgroundColor: 'var(--panel-muted)',
                            borderBottom: '1px solid var(--border-color)',
                            padding: '0 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            <div style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor: '#25d366',
                              color: '#ffffff',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                              S
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                              <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-primary)' }}>Sumer Send API</span>
                              <span style={{ fontSize: '8px', color: 'var(--text-muted)' }}>
                                {lang === 'ar' ? 'حساب تجاري رسمي' : 'Official Business Account'}
                              </span>
                            </div>
                          </div>

                          {/* WhatsApp Chat Body */}
                          <div style={{
                            flex: 1,
                            backgroundColor: 'var(--panel-muted)',
                            backgroundImage: 'radial-gradient(rgba(0,0,0,0.03) 1px, transparent 0)',
                            backgroundSize: '16px 16px',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            overflowY: 'auto',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            <div style={{
                              alignSelf: lang === 'ar' ? 'flex-start' : 'flex-end',
                              backgroundColor: 'var(--panel-bg)',
                              color: 'var(--text-primary)',
                              borderRadius: '8px',
                              padding: '8px 12px',
                              maxWidth: '85%',
                              boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
                              position: 'relative',
                              fontSize: '12.5px',
                              lineHeight: 1.4,
                              textAlign: lang === 'ar' ? 'right' : 'left',
                              whiteSpace: 'pre-line'
                            }}>
                              {compiledSelectedTemplate.body}
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                alignItems: 'center', 
                                gap: '3px',
                                fontSize: '8px', 
                                color: 'var(--text-muted)', 
                                marginTop: '4px',
                                textAlign: 'left'
                              }}>
                                <span>13:09 PM</span>
                                <span style={{ color: '#53bdeb' }}>✓✓</span>
                              </div>
                            </div>
                          </div>

                          {/* Mock WhatsApp input bar */}
                          <div style={{
                            height: '44px',
                            backgroundColor: 'var(--panel-muted)',
                            padding: '6px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderTop: '1px solid var(--border-color)',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            <div style={{
                              flex: 1,
                              backgroundColor: 'var(--panel-bg)',
                              borderRadius: '16px',
                              height: '100%',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 12px',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              textAlign: lang === 'ar' ? 'right' : 'left'
                            }}>
                              {lang === 'ar' ? 'كتابة رسالة...' : 'Type a message...'}
                            </div>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              backgroundColor: '#075e54',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#ffffff',
                              fontSize: '10px'
                            }}>
                              🎤
                            </div>
                          </div>

                          {/* Home Indicator */}
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100px',
                            height: '4px',
                            borderRadius: '2px',
                            backgroundColor: '#888',
                            zIndex: 100
                          }} />
                        </div>
                      ) : (
                        <div style={{
                          width: '320px',
                          height: '500px',
                          backgroundColor: 'var(--bg-color)',
                          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.2)',
                          borderRadius: '36px',
                          border: '12px solid var(--text-primary)',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease'
                        }}>
                          {/* Dynamic Island / Notch */}
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '74px',
                            height: '18px',
                            borderRadius: '9px',
                            backgroundColor: '#000',
                            zIndex: 100
                          }} />

                          {/* Status Bar */}
                          <div style={{
                            height: '30px',
                            padding: lang === 'ar' ? '0 12px 0 20px' : '0 20px 0 12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '10px',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            backgroundColor: 'var(--panel-bg)',
                            borderBottom: '1px solid var(--border-color)',
                            zIndex: 90,
                            userSelect: 'none'
                          }}>
                            <span>9:41 AM</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px' }}>📶</span>
                              <span style={{ fontSize: '10px', fontWeight: 'bold' }}>🔋</span>
                            </div>
                          </div>

                          {/* SMS Chat Header */}
                          <div style={{
                            height: '55px',
                            backgroundColor: 'var(--panel-muted)',
                            borderBottom: '1px solid var(--border-color)',
                            padding: '6px 12px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px'
                          }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--border-color)',
                              color: 'var(--text-secondary)',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                            }}>
                              💬
                            </div>
                            <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              Sumer Send
                            </span>
                          </div>

                          {/* SMS Chat Body */}
                          <div style={{
                            flex: 1,
                            backgroundColor: 'var(--bg-color)',
                            padding: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            overflowY: 'auto',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            <div style={{
                              alignSelf: lang === 'ar' ? 'flex-start' : 'flex-end',
                              backgroundColor: 'var(--panel-muted)',
                              color: 'var(--text-primary)',
                              borderRadius: '16px',
                              padding: '10px 16px',
                              maxWidth: '80%',
                              fontSize: '13px',
                              lineHeight: 1.4,
                              position: 'relative',
                              textAlign: lang === 'ar' ? 'right' : 'left',
                              whiteSpace: 'pre-line',
                              borderBottomLeftRadius: lang === 'ar' ? '4px' : '16px',
                              borderBottomRightRadius: lang === 'ar' ? '16px' : '4px'
                            }}>
                              {compiledSelectedTemplate.body}
                            </div>
                            <span style={{ 
                              alignSelf: lang === 'ar' ? 'flex-start' : 'flex-end',
                              fontSize: '9px', 
                              color: 'var(--text-muted)',
                              marginTop: '6px',
                              marginRight: lang === 'ar' ? '8px' : '0',
                              marginLeft: lang === 'ar' ? '0' : '8px'
                            }}>
                              {lang === 'ar' ? 'رسالة نصية • ١٣:٠٩' : 'Text Message • 13:09'}
                            </span>
                          </div>

                          {/* Mock SMS input bar */}
                          <div style={{
                            height: '48px',
                            backgroundColor: 'var(--panel-muted)',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderTop: '1px solid var(--border-color)',
                            direction: lang === 'ar' ? 'rtl' : 'ltr'
                          }}>
                            <div style={{
                              flex: 1,
                              backgroundColor: 'var(--panel-bg)',
                              borderRadius: '18px',
                              height: '100%',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 12px',
                              fontSize: '11px',
                              color: 'var(--text-muted)',
                              textAlign: lang === 'ar' ? 'right' : 'left'
                            }}>
                              {lang === 'ar' ? 'إرسال رسالة iMessage...' : 'iMessage'}
                            </div>
                          </div>

                          {/* Home Indicator */}
                          <div style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '100px',
                            height: '4px',
                            borderRadius: '2px',
                            backgroundColor: '#888',
                            zIndex: 100
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()
        )
      )}



      {/* 3. SYSTEM & SERVICES TAB */}
      {activeSubTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Architecture / flow overview */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 750, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-color)" />
              <span>{lang === 'ar' ? 'البنية التحتية وهندسة الإرسال' : 'Sumer Send Infrastructure Architecture'}</span>
            </h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {lang === 'ar' 
                ? 'تعتمد المنصة على موزع بريد خلفي (Local SMTP Dispatcher) لإرسال رسائل الإيميل الحقيقية مباشرة إلى صندوق البريد الوارد للمستخدمين، وتتكامل برمجياً عبر بوابات الـ API المحلية لشبكات الجيل الرابع في العراق لإيصال رسائل الهاتف المحمول الفورية بمرونة تامة.' 
                : 'Sumer Send triggers SMTP servers running in the background to forward actual transactional mails, and hooks directly into localized 4G telecom network aggregators inside Iraq for rapid SMS & WhatsApp notification updates.'}
            </p>

            {/* Simulated diagram */}
            <div style={{ 
              backgroundColor: 'var(--bg-color)', 
              borderRadius: '8px', 
              padding: '25px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              gap: '15px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ padding: '10px 14px', border: '1px solid var(--text-primary)', borderRadius: '6px', backgroundColor: 'var(--panel-bg)', fontSize: '12px', fontWeight: 'bold' }}>
                SDK / API Calls
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              
              <div style={{ padding: '10px 14px', border: '1px solid var(--accent-color)', borderRadius: '6px', backgroundColor: 'var(--panel-bg)', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-color)', textAlign: 'center' }}>
                Sumer Send Gateways<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>Region: Baghdad</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <Mail size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>SMTP Server (Node / Port 3000)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <MessageSquare size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>Zain Cash & SMS Aggregator</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <Smartphone size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>Asiacell / Korek Mobile Bridge</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* Status indicators */}
            <div className="card" style={{ flex: 1, minWidth: '300px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>{t.gatewayStatus}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SMTP Mail Engine (Port 3000)</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل ونشط' : 'Online & Active'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Zain Iraq SMS Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Asiacell Iraq Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Korek Telecom Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>WhatsApp Cloud (Basra Hub)</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل ونشط' : 'Online & Active'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Zain Cash API Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rates & pricing */}
            <div className="card" style={{ flex: 1, minWidth: '300px', padding: '24px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>{t.tariffTitle}</h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: lang === 'ar' ? 'right' : 'left', paddingBottom: '8px' }}>
                      {lang === 'ar' ? 'الخدمة / القناة' : 'Service / Channel'}
                    </th>
                    <th style={{ textAlign: lang === 'ar' ? 'left' : 'right', paddingBottom: '8px' }}>
                      {lang === 'ar' ? 'التعرفة والرسوم' : 'Tariff Cost'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'البريد الإلكتروني (Email API)' : 'Email API Delivery'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--accent-color)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      10 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'رسائل الجوال القصيرة (SMS Gateway)' : 'Local SMS Delivery'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--success-text)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      120 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'رسائل الواتساب للشركات (WhatsApp)' : 'WhatsApp Messaging'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--warning-text)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      150 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {lang === 'ar'
                  ? '* تعتمد الفوترة والخصم الفعلي من رصيد المحفظة بالعملة المحلية مباشرة (الـ دينار عراقي IQD).'
                  : '* Billing is calculated and deducted in real-time in Iraqi Dinar (IQD) from your linked wallet balance.'}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Security Overview Header */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 750, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} color="var(--accent-color)" />
              <span>{lang === 'ar' ? 'إعدادات الحماية والتحقق ثنائي العامل (2FA)' : 'Security & 2FA Configuration'}</span>
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {lang === 'ar'
                ? 'اربط رقم هاتفك المحمول لتأمين حساب المطور الخاص بك. يتيح لك التحقق الثنائي (2FA) فرض تأكيد فوري بالرمز قبل تنفيذ العمليات الحساسة مثل إطلاق الحملات الجماعية أو إصدار رموز API جديدة.'
                : 'Link your mobile phone number to secure your developer account. Enforcing 2FA requires entering an SMS-delivered verification code before performing critical actions like launching bulk campaigns or creating new API keys.'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '25px' }}>
            {/* Phone Linking Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                {lang === 'ar' ? 'ربط وتأكيد رقم الهاتف' : 'Link & Verify Mobile Number'}
              </h4>

              {securityError && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={14} />
                  <span>{securityError}</span>
                </div>
              )}

              {securitySuccess && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: 'rgba(76,217,100,0.1)', color: '#4cd964', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle size={14} />
                  <span>{securitySuccess}</span>
                </div>
              )}

              {securityVerified ? (
                /* VERIFIED STATE */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', backgroundColor: 'rgba(76,217,100,0.05)', border: '1px solid rgba(76,217,100,0.2)', borderRadius: '6px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(76,217,100,0.1)', color: '#4cd964', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={18} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'رقم الهاتف الموثق' : 'Verified Phone Number'}
                      </span>
                      <h5 style={{ fontSize: '15px', fontWeight: 700, margin: '2px 0 0 0', direction: 'ltr', textAlign: 'left' }}>
                        {securityPhone}
                      </h5>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="btn"
                    onClick={handleUnlinkPhone}
                    style={{ borderColor: 'var(--danger-text)', color: 'var(--danger-text)', width: '100%', fontSize: '13px', padding: '8px', fontWeight: 600 }}
                  >
                    {lang === 'ar' ? 'إلغاء ربط رقم الهاتف' : 'Unlink Phone Number'}
                  </button>
                </div>
              ) : (
                /* UNVERIFIED STATE / FLOW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                      {lang === 'ar' ? 'رقم الهاتف العراقي (آسيا سيل، زين، كورك)' : 'Iraqi Mobile Number (AsiaCell, Zain, Korek)'}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 07801234567"
                        value={securityPhone}
                        onChange={(e) => setSecurityPhone(e.target.value)}
                        disabled={isVerifyingOtp}
                        style={{ height: '38px', direction: 'ltr', textAlign: 'left' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSendSecurityOtp}
                        disabled={countdown > 0}
                        style={{ fontSize: '12px', whiteSpace: 'nowrap', padding: '0 12px' }}
                      >
                        {countdown > 0 
                          ? `${countdown}s` 
                          : (lang === 'ar' ? 'إرسال الرمز' : 'Send Code')}
                      </button>
                    </div>
                  </div>

                  {isVerifyingOtp && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: '6px', display: 'block' }}>
                          {lang === 'ar' ? 'رمز التحقق (OTP) المكون من 6 أرقام' : '6-Digit Verification Code (OTP)'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-input"
                            maxLength={6}
                            placeholder="••••••"
                            value={securityOtp}
                            onChange={(e) => setSecurityOtp(e.target.value)}
                            style={{ height: '38px', letterSpacing: '6px', fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleConfirmSecurityOtp}
                            style={{ fontSize: '12px', padding: '0 16px' }}
                          >
                            {lang === 'ar' ? 'تأكيد' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                      <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {lang === 'ar'
                          ? '💡 تنويه: يظهر رمز الرمز المرسل كإشعار رسالة نصية فورية في الهاتف الافتراضي المحاكي على الجانب الأيمن من الشاشة.'
                          : '💡 Tip: The verification code will appear as a simulated lockscreen SMS notification on the right-side phone mockup.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2FA Policies Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                {lang === 'ar' ? 'سياسة الحماية والتحقق الثنائي' : '2FA Verification Security Policies'}
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Policy 1: Campaign Launch */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'فرض التحقق عند إطلاق الحملات الإعلانية' : 'Require 2FA for Campaign Launches'}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: 1.4 }}>
                      {lang === 'ar'
                        ? 'إرسال رمز تحقق وتأكيده قبل بث وتوصيل الحملات الدعائية الجماعية.'
                        : 'Sends an SMS OTP code which must be verified before launching any bulk campaigns.'}
                    </span>
                  </div>
                  <label className="switch-control" style={{ marginTop: '4px', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={requireCampaign2FA}
                      disabled={!securityVerified}
                      onChange={(e) => handleToggle2FA('campaign', e.target.checked)}
                    />
                    <span className="switch-slider" style={{ cursor: securityVerified ? 'pointer' : 'not-allowed' }}></span>
                  </label>
                </div>

                {/* Policy 2: API Keys creation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'فرض التحقق عند إنشاء مفاتيح الـ API' : 'Require 2FA for API Key Generation'}
                    </strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px', lineHeight: 1.4 }}>
                      {lang === 'ar'
                        ? 'حماية مفاتيح البرمجة والتوكن بطلب تأكيد الموبايل عند إصدار أي مفتاح جديد.'
                        : 'Demands OTP verification on your mobile before exposing new API authorization keys.'}
                    </span>
                  </div>
                  <label className="switch-control" style={{ marginTop: '4px', flexShrink: 0 }}>
                    <input
                      type="checkbox"
                      checked={requireApiKey2FA}
                      disabled={!securityVerified}
                      onChange={(e) => handleToggle2FA('apikey', e.target.checked)}
                    />
                    <span className="switch-slider" style={{ cursor: securityVerified ? 'pointer' : 'not-allowed' }}></span>
                  </label>
                </div>
              </div>

              {!securityVerified && (
                <div style={{ padding: '10px 12px', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Info size={14} />
                  <span>
                    {lang === 'ar'
                      ? 'يرجى تأكيد رقم هاتفك أولاً لتفعيل خيارات التحقق الثنائي.'
                      : 'Please verify your phone number first to unlock 2FA toggle options.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};
