import React from 'react';
import { 
  LayoutDashboard, 
  BarChart3,
  Globe, 
  History, 
  Wallet as WalletIcon, 
  Sun,
  Moon,
  LogOut,
  MessageSquare,
  ChevronDown,
  Plus,
  PanelLeftClose,
  PanelLeft,
  PanelRight,
  PanelRightClose,
  Search,
  Layers
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  walletBalance: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  user: any;
  onLogout: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  onSearchClick: () => void;
  domains?: any[];
  apiKeys?: any[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  walletBalance,
  theme,
  setTheme,
  user,
  onLogout,
  isCollapsed,
  setIsCollapsed,
  onSearchClick,
  domains = [],
  apiKeys = []
}) => {
  const translations = {
    en: {
      brand: 'Sumer Send',
      balance: 'Balance',
      iqd: 'IQD',
      chat: 'Support Chat',
      logout: 'Log Out',
    },
    ar: {
      brand: 'سومر سيند',
      balance: 'الرصيد الحالي',
      iqd: 'د.ع',
      chat: 'الدعم والمساعدة',
      logout: 'تسجيل الخروج',
    },
  };

  const t = translations[lang];

  // Workspace items matching mockup (Dashboard, Reports, Logs, Billing)
  const workspaceItems = [
    { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Dashboard', icon: LayoutDashboard },
    { id: 'reports', labelAr: 'التقارير والتحليلات', labelEn: 'Analytics & Reports', icon: BarChart3 },
    { id: 'logs', labelAr: 'سجلات الإرسال', labelEn: 'Sending Logs', icon: History },
    { id: 'billing', labelAr: 'المحفظة والشحن', labelEn: 'Wallet & Billing', icon: WalletIcon }
  ];

  // Channels/Integrations items shown as colored squares matching projects in mockup
  const channelItems = [
    { id: 'playground', labelAr: 'حقل التجربة التفاعلي', labelEn: 'Playground', colorClass: 'color-orange' },
    { id: 'campaigns', labelAr: 'إدارة الحملات', labelEn: 'Campaigns', colorClass: 'color-green', badge: '3' },
    { id: 'smtp', labelAr: 'خادم البريد SMTP', labelEn: 'SMTP Server', colorClass: 'color-blue' },
    { id: 'whatsapp', labelAr: 'ربط واتساب وإرساله', labelEn: 'WhatsApp Sync', colorClass: 'color-purple', badge: 'Active' },
    { id: 'domains', labelAr: 'النطاقات والـ DNS', labelEn: 'Domains & DNS', colorClass: 'color-magenta', badge: domains.filter(d => d.status === 'verified').length.toString() },
    { id: 'api', labelAr: 'مفاتيح الـ API', labelEn: 'Developer API Keys', colorClass: 'color-gray', badge: apiKeys.length.toString() },
    { id: 'webhooks', labelAr: 'الويب هوكس', labelEn: 'Webhooks Setup', colorClass: 'color-yellow' },
    { id: 'security', labelAr: 'الأمان والتحقق (2FA)', labelEn: 'Security & 2FA', colorClass: 'color-gray' },
    { id: 'system', labelAr: 'حالة النظام والتعرفة', labelEn: 'System Rates', colorClass: 'color-yellow' }
  ];

  const [workspaceExpanded, setWorkspaceExpanded] = React.useState(true);
  const [channelsExpanded, setChannelsExpanded] = React.useState(true);

  // LogoLayers mimics the Starline AI stacked layers logo
  const LogoLayers = () => (
    <div style={{ 
      width: '32px', 
      height: '32px', 
      borderRadius: '8px', 
      backgroundColor: '#09090b', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0,
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
        <polyline points="2 17 12 22 22 17"></polyline>
        <polyline points="2 12 12 17 22 12"></polyline>
      </svg>
    </div>
  );

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`} style={{ 
      backgroundColor: 'var(--panel-bg)', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      borderRight: lang === 'ar' ? 'none' : '1px solid var(--border-color)', 
      borderLeft: lang === 'ar' ? '1px solid var(--border-color)' : 'none',
      width: 'var(--sidebar-width)',
      position: 'fixed',
      top: 0,
      left: lang === 'ar' ? 'auto' : 0,
      right: lang === 'ar' ? 0 : 'auto',
      zIndex: 100,
      transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      
      {/* 1. Header Row (Logo + Title + Panel Toggle) */}
      <div className="sidebar-header" style={{ 
        padding: isCollapsed ? '10px 8px' : '0 12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCollapsed ? 'center' : 'space-between'
      }}>
        {!isCollapsed ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
              <LogoLayers />
              <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textAlign: 'start', animation: 'fadeIn 0.2s ease' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {lang === 'ar' ? 'سومر سيند' : 'Sumer Send'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {user?.email || 'onboarding@sumersend.com'}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="sidebar-panel-toggle"
              title={lang === 'en' ? 'Collapse Sidebar' : 'طي القائمة'}
            >
              {lang === 'ar' ? <PanelRightClose size={15} /> : <PanelLeftClose size={15} />}
            </button>
          </>
        ) : (
          <button 
            onClick={() => setIsCollapsed(false)} 
            className="sidebar-panel-toggle"
            title={lang === 'en' ? 'Expand Sidebar' : 'توسيع القائمة'}
          >
            {lang === 'ar' ? <PanelRight size={15} /> : <PanelLeft size={15} />}
          </button>
        )}
      </div>

      {/* 2. Search Command Box */}
      <div style={{ paddingTop: '12px' }}>
        {!isCollapsed ? (
          <div className="sidebar-search-container">
            <button className="sidebar-search-box" onClick={onSearchClick}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Search size={14} />
                <span>{lang === 'ar' ? 'بحث...' : 'Search...'}</span>
              </div>
              <span className="sidebar-search-shortcut">⌘/</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px' }}>
            <button className="sidebar-panel-toggle" onClick={onSearchClick} title={lang === 'en' ? 'Search' : 'بحث'}>
              <Search size={15} />
            </button>
          </div>
        )}
      </div>

      {/* 3. Navigation Scroll Container */}
      <div style={{ 
        flex: 1, 
        overflowY: isCollapsed ? 'visible' : 'auto', 
        padding: isCollapsed ? '8px' : '8px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        
        {/* A. WORKSPACE Section */}
        {!isCollapsed ? (
          <>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '8px 12px 4px 12px', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {lang === 'ar' ? 'مساحة العمل' : 'WORKSPACE'}
              </span>
              <ChevronDown 
                size={12} 
                style={{ 
                  color: 'var(--text-muted)', 
                  transform: workspaceExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                  transition: 'transform 0.2s' 
                }} 
              />
            </div>
            <div className={`sidebar-accordion ${workspaceExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-accordion-inner">
                {workspaceItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`sidebar-link ${isActive ? 'active' : ''} sidebar-item-animated`}
                      onClick={() => setCurrentTab(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transitionDelay: `${index * 40}ms`
                      }}
                    >
                      <Icon size={16} />
                      <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
              <button
                onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  width: '32px',
                  height: '32px',
                  justifyContent: 'center'
                }}
                title={lang === 'ar' ? 'مساحة العمل' : 'WORKSPACE'}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LayoutDashboard size={14} style={{ opacity: 0.8 }} />
                <ChevronDown 
                  size={10} 
                  style={{ 
                    transform: workspaceExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                    transition: 'transform 0.2s' 
                  }} 
                />
              </button>
            </div>
            <div className={`sidebar-accordion ${workspaceExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-accordion-inner" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                {workspaceItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <div key={item.id} className="sidebar-item-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <button
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => setCurrentTab(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          width: '36px',
                          height: '36px'
                        }}
                      >
                        <Icon size={16} />
                      </button>
                      <div className="sidebar-popover" style={{ width: 'auto', minWidth: '130px', padding: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Icon size={13} style={{ opacity: 0.8 }} />
                          <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Divider in Collapsed Mode */}
        {isCollapsed && (
          <div className="sidebar-divider" />
        )}

        {/* B. CHANNELS & INTEGRATIONS Section */}
        {!isCollapsed ? (
          <>
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '12px 12px 4px 12px', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
              onClick={() => setChannelsExpanded(!channelsExpanded)}
            >
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                {lang === 'ar' ? 'القنوات والربط' : 'CHANNELS'}
              </span>
              <ChevronDown 
                size={12} 
                style={{ 
                  color: 'var(--text-muted)', 
                  transform: channelsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                  transition: 'transform 0.2s' 
                }} 
              />
            </div>
            <div className={`sidebar-accordion ${channelsExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-accordion-inner">
                {channelItems.map((item, index) => {
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      className={`sidebar-link ${isActive ? 'active' : ''} sidebar-item-animated`}
                      onClick={() => setCurrentTab(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transitionDelay: `${index * 40}ms`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span className={`sidebar-color-square ${item.colorClass}`} />
                        </div>
                        <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.badge && (
                        <span className="sidebar-badge">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '8px 0 4px 0' }}>
              <button
                onClick={() => setChannelsExpanded(!channelsExpanded)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  color: 'var(--text-muted)',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  width: '32px',
                  height: '32px',
                  justifyContent: 'center'
                }}
                title={lang === 'ar' ? 'القنوات والربط' : 'CHANNELS'}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <Layers size={14} style={{ opacity: 0.8 }} />
                <ChevronDown 
                  size={10} 
                  style={{ 
                    transform: channelsExpanded ? 'rotate(0deg)' : 'rotate(-90deg)', 
                    transition: 'transform 0.2s' 
                  }} 
                />
              </button>
            </div>
            <div className={`sidebar-accordion ${channelsExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-accordion-inner" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                {channelItems.map((item) => {
                  const isActive = currentTab === item.id;
                  return (
                    <div key={item.id} className="sidebar-item-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <button
                        className={`sidebar-link ${isActive ? 'active' : ''}`}
                        onClick={() => setCurrentTab(item.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          width: '36px',
                          height: '36px'
                        }}
                      >
                        <span className={`sidebar-color-square ${item.colorClass}`} style={{ width: '12px', height: '12px' }} />
                      </button>
                      <div className="sidebar-popover" style={{ width: 'auto', minWidth: '130px', padding: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className={`sidebar-color-square ${item.colorClass}`} />
                          <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* 4. Bottom Upgrade/Wallet Info Card (Expanded only) */}
      {!isCollapsed && (
        <div className="sidebar-upgrade-card">
          <div className="sidebar-upgrade-title">
            <WalletIcon size={14} style={{ color: 'var(--accent-color)' }} />
            <span>{lang === 'ar' ? 'رصيد المحفظة' : 'Sumer Wallet'}</span>
          </div>
          <div className="sidebar-upgrade-desc">
            {lang === 'ar' 
              ? `الرصيد المتاح لإرسال الحملات هو ${walletBalance.toLocaleString()} د.ع` 
              : `Available balance for notifications: ${walletBalance.toLocaleString()} IQD`}
          </div>
          <button 
            className="sidebar-upgrade-btn"
            onClick={() => setCurrentTab('billing')}
          >
            <Plus size={12} />
            <span>{lang === 'ar' ? 'شحن الرصيد' : 'Recharge Wallet'}</span>
          </button>
        </div>
      )}

      {/* 5. User Profile card (Collapsed only) */}
      {isCollapsed && user && (
        <div style={{ 
          padding: '10px 8px', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '8px'
        }}>
          <div style={{ 
            width: '30px', 
            height: '30px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--text-primary)', 
            color: 'var(--panel-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '11px',
            flexShrink: 0
          }} title={`${user.name} (${user.email})`}>
            {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
          </div>
          <button 
            onClick={onLogout}
            title={t.logout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
              borderRadius: '4px',
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      )}

      {/* 6. Footer (Chat, Language & Theme controls) */}
      <div style={{ 
        padding: isCollapsed ? '12px 8px' : '12px 12px', 
        borderTop: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: isCollapsed ? 'column' : 'row', 
        gap: '6px', 
        alignItems: 'center' 
      }}>

        <button 
          className="btn" 
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} 
          title={lang === 'en' ? 'عربي' : 'English'} 
          style={{ 
            flex: 1,
            width: isCollapsed ? '100%' : 'auto',
            padding: '8px', 
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--panel-bg)',
            cursor: 'pointer'
          }}
        >
          <Globe size={13} />
          {!isCollapsed && <span style={{ fontSize: '10px', fontWeight: 600, marginLeft: '4px', marginRight: '4px', animation: 'fadeIn 0.2s ease' }}>{lang === 'en' ? 'عربي' : 'EN'}</span>}
        </button>

        <button 
          className="btn" 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
          title={lang === 'en' ? 'Toggle Theme' : 'تغيير المظهر'} 
          style={{ 
            flex: 1,
            width: isCollapsed ? '100%' : 'auto',
            padding: '8px', 
            justifyContent: 'center',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'var(--panel-bg)',
            cursor: 'pointer'
          }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
          {!isCollapsed && <span style={{ fontSize: '10px', fontWeight: 600, marginLeft: '4px', marginRight: '4px', animation: 'fadeIn 0.2s ease' }}>{theme === 'dark' ? (lang === 'en' ? 'Light' : 'فاتح') : (lang === 'en' ? 'Dark' : 'داكن')}</span>}
        </button>

        {/* Logout (Expanded only, next to theme selector) */}
        {!isCollapsed && user && (
          <button 
            onClick={onLogout}
            title={t.logout}
            style={{
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--panel-bg)',
            }}
          >
            <LogOut size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
