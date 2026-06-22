import React, { useState, useEffect } from 'react';
import { DomainsView } from './DomainsView';
import { DeveloperHubView } from './DeveloperHubView';
import { SettingsView } from './SettingsView';
import { ScrollReveal } from './LandingView';
import { 
  Globe, 
  Key, 
  Webhook, 
  Play, 
  Code, 
  Mail, 
  Smartphone, 
  BookOpen, 
  Shield, 
  Info 
} from 'lucide-react';

interface SettingsIntegrationsViewProps {
  lang: 'en' | 'ar';
  domains: any[];
  setDomains: any;
  apiKeys: any[];
  setApiKeys: any;
  webhooks: any[];
  setWebhooks: any;
  logs: any[];
  setLogs: any;
  setWalletBalance: any;
  walletBalance: number;
  setPhoneNotifications: any;
  setCurrentTab: any;
  setEmailBody: any;
  setEmailSubject: any;
  setMsgBody: any;
  setPlaygroundChannel: any;
  initialTab?: 'domains' | 'api' | 'smtp';
}

export const SettingsIntegrationsView: React.FC<SettingsIntegrationsViewProps> = (props) => {
  const { lang, initialTab } = props;
  
  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'smtp';
    if (tab === 'api') return 'apikeys';
    return tab;
  };

  const [activeTab, setActiveTab] = useState<string>(() => getFlatTabFromInitial(initialTab));
  const [hideOuterLayout, setHideOuterLayout] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getFlatTabFromInitial(initialTab));
    }
  }, [initialTab]);

  // Grouped Menu Structure ordered by importance
  const menuSections = [
    {
      titleAr: 'قنوات الإرسال الأساسية',
      titleEn: 'CORE SENSING CHANNELS',
      items: [
        { id: 'smtp', labelAr: 'خادم البريد SMTP', labelEn: 'SMTP Configuration', icon: Mail },
        { id: 'whatsapp', labelAr: 'ربط واتساب وإرساله', labelEn: 'WhatsApp Connection', icon: Smartphone },
        { id: 'domains', labelAr: 'النطاقات والـ DNS', labelEn: 'Domains & DNS', icon: Globe },
      ]
    },
    {
      titleAr: 'الربط البرمجي والـ API',
      titleEn: 'API & DEVELOPER HUB',
      items: [
        { id: 'apikeys', labelAr: 'مفاتيح الـ API', labelEn: 'API Keys', icon: Key },
        { id: 'webhooks', labelAr: 'الويب هوكس (Webhooks)', labelEn: 'Webhooks', icon: Webhook },
        { id: 'quickstart', labelAr: 'البدء السريع والتجربة', labelEn: 'API Quickstart', icon: Play },
        { id: 'code', labelAr: 'منشئ الأكواد التفاعلي', labelEn: 'Code Builder', icon: Code },
      ]
    },
    {
      titleAr: 'القوالب والمحتوى',
      titleEn: 'CONTENT & TEMPLATES',
      items: [
        { id: 'templates', labelAr: 'معرض القوالب الإبداعية', labelEn: 'Creative Templates', icon: BookOpen },
      ]
    },
    {
      titleAr: 'الحماية وإعدادات النظام',
      titleEn: 'SECURITY & SYSTEM HUB',
      items: [
        { id: 'security', labelAr: 'الأمان والتحقق (2FA)', labelEn: 'Security & 2FA', icon: Shield },
        { id: 'system', labelAr: 'حالة النظام والتعرفة', labelEn: 'System Hub & Tariff', icon: Info },
      ]
    }
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
      smtp: {
        titleAr: 'خادم البريد SMTP',
        titleEn: 'SMTP Server Configuration',
        descAr: 'اضبط خادم البريد الخاص بك لتفعيل إرسال رسائل حقيقية عبر بواباتنا إلى صناديق الوارد.',
        descEn: 'Configure SMTP credentials to enable delivery of real emails to inboxes.'
      },
      whatsapp: {
        titleAr: 'ربط واتساب النشط',
        titleEn: 'WhatsApp Integration',
        descAr: 'اربط حساب واتساب الشخصي أو التجاري مباشرة لتفعيل إرسال الإشعارات عبر الـ WebSockets.',
        descEn: 'Sync your WhatsApp session via WebSockets for rapid notification delivery.'
      },
      domains: {
        titleAr: 'إدارة النطاقات والـ DNS',
        titleEn: 'Domains & DNS Management',
        descAr: 'قم بتوثيق نطاقاتك لإرسال البريد الإلكتروني باسمك ومنع انتحال الهوية.',
        descEn: 'Authenticate your domains to send emails securely and prevent spoofing.'
      },
      apikeys: {
        titleAr: 'مفاتيح الـ API والمطور',
        titleEn: 'API Keys & Developer Access',
        descAr: 'إدارة وإنشاء مفاتيح الـ API بصلاحيات مخصصة للربط البرمجي الآمن.',
        descEn: 'Create and manage access credentials for your system integrations.'
      },
      webhooks: {
        titleAr: 'إدارة الويب هوكس (Webhooks)',
        titleEn: 'Webhook Endpoints',
        descAr: 'قم بتهيئة بوابات الاستلام التلقائي وإرسال إشعارات استرجاع العمليات لحظياً.',
        descEn: 'Configure webhooks to receive real-time dispatch status events.'
      },
      quickstart: {
        titleAr: 'دليل البدء السريع التفاعلي',
        titleEn: 'Interactive Quickstart Guide',
        descAr: 'أرسل رسالتك الأولى البرمجية مباشرة وافحص حالة الربط ونظام التوصيل.',
        descEn: 'Send your first automated message instantly to check your setup.'
      },
      code: {
        titleAr: 'منشئ الأكواد التفاعلي',
        titleEn: 'Code Builder & Playground',
        descAr: 'أنشئ كود الإرسال باللغة البرمجية المفضلة لديك واختبره تفاعلياً مع سجلات فورية.',
        descEn: 'Generate request templates in your favorite framework and execute them.'
      },
      templates: {
        titleAr: 'معرض القوالب الإبداعية',
        titleEn: 'Creative Templates Gallery',
        descAr: 'استعرض واستخدم القوالب الجاهزة المخصصة لنشرتك البريدية وموقعك الإلكتروني.',
        descEn: 'Browse custom designed transactional email, SMS, and WhatsApp templates.'
      },
      security: {
        titleAr: 'الأمان والتحقق الثنائي (2FA)',
        titleEn: 'Security & 2FA Settings',
        descAr: 'أمّن حسابك برقم الهاتف وفعل ميزة التحقق الإضافية للعمليات البرمجية الحساسة.',
        descEn: 'Verify your phone number and configure two-factor checks for security.'
      },
      system: {
        titleAr: 'النظام المتكامل وجدول التعرفة',
        titleEn: 'System Hub & Iraqi Local Rates',
        descAr: 'تفاصيل بوابات الربط الفعالة والتعرفة للشبكات العراقية المحلية (زين، آسيا، كورك).',
        descEn: 'View status bridges, local gateways, and Iraqi mobile operators tariffs.'
      }
    };
    return details[tab] || details['smtp'];
  };

  const header = getHeaderDetails(activeTab);

  return (
    <ScrollReveal>
      {/* Dynamic Unified Header */}
      {!hideOuterLayout && (
        <div style={{ marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 800, 
            marginBottom: '8px', 
            color: 'var(--text-primary)', 
            letterSpacing: lang === 'ar' ? '0' : '-1px' 
          }}>
            {lang === 'ar' ? header.titleAr : header.titleEn}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500, margin: 0 }}>
            {lang === 'ar' ? header.descAr : header.descEn}
          </p>
        </div>
      )}

      {/* Grid Settings Layout */}
      <div className="settings-layout" style={hideOuterLayout ? { gap: 0, marginTop: 0 } : undefined}>
        {/* Flat Grouped Sidebar Menu */}
        {!hideOuterLayout && (
          <div className="settings-sidebar">
            {menuSections.map((section, secIdx) => (
              <div key={secIdx} className="settings-sidebar-section">
                <span className="settings-sidebar-section-title">
                  {lang === 'ar' ? section.titleAr : section.titleEn}
                </span>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`settings-sidebar-btn ${isActive ? 'active' : ''}`}
                    >
                      <Icon size={14} />
                      <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        <div className="settings-content" style={{ animation: 'fadeIn 0.25s ease' }}>
          {activeTab === 'domains' && (
            <DomainsView 
              lang={lang} 
              domains={props.domains} 
              setDomains={props.setDomains}
              hideHeader={true}
            />
          )}

          {(activeTab === 'apikeys' || activeTab === 'webhooks' || activeTab === 'quickstart' || activeTab === 'code') && (
            <DeveloperHubView 
              lang={lang} 
              apiKeys={props.apiKeys} 
              setApiKeys={props.setApiKeys}
              webhooks={props.webhooks}
              setWebhooks={props.setWebhooks}
              logs={props.logs}
              setLogs={props.setLogs}
              walletBalance={props.walletBalance}
              setWalletBalance={props.setWalletBalance}
              setPhoneNotifications={props.setPhoneNotifications}
              setCurrentTab={props.setCurrentTab}
              controlledSubTab={activeTab as any}
            />
          )}

          {(activeTab === 'smtp' || activeTab === 'whatsapp' || activeTab === 'templates' || activeTab === 'security' || activeTab === 'system') && (
            <SettingsView 
              lang={lang} 
              setEmailBody={props.setEmailBody}
              setEmailSubject={props.setEmailSubject}
              setMsgBody={props.setMsgBody}
              setPlaygroundChannel={props.setPlaygroundChannel}
              setCurrentTab={props.setCurrentTab}
              setLogs={props.setLogs}
              setPhoneNotifications={props.setPhoneNotifications}
              controlledSubTab={activeTab as any}
              onBuilderToggle={setHideOuterLayout}
            />
          )}
        </div>
      </div>
    </ScrollReveal>
  );
};
