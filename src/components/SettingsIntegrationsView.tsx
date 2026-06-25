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
    if (['apikeys', 'webhooks', 'code'].includes(tab)) return tab;
    return 'apikeys';
  };

  const [activeTab, setActiveTab] = useState<string>(() => getFlatTabFromInitial(initialTab));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    props.setCurrentTab(tab);
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(getFlatTabFromInitial(initialTab));
    }
  }, [initialTab]);

  const hubTabs = [
    { id: 'apikeys', labelAr: 'مفاتيح الـ API', labelEn: 'API Keys', icon: Key },
    { id: 'webhooks', labelAr: 'الويب هوكس (Webhooks)', labelEn: 'Webhooks Setup', icon: Webhook },
    { id: 'code', labelAr: 'منشئ الأكواد التفاعلي', labelEn: 'Interactive Code Builder', icon: Code },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
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
      {/* Dynamic Unified Header & Sub-navigation tabs in a single, polished row */}
      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px',
        direction: lang === 'ar' ? 'rtl' : 'ltr'
      }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 800, 
          margin: 0, 
          color: 'var(--text-primary)', 
          letterSpacing: lang === 'ar' ? '0' : '-0.5px' 
        }}>
          {lang === 'ar' ? header.titleAr : header.titleEn}
        </h1>

        {/* Segmented capsule Sub-navigation tabs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--panel-muted)', padding: '4px', borderRadius: '99px', border: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {hubTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: 'none',
                  background: isActive ? 'var(--accent-color)' : 'transparent',
                  color: isActive ? 'var(--panel-bg)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={13} />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="settings-content" key={activeTab}>
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
      </div>
    </ScrollReveal>
  );
};
