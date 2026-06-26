

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
  theme?: 'light' | 'dark';
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
  theme,
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
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('welcome_onboarding');
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    fetch('http://127.0.0.1:3000/api/smtp/config', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        setHost(data.host || '');
        setPort(data.port ? data.port.toString() : '587');
        setSecure(!!data.secure);
        setUser(data.user || '');
        setFrom(data.from || '');
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('Failed to connect to backend server:', err);
      });
    return () => { clearTimeout(timeoutId); controller.abort(); };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch('http://127.0.0.1:3000/api/smtp/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        host,
        port,
        secure,
        user,
        pass: pass || undefined, // only send password if not empty
        from
      })
    })
      .then(res => { clearTimeout(timeoutId); return res.json(); })
      .then(data => {
        setIsSaving(false);
        if (data.success) {
          setStatusMsg({ type: 'success', text: t.successSave });
        } else {
          setStatusMsg({ type: 'error', text: data.error || t.errorFail });
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error(err);
        setIsSaving(false);
        if (err.name === 'AbortError') {
          setStatusMsg({ type: 'error', text: lang === 'ar' ? 'انتهت مهلة الاتصال بالخادم الخلفي. تأكد من تشغيله.' : 'Backend server connection timed out. Ensure it is running.' });
        } else {
          setStatusMsg({ type: 'error', text: lang === 'en' ? 'Could not connect to Sumer Send backend server.' : 'تعذر الاتصال بخادم سومر سيند الخلفي.' });
        }
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    fetch('http://127.0.0.1:3000/api/smtp/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
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
        clearTimeout(timeoutId);
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
        clearTimeout(timeoutId);
        setIsTesting(false);
        if (err.name === 'AbortError') {
          setStatusMsg({ type: 'error', text: lang === 'ar' 
            ? 'انتهت مهلة الاتصال. تأكد من تشغيل الخادم الخلفي محلياً (node server/index.js) أو تحقق من إعدادات SMTP.' 
            : 'Connection timed out. Ensure the backend server is running locally (node server/index.js) or verify your SMTP settings.' });
        } else {
          setStatusMsg({ type: 'error', text: err.message || (lang === 'ar' ? 'تعذر الاتصال بالخادم الخلفي.' : 'Could not connect to the backend server.') });
        }
        
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
        const escapeKey = v.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const tagRegex = new RegExp(`\\{\\{\\s*${escapeKey}\\s*\\}\\}`, 'g');
        compiledBody = compiledBody.replace(tagRegex, val);
        compiledSubject = compiledSubject.replace(tagRegex, val);
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
        const escapeKey = v.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const tagRegex = new RegExp(`\\{\\{\\s*${escapeKey}\\s*\\}\\}`, 'g');
        body = body.replace(tagRegex, val);
        subject = subject.replace(tagRegex, val);
      });
    }
    return { ...template, body, subjectAr: subject, subjectEn: subject };
  };

  const compiledSelectedTemplate = compileTemplateWithDefaults(selectedTemplate);

  return (
    <ScrollReveal>


      {/* 1. SMTP TAB */}
      {activeSubTab === 'smtp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>



          {statusMsg && (
            <div style={{ 
              padding: '14px 18px', 
              borderRadius: '12px', 
              fontSize: '13px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px', 
              backgroundColor: statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(239, 68, 68, 0.06)',
              color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${statusMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}`
            }}>
              {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* SMTP form */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                  <Settings size={16} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'بيانات اتصال الخادم' : 'Server Credentials'}
                </h3>
              </div>

              <form onSubmit={handleSave}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.hostLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      placeholder="e.g. smtp.gmail.com"
                      required
                      style={{ borderRadius: '10px', height: '40px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.portLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="587"
                      required
                      style={{ borderRadius: '10px', height: '40px', fontFamily: "'Inter', monospace" }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', padding: '12px 14px', backgroundColor: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <input
                    type="checkbox"
                    id="secure-checkbox"
                    checked={secure}
                    onChange={(e) => setSecure(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-color)' }}
                  />
                  <label htmlFor="secure-checkbox" style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    {t.secureLabel}
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.userLabel}</label>
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
                      style={{ borderRadius: '10px', height: '40px' }}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.passLabel}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={pass}
                      onChange={(e) => setPass(e.target.value)}
                      placeholder={pass ? '••••••••' : 'Enter SMTP password'}
                      style={{ borderRadius: '10px', height: '40px' }}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.fromLabel}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder='e.g. "Sumer Send" <onboarding@sumersend.com>'
                    required
                    style={{ borderRadius: '10px', height: '40px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSaving}
                  style={{ width: '100%', opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'not-allowed' : 'pointer', borderRadius: '10px', height: '42px', fontSize: '13px' }}
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
            </BentoCard>

            {/* Test connection */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div className="service-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Send size={16} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{t.testTitle}</h3>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.55 }}>
                {t.testDesc}
              </p>

              <form onSubmit={handleTestConnection}>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontSize: '12px', marginBottom: '6px' }}>{t.testRecLabel}</label>
                  <input
                    type="email"
                    className="form-input"
                    value={testRecipient}
                    onChange={(e) => setTestRecipient(e.target.value)}
                    placeholder="recipient@gmail.com"
                    required
                    style={{ borderRadius: '10px', height: '40px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn" 
                  disabled={isTesting}
                  style={{ width: '100%', opacity: isTesting ? 0.7 : 1, cursor: isTesting ? 'not-allowed' : 'pointer', borderRadius: '10px', height: '42px', fontSize: '13px' }}
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
            </BentoCard>
          </div>
        </div>
      )}

      {/* 1.5 WHATSAPP TAB */}
      {activeSubTab === 'whatsapp' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Main WhatsApp Connection Card */}
          <BentoCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div className="service-icon whatsapp">
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 750, margin: 0 }}>
                  {lang === 'en' ? 'WhatsApp Dispatcher' : 'خادم إرسال واتساب'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {waStatus.connected
                    ? (lang === 'ar' ? 'الحالة: متصل ونشط' : 'Status: Connected & Active')
                    : (lang === 'ar' ? 'الحالة: غير متصل' : 'Status: Disconnected')}
                </span>
              </div>
            </div>
            
            {waStatus.connected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="verified-banner">
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#25d366', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981', display: 'block' }}>
                      {lang === 'en' ? 'Connected & Ready' : 'متصل وجاهز للإرسال'}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginTop: '3px', lineHeight: 1.45 }}>
                      {lang === 'en' 
                        ? 'Your WhatsApp account is securely connected via Baileys WebSocket. You can now dispatch real WhatsApp messages using the /v1/whatsapp endpoint or from the Playground.'
                        : 'حساب واتساب الخاص بك متصل بنجاح عبر Baileys WebSocket. يمكنك الآن إرسال رسائل حقيقية عبر مسار /v1/whatsapp أو منصة الاختبار.'}
                    </span>
                  </div>
                </div>
                <button 
                  className="btn" 
                  onClick={handleWaLogout}
                  disabled={waLoading}
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', borderRadius: '10px', height: '42px', fontSize: '13px', fontWeight: 600 }}
                >
                  {waLoading ? '...' : (lang === 'en' ? 'Disconnect Session' : 'قطع الاتصال')}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
                  {lang === 'en' 
                    ? 'To enable real WhatsApp messaging, scan the QR code below using your WhatsApp mobile app (Linked Devices).'
                    : 'لتفعيل إرسال رسائل واتساب حقيقية، قم بمسح الرمز (QR Code) أدناه باستخدام تطبيق واتساب على هاتفك (الأجهزة المرتبطة).'}
                </p>
                
                {waStatus.qr ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '28px', backgroundColor: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
                      {lang === 'en' ? 'Scan QR Code' : 'امسح الرمز'}
                    </span>
                    <div className="qr-pulse-overlay" style={{ background: '#fff', padding: '14px', borderRadius: '14px', border: '1px solid #eaeaea', display: 'inline-block', overflow: 'hidden', position: 'relative' }}>
                      <div className="qr-pulse-line"></div>
                      <img src={waStatus.qr} alt="WhatsApp QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5, maxWidth: '280px' }}>
                      {lang === 'en' ? 'Open WhatsApp > Linked Devices > Link a Device' : 'افتح واتساب > الأجهزة المرتبطة > ربط جهاز'}
                    </span>
                  </div>
                ) : (
                  <div style={{ padding: '48px 20px', backgroundColor: 'var(--bg-color)', borderRadius: '14px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                    <span className="spinner-icon" style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--text-muted)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                    <p style={{ marginTop: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {lang === 'en' ? 'Generating QR Code...' : 'جاري توليد رمز الاستجابة...'}
                    </p>
                  </div>
                )}
                
                <button 
                  className="btn" 
                  onClick={fetchWaStatus}
                  style={{ borderRadius: '10px', height: '42px', fontSize: '13px' }}
                >
                  {lang === 'en' ? 'Refresh Status' : 'تحديث الحالة'}
                </button>
              </div>
            )}
          </BentoCard>

          {/* Engine Info & Warning */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Baileys Engine Info */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                  <Layers size={16} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {lang === 'en' ? 'Baileys WebSockets Engine' : 'محرك Baileys WebSockets'}
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {lang === 'en'
                  ? 'Sumer Send uses the lightweight Baileys library instead of Puppeteer. This connects directly to WhatsApp servers via WebSockets, using 90% less memory and providing instant dispatch speeds.'
                  : 'تستخدم سومر سيند مكتبة Baileys الخفيفة بدلاً من Puppeteer. هذا المحرك يتصل مباشرة بسيرفرات واتساب عبر الـ WebSockets مما يوفر 90% من استهلاك الذاكرة ويوفر سرعة إرسال لحظية.'}
              </p>

              {/* Performance comparison */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.08)', color: '#10b981' }}>Baileys</span>
                      <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'استهلاك الذاكرة' : 'Memory usage'}</span>
                    </span>
                    <span className="tabular-nums-stat" style={{ color: '#10b981', fontWeight: 700 }}>12 MB</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '10%', backgroundColor: '#10b981', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 700, borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.08)', color: '#ef4444' }}>Puppeteer</span>
                      <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'استهلاك الذاكرة' : 'Memory usage'}</span>
                    </span>
                    <span className="tabular-nums-stat" style={{ color: '#ef4444', fontWeight: 700 }}>120 MB</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: '#ef4444', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              </div>
            </BentoCard>

            {/* Anti-Spam Warning Card */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div className="service-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                  <AlertCircle size={16} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {lang === 'en' ? 'Anti-Spam Warning' : 'تحذير مكافحة الاسبام'}
                </h4>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
                {lang === 'en'
                  ? 'Avoid sending bulk spam. Meta may ban numbers sending unsolicited links. Always ensure your messages are solicited and comply with WhatsApp Business policies.'
                  : 'تجنب إرسال الرسائل المزعجة. قد تقوم Meta بحظر الأرقام التي ترسل روابط غير مرغوب فيها. تأكد دائماً أن رسائلك مرغوبة ومتوافقة مع سياسات واتساب للأعمال.'}
              </p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', backgroundColor: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                  {lang === 'ar' ? 'البروتوكول: WebSocket' : 'Protocol: WebSocket'}
                </span>
                <span style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', backgroundColor: 'rgba(37, 211, 102, 0.08)', color: '#25d366', border: '1px solid rgba(37, 211, 102, 0.15)' }}>
                  {lang === 'ar' ? 'المحرك: Baileys' : 'Engine: Baileys'}
                </span>
                <span style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '20px', backgroundColor: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed', border: '1px solid rgba(124, 58, 237, 0.15)' }}>
                  {lang === 'ar' ? 'المنطقة: البصرة' : 'Region: Basra Hub'}
                </span>
              </div>
            </BentoCard>
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
                  <div className="template-tab-container">
                    <button 
                      onClick={() => setActiveCategory('email')}
                      className={`template-tab-btn email-tab ${activeCategory === 'email' ? 'active' : ''}`}
                    >
                      <Mail size={14} />
                      <span>{t.categoryEmail}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCategory('sms')}
                      className={`template-tab-btn sms-tab ${activeCategory === 'sms' ? 'active' : ''}`}
                    >
                      <Phone size={14} />
                      <span>{t.categorySms}</span>
                    </button>
                    <button 
                      onClick={() => setActiveCategory('whatsapp')}
                      className={`template-tab-btn whatsapp-tab ${activeCategory === 'whatsapp' ? 'active' : ''}`}
                    >
                      <MessageSquare size={14} />
                      <span>{t.categoryWa}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => { setEditingTemplate(null); setIsBuildingTemplate(true); }}
                    className="create-template-btn"
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      fontSize: '13px', 
                      padding: '8px 16px', 
                      fontWeight: 650,
                      borderRadius: '6px',
                      cursor: 'pointer',
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
                  <BentoCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', minHeight: '450px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
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
                  </BentoCard>
                </div>
              </div>
            );
          })()
        )
      )}



      {/* 3. SYSTEM & SERVICES TAB */}
      {activeSubTab === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Architecture / flow overview */}
          <BentoCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                <Layers size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 750, margin: 0 }}>
                  {lang === 'ar' ? 'البنية التحتية وهندسة الإرسال' : 'Infrastructure Architecture'}
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {lang === 'ar' ? 'المنطقة: بغداد، العراق' : 'Region: Baghdad, Iraq'}
                </span>
              </div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '24px', maxWidth: '720px' }}>
              {lang === 'ar' 
                ? 'تعتمد المنصة على موزع بريد خلفي (Local SMTP Dispatcher) لإرسال رسائل الإيميل الحقيقية مباشرة إلى صندوق البريد الوارد للمستخدمين، وتتكامل برمجياً عبر بوابات الـ API المحلية لشبكات الجيل الرابع في العراق لإيصال رسائل الهاتف المحمول الفورية بمرونة تامة.' 
                : 'Sumer Send triggers SMTP servers running in the background to forward actual transactional mails, and hooks directly into localized 4G telecom network aggregators inside Iraq for rapid SMS & WhatsApp notification updates.'}
            </p>

            {/* Premium Flow Diagram */}
            <div style={{ 
              backgroundColor: 'var(--bg-color)', 
              borderRadius: '12px', 
              padding: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              gap: '16px',
              border: '1px solid var(--border-color)'
            }}>
              {/* SDK Node */}
              <div className="flow-node">
                <Monitor size={18} />
                <span>SDK / API Calls</span>
                <span className="flow-node-label">{lang === 'ar' ? 'نقطة الاتصال' : 'Entry Point'}</span>
              </div>

              <div className="flow-arrow">→</div>
              
              {/* Gateway Hub Node */}
              <div className="flow-node node-primary">
                <Settings size={18} />
                <span>Sumer Send</span>
                <span className="flow-node-label">{lang === 'ar' ? 'الموزع المركزي' : 'Central Hub'}</span>
              </div>

              <div className="flow-arrow">→</div>
              
              {/* Service Endpoints */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flow-node node-smtp" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon smtp"><Mail size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>SMTP Mail Engine</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Port 3000</span>
                  </div>
                </div>
                <div className="flow-node node-zain" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon zain"><Phone size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>Zain Iraq SMS</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Gateway API</span>
                  </div>
                </div>
                <div className="flow-node node-asia" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon asia"><Phone size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>Asiacell Bridge</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Mobile API</span>
                  </div>
                </div>
                <div className="flow-node node-korek" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon korek"><Phone size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>Korek Telecom</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Gateway API</span>
                  </div>
                </div>
                <div className="flow-node node-whatsapp" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon whatsapp"><MessageSquare size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>WhatsApp Cloud</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Basra Hub</span>
                  </div>
                </div>
                <div className="flow-node node-zaincash" style={{ flexDirection: 'row', gap: '10px', padding: '10px 14px' }}>
                  <div className="service-icon zaincash"><Shield size={14} /></div>
                  <div style={{ textAlign: 'start' }}>
                    <span style={{ fontSize: '11.5px' }}>Zain Cash</span>
                    <span className="flow-node-label" style={{ display: 'block' }}>Payment API</span>
                  </div>
                </div>
              </div>
            </div>
          </BentoCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            
            {/* Status indicators */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div className="service-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Monitor size={16} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{t.gatewayStatus}</h3>
              </div>
              
              <div>
                {[
                  { label: lang === 'ar' ? 'محرك البريد SMTP' : 'SMTP Mail Engine', sub: 'Port 3000', icon: <Mail size={14} />, status: lang === 'ar' ? 'متصل ونشط' : 'Online & Active' },
                  { label: lang === 'ar' ? 'بوابة زين العراق' : 'Zain Iraq SMS', sub: 'Gateway', icon: <Phone size={14} />, status: lang === 'ar' ? 'متصل' : 'Connected' },
                  { label: lang === 'ar' ? 'بوابة آسيا سيل' : 'Asiacell Iraq', sub: 'Gateway', icon: <Phone size={14} />, status: lang === 'ar' ? 'متصل' : 'Connected' },
                  { label: lang === 'ar' ? 'بوابة كورك' : 'Korek Telecom', sub: 'Gateway', icon: <Phone size={14} />, status: lang === 'ar' ? 'متصل' : 'Connected' },
                  { label: lang === 'ar' ? 'واتساب كلاود' : 'WhatsApp Cloud', sub: 'Basra Hub', icon: <MessageSquare size={14} />, status: lang === 'ar' ? 'متصل ونشط' : 'Online & Active' },
                  { label: lang === 'ar' ? 'زين كاش' : 'Zain Cash API', sub: 'Payment', icon: <Shield size={14} />, status: lang === 'ar' ? 'متصل' : 'Connected' },
                ].map((item, i) => (
                  <div key={i} className="gateway-row">
                    <div className="gateway-row-label">
                      {item.icon}
                      <div>
                        <span style={{ display: 'block', fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{item.label}</span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.sub}</span>
                      </div>
                    </div>
                    <div className="gateway-row-status">
                      <span className="status-dot-active"></span>
                      <span>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </BentoCard>

            {/* Rates & pricing */}
            <BentoCard style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                  <Layers size={16} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{t.tariffTitle}</h3>
              </div>
              
              <table className="rates-table">
                <thead>
                  <tr>
                    <th>{lang === 'ar' ? 'الخدمة / القناة' : 'Service / Channel'}</th>
                    <th style={{ textAlign: 'end' }}>{lang === 'ar' ? 'التعرفة' : 'Tariff'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="service-icon smtp"><Mail size={13} /></div>
                        <span style={{ fontWeight: 500 }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email API'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <span className="rate-value" style={{ color: '#3b82f6' }}>10</span>
                      <span className="rate-unit">{lang === 'ar' ? 'د.ع / رسالة' : 'IQD / msg'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="service-icon zain"><Phone size={13} /></div>
                        <span style={{ fontWeight: 500 }}>{lang === 'ar' ? 'رسائل الجوال' : 'Local SMS'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <span className="rate-value" style={{ color: '#10b981' }}>120</span>
                      <span className="rate-unit">{lang === 'ar' ? 'د.ع / رسالة' : 'IQD / msg'}</span>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="service-icon whatsapp"><MessageSquare size={13} /></div>
                        <span style={{ fontWeight: 500 }}>{lang === 'ar' ? 'رسائل الواتساب' : 'WhatsApp'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'end' }}>
                      <span className="rate-value" style={{ color: '#f59e0b' }}>150</span>
                      <span className="rate-unit">{lang === 'ar' ? 'د.ع / رسالة' : 'IQD / msg'}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, padding: '12px 14px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                {lang === 'ar'
                  ? '* تعتمد الفوترة والخصم الفعلي من رصيد المحفظة بالعملة المحلية مباشرة (الـ دينار عراقي IQD).'
                  : '* Billing is calculated and deducted in real-time in Iraqi Dinar (IQD) from your linked wallet balance.'}
              </div>
            </BentoCard>

          </div>

        </div>
      )}

      {activeSubTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Security Overview Header */}
          <BentoCard style={{ padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div className={`security-shield-badge ${securityVerified ? 'active' : 'inactive'}`}>
                <Shield size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 750, margin: 0 }}>
                  {lang === 'ar' ? 'إعدادات الحماية والتحقق ثنائي العامل (2FA)' : 'Security & 2FA Configuration'}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                  {securityVerified 
                    ? (lang === 'ar' ? '🟢 الحساب مؤمّن ومحمي' : '🟢 Account secured & protected')
                    : (lang === 'ar' ? '🟡 يتطلب ربط رقم الهاتف' : '🟡 Phone linking required')}
                </span>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0, maxWidth: '720px' }}>
              {lang === 'ar'
                ? 'اربط رقم هاتفك المحمول لتأمين حساب المطور الخاص بك. يتيح لك التحقق الثنائي (2FA) فرض تأكيد فوري بالرمز قبل تنفيذ العمليات الحساسة مثل إطلاق الحملات الجماعية أو إصدار رموز API جديدة.'
                : 'Link your mobile phone number to secure your developer account. Enforcing 2FA requires entering an SMS-delivered verification code before performing critical actions like launching bulk campaigns or creating new API keys.'}
            </p>
          </BentoCard>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
            {/* Phone Linking Card */}
            <BentoCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="service-icon" style={{ background: 'rgba(var(--accent-rgb), 0.08)', color: 'var(--accent-color)' }}>
                  <Phone size={16} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'ربط وتأكيد رقم الهاتف' : 'Link & Verify Mobile Number'}
                </h4>
              </div>

              {securityError && (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.06)', color: '#ef4444', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid rgba(239, 68, 68, 0.12)' }}>
                  <AlertCircle size={14} />
                  <span>{securityError}</span>
                </div>
              )}

              {securitySuccess && (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.06)', color: '#10b981', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center', border: '1px solid rgba(16, 185, 129, 0.12)' }}>
                  <CheckCircle size={14} />
                  <span>{securitySuccess}</span>
                </div>
              )}

              {securityVerified ? (
                /* VERIFIED STATE */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="verified-banner">
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check size={20} />
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                        {lang === 'ar' ? 'رقم الهاتف الموثق' : 'Verified Phone Number'}
                      </span>
                      <h5 style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0 0', direction: 'ltr', textAlign: 'left', fontFamily: "'Inter', 'SF Mono', monospace", letterSpacing: '1px' }}>
                        {securityPhone}
                      </h5>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="btn"
                    onClick={handleUnlinkPhone}
                    style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444', width: '100%', fontSize: '13px', padding: '10px', fontWeight: 600, borderRadius: '10px' }}
                  >
                    {lang === 'ar' ? 'إلغاء ربط رقم الهاتف' : 'Unlink Phone Number'}
                  </button>
                </div>
              ) : (
                /* UNVERIFIED STATE / FLOW */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '12px' }}>
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
                        style={{ height: '42px', direction: 'ltr', textAlign: 'left', borderRadius: '10px', fontSize: '14px', fontFamily: "'Inter', monospace" }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSendSecurityOtp}
                        disabled={countdown > 0}
                        style={{ fontSize: '12px', whiteSpace: 'nowrap', padding: '0 16px', borderRadius: '10px' }}
                      >
                        {countdown > 0 
                          ? `${countdown}s` 
                          : (lang === 'ar' ? 'إرسال الرمز' : 'Send Code')}
                      </button>
                    </div>
                  </div>

                  {isVerifyingOtp && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label className="form-label" style={{ marginBottom: '8px', display: 'block', fontSize: '12px' }}>
                          {lang === 'ar' ? 'رمز التحقق (OTP) المكون من 6 أرقام' : '6-Digit Verification Code (OTP)'}
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            className="form-input otp-input"
                            maxLength={6}
                            placeholder="••••••"
                            value={securityOtp}
                            onChange={(e) => setSecurityOtp(e.target.value)}
                          />
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleConfirmSecurityOtp}
                            style={{ fontSize: '12px', padding: '0 20px', borderRadius: '10px' }}
                          >
                            {lang === 'ar' ? 'تأكيد' : 'Confirm'}
                          </button>
                        </div>
                      </div>
                      <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.5, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <Info size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                        <span>
                          {lang === 'ar'
                            ? 'تنويه: يظهر رمز التحقق المرسل كإشعار رسالة نصية فورية في الهاتف الافتراضي المحاكي على الجانب الأيمن من الشاشة.'
                            : 'The verification code will appear as a simulated lockscreen SMS notification on the right-side phone mockup.'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </BentoCard>

            {/* 2FA Policies Card */}
            <BentoCard style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="service-icon" style={{ background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed' }}>
                  <Shield size={16} />
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'سياسة الحماية والتحقق الثنائي' : '2FA Verification Policies'}
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Policy 1: Campaign Launch */}
                <div className={`policy-card ${requireCampaign2FA ? 'enabled' : ''}`}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'فرض التحقق عند إطلاق الحملات' : 'Require 2FA for Campaigns'}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '5px', lineHeight: 1.45 }}>
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
                <div className={`policy-card ${requireApiKey2FA ? 'enabled' : ''}`}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '13px', display: 'block', color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'فرض التحقق عند إنشاء مفاتيح API' : 'Require 2FA for API Keys'}
                    </strong>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginTop: '5px', lineHeight: 1.45 }}>
                      {lang === 'ar'
                        ? 'إرسال رمز تحقق وتأكيده قبل إنشاء أو تجديد أي مفاتيح API برمجية.'
                        : 'Sends an SMS OTP code which must be verified before generating or rotating API keys.'}
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
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', gap: '10px', alignItems: 'center', lineHeight: 1.4 }}>
                  <Info size={14} style={{ flexShrink: 0 }} />
                  <span>
                    {lang === 'ar'
                      ? 'يرجى تأكيد رقم هاتفك أولاً لتفعيل خيارات التحقق الثنائي.'
                      : 'Please verify your phone number first to unlock 2FA toggle options.'}
                  </span>
                </div>
              )}
            </BentoCard>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};
