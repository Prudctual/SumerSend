import React from 'react';
import { 
  LayoutDashboard, 
  Globe, 
  History, 
  Wallet as WalletIcon, 
  LogOut,
  MessageSquare,
  ChevronDown,
  Plus,
  PanelLeftClose,
  PanelLeft,
  PanelRight,
  PanelRightClose,
  Search,
  Settings,
  BookOpen,
  Sun,
  Moon,
  Languages,
  User,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Key,
  FileText
} from 'lucide-react';
import { getPathFromTab } from '../utils/seo';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string, subTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates') => void;
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
  activeDashboardSubTab?: 'channels' | 'domains' | 'apikeys' | 'wallet' | 'templates';
}

interface SidebarItem {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: React.ComponentType<any>;
  badge?: string;
  subItems?: {
    id: string;
    labelAr: string;
    labelEn: string;
  }[];
}


// LogoLayers uses dynamic variables to look premium in both light and dark themes
const LogoLayers = () => (
  <div style={{ 
    width: '28px', 
    height: '28px', 
    borderRadius: '6px', 
    backgroundColor: 'var(--text-primary)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--panel-bg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  activeDashboardSubTab = 'channels'
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        profileMenuRef.current && 
        !profileMenuRef.current.contains(target) &&
        !target.closest('.profile-menu-trigger')
      ) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});

  const sidebarGroups = [
    {
      id: 'control-panel',
      labelAr: 'لوحة التحكم',
      labelEn: 'Control Panel',
      icon: LayoutDashboard,
      subItems: [
        { id: 'dashboard', subTab: 'channels', labelAr: 'نظرة عامة', labelEn: 'Overview' },
        { id: 'wallet', subTab: 'wallet', labelAr: 'المحفظة والشحن', labelEn: 'Wallet & Billing' },
      ]
    },
    {
      id: 'send-console',
      labelAr: 'منصة الإرسال',
      labelEn: 'Send Console',
      icon: MessageSquare,
      subItems: [
        { id: 'send', labelAr: 'الإرسال السريع', labelEn: 'Quick Send' },
        { id: 'campaigns', labelAr: 'حملات الإرسال', labelEn: 'Campaigns Manager' },
        { id: 'playground', labelAr: 'حقل التجربة', labelEn: 'API Playground' },
      ]
    },
    {
      id: 'contacts-group',
      labelAr: 'المشتركون والجهات',
      labelEn: 'Audience & Lists',
      icon: User,
      subItems: [
        { id: 'subscribers', labelAr: 'إدارة المشتركين', labelEn: 'Subscriber Lists' },
        { id: 'subscribers-settings', labelAr: 'إعدادات الحقول', labelEn: 'Custom Fields' },
      ]
    },
    {
      id: 'templates-group',
      labelAr: 'إدارة القوالب',
      labelEn: 'Template Hub',
      icon: FileText,
      subItems: [
        { id: 'templates', subTab: 'templates', labelAr: 'تصميم القوالب', labelEn: 'Template Manager' },
      ]
    },
    {
      id: 'analytics-group',
      labelAr: 'السجلات والتحليلات',
      labelEn: 'Reports & Logs',
      icon: History,
      subItems: [
        { id: 'logs', labelAr: 'سجلات الإرسال', labelEn: 'Delivery Logs' },
        { id: 'reports', labelAr: 'تحليلات تفصيلية', labelEn: 'Detailed Analytics' },
      ]
    },
    {
      id: 'channels-group',
      labelAr: 'قنوات التوصيل',
      labelEn: 'Delivery Channels',
      icon: Globe,
      subItems: [
        { id: 'domains', subTab: 'domains', labelAr: 'النطاقات والـ DNS', labelEn: 'Domains & DNS' },
        { id: 'whatsapp', labelAr: 'ربط واتساب', labelEn: 'WhatsApp Connection' },
        { id: 'smtp', labelAr: 'خادم SMTP', labelEn: 'SMTP Server Config' },
      ]
    },
    {
      id: 'dev-center',
      labelAr: 'مركز المطورين',
      labelEn: 'Developer Center',
      icon: Key,
      subItems: [
        { id: 'apikeys', subTab: 'apikeys', labelAr: 'مفاتيح الـ API', labelEn: 'API Keys' },
        { id: 'webhooks', labelAr: 'الويب هوكس Webhooks', labelEn: 'Webhooks Setup' },
        { id: 'code', labelAr: 'منشئ الأكواد التفاعلي', labelEn: 'Interactive Code Builder' },
      ]
    },
    {
      id: 'platform-group',
      labelAr: 'إعدادات المنصة',
      labelEn: 'System Settings',
      icon: Settings,
      subItems: [
        { id: 'security', labelAr: 'الأمان والتحقق 2FA', labelEn: 'Security & 2FA' },
        { id: 'system', labelAr: 'حالة النظام والتعرفة', labelEn: 'System Status & Rates' },
      ]
    }
  ];

  const isSubItemActive = (subId: string) => {
    switch (subId) {
      case 'dashboard':
        return currentTab === 'dashboard' && activeDashboardSubTab === 'channels';
      case 'wallet':
        return currentTab === 'dashboard' && activeDashboardSubTab === 'wallet';
      case 'domains':
        return currentTab === 'dashboard' && activeDashboardSubTab === 'domains';
      case 'whatsapp':
        return currentTab === 'whatsapp';
      case 'smtp':
        return currentTab === 'smtp';
      case 'send':
        return currentTab === 'send';
      case 'campaigns':
        return currentTab === 'campaigns';
      case 'playground':
        return currentTab === 'playground';
      case 'subscribers':
        return currentTab === 'subscribers' || currentTab === 'subscribers-list';
      case 'subscribers-settings':
        return currentTab === 'subscribers-settings';
      case 'templates':
        return currentTab === 'dashboard' && activeDashboardSubTab === 'templates';
      case 'apikeys':
        return currentTab === 'apikeys' || currentTab === 'developer' || currentTab === 'api' || (currentTab === 'dashboard' && activeDashboardSubTab === 'apikeys');
      case 'webhooks':
        return currentTab === 'webhooks';
      case 'code':
        return currentTab === 'code';
      case 'logs':
        return currentTab === 'logs' || currentTab === 'logs-list';
      case 'reports':
        return currentTab === 'reports';
      case 'security':
        return currentTab === 'security';
      case 'system':
        return currentTab === 'system';
      default:
        return false;
    }
  };

  const isGroupActive = (group: typeof sidebarGroups[0]) => {
    return group.subItems.some(subItem => isSubItemActive(subItem.id));
  };

  // Auto-expand group of active tab when it changes
  React.useEffect(() => {
    sidebarGroups.forEach(group => {
      if (isGroupActive(group)) {
        setExpandedGroups(prev => ({ ...prev, [group.id]: true }));
      }
    });
  }, [currentTab, activeDashboardSubTab]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleGroupClick = (group: typeof sidebarGroups[0]) => {
    if (group.subItems.length === 1) {
      const firstSub = group.subItems[0];
      setCurrentTab(firstSub.id, firstSub.subTab as any);
      return;
    }

    const isExpanded = expandedGroups[group.id];
    const isAnyActive = isGroupActive(group);
    
    toggleGroup(group.id);
    
    if (!isExpanded && !isAnyActive && group.subItems.length > 0) {
      const firstSub = group.subItems[0];
      setCurrentTab(firstSub.id, firstSub.subTab as any);
    }
  };

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
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                  {lang === 'ar' ? 'سومر سيند' : 'Sumer Send'}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {lang === 'ar' ? 'بوابة العراق' : 'Iraq Gateway'}
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
        
        {/* Hierarchical Group Menu */}
        {!isCollapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {sidebarGroups.map((group, index) => {
              const Icon = group.icon;
              const isGroupAct = isGroupActive(group);
              const isExpanded = expandedGroups[group.id];
              
              return (
                <div key={group.id} className="sidebar-item-container">
                  <a
                    href={group.subItems.length === 1 ? getPathFromTab(group.subItems[0].id, group.subItems[0].subTab) : undefined}
                    className={`sidebar-link ${isGroupAct ? 'active' : ''} sidebar-item-animated`}
                    style={{
                      transitionDelay: `${index * 30}ms`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleGroupClick(group);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      <Icon size={16} style={{ color: isGroupAct ? 'var(--accent-text)' : 'inherit' }} />
                      <span style={{ fontWeight: isGroupAct ? 700 : 500 }}>
                        {lang === 'ar' ? group.labelAr : group.labelEn}
                      </span>
                    </div>
                    {group.subItems.length > 1 && (
                      <ChevronDown 
                        size={13} 
                        className="chevron-icon" 
                        style={{ 
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          opacity: 0.7
                        }} 
                      />
                    )}
                  </a>
                  
                  {isExpanded && group.subItems.length > 1 && (
                    <div className="sidebar-nested-list">
                      {group.subItems.map(subItem => {
                        const isSubActive = isSubItemActive(subItem.id);
                        return (
                          <a
                            key={subItem.id}
                            href={getPathFromTab(subItem.id, subItem.subTab)}
                            className={`sidebar-nested-link ${isSubActive ? 'active' : ''}`}
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentTab(subItem.id, subItem.subTab as any);
                            }}
                            style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
                          >
                            <span>{lang === 'ar' ? subItem.labelAr : subItem.labelEn}</span>
                            {subItem.id === 'domains' && domains.filter(d => d.status === 'verified').length > 0 && (
                              <span className="sidebar-badge status-active">
                                {domains.filter(d => d.status === 'verified').length}
                              </span>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
            {sidebarGroups.map((group) => {
              const Icon = group.icon;
              const isActive = isGroupActive(group);
              const firstSub = group.subItems.length > 0 ? group.subItems[0] : null;
              
              return (
                <div key={group.id} className="sidebar-item-container" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <a
                    href={firstSub ? getPathFromTab(firstSub.id, firstSub.subTab) : undefined}
                    className={`sidebar-link ${isActive ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (group.subItems.length > 0) {
                        setCurrentTab(group.subItems[0].id, group.subItems[0].subTab as any);
                      }
                    }}
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
                      height: '36px',
                      textDecoration: 'none'
                    }}
                  >
                    <Icon size={16} />
                  </a>
                  
                  {/* Collapsed Hover Popover Menu */}
                  <div className="sidebar-popover" style={{
                    flexDirection: 'column',
                    gap: '4px',
                    padding: '6px'
                  }}>
                    <div className="sidebar-popover-header">
                      {lang === 'ar' ? group.labelAr : group.labelEn}
                    </div>
                    {group.subItems.map(subItem => {
                      const isSubActive = isSubItemActive(subItem.id);
                      return (
                        <a
                          key={subItem.id}
                          href={getPathFromTab(subItem.id, subItem.subTab)}
                          className={`sidebar-popover-link ${isSubActive ? 'active' : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentTab(subItem.id, subItem.subTab as any);
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            color: isSubActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                            backgroundColor: isSubActive ? 'var(--panel-muted)' : 'transparent',
                            textAlign: 'start',
                            fontWeight: isSubActive ? 600 : 500,
                            transition: 'all 0.2s',
                            textDecoration: 'none',
                            display: 'block'
                          }}
                        >
                          {lang === 'ar' ? subItem.labelAr : subItem.labelEn}
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Divider in Collapsed Mode */}
        {isCollapsed && (
          <div className="sidebar-divider" />
        )}

        {/* 4. Bottom Wallet Info Card (inside scroll) */}
        {!isCollapsed && (
          <div className="sidebar-upgrade-card" style={{ margin: '12px 0 0 0' }}>
            <div className="sidebar-upgrade-title">
              <WalletIcon size={13} style={{ color: 'var(--accent-color)' }} />
              <span>{lang === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="tabular-nums-stat" style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{walletBalance.toLocaleString()}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{lang === 'ar' ? 'د.ع' : 'IQD'}</span>
            </div>
            <button 
              className="sidebar-upgrade-btn"
              onClick={() => setCurrentTab('wallet')}
            >
              <Plus size={11} />
              <span>{lang === 'ar' ? 'شحن الرصيد' : 'Recharge'}</span>
            </button>
          </div>
        )}

        {/* 5. Sidebar Quick Add Domain (inside scroll) */}
        {!isCollapsed && (
          <div className="sidebar-quick-add-card" style={{ margin: '8px 0 0 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
              <div className="avatar-stack" style={{ marginBottom: 0 }}>
                <div className="avatar-stack-item" style={{ backgroundColor: '#a855f7', color: '#fff', width: '22px', height: '22px', fontSize: '8px' }}>M</div>
                <div className="avatar-stack-item" style={{ backgroundColor: '#f43f5e', color: '#fff', width: '22px', height: '22px', fontSize: '8px' }}>I</div>
                <div className="avatar-stack-item" style={{ backgroundColor: '#0ea5e9', color: '#fff', width: '22px', height: '22px', fontSize: '8px' }}>S</div>
              </div>
              <div style={{ flex: 1, textAlign: 'start' }}>
                <h4 className="sidebar-quick-add-title" style={{ fontSize: '11.5px' }}>
                  {lang === 'ar' ? 'ربط نطاق جديد' : 'Add Domain'}
                </h4>
              </div>
              <button 
                className="sidebar-quick-add-btn"
                onClick={() => setCurrentTab('domains')}
              >
                <Plus size={11} />
                <span>{lang === 'ar' ? 'ربط' : 'Add'}</span>
              </button>
            </div>
          </div>
        )}

      </div>

      {/* 6. Bottom Utilities Toolbar & User Profile */}
      {!isCollapsed ? (
        <div style={{ 
          padding: '12px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          marginTop: 'auto',
          backgroundColor: 'var(--panel-bg)'
        }}>
          {/* Quick Toolbar: Theme & Language */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              style={{
                flex: 1,
                fontSize: '11px',
                padding: '6px 8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '30px',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                background: 'transparent',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--panel-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={lang === 'ar' ? 'Change to English' : 'تغيير إلى العربية'}
            >
              <Languages size={13} style={{ color: 'var(--text-muted)' }} />
              <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{
                width: '36px',
                height: '30px',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--panel-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={14} style={{ color: 'var(--text-muted)' }} /> : <Moon size={14} style={{ color: 'var(--text-muted)' }} />}
            </button>
          </div>

          {/* User Profile Info & Dropdown Trigger */}
          <div 
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="profile-menu-trigger"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '4px',
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--panel-muted)',
              cursor: 'pointer',
              userSelect: 'none',
              transition: 'background-color 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--panel-bg)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--text-primary)',
              color: 'var(--panel-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '11px',
              flexShrink: 0
            }}>
              {(user?.email || 'U')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'start' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || (lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem')}
              </span>
              <span style={{ fontSize: '9.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || 'jasim@prudctual.com'}
              </span>
            </div>
            {lang === 'ar' ? (
              <ChevronLeft size={13} style={{ color: 'var(--text-muted)' }} />
            ) : (
              <ChevronRight size={13} style={{ color: 'var(--text-muted)' }} />
            )}
          </div>
        </div>
      ) : (
        <div style={{ 
          padding: '12px 6px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginTop: 'auto',
          position: 'relative'
        }}>
          {/* Collapsed Theme Button */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="sidebar-panel-toggle"
            style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Collapsed Language Button */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            className="sidebar-panel-toggle"
            style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
            title={lang === 'ar' ? 'English' : 'عربي'}
          >
            <Languages size={15} />
          </button>

          {/* Collapsed Wallet Button */}
          <button
            onClick={() => setCurrentTab('wallet')}
            className={`sidebar-panel-toggle ${currentTab === 'dashboard' && activeDashboardSubTab === 'wallet' ? 'active' : ''}`}
            style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer' }}
            title={lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Billing'}
          >
            <WalletIcon size={15} />
          </button>

          {/* Avatar Profile Toggle */}
          <div className="sidebar-item-container profile-menu-trigger" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: profileMenuOpen ? '0 0 0 2px var(--accent-text)' : 'none',
                transition: 'box-shadow 0.2s'
              }}
              title={lang === 'ar' ? 'الملف الشخصي' : 'User Profile'}
            >
              {(user?.email || 'U')[0].toUpperCase()}
            </button>
          </div>
        </div>
      )}

      {/* Floating User Profile Dropdown Menu */}
      {profileMenuOpen && (
        <div 
          ref={profileMenuRef}
          style={{
            position: 'absolute',
            bottom: '12px',
            left: lang === 'ar' ? 'auto' : (isCollapsed ? '64px' : '260px'),
            right: lang === 'ar' ? (isCollapsed ? '64px' : '260px') : 'auto',
            width: '260px',
            backgroundColor: 'var(--panel-elevated)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '6px',
            animation: lang === 'ar' ? 'popoverFadeInRTL 0.2s cubic-bezier(0.16, 1, 0.3, 1)' : 'popoverFadeInLTR 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-family)',
          }}
        >
          {/* Section 1: Actions */}
          <div style={{ padding: '6px 12px 4px 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
            <User size={13} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '11px', fontWeight: 600 }}>
              {lang === 'ar' ? 'ملفي الشخصي @jasim' : 'My profile @jasim'}
            </span>
          </div>

          <button
            onClick={() => {
              setCurrentTab('security');
              setProfileMenuOpen(false);
            }}
            className="sidebar-popover-link"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '6px',
              background: currentTab === 'security' ? 'var(--panel-muted)' : 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'start',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{lang === 'ar' ? 'إعدادات الحساب' : 'Account settings'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setCurrentTab('whatsapp');
              setProfileMenuOpen(false);
            }}
            className="sidebar-popover-link"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '6px',
              background: currentTab === 'whatsapp' ? 'var(--panel-muted)' : 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'start',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Smartphone size={14} style={{ color: 'var(--text-muted)' }} />
              <span>{lang === 'ar' ? 'إدارة الأجهزة' : 'Device management'}</span>
            </div>
          </button>

          <button
            onClick={() => {
              setProfileMenuOpen(false);
              onLogout();
            }}
            className="sidebar-popover-link"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px 12px',
              fontSize: '12px',
              border: 'none',
              borderRadius: '6px',
              background: 'transparent',
              color: 'var(--danger-color)',
              cursor: 'pointer',
              textAlign: 'start',
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LogOut size={14} />
              <span>{lang === 'ar' ? 'تسجيل الخروج' : 'Sign out'}</span>
            </div>
          </button>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />

          {/* Section 2: Active Account Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '2px' }}>
            {/* Account 1 (Active) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--panel-muted)',
              border: '1px solid var(--border-color)',
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '10px',
              }}>
                {(user?.email || 'J')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'start', overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.name || (lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem')}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user?.email || 'jasim@prudctual.com'}
                </span>
              </div>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-text)',
              }} />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-color)', margin: '6px 0' }} />

          {/* Section 3: Footer */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '4px 8px',
            fontSize: '9.5px',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: 'var(--text-primary)' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
              <span>Sumer Send</span>
            </div>
            <span>© 2026</span>
          </div>
        </div>
      )}
    </div>
  );
};
