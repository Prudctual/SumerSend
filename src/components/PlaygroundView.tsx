

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MessageSquare, Send, Code, AlertCircle, Copy, Check, Lock, Globe, Sparkles, Settings } from 'lucide-react';
import { templatesDb } from '../data/templates';
import type { TemplateItem } from '../data/templates';
import { ScrollReveal, BentoCard } from './LandingView';
import { renderTemplateIcon } from './IconHelper';

interface PlaygroundViewProps {
  lang: 'en' | 'ar';
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  domains: any[];
  phoneNotifications: any[];
  setPhoneNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  emailBody: string;
  setEmailBody: (body: string) => void;
  emailSubject: string;
  setEmailSubject: (sub: string) => void;
  msgBody: string;
  setMsgBody: (body: string) => void;
  activeTab: 'email' | 'sms' | 'whatsapp';
  setActiveTab: (tab: 'email' | 'sms' | 'whatsapp') => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  lang,
  setLogs,
  walletBalance,
  setWalletBalance,
  domains,
  phoneNotifications,
  setPhoneNotifications,
  emailBody,
  setEmailBody,
  emailSubject,
  setEmailSubject,
  msgBody,
  setMsgBody,
  activeTab,
  setActiveTab,
}) => {
  const [isSending, setIsSending] = useState(false);
  
  // Email Form State
  const [emailFrom, setEmailFrom] = useState('');
  const [emailTo, setEmailTo] = useState(() => localStorage.getItem('sumer_admin_test_email') || 'developer@baghdad.dev');
  // SMS/WA Form State
  const [phoneTo, setPhoneTo] = useState('07801234567');

  const [activeCodeLang, setActiveCodeLang] = useState<'node' | 'python' | 'curl'>('node');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeNotificationDetail, setActiveNotificationDetail] = useState<any | null>(null);

  const setNotificationDetailWithTransition = (detail: any) => {
    if (!document.startViewTransition) {
      setActiveNotificationDetail(detail);
      return;
    }
    
    document.startViewTransition(() => {
      setActiveNotificationDetail(detail);
    });
  };

  // Active template states
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({});
  const [isVariablesCustomized, setIsVariablesCustomized] = useState(false);

  const [prevActiveTab, setPrevActiveTab] = useState(activeTab);
  if (activeTab !== prevActiveTab) {
    setPrevActiveTab(activeTab);
    setSelectedTemplateId('');
    setTemplateVariables({});
    setIsVariablesCustomized(false);
  }

  useEffect(() => {
    localStorage.setItem('sumer_admin_test_email', emailTo);
  }, [emailTo]);

  // Load custom templates from API
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/templates/custom')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomTemplates(data);
      })
      .catch(err => console.warn('Could not load custom templates in playground:', err));
  }, [activeTab]);

  const getMergedTemplates = () => {
    const staticList = templatesDb[activeTab] || [];
    const customList = customTemplates.filter(t => t.type === activeTab) || [];
    return [...staticList, ...customList];
  };

  const selectedTemplate = selectedTemplateId 
    ? getMergedTemplates().find(t => t.id === selectedTemplateId) 
    : null;

  const compileAndSync = (template: TemplateItem, vars: Record<string, string>) => {
    let compiledBody = template.body;
    let compiledSubject = lang === 'ar' ? (template.subjectAr || '') : (template.subjectEn || '');
    
    Object.entries(vars).forEach(([key, val]) => {
      const placeholder = `{{${key}}}`;
      compiledBody = compiledBody.replaceAll(placeholder, val);
      compiledSubject = compiledSubject.replaceAll(placeholder, val);
    });
    
    if (activeTab === 'email') {
      setEmailSubject(compiledSubject);
      setEmailBody(compiledBody);
    } else {
      setMsgBody(compiledBody);
    }
  };

  const handleSelectTemplate = (template: TemplateItem) => {
    setSelectedTemplateId(template.id);
    const initialVars: Record<string, string> = {};
    if (template.variables) {
      template.variables.forEach(v => {
        initialVars[v.key] = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
      });
    }
    setTemplateVariables(initialVars);
    setIsVariablesCustomized(false);
    compileAndSync(template, initialVars);
  };

  const handleVariableChange = (key: string, value: string) => {
    if (!selectedTemplate) return;
    const updatedVars = { ...templateVariables, [key]: value };
    setTemplateVariables(updatedVars);
    setIsVariablesCustomized(true);
    compileAndSync(selectedTemplate, updatedVars);
  };

  const handleResetVariables = () => {
    if (!selectedTemplate) return;
    const initialVars: Record<string, string> = {};
    selectedTemplate.variables.forEach(v => {
      initialVars[v.key] = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
    });
    setTemplateVariables(initialVars);
    setIsVariablesCustomized(false);
    compileAndSync(selectedTemplate, initialVars);
  };

  // Set SMTP configuration username/sender as emailFrom, fallback to verified domains
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setEmailFrom(data.user);
        } else if (data.from) {
          setEmailFrom(data.from);
        } else {
          // Fallback to verified domains if no SMTP config is present
          const verifiedDomains = domains.filter(d => d.status === 'verified');
          if (verifiedDomains.length > 0) {
            setEmailFrom(`support@${verifiedDomains[0].name}`);
          } else {
            setEmailFrom('onboarding@sumersend.com');
          }
        }
      })
      .catch(() => {
        const verifiedDomains = domains.filter(d => d.status === 'verified');
        if (verifiedDomains.length > 0) {
          setEmailFrom(`support@${verifiedDomains[0].name}`);
        } else {
          setEmailFrom('onboarding@sumersend.com');
        }
      });
  }, [domains]);

  const translations = {
    en: {
      title: 'Interactive API Playground',
      subtitle: 'Compose messages and watch them trigger simulated push notifications on the phone mockup instantly.',
      emailTab: 'Email API',
      smsTab: 'SMS API',
      waTab: 'WhatsApp API',
      sendBtn: 'Send Message',
      sendEmailBtn: 'Send Email Now',
      sendSmsBtn: 'Send SMS Now',
      sendWaBtn: 'Send WhatsApp Now',
      sdkTitle: 'Code Integration SDK',
      insufficientFunds: 'Insufficient wallet balance. Please top up in the Billing tab.',
      noDomainWarning: 'Note: Using sandbox domain onboarding@sumersend.com. Verifying your own domain unlocks custom sender names.',
      sentSuccess: 'Message transmitted successfully! Check the phone simulator.',
      emailFromLabel: 'From',
      emailToLabel: 'To (Recipient Email)',
      emailSubLabel: 'Subject',
      emailBodyLabel: 'HTML Body',
      phoneToLabel: 'To (Iraqi Phone Number)',
      msgBodyLabel: 'Message Body',
      phonePrefixHint: 'Format: 078XXXXXXXX, 077XXXXXXXX, or 075XXXXXXXX.',
      chargeMsg: 'Cost per send: Email (10 IQD), SMS (120 IQD), WhatsApp (150 IQD).',
      mockPhoneTitle: 'Phone Simulator',
      mockPhoneDesc: 'Watch messages appear in real-time.',
      guideTitle: 'Simulating Multi-Channel Deliveries',
      guideText: 'Test our unified API for Email, SMS, and WhatsApp. Choose a channel, enter details, and click "Send" to trigger a simulated request. You will see delivery results live on the mockup phone.',
    },
    ar: {
      title: 'منصة الاختبار التفاعلية (Playground)',
      subtitle: 'أرسل الرسائل التجريبية وشاهدها تظهر كإشعارات فورية على محاكي الهاتف بجانبك.',
      emailTab: 'API البريد',
      smsTab: 'API الـ SMS',
      waTab: 'API الواتساب',
      sendBtn: 'إرسال التنبيه الآن',
      sendEmailBtn: 'إرسال البريد الإلكتروني الآن',
      sendSmsBtn: 'إرسال رسالة الـ SMS الآن',
      sendWaBtn: 'إرسال رسالة الواتساب الآن',
      sdkTitle: 'شفرة الربط البرمجي (SDK)',
      insufficientFunds: 'رصيدك غير كافٍ لإرسال الرسالة. يرجى الشحن من تبويب المحفظة.',
      noDomainWarning: 'ملاحظة: تستخدم حالياً نطاق الاختبار onboarding@sumersend.com. قم بإضافة نطاقك الخاص لإرسال بريد باسمك.',
      sentSuccess: 'تم الإرسال بنجاح! راقب محاكي الموبايل.',
      emailFromLabel: 'من (المرسل)',
      emailToLabel: 'إلى (البريد الإلكتروني للمستقبل)',
      emailSubLabel: 'العنوان',
      emailBodyLabel: 'محتوى الـ HTML',
      phoneToLabel: 'إلى (رقم الهاتف العراقي)',
      msgBodyLabel: 'نص الرسالة',
      phonePrefixHint: 'صيغة الأرقام: 078، 077 أو 075 متبوعة بـ 8 أرقام.',
      chargeMsg: 'تكلفة الإرسال: البريد (10 د.ع)، الـ SMS (120 د.ع)، الواتساب (150 د.ع).',
      mockPhoneTitle: 'محاكي الهاتف الذكي',
      mockPhoneDesc: 'ستظهر الرسائل هنا فور الضغط على زر الإرسال.',
      guideTitle: 'محاكاة قنوات الإرسال المتعددة',
      guideText: 'اختبر الواجهة البرمجية الموحدة للبريد والـ SMS والواتساب. اختر القناة المطلوبة، أدخل البيانات، ثم اضغط "إرسال" لرؤية محاكاة فورية لوصول التنبيه على شاشة الهاتف وتحديث السجلات.',
    },
  };

  const t = translations[lang];

  // Dynamic SDK code snippet generator
  const getCodeSnippet = () => {
    const formatBody = (body: string) => {
      const clean = body.trim().replace(/\s+/g, ' ');
      if (clean.length > 80) {
        return `${clean.substring(0, 50)}... [Truncated Content]`;
      }
      return clean;
    };

    if (activeTab === 'email') {
      if (activeCodeLang === 'node') {
        return `import { SumerSend } from 'sumer-send';

const rs = new SumerSend({ apiKey: 'sm_live_...' });

await rs.emails.send({
  from: '${emailFrom}',
  to: '${emailTo}',
  subject: '${emailSubject}',
  html: '${formatBody(emailBody)}'
});`;
      } else if (activeCodeLang === 'python') {
        return `from sumer_send import SumerSend

rs = SumerSend(api_key="sm_live_...")

rs.emails.send(
    sender="${emailFrom}",
    to="${emailTo}",
    subject="${emailSubject}",
    html="${formatBody(emailBody)}"
)`;
      } else {
        return `curl -X POST https://api.sumersend.com/v1/emails \\
  -H "Authorization: Bearer sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "${emailFrom}",
    "to": "${emailTo}",
    "subject": "${emailSubject}",
    "html": "${formatBody(emailBody)}"
  }'`;
      }
    } else if (activeTab === 'sms') {
      if (activeCodeLang === 'node') {
        return `import { SumerSend } from 'sumer-send';

const rs = new SumerSend({ apiKey: 'sm_live_...' });

await rs.sms.send({
  to: '${phoneTo}',
  body: '${formatBody(msgBody)}'
});`;
      } else if (activeCodeLang === 'python') {
        return `from sumer_send import SumerSend

rs = SumerSend(api_key="sm_live_...")

rs.sms.send(
    to="${phoneTo}",
    body="${formatBody(msgBody)}"
)`;
      } else {
        return `curl -X POST https://api.sumersend.com/v1/sms \\
  -H "Authorization: Bearer sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${phoneTo}",
    "body": "${formatBody(msgBody)}"
  }'`;
      }
    } else { // whatsapp
      if (activeCodeLang === 'node') {
        return `import { SumerSend } from 'sumer-send';

const rs = new SumerSend({ apiKey: 'sm_live_...' });

await rs.whatsapp.send({
  to: '${phoneTo}',
  body: '${formatBody(msgBody)}'
});`;
      } else if (activeCodeLang === 'python') {
        return `from sumer_send import SumerSend

rs = SumerSend(api_key="sm_live_...")

rs.whatsapp.send(
    to="${phoneTo}",
    body="${formatBody(msgBody)}"
)`;
      } else {
        return `curl -X POST https://api.sumersend.com/v1/whatsapp \\
  -H "Authorization: Bearer sm_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${phoneTo}",
    "body": "${formatBody(msgBody)}"
  }'`;
      }
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // Check balance first
    const cost = activeTab === 'email' ? 10 : activeTab === 'sms' ? 120 : 150;
    if (walletBalance < cost) {
      setStatusMsg({ type: 'error', text: t.insufficientFunds });
      return;
    }

    setIsSending(true);
    setStatusMsg(null);

    const apiEndpoint = activeTab === 'email' 
      ? 'http://127.0.0.1:3000/v1/emails' 
      : activeTab === 'sms' 
        ? 'http://127.0.0.1:3000/v1/sms' 
        : 'http://127.0.0.1:3000/v1/whatsapp';

    const apiBody = activeTab === 'email' 
      ? { from: emailFrom, to: emailTo, subject: emailSubject, html: emailBody }
      : { to: phoneTo, body: msgBody };

    fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sm_live_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d'
      },
      body: JSON.stringify(apiBody)
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || data.error || 'API request failed');
        }
        return data;
      })
      .then((data) => {
        // Success case from real API server
        setWalletBalance(prev => prev - cost);

        // Fetch latest logs from backend to ensure perfect sync
        fetch('http://127.0.0.1:3000/api/logs')
          .then(res => res.json())
          .then(serverLogs => {
            if (Array.isArray(serverLogs)) {
              setLogs(serverLogs);
            }
          })
          .catch(err => {
            console.error('Failed to sync logs from server:', err);
            // Fallback: append locally
            setLogs(prev => [...prev, data]);
          });

        const newNotification = {
          id: Date.now().toString(),
          type: activeTab,
          title: activeTab === 'email' ? emailSubject : activeTab === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
          body: activeTab === 'email' ? emailBody.replace(/<[^>]*>/g, '') : msgBody,
          rawBody: activeTab === 'email' ? emailBody : undefined,
          time: 'Now'
        };

        setPhoneNotifications(prev => [newNotification, ...prev]);
        setIsSending(false);
        
        const successText = activeTab === 'email' 
          ? (lang === 'en' ? 'Email delivered via SMTP successfully!' : 'تم إرسال البريد الإلكتروني بنجاح عبر الـ SMTP!')
          : t.sentSuccess;
          
        setStatusMsg({ type: 'success', text: successText });
        setTimeout(() => setStatusMsg(null), 4000);

        // Dispatch animated screen notification
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { message: successText, type: activeTab }
        }));
        window.dispatchEvent(new CustomEvent('sumer-success-screen'));
      })
      .catch((err) => {
        console.warn('Real API call failed, checking if connection refused:', err);
        
        // If it's a connection error, fallback to simulation
        if (err.message.includes('fetch') || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Failed to connect')) {
          // Fallback simulation
          setTimeout(() => {
            setWalletBalance(prev => prev - cost);

            const logId = 'LOG' + Math.floor(100000 + Math.random() * 900000).toString();
            const newLog = {
              id: logId,
              type: activeTab,
              from: activeTab === 'email' ? emailFrom : 'Sumer Send API',
              to: activeTab === 'email' ? emailTo : phoneTo,
              subject: activeTab === 'email' ? emailSubject : undefined,
              body: activeTab === 'email' ? emailBody : msgBody,
              status: 'delivered',
              timestamp: new Date().toISOString()
            };

            setLogs(prev => [...prev, newLog]);

            const newNotification = {
              id: Date.now().toString(),
              type: activeTab,
              title: activeTab === 'email' ? emailSubject : activeTab === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
              body: activeTab === 'email' ? emailBody.replace(/<[^>]*>/g, '') : msgBody,
              rawBody: activeTab === 'email' ? emailBody : undefined,
              time: 'Now'
            };

            setPhoneNotifications(prev => [newNotification, ...prev]);
            setIsSending(false);
            
            const simulationSuccessText = activeTab === 'email'
              ? (lang === 'en' 
                  ? 'Simulated send succeeded. Start server on port 3000 to send real emails!'
                  : 'تم إرسال محاكاة بنجاح. شغل الخادم الخلفي على المنفذ 3000 لإرسال إيميلات حقيقية!')
              : t.sentSuccess;
              
            setStatusMsg({ type: 'success', text: simulationSuccessText });
            setTimeout(() => setStatusMsg(null), 6000);

            // Dispatch animated screen notification
            window.dispatchEvent(new CustomEvent('sumer-toast', {
              detail: { message: simulationSuccessText, type: activeTab }
            }));
            window.dispatchEvent(new CustomEvent('sumer-success-screen'));
          }, 1200);
        } else {
          // If it was a real response but error (e.g. SMTP config missing or auth failed), show the error
          setIsSending(false);
          setStatusMsg({ 
            type: 'error', 
            text: lang === 'en' 
              ? `Delivery Error: ${err.message}` 
              : `خطأ في الإرسال: ${err.message}` 
          });

          // Sync logs from server (since the failed dispatch was logged on the server)
          fetch('http://127.0.0.1:3000/api/logs')
            .then(res => res.json())
            .then(serverLogs => {
              if (Array.isArray(serverLogs)) {
                setLogs(serverLogs);
              }
            })
            .catch(syncErr => console.error('Failed to sync logs after error:', syncErr));
        }
      });
  };

  return (
    <ScrollReveal>
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
        <button 
          className="btn" 
          style={{ 
            fontSize: '12px', 
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--panel-bg)',
            fontWeight: 600
          }} 
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? (lang === 'en' ? 'Hide Guide' : 'إخفاء الدليل') : (lang === 'en' ? 'Show Guide' : 'عرض الدليل')}
        </button>
      </div>

      {showGuide && (
        <BentoCard className="card" style={{ marginBottom: '20px', padding: '24px', backgroundColor: 'var(--panel-bg)', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'var(--accent-color)', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{t.guideTitle}</h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500 }}>{t.guideText}</p>
          </div>
        </BentoCard>
      )}

      <div className="playground-layout">
        
        {/* API Composer Panel */}
        <div className="playground-editor">
          
          {/* Sub Navigation */}
          <div className="vercel-tabs-container">
            <button className={`vercel-tab-btn ${activeTab === 'email' ? 'active' : ''}`} onClick={() => { setActiveTab('email'); setStatusMsg(null); }}>
              <Mail size={14} />
              <span>{t.emailTab}</span>
            </button>
            <button className={`vercel-tab-btn ${activeTab === 'sms' ? 'active' : ''}`} onClick={() => { setActiveTab('sms'); setStatusMsg(null); }}>
              <Phone size={14} />
              <span>{t.smsTab}</span>
            </button>
            <button className={`vercel-tab-btn ${activeTab === 'whatsapp' ? 'active' : ''}`} onClick={() => { setActiveTab('whatsapp'); setStatusMsg(null); }}>
              <MessageSquare size={14} />
              <span>{t.waTab}</span>
            </button>
          </div>

          <div className="card playground-composer-container" key={activeTab} style={{ padding: '20px', marginBottom: '16px' }}>
            {statusMsg && (
              <div style={{ 
                padding: '12px 16px', 
                borderRadius: '6px', 
                fontSize: '13px', 
                marginBottom: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                backgroundColor: statusMsg.type === 'success' ? 'var(--success-bg)' : 'var(--danger-bg)',
                color: statusMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)',
                border: `1px solid ${statusMsg.type === 'success' ? 'var(--success-text)' : 'var(--danger-text)'}`
              }}>
                <AlertCircle size={16} />
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSendMessage}>
              
              {/* Visual Template Selector Gallery */}
              <div style={{ marginBottom: '25px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex-between" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <Sparkles size={14} className="text-accent" style={{ color: 'var(--accent-color)' }} />
                    <span>{lang === 'ar' ? 'معرض القوالب الذكية الجاهزة' : 'Smart Presets Gallery'}</span>
                  </label>
                  {selectedTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTemplateId('');
                        setTemplateVariables({});
                        setIsVariablesCustomized(false);
                        if (activeTab === 'email') {
                          setEmailSubject('');
                          setEmailBody('');
                        } else {
                          setMsgBody('');
                        }
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger-text)',
                        fontSize: '11px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--danger-bg)'
                      }}
                    >
                      {lang === 'ar' ? '✕ تفريغ الحقول' : '✕ Clear Template'}
                    </button>
                  )}
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  marginBottom: '5px'
                }}>
                  {getMergedTemplates().map((temp) => {
                    const isSelected = selectedTemplateId === temp.id;
                    return (
                      <div
                        key={temp.id}
                        onClick={() => handleSelectTemplate(temp)}
                        style={{
                          padding: '14px',
                          borderRadius: '10px',
                          border: isSelected 
                            ? '1.5px solid var(--accent-color)' 
                            : '1.5px solid var(--border-color)',
                          backgroundColor: isSelected 
                            ? 'rgba(var(--accent-rgb), 0.03)' 
                            : 'var(--panel-bg)',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: isSelected ? '0 4px 12px rgba(var(--accent-rgb), 0.08)' : 'none',
                          transform: isSelected ? 'translateY(-2px)' : 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: isSelected ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg-color)',
                            color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)'
                          }}>
                            {renderTemplateIcon(temp.icon, 16)}
                          </span>
                          <span style={{ 
                            fontSize: '13px', 
                            fontWeight: 600, 
                            color: 'var(--text-primary)',
                            lineHeight: 1.3
                          }}>
                            {lang === 'ar' ? temp.nameAr : temp.nameEn}
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '11px', 
                          color: 'var(--text-secondary)', 
                          lineHeight: 1.4,
                          margin: 0,
                          flex: 1
                        }}>
                          {lang === 'ar' ? temp.descAr : temp.descEn}
                        </p>
                        
                        {isSelected && (
                          <span style={{
                            position: 'absolute',
                            top: '12px',
                            left: lang === 'en' ? 'auto' : '12px',
                            right: lang === 'en' ? '12px' : 'auto',
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-color)'
                          }}></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Smart Variables Editor Panel */}
              {selectedTemplate && selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
                <div style={{ 
                  marginBottom: '25px', 
                  padding: '16px', 
                  borderRadius: '10px', 
                  backgroundColor: 'var(--bg-color)', 
                  border: '1.5px solid var(--border-color)',
                  boxSizing: 'border-box'
                }}>
                  <div className="flex-between" style={{ marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Settings size={15} style={{ color: 'var(--text-secondary)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'تخصيص متغيرات القالب الذكي' : 'Customize Template Variables'}
                      </span>
                      {isVariablesCustomized ? (
                        <span style={{ 
                          fontSize: '10px', 
                          backgroundColor: 'var(--warning-bg)', 
                          color: 'var(--warning-text)', 
                          padding: '2px 8px', 
                          borderRadius: '20px', 
                          fontWeight: 500
                        }}>
                          {lang === 'ar' ? 'معدل' : 'Customized'}
                        </span>
                      ) : (
                        <span style={{ 
                          fontSize: '10px', 
                          backgroundColor: 'var(--success-bg)', 
                          color: 'var(--success-text)', 
                          padding: '2px 8px', 
                          borderRadius: '20px', 
                          fontWeight: 500
                        }}>
                          {lang === 'ar' ? 'افتراضي' : 'Default'}
                        </span>
                      )}
                    </div>
                    {isVariablesCustomized && (
                      <button
                        type="button"
                        onClick={handleResetVariables}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-color)',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {lang === 'ar' ? 'إعادة التعيين' : 'Reset to Defaults'}
                      </button>
                    )}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '12px' 
                  }}>
                    {selectedTemplate.variables.map((v) => (
                      <div key={v.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {lang === 'ar' ? v.labelAr : v.labelEn}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={templateVariables[v.key] || ''}
                          onChange={(e) => handleVariableChange(v.key, e.target.value)}
                          style={{ 
                            padding: '8px 10px', 
                            fontSize: '12px',
                            backgroundColor: 'var(--panel-bg)'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {activeTab === 'email' ? (
                <>
                  {/* Sandbox notice */}
                  {emailFrom === 'onboarding@sumersend.com' && (
                    <div style={{ padding: '12px 16px', border: '1px solid rgba(245, 158, 11, 0.2)', backgroundColor: 'var(--warning-bg)', fontSize: '12px', color: 'var(--warning-text)', marginBottom: '20px', borderRadius: '6px' }}>
                      {t.noDomainWarning}
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">{t.emailFromLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailFrom}
                      onChange={(e) => setEmailFrom(e.target.value)}
                      placeholder='e.g. "Sumer Send" <onboarding@sumersend.com>'
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.emailToLabel}</label>
                    <input
                      type="email"
                      className="form-input"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.emailSubLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.emailBodyLabel}</label>
                    <textarea
                      className="form-textarea"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      required
                      style={{
                        minHeight: '260px',
                        fontFamily: 'monospace',
                        fontSize: '13px',
                        direction: 'ltr',
                        textAlign: 'left',
                        lineHeight: 1.5,
                        backgroundColor: 'var(--bg-color)',
                        borderColor: 'var(--border-color)'
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label className="form-label">{t.phoneToLabel}</label>
                    <input
                      type="text"
                      className="form-input"
                      value={phoneTo}
                      onChange={(e) => setPhoneTo(e.target.value)}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      {t.phonePrefixHint}
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.msgBodyLabel}</label>
                    <textarea
                      className="form-textarea"
                      value={msgBody}
                      onChange={(e) => setMsgBody(e.target.value)}
                      required
                      style={{
                        minHeight: '100px',
                        direction: lang === 'ar' ? 'rtl' : 'ltr',
                        textAlign: lang === 'ar' ? 'right' : 'left',
                        lineHeight: 1.5
                      }}
                    />
                  </div>
                </>
              )}

              <div className="flex-between" style={{ marginTop: '20px', gap: '15px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {t.chargeMsg}
                </span>
                <button 
                  id="playground-send-btn"
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ minWidth: '220px', padding: '12px 20px', opacity: isSending ? 0.7 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}
                  disabled={isSending}
                >
                  <Send size={14} style={{ animation: isSending ? 'spin 1.5s linear infinite' : 'none' }} />
                  <span>
                    {isSending 
                      ? (lang === 'en' ? 'Transmitting...' : 'جاري الإرسال...') 
                      : (activeTab === 'email' 
                          ? t.sendEmailBtn 
                          : activeTab === 'sms' 
                            ? t.sendSmsBtn 
                            : t.sendWaBtn)}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Code SDK section */}
          <div style={{ marginTop: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={18} color="var(--text-secondary)" />
                <span>{t.sdkTitle}</span>
              </h3>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className={`btn ${activeCodeLang === 'node' ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActiveCodeLang('node')}>
                  Node.js
                </button>
                <button className={`btn ${activeCodeLang === 'python' ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActiveCodeLang('python')}>
                  Python
                </button>
                <button className={`btn ${activeCodeLang === 'curl' ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => setActiveCodeLang('curl')}>
                  cURL
                </button>
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(getCodeSnippet());
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="btn"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  padding: '6px',
                  borderRadius: '4px',
                  background: 'rgba(24, 24, 27, 0.8)',
                  border: '1px solid #3f3f46',
                  color: '#e4e4e7',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  zIndex: 10
                }}
                title={lang === 'en' ? 'Copy Code' : 'نسخ الكود'}
              >
                {copiedCode ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
              </button>
              <pre style={{ 
                backgroundColor: '#09090b', 
                border: '1px solid #27272a', 
                borderRadius: '6px', 
                padding: '20px', 
                paddingRight: '50px',
                fontSize: '13px', 
                color: '#34d399', 
                fontFamily: 'monospace', 
                overflowX: 'auto',
                maxWidth: '100%',
                lineHeight: 1.5
              }}>
                <code>{getCodeSnippet()}</code>
              </pre>
            </div>
          </div>

        </div>

        {/* Live Phone Mockup simulator */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          <div style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>{t.mockPhoneTitle}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.mockPhoneDesc}</p>
            {phoneNotifications.length > 0 && (
              <button 
                onClick={() => setPhoneNotifications([])} 
                style={{ 
                  fontSize: '11px', 
                  color: 'var(--danger-text)', 
                  border: 'none', 
                  background: 'none', 
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--danger-bg)'
                }}
              >
                ✕ {lang === 'en' ? 'Clear Simulator' : 'مسح المحاكي'}
              </button>
            )}
          </div>

          <div className="phone-simulator">
            <div className="phone-notch"></div>
            <div className="phone-screen" style={{ padding: activeNotificationDetail ? '0' : '15px' }}>
              {activeNotificationDetail ? (
                <>
                  {/* Simulated Mail Client View inside Phone */}
                  {activeNotificationDetail.type === 'email' && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%', 
                      color: '#000000',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 10,
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      {/* Mail App Header */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '30px 12px 10px 12px', 
                        borderBottom: '1px solid #eaeaea',
                        backgroundColor: '#f8f8f8',
                        direction: lang === 'ar' ? 'rtl' : 'ltr'
                      }}>
                        <button 
                          type="button"
                          onClick={() => setNotificationDetailWithTransition(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0070f3',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500
                          }}
                        >
                          {lang === 'ar' ? '← إغلاق' : '← Back'}
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                          {lang === 'ar' ? 'البريد المستلم' : 'Inbox'}
                        </span>
                        <div style={{ width: '50px' }}></div>
                      </div>

                      {/* Mail App Content Area */}
                      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: 'right' }}>
                        <div style={{ marginBottom: '12px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 4px 0', color: '#111' }}>
                            {activeNotificationDetail.title}
                          </h4>
                          <div style={{ fontSize: '11px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{lang === 'ar' ? 'المرسل: سومر سيند' : 'From: Sumer Send'}</span>
                            <span>{activeNotificationDetail.time}</span>
                          </div>
                        </div>

                        {/* Render raw HTML email body inside iframe in the phone screen */}
                        <div style={{ 
                          width: '100%', 
                          height: '380px', 
                          border: '1px solid #eaeaea', 
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff'
                        }}>
                          <iframe
                            srcDoc={`
                              <!DOCTYPE html>
                              <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                                <head>
                                  <meta charset="utf-8">
                                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
                                  <style>
                                    html, body {
                                      margin: 0;
                                      padding: 0;
                                      width: 100%;
                                      font-family: 'Cairo', -apple-system, sans-serif;
                                      background-color: #ffffff;
                                    }
                                    body {
                                      padding: 8px;
                                      box-sizing: border-box;
                                    }
                                    * {
                                      box-sizing: border-box;
                                    }
                                    img, table, td, div {
                                      max-width: 100% !important;
                                    }
                                    ::-webkit-scrollbar {
                                      width: 4px;
                                    }
                                    ::-webkit-scrollbar-thumb {
                                      background: rgba(0,0,0,0.15);
                                      border-radius: 2px;
                                    }
                                  </style>
                                </head>
                                <body>
                                  ${activeNotificationDetail.rawBody}
                                </body>
                              </html>
                            `}
                            title="Phone Email Preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulated SMS messaging client inside Phone */}
                  {activeNotificationDetail.type === 'sms' && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%', 
                      color: '#000000',
                      backgroundColor: '#ffffff',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      zIndex: 10,
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '30px 12px 10px 12px', 
                        borderBottom: '1px solid #eaeaea',
                        backgroundColor: '#f8f8f8',
                        direction: lang === 'ar' ? 'rtl' : 'ltr'
                      }}>
                        <button 
                          type="button"
                          onClick={() => setNotificationDetailWithTransition(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0070f3',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500
                          }}
                        >
                          {lang === 'ar' ? '← تراجع' : '← Back'}
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Sumer Send API</span>
                          <span style={{ fontSize: '9px', color: '#666' }}>{lang === 'ar' ? 'رسالة نصية' : 'Text Message'}</span>
                        </div>
                        <div style={{ width: '50px' }}></div>
                      </div>

                      <div style={{ flex: 1, backgroundColor: '#f2f2f7', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                        <div style={{ alignSelf: 'center', fontSize: '10px', color: '#8e8e93', margin: '4px 0' }}>
                          {lang === 'ar' ? 'اليوم' : 'Today'} {new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div style={{ 
                          maxWidth: '75%', 
                          backgroundColor: '#e9e9eb', 
                          color: '#000000', 
                          borderRadius: '16px', 
                          padding: '10px 14px', 
                          fontSize: '13px', 
                          lineHeight: 1.4,
                          alignSelf: 'flex-start',
                          borderBottomLeftRadius: '4px',
                          textAlign: 'start'
                        }}>
                          {activeNotificationDetail.body}
                        </div>
                      </div>
                      
                      <div style={{ padding: '8px 12px 25px 12px', borderTop: '1px solid #eaeaea', backgroundColor: '#f8f8f8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #d1d1d6', borderRadius: '18px', padding: '6px 12px', fontSize: '12px', color: '#8e8e93', textAlign: 'start' }}>
                          {lang === 'ar' ? 'الرد غير متاح للقوالب' : 'Replies disabled for templates'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Simulated WhatsApp app inside Phone */}
                  {activeNotificationDetail.type === 'whatsapp' && (
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      height: '100%', 
                      color: '#000000',
                      backgroundColor: '#ece5dd',
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      zIndex: 10,
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '30px 10px 10px 10px', 
                        backgroundColor: '#075e54',
                        color: '#ffffff',
                        direction: 'ltr'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button 
                            type="button"
                            onClick={() => setNotificationDetailWithTransition(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ffffff',
                              fontSize: '14px',
                              cursor: 'pointer',
                              padding: '4px 0',
                              fontWeight: 'bold'
                            }}
                          >
                            ←
                          </button>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%', 
                            backgroundColor: '#128c7e', 
                            color: '#ffffff', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            fontWeight: 'bold', 
                            fontSize: '12px',
                            border: '1px solid rgba(255,255,255,0.2)' 
                          }}>
                            SS
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#ffffff' }}>Sumer Send</span>
                              <span style={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                width: '12px', 
                                height: '12px', 
                                backgroundColor: '#25d366', 
                                borderRadius: '50%',
                                fontSize: '8px',
                                color: '#fff',
                                fontWeight: 'bold'
                              }}>✓</span>
                            </div>
                            <span style={{ fontSize: '9px', color: '#dcf8c6', opacity: 0.9 }}>{lang === 'ar' ? 'حساب أعمال رسمي' : 'Official Business Account'}</span>
                          </div>
                        </div>
                        <Phone size={16} style={{ opacity: 0.8, marginRight: '8px', marginLeft: '8px' }} />
                      </div>

                      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
                        <div style={{ 
                          alignSelf: 'center', 
                          backgroundColor: 'rgba(245, 158, 11, 0.12)', 
                          color: 'var(--warning-text)', 
                          fontSize: '10px', 
                          padding: '6px 10px', 
                          borderRadius: '6px', 
                          textAlign: 'center', 
                          maxWidth: '85%', 
                          lineHeight: 1.3,
                          boxShadow: '0 1px 1px rgba(0,0,0,0.02)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid rgba(245, 158, 11, 0.2)'
                        }}>
                          <Lock size={10} style={{ flexShrink: 0 }} />
                          <span>{lang === 'ar' ? 'الرسائل والمكالمات مشفرة تماماً. لا يمكن لأحد خارج الدردشة قراءتها.' : 'Messages and calls are end-to-end encrypted. No one outside can read them.'}</span>
                        </div>

                        <div style={{ 
                          maxWidth: '85%', 
                          backgroundColor: '#ffffff', 
                          borderRadius: '8px', 
                          padding: '8px 10px 4px 10px', 
                          fontSize: '12.5px', 
                          lineHeight: 1.4,
                          alignSelf: 'flex-start',
                          position: 'relative',
                          boxShadow: '0 1.5px 1.5px rgba(0,0,0,0.1)',
                          textAlign: 'start'
                        }}>
                          <div>{activeNotificationDetail.body}</div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            alignItems: 'center', 
                            gap: '2px', 
                            fontSize: '9px', 
                            color: '#888888', 
                            marginTop: '4px' 
                          }}>
                            <span>{new Date().toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span style={{ color: '#4fc3f7', fontSize: '10px' }}>✓✓</span>
                          </div>
                        </div>

                        <div style={{
                          alignSelf: 'flex-start',
                          width: '85%',
                          backgroundColor: '#ffffff',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 1.5px rgba(0,0,0,0.1)',
                          display: 'flex',
                          flexDirection: 'column',
                          marginTop: '-5px',
                          borderTop: '1px solid #f2f2f2'
                        }}>
                          <div style={{ 
                            padding: '8px 12px', 
                            fontSize: '12px', 
                            color: 'var(--accent-color)', 
                            textAlign: 'center', 
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: 'rgba(var(--accent-rgb), 0.02)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}>
                            <Globe size={12} />
                            <span>{lang === 'ar' ? 'فتح الرابط المرفق' : 'Open Attached Link'}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ padding: '8px 10px 25px 10px', backgroundColor: '#ece5dd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '20px', padding: '6px 12px', fontSize: '12px', color: '#888888', textAlign: 'start', border: '1px solid #e0e0e0' }}>
                          {lang === 'ar' ? 'الردود المباشرة غير مفعلة' : 'Direct replies disabled'}
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Normal Lock Screen View */
                <>
                  <div className="phone-header">
                    <span>12:30</span>
                    <span>Zain IQ / AsiaCell</span>
                  </div>

                  <div className="phone-notifications-list">
                    {phoneNotifications.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '20px' }}>
                        <MessageSquare size={36} color="var(--border-color)" style={{ marginBottom: '10px' }} />
                        <p style={{ fontSize: '12px', opacity: 0.6 }}>
                          {lang === 'en' ? 'Locked' : 'شاشة القفل فارغة'}
                        </p>
                      </div>
                    ) : (
                      phoneNotifications.map((noti) => (
                        <div 
                          key={noti.id} 
                          className="phone-notification"
                          onClick={() => {
                            setNotificationDetailWithTransition(noti);
                          }}
                          style={{ 
                            cursor: 'pointer',
                            transition: 'transform 0.1s ease',
                          }}
                        >
                          <div className="noti-header">
                            <span className="noti-app">
                              <span className={`noti-app-icon ${noti.type}`} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                {noti.type === 'email' && <Mail size={9} />}
                                {noti.type === 'sms' && <MessageSquare size={9} />}
                                {noti.type === 'whatsapp' && <Phone size={9} />}
                              </span>
                              <span>{noti.type.toUpperCase()}</span>
                            </span>
                            <span>{noti.time}</span>
                          </div>
                          <div className="noti-title">{noti.title}</div>
                          <div className="noti-body">{noti.body}</div>
                          <div style={{ 
                            fontSize: '10px', 
                            color: 'var(--accent-color)', 
                            marginTop: '6px', 
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {noti.type === 'email' && <Mail size={10} />}
                            {noti.type === 'sms' && <MessageSquare size={10} />}
                            {noti.type === 'whatsapp' && <Phone size={10} />}
                            <span>
                              {noti.type === 'email' 
                                ? (lang === 'ar' ? 'اضغط لعرض البريد بالكامل' : 'Click to read full email')
                                : noti.type === 'sms'
                                  ? (lang === 'ar' ? 'اضغط لفتح الرسالة' : 'Click to view message')
                                  : (lang === 'ar' ? 'اضغط لفتح محادثة الواتساب' : 'Click to open WhatsApp chat')
                              }
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </ScrollReveal>
  );
};
