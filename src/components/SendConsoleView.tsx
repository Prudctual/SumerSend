import React, { useState, useEffect } from 'react';
import { PlaygroundView } from './PlaygroundView';
import { CampaignsView } from './CampaignsView';
import { ScrollReveal } from './LandingView';
import { 
  MessageSquare, 
  Send 
} from 'lucide-react';

interface SendConsoleViewProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  setLogs: any;
  walletBalance: number;
  setWalletBalance: any;
  domains: any[];
  phoneNotifications: any[];
  setPhoneNotifications: any;
  emailBody: string;
  setEmailBody: any;
  emailSubject: string;
  setEmailSubject: any;
  msgBody: string;
  setMsgBody: any;
  playgroundChannel: 'email' | 'sms' | 'whatsapp';
  setPlaygroundChannel: any;
  setCurrentTab: any;
  initialTab?: 'playground' | 'campaigns';
}

export const SendConsoleView: React.FC<SendConsoleViewProps> = (props) => {
  const { lang, initialTab } = props;

  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'playground';
    if (['playground', 'campaigns'].includes(tab)) return tab;
    return 'playground';
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
    { id: 'playground', labelAr: 'المختبر التجريبي', labelEn: 'Composer Playground', icon: MessageSquare },
    { id: 'campaigns', labelAr: 'حملات البث الجماعي', labelEn: 'Broadcast Campaigns', icon: Send },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
      playground: {
        titleAr: 'منصة الاختبار الذكية',
        titleEn: 'Composer Playground',
        descAr: 'اختبر إرسال البريد الإلكتروني، رسائل SMS، وإشعارات WhatsApp مباشرة برمجياً.',
        descEn: 'Test email dispatch, SMS routing, and WhatsApp notification deliveries interactively.'
      },
      campaigns: {
        titleAr: 'حملات البث الجماعي',
        titleEn: 'Broadcast Campaigns',
        descAr: 'قم بإرسال رسائل جماعية للجمهور والزبائن دفعة واحدة مع تتبع فوري للحالة.',
        descEn: 'Send broadcast campaigns to your audience and track real-time delivery status.'
      }
    };
    return details[tab] || details['playground'];
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
      <div className="send-console-content" key={activeTab}>
        {activeTab === 'playground' && (
          <PlaygroundView
            lang={props.lang}
            setLogs={props.setLogs}
            walletBalance={props.walletBalance}
            setWalletBalance={props.setWalletBalance}
            domains={props.domains}
            phoneNotifications={props.phoneNotifications}
            setPhoneNotifications={props.setPhoneNotifications}
            emailBody={props.emailBody}
            setEmailBody={props.setEmailBody}
            emailSubject={props.emailSubject}
            setEmailSubject={props.setEmailSubject}
            msgBody={props.msgBody}
            setMsgBody={props.setMsgBody}
            activeTab={props.playgroundChannel}
            setActiveTab={props.setPlaygroundChannel}
            hideHeader={true}
          />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsView
            lang={props.lang}
            walletBalance={props.walletBalance}
            setWalletBalance={props.setWalletBalance}
            setLogs={props.setLogs}
            setPhoneNotifications={props.setPhoneNotifications}
            hideHeader={true}
          />
        )}
      </div>
    </ScrollReveal>
  );
};
