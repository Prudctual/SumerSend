import React, { useState, useEffect } from 'react';
import { BillingView } from './BillingView';
import { SettingsView } from './SettingsView';
import { ScrollReveal } from './LandingView';
import { 
  Wallet, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';

interface PlatformSettingsViewProps {
  lang: 'en' | 'ar';
  theme: 'light' | 'dark';
  walletBalance: number;
  setWalletBalance: any;
  transactions: any[];
  setTransactions: any;
  setEmailBody: any;
  setEmailSubject: any;
  setMsgBody: any;
  setPlaygroundChannel: any;
  setCurrentTab: any;
  setLogs: any;
  setPhoneNotifications: any;
  initialTab?: 'billing' | 'security' | 'system';
}

export const PlatformSettingsView: React.FC<PlatformSettingsViewProps> = (props) => {
  const { lang, initialTab } = props;

  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'billing';
    if (['billing', 'security', 'system'].includes(tab)) return tab;
    return 'billing';
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
    { id: 'billing', labelAr: 'المحفظة والشحن', labelEn: 'Wallet & Billing', icon: Wallet },
    { id: 'security', labelAr: 'أمان الحساب والـ 2FA', labelEn: 'Security & 2FA', icon: ShieldCheck },
    { id: 'system', labelAr: 'حالة النظام والتعرفة', labelEn: 'Rates & System Health', icon: Cpu },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
      billing: {
        titleAr: 'إدارة المحفظة والفوترة المالية',
        titleEn: 'Wallet & Billing Portal',
        descAr: 'اشحن رصيد حسابك بأمان عبر بوابة زين كاش العراق، وراقب سجل عمليات الدفع.',
        descEn: 'Recharge your account wallet via Zain Cash Iraq, and audit your payment history.'
      },
      security: {
        titleAr: 'أمان المنصة والتوثيق الثنائي',
        titleEn: 'Security & Two-Factor Auth',
        descAr: 'احمِ حسابك عبر تفعيل التوثيق الثنائي (2FA) وإدارة جلسات الأمان الفعالة.',
        descEn: 'Secure your developer profile with Two-Factor Authentication (2FA) and session audits.'
      },
      system: {
        titleAr: 'حالة النظام والتعرفة المحلية للشبكات',
        titleEn: 'Rates & System Infrastructure',
        descAr: 'استعرض أسعار الرسائل الصادرة لكل شبكة عراقية وحالة خوادم الإرسال حالياً.',
        descEn: 'Inspect dispatches billing rates per carrier network and real-time server health status.'
      }
    };
    return details[tab] || details['billing'];
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
      <div className="platform-settings-content" key={activeTab}>
        {activeTab === 'billing' && (
          <BillingView
            lang={props.lang}
            walletBalance={props.walletBalance}
            setWalletBalance={props.setWalletBalance}
            transactions={props.transactions}
            setTransactions={props.setTransactions}
            hideHeader={true}
          />
        )}
        {activeTab === 'security' && (
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
            controlledSubTab="security"
          />
        )}
        {activeTab === 'system' && (
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
            controlledSubTab="system"
          />
        )}
      </div>
    </ScrollReveal>
  );
};
