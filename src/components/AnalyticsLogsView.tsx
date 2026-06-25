import React, { useState, useEffect } from 'react';
import { ReportsView } from './ReportsView';
import { LogsView } from './LogsView';
import { ScrollReveal } from './LandingView';
import { 
  BarChart3, 
  History 
} from 'lucide-react';

interface AnalyticsLogsViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  setLogs: any;
  walletBalance: number;
  transactions: any[];
  domains: any[];
  setCurrentTab: any;
  initialTab?: 'reports' | 'logs';
}

export const AnalyticsLogsView: React.FC<AnalyticsLogsViewProps> = (props) => {
  const { lang, initialTab } = props;

  const getFlatTabFromInitial = (tab?: string) => {
    if (!tab) return 'reports';
    // Map 'logs-list' or 'logs' to 'logs'
    if (tab === 'logs-list') return 'logs';
    if (['reports', 'logs'].includes(tab)) return tab;
    return 'reports';
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
    { id: 'reports', labelAr: 'تقارير الأداء والتحليلات', labelEn: 'Performance Reports', icon: BarChart3 },
    { id: 'logs', labelAr: 'سجلات الإرسال التفصيلية', labelEn: 'Outbound Logs', icon: History },
  ];

  const getHeaderDetails = (tab: string) => {
    const details: { [key: string]: { titleAr: string; titleEn: string; descAr: string; descEn: string } } = {
      reports: {
        titleAr: 'تقارير الأداء والتحليلات البيانية',
        titleEn: 'Performance & Analytics Reports',
        descAr: 'راقب معدلات تسليم الرسائل، التكاليف التفصيلية، وأداء القنوات المختلفة بيانياً.',
        descEn: 'Monitor message deliverability, detailed costs, and channel performance graphically.'
      },
      logs: {
        titleAr: 'سجلات الإرسال التفصيلية',
        titleEn: 'Outbound Message Logs',
        descAr: 'ابحث وتتبع حالة وحركة كل رسالة مرسلة (Email, SMS, WhatsApp) لحظة بلحظة.',
        descEn: 'Search, audit, and track the exact transmission logs and status of every dispatched message.'
      }
    };
    return details[tab] || details['reports'];
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
      <div className="analytics-logs-content">
        {activeTab === 'reports' && (
          <ReportsView
            lang={props.lang}
            logs={props.logs}
            walletBalance={props.walletBalance}
            transactions={props.transactions}
            domains={props.domains}
            setCurrentTab={props.setCurrentTab}
            hideHeader={true}
          />
        )}
        {activeTab === 'logs' && (
          <LogsView
            lang={props.lang}
            logs={props.logs}
            setLogs={props.setLogs}
            hideHeader={true}
          />
        )}
      </div>
    </ScrollReveal>
  );
};
