export interface SeoSettings {
  siteTitleAr: string;
  siteTitleEn: string;
  siteDescriptionAr: string;
  siteDescriptionEn: string;
  siteKeywordsAr: string;
  siteKeywordsEn: string;
  ogImage: string;
  canonicalUrl: string;
  enableSchema: boolean;
}

export const getTabFromPath = (path: string): { tab: string; subTab?: any } => {
  const cleanPath = path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
  switch (cleanPath) {
    case '':
    case '/':
    case '/landing':
      return { tab: 'landing' };
    case '/login':
      return { tab: 'auth-signin' };
    case '/signup':
      return { tab: 'auth-signup' };
    case '/dashboard':
      return { tab: 'dashboard', subTab: 'channels' };
    case '/wallet':
    case '/billing':
      return { tab: 'dashboard', subTab: 'wallet' };
    case '/domains':
      return { tab: 'dashboard', subTab: 'domains' };
    case '/apikeys':
    case '/api':
      return { tab: 'dashboard', subTab: 'apikeys' };
    case '/templates':
      return { tab: 'dashboard', subTab: 'templates' };
    case '/send':
      return { tab: 'send' };
    case '/campaigns':
      return { tab: 'campaigns' };
    case '/playground':
      return { tab: 'playground' };
    case '/subscribers':
    case '/subscribers-list':
      return { tab: 'subscribers' };
    case '/subscribers-settings':
      return { tab: 'subscribers-settings' };
    case '/logs':
    case '/logs-list':
      return { tab: 'logs' };
    case '/reports':
      return { tab: 'reports' };
    case '/whatsapp':
      return { tab: 'whatsapp' };
    case '/smtp':
      return { tab: 'smtp' };
    case '/security':
      return { tab: 'security' };
    case '/system':
      return { tab: 'system' };
    case '/admin-portal':
    case '/admin':
      return { tab: 'admin-portal' };
    default:
      return { tab: 'landing' };
  }
};

export const getPathFromTab = (tab: string, subTab?: string): string => {
  if (tab === 'dashboard') {
    if (subTab === 'channels') return '/dashboard';
    if (subTab === 'wallet') return '/wallet';
    if (subTab === 'domains') return '/domains';
    if (subTab === 'apikeys') return '/apikeys';
    if (subTab === 'templates') return '/templates';
    return '/dashboard';
  }
  switch (tab) {
    case 'landing': return '/';
    case 'auth-signin': return '/login';
    case 'auth-signup': return '/signup';
    case 'send': return '/send';
    case 'campaigns': return '/campaigns';
    case 'playground': return '/playground';
    case 'subscribers': return '/subscribers';
    case 'subscribers-settings': return '/subscribers-settings';
    case 'logs': return '/logs';
    case 'reports': return '/reports';
    case 'whatsapp': return '/whatsapp';
    case 'smtp': return '/smtp';
    case 'security': return '/security';
    case 'system': return '/system';
    case 'admin-portal': return '/admin-portal';
    default: return '/';
  }
};

export const defaultSeoSettings: SeoSettings = {
  siteTitleAr: 'سومر سيند | بوابة الإشعارات العراقية',
  siteTitleEn: 'Sumer Send | Iraqi Notification Gateway',
  siteDescriptionAr: 'بوابة إرسال الإشعارات والرسائل المتكاملة في العراق. بريد إلكتروني، رسائل نصية قصيرة SMS، وربط واتساب بأسعار تنافسية.',
  siteDescriptionEn: 'Unified notification & messaging gateway in Iraq. Professional Email API, SMS, and WhatsApp integrations at unbeatable rates.',
  siteKeywordsAr: 'إرسال رسائل, رسائل نصية قصيرة, واتساب العراق, بريد إلكتروني العراق, بوابة مطورين, زين كاش',
  siteKeywordsEn: 'SMS gateway Iraq, WhatsApp API Iraq, Email API Iraq, developer portal, Zain Cash payments',
  ogImage: 'https://sumersend.com/assets/og-image.png',
  canonicalUrl: 'https://sumersend.com',
  enableSchema: true,
};

export const getSeoSettings = (): SeoSettings => {
  const saved = localStorage.getItem('sumer_admin_seo');
  if (saved) {
    try {
      return { ...defaultSeoSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error('Failed to parse SEO settings', e);
    }
  }
  return defaultSeoSettings;
};

export const updateSEOMetadata = (tab: string, lang: 'ar' | 'en') => {
  const settings = getSeoSettings();
  
  // 1. Get tab title based on language
  let pageTitle = '';
  switch (tab) {
    case 'landing':
      pageTitle = lang === 'ar' ? 'الرئيسية' : 'Home';
      break;
    case 'auth-signin':
      pageTitle = lang === 'ar' ? 'تسجيل الدخول' : 'Sign In';
      break;
    case 'auth-signup':
      pageTitle = lang === 'ar' ? 'إنشاء حساب' : 'Sign Up';
      break;
    case 'dashboard':
      pageTitle = lang === 'ar' ? 'لوحة التحكم' : 'Overview';
      break;
    case 'send':
      pageTitle = lang === 'ar' ? 'الإرسال السريع' : 'Quick Send';
      break;
    case 'campaigns':
      pageTitle = lang === 'ar' ? 'إرسال الحملات' : 'Campaigns';
      break;
    case 'playground':
      pageTitle = lang === 'ar' ? 'حقل التجربة' : 'API Playground';
      break;
    case 'subscribers':
      pageTitle = lang === 'ar' ? 'إدارة المشتركين' : 'Subscriber Lists';
      break;
    case 'subscribers-settings':
      pageTitle = lang === 'ar' ? 'إعدادات الحقول' : 'Custom Fields';
      break;
    case 'templates':
      pageTitle = lang === 'ar' ? 'إدارة القوالب' : 'Template Hub';
      break;
    case 'logs':
      pageTitle = lang === 'ar' ? 'سجلات الإرسال' : 'Delivery Logs';
      break;
    case 'reports':
      pageTitle = lang === 'ar' ? 'تحليلات تفصيلية' : 'Detailed Analytics';
      break;
    case 'whatsapp':
      pageTitle = lang === 'ar' ? 'ربط واتساب' : 'WhatsApp Connection';
      break;
    case 'smtp':
      pageTitle = lang === 'ar' ? 'خادم SMTP' : 'SMTP Server Config';
      break;
    case 'domains':
      pageTitle = lang === 'ar' ? 'النطاقات والـ DNS' : 'Domains & DNS';
      break;
    case 'apikeys':
    case 'api':
      pageTitle = lang === 'ar' ? 'مفاتيح الـ API' : 'API Keys';
      break;
    case 'webhooks':
      pageTitle = lang === 'ar' ? 'ويب هوكس Webhooks' : 'Webhooks Setup';
      break;
    case 'security':
      pageTitle = lang === 'ar' ? 'الأمان والـ 2FA' : 'Security & 2FA';
      break;
    case 'system':
      pageTitle = lang === 'ar' ? 'حالة النظام والأسعار' : 'System Status';
      break;
    case 'admin-portal':
      pageTitle = lang === 'ar' ? 'لوحة الإدارة المخفية' : 'Hidden Admin Portal';
      break;
    default:
      pageTitle = lang === 'ar' ? 'منصة الإرسال' : 'Send Platform';
  }

  // 2. Set Page Title
  const baseTitle = lang === 'ar' ? settings.siteTitleAr : settings.siteTitleEn;
  if (tab === 'landing') {
    document.title = baseTitle;
  } else {
    document.title = `${pageTitle} | ${baseTitle}`;
  }

  // 3. Helper to update/create meta tag
  const updateMetaTag = (name: string, content: string, isProperty = false) => {
    const attribute = isProperty ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attribute}="${name}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };

  // 4. Update Meta Description & Keywords
  const description = lang === 'ar' ? settings.siteDescriptionAr : settings.siteDescriptionEn;
  const keywords = lang === 'ar' ? settings.siteKeywordsAr : settings.siteKeywordsEn;
  
  updateMetaTag('description', description);
  updateMetaTag('keywords', keywords);

  // 5. Update OpenGraph Tags
  updateMetaTag('og:title', `${pageTitle} - Sumer Send`, true);
  updateMetaTag('og:description', description, true);
  updateMetaTag('og:image', settings.ogImage, true);
  updateMetaTag('og:url', `${settings.canonicalUrl}${window.location.pathname}`, true);
  updateMetaTag('og:type', 'website', true);
  
  // 6. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', `${settings.canonicalUrl}${window.location.pathname}`);

  // 7. Inject JSON-LD Schema
  let schemaScript = document.getElementById('sumer-send-jsonld') as HTMLScriptElement;
  if (settings.enableSchema) {
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = 'sumer-send-jsonld';
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }
    
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Sumer Send',
      'url': settings.canonicalUrl,
      'description': description,
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${settings.canonicalUrl}/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    };
    schemaScript.textContent = JSON.stringify(schemaData, null, 2);
  } else {
    if (schemaScript) {
      schemaScript.remove();
    }
  }
};
