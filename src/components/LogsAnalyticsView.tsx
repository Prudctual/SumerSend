import React, { useState } from 'react';
import { LogsView } from './LogsView';
import { ReportsView } from './ReportsView';
import { History, BarChart3 } from 'lucide-react';
import { ScrollReveal } from './LandingView';

interface LogsAnalyticsViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  walletBalance: number;
  transactions: any[];
  domains: any[];
  setCurrentTab: (tab: string) => void;
  initialTab?: 'logs' | 'analytics';
}

export const LogsAnalyticsView: React.FC<LogsAnalyticsViewProps> = ({
  lang,
  logs,
  setLogs,
  walletBalance,
  transactions,
  domains,
  setCurrentTab,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'analytics'>(initialTab || 'logs');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const translations = {
    en: {
      title: 'Logs & Analytics',
      subtitle: 'Track sent messages chronological history and analyze performance trends.',
      tabLogs: 'Activity Logs',
      tabAnalytics: 'Analytics Reports'
    },
    ar: {
      title: 'السجلات والتحليلات',
      subtitle: 'تتبع السجل التاريخي للرسائل المرسلة وتحليل مؤشرات الأداء.',
      tabLogs: 'سجلات الأنشطة',
      tabAnalytics: 'تقارير التحليلات'
    }
  };

  const t = translations[lang];

  const handleTabChange = (tab: 'logs' | 'analytics') => {
    if (!document.startViewTransition) {
      setActiveTab(tab);
      return;
    }
    const direction = tab === 'analytics' ? 'forward' : 'backward';
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

  return (
    <ScrollReveal>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          fontSize: '26px', 
          fontWeight: 800, 
          marginBottom: '6px', 
          color: 'var(--text-primary)', 
          letterSpacing: lang === 'ar' ? '0' : '-0.5px' 
        }}>
          {t.title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500, margin: 0 }}>
          {t.subtitle}
        </p>
      </div>

      <div className="vercel-tabs-container" style={{ marginBottom: '20px', overflowX: 'auto' }}>
        <button
          onClick={() => handleTabChange('logs')}
          className={`vercel-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <History size={15} />
          <span>{t.tabLogs}</span>
        </button>
        <button
          onClick={() => handleTabChange('analytics')}
          className={`vercel-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={15} />
          <span>{t.tabAnalytics}</span>
        </button>
      </div>

      <div key={activeTab} style={{ animation: 'fadeIn 0.25s ease' }}>
        {activeTab === 'logs' ? (
          <LogsView 
            lang={lang} 
            logs={logs} 
            setLogs={setLogs} 
          />
        ) : (
          <ReportsView
            lang={lang}
            logs={logs}
            walletBalance={walletBalance}
            transactions={transactions}
            domains={domains}
            setCurrentTab={setCurrentTab}
          />
        )}
      </div>
    </ScrollReveal>
  );
};
