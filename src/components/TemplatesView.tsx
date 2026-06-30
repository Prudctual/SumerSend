import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  Monitor, 
  Smartphone, 
  Send, 
  Sliders, 
  FileText, 
  Sparkles, 
  Info,
  Clock
} from 'lucide-react';
import { templatesDb } from '../data/templates';
import type { TemplateItem, TemplateVariable } from '../data/templates';
import { TemplateBuilder } from './TemplateBuilder';
import { BentoCard } from './LandingView';
import { useSumer } from '../context/SumerContext';
import { API_BASE } from '../config';

interface TemplatesViewProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  setEmailBody: (body: string) => void;
  setEmailSubject: (subject: string) => void;
  setMsgBody: (body: string) => void;
  setPlaygroundChannel: (channel: 'email' | 'sms' | 'whatsapp') => void;
  setCurrentTab: (tab: string) => void;
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  setPhoneNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  domains: any[];
}

export const TemplatesView: React.FC<TemplatesViewProps> = (props) => {
  const { lang, theme, domains, setLogs, walletBalance, setWalletBalance } = props;
  const { user, setEmailSubject, setEmailBody, setMsgBody, setPlaygroundChannel } = useSumer();

  // Tabs & category state
  const [activeCategory, setActiveCategory] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Custom templates and selection states
  const [customTemplates, setCustomTemplates] = useState<TemplateItem[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({});
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Send test states
  const [testRecipient, setTestRecipient] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [emailFrom, setEmailFrom] = useState('onboarding@sumersend.com');
  
  // Copy state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Template builder state
  const [isBuildingTemplate, setIsBuildingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null);

  // Load custom templates and SMTP configuration for test sender
  const fetchCustomTemplates = () => {
    fetch(API_BASE + '/api/templates/custom')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomTemplates(data);
        }
      })
      .catch(err => console.warn('Could not load custom templates:', err));
  };

  const fetchSmtpConfig = () => {
    fetch(API_BASE + '/api/smtp/config')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setEmailFrom(data.user);
        } else if (data.from) {
          setEmailFrom(data.from);
        } else {
          const verified = domains.filter(d => d.status === 'verified');
          if (verified.length > 0) {
            setEmailFrom(`support@${verified[0].name}`);
          } else {
            setEmailFrom('onboarding@sumersend.com');
          }
        }
      })
      .catch(() => {
        const verified = domains.filter(d => d.status === 'verified');
        if (verified.length > 0) {
          setEmailFrom(`support@${verified[0].name}`);
        } else {
          setEmailFrom('onboarding@sumersend.com');
        }
      });
  };

  useEffect(() => {
    fetchCustomTemplates();
    fetchSmtpConfig();
  }, [domains]);

  // Combine static and custom templates
  const getMergedTemplates = () => {
    const emailTemplates = [
      ...templatesDb.email.map(t => ({ ...t, type: 'email' as const })),
      ...customTemplates.filter(t => t.type === 'email')
    ];
    const smsTemplates = [
      ...templatesDb.sms.map(t => ({ ...t, type: 'sms' as const })),
      ...customTemplates.filter(t => t.type === 'sms')
    ];
    const whatsappTemplates = [
      ...templatesDb.whatsapp.map(t => ({ ...t, type: 'whatsapp' as const })),
      ...customTemplates.filter(t => t.type === 'whatsapp')
    ];

    if (activeCategory === 'email') return emailTemplates;
    if (activeCategory === 'sms') return smsTemplates;
    if (activeCategory === 'whatsapp') return whatsappTemplates;

    // 'all'
    return [...emailTemplates, ...smsTemplates, ...whatsappTemplates];
  };

  const mergedList = getMergedTemplates();

  // Sync default selected template ID if none selected or if selected is not in list
  useEffect(() => {
    if (mergedList.length > 0) {
      const exists = mergedList.some(t => t.id === selectedTemplateId);
      if (!exists) {
        setSelectedTemplateId(mergedList[0].id);
      }
    } else {
      setSelectedTemplateId('');
    }
  }, [activeCategory, customTemplates]);

  // Selected template details
  const selectedTemplate = mergedList.find(t => t.id === selectedTemplateId) || mergedList[0];

  const isNameTag = (t: string) => {
    const tagLower = t.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const nameTags = [
      'name', 'username', 'user_name', 'customer_name', 'customername',
      'recipient_name', 'recipientname', 'reader_name', 'readername', 'friend_name',
      'friendname', 'member_name', 'membername', 'client_name', 'clientname',
      'subscriber_name', 'subscribername', 'user'
    ];
    if (nameTags.includes(tagLower)) return true;
    if (tagLower.endsWith('name')) {
      const excludes = ['platform', 'service', 'event', 'company', 'sender', 'brand', 'site', 'app', 'coupon', 'bank', 'product', 'hotel'];
      return !excludes.some(ex => tagLower.startsWith(ex));
    }
    return false;
  };

  const getInitialVariableValue = (v: any) => {
    if (isNameTag(v.key)) {
      return user?.name || (lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem');
    }
    return lang === 'ar' ? v.defaultValAr : v.defaultValEn;
  };

  // Sync variables for selected template
  useEffect(() => {
    if (selectedTemplate) {
      const initialVars: Record<string, string> = {};
      if (selectedTemplate.variables) {
        selectedTemplate.variables.forEach(v => {
          initialVars[v.key] = getInitialVariableValue(v);
        });
      }
      setPreviewVars(initialVars);
      setTestStatus(null);
      setTestRecipient('');
    } else {
      setPreviewVars({});
    }
  }, [selectedTemplateId, lang]);

  // Template compiler
  const compileTemplate = (template: TemplateItem, variables: Record<string, string>) => {
    if (!template) return { subject: '', body: '' };
    let body = template.body;
    let subject = lang === 'ar' ? (template.subjectAr || '') : (template.subjectEn || '');
    
    // Replace literal "عضو رائع" in the template itself if present before substituting vars
    const userName = user?.name || (lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem');
    body = body.replace(/عضو رائع/g, userName).replace(/Valued Member/g, userName);
    subject = subject.replace(/عضو رائع/g, userName).replace(/Valued Member/g, userName);

    if (template.variables) {
      template.variables.forEach(v => {
        const defaultVal = getInitialVariableValue(v);
        const val = variables[v.key] !== undefined && variables[v.key] !== ''
          ? variables[v.key]
          : defaultVal;
        
        const escapeKey = v.key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const tagRegexDouble = new RegExp(`\\{\\{\\s*${escapeKey}\\s*\\}\\}`, 'g');
        const tagRegexSingle = new RegExp(`\\{\\s*${escapeKey}\\s*\\}`, 'g');
        body = body.replace(tagRegexDouble, val).replace(tagRegexSingle, val);
        subject = subject.replace(tagRegexDouble, val).replace(tagRegexSingle, val);
      });
    }
    return { subject, body };
  };

  const { subject: compiledSubject, body: compiledBody } = selectedTemplate
    ? compileTemplate(selectedTemplate, previewVars)
    : { subject: '', body: '' };

  const otpVariable = selectedTemplate?.variables?.find(
    v => v.key.toLowerCase().includes('otp') || v.key.toLowerCase().includes('code') || v.key.toLowerCase().includes('coupon')
  );
  const activeOtpCode = otpVariable ? (previewVars[otpVariable.key] || '') : null;

  // Copy template content
  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Switch to playground tab
  const handleOpenInPlayground = () => {
    if (!selectedTemplate) return;
    
    if (selectedTemplate.type === 'email') {
      setEmailSubject(compiledSubject || 'Free Minds Digest');
      setEmailBody(compiledBody);
    } else {
      setMsgBody(compiledBody);
    }
    setPlaygroundChannel(selectedTemplate.type || 'sms');
    props.setCurrentTab('playground');
  };

  // Launch campaign from template
  const handleStartCampaign = () => {
    if (!selectedTemplate) return;
    localStorage.setItem('sumersend_selected_template_id', selectedTemplate.id);
    props.setCurrentTab('campaigns');
  };

  // Direct Test Dispatch
  const handleSendTest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    if (!testRecipient.trim()) {
      setTestStatus({
        type: 'error',
        message: lang === 'ar' ? 'يرجى إدخال وجهة الإرسال التجريبي.' : 'Please enter a test recipient destination.'
      });
      return;
    }

    const cost = selectedTemplate.type === 'email' ? 10 : selectedTemplate.type === 'sms' ? 120 : 150;
    if (walletBalance < cost) {
      setTestStatus({
        type: 'error',
        message: lang === 'ar' ? 'رصيد المحفظة غير كافٍ لإجراء الإرسال التجريبي.' : 'Insufficient wallet balance to perform this test dispatch.'
      });
      return;
    }

    setIsSendingTest(true);
    setTestStatus(null);

    const apiEndpoint = selectedTemplate.type === 'email'
      ? API_BASE + '/v1/emails'
      : selectedTemplate.type === 'sms'
        ? API_BASE + '/v1/sms'
        : API_BASE + '/v1/whatsapp';

    const apiBody = selectedTemplate.type === 'email'
      ? { from: emailFrom, to: testRecipient, subject: compiledSubject, html: compiledBody }
      : { to: testRecipient, body: compiledBody };

    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sm_live_8f0a2e5d9c7b1a2e3f4d5c6b7a8f9e0d'
        },
        body: JSON.stringify(apiBody)
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || data.error || 'Test send failed');
      }

      setWalletBalance(prev => prev - cost);
      setTestStatus({
        type: 'success',
        message: lang === 'ar' 
          ? `تم إرسال رسالة التجربة بنجاح! خصم ${cost} د.ع من رصيدك.` 
          : `Test message dispatched successfully! Cost: ${cost} IQD.`
      });

      // Sync backend logs
      const logsRes = await fetch(API_BASE + '/api/logs');
      const serverLogs = await logsRes.json();
      if (Array.isArray(serverLogs)) {
        setLogs(serverLogs);
      }
    } catch (err: any) {
      setTestStatus({
        type: 'error',
        message: (lang === 'ar' ? 'فشل الإرسال: ' : 'Dispatch failed: ') + err.message
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Custom template save handler
  const handleSaveCustomTemplate = async (payload: TemplateItem) => {
    try {
      const res = await fetch(API_BASE + '/api/templates/custom', {
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

  // Custom template delete handler
  const handleDeleteTemplate = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = lang === 'ar' ? 'هل أنت متأكد من حذف هذا القالب المخصص؟' : 'Are you sure you want to delete this custom template?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE}/api/templates/custom/${templateId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
        if (selectedTemplateId === templateId) {
          const remaining = getMergedTemplates().filter(t => t.id !== templateId);
          setSelectedTemplateId(remaining[0]?.id || '');
        }
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
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
            /* Smart OTP hover & active styles */
            .otp-code-box {
              transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1) !important;
            }
            .otp-code-box:hover {
              background-color: #e4e4e7 !important;
              border-color: #a1a1aa !important;
              transform: scale(1.04);
              box-shadow: 0 4px 12px rgba(0,0,0,0.06);
            }
            .otp-code-box:active {
              transform: scale(0.97);
            }
          </style>
          <script>
            document.addEventListener('DOMContentLoaded', () => {
              const otpBox = document.querySelector('.otp-code-box');
              if (otpBox) {
                otpBox.addEventListener('click', () => {
                  const codeText = otpBox.innerText.trim();
                  navigator.clipboard.writeText(codeText).then(() => {
                    showTooltip(otpBox, '${lang === 'ar' ? 'تم نسخ رمز التحقق بنجاح! 📋' : 'Verification code copied! 📋'}');
                  }).catch(err => {
                    console.error('Could not copy OTP: ', err);
                  });
                });
              }
            });

            function showTooltip(element, message) {
              let tooltip = document.getElementById('otp-success-tooltip');
              if (!tooltip) {
                tooltip = document.createElement('div');
                tooltip.id = 'otp-success-tooltip';
                tooltip.style.position = 'fixed';
                tooltip.style.bottom = '24px';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%) translateY(10px)';
                tooltip.style.backgroundColor = '#09090b';
                tooltip.style.color = '#ffffff';
                tooltip.style.padding = '10px 20px';
                tooltip.style.borderRadius = '30px';
                tooltip.style.fontSize = '12.5px';
                tooltip.style.fontWeight = '600';
                tooltip.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.2)';
                tooltip.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
                tooltip.style.zIndex = '99999';
                tooltip.style.opacity = '0';
                tooltip.style.fontFamily = "'Cairo', -apple-system, sans-serif";
                tooltip.style.display = 'flex';
                tooltip.style.alignItems = 'center';
                tooltip.style.gap = '8px';
                tooltip.style.whiteSpace = 'nowrap';
                tooltip.innerHTML = '<span style="color:#22c55e;font-weight:bold;">✓</span> ' + message;
                document.body.appendChild(tooltip);
              }
              
              // Force reflow
              tooltip.offsetHeight;
              
              tooltip.style.opacity = '1';
              tooltip.style.transform = 'translateX(-50%) translateY(0)';
              
              setTimeout(() => {
                tooltip.style.opacity = '0';
                tooltip.style.transform = 'translateX(-50%) translateY(10px)';
              }, 2200);
            }
          </script>
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

  // Dictionary for template cards channel indicator
  const getChannelColor = (type?: string) => {
    if (type === 'email') return '#2563eb'; // Royal Solid Blue
    if (type === 'whatsapp') return '#16a34a'; // Vibrant WhatsApp Green
    return '#4b5563'; // Tech Grey for SMS
  };

  const getChannelLabel = (type?: string) => {
    if (type === 'email') return lang === 'ar' ? 'بريد' : 'EMAIL';
    if (type === 'whatsapp') return lang === 'ar' ? 'واتس' : 'WHATSAPP';
    return lang === 'ar' ? 'نصية' : 'SMS';
  };

  // Filter templates list based on search query
  const filteredTemplatesList = mergedList.filter(temp => {
    const name = lang === 'ar' ? temp.nameAr : temp.nameEn;
    const desc = lang === 'ar' ? temp.descAr : temp.descEn;
    const query = searchQuery.toLowerCase().trim();
    return (
      name.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query) ||
      temp.id.toLowerCase().includes(query)
    );
  });

  const isRtl = lang === 'ar';

  if (isBuildingTemplate) {
    return (
      <TemplateBuilder
        lang={lang}
        template={editingTemplate}
        initialCategory={activeCategory === 'all' ? 'email' : activeCategory}
        onSave={handleSaveCustomTemplate}
        onCancel={() => {
          setIsBuildingTemplate(false);
          setEditingTemplate(null);
        }}
      />
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px',
      direction: isRtl ? 'rtl' : 'ltr',
      fontFamily: 'inherit'
    }}>
      
      {/* 1. Header Toolbar Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
      }}>
        {/* Category Filter Pills (Styled matching class in index.css) */}
        <div className="template-tab-container">
          {(['all', 'email', 'sms', 'whatsapp'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`template-tab-btn ${cat}-tab ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat === 'all' && <FileText size={14} />}
              {cat === 'email' && <Mail size={14} />}
              {cat === 'sms' && <Phone size={14} />}
              {cat === 'whatsapp' && <MessageSquare size={14} />}
              <span>
                {cat === 'all' && (lang === 'ar' ? 'الكل' : 'All')}
                {cat === 'email' && (lang === 'ar' ? 'البريد' : 'Email')}
                {cat === 'sms' && (lang === 'ar' ? 'SMS' : 'SMS')}
                {cat === 'whatsapp' && (lang === 'ar' ? 'واتساب' : 'WhatsApp')}
              </span>
            </button>
          ))}
        </div>

        {/* Action Button: Create Custom Template */}
        <button
          onClick={() => {
            setEditingTemplate(null);
            setIsBuildingTemplate(true);
          }}
          className="create-template-btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 650,
            cursor: 'pointer'
          }}
        >
          <Plus size={14} />
          <span>{lang === 'ar' ? 'إنشاء قالب مخصص' : 'Create Custom Template'}</span>
        </button>
      </div>

      {/* 2. Main Two-Column split screen layout (Using pre-designed .templates-grid from index.css) */}
      <div className="templates-grid">
        
        {/* Left Side: Directory Scroll List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Elegant search filter */}
          <div style={{
            position: 'relative',
            width: '100%'
          }}>
            <Search size={16} style={{
              position: 'absolute',
              top: '50%',
              transform: 'translateY(-50%)',
              right: isRtl ? '12px' : 'auto',
              left: isRtl ? 'auto' : '12px',
              color: 'var(--text-muted)',
              zIndex: 5
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث عن اسم القالب أو محتواه...' : 'Search template name or content...'}
              style={{
                width: '100%',
                padding: isRtl ? '10px 38px 10px 14px' : '10px 14px 10px 38px',
                fontSize: '13.5px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--panel-muted)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
            />
          </div>

          {/* Directory card list */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '680px',
            overflowY: 'auto',
            paddingRight: isRtl ? '0' : '4px',
            paddingLeft: isRtl ? '4px' : '0'
          }}>
            {filteredTemplatesList.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px dashed var(--border-color)',
                borderRadius: '6px'
              }}>
                <span style={{ fontSize: '13.5px' }}>
                  {lang === 'ar' ? 'لا توجد قوالب تطابق بحثك الحالي' : 'No templates match your search criteria'}
                </span>
              </div>
            ) : (
              filteredTemplatesList.map(temp => {
                const isCustom = customTemplates.some(ct => ct.id === temp.id);
                const isSelected = selectedTemplateId === temp.id;
                const variablesCount = temp.variables?.length || 0;
                
                return (
                  <div
                    key={temp.id}
                    onClick={() => setSelectedTemplateId(temp.id)}
                    style={{
                      display: 'flex',
                      minHeight: '92px',
                      borderRadius: '6px', // Reduced radius (sharper Vercel style)
                      border: `1px solid ${isSelected ? 'var(--text-primary)' : 'var(--border-color)'}`,
                      // Solid/transparent safe theme-dependent background to prevent transparency bugs
                      backgroundColor: isSelected 
                        ? (theme === 'dark' ? 'rgba(39, 39, 42, 0.85)' : 'rgba(244, 244, 245, 0.85)')
                        : (theme === 'dark' ? 'rgba(24, 24, 27, 0.55)' : 'rgba(255, 255, 255, 0.55)'),
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none',
                      position: 'relative'
                    }}
                  >
                    {/* Vertical Side Block Header - Solid Prominent Channel Color */}
                    <div style={{
                      width: '44px', // Wider vertical header
                      backgroundColor: getChannelColor(temp.type),
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 0',
                      gap: '8px',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {temp.type === 'email' && <Mail size={14} style={{ flexShrink: 0 }} />}
                      {temp.type === 'sms' && <Phone size={14} style={{ flexShrink: 0 }} />}
                      {temp.type === 'whatsapp' && <MessageSquare size={14} style={{ flexShrink: 0 }} />}
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        display: 'inline-block',
                        transform: 'rotate(-90deg)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        {getChannelLabel(temp.type)}
                      </span>
                    </div>

                    {/* Main Card Content */}
                    <div style={{
                      flex: 1,
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <h4 style={{
                            fontSize: '13.5px',
                            fontWeight: 700,
                            margin: 0,
                            color: 'var(--text-primary)'
                          }}>
                            {lang === 'ar' ? temp.nameAr : temp.nameEn}
                          </h4>

                        </div>

                        {/* Origin pill: System / Custom */}
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 600,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: isCustom ? 'rgba(37, 99, 235, 0.08)' : 'var(--panel-muted)',
                          color: isCustom ? '#2563eb' : 'var(--text-muted)',
                          border: isCustom ? '1px solid rgba(37, 99, 235, 0.15)' : '1px solid var(--border-color)',
                          whiteSpace: 'nowrap'
                        }}>
                          {isCustom ? (lang === 'ar' ? 'مخصص' : 'Custom') : (lang === 'ar' ? 'افتراضي' : 'System')}
                        </span>
                      </div>



                      {/* Footer metrics area */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '4px',
                        // Force variables count to always render on the LEFT side of the card
                        flexDirection: isRtl ? 'row-reverse' : 'row'
                      }}>
                        {/* Variables count badge: on the left side of the card, crisp border, uniform color */}
                        <div style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: 'var(--text-secondary)',
                          backgroundColor: 'var(--panel-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Sliders size={10} style={{ color: 'var(--text-muted)' }} />
                          <span>
                            {lang === 'ar' 
                              ? `${variablesCount} متغير${variablesCount !== 1 ? 'ات' : ''}` 
                              : `${variablesCount} variable${variablesCount !== 1 ? 's' : ''}`
                            }
                          </span>
                        </div>

                        {/* Action buttons inside the card */}
                        {isCustom && (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingTemplate(temp);
                                setIsBuildingTemplate(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title={lang === 'ar' ? 'تعديل القالب' : 'Edit Template'}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteTemplate(temp.id, e)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: 'var(--danger-color)',
                                padding: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title={lang === 'ar' ? 'حذف القالب' : 'Delete Template'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: BentoCard visual preview with spotlight effects */}
        {selectedTemplate ? (
          <BentoCard style={{
            position: 'sticky',
            top: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            minHeight: '450px',
            borderRadius: '6px',
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border-color)'
          }}>
            
            {/* Template Header metadata */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  margin: '0 0 4px 0',
                  color: 'var(--text-primary)'
                }}>
                  {lang === 'ar' ? selectedTemplate.nameAr : selectedTemplate.nameEn}
                </h3>

              </div>

              {/* Utility actions */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleCopy(selectedTemplate.body, selectedTemplate.id)}
                  style={{
                    backgroundColor: 'var(--panel-muted)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500
                  }}
                  title={lang === 'ar' ? 'نسخ الكود المصدري' : 'Copy source code'}
                >
                  {copiedId === selectedTemplate.id ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                  <span>{copiedId === selectedTemplate.id ? (lang === 'ar' ? 'تم!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            {/* Email Subject block */}
            {selectedTemplate.type === 'email' && compiledSubject && (
              <div style={{
                backgroundColor: 'var(--panel-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                padding: '10px 14px',
                fontSize: '13px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <strong style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {lang === 'ar' ? 'الموضوع:' : 'Subject:'}
                </strong>
                <span style={{ color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                  {compiledSubject}
                </span>
              </div>
            )}

            {/* Real-time Interactive Variables Input Form */}
            {selectedTemplate.variables && selectedTemplate.variables.length > 0 && (
              <div style={{
                backgroundColor: 'var(--panel-muted)',
                border: '1px dashed var(--border-color)',
                borderRadius: '6px',
                padding: '14px 16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '12px'
                }}>
                  <Sliders size={13} style={{ color: '#2563eb' }} />
                  <strong style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'تخصيص متغيرات المعاينة' : 'Customize Preview Variables'}
                  </strong>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: '12px',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  paddingRight: isRtl ? '0' : '4px',
                  paddingLeft: isRtl ? '4px' : '0'
                }}>
                  {selectedTemplate.variables.map(v => (
                    <div key={v.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'var(--text-secondary)'
                      }}>
                        {lang === 'ar' ? v.labelAr : v.labelEn}
                        <span style={{
                          fontFamily: 'monospace',
                          color: 'var(--text-muted)',
                          marginRight: isRtl ? '4px' : '0',
                          marginLeft: isRtl ? '0' : '4px',
                          fontSize: '9.5px'
                        }}>
                          ({`{{${v.key}}}`})
                        </span>
                      </label>
                      <input
                        type="text"
                        value={previewVars[v.key] || ''}
                        onChange={e => setPreviewVars(prev => ({
                          ...prev,
                          [v.key]: e.target.value
                        }))}
                        style={{
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--panel-bg)',
                          color: 'var(--text-primary)',
                          outline: 'none'
                        }}
                        placeholder={lang === 'ar' ? v.defaultValAr : v.defaultValEn}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Visual Preview Frame viewport */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              {/* Preview header with size options for Email */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {lang === 'ar' ? 'معاينة حية ومباشرة' : 'Live Mockup Viewport'}
                  </span>
                  {activeOtpCode && (
                    <div 
                      onClick={() => handleCopy(activeOtpCode, 'otp_top')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: 'rgba(37, 99, 235, 0.08)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                        padding: '3px 10px',
                        borderRadius: '99px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        userSelect: 'none',
                        animation: 'status-pulse 2s infinite'
                      }}
                      className="otp-preview-badge"
                      title={lang === 'ar' ? 'انقر لنسخ الرمز التأكيدي' : 'Click to copy verification code'}
                    >
                      <span style={{ fontSize: '10px', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#2563eb' }}></span>
                        {lang === 'ar' ? `رمز التأكيد: ${activeOtpCode}` : `Code: ${activeOtpCode}`}
                      </span>
                      {copiedId === 'otp_top' ? (
                        <Check size={10} color="#10b981" />
                      ) : (
                        <Copy size={10} color="#2563eb" style={{ opacity: 0.8 }} />
                      )}
                    </div>
                  )}
                </div>

                {selectedTemplate.type === 'email' && (
                  <div style={{
                    display: 'flex',
                    backgroundColor: 'var(--panel-muted)',
                    padding: '2px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    gap: '2px'
                  }}>
                    <button
                      onClick={() => setPreviewDevice('desktop')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: previewDevice === 'desktop' ? 'var(--panel-bg)' : 'transparent',
                        color: previewDevice === 'desktop' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: previewDevice === 'desktop' ? 600 : 500
                      }}
                    >
                      <Monitor size={11} />
                      <span>{lang === 'ar' ? 'حاسوب' : 'Desktop'}</span>
                    </button>
                    <button
                      onClick={() => setPreviewDevice('mobile')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        fontSize: '11px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: previewDevice === 'mobile' ? 'var(--panel-bg)' : 'transparent',
                        color: previewDevice === 'mobile' ? 'var(--text-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: previewDevice === 'mobile' ? 600 : 500
                      }}
                    >
                      <Smartphone size={11} />
                      <span>{lang === 'ar' ? 'هاتف' : 'Mobile'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Viewport Frame (Increased height to 480px for better vertical readability) */}
              <div style={{
                height: '480px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                backgroundColor: selectedTemplate.type === 'email' ? '#f4f4f5' : selectedTemplate.type === 'whatsapp' ? '#efeae2' : '#f3f4f6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: selectedTemplate.type === 'email' ? 'flex-start' : 'center',
                overflow: 'auto',
                padding: '16px'
              }}>
                {selectedTemplate.type === 'email' ? (
                  // Email HTML Mockup Viewport
                  previewDevice === 'mobile' ? (
                    /* Mobile Safari Bezel Frame */
                    <div style={{
                      width: '260px',
                      height: '420px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      borderRadius: '24px',
                      border: '8px solid #18181b',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      {/* Speaker Notch */}
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '50px',
                        height: '10px',
                        borderRadius: '5px',
                        backgroundColor: '#000',
                        zIndex: 100
                      }} />
                      <div style={{ flex: 1, overflow: 'hidden', marginTop: '12px' }}>
                        <iframe
                          srcDoc={getIframeSrcDoc(compiledBody)}
                          title="Mobile Email Preview"
                          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                        />
                      </div>
                    </div>
                  ) : (
                    /* Desktop Browser Frame */
                    <div style={{
                      width: '100%',
                      height: '420px',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '24px',
                        backgroundColor: 'var(--panel-muted)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0 8px',
                        gap: '4px',
                        direction: 'ltr'
                      }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#eab308' }} />
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                        <div style={{
                          height: '14px',
                          flex: 1,
                          margin: '0 12px',
                          backgroundColor: 'var(--panel-bg)',
                          borderRadius: '3px',
                          border: '1px solid var(--border-color)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '8px',
                          color: 'var(--text-muted)',
                          fontFamily: 'monospace'
                        }}>
                          sumersend.com/templates/preview
                        </div>
                      </div>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <iframe
                          srcDoc={getIframeSrcDoc(compiledBody)}
                          title="Desktop Browser Preview"
                          style={{ width: '100%', height: '100%', border: 'none', backgroundColor: '#ffffff' }}
                        />
                      </div>
                    </div>
                  )
                ) : selectedTemplate.type === 'whatsapp' ? (
                  // WhatsApp Chat Bubble Mockup
                  <div style={{
                    width: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'sans-serif',
                    direction: 'ltr'
                  }}>
                    <div style={{
                      backgroundColor: theme === 'dark' ? '#005c4b' : '#d9fdd3',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      borderTopLeftRadius: '0',
                      boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      position: 'relative',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: theme === 'dark' ? '#e9edef' : '#111b21',
                      wordBreak: 'break-word',
                      alignSelf: 'flex-start',
                      maxWidth: '100%'
                    }}>
                      <div style={{ 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        direction: isRtl ? 'rtl' : 'ltr',
                        textAlign: isRtl ? 'right' : 'left'
                      }}>
                        {compiledBody}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        fontSize: '9px',
                        color: theme === 'dark' ? '#8696a0' : '#667781',
                        marginTop: '4px',
                        gap: '2px'
                      }}>
                        <span>12:00 PM</span>
                        <span style={{ color: '#53bdeb' }}>✓✓</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // SMS Chat Bubble Mockup
                  <div style={{
                    width: '260px',
                    display: 'flex',
                    flexDirection: 'column',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    <div style={{
                      backgroundColor: theme === 'dark' ? '#27272a' : '#e9e9eb',
                      padding: '10px 14px',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '4px',
                      color: theme === 'dark' ? '#f4f4f5' : '#000000',
                      fontSize: '12.5px',
                      lineHeight: 1.45,
                      maxWidth: '85%',
                      alignSelf: 'flex-start',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      wordBreak: 'break-word'
                    }}>
                      <div style={{ 
                        whiteSpace: 'pre-wrap',
                        direction: isRtl ? 'rtl' : 'ltr',
                        textAlign: isRtl ? 'right' : 'left'
                      }}>
                        {compiledBody}
                      </div>
                    </div>
                    <span style={{
                      fontSize: '9px',
                      color: 'var(--text-muted)',
                      marginTop: '4px',
                      alignSelf: 'flex-start',
                      marginLeft: '6px'
                    }}>
                      iMessage • SMS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Test sending panel */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '18px'
            }}>
              <form onSubmit={handleSendTest} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <label style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--text-secondary)'
                }}>
                  {lang === 'ar' ? 'إرسال نموذج فوري للتجربة' : 'Send Test Sample Dispatch'}
                </label>
                
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <input
                    type={selectedTemplate.type === 'email' ? 'email' : 'text'}
                    value={testRecipient}
                    onChange={e => setTestRecipient(e.target.value)}
                    placeholder={
                      selectedTemplate.type === 'email'
                        ? (lang === 'ar' ? 'أدخل البريد الإلكتروني للمستلم...' : 'Recipient email address...')
                        : (lang === 'ar' ? 'رقم الهاتف (مثال: 964770000000)...' : 'Phone number (e.g. 964770000000)...')
                    }
                    disabled={isSendingTest}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      fontSize: '12.5px',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--panel-muted)',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isSendingTest}
                    className="btn btn-primary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-color)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      opacity: isSendingTest ? 0.7 : 1
                    }}
                  >
                    {isSendingTest ? (
                      <Clock size={13} className="animate-spin" />
                    ) : (
                      <Send size={13} style={{ transform: isRtl ? 'rotate(180deg)' : 'none' }} />
                    )}
                    <span>{lang === 'ar' ? 'إرسال' : 'Send'}</span>
                  </button>
                </div>
              </form>

              {/* Status Message */}
              {testStatus && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '10px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  border: `1px solid ${testStatus.type === 'success' ? 'rgba(22, 163, 74, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                  backgroundColor: testStatus.type === 'success' ? 'rgba(22, 163, 74, 0.05)' : 'rgba(239, 68, 68, 0.05)',
                  color: testStatus.type === 'success' ? '#16a34a' : '#ef4444'
                }}>
                  <Info size={14} />
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>

            {/* Direct Integration Redirection buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '18px'
            }}>
              <button
                onClick={handleOpenInPlayground}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--panel-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <ExternalLink size={14} />
                <span>{lang === 'ar' ? 'تعديل في المختبر' : 'Edit in Playground'}</span>
              </button>

              <button
                onClick={handleStartCampaign}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--panel-muted)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <Sparkles size={14} />
                <span>{lang === 'ar' ? 'بدء حملة بث' : 'Start Broadcast'}</span>
              </button>
            </div>

          </BentoCard>
        ) : (
          <BentoCard style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--text-muted)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            borderRadius: '6px',
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border-color)'
          }}>
            <FileText size={40} style={{ color: 'var(--text-muted)' }} />
            <span>{lang === 'ar' ? 'يرجى اختيار قالب لعرض تفاصيله ومعاينته.' : 'Please select a template to preview details.'}</span>
          </BentoCard>
        )}

      </div>
    </div>
  );
};
