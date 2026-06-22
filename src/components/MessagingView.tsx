import React, { useState, useEffect } from 'react';
import { PlaygroundView } from './PlaygroundView';
import { CampaignsView } from './CampaignsView';
import { ScrollReveal } from './LandingView';
import { Terminal, Send } from 'lucide-react';

interface MessagingViewProps {
  lang: 'en' | 'ar';
  setLogs: any;
  walletBalance: number;
  setWalletBalance: any;
  domains: any[];
  phoneNotifications: any[];
  setPhoneNotifications: any;
  emailBody: any;
  setEmailBody: any;
  emailSubject: any;
  setEmailSubject: any;
  msgBody: any;
  setMsgBody: any;
  playgroundChannel: 'email' | 'sms' | 'whatsapp';
  setPlaygroundChannel: any;
  initialTab?: 'playground' | 'campaigns';
}

export const MessagingView: React.FC<MessagingViewProps> = (props) => {
  const { lang, initialTab } = props;
  const [activeTab, setActiveTab] = useState<'playground' | 'campaigns'>(initialTab || 'playground');

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <ScrollReveal>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: lang === 'ar' ? '0' : '-1px' }}>
          {lang === 'ar' ? 'المراسلة والحملات' : 'Messaging & Campaigns'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
          {lang === 'ar' ? 'قم باختبار الـ API حياً أو إنشاء حملات تسويقية ذكية لعملائك.' : 'Test the API live or create smart marketing campaigns for your customers.'}
        </p>
      </div>

      <div className="vercel-tabs-container" style={{ overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('playground')}
          className={`vercel-tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
        >
          <Terminal size={15} />
          <span>{lang === 'ar' ? 'منصة الاختبار (Playground)' : 'API Playground'}</span>
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`vercel-tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
        >
          <Send size={15} />
          <span>{lang === 'ar' ? 'الحملات الذكية (Campaigns)' : 'Smart Campaigns'}</span>
        </button>
      </div>

      <div style={{ animation: 'fadeIn 0.3s ease' }}>
        {activeTab === 'playground' && (
          <PlaygroundView
            lang={lang}
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
          />
        )}
        {activeTab === 'campaigns' && (
          <CampaignsView
            lang={lang}
            walletBalance={props.walletBalance}
            setWalletBalance={props.setWalletBalance}
            setLogs={props.setLogs}
            setPhoneNotifications={props.setPhoneNotifications}
          />
        )}
      </div>
    </ScrollReveal>
  );
};
