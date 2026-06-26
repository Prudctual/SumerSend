import React, { useState } from 'react';
import { Globe, Plus, CheckCircle, Clock, Trash2, AlertCircle, Copy, Info, X } from 'lucide-react';
import { ScrollReveal, BentoCard } from './LandingView';
import { GuideBanner } from './GuideBanner';

interface DomainsViewProps {
  lang: 'en' | 'ar';
  domains: any[];
  setDomains: React.Dispatch<React.SetStateAction<any[]>>;
  hideHeader?: boolean;
}

export const DomainsView: React.FC<DomainsViewProps> = ({ lang, domains, setDomains, hideHeader = false }) => {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const translations = {
    en: {
      title: 'Domains & DNS Management',
      subtitle: 'Authenticate your domains to send emails securely and prevent spoofing.',
      addBtn: 'Add Domain',
      inputPlaceholder: 'e.g. startup.iq',
      domainCol: 'Domain',
      statusCol: 'Status',
      createdCol: 'Created At',
      actionsCol: 'Actions',
      verifyBtn: 'Verify DNS',
      verified: 'Verified',
      pending: 'Pending Verification',
      empty: 'No domains linked yet. Link your first domain below.',
      instructionsTitle: 'How to verify your domain in Iraq:',
      instructionsText: 'Add the CNAME records below to your DNS manager (e.g. Cloudflare, AsiaCell Host, or your domain registrar) to enable DKIM signature authentication.',
      domainError: 'Please enter a valid domain name.',
      guideTitle: 'Understanding DNS & Email Deliverability',
      guideText: 'Authenticate your domain with DKIM by adding the CNAME records below to your DNS provider (e.g., Cloudflare, GoDaddy) to ensure secure delivery and prevent spam filtering.',
    },
    ar: {
      title: 'إدارة النطاقات والـ DNS',
      subtitle: 'قم بتوثيق نطاقاتك لإرسال البريد الإلكتروني باسمك ومنع انتحال الهوية.',
      addBtn: 'إضافة نطاق',
      inputPlaceholder: 'مثال: shop.iq',
      domainCol: 'النطاق',
      statusCol: 'الحالة',
      createdCol: 'تاريخ الإضافة',
      actionsCol: 'العمليات',
      verifyBtn: 'تحقق من الـ DNS',
      verified: 'تم التحقق',
      pending: 'قيد الانتظار',
      empty: 'لم يتم ربط أي نطاقات حتى الآن. أضف نطاقك الأول أدناه.',
      instructionsTitle: 'كيفية التحقق من النطاق في العراق:',
      instructionsText: 'قم بإضافة سجلات CNAME الموضحة أدناه في مدير الـ DNS الخاص بك (مثل Cloudflare أو خوادم الاستضافة المحلية الخاصة بك) لتفعيل ميزة التوقيع الرقمي DKIM.',
      domainError: 'يرجى إدخال اسم نطاق صحيح.',
      guideTitle: 'فهم مصادقة النطاقات وتوصيل البريد',
      guideText: 'قم بمصادقة نطاقك عبر إضافة سجلات CNAME الموضحة أدناه إلى إعدادات الـ DNS الخاصة بك (مثل Cloudflare أو GoDaddy) لضمان وصول الرسائل بأمان ومنع تصنيفها كرسائل مزعجة.',
    },
  };

  const t = translations[lang];

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain || !newDomain.includes('.')) {
      setError(t.domainError);
      return;
    }

    const domainName = newDomain.trim().toLowerCase();
    if (domains.some(d => d.name === domainName)) {
      setError(lang === 'en' ? 'Domain already exists.' : 'النطاق مضاف بالفعل.');
      return;
    }

    const newObj = {
      id: Date.now().toString(),
      name: domainName,
      status: 'pending',
      createdAt: new Date().toISOString(),
      cnames: [
        { type: 'CNAME', host: `sm1._domainkey.${domainName}`, value: 'dkim1.sumersend.com' },
        { type: 'CNAME', host: `sm2._domainkey.${domainName}`, value: 'dkim2.sumersend.com' },
        { type: 'CNAME', host: `sm3._domainkey.${domainName}`, value: 'dkim3.sumersend.com' },
      ]
    };

    setDomains([...domains, newObj]);
    setNewDomain('');
    setError('');
  };

  const handleVerify = (id: string) => {
    setVerifyingId(id);
    setTimeout(() => {
      setDomains(prev => 
        prev.map(d => d.id === id ? { ...d, status: 'verified' } : d)
      );
      setVerifyingId(null);
      window.dispatchEvent(new CustomEvent('sumer-toast', {
        detail: { message: lang === 'en' ? 'Domain verified successfully!' : 'تم التحقق من النطاق بنجاح!', type: 'success' }
      }));
    }, 1500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(lang === 'en' ? 'Are you sure you want to delete this domain?' : 'هل أنت متأكد من حذف هذا النطاق؟')) {
      setDomains(prev => prev.filter(d => d.id !== id));
    }
  };

  return (
    <ScrollReveal>
      {/* Show header only if hideHeader is false */}
      {!hideHeader && (
        <div style={{ marginBottom: '20px' }} className="flex-between">
          <div>
            <h1 style={{ 
              fontSize: '26px', 
              fontWeight: 800, 
              letterSpacing: lang === 'ar' ? '0' : '-0.5px', 
              lineHeight: 1.15,
              marginBottom: '0px',
              color: 'var(--text-primary)'
            }}>{t.title}</h1>
          </div>
        </div>
      )}

      {showGuide && (
        <BentoCard 
          className="card" 
          style={{ 
            marginBottom: '24px', 
            padding: '24px', 
            backgroundColor: 'var(--panel-bg)', 
            borderRadius: '24px', 
            border: '1px solid var(--border-color)', 
            boxShadow: 'var(--card-shadow)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={() => setShowGuide(false)}
            style={{
              position: 'absolute',
              top: '16px',
              left: lang === 'ar' ? '16px' : 'auto',
              right: lang === 'ar' ? 'auto' : '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: lang === 'ar' ? 'right' : 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ padding: '8px', borderRadius: '12px', backgroundColor: 'var(--accent-bg)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center' }}>
                <Info size={18} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'دليل توثيق وربط النطاق الخاص بك' : 'Domain & DNS Authentication Guide'}
              </h3>
            </div>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {lang === 'ar' 
                ? 'ربط نطاقك الخاص يتيح لك إرسال رسائل البريد الإلكتروني باسم شركتك (مثل support@company.com) بشكل مباشر وموثوق، بدلاً من استخدام نطاقات عامة. هذا التوثيق يزيد الموثوقية ويحمي هويتك الرقمية.'
                : 'Connecting your custom domain lets you send emails directly from your brand (e.g. support@company.com). This authentication boosts credibility and protects your digital identity.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '8px' }}>
              {/* Box 1: Benefits */}
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--accent-color)' }}>🌟</span>
                  {lang === 'ar' ? 'ما الفائدة من هذه الميزة؟' : 'Why use this feature?'}
                </h4>
                <ul style={{ margin: 0, paddingInlineStart: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>
                    <strong>{lang === 'ar' ? 'الاحترافية وكسب الثقة:' : 'Professionalism:'}</strong> {lang === 'ar' ? 'إرسال الرسائل بهوية شركتك الرسمية أمام عملائك.' : 'Send emails with your brand identity to build instant customer trust.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'تجنب الـ Spam:' : 'Avoid Spam:'}</strong> {lang === 'ar' ? 'تخطي مجلد الرسائل المزعجة والوصول للـ Inbox مباشرة عبر توثيقات SPF/DKIM.' : 'Deliver straight to Inbox by verifying SPF and DKIM signatures.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'حماية العلامة التجارية:' : 'Brand Protection:'}</strong> {lang === 'ar' ? 'منع أي شخص أو مخترق من إرسال رسائل وهمية باسم نطاقك.' : 'Prevent spoofers and phishers from impersonating your domain.'}
                  </li>
                </ul>
              </div>

              {/* Box 2: How to connect */}
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: 'var(--accent-color)' }}>⚙️</span>
                  {lang === 'ar' ? 'كيف يعمل الربط؟' : 'How to connect?'}
                </h4>
                <ol style={{ margin: 0, paddingInlineStart: '18px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <li>
                    <strong>{lang === 'ar' ? 'أضف الدومين:' : 'Add Domain:'}</strong> {lang === 'ar' ? 'أدخل اسم نطاقك في الحقل أدناه لإضافته لقائمة الانتظار.' : 'Enter your domain name in the form below to register it.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'انسخ سجلات الـ DNS:' : 'Configure DNS:'}</strong> {lang === 'ar' ? 'انسخ سجلات CNAME الموضحة، وأضفها في لوحة تحكم نطاقك (مثل Cloudflare).' : 'Copy the generated CNAME records and add them in your DNS provider (e.g. Cloudflare).'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'تجنب تكرار SPF:' : 'Prevent Duplicate SPF:'}</strong> {lang === 'ar' ? 'إذا كان لديك سجل SPF سابق، ادمجه في سجل واحد مدمج لمنع التعارض.' : 'If you have an existing SPF record, merge them into one to prevent duplicates.'}
                  </li>
                  <li>
                    <strong>{lang === 'ar' ? 'التحقق والتفعيل:' : 'Verify & Activate:'}</strong> {lang === 'ar' ? 'اضغط على "تحقق من الـ DNS" لتفعيل نطاقك والبدء بالإرسال.' : 'Click "Verify DNS" to scan your settings and activate the domain.'}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </BentoCard>
      )}

      <BentoCard className="card" style={{ marginBottom: '24px', padding: '24px', backgroundColor: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
        <form onSubmit={handleAddDomain} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <label className="form-label" style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{lang === 'en' ? 'Domain Name' : 'اسم النطاق (Domain)'}</label>
            <input
              type="text"
              className="form-input"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder={t.inputPlaceholder}
              style={{
                width: '100%',
                height: '42px',
                borderRadius: '99px',
                border: '1px solid var(--border-color)',
                padding: '0 20px',
                backgroundColor: 'rgba(0,0,0,0.01)',
                fontSize: '14px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ height: '42px', minWidth: '130px', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <Plus size={16} />
            <span>{t.addBtn}</span>
          </button>
        </form>
        {error && (
          <div style={{ color: 'var(--danger-text)', fontSize: '13px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}
      </BentoCard>

      {/* Linked Domains List (Refactored to Premium Cards) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {domains.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', backgroundColor: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <Globe size={32} style={{ marginBottom: '10px', color: 'var(--text-muted)', opacity: 0.5 }} />
            <p style={{ margin: 0 }}>{t.empty}</p>
          </div>
        ) : (
          domains.map((domain) => (
            <div key={domain.id} className="flat-card" style={{ padding: '20px', borderRadius: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="card-icon-circle" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-color)' }}>
                    <Globe size={16} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)' }}>{domain.name}</h4>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {lang === 'en' ? 'Added on ' : 'تاريخ الإضافة: '}
                      {new Date(domain.createdAt).toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span className={`status-pill ${domain.status === 'verified' ? 'success' : 'warning'}`} style={{ borderRadius: '99px' }}>
                    {domain.status === 'verified' ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} />
                        <span>{t.verified}</span>
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        <span>{t.pending}</span>
                      </span>
                    )}
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    {domain.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '99px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifyingId !== null}
                      >
                        {verifyingId === domain.id ? (
                          <>
                            <span className="spinner-icon" style={{ display: 'inline-block', width: '10px', height: '10px', border: '2px solid var(--bg-color)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
                            <span>{lang === 'en' ? 'Verifying...' : 'جاري التحقق...'}</span>
                          </>
                        ) : (
                          <span>{t.verifyBtn}</span>
                        )}
                      </button>
                    )}
                    <button
                      className="btn btn-danger"
                      style={{ padding: '8px 12px', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDelete(domain.id)}
                      title="Delete Domain"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Render DNS records instructions if pending */}
              {domain.status === 'pending' && (
                <div style={{ marginTop: '20px', padding: '20px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '16px', animation: 'fadeIn 0.2s ease' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning-text)', marginBottom: '6px' }}>
                    {t.instructionsTitle}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    {t.instructionsText}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {domain.cnames.map((cname: any, idx: number) => (
                      <div key={idx} className="dns-cname-box" style={{ margin: 0, padding: '12px 16px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                          <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#ff3366', fontWeight: 'bold', width: '60px', flexShrink: 0 }}>{cname.type}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: '150px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Host / Name</span>
                            <span dir="ltr" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{cname.host}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                            <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Value</span>
                            <span dir="ltr" style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{cname.value}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn"
                            title="Copy Host"
                            style={{ padding: '6px 12px', borderRadius: '99px', backgroundColor: 'var(--panel-bg)', display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                              navigator.clipboard.writeText(cname.host);
                              window.dispatchEvent(new CustomEvent('sumer-toast', {
                                detail: { message: lang === 'en' ? 'Copied CNAME host!' : 'تم نسخ المضيف!', type: 'success' }
                              }));
                            }}
                          >
                            <Copy size={11} />
                            <span style={{ fontSize: '9px', marginLeft: '4px', marginRight: '4px', fontWeight: 600 }}>Host</span>
                          </button>
                          
                          <button
                            className="btn"
                            title="Copy Value"
                            style={{ padding: '6px 12px', borderRadius: '99px', backgroundColor: 'var(--panel-bg)', display: 'flex', alignItems: 'center' }}
                            onClick={() => {
                              navigator.clipboard.writeText(cname.value);
                              window.dispatchEvent(new CustomEvent('sumer-toast', {
                                detail: { message: lang === 'en' ? 'Copied CNAME value!' : 'تم نسخ قيمة السجل!', type: 'success' }
                              }));
                            }}
                          >
                            <Copy size={11} />
                            <span style={{ fontSize: '9px', marginLeft: '4px', marginRight: '4px', fontWeight: 600 }}>Value</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </ScrollReveal>
  );
};
