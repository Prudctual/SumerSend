import React from 'react';
import { 
  LayoutDashboard, 
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
  Layers,
  Shield,
  Gift,
  Settings,
  Compass,
  BookOpen
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
    { id: 'dashboard', labelAr: 'لوحة التحكم', labelEn: 'Overview', icon: LayoutDashboard },
    { id: 'messaging', labelAr: 'المراسلة والحملات', labelEn: 'Playground & Campaigns', icon: MessageSquare },
    { id: 'logs', labelAr: 'السجلات والتحليلات', labelEn: 'Logs & Analytics', icon: History },
  ];

  // Channels/Integrations items shown as colored squares matching projects in mockup
  const channelItems = [
    { id: 'settings', labelAr: 'بوابة المطور والـ API', labelEn: 'Developer Hub', icon: Globe, badge: domains.filter(d => d.status === 'verified').length.toString() },
    { id: 'billing', labelAr: 'المحفظة والشحن', labelEn: 'Wallet & Billing', icon: WalletIcon },
    { id: 'security', labelAr: 'الأمان والإعدادات', labelEn: 'Security & Settings', icon: Shield }
  ];

  const [workspaceExpanded, setWorkspaceExpanded] = React.useState(true);
  const [channelsExpanded, setChannelsExpanded] = React.useState(true);
  const [profileOpen, setProfileOpen] = React.useState(false);



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
              className="sidebar-section-header"
              onClick={() => setWorkspaceExpanded(!workspaceExpanded)}
            >
              <span>
                {lang === 'ar' ? 'الخدمات الأساسية' : 'CORE SERVICES'}
              </span>
              <ChevronDown 
                size={12} 
                className="chevron-icon"
                style={{ 
                  transform: workspaceExpanded 
                    ? 'rotate(0deg)' 
                    : (lang === 'ar' ? 'rotate(90deg)' : 'rotate(-90deg)')
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
                title={lang === 'ar' ? 'الخدمات الأساسية' : 'CORE SERVICES'}
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
              className="sidebar-section-header"
              onClick={() => setChannelsExpanded(!channelsExpanded)}
            >
              <span>
                {lang === 'ar' ? 'إعدادات المنصة' : 'CONFIGURATION'}
              </span>
              <ChevronDown 
                size={12} 
                className="chevron-icon"
                style={{ 
                  transform: channelsExpanded 
                    ? 'rotate(0deg)' 
                    : (lang === 'ar' ? 'rotate(90deg)' : 'rotate(-90deg)')
                }} 
              />
            </div>
            <div className={`sidebar-accordion ${channelsExpanded ? 'expanded' : ''}`}>
              <div className="sidebar-accordion-inner">
                {channelItems.map((item, index) => {
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
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transitionDelay: `${index * 40}ms`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={16} />
                        </div>
                        <span>{lang === 'ar' ? item.labelAr : item.labelEn}</span>
                      </div>
                      {item.badge && item.badge !== '0' && (
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
                title={lang === 'ar' ? 'إعدادات المنصة' : 'CONFIGURATION'}
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

      </div>

      {/* 4. Bottom Upgrade/Wallet Info Card (Expanded only) */}
      {!isCollapsed && (
        <div className="sidebar-upgrade-card">
          <div className="sidebar-upgrade-title">
            <WalletIcon size={14} style={{ color: 'var(--accent-color)' }} />
            <span>{lang === 'ar' ? 'رصيد المحفظة' : 'Sumer Wallet'}</span>
          </div>
          <div className="sidebar-upgrade-desc">
            {lang === 'ar' ? (
              <>
                الرصيد المتاح للمراسلة هو <strong className="tabular-nums-stat" style={{ fontWeight: 700 }}>{walletBalance.toLocaleString()}</strong> د.ع
              </>
            ) : (
              <>
                Available balance for notifications: <strong className="tabular-nums-stat" style={{ fontWeight: 700 }}>{walletBalance.toLocaleString()}</strong> IQD
              </>
            )}
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

      {/* 5. Vercel/Nashra style Profile Popover & Trigger Button */}
      {user && (
        <div style={{ 
          padding: '8px 12px', 
          borderTop: '1px solid var(--border-color)', 
          position: 'relative' 
        }}>
          {/* Backdrop Overlay for closing dropdown on click outside */}
          {profileOpen && (
            <div 
              onClick={() => setProfileOpen(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 98,
                background: 'transparent',
              }}
            />
          )}

          {/* Popover Card */}
          {profileOpen && (
            <div 
              className="profile-dropdown-container"
              style={{
                bottom: isCollapsed ? '10px' : '56px',
                left: isCollapsed 
                  ? (lang === 'ar' ? 'auto' : '56px') 
                  : (lang === 'ar' ? 'auto' : '12px'),
                right: isCollapsed 
                  ? (lang === 'ar' ? '56px' : 'auto') 
                  : (lang === 'ar' ? '12px' : 'auto'),
              }}
            >
              {/* User details header */}
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-user-name">
                  {user.name || 'Jasim Kareem'}
                </div>
                <div className="profile-dropdown-user-email">
                  {user.email || 'mj9034812@gmail.com'}
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              {/* Group 1: Account & Appearance */}
              <div className="profile-dropdown-section">
                {/* Account settings */}
                <button 
                  onClick={() => {
                    setCurrentTab('security');
                    setProfileOpen(false);
                  }}
                  className="profile-dropdown-item"
                >
                  <Settings size={14} />
                  <span>{lang === 'ar' ? 'إعدادات الحساب' : 'Account'}</span>
                </button>

                {/* Appearance switch */}
                <div className="profile-dropdown-control-row">
                  <span>{lang === 'ar' ? 'المظهر' : 'Appearance'}</span>
                  <div className="profile-dropdown-segmented">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`profile-dropdown-segmented-btn ${theme === 'light' ? 'active' : ''}`}
                      title={lang === 'ar' ? 'فاتح' : 'Light Mode'}
                    >
                      <Sun size={12} />
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`profile-dropdown-segmented-btn ${theme === 'dark' ? 'active' : ''}`}
                      title={lang === 'ar' ? 'داكن' : 'Dark Mode'}
                    >
                      <Moon size={12} />
                    </button>
                  </div>
                </div>

                {/* Language switch */}
                <div className="profile-dropdown-control-row">
                  <span>{lang === 'ar' ? 'اللغة' : 'Language'}</span>
                  <div className="profile-dropdown-segmented">
                    <button 
                      onClick={() => setLang('ar')}
                      className={`profile-dropdown-segmented-btn ${lang === 'ar' ? 'active' : ''}`}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700 }}>عربي</span>
                    </button>
                    <button 
                      onClick={() => setLang('en')}
                      className={`profile-dropdown-segmented-btn ${lang === 'en' ? 'active' : ''}`}
                    >
                      <span style={{ fontSize: '9px', fontWeight: 700 }}>EN</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              {/* Group 2: Help & Navigation */}
              <div className="profile-dropdown-section">
                {/* Product tour */}
                <button 
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setProfileOpen(false);
                  }}
                  className="profile-dropdown-item"
                >
                  <Compass size={14} />
                  <span>{lang === 'ar' ? 'جولة في المنتج' : 'Product tour'}</span>
                </button>

                {/* Help center */}
                <button 
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setProfileOpen(false);
                  }}
                  className="profile-dropdown-item"
                >
                  <BookOpen size={14} />
                  <span>{lang === 'ar' ? 'مركز المساعدة' : 'Help center'}</span>
                </button>

                {/* Contact support */}
                <button 
                  onClick={() => {
                    setCurrentTab('dashboard');
                    setProfileOpen(false);
                  }}
                  className="profile-dropdown-item"
                >
                  <MessageSquare size={14} />
                  <span>{lang === 'ar' ? 'تواصل مع الدعم' : 'Contact support'}</span>
                </button>

                {/* Refer & earn */}
                <button 
                  onClick={() => {
                    setCurrentTab('billing');
                    setProfileOpen(false);
                  }}
                  className="profile-dropdown-item"
                >
                  <Gift size={14} />
                  <span>{lang === 'ar' ? 'شارك واربح' : 'Refer & earn'}</span>
                  <span className="profile-dropdown-item-badge">40%</span>
                </button>
              </div>

              <div className="profile-dropdown-divider" />

              {/* Log Out */}
              <button 
                onClick={() => {
                  setProfileOpen(false);
                  onLogout();
                }}
                className="profile-dropdown-item profile-dropdown-logout-item"
              >
                <LogOut size={14} />
                <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span>
              </button>
            </div>
          )}

          {/* Trigger Row Button */}
          <div 
            onClick={() => setProfileOpen(!profileOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              width: '100%',
              padding: '8px',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: profileOpen ? 'var(--panel-muted)' : 'transparent',
              transition: 'all 0.2s ease',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              border: '1px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (!profileOpen) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #2563eb)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '11.5px',
              flexShrink: 0,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
              border: '1.5px solid var(--panel-bg)'
            }}>
              {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'U'}
            </div>

            {/* User name & email info (Expanded only) */}
            {!isCollapsed && (
              <div style={{ flex: 1, minWidth: 0, textAlign: 'start' }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {user.name || 'Jasim Kareem'}
                </div>
              </div>
            )}

            {/* Ellipsis icon (Expanded only) */}
            {!isCollapsed && (
              <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', lineHeight: 0.5 }}>•••</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
