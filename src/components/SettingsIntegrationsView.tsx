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
    if (!tab) return 'apikeys';
    if (tab === 'api') return 'apikeys';
    if (tab === 'settings') return 'apikeys';
    return tab;
  };

  const [activeTab, setActiveTab] = useState<string>(() => getFlatTabFromInitial(initialTab));

  const handleTabChange = (tab: string) => {
    if (!document.startViewTransition) {
      setActiveTab(tab);
      return;
    }
    
    const tabOrder = ['apikeys', 'domains', 'smtp', 'whatsapp', 'webhooks', 'code'];
    const oldIdx = tabOrder.indexOf(activeTab);
    const newIdx = tabOrder.indexOf(tab);
    const direction = newIdx >= oldIdx ? 'forward' : 'backward';
    
    const options: any = {
      update: () => {
        setActiveTab(tab);
      }
    };
    if (direction) {
      options.types = [direction];
    }
    (document as any).startViewTransition(options);
  };

  const [hideOuterLayout, setHideOuterLayout] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getFlatTabFromInitial(initialTab));
    }
  }, [initialTab]);

  // Grouped Menu Structure ordered by setup flow & usage frequency
  const menuSections = [
    {
      titleAr: 'البدء السريع',
      titleEn: 'QUICK START',
      items: [
        { id: 'apikeys', labelAr: 'مفاتيح الـ API', labelEn: 'API Keys', icon: Key },
        { id: 'domains', labelAr: 'النطاقات والـ DNS', labelEn: 'Verified Domains', icon: Globe },
      ]
    },
    {
      titleAr: 'قنوات الإرسال',
      titleEn: 'SEND CHANNELS',
      items: [
        { id: 'smtp', labelAr: 'إرسال البريد SMTP', labelEn: 'SMTP Relay Setup', icon: Mail },
        { id: 'whatsapp', labelAr: 'ربط جلسة واتساب', labelEn: 'WhatsApp Sync', icon: Smartphone },
        { id: 'webhooks', labelAr: 'الويب هوكس (Webhooks)', labelEn: 'Webhooks Setup', icon: Webhook },
      ]
    },
    {
      titleAr: 'أدوات المطور',
      titleEn: 'DEVELOPER TOOLS',
      items: [
        { id: 'code', labelAr: 'منشئ الأكواد التفاعلي', labelEn: 'Interactive Code Builder', icon: Code },
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
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 800, 
            marginBottom: '6px', 
            color: 'var(--text-primary)', 
            letterSpacing: lang === 'ar' ? '0' : '-0.5px' 
          }}>
            {lang === 'ar' ? header.titleAr : header.titleEn}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
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
                      onClick={() => handleTabChange(item.id)}
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
        <div className="settings-content" key={activeTab} style={{ animation: 'fadeIn 0.25s ease' }}>
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
