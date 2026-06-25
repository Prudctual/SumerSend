import React, { useState, useEffect } from 'react';
import { SettingsView } from './SettingsView';
import { DomainsView } from './DomainsView';
import { ScrollReveal } from './LandingView';
import { 
  MessageSquare, 
  Mail, 
  Globe 
} from 'lucide-react';

interface ChannelsViewProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  domains: any[];
  setDomains: any;
  setEmailBody: any;
  setEmailSubject: any;
  setMsgBody: any;
  setPlaygroundChannel: any;
  setCurrentTab: any;
  setLogs: any;
  setPhoneNotifications: any;
  initialTab?: 'whatsapp' | 'smtp' | 'domains';
}

export const ChannelsView: React.FC<ChannelsViewProps> = (props) => {
  const { lang, initialTab } = props;

  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'whatsapp';
    if (['whatsapp', 'smtp', 'domains'].includes(tab)) return tab;
    return 'whatsapp';
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

  const tabs = [
    { id: 'whatsapp', labelAr: 'ربط بوابة WhatsApp', labelEn: 'WhatsApp Sync', icon: MessageSquare },
    { id: 'smtp', labelAr: 'خادم الـ SMTP الخاص', labelEn: 'SMTP Server', icon: Mail },
    { id: 'domains', labelAr: 'توثيق النطاقات والـ DNS', labelEn: 'Verified Domains', icon: Globe },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
      whatsapp: {
        titleAr: 'ربط وتزامن بوابة WhatsApp',
        titleEn: 'WhatsApp Gateway Sync',
        descAr: 'قم بمسح رمز الـ QR لربط حساب واتساب وتفعيل الإرسال الفوري لعملائك.',
        descEn: 'Scan the QR code to sync your WhatsApp device and initiate instant dispatches.'
      },
      smtp: {
        titleAr: 'إعدادات خادم الـ SMTP الخاص',
        titleEn: 'SMTP Provider Setup',
        descAr: 'قم بتهيئة بيانات خادم SMTP الخارجي لإرسال رسائل البريد الإلكتروني عبر خوادمك.',
        descEn: 'Configure your custom outgoing SMTP server settings to dispatch emails via your own server.'
      },
      domains: {
        titleAr: 'توثيق النطاقات والـ DNS',
        titleEn: 'Verified Domains & DNS',
        descAr: 'أضف نطاقاتك وقم بتهيئة إعدادات DKIM و SPF لضمان وصول الرسائل لعلبة الوارد.',
        descEn: 'Authenticate and configure your custom domains to ensure maximum email deliverability.'
      }
    };
    return details[tab] || details['whatsapp'];
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

        {/* Vercel styled Sub-navigation tabs */}
        <div className="vercel-tabs-container" style={{ margin: 0, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`vercel-tab-btn ${isActive ? 'active' : ''}`}
              >
                <Icon size={14} />
                <span>{lang === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="channels-content">
        {activeTab === 'whatsapp' && (
          <SettingsView
            lang={props.lang}
            theme={props.theme}
            setEmailBody={props.setEmailBody}
            setEmailSubject={props.setEmailSubject}
            setMsgBody={props.setMsgBody}
            setPlaygroundChannel={props.setPlaygroundChannel}
            setCurrentTab={props.setCurrentTab}
            setLogs={props.setLogs}
            setPhoneNotifications={props.setPhoneNotifications}
            controlledSubTab="whatsapp"
          />
        )}
        {activeTab === 'smtp' && (
          <SettingsView
            lang={props.lang}
            theme={props.theme}
            setEmailBody={props.setEmailBody}
            setEmailSubject={props.setEmailSubject}
            setMsgBody={props.setMsgBody}
            setPlaygroundChannel={props.setPlaygroundChannel}
            setCurrentTab={props.setCurrentTab}
            setLogs={props.setLogs}
            setPhoneNotifications={props.setPhoneNotifications}
            controlledSubTab="smtp"
          />
        )}
        {activeTab === 'domains' && (
          <DomainsView 
            lang={props.lang} 
            domains={props.domains} 
            setDomains={props.setDomains}
            hideHeader={true}
          />
        )}
      </div>
    </ScrollReveal>
  );
};
