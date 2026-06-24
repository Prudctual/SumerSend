import React, { useState, useEffect } from 'react';
import { DomainsView } from './DomainsView';
import { DeveloperHubView } from './DeveloperHubView';
import { ScrollReveal } from './LandingView';
import { 
  Globe, 
  Key, 
  Webhook, 
  Code 
} from 'lucide-react';

interface SettingsIntegrationsViewProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
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
  initialTab?: 'domains' | 'apikeys' | 'webhooks' | 'code';
}

export const SettingsIntegrationsView: React.FC<SettingsIntegrationsViewProps> = (props) => {
  const { lang, initialTab } = props;
  
  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'apikeys';
    if (tab === 'api') return 'apikeys';
    if (tab === 'settings') return 'apikeys';
    if (['apikeys', 'domains', 'webhooks', 'code'].includes(tab)) return tab;
    return 'apikeys';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getFlatTabFromInitial(initialTab));

  const handleTabChange = (tab: string) => {
    if (!document.startViewTransition) {
      setActiveTab(tab);
      props.setCurrentTab(tab);
      return;
    }
    
    const tabOrder = ['apikeys', 'domains', 'webhooks', 'code'];
    const oldIdx = tabOrder.indexOf(activeTab);
    const newIdx = tabOrder.indexOf(tab);
    const direction = newIdx >= oldIdx ? 'forward' : 'backward';
    
    const options: any = {
      update: () => {
        setActiveTab(tab);
        props.setCurrentTab(tab);
      }
    };
    if (direction) {
      options.types = [direction];
    }
    (document as any).startViewTransition(options);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getFlatTabFromInitial(initialTab));
    }
  }, [initialTab]);

  const hubTabs = [
    { id: 'apikeys', labelAr: 'مفاتيح الـ API', labelEn: 'API Keys', icon: Key },
    { id: 'domains', labelAr: 'النطاقات والـ DNS', labelEn: 'Verified Domains', icon: Globe },
    { id: 'webhooks', labelAr: 'الويب هوكس (Webhooks)', labelEn: 'Webhooks Setup', icon: Webhook },
    { id: 'code', labelAr: 'منشئ الأكواد التفاعلي', labelEn: 'Interactive Code Builder', icon: Code },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
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
      code: {
        titleAr: 'منشئ الأكواد التفاعلي',
        titleEn: 'Code Builder & Playground',
        descAr: 'أنشئ كود الإرسال باللغة البرمجية المفضلة لديك واختبره تفاعلياً مع سجلات فورية.',
        descEn: 'Generate request templates in your favorite framework and execute them.'
      }
    };
    return details[tab] || details['apikeys'];
  };

  const header = getHeaderDetails(activeTab);

  return (
    <ScrollReveal>
      {/* Dynamic Unified Header */}
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

      {/* Vercel styled Sub-navigation tabs */}
      <div className="vercel-tabs-container" style={{ overflowX: 'auto', marginBottom: '24px' }}>
        {hubTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`vercel-tab-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={15} />
              <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="settings-content" key={activeTab} style={{ animation: 'fadeIn 0.25s ease' }}>
        {activeTab === 'domains' ? (
          <DomainsView 
            lang={lang} 
            domains={props.domains} 
            setDomains={props.setDomains}
            hideHeader={true}
          />
        ) : (
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
      </div>
    </ScrollReveal>
  );
};
