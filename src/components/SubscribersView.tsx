import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Plus, 
  Search, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Settings, 
  Code, 
  Copy, 
  Check, 
  Mail, 
  Users, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  UserPlus,
  Download,
  MoreHorizontal,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  Eye
} from 'lucide-react';
import { ScrollReveal } from './LandingView';
import * as XLSX from 'xlsx';

interface SubscribersViewProps {
  lang: 'en' | 'ar';
  apiKeys: any[];
  initialSubTab?: 'list' | 'settings';
  hideHeader?: boolean;
}

interface Subscriber {
  id: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  createdAt: string;
  updatedAt: string;
}

interface SubscriberSettings {
  welcomeEnabled: boolean;
  welcomeSubject: string;
  welcomeBody: string;
}

export const SubscribersView: React.FC<SubscribersViewProps> = ({ 
  lang, 
  apiKeys = [], 
  initialSubTab = 'list',
  hideHeader = false,
}) => {
  // Tabs: 'list' (Subscribers List) or 'settings' (Welcome Email & Embed Form)
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'settings'>(initialSubTab);
  
  // Data States
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [settings, setSettings] = useState<SubscriberSettings>({
    welcomeEnabled: false,
    welcomeSubject: 'Welcome to our newsletter!',
    welcomeBody: 'Hello {name},\n\nThank you for subscribing to our newsletter!\n\nBest regards.'
  });
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedSubIds, setSelectedSubIds] = useState<string[]>([]);

  // Widget Settings
  const [widgetTheme, setWidgetTheme] = useState<'light' | 'dark' | 'glass'>('light');
  const [widgetButtonColor, setWidgetButtonColor] = useState('#111111');
  const [widgetBorderRadius, setWidgetBorderRadius] = useState(8);

  // Email Preview
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  // Validation report
  const [validationReport, setValidationReport] = useState<{
    total: number;
    validCount: number;
    invalidCount: number;
    duplicateCount: number;
  } | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add Subscriber Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');
  const [newSubName, setNewSubName] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Import Excel/CSV wizard states
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1); // 1: upload, 2: mapping, 3: progress/success
  const [isDragging, setIsDragging] = useState(false);
  const [parsedHeaders, setParsedHeaders] = useState<string[]>([]);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [emailColumn, setEmailColumn] = useState('');
  const [nameColumn, setNameColumn] = useState('');
  const [sendWelcomeToImported, setSendWelcomeToImported] = useState(false);
  const [importProgress, setImportProgress] = useState(false);
  const [importResult, setImportResult] = useState<{ success: boolean; imported: number; welcomed: number; walletShortage: boolean } | null>(null);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Settings Save State
  const [saveLoading, setSaveLoading] = useState(false);
  const [settingsCopied, setSettingsCopied] = useState<'html' | 'js' | null>(null);

  // Retrieve active API key for embed code
  const activeApiKey = apiKeys.length > 0 ? apiKeys[0].key : 'YOUR_API_KEY';
  const apiEndpoint = `${window.location.protocol}//${window.location.host}/v1/subscribers/subscribe`;

  const translations = {
    en: {
      title: 'Subscribers & Opt-ins',
      subtitle: 'Manage client subscriptions, customize automatic welcome emails, and integrate sign-up forms.',
      tabList: 'Subscribers List',
      tabSettings: 'Opt-in Form & Settings',
      
      // Stats
      statTotal: 'Total Subscribers',
      statActive: 'Active Subscribers',
      statUnsubscribed: 'Unsubscribed',
      statWelcomeSent: 'Welcome Emails Sent',
      
      // List
      searchPlaceholder: 'Search subscribers by email or name...',
      filterAll: 'All Statuses',
      filterActive: 'Active Only',
      filterUnsubscribed: 'Unsubscribed Only',
      addSubscriberBtn: 'Add Subscriber',
      importSubscribersBtn: 'Import File',
      
      // Table
      colName: 'Name',
      colEmail: 'Email',
      colStatus: 'Status',
      colCreated: 'Subscribed Date',
      colActions: 'Actions',
      statusActive: 'Active',
      statusUnsubscribed: 'Unsubscribed',
      actionToggle: 'Toggle Status',
      actionDelete: 'Delete',
      noSubscribers: 'No subscribers found.',
      
      // Modals General
      cancelBtn: 'Cancel',
      closeBtn: 'Close',
      duplicateError: 'A subscriber with this email already exists.',
      invalidEmailError: 'Please enter a valid email address.',
      addSuccess: 'Subscriber added successfully.',
      
      // Manual Add Modal
      modalAddTitle: 'Add New Subscriber',
      labelName: 'Subscriber Name',
      labelEmail: 'Email Address',
      inputNamePlaceholder: 'e.g. Ali Ahmed',
      inputEmailPlaceholder: 'e.g. ali@example.com',
      addBtn: 'Add Subscriber',
      
      // Import Wizard Modal
      importWizardTitle: 'Import Subscribers from Excel / CSV',
      step1Title: '1. Select File',
      step1Desc: 'Upload a spreadsheet containing subscriber contacts. Supported formats: .xlsx, .xls, .csv',
      dragDropLabel: 'Drag and drop your file here, or click to browse',
      selectedFileLabel: 'Selected file:',
      nextBtn: 'Next Step',
      
      step2Title: '2. Map Columns',
      step2Desc: 'Map columns in your file to SumerSend fields. Identify which header holds email addresses and names.',
      mapEmailLabel: 'Email Column (Required)',
      mapNameLabel: 'Name Column (Optional)',
      previewHeading: 'Import Preview (First 4 rows):',
      selectColumnPlaceholder: '-- Select column --',
      sendWelcomeImportCheck: 'Send welcome email to imported subscribers',
      sendWelcomeImportWarn: 'Warning: This will send welcome emails to new active subscribers and deduct 10 coins per email from your wallet.',
      importSubmitBtn: 'Import Subscribers',
      
      step3Title: '3. Complete Import',
      importingProgress: 'Importing contacts, please wait...',
      importSuccessTitle: 'Import Completed successfully!',
      importSuccessDesc: 'Your contacts have been processed and merged into the subscribers list.',
      resultsImported: 'Total Imported:',
      resultsWelcomed: 'Welcome Emails Queued:',
      resultsWalletShort: 'Warning: Wallet depleted mid-import. Some welcome emails could not be sent due to insufficient funds.',
      
      // Settings
      settingsTitle: 'Welcome Email Configuration',
      settingsDesc: 'Send an automated welcome email immediately when a customer subscribes.',
      enableWelcome: 'Enable Automatic Welcome Email',
      enableWelcomeDesc: 'Costs 10 balance coins per welcome email sent via SMTP.',
      welcomeSubjectLabel: 'Welcome Email Subject',
      welcomeSubjectPlaceholder: 'e.g. Thank you for subscribing!',
      welcomeBodyLabel: 'Email Body (HTML/Text)',
      welcomeBodyDesc: 'Use {name} and {email} as dynamic placeholders in your message.',
      saveSettingsBtn: 'Save Settings',
      settingsSaveSuccess: 'Subscription settings updated successfully.',
      settingsSaveError: 'Failed to update settings.',
      
      // Live Preview
      previewTitle: 'Email Live Preview',
      previewFrom: 'From',
      previewTo: 'To',
      previewSubject: 'Subject',
      previewDefaultName: 'Subscriber Name',
      
      // Integration Code
      integrationTitle: 'Embed Opt-in Form Widget',
      integrationDesc: 'Copy and paste this HTML/JS code into your Substack blog, website, or app to capture subscribers.',
      integrationSnippetHtml: 'HTML Form Snippet',
      integrationSnippetJs: 'JavaScript Fetch Code',
      copyCode: 'Copy Snippet',
      copied: 'Copied!',
      embedInstructions: 'How to embed:',
      embedInstructionsText: 'Add this code directly to your site. It is pre-configured with CORS and will submit subscribers securely to your SumerSend dashboard.',
      downloadSample: 'Download Sample CSV',
      validationReportTitle: 'File Validation Summary',
      validEmails: 'Valid Contacts:',
      invalidEmails: 'Invalid/Blank Emails:',
      duplicatesInSheet: 'Duplicate Emails:',
      validationWarning: 'Duplicate and invalid emails will be automatically skipped.',
      selectedCount: 'selected',
      deleteSelected: 'Delete Selected',
      exportCSV: 'Export List',
      desktopPreview: 'Desktop',
      mobilePreview: 'Mobile',
      insertTokenLabel: 'Click to insert token:',
      customizerTitle: 'Customize Widget Styling',
      widgetThemeLabel: 'Widget Theme',
      widgetButtonColorLabel: 'Button Color',
      widgetRadiusLabel: 'Border Radius',
      previewDemoTitle: 'Live Widget Preview'
    },
    ar: {
      title: 'المشتركين والزبائن',
      subtitle: 'إدارة قوائم الزبائن والمشتركين، وتخصيص رسالة الترحيب التلقائية، وربط نماذج الاشتراك.',
      tabList: 'قائمة المشتركين',
      tabSettings: 'نموذج الاشتراك والإعدادات',
      
      // Stats
      statTotal: 'إجمالي المشتركين',
      statActive: 'المشتركين النشطين',
      statUnsubscribed: 'الملغى اشتراكهم',
      statWelcomeSent: 'رسائل الترحيب المرسلة',
      
      // List
      searchPlaceholder: 'البحث عن مشتركين بالاسم أو البريد الإلكتروني...',
      filterAll: 'جميع الحالات',
      filterActive: 'النشطين فقط',
      filterUnsubscribed: 'الملغى اشتراكهم فقط',
      addSubscriberBtn: 'إضافة مشترك جديد',
      importSubscribersBtn: 'استيراد ملف',
      
      // Table
      colName: 'الاسم',
      colEmail: 'البريد الإلكتروني',
      colStatus: 'الحالة',
      colCreated: 'تاريخ الاشتراك',
      colActions: 'العمليات',
      statusActive: 'نشط',
      statusUnsubscribed: 'ملغى الاشتراك',
      actionToggle: 'تغيير الحالة',
      actionDelete: 'حذف',
      noSubscribers: 'لم يتم العثور على أي مشتركين.',
      
      // Modals General
      cancelBtn: 'إلغاء',
      closeBtn: 'إغلاق',
      duplicateError: 'هذا البريد الإلكتروني مسجل كمشترك بالفعل.',
      invalidEmailError: 'يرجى إدخال بريد إلكتروني صحيح.',
      addSuccess: 'تم إضافة المشترك بنجاح.',
      
      // Manual Add Modal
      modalAddTitle: 'إضافة مشترك جديد',
      labelName: 'اسم المشترك',
      labelEmail: 'البريد الإلكتروني',
      inputNamePlaceholder: 'مثال: علي أحمد',
      inputEmailPlaceholder: 'مثال: ali@example.com',
      addBtn: 'إضافة مشترك',
      
      // Import Wizard Modal
      importWizardTitle: 'استيراد المشتركين عبر ملف إكسل / CSV',
      step1Title: '1. اختيار الملف',
      step1Desc: 'قم بتحميل ملف جدول بيانات يحتوي على جهات الاتصال الخاصة بك. الصيغ المدعومة: .xlsx, .xls, .csv',
      dragDropLabel: 'اسحب وأفلت الملف هنا، أو انقر للتصفح واختياره',
      selectedFileLabel: 'الملف المختار:',
      nextBtn: 'الخطوة التالية',
      
      step2Title: '2. تعيين الحقول',
      step2Desc: 'قم بمطابقة أعمدة ملفك مع حقول النظام لتحديد العمود الذي يحتوي على رسائل البريد الإلكتروني والأسماء.',
      mapEmailLabel: 'عمود البريد الإلكتروني (مطلوب)',
      mapNameLabel: 'عمود اسم المشترك (اختياري)',
      previewHeading: 'معاينة الاستيراد (أول 4 صفوف):',
      selectColumnPlaceholder: '-- اختر العمود --',
      sendWelcomeImportCheck: 'إرسال رسالة ترحيبية للمشتركين المستوردين',
      sendWelcomeImportWarn: 'تنبيه: سيتم إرسال بريد ترحيبي للمشتركين النشطين الجدد، وسيتم خصم 10 عملات لكل رسالة من محفظتك.',
      importSubmitBtn: 'بدء الاستيراد',
      
      step3Title: '3. اكتمال العملية',
      importingProgress: 'جاري استيراد جهات الاتصال، يرجى الانتظار...',
      importSuccessTitle: 'اكتمل الاستيراد بنجاح!',
      importSuccessDesc: 'تمت معالجة جهات الاتصال ودمجها في قائمة المشتركين الخاصة بك بنجاح.',
      resultsImported: 'تم استيراد:',
      resultsWelcomed: 'رسائل ترحيب تم جدولتها:',
      resultsWalletShort: 'تنبيه: نفد رصيد محفظتك أثناء العملية. لم يتم إرسال بعض رسائل الترحيب لعدم كفاية الرصيد.',
      
      // Settings
      settingsTitle: 'إعدادات رسالة الترحيب التلقائية',
      settingsDesc: 'أرسل رسالة بريد إلكتروني ترحيبية فورية تلقائياً بمجرد اشتراك العميل بموقعك.',
      enableWelcome: 'تفعيل رسالة الترحيب التلقائية',
      enableWelcomeDesc: 'تكلفة إرسال الرسالة هي 10 عملات من رصيد محفظتك عبر خادم الـ SMTP الخاص بك.',
      welcomeSubjectLabel: 'عنوان رسالة الترحيب',
      welcomeSubjectPlaceholder: 'مثال: شكراً لك على الاشتراك!',
      welcomeBodyLabel: 'نص الرسالة (يدعم HTML والخطوط)',
      welcomeBodyDesc: 'يمكنك استخدام المتغيرات {name} و {email} لوضع اسم وعنوان البريد التلقائي للزبون.',
      saveSettingsBtn: 'حفظ الإعدادات',
      settingsSaveSuccess: 'تم تحديث إعدادات الاشتراك بنجاح.',
      settingsSaveError: 'فشل حفظ الإعدادات.',
      
      // Live Preview
      previewTitle: 'معاينة حية للبريد الترحيبي',
      previewFrom: 'من',
      previewTo: 'إلى',
      previewSubject: 'العنوان',
      previewDefaultName: 'اسم المشترك تلقائياً',
      
      // Integration Code
      integrationTitle: 'نموذج الاشتراك البرمجي (Embed)',
      integrationDesc: 'انسخ كود الـ HTML/JS الموضح أدناه وضعه في مدونتك (Substack) أو موقعك لجمع المشتركين مباشرة.',
      integrationSnippetHtml: 'كود HTML للنموذج',
      integrationSnippetJs: 'كود Javascript (Fetch)',
      copyCode: 'نسخ الكود',
      copied: 'تم النسخ!',
      embedInstructions: 'كيفية الربط والتضمين:',
      embedInstructionsText: 'أضف هذا الكود مباشرة إلى موقعك. الكود يدعم استدعاءات الـ CORS لتسجيل المشتركين في لوحة SumerSend الخاصة بك فوراً وبشكل آمن.',
      downloadSample: 'تنزيل نموذج ملف CSV',
      validationReportTitle: 'ملخص التحقق من الملف',
      validEmails: 'جهات الاتصال الصالحة:',
      invalidEmails: 'رسائل بريد غير صالحة:',
      duplicatesInSheet: 'عناوين بريد متكررة:',
      validationWarning: 'سيتم تلقائياً تجاهل العناوين المتكررة وغير الصالحة.',
      selectedCount: 'محدد',
      deleteSelected: 'حذف المحدد',
      exportCSV: 'تصدير القائمة',
      desktopPreview: 'شاشة الحاسوب',
      mobilePreview: 'شاشة الهاتف',
      insertTokenLabel: 'انقر لإدراج متغير تلقائي:',
      customizerTitle: 'تخصيص تصميم النموذج',
      widgetThemeLabel: 'ثيم النموذج',
      widgetButtonColorLabel: 'لون زر الاشتراك',
      widgetRadiusLabel: 'حواف الإطارات (Radius)',
      previewDemoTitle: 'معاينة النموذج التفاعلي الحية'
    }
  };

  const t = translations[lang];

  // Fetch Subscribers & Settings
  const fetchData = async () => {
    setLoading(true);
    try {
      const [subsRes, settingsRes] = await Promise.all([
        fetch('http://127.0.0.1:3000/api/subscribers'),
        fetch('http://127.0.0.1:3000/api/subscribers/settings')
      ]);

      if (subsRes.ok) {
        const subsData = await subsRes.json();
        setSubscribers(subsData);
      }
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Error fetching subscribers view data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  // Statistics Computations
  const totalCount = subscribers.length;
  const activeCount = subscribers.filter(s => s.status === 'active').length;
  const unsubscribedCount = totalCount - activeCount;

  // Manual Add Subscriber Handler
  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!newSubEmail || !newSubEmail.includes('@')) {
      setAddError(t.invalidEmailError);
      return;
    }

    setAddLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3000/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newSubEmail, name: newSubName })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add subscriber');
      }

      const addedSub = await res.json();
      setSubscribers(prev => [addedSub, ...prev]);
      setIsAddModalOpen(false);
      setNewSubEmail('');
      setNewSubName('');
      
      window.dispatchEvent(new CustomEvent('sumer-toast', {
        detail: { message: t.addSuccess, type: 'success' }
      }));
    } catch (err: any) {
      setAddError(err.message === 'Subscriber with this email is already registered.' ? t.duplicateError : err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Toggle Subscriber Status
  const handleToggleStatus = async (id: string, currentStatus: 'active' | 'unsubscribed') => {
    const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/subscribers/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { 
            message: lang === 'ar' ? `تم تغيير حالة المشترك إلى ${newStatus === 'active' ? 'نشط' : 'ملغى الاشتراك'}` : `Subscriber status changed to ${newStatus}`, 
            type: 'success' 
          }
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Subscriber
  const handleDeleteSubscriber = async (id: string) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا المشترك نهائياً؟' : 'Are you sure you want to permanently delete this subscriber?')) {
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:3000/api/subscribers/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSubscribers(prev => prev.filter(s => s.id !== id));
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { message: lang === 'ar' ? 'تم حذف المشترك بنجاح' : 'Subscriber deleted successfully', type: 'success' }
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save Welcome Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:3000/api/subscribers/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { message: t.settingsSaveSuccess, type: 'success' }
        }));
      } else {
        throw new Error();
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('sumer-toast', {
        detail: { message: t.settingsSaveError, type: 'error' }
      }));
    } finally {
      setSaveLoading(false);
    }
  };

  // Drag and Drop files handling
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const headers = lang === 'ar' ? ['الاسم', 'البريد الالكتروني'] : ['Name', 'Email'];
    const row = lang === 'ar' ? ['جاسم كريم', 'jasim@prudctual.substack.com'] : ['Jasim Kareem', 'jasim@prudctual.substack.com'];
    const csvContent = "\uFEFF" + [headers.join(','), row.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", lang === 'ar' ? "نموذج_المشتركين.csv" : "subscribers_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setImportError('');
    
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error(lang === 'ar' ? 'فشل قراءة بيانات الملف.' : 'Failed to read file data.');
        }
        const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawJson.length === 0) {
          throw new Error(lang === 'ar' ? 'الملف فارغ.' : 'The selected file is empty.');
        }

        const headers = rawJson[0].map((h: any) => h ? String(h).trim() : '');
        setParsedHeaders(headers);

        const objectsJson = XLSX.utils.sheet_to_json(worksheet);
        setParsedRows(objectsJson);

        const emailIdx = headers.findIndex((h: string) => 
          /email|mail|البريد|الايميل/i.test(h)
        );
        const nameIdx = headers.findIndex((h: string) => 
          /name|fullname|الاسم|الزبون|العميل/i.test(h)
        );

        if (emailIdx !== -1) setEmailColumn(headers[emailIdx]);
        if (nameIdx !== -1) setNameColumn(headers[nameIdx]);

        setImportStep(2);
      } catch (err: any) {
        setImportError(lang === 'ar' ? `فشل تحليل الملف: ${err.message}` : `File parsing failed: ${err.message}`);
      }
    };

    fileReader.onerror = () => {
      setImportError(lang === 'ar' ? 'فشل قراءة الملف.' : 'FileReader error occurred.');
    };

    fileReader.readAsArrayBuffer(file);
  };

  // Validation report updater
  useEffect(() => {
    if (!emailColumn || parsedRows.length === 0) {
      setValidationReport(null);
      return;
    }

    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    const seen = new Set<string>();

    parsedRows.forEach(row => {
      const emailVal = row[emailColumn];
      if (!emailVal) {
        invalidCount++;
        return;
      }
      const trimmed = String(emailVal).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(trimmed);

      if (!isValid) {
        invalidCount++;
      } else if (seen.has(trimmed)) {
        duplicateCount++;
      } else {
        seen.add(trimmed);
        validCount++;
      }
    });

    setValidationReport({
      total: parsedRows.length,
      validCount,
      invalidCount,
      duplicateCount
    });
  }, [emailColumn, parsedRows]);

  // Submit Bulk Import
  const handleBulkImport = async () => {
    if (!emailColumn) return;

    setImportProgress(true);
    setImportStep(3);

    const mappedSubscribers = parsedRows.map(row => {
      return {
        email: row[emailColumn],
        name: nameColumn ? row[nameColumn] : null
      };
    }).filter(s => {
      if (!s.email) return false;
      const trimmed = String(s.email).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(trimmed);
    });

    try {
      const res = await fetch('http://127.0.0.1:3000/api/subscribers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscribers: mappedSubscribers,
          sendWelcome: sendWelcomeToImported
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to complete import');
      }

      const resData = await res.json();
      setImportResult({
        success: true,
        imported: resData.importedCount,
        welcomed: resData.welcomeQueuedCount,
        walletShortage: resData.walletShortage
      });

      fetchData();

      window.dispatchEvent(new CustomEvent('sumer-toast', {
        detail: { 
          message: lang === 'ar' ? `تم استيراد ${resData.importedCount} مشترك بنجاح.` : `Imported ${resData.importedCount} subscribers successfully.`, 
          type: 'success' 
        }
      }));

    } catch (err: any) {
      setImportResult({
        success: false,
        imported: 0,
        welcomed: 0,
        walletShortage: false
      });
      setImportError(err.message);
    } finally {
      setImportProgress(false);
    }
  };

  // Reset import wizard
  const resetImportWizard = () => {
    setImportStep(1);
    setParsedHeaders([]);
    setParsedRows([]);
    setFileName('');
    setEmailColumn('');
    setNameColumn('');
    setSendWelcomeToImported(false);
    setImportResult(null);
    setImportError('');
    setValidationReport(null);
  };

  // CSV Export helper
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const csvRows = [
      ['Name', 'Email', 'Status', 'Subscribed Date'],
      ...subscribers.map(s => [
        s.name || '',
        s.email,
        s.status,
        new Date(s.createdAt).toISOString()
      ])
    ];
    const csvContent = "\uFEFF" + csvRows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sumersend_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Insert token helper
  const handleInsertToken = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = settings.welcomeBody;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newBody = before + token + after;
    setSettings(prev => ({ ...prev, welcomeBody: newBody }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  };

  // Selection helpers
  const handleSelectSub = (id: string) => {
    setSelectedSubIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllOnPage = (pageSubs: Subscriber[]) => {
    const pageIds = pageSubs.map(s => s.id);
    const allSelected = pageIds.length > 0 && pageIds.every(id => selectedSubIds.includes(id));
    if (allSelected) {
      setSelectedSubIds(prev => prev.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedSubIds(prev => {
        const newIds = pageIds.filter(id => !prev.includes(id));
        return [...prev, ...newIds];
      });
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (!window.confirm(lang === 'ar' ? `هل أنت متأكد من حذف ${selectedSubIds.length} مشترك نهائياً؟` : `Are you sure you want to permanently delete ${selectedSubIds.length} subscribers?`)) {
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:3000/api/subscribers/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedSubIds })
      });

      if (res.ok) {
        setSubscribers(prev => prev.filter(s => !selectedSubIds.includes(s.id)));
        setSelectedSubIds([]);
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { 
            message: lang === 'ar' ? 'تم حذف المشتركين المحددين بنجاح' : 'Selected subscribers deleted successfully', 
            type: 'success' 
          }
        }));
      } else {
        throw new Error();
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('sumer-toast', {
        detail: { 
          message: lang === 'ar' ? 'فشل حذف المشتركين' : 'Failed to delete subscribers', 
          type: 'error' 
        }
      }));
    }
  };


  // Filtered list
  const filteredSubscribers = subscribers.filter(s => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (statusFilter === 'active') return matchesSearch && s.status === 'active';
    if (statusFilter === 'unsubscribed') return matchesSearch && s.status === 'unsubscribed';
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleCopyCode = (type: 'html' | 'js', code: string) => {
    navigator.clipboard.writeText(code);
    setSettingsCopied(type);
    setTimeout(() => setSettingsCopied(null), 3000);
  };

  // Avatar initials helper
  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      return parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].substring(0, 2).toUpperCase();
    }
    if (email) return email.substring(0, 2).toUpperCase();
    return '??';
  };

  // Avatar color palette (warm, pastel)
  const avatarColors = [
    { bg: '#E8F5E9', text: '#2E7D32' },
    { bg: '#FFF3E0', text: '#E65100' },
    { bg: '#F3E5F5', text: '#7B1FA2' },
    { bg: '#E3F2FD', text: '#1565C0' },
    { bg: '#FFF8E1', text: '#F57F17' },
    { bg: '#FCE4EC', text: '#C62828' },
    { bg: '#E0F7FA', text: '#00838F' },
    { bg: '#FBE9E7', text: '#BF360C' },
  ];

  const getAvatarColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
  };

  // Donut chart for stats sidebar
  const activePercent = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0;
  const unsubPercent = totalCount > 0 ? 100 - activePercent : 0;

  // Generated snippets
  const formHtmlCode = `<!-- SumerSend subscription widget -->
<div class="sumersend-optin-card">
  <h3>Subscribe to our newsletter</h3>
  <form id="sumersend-optin-form">
    <input type="text" id="sumersend-optin-name" placeholder="Your Name" required />
    <input type="email" id="sumersend-optin-email" placeholder="email@example.com" required />
    <button type="submit">Subscribe</button>
    <div id="sumersend-optin-message" style="display:none; margin-top:10px; font-size:13px;"></div>
  </form>
</div>

<style>
.sumersend-optin-card {
  max-width: 360px;
  padding: 24px;
  border-radius: ${widgetBorderRadius}px;
  border: 1px solid ${widgetTheme === 'dark' ? '#27272a' : widgetTheme === 'glass' ? 'rgba(255, 255, 255, 0.15)' : '#eaeaea'};
  font-family: system-ui, -apple-system, sans-serif;
  background: ${widgetTheme === 'dark' ? '#09090b' : widgetTheme === 'glass' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff'};
  color: ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111'};
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  ${widgetTheme === 'glass' ? 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);' : ''}
}
.sumersend-optin-card h3 {
  margin-top: 0;
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}
.sumersend-optin-card input {
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 12px;
  border: 1px solid ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#27272a' : '#d1d1d1'};
  background: ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#18181b' : '#ffffff'};
  color: ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111'};
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 14px;
}
.sumersend-optin-card button {
  width: 100%;
  padding: 10px;
  background: ${widgetButtonColor};
  color: ${widgetButtonColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff'};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.sumersend-optin-card button:hover { opacity: 0.9; }
</style>

<script>
document.getElementById('sumersend-optin-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('sumersend-optin-name').value;
  const email = document.getElementById('sumersend-optin-email').value;
  const msgDiv = document.getElementById('sumersend-optin-message');
  
  try {
    const res = await fetch('${apiEndpoint}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: '${activeApiKey}',
        email: email,
        name: name
      })
    });
    
    const data = await res.json();
    if (res.ok && data.success) {
      msgDiv.style.color = '#10b981';
      msgDiv.innerText = 'Thank you for subscribing!';
      msgDiv.style.display = 'block';
      document.getElementById('sumersend-optin-form').reset();
    } else {
      throw new Error(data.error?.message || 'Subscription failed');
    }
  } catch (err) {
    msgDiv.style.color = '#ef4444';
    msgDiv.innerText = err.message;
    msgDiv.style.display = 'block';
  }
});
</script>`;

  const formJsCode = `// Standard JS integration code
const subscribeCustomer = async (email, name) => {
  const response = await fetch('${apiEndpoint}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      apiKey: '${activeApiKey}',
      email: email,
      name: name
    })
  });
  return await response.json();
};

// Example usage:
subscribeCustomer('customer@domain.com', 'Jasim Kareem')
  .then(data => console.log('Subscriber added:', data))
  .catch(err => console.error(err));`;

  return (
    <ScrollReveal>
      {/* === Scholarly Dashboard Scoped Styles === */}
      <style>{`
        /* ─── Stat Cards: Floating borderless sage-system cards ─── */
        .sch-stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 18px;
          margin-bottom: 28px;
        }

        .sch-stat-card {
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 22px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
          cursor: default;
        }

        /* Ambient Glow Behind Stats Cards */
        .sch-stat-card::before {
          content: "";
          position: absolute;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          filter: blur(35px);
          opacity: 0.12;
          z-index: 0;
          top: -20px;
          right: -20px;
        }
        .sch-stat-card.mint::before { background: #10b981; }
        .sch-stat-card.amber::before { background: #f59e0b; }
        .sch-stat-card.rose::before { background: #ef4444; }
        .sch-stat-card.sky::before { background: #3b82f6; }

        .sch-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover);
        }
        .sch-stat-card.mint:hover { border-color: rgba(16, 185, 129, 0.25); }
        .sch-stat-card.amber:hover { border-color: rgba(245, 158, 11, 0.25); }
        .sch-stat-card.rose:hover { border-color: rgba(239, 68, 68, 0.25); }
        .sch-stat-card.sky:hover { border-color: rgba(59, 130, 246, 0.25); }

        /* Color-Specific Icon Badges & Accents */
        .sch-stat-card .sch-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: transform 0.25s ease;
          z-index: 1;
          color: #ffffff !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .sch-stat-card:hover .sch-stat-icon {
          transform: scale(1.08);
        }

        /* Mint (Total Subscribers) */
        .sch-stat-card.mint .sch-stat-icon {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        /* Amber (Active) */
        .sch-stat-card.amber .sch-stat-icon {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        /* Rose (Unsubscribed) */
        .sch-stat-card.rose .sch-stat-icon {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }

        /* Sky (Welcome Sent) */
        .sch-stat-card.sky .sch-stat-icon {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .sch-stat-value {
          font-size: 32px;
          font-weight: 800;
          letter-spacing: -1px;
          line-height: 1;
          color: var(--text-primary);
          z-index: 1;
        }

        .sch-stat-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          z-index: 1;
        }

        .sch-stat-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 10.5px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          border: none;
          z-index: 1;
        }

        .sch-stat-card.mint .sch-stat-badge {
          background: rgba(16, 185, 129, 0.08);
          color: #047857;
        }
        [data-theme="dark"] .sch-stat-card.mint .sch-stat-badge {
          background: rgba(16, 185, 129, 0.16);
          color: #34d399;
        }

        .sch-stat-card.amber .sch-stat-badge {
          background: rgba(245, 158, 11, 0.08);
          color: #b45309;
        }
        [data-theme="dark"] .sch-stat-card.amber .sch-stat-badge {
          background: rgba(245, 158, 11, 0.16);
          color: #fbbf24;
        }

        .sch-stat-card.rose .sch-stat-badge {
          background: rgba(239, 68, 68, 0.08);
          color: #b91c1c;
        }
        [data-theme="dark"] .sch-stat-card.rose .sch-stat-badge {
          background: rgba(239, 68, 68, 0.16);
          color: #f87171;
        }

        .sch-stat-card.sky .sch-stat-badge {
          background: rgba(59, 130, 246, 0.08);
          color: #1e40af;
        }
        [data-theme="dark"] .sch-stat-card.sky .sch-stat-badge {
          background: rgba(59, 130, 246, 0.16);
          color: #93c5fd;
        }

        /* ─── Main Content Layout ─── */
        .sch-content-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1100px) {
          .sch-content-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ─── Panel Cards ─── */
        .sch-panel {
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          box-shadow: var(--card-shadow);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
        }

        .sch-panel:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover);
          border-color: rgba(16, 185, 129, 0.12);
        }

        .sch-panel-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 4px 0;
        }

        .sch-panel-desc {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 20px 0;
          line-height: 1.4;
        }

        /* ─── Unified Toolbar ─── */
        .sch-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .sch-toolbar-start {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 280px;
        }

        /* ─── Search Bar ─── */
        .sch-search-wrap {
          position: relative;
          flex: 1;
          max-width: 320px;
          min-width: 200px;
        }

        .sch-search-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
          z-index: 2;
          inset-inline-start: 12px;
        }

        .sch-search-input {
          width: 100%;
          height: 38px;
          background: var(--panel-muted);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          font-size: 13px;
          color: var(--text-primary);
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
          font-family: var(--font-family);
          padding-inline-start: 34px;
          padding-inline-end: 12px;
          direction: inherit;
          text-align: start;
        }

        .sch-search-input:focus {
          outline: none;
          border-color: var(--accent-text);
          box-shadow: 0 0 0 3px rgba(0, 107, 255, 0.08);
          background: var(--panel-bg);
        }

        .sch-search-input::placeholder {
          color: var(--text-muted);
        }

        /* ─── Filter Pills ─── */
        .sch-pills {
          display: flex;
          gap: 4px;
          background: var(--panel-muted);
          padding: 3px;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          height: 38px;
          align-items: center;
        }

        .sch-pill {
          border: none;
          background: transparent;
          color: var(--text-secondary);
          padding: 0 12px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
          white-space: nowrap;
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .sch-pill:hover {
          color: var(--text-primary);
          background: rgba(0,0,0,0.03);
        }

        [data-theme="dark"] .sch-pill:hover {
          background: rgba(255,255,255,0.05);
        }

        .sch-pill.active {
          background: var(--panel-bg);
          color: var(--text-primary);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        [data-theme="dark"] .sch-pill.active {
          background: var(--panel-elevated);
        }

        /* ─── Action Buttons Row ─── */
        .sch-actions-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .sch-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0 14px;
          height: 38px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid var(--border-color);
          background: var(--panel-bg);
          color: var(--text-primary);
          font-family: var(--font-family);
          white-space: nowrap;
        }

        @media (max-width: 600px) {
          .sch-toolbar-start {
            width: 100%;
          }
          .sch-search-wrap {
            max-width: 100%;
            width: 100%;
          }
          .sch-pills {
            width: 100%;
            justify-content: space-around;
          }
          .sch-pill {
            flex: 1;
          }
          .sch-actions-row {
            width: 100%;
            justify-content: stretch;
          }
          .sch-actions-row .sch-btn {
            flex: 1;
            justify-content: center;
          }
        }


        .sch-btn:hover {
          border-color: var(--text-secondary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.04);
          transform: translateY(-1px);
        }

        .sch-btn:active {
          transform: translateY(0);
        }

        .sch-btn-primary {
          background: var(--text-primary);
          color: var(--panel-bg);
          border-color: var(--text-primary);
        }

        .sch-btn-primary:hover {
          opacity: 0.9;
          border-color: var(--text-primary);
        }

        .sch-btn-danger {
          background: var(--danger-bg);
          color: var(--danger-text);
          border-color: rgba(238, 0, 0, 0.15);
        }

        .sch-btn-danger:hover {
          background: var(--danger-color);
          color: #ffffff;
          border-color: var(--danger-color);
        }

        /* ─── Subscriber List Rows (Activity Style) ─── */
        .sch-subscriber-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .sch-sub-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 14px;
          transition: background-color 0.15s ease;
          cursor: default;
          position: relative;
        }

        .sch-sub-row:hover {
          background: var(--panel-muted);
        }

        .sch-sub-avatar {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 800;
          flex-shrink: 0;
          letter-spacing: -0.5px;
        }

        .sch-sub-info {
          flex: 1;
          min-width: 0;
          padding-inline-end: 24px;
        }

        .sch-sub-name {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sch-sub-email {
          font-size: 12px;
          color: var(--text-muted);
          font-family: 'Menlo', 'Monaco', monospace;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sch-sub-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }

        .sch-sub-date {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          min-width: 70px;
          text-align: start;
        }

        /* ─── Status Badge ─── */
        .sch-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 99px;
          font-size: 11.5px;
          font-weight: 700;
          white-space: nowrap;
          min-width: 96px;
          justify-content: center;
        }

        .sch-badge.active {
          background: #d1fae5;
          color: #065f46;
        }

        .sch-badge.unsubscribed {
          background: var(--panel-muted);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
        }

        [data-theme="dark"] .sch-badge.active {
          background: rgba(16, 185, 129, 0.15);
          color: #6ee7b7;
        }

        .sch-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .sch-badge.active .sch-badge-dot {
          background: #10b981;
          box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
          animation: sch-pulse 2s infinite;
        }

        .sch-badge.unsubscribed .sch-badge-dot {
          background: var(--text-muted);
        }

        @keyframes sch-pulse {
          0% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 5px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0px rgba(16, 185, 129, 0); }
        }

        /* ─── Row Action Icons ─── */
        .sch-row-actions {
          display: flex;
          gap: 4px;
          opacity: 0.35;
          transition: opacity 0.2s ease;
          width: 68px;
          justify-content: flex-end;
        }

        .sch-sub-row:hover .sch-row-actions {
          opacity: 1;
        }

        .sch-icon-btn {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .sch-icon-btn:hover {
          background: var(--panel-muted);
          color: var(--text-primary);
        }

        .sch-icon-btn.danger:hover {
          background: var(--danger-bg);
          color: var(--danger-text);
        }

        .sch-icon-btn.toggle-active {
          color: var(--success-color);
        }

        /* ─── Checkbox ─── */
        .sch-checkbox {
          position: relative;
          display: inline-block;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .sch-checkbox input {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }

        .sch-checkmark {
          position: absolute;
          top: 0;
          left: 0;
          height: 16px;
          width: 16px;
          background: var(--panel-bg);
          border: 1.5px solid var(--border-color);
          border-radius: 5px;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .sch-checkbox:hover input ~ .sch-checkmark {
          border-color: var(--text-secondary);
        }

        .sch-checkbox input:checked ~ .sch-checkmark {
          background: var(--text-primary);
          border-color: var(--text-primary);
        }

        .sch-checkmark:after {
          content: "";
          position: absolute;
          display: none;
          left: 5px;
          top: 1.5px;
          width: 4px;
          height: 7px;
          border: solid var(--panel-bg);
          border-width: 0 1.5px 1.5px 0;
          transform: rotate(45deg);
        }

        .sch-checkbox input:checked ~ .sch-checkmark:after {
          display: block;
        }

        /* ─── Sidebar Panel: Distribution + Quick Add ─── */
        .sch-sidebar-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .sch-donut-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 8px 0;
        }

        .sch-donut-svg {
          width: 140px;
          height: 140px;
          transform: rotate(-90deg);
        }

        .sch-donut-legend {
          display: flex;
          gap: 20px;
        }

        .sch-legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .sch-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ─── Quick Add Card ─── */
        .sch-quick-add-card {
          background: var(--panel-bg);
          border: 1.5px dashed var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          text-align: center;
          box-shadow: var(--card-shadow);
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
        }

        .sch-quick-add-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--card-shadow-hover);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .sch-quick-avatars {
          display: flex;
          gap: 0;
        }

        .sch-quick-avatar-bubble {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          margin-inline-start: -8px;
          border: 2px solid var(--panel-muted);
        }

        .sch-quick-avatar-bubble:first-child {
          margin-inline-start: 0;
        }

        /* ─── Floating Bulk Bar ─── */
        .sch-floating-bar {
          position: fixed;
          bottom: 28px;
          left: 50%;
          transform: translate(-50%, 100px);
          background: rgba(15, 15, 15, 0.96);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 8px 16px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 1000;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          opacity: 0;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
          pointer-events: none;
        }

        .sch-floating-bar.visible {
          transform: translate(-50%, 0);
          opacity: 1;
          pointer-events: auto;
        }

        /* ─── Pagination ─── */
        .sch-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 4px 4px 4px;
        }

        .sch-page-info {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .sch-page-btns {
          display: flex;
          gap: 6px;
        }

        .sch-page-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: var(--panel-bg);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sch-page-btn:hover:not(:disabled) {
          border-color: var(--text-secondary);
          background: var(--panel-muted);
          transform: translateY(-1px);
        }

        .sch-page-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .sch-page-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        /* ─── Modals ─── */
        .sch-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          animation: sch-fade-in 0.2s ease-out;
        }

        @keyframes sch-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sch-modal-box {
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 22px;
          padding: 28px;
          width: 100%;
          box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.15);
          animation: sch-scale-up 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          max-height: 90vh;
          overflow-y: auto;
        }

        @keyframes sch-scale-up {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        /* ─── Upload Zone ─── */
        .sch-upload-zone {
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
          background: transparent;
        }

        .sch-upload-zone:hover {
          border-color: var(--text-secondary);
          background: var(--panel-muted);
        }

        .sch-upload-zone.dragging {
          border-color: var(--accent-text);
          background: var(--accent-bg);
        }

        /* ─── Settings Grid ─── */
        .sch-settings-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.6fr) minmax(0, 1.1fr);
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 900px) {
          .sch-settings-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ─── Code Block ─── */
        .sch-code-block {
          background: var(--panel-muted);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 11.5px;
          color: var(--text-primary);
          overflow-x: auto;
          margin: 0;
          max-height: 200px;
          line-height: 1.6;
        }

        /* ─── Browser Mockup ─── */
        .sch-browser-mockup {
          border: 1px solid var(--border-color);
          border-radius: 18px;
          overflow: hidden;
          background: var(--panel-bg);
          box-shadow: var(--card-shadow);
          display: flex;
          flex-direction: column;
        }

        .sch-browser-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          display: inline-block;
        }

        /* ─── Empty State ─── */
        .sch-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 12px;
          text-align: center;
        }

        .sch-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: var(--panel-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        /* ─── Progress Stepper ─── */
        .sch-stepper {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .sch-step-bar {
          height: 4px;
          flex: 1;
          border-radius: 2px;
          background: var(--border-color);
          transition: background-color 0.4s ease;
        }

        .sch-step-bar.done {
          background: var(--text-primary);
        }

        /* ─── Skeleton Loader ─── */
        .sch-skeleton {
          background: linear-gradient(90deg, var(--panel-muted) 25%, var(--border-color) 50%, var(--panel-muted) 75%);
          background-size: 200% 100%;
          animation: sch-shimmer 1.5s infinite;
          border-radius: 10px;
        }

        @keyframes sch-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─── Input Styles ─── */
        .sch-input {
          width: 100%;
          height: 40px;
          padding: 0 14px;
          background: var(--panel-bg);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 13px;
          color: var(--text-primary);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          font-family: var(--font-family);
          box-sizing: border-box;
        }

        .sch-input:focus {
          outline: none;
          border-color: var(--accent-text);
          box-shadow: 0 0 0 3px rgba(0, 107, 255, 0.08);
        }

        .sch-input::placeholder {
          color: var(--text-muted);
        }

        .sch-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--text-secondary);
          margin-bottom: 6px;
        }

        .sch-textarea {
          width: 100%;
          padding: 12px 14px;
          background: var(--panel-bg);
          border: 1.5px solid var(--border-color);
          border-radius: 12px;
          font-size: 13px;
          color: var(--text-primary);
          font-family: 'Menlo', monospace;
          resize: vertical;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          box-sizing: border-box;
        }

        .sch-textarea:focus {
          outline: none;
          border-color: var(--accent-text);
          box-shadow: 0 0 0 3px rgba(0, 107, 255, 0.08);
        }

        /* ─── Premium Showcase Row & Cards ─── */
        .sch-showcase-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }

        @media (max-width: 768px) {
          .sch-showcase-row {
            grid-template-columns: 1fr;
          }
        }

        .sch-showcase-card {
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: relative;
          overflow: hidden;
          box-shadow: var(--card-shadow);
          min-height: 190px;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
          gap: 16px;
        }

        .sch-showcase-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--card-shadow-hover);
          border-color: rgba(16, 185, 129, 0.15);
        }

        .sch-showcase-card::before {
          content: "";
          position: absolute;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.12;
          z-index: 0;
          top: -20px;
          right: -20px;
        }

        .sch-showcase-card.tips::before {
          background: #6366f1;
        }

        .sch-showcase-card.giveaway::before {
          background: #10b981;
        }

        .sch-showcase-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          flex: 1;
          z-index: 2;
          text-align: start;
        }

        .sch-showcase-badge {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 8px;
          border-radius: 6px;
          background: rgba(99, 102, 241, 0.08);
          color: #6366f1;
        }

        .sch-showcase-card.giveaway .sch-showcase-badge {
          background: rgba(16, 185, 129, 0.08);
          color: #10b981;
        }

        .sch-showcase-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sch-showcase-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
        }

        .sch-showcase-icon.orange {
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        }

        .sch-showcase-icon.blue {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .sch-showcase-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0;
        }

        .sch-showcase-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.4;
          margin: 0;
          max-width: 280px;
        }

        .sch-showcase-actions {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        .sch-showcase-visual {
          position: relative;
          width: 140px;
          height: 110px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          z-index: 1;
        }

        .sch-avatar-group {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .sch-visual-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid var(--panel-bg);
          box-shadow: 0 8px 16px rgba(0,0,0,0.08);
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }

        .sch-visual-avatar.av1 {
          background: linear-gradient(135deg, #fca5a5 0%, #ef4444 100%);
          left: 10px;
          top: 35px;
          z-index: 3;
        }

        .sch-visual-avatar.av2 {
          background: linear-gradient(135deg, #86efac 0%, #10b981 100%);
          left: 45px;
          top: 25px;
          z-index: 2;
        }

        .sch-visual-avatar.av3 {
          background: linear-gradient(135deg, #93c5fd 0%, #3b82f6 100%);
          left: 80px;
          top: 35px;
          z-index: 1;
        }

        .sch-visual-bubble {
          position: absolute;
          background: var(--panel-bg);
          border: 1px solid var(--border-color);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-radius: 12px;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          animation: sch-float 4s ease-in-out infinite;
        }

        .sch-visual-bubble.b1 {
          left: -10px;
          top: 5px;
          animation-delay: 0s;
        }

        .sch-visual-bubble.b2 {
          right: -10px;
          top: 10px;
          animation-delay: 2s;
        }

        .sch-visual-widget {
          width: 90px;
          height: 70px;
          background: var(--panel-bg);
          border: 1.5px solid var(--border-color);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-radius: 10px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transform: rotate(-8deg) translateY(5px);
          transition: transform 0.3s ease;
        }

        .sch-showcase-card:hover .sch-visual-widget {
          transform: rotate(-4deg) translateY(0);
        }

        .sch-visual-widget-line {
          height: 5px;
          border-radius: 3px;
          background: var(--panel-muted);
          width: 100%;
        }

        .sch-visual-widget-line.short {
          width: 60%;
        }

        .sch-visual-widget-btn {
          height: 12px;
          background: #6366f1;
          border-radius: 4px;
          width: 100%;
          margin-top: auto;
        }

        .sch-confetti-particle {
          position: absolute;
          width: 5px;
          height: 5px;
          border-radius: 2px;
          opacity: 0.6;
        }

        .sch-confetti-particle.p1 { background: #3b82f6; left: 10px; top: 15px; transform: rotate(15deg); }
        .sch-confetti-particle.p2 { background: #ec4899; right: 20px; top: 20px; transform: rotate(45deg); }
        .sch-confetti-particle.p3 { background: #10b981; left: 15px; bottom: 15px; transform: rotate(-30deg); }
        .sch-confetti-particle.p4 { background: #f59e0b; right: 20px; bottom: 25px; transform: rotate(60deg); }
      `}</style>

      {/* ═══════════ Page Header & Tab Navigation Combined Row ═══════════ */}
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
        {!hideHeader && (
          <h1 style={{ 
            fontSize: '22px', 
            fontWeight: 800, 
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: lang === 'ar' ? '0' : '-0.7px'
          }}>
            {t.title}
          </h1>
        )}

        <div className="vercel-tabs-container" style={{ margin: 0, overflowX: 'auto' }}>
          <button
            onClick={() => setActiveSubTab('list')}
            className={`vercel-tab-btn ${activeSubTab === 'list' ? 'active' : ''}`}
          >
            <Users size={14} />
            <span>{t.tabList}</span>
          </button>
          <button
            onClick={() => setActiveSubTab('settings')}
            className={`vercel-tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
          >
            <Settings size={14} />
            <span>{t.tabSettings}</span>
          </button>
        </div>
      </div>

      {loading ? (
        /* ═══════════ Skeleton Loading State ═══════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="sch-stats-row">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="sch-skeleton" style={{ height: '110px', borderRadius: '18px' }} />
            ))}
          </div>
          <div className="sch-content-grid">
            <div className="sch-skeleton" style={{ height: '400px', borderRadius: '18px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="sch-skeleton" style={{ height: '220px', borderRadius: '18px' }} />
              <div className="sch-skeleton" style={{ height: '160px', borderRadius: '18px' }} />
            </div>
          </div>
        </div>
      ) : activeSubTab === 'list' ? (
        /* ═══════════════════════════════════════ */
        /* ═══════════ TAB 1: LIST ═══════════ */
        /* ═══════════════════════════════════════ */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          
          <div className="sch-stats-row">
            {/* Card 1: Total Subscribers */}
            <div className="sch-stat-card mint">
              <div className="sch-stat-header">
                <div className="sch-stat-icon"><Users size={18} /></div>
                <span className="sch-stat-badge">
                  <TrendingUp size={10} style={{ marginInlineEnd: '2px' }} />
                  {totalCount > 0 ? '+' + Math.min(totalCount, 12) + '%' : '—'}
                </span>
              </div>
              <div className="sch-stat-value">{totalCount}</div>
              <div className="sch-stat-label">{t.statTotal}</div>
            </div>

            {/* Card 2: Active Subscribers */}
            <div className="sch-stat-card amber">
              <div className="sch-stat-header">
                <div className="sch-stat-icon"><CheckCircle2 size={18} /></div>
                <span className="sch-stat-badge">
                  {activePercent}%
                </span>
              </div>
              <div className="sch-stat-value">{activeCount}</div>
              <div className="sch-stat-label">{t.statActive}</div>
            </div>

            {/* Card 3: Unsubscribed */}
            <div className="sch-stat-card rose">
              <div className="sch-stat-header">
                <div className="sch-stat-icon"><XCircle size={18} /></div>
                <span className="sch-stat-badge">
                  {unsubPercent}%
                </span>
              </div>
              <div className="sch-stat-value">{unsubscribedCount}</div>
              <div className="sch-stat-label">{t.statUnsubscribed}</div>
            </div>

            {/* Card 4: Welcome Emails Sent */}
            <div className="sch-stat-card sky">
              <div className="sch-stat-header">
                <div className="sch-stat-icon"><Mail size={18} /></div>
                <span className="sch-stat-badge">
                  {lang === 'ar' ? 'تلقائي' : 'AUTO'}
                </span>
              </div>
              <div className="sch-stat-value" style={{ 
                color: settings.welcomeEnabled ? 'var(--success-color)' : 'var(--danger-color)'
              }}>
                {settings.welcomeEnabled ? (lang === 'ar' ? '✓ نشط' : '✓ Active') : (lang === 'ar' ? '✗ معطل' : '✗ Disabled')}
              </div>
              <div className="sch-stat-label">{t.statWelcomeSent}</div>
            </div>
          </div>


          {/* ─── Premium Showcase Row (Tips & Giveaways Styles) ─── */}
          <div className="sch-showcase-row" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
            {/* Card 1: Subscribers Console (Tips Style) */}
            <div className="sch-showcase-card tips">
              <div className="sch-showcase-content">
                <span className="sch-showcase-badge" style={{ 
                  background: 'rgba(245, 158, 11, 0.08)', 
                  color: '#d97706' 
                }}>
                  {lang === 'ar' ? 'إجراءات سريعة' : 'QUICK ACTIONS'}
                </span>
                <div className="sch-showcase-header">
                  <div className="sch-showcase-icon orange">
                    <UserPlus size={16} />
                  </div>
                  <h3 className="sch-showcase-title">
                    {lang === 'ar' ? 'لوحة تحكم المشتركين' : 'Subscribers Database'}
                  </h3>
                </div>
                <p className="sch-showcase-desc">
                  {lang === 'ar' 
                    ? 'أضف جهات اتصال يدوياً أو استورد جهات الاتصال من ملفات Excel و CSV لإطلاق حملاتك.' 
                    : 'Manage subscriber lists, add records manually, or upload spreadsheets to grow your audience.'}
                </p>
                <div className="sch-showcase-actions">
                  <button onClick={() => setIsAddModalOpen(true)} className="sch-btn sch-btn-primary" style={{ borderRadius: '10px', height: '32px', fontSize: '12px', padding: '0 12px' }}>
                    <Plus size={12} />
                    <span>{lang === 'ar' ? 'إضافة مشترك' : 'Add Subscriber'}</span>
                  </button>
                  <button onClick={() => setIsImportModalOpen(true)} className="sch-btn" style={{ borderRadius: '10px', height: '32px', fontSize: '12px', padding: '0 12px' }}>
                    <Upload size={12} />
                    <span>{lang === 'ar' ? 'استيراد ملف' : 'Import CSV'}</span>
                  </button>
                </div>
              </div>

              <div className="sch-showcase-visual">
                <div className="sch-avatar-group">
                  <div className="sch-visual-avatar av1">👩‍💻</div>
                  <div className="sch-visual-avatar av2">👨‍💻</div>
                  <div className="sch-visual-avatar av3">🧑‍💻</div>
                  <div className="sch-visual-bubble b1">
                    {lang === 'ar' ? 'شكراً!' : 'Thanks!'}
                  </div>
                  <div className="sch-visual-bubble b2">
                    {lang === 'ar' ? 'تم الاشتراك!' : 'Subscribed!'}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Web Opt-in Widgets (Giveaways Style) */}
            <div className="sch-showcase-card giveaway">
              <div className="sch-showcase-content">
                <span className="sch-showcase-badge">
                  {lang === 'ar' ? 'تكامل وتضمين' : 'INTEGRATIONS'}
                </span>
                <div className="sch-showcase-header">
                  <div className="sch-showcase-icon blue">
                    <Code size={16} />
                  </div>
                  <h3 className="sch-showcase-title">
                    {lang === 'ar' ? 'أكواد ونماذج التضمين' : 'Embeddable Forms'}
                  </h3>
                </div>
                <p className="sch-showcase-desc">
                  {lang === 'ar' 
                    ? 'صمم نموذج اشتراك مخصص وضعه في موقعك الإلكتروني لتسجيل الزوار تلقائياً.' 
                    : 'Embed custom newsletter opt-in forms on your website or Substack to automate signup.'}
                </p>
                <div className="sch-showcase-actions">
                  <button onClick={() => setActiveSubTab('settings')} className="sch-btn" style={{ 
                    borderRadius: '10px', 
                    height: '32px', 
                    fontSize: '12px', 
                    padding: '0 12px',
                    background: '#6366f1',
                    color: '#ffffff',
                    borderColor: '#6366f1'
                  }}>
                    <Settings size={12} style={{ color: '#ffffff' }} />
                    <span>{lang === 'ar' ? 'إعداد الكود التفاعلي' : 'Setup Widget'}</span>
                  </button>
                </div>
              </div>

              <div className="sch-showcase-visual">
                <div className="sch-confetti-particle p1" />
                <div className="sch-confetti-particle p2" />
                <div className="sch-confetti-particle p3" />
                <div className="sch-confetti-particle p4" />
                
                <div className="sch-visual-widget">
                  <div className="sch-visual-widget-line" />
                  <div className="sch-visual-widget-line short" />
                  <div className="sch-visual-widget-btn" />
                </div>
                
                <div className="sch-visual-bubble b2" style={{ right: '5px', bottom: '10px', top: 'auto', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' }}>
                  {lang === 'ar' ? 'تم التفعيل!' : 'Done!'}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Main Content Grid ─── */}
          <div className="sch-content-grid">
            
            {/* Left: Subscriber List Panel */}
            <div className="sch-panel">
              
              {/* Toolbar */}
              <div className="sch-toolbar" style={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
                <div className="sch-toolbar-start">
                  <div className="sch-search-wrap">
                    <Search size={16} className="sch-search-icon" />
                    <input
                      type="text"
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="sch-search-input"
                    />
                  </div>

                  <div className="sch-pills">
                    {(['all', 'active', 'unsubscribed'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`sch-pill ${statusFilter === filter ? 'active' : ''}`}
                      >
                        {filter === 'all' && t.filterAll}
                        {filter === 'active' && t.filterActive}
                        {filter === 'unsubscribed' && t.filterUnsubscribed}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sch-actions-row">
                  {subscribers.length > 0 && (
                    <button onClick={handleExportCSV} className="sch-btn">
                      <Download size={14} />
                      <span>{t.exportCSV}</span>
                    </button>
                  )}
                  <button onClick={() => setIsImportModalOpen(true)} className="sch-btn">
                    <Upload size={14} />
                    <span>{t.importSubscribersBtn}</span>
                  </button>
                  <button onClick={() => setIsAddModalOpen(true)} className="sch-btn sch-btn-primary">
                    <Plus size={15} />
                    <span>{t.addSubscriberBtn}</span>
                  </button>
                </div>
              </div>

              {/* Subscriber Rows */}
              <div className="sch-subscriber-list">
                {paginatedSubscribers.length === 0 ? (
                  <div className="sch-empty-state">
                    <div className="sch-empty-icon">
                      <Users size={28} />
                    </div>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t.noSubscribers}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '300px' }}>
                      {lang === 'ar' ? 'أضف مشتركين يدوياً أو استورد ملف إكسل للبدء.' : 'Add subscribers manually or import a spreadsheet to get started.'}
                    </span>
                  </div>
                ) : (
                  paginatedSubscribers.map((sub) => {
                    const avColor = getAvatarColor(sub.id);
                    return (
                      <div key={sub.id} className="sch-sub-row">
                        <label className="sch-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedSubIds.includes(sub.id)}
                            onChange={() => handleSelectSub(sub.id)}
                          />
                          <span className="sch-checkmark" />
                        </label>

                        <div className="sch-sub-avatar" style={{ backgroundColor: avColor.bg, color: avColor.text }}>
                          {getInitials(sub.name, sub.email)}
                        </div>

                        <div className="sch-sub-info">
                          <div className="sch-sub-name">
                            {sub.name || <span style={{ color: 'var(--text-muted)', fontWeight: 500, fontStyle: 'italic', fontSize: '13px' }}>{lang === 'ar' ? 'بدون اسم' : 'No Name'}</span>}
                          </div>
                          <div className="sch-sub-email">{sub.email}</div>
                        </div>

                        <div className="sch-sub-meta">
                          <span className={`sch-badge ${sub.status === 'active' ? 'active' : 'unsubscribed'}`}>
                            <span className="sch-badge-dot" />
                            <span>{sub.status === 'active' ? t.statusActive : t.statusUnsubscribed}</span>
                          </span>

                          <span className="sch-sub-date">
                            {new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>

                          <div className="sch-row-actions">
                            <button
                              onClick={() => handleToggleStatus(sub.id, sub.status)}
                              title={t.actionToggle}
                              className={`sch-icon-btn ${sub.status === 'active' ? 'toggle-active' : ''}`}
                            >
                              {sub.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                              onClick={() => handleDeleteSubscriber(sub.id)}
                              title={t.actionDelete}
                              className="sch-icon-btn danger"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="sch-pagination">
                  <span className="sch-page-info">
                    {lang === 'ar' 
                      ? `عرض ${(currentPage-1)*itemsPerPage + 1} - ${Math.min(currentPage*itemsPerPage, filteredSubscribers.length)} من أصل ${filteredSubscribers.length}`
                      : `Showing ${(currentPage-1)*itemsPerPage + 1} - ${Math.min(currentPage*itemsPerPage, filteredSubscribers.length)} of ${filteredSubscribers.length}`
                    }
                  </span>
                  <div className="sch-page-btns">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="sch-page-btn"
                    >
                      {lang === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="sch-page-btn"
                    >
                      {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar Panels */}
            <div className="sch-sidebar-stack">
              

              {/* Quick Add Subscriber Card */}
              <div className="sch-quick-add-card">
                <div className="sch-quick-avatars">
                  {[{ bg: '#E8F5E9', text: '#2E7D32', l: 'JK' }, { bg: '#FFF3E0', text: '#E65100', l: 'AA' }, { bg: '#F3E5F5', text: '#7B1FA2', l: '+' }].map((av, i) => (
                    <div key={i} className="sch-quick-avatar-bubble" style={{ background: av.bg, color: av.text }}>
                      {av.l}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {lang === 'ar' ? 'إضافة مشتركين جدد' : 'Quick Add New Subscribers'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {lang === 'ar' ? 'أضف يدوياً أو استورد من ملف' : 'Add manually or import from file'}
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="sch-btn sch-btn-primary" style={{ width: '100%', justifyContent: 'center', borderRadius: '14px', height: '40px' }}>
                  <UserPlus size={15} />
                  <span>{t.addSubscriberBtn}</span>
                </button>
              </div>

              {/* Recent Activity Mini Card */}
              {subscribers.length > 0 && (
                <div className="sch-panel">
                  <h3 className="sch-panel-title" style={{ fontSize: '14px' }}>{lang === 'ar' ? 'آخر المشتركين' : 'Recent Subscribers'}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '14px' }}>
                    {subscribers.slice(0, 4).map(sub => {
                      const avColor = getAvatarColor(sub.id);
                      return (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: avColor.bg, color: avColor.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, flexShrink: 0 }}>
                            {getInitials(sub.name, sub.email)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {sub.name || sub.email.split('@')[0]}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                          <ArrowUpRight size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Floating Bulk Action Bar ─── */}
          <div className={`sch-floating-bar ${selectedSubIds.length > 0 ? 'visible' : ''}`}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
              {selectedSubIds.length} {t.selectedCount}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleBulkDelete} className="sch-btn sch-btn-danger" style={{ borderRadius: '8px', height: '32px', padding: '0 12px', fontSize: '12px' }}>
                <Trash2 size={13} />
                <span>{t.deleteSelected}</span>
              </button>
              <button onClick={() => setSelectedSubIds([])} className="sch-btn" style={{ borderRadius: '8px', height: '32px', padding: '0 12px', fontSize: '12px', background: '#1c1c1e', color: '#fff', borderColor: '#2c2c2e' }}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>

          {/* ─── Add Subscriber Modal ─── */}
          {isAddModalOpen && (
            <div className="sch-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setIsAddModalOpen(false); setAddError(''); } }}>
              <div className="sch-modal-box" style={{ maxWidth: '420px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t.modalAddTitle}
                </h3>
                
                <form onSubmit={handleAddSubscriber} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="sch-label">{t.labelName}</label>
                    <input type="text" className="sch-input" placeholder={t.inputNamePlaceholder} value={newSubName} onChange={(e) => setNewSubName(e.target.value)} />
                  </div>
                  <div>
                    <label className="sch-label">{t.labelEmail}</label>
                    <input type="email" className="sch-input" placeholder={t.inputEmailPlaceholder} value={newSubEmail} onChange={(e) => setNewSubEmail(e.target.value)} required />
                  </div>

                  {addError && (
                    <div style={{ fontSize: '12px', color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(238,0,0,0.1)', fontWeight: 600 }}>
                      {addError}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button type="button" onClick={() => { setIsAddModalOpen(false); setAddError(''); }} className="sch-btn" style={{ borderRadius: '12px' }}>
                      {t.cancelBtn}
                    </button>
                    <button type="submit" disabled={addLoading} className="sch-btn sch-btn-primary" style={{ borderRadius: '12px' }}>
                      {addLoading ? (lang === 'ar' ? 'جاري الإضافة...' : 'Adding...') : t.addBtn}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ─── Import File Modal Wizard ─── */}
          {isImportModalOpen && (
            <div className="sch-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && importStep !== 3) { setIsImportModalOpen(false); resetImportWizard(); } }}>
              <div className="sch-modal-box" style={{ maxWidth: '620px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t.importWizardTitle}
                </h3>

                <div className="sch-stepper">
                  <div className={`sch-step-bar ${importStep >= 1 ? 'done' : ''}`} />
                  <div className={`sch-step-bar ${importStep >= 2 ? 'done' : ''}`} />
                  <div className={`sch-step-bar ${importStep >= 3 ? 'done' : ''}`} />
                </div>

                {/* STEP 1 */}
                {importStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <strong>{t.step1Title}</strong> — {t.step1Desc}
                    </div>

                    <div 
                      onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`sch-upload-zone ${isDragging ? 'dragging' : ''}`}
                    >
                      <Upload size={32} style={{ color: isDragging ? 'var(--accent-text)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.dragDropLabel}
                      </span>
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept=".xlsx,.xls,.csv" style={{ display: 'none' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button type="button" onClick={handleDownloadSample} className="sch-btn" style={{ borderRadius: '12px' }}>
                        <FileSpreadsheet size={14} />
                        <span>{t.downloadSample}</span>
                      </button>
                    </div>

                    {importError && (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(238,0,0,0.1)', fontSize: '12px', fontWeight: 600 }}>
                        <AlertCircle size={14} />
                        <span>{importError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                      <button onClick={() => { setIsImportModalOpen(false); resetImportWizard(); }} className="sch-btn" style={{ borderRadius: '12px' }}>
                        {t.cancelBtn}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {importStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <strong>{t.step2Title}</strong> — {t.step2Desc}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                      {t.selectedFileLabel} <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{fileName}</span> ({parsedRows.length} rows)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label className="sch-label">{t.mapEmailLabel}</label>
                        <select className="sch-input" value={emailColumn} onChange={(e) => setEmailColumn(e.target.value)} style={{ height: '40px' }}>
                          <option value="">{t.selectColumnPlaceholder}</option>
                          {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="sch-label">{t.mapNameLabel}</label>
                        <select className="sch-input" value={nameColumn} onChange={(e) => setNameColumn(e.target.value)} style={{ height: '40px' }}>
                          <option value="">{t.selectColumnPlaceholder}</option>
                          {parsedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>

                    {validationReport && (
                      <div className="sch-panel" style={{ padding: '16px', background: 'var(--panel-muted)' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 800, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>{t.validationReportTitle}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.validEmails}</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success-color)' }}>{validationReport.validCount}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.invalidEmails}</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger-color)' }}>{validationReport.invalidCount}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.duplicatesInSheet}</span>
                            <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--warning-color)' }}>{validationReport.duplicateCount}</span>
                          </div>
                        </div>
                        {(validationReport.invalidCount > 0 || validationReport.duplicateCount > 0) && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                            <AlertCircle size={14} style={{ color: 'var(--warning-color)' }} />
                            <span>{t.validationWarning}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {settings.welcomeEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '14px', backgroundColor: 'var(--panel-muted)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input type="checkbox" checked={sendWelcomeToImported} onChange={(e) => setSendWelcomeToImported(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--text-accent)' }} />
                          <span>{t.sendWelcomeImportCheck}</span>
                        </label>
                        {sendWelcomeToImported && (
                          <span style={{ fontSize: '11px', color: 'var(--warning-text)', marginInlineStart: '24px', fontWeight: 500 }}>
                            {t.sendWelcomeImportWarn}
                          </span>
                        )}
                      </div>
                    )}

                    {emailColumn && (
                      <div>
                        <span className="sch-label">{t.previewHeading}</span>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                            <thead>
                              <tr>
                                <th style={{ padding: '10px 14px', background: 'var(--panel-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'start', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.colEmail}</th>
                                <th style={{ padding: '10px 14px', background: 'var(--panel-muted)', borderBottom: '1px solid var(--border-color)', textAlign: 'start', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t.colName}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsedRows.slice(0, 4).map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontFamily: 'monospace', padding: '10px 14px', color: 'var(--text-secondary)', borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none' }}>{row[emailColumn] || <span style={{ color: 'var(--danger-color)' }}>Null</span>}</td>
                                  <td style={{ padding: '10px 14px', color: 'var(--text-primary)', borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none' }}>
                                    {nameColumn && row[nameColumn] ? row[nameColumn] : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>Not Mapped</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '8px' }}>
                      <button onClick={resetImportWizard} className="sch-btn" style={{ borderRadius: '12px' }}>
                        {lang === 'ar' ? 'رجوع' : 'Back'}
                      </button>
                      <button onClick={handleBulkImport} disabled={!emailColumn} className="sch-btn sch-btn-primary" style={{ borderRadius: '12px' }}>
                        {t.importSubmitBtn}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {importStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', padding: '24px 0', textAlign: 'center' }}>
                    {importProgress ? (
                      <>
                        <div className="sumer-spinner" style={{ width: '44px', height: '44px', borderWidth: '3px' }} />
                        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                          {t.importingProgress}
                        </span>
                      </>
                    ) : importResult && importResult.success ? (
                      <>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={32} style={{ color: '#059669' }} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>{t.importSuccessTitle}</h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{t.importSuccessDesc}</p>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', maxWidth: '360px', marginTop: '8px' }}>
                          <div className="sch-stat-card mint" style={{ padding: '16px', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>{t.resultsImported}</span>
                            <span style={{ fontSize: '24px', fontWeight: 800 }}>{importResult.imported}</span>
                          </div>
                          <div className="sch-stat-card sky" style={{ padding: '16px', gap: '4px', alignItems: 'center', textAlign: 'center' }}>
                            <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.7 }}>{t.resultsWelcomed}</span>
                            <span style={{ fontSize: '24px', fontWeight: 800 }}>{importResult.welcomed}</span>
                          </div>
                        </div>

                        {importResult.walletShortage && (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', color: 'var(--warning-text)', backgroundColor: 'var(--warning-bg)', border: '1px solid rgba(245,158,11,0.2)', padding: '12px', borderRadius: '14px', fontSize: '12px', textAlign: 'start', width: '100%', maxWidth: '360px' }}>
                            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{t.resultsWalletShort}</span>
                          </div>
                        )}

                        <button onClick={() => { setIsImportModalOpen(false); resetImportWizard(); }} className="sch-btn sch-btn-primary" style={{ marginTop: '8px', borderRadius: '14px', height: '40px', padding: '0 24px' }}>
                          {t.closeBtn}
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <XCircle size={32} style={{ color: 'var(--danger-color)' }} />
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {lang === 'ar' ? 'فشل عملية الاستيراد' : 'Import Process Failed'}
                          </h4>
                          <p style={{ margin: 0, fontSize: '13px', color: 'var(--danger-text)', fontWeight: 500 }}>{importError}</p>
                        </div>
                        <button onClick={resetImportWizard} className="sch-btn" style={{ borderRadius: '14px' }}>
                          {lang === 'ar' ? 'المحاولة مجدداً' : 'Try Again'}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ═══════════════════════════════════════════════════ */
        /* ═══════════ TAB 2: SETTINGS ═══════════ */
        /* ═══════════════════════════════════════════════════ */
        <div className="sch-settings-grid">
          
          {/* Settings and Code Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Config Form Card */}
            <div className="sch-panel">
              <h2 className="sch-panel-title">{t.settingsTitle}</h2>
              <p className="sch-panel-desc">{t.settingsDesc}</p>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Welcome Email Enable Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'var(--panel-muted)', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingInlineEnd: '16px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.enableWelcome}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.enableWelcomeDesc}</span>
                  </div>
                  <button type="button" onClick={() => setSettings(prev => ({ ...prev, welcomeEnabled: !prev.welcomeEnabled }))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center' }}>
                    {settings.welcomeEnabled ? (
                      <ToggleRight size={38} style={{ color: 'var(--success-color)' }} />
                    ) : (
                      <ToggleLeft size={38} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>

                {settings.welcomeEnabled && (
                  <>
                    <div>
                      <label className="sch-label">{t.welcomeSubjectLabel}</label>
                      <input type="text" className="sch-input" placeholder={t.welcomeSubjectPlaceholder} value={settings.welcomeSubject} onChange={(e) => setSettings(prev => ({ ...prev, welcomeSubject: e.target.value }))} required />
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="sch-label" style={{ marginBottom: 0 }}>{t.welcomeBodyLabel}</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.insertTokenLabel}</span>
                          <button type="button" onClick={() => handleInsertToken('{name}')} className="sch-btn" style={{ height: '24px', fontSize: '10px', padding: '0 8px', borderRadius: '8px' }}>
                            {"{name}"}
                          </button>
                          <button type="button" onClick={() => handleInsertToken('{email}')} className="sch-btn" style={{ height: '24px', fontSize: '10px', padding: '0 8px', borderRadius: '8px' }}>
                            {"{email}"}
                          </button>
                        </div>
                      </div>
                      <textarea ref={textareaRef} className="sch-textarea" rows={6} value={settings.welcomeBody} onChange={(e) => setSettings(prev => ({ ...prev, welcomeBody: e.target.value }))} required />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block', lineHeight: 1.4 }}>{t.welcomeBodyDesc}</span>
                    </div>
                  </>
                )}

                <button type="submit" disabled={saveLoading} className="sch-btn sch-btn-primary" style={{ width: '100%', height: '42px', justifyContent: 'center', borderRadius: '14px', fontSize: '14px' }}>
                  {saveLoading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.saveSettingsBtn}
                </button>
              </form>
            </div>

            {/* Embed Code Card */}
            <div className="sch-panel">
              <h2 className="sch-panel-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={18} style={{ color: 'var(--accent-text)' }} />
                <span>{t.integrationTitle}</span>
              </h2>
              <p className="sch-panel-desc">{t.integrationDesc}</p>

              {/* Widget Customizer */}
              <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '18px', backgroundColor: 'var(--panel-muted)' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.customizerTitle}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px' }}>
                  <div>
                    <label className="sch-label">{t.widgetThemeLabel}</label>
                    <select className="sch-input" value={widgetTheme} onChange={(e) => setWidgetTheme(e.target.value as any)} style={{ height: '36px' }}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="glass">Glassmorphism</option>
                    </select>
                  </div>
                  <div>
                    <label className="sch-label">{t.widgetButtonColorLabel}</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <input type="color" value={widgetButtonColor} onChange={(e) => setWidgetButtonColor(e.target.value)} style={{ position: 'absolute', top: '-6px', left: '-6px', width: '48px', height: '48px', border: 'none', cursor: 'pointer', backgroundColor: 'transparent' }} />
                      </div>
                      <input type="text" className="sch-input" value={widgetButtonColor} onChange={(e) => setWidgetButtonColor(e.target.value)} style={{ flex: 1, fontSize: '12px', height: '36px', fontFamily: 'monospace' }} />
                    </div>
                  </div>
                  <div>
                    <label className="sch-label">{t.widgetRadiusLabel} (<span style={{ fontFamily: 'monospace' }}>{widgetBorderRadius}px</span>)</label>
                    <input type="range" min="0" max="24" value={widgetBorderRadius} onChange={(e) => setWidgetBorderRadius(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--text-primary)', height: '24px', cursor: 'pointer' }} />
                  </div>
                </div>

                {/* Live Visual Widget Demo */}
                <div style={{ marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>{t.previewDemoTitle}</span>
                  <div style={{
                    maxWidth: '100%', width: '320px', padding: '24px',
                    borderRadius: `${widgetBorderRadius}px`,
                    border: `1px solid ${widgetTheme === 'dark' ? '#222222' : widgetTheme === 'glass' ? 'rgba(255,255,255,0.15)' : '#eaeaea'}`,
                    backgroundColor: widgetTheme === 'dark' ? '#09090b' : widgetTheme === 'glass' ? 'rgba(255,255,255,0.03)' : '#ffffff',
                    color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#0a0a0a',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                    backdropFilter: widgetTheme === 'glass' ? 'blur(8px)' : 'none',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    fontFamily: 'var(--font-family)', direction: 'ltr'
                  }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px', textAlign: 'center' }}>Subscribe to our newsletter</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="Your Name" disabled style={{ width: '100%', padding: '8px 10px', border: `1px solid ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#27272a' : '#d1d1d1'}`, backgroundColor: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#18181b' : '#ffffff', borderRadius: '6px', fontSize: '12px', color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111', boxSizing: 'border-box' }} />
                      <input type="email" placeholder="email@example.com" disabled style={{ width: '100%', padding: '8px 10px', border: `1px solid ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#27272a' : '#d1d1d1'}`, backgroundColor: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#18181b' : '#ffffff', borderRadius: '6px', fontSize: '12px', color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111', boxSizing: 'border-box' }} />
                      <button type="button" style={{ width: '100%', padding: '8px', backgroundColor: widgetButtonColor, color: widgetButtonColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}>Subscribe</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* HTML Snippet */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.integrationSnippetHtml}</span>
                  <button onClick={() => handleCopyCode('html', formHtmlCode)} className="sch-btn" style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '8px' }}>
                    {settingsCopied === 'html' ? <Check size={11} style={{ color: 'var(--success-color)' }} /> : <Copy size={11} />}
                    <span>{settingsCopied === 'html' ? t.copied : t.copyCode}</span>
                  </button>
                </div>
                <pre className="sch-code-block custom-code-scroll">{formHtmlCode}</pre>
              </div>

              {/* JS Snippet */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.integrationSnippetJs}</span>
                  <button onClick={() => handleCopyCode('js', formJsCode)} className="sch-btn" style={{ height: '28px', padding: '0 10px', fontSize: '11px', borderRadius: '8px' }}>
                    {settingsCopied === 'js' ? <Check size={11} style={{ color: 'var(--success-color)' }} /> : <Copy size={11} />}
                    <span>{settingsCopied === 'js' ? t.copied : t.copyCode}</span>
                  </button>
                </div>
                <pre className="sch-code-block custom-code-scroll">{formJsCode}</pre>
              </div>

              <div style={{ display: 'flex', gap: '10px', padding: '14px', backgroundColor: 'var(--panel-muted)', borderRadius: '14px', border: '1px dashed var(--border-color)' }}>
                <div style={{ flexShrink: 0, color: 'var(--accent-text)', marginTop: '2px' }}>
                  <ExternalLink size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.embedInstructions}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{t.embedInstructionsText}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Welcome Email Mock Preview */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div className="sch-browser-mockup">
              
              {/* Mock Window Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--panel-muted)', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="sch-browser-dot" style={{ backgroundColor: '#ef4444' }} />
                  <span className="sch-browser-dot" style={{ backgroundColor: '#eab308' }} />
                  <span className="sch-browser-dot" style={{ backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 700, textAlign: 'center' }}>{t.previewTitle}</span>

                <div style={{ display: 'flex', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '2px', gap: '2px' }}>
                  <button type="button" onClick={() => setPreviewMode('desktop')} style={{ border: 'none', backgroundColor: previewMode === 'desktop' ? 'var(--panel-muted)' : 'transparent', color: previewMode === 'desktop' ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>{t.desktopPreview}</button>
                  <button type="button" onClick={() => setPreviewMode('mobile')} style={{ border: 'none', backgroundColor: previewMode === 'mobile' ? 'var(--panel-muted)' : 'transparent', color: previewMode === 'mobile' ? 'var(--text-primary)' : 'var(--text-secondary)', padding: '4px 10px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease' }}>{t.mobilePreview}</button>
                </div>
              </div>

              {previewMode === 'mobile' ? (
                <div style={{ padding: '24px 16px', backgroundColor: 'var(--panel-muted)', display: 'flex', justifyContent: 'center', borderBottomLeftRadius: '18px', borderBottomRightRadius: '18px' }}>
                  <div className="smartphone-mockup">
                    <div className="smartphone-notch"><div className="smartphone-speaker" /></div>
                    <div className="smartphone-screen" style={{ backgroundColor: '#ffffff' }}>
                      <div className="smartphone-status-bar">
                        <span style={{ fontWeight: 600 }}>9:41</span>
                        <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                          <span style={{ fontSize: '9px', fontWeight: 600 }}>5G</span>
                          <span style={{ fontSize: '9px', fontWeight: 600 }}>100%</span>
                        </div>
                      </div>
                      <div style={{ borderBottom: '1px solid #e4e4e7', paddingBottom: '8px', marginBottom: '12px', fontSize: '11px', color: '#71717a', direction: 'ltr', textAlign: 'start' }}>
                        <div><strong>Subject:</strong> {settings.welcomeSubject}</div>
                      </div>
                      <div style={{ fontSize: '12px', lineHeight: '1.5', color: '#27272a', direction: 'ltr', textAlign: 'start', overflowY: 'auto', maxHeight: '280px', paddingInlineEnd: '4px' }} className="custom-code-scroll">
                        {settings.welcomeEnabled ? (
                          <div dangerouslySetInnerHTML={{ __html: settings.welcomeBody.replace(/\n/g, '<br/>').replace(/{name}/g, `<strong>${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</strong>`).replace(/{email}/g, 'client@domain.com') }} />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: '8px', color: '#a1a1aa' }}>
                            <Mail size={24} style={{ color: '#d4d4d8' }} />
                            <span style={{ fontSize: '11px', fontStyle: 'italic' }}>{lang === 'ar' ? 'قم بتفعيل رسالة الترحيب لرؤية المعاينة' : 'Enable welcome email to see preview'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--panel-muted)' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewFrom}: </span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>SMTP Sender &lt;no-reply@sumersend.com&gt;</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewTo}: </span>
                      <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{t.previewDefaultName} &lt;client@domain.com&gt;</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewSubject}: </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{settings.welcomeSubject}</span>
                    </div>
                  </div>

                  <div style={{ padding: '24px', backgroundColor: '#ffffff', color: '#111111', minHeight: '260px', maxHeight: '360px', overflowY: 'auto', direction: 'ltr', fontFamily: 'system-ui, -apple-system, sans-serif' }} className="custom-code-scroll">
                    <div style={{ maxWidth: '500px', margin: '0 auto', fontSize: '14px', lineHeight: '1.6', color: '#333333', textAlign: 'start' }}>
                      {settings.welcomeEnabled ? (
                        <div dangerouslySetInnerHTML={{ __html: settings.welcomeBody.replace(/\n/g, '<br/>').replace(/{name}/g, `<strong>${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</strong>`).replace(/{email}/g, 'client@domain.com') }} />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px', color: '#999999' }}>
                          <Mail size={32} style={{ color: '#cccccc' }} />
                          <span style={{ fontSize: '13px', fontStyle: 'italic' }}>{lang === 'ar' ? 'قم بتفعيل رسالة الترحيب لرؤية المعاينة' : 'Enable welcome email to see preview'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      )}
    </ScrollReveal>
  );
};
