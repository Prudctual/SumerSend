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
  RefreshCw
} from 'lucide-react';
import { ScrollReveal } from './LandingView';
import * as XLSX from 'xlsx';

interface SubscribersViewProps {
  lang: 'en' | 'ar';
  apiKeys: any[];
  initialSubTab?: 'list' | 'settings';
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
  initialSubTab = 'list' 
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
        
        // Convert to array of arrays (raw format) to detect headers
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (rawJson.length === 0) {
          throw new Error(lang === 'ar' ? 'الملف فارغ.' : 'The selected file is empty.');
        }

        const headers = rawJson[0].map((h: any) => h ? String(h).trim() : '');
        setParsedHeaders(headers);

        // Convert worksheet rows to array of objects
        const objectsJson = XLSX.utils.sheet_to_json(worksheet);
        setParsedRows(objectsJson);

        // Attempt automatic header mapping matches
        const emailIdx = headers.findIndex((h: string) => 
          /email|mail|البريد|الايميل/i.test(h)
        );
        const nameIdx = headers.findIndex((h: string) => 
          /name|fullname|الاسم|الزبون|العميل/i.test(h)
        );

        if (emailIdx !== -1) setEmailColumn(headers[emailIdx]);
        if (nameIdx !== -1) setNameColumn(headers[nameIdx]);

        setImportStep(2); // move to mapping step
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

    // Map rows according to selections
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

      // Reload lists
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
      {/* Tab Header */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
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

      {/* Vercel Segmented Navigation */}
      <div className="vercel-tabs-container" style={{ overflowX: 'auto', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveSubTab('list')}
          className={`vercel-tab-btn ${activeSubTab === 'list' ? 'active' : ''}`}
        >
          <Users size={15} />
          <span>{t.tabList}</span>
        </button>
        <button
          onClick={() => setActiveSubTab('settings')}
          className={`vercel-tab-btn ${activeSubTab === 'settings' ? 'active' : ''}`}
        >
          <Settings size={15} />
          <span>{t.tabSettings}</span>
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Skeleton Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="sumer-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '40%', height: '12px' }} />
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '60%', height: '28px', marginTop: '4px' }} />
              </div>
            ))}
          </div>

          {/* Skeleton Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div className="skeleton-shimmer skeleton-bar" style={{ width: '300px', height: '34px', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '120px', height: '32px', borderRadius: '8px' }} />
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '100px', height: '32px', borderRadius: '8px' }} />
            </div>
          </div>

          {/* Skeleton Table */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '16px', display: 'flex', gap: '24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--panel-muted)' }}>
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '25%' }} />
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '35%' }} />
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '15%' }} />
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '15%' }} />
              <div className="skeleton-shimmer skeleton-bar" style={{ width: '10%' }} />
            </div>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ padding: '18px 16px', display: 'flex', gap: '24px', borderBottom: i === 5 ? 'none' : '1px solid var(--border-color)', alignItems: 'center' }}>
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '25%', height: '14px' }} />
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '35%', height: '12px' }} />
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '15%', height: '18px', borderRadius: '12px' }} />
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '15%', height: '12px' }} />
                <div className="skeleton-shimmer skeleton-bar" style={{ width: '10%', height: '14px' }} />
              </div>
            ))}
          </div>
        </div>
      ) : activeSubTab === 'list' ? (
        /* ==================== TAB 1: LIST ==================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Quick Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="sumer-card spring-card dashboard-metric-card" style={{ padding: '20px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">{t.statTotal}</span>
                <Users size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="metric-val" style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>
                {totalCount}
              </div>
            </div>
            <div className="sumer-card spring-card dashboard-metric-card" style={{ padding: '20px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">{t.statActive}</span>
                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
              </div>
              <div className="metric-val" style={{ color: '#10b981', fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>
                {activeCount}
              </div>
            </div>
            <div className="sumer-card spring-card dashboard-metric-card" style={{ padding: '20px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">{t.statUnsubscribed}</span>
                <XCircle size={16} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div className="metric-val" style={{ color: 'var(--text-muted)', fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>
                {unsubscribedCount}
              </div>
            </div>
            <div className="sumer-card spring-card dashboard-metric-card" style={{ padding: '20px', cursor: 'default', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="metric-title">{t.statWelcomeSent}</span>
                <Mail size={16} style={{ color: 'var(--text-accent)' }} />
              </div>
              <div className="metric-val" style={{ color: 'var(--text-accent)', fontWeight: 800, fontSize: '28px', marginTop: '4px' }}>
                {settings.welcomeEnabled ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Disabled')}
              </div>
            </div>
          </div>

          {/* List Controls & Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
            
            {/* Search filter row */}
            <div style={{ display: 'flex', gap: '10px', flex: '1 1 300px', maxWidth: '400px', position: 'relative' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <Search size={14} style={{ position: 'absolute', top: '10px', left: lang === 'ar' ? 'auto' : '12px', right: lang === 'ar' ? '12px' : 'auto', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="v-input"
                  style={{
                    paddingInlineStart: '34px',
                    width: '100%',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>

            {/* Filter buttons, manual button, Excel button */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', backgroundColor: 'var(--panel-muted)', padding: '3px', borderRadius: '8px' }}>
                {(['all', 'active', 'unsubscribed'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className="segmented-btn"
                    style={{
                      border: 'none',
                      backgroundColor: statusFilter === filter ? 'var(--panel-bg)' : 'transparent',
                      color: statusFilter === filter ? 'var(--text-primary)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      transition: 'background 0.2s'
                    }}
                  >
                    {filter === 'all' && t.filterAll}
                    {filter === 'active' && t.filterActive}
                    {filter === 'unsubscribed' && t.filterUnsubscribed}
                  </button>
                ))}
              </div>

              {/* Export CSV button */}
              {subscribers.length > 0 && (
                <button 
                  onClick={handleExportCSV}
                  className="v-btn v-btn-secondary spring-btn" 
                  style={{ fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px' }}
                >
                  <Copy size={13} />
                  <span>{t.exportCSV}</span>
                </button>
              )}

              {/* Excel Import button */}
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="v-btn v-btn-secondary spring-btn" 
                style={{ fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px' }}
              >
                <Upload size={13} />
                <span>{t.importSubscribersBtn}</span>
              </button>

              {/* Add Subscriber Button */}
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="v-btn v-btn-primary spring-btn" 
                style={{ fontSize: '12px', height: '32px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px' }}
              >
                <Plus size={14} />
                <span>{t.addSubscriberBtn}</span>
              </button>
            </div>

          </div>

          {/* Subscribers Table Container */}
          <div className="table-container" style={{ margin: 0, border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden' }}>
            <table className="v-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', paddingLeft: '16px', paddingRight: '16px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={paginatedSubscribers.length > 0 && paginatedSubscribers.every(s => selectedSubIds.includes(s.id))}
                      onChange={() => handleSelectAllOnPage(paginatedSubscribers)}
                      style={{ accentColor: 'var(--text-accent)', width: '14px', height: '14px', cursor: 'pointer' }}
                    />
                  </th>
                  <th style={{ width: '25%' }}>{t.colName}</th>
                  <th style={{ width: '35%' }}>{t.colEmail}</th>
                  <th style={{ width: '15%' }}>{t.colStatus}</th>
                  <th style={{ width: '15%' }}>{t.colCreated}</th>
                  <th style={{ width: '10%', textAlign: 'center' }}>{t.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 0' }}>
                      {t.noSubscribers}
                    </td>
                  </tr>
                ) : (
                  paginatedSubscribers.map((sub) => (
                    <tr key={sub.id} style={{ transition: 'background-color 0.15s' }}>
                      <td style={{ width: '40px', paddingLeft: '16px', paddingRight: '16px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selectedSubIds.includes(sub.id)}
                          onChange={() => handleSelectSub(sub.id)}
                          style={{ accentColor: 'var(--text-accent)', width: '14px', height: '14px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {sub.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>{lang === 'ar' ? 'غير محدد' : 'Not Provided'}</span>}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>{sub.email}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: sub.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'var(--panel-muted)',
                          color: sub.status === 'active' ? '#10b981' : 'var(--text-muted)'
                        }}>
                          {sub.status === 'active' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {sub.status === 'active' ? t.statusActive : t.statusUnsubscribed}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(sub.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-IQ' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(sub.id, sub.status)}
                            title={t.actionToggle}
                            className="v-action-btn spring-btn"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px',
                              transition: 'transform 0.1s'
                            }}
                          >
                            {sub.status === 'active' ? <ToggleRight size={18} style={{ color: '#10b981' }} /> : <ToggleLeft size={18} />}
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            title={t.actionDelete}
                            className="v-action-btn spring-btn"
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: '#ef4444',
                              cursor: 'pointer',
                              padding: '4px',
                              borderRadius: '4px'
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Floating Bulk Action Bar */}
          {selectedSubIds.length > 0 && (
            <div className="floating-bulk-bar visible">
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedSubIds.length} {t.selectedCount}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleBulkDelete}
                  className="v-btn spring-btn"
                  style={{
                    height: '32px',
                    fontSize: '12px',
                    padding: '0 12px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '99px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={13} />
                  <span>{t.deleteSelected}</span>
                </button>
                <button
                  onClick={() => setSelectedSubIds([])}
                  className="v-btn v-btn-secondary spring-btn"
                  style={{
                    height: '32px',
                    fontSize: '12px',
                    padding: '0 12px',
                    borderRadius: '99px',
                    cursor: 'pointer'
                  }}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {lang === 'ar' 
                  ? `عرض ${(currentPage-1)*itemsPerPage + 1} - ${Math.min(currentPage*itemsPerPage, filteredSubscribers.length)} من أصل ${filteredSubscribers.length}`
                  : `Showing ${(currentPage-1)*itemsPerPage + 1} - ${Math.min(currentPage*itemsPerPage, filteredSubscribers.length)} of ${filteredSubscribers.length}`
                }
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="v-btn v-btn-secondary"
                  style={{ padding: '4px 8px', height: '28px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                >
                  {lang === 'ar' ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="v-btn v-btn-secondary"
                  style={{ padding: '4px 8px', height: '28px', minWidth: 'auto', display: 'flex', alignItems: 'center' }}
                >
                  {lang === 'ar' ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>
            </div>
          )}

          {/* Add Subscriber Modal */}
          {isAddModalOpen && (
            <div className="sumer-modal-overlay" style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="sumer-card" style={{ width: '100%', maxWidth: '400px', padding: '24px', zIndex: 1001, animation: 'scaleUp 0.2s ease' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t.modalAddTitle}
                </h3>
                
                <form onSubmit={handleAddSubscriber} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t.labelName}
                    </label>
                    <input
                      type="text"
                      className="v-input"
                      placeholder={t.inputNamePlaceholder}
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {t.labelEmail}
                    </label>
                    <input
                      type="email"
                      className="v-input"
                      placeholder={t.inputEmailPlaceholder}
                      value={newSubEmail}
                      onChange={(e) => setNewSubEmail(e.target.value)}
                      required
                      style={{ width: '100%', fontSize: '13px' }}
                    />
                  </div>

                  {addError && (
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 500 }}>
                      {addError}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => { setIsAddModalOpen(false); setAddError(''); }}
                      className="v-btn v-btn-secondary"
                      style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
                    >
                      {t.cancelBtn}
                    </button>
                    <button
                      type="submit"
                      disabled={addLoading}
                      className="v-btn v-btn-primary"
                      style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
                    >
                      {addLoading ? (lang === 'ar' ? 'جاري الإضافة...' : 'Adding...') : t.addBtn}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Import File Modal Wizard */}
          {isImportModalOpen && (
            <div className="sumer-modal-overlay" style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div className="sumer-card" style={{ width: '100%', maxWidth: '600px', padding: '24px', zIndex: 1001, animation: 'scaleUp 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {t.importWizardTitle}
                </h3>

                {/* Progress indicators */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: importStep >= 1 ? 'var(--text-accent)' : 'var(--border-color)' }} />
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: importStep >= 2 ? 'var(--text-accent)' : 'var(--border-color)' }} />
                  <div style={{ height: '4px', flex: 1, borderRadius: '2px', backgroundColor: importStep >= 3 ? 'var(--text-accent)' : 'var(--border-color)' }} />
                </div>

                {/* STEP 1: UPLOAD FILE */}
                {importStep === 1 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>{t.step1Title}</strong> - {t.step1Desc}
                    </div>

                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: '12px',
                        padding: '40px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                        backgroundColor: isDragging ? 'rgba(var(--text-accent-rgb), 0.05)' : 'transparent',
                        borderColor: isDragging ? 'var(--text-accent)' : 'var(--border-color)',
                        transition: 'border-color 0.2s, background-color 0.2s'
                      }}
                    >
                      <Upload size={32} style={{ color: isDragging ? 'var(--text-accent)' : 'var(--text-muted)' }} />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {t.dragDropLabel}
                      </span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept=".xlsx,.xls,.csv" 
                        style={{ display: 'none' }} 
                      />
                    </div>

                    {/* Download Sample Button */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={handleDownloadSample}
                        className="v-btn v-btn-secondary spring-btn"
                        style={{ fontSize: '11px', height: '28px', padding: '0 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileSpreadsheet size={12} />
                        <span>{t.downloadSample}</span>
                      </button>
                    </div>

                    {importError && (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: '#ef4444', fontSize: '12px', fontWeight: 500 }}>
                        <AlertCircle size={14} />
                        <span>{importError}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={() => { setIsImportModalOpen(false); resetImportWizard(); }}
                        className="v-btn v-btn-secondary"
                        style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
                      >
                        {t.cancelBtn}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: FIELD MAPPING */}
                {importStep === 2 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      <strong>{t.step2Title}</strong> - {t.step2Desc}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {t.selectedFileLabel} <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fileName}</span> ({parsedRows.length} rows)
                    </div>

                    {/* Mapping Selectors */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t.mapEmailLabel}
                        </label>
                        <select 
                          className="v-input"
                          value={emailColumn}
                          onChange={(e) => setEmailColumn(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', height: '34px', padding: '0 8px' }}
                        >
                          <option value="">{t.selectColumnPlaceholder}</option>
                          {parsedHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t.mapNameLabel}
                        </label>
                        <select 
                          className="v-input"
                          value={nameColumn}
                          onChange={(e) => setNameColumn(e.target.value)}
                          style={{ width: '100%', fontSize: '12px', height: '34px', padding: '0 8px' }}
                        >
                          <option value="">{t.selectColumnPlaceholder}</option>
                          {parsedHeaders.map(h => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Validation Summary Card */}
                    {validationReport && (
                      <div className="sumer-card" style={{ padding: '16px', backgroundColor: 'var(--panel-muted)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                          {t.validationReportTitle}
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.validEmails}</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#10b981' }}>{validationReport.validCount}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.invalidEmails}</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#ef4444' }}>{validationReport.invalidCount}</span>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.duplicatesInSheet}</span>
                            <span style={{ fontSize: '16px', fontWeight: 800, color: '#eab308' }}>{validationReport.duplicateCount}</span>
                          </div>
                        </div>
                        {(validationReport.invalidCount > 0 || validationReport.duplicateCount > 0) && (
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', gap: '4px', alignItems: 'center', marginTop: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                            <AlertCircle size={12} style={{ color: '#eab308' }} />
                            <span>{t.validationWarning}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Checkbox welcome email options */}
                    {settings.welcomeEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px', backgroundColor: 'var(--panel-muted)', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={sendWelcomeToImported} 
                            onChange={(e) => setSendWelcomeToImported(e.target.checked)} 
                            style={{ width: '14px', height: '14px', accentColor: 'var(--text-accent)' }}
                          />
                          <span>{t.sendWelcomeImportCheck}</span>
                        </label>
                        {sendWelcomeToImported && (
                          <span style={{ fontSize: '10px', color: '#eab308', marginInlineStart: '22px', fontWeight: 500 }}>
                            {t.sendWelcomeImportWarn}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Mapping preview table */}
                    {emailColumn && (
                      <div>
                        <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          {t.previewHeading}
                        </span>
                        <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                          <table className="v-table" style={{ fontSize: '11px', margin: 0 }}>
                            <thead>
                              <tr>
                                <th style={{ padding: '6px 10px' }}>{t.colEmail}</th>
                                <th style={{ padding: '6px 10px' }}>{t.colName}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {parsedRows.slice(0, 4).map((row, idx) => (
                                <tr key={idx}>
                                  <td style={{ fontFamily: 'monospace', padding: '6px 10px' }}>{row[emailColumn] || <span style={{ color: 'red' }}>Null</span>}</td>
                                  <td style={{ padding: '6px 10px' }}>
                                    {nameColumn && row[nameColumn] ? row[nameColumn] : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not Mapped</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '10px' }}>
                      <button
                        onClick={resetImportWizard}
                        className="v-btn v-btn-secondary spring-btn"
                        style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
                      >
                        {lang === 'ar' ? 'رجوع' : 'Back'}
                      </button>
                      <button
                        onClick={handleBulkImport}
                        disabled={!emailColumn}
                        className="v-btn v-btn-primary spring-btn"
                        style={{ fontSize: '12px', height: '32px', padding: '0 12px' }}
                      >
                        {t.importSubmitBtn}
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: RESULT & SUCCESS */}
                {importStep === 3 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px 0', textAlign: 'center' }}>
                    {importProgress ? (
                      <>
                        <div className="sumer-spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {t.importingProgress}
                        </span>
                      </>
                    ) : importResult && importResult.success ? (
                      <>
                        <CheckCircle2 size={48} style={{ color: '#10b981' }} />
                        <h4 style={{ margin: '6px 0', fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {t.importSuccessTitle}
                        </h4>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                          {t.importSuccessDesc}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', maxWidth: '300px', marginTop: '12px' }}>
                          <div className="sumer-card" style={{ padding: '12px', backgroundColor: 'var(--panel-muted)' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>{t.resultsImported}</span>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>{importResult.imported}</span>
                          </div>
                          <div className="sumer-card" style={{ padding: '12px', backgroundColor: 'var(--panel-muted)' }}>
                            <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)' }}>{t.resultsWelcomed}</span>
                            <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-accent)' }}>{importResult.welcomed}</span>
                          </div>
                        </div>

                        {importResult.walletShortage && (
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', color: '#eab308', backgroundColor: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234,179,8,0.2)', padding: '10px', borderRadius: '8px', fontSize: '11px', textAlign: 'start', width: '100%' }}>
                            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{t.resultsWalletShort}</span>
                          </div>
                        )}

                        <button
                          onClick={() => { setIsImportModalOpen(false); resetImportWizard(); }}
                          className="v-btn v-btn-primary"
                          style={{ marginTop: '14px', fontSize: '12px', height: '32px', padding: '0 16px' }}
                        >
                          {t.closeBtn}
                        </button>
                      </>
                    ) : (
                      <>
                        <XCircle size={48} style={{ color: '#ef4444' }} />
                        <h4 style={{ margin: '6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {lang === 'ar' ? 'فشل عملية الاستيراد' : 'Import Process Failed'}
                        </h4>
                        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#ef4444' }}>
                          {importError}
                        </p>
                        <button
                          onClick={resetImportWizard}
                          className="v-btn v-btn-secondary"
                          style={{ fontSize: '12px', height: '32px', padding: '0 16px' }}
                        >
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
        /* ==================== TAB 2: SETTINGS ==================== */
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)', gap: '24px', alignItems: 'start' }}>
          
          {/* Settings and Code Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Config Form Card */}
            <div className="sumer-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 750, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                {t.settingsTitle}
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                {t.settingsDesc}
              </p>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                
                {/* Welcome Email Enable Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', backgroundColor: 'var(--panel-muted)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingInlineEnd: '12px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {t.enableWelcome}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {t.enableWelcomeDesc}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, welcomeEnabled: !prev.welcomeEnabled }))}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    {settings.welcomeEnabled ? (
                      <ToggleRight size={38} style={{ color: 'var(--text-accent)' }} />
                    ) : (
                      <ToggleLeft size={38} style={{ color: 'var(--text-muted)' }} />
                    )}
                  </button>
                </div>

                {settings.welcomeEnabled && (
                  <>
                    {/* Subject Input */}
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                        {t.welcomeSubjectLabel}
                      </label>
                      <input
                        type="text"
                        className="v-input"
                        placeholder={t.welcomeSubjectPlaceholder}
                        value={settings.welcomeSubject}
                        onChange={(e) => setSettings(prev => ({ ...prev, welcomeSubject: e.target.value }))}
                        required
                        style={{ width: '100%', fontSize: '13px' }}
                      />
                    </div>

                    {/* Body TextArea */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {t.welcomeBodyLabel}
                        </label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.insertTokenLabel}</span>
                          <button
                            type="button"
                            onClick={() => handleInsertToken('{name}')}
                            className="v-btn v-btn-secondary spring-btn"
                            style={{ height: '20px', fontSize: '9px', padding: '0 6px', borderRadius: '4px', minWidth: 'auto' }}
                          >
                            {"{name}"}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertToken('{email}')}
                            className="v-btn v-btn-secondary spring-btn"
                            style={{ height: '20px', fontSize: '9px', padding: '0 6px', borderRadius: '4px', minWidth: 'auto' }}
                          >
                            {"{email}"}
                          </button>
                        </div>
                      </div>
                      <textarea
                        ref={textareaRef}
                        className="v-input"
                        rows={6}
                        value={settings.welcomeBody}
                        onChange={(e) => setSettings(prev => ({ ...prev, welcomeBody: e.target.value }))}
                        required
                        style={{
                          width: '100%',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          resize: 'vertical'
                        }}
                      />
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                        {t.welcomeBodyDesc}
                      </span>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="v-btn v-btn-primary"
                  style={{ width: '100%', height: '36px', fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  {saveLoading ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : t.saveSettingsBtn}
                </button>

              </form>
            </div>

            {/* Embed instructions and widgets */}
            <div className="sumer-card" style={{ padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 750, margin: '0 0 6px 0', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={18} />
                <span>{t.integrationTitle}</span>
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 20px 0' }}>
                {t.integrationDesc}
              </p>

              {/* Widget Customizer Inputs */}
              <div className="widget-customizer-preview" style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.customizerTitle}</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.widgetThemeLabel}</label>
                    <select
                      className="v-input"
                      value={widgetTheme}
                      onChange={(e) => setWidgetTheme(e.target.value as any)}
                      style={{ width: '100%', fontSize: '11px', height: '28px', padding: '0 4px' }}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="glass">Glassmorphism</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.widgetButtonColorLabel}</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input
                        type="color"
                        value={widgetButtonColor}
                        onChange={(e) => setWidgetButtonColor(e.target.value)}
                        style={{ width: '28px', height: '28px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'transparent' }}
                      />
                      <input
                        type="text"
                        className="v-input"
                        value={widgetButtonColor}
                        onChange={(e) => setWidgetButtonColor(e.target.value)}
                        style={{ flex: 1, fontSize: '11px', height: '28px', padding: '0 6px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{t.widgetRadiusLabel} ({widgetBorderRadius}px)</label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={widgetBorderRadius}
                      onChange={(e) => setWidgetBorderRadius(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--text-accent)' }}
                    />
                  </div>
                </div>

                {/* Live Visual Widget Demo */}
                <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>{t.previewDemoTitle}</span>
                  
                  {/* Visual Rendered Form */}
                  <div style={{
                    maxWidth: '100%',
                    width: '320px',
                    padding: '20px',
                    borderRadius: `${widgetBorderRadius}px`,
                    border: `1px solid ${widgetTheme === 'dark' ? '#27272a' : widgetTheme === 'glass' ? 'rgba(255, 255, 255, 0.15)' : '#eaeaea'}`,
                    backgroundColor: widgetTheme === 'dark' ? '#09090b' : widgetTheme === 'glass' ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    backdropFilter: widgetTheme === 'glass' ? 'blur(8px)' : 'none',
                    transition: 'all 0.2s',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700 }}>Subscribe to our newsletter</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="Your Name"
                        disabled
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: `1px solid ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#27272a' : '#d1d1d1'}`,
                          backgroundColor: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#18181b' : '#ffffff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111',
                          boxSizing: 'border-box'
                        }}
                      />
                      <input
                        type="email"
                        placeholder="email@example.com"
                        disabled
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          border: `1px solid ${widgetTheme === 'dark' || widgetTheme === 'glass' ? '#27272a' : '#d1d1d1'}`,
                          backgroundColor: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#18181b' : '#ffffff',
                          borderRadius: '6px',
                          fontSize: '12px',
                          color: widgetTheme === 'dark' || widgetTheme === 'glass' ? '#ffffff' : '#111111',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        className="spring-btn"
                        style={{
                          width: '100%',
                          padding: '8px',
                          backgroundColor: widgetButtonColor,
                          color: widgetButtonColor.toLowerCase() === '#ffffff' ? '#000000' : '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Subscribe
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* HTML Embed Snippet */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {t.integrationSnippetHtml}
                  </span>
                  <button
                    onClick={() => handleCopyCode('html', formHtmlCode)}
                    className="v-action-btn spring-btn"
                    style={{
                      border: 'none', background: 'var(--panel-muted)', cursor: 'pointer',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)'
                    }}
                  >
                    {settingsCopied === 'html' ? <Check size={10} style={{ color: '#10b981' }} /> : <Copy size={10} />}
                    <span>{settingsCopied === 'html' ? t.copied : t.copyCode}</span>
                  </button>
                </div>
                <pre style={{
                  backgroundColor: 'var(--panel-muted)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '180px',
                  margin: 0,
                  border: '1px solid var(--border-color)'
                }}>
                  {formHtmlCode}
                </pre>
              </div>

              {/* JS Fetch Snippet */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {t.integrationSnippetJs}
                  </span>
                  <button
                    onClick={() => handleCopyCode('js', formJsCode)}
                    className="v-action-btn spring-btn"
                    style={{
                      border: 'none', background: 'var(--panel-muted)', cursor: 'pointer',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)'
                    }}
                  >
                    {settingsCopied === 'js' ? <Check size={10} style={{ color: '#10b981' }} /> : <Copy size={10} />}
                    <span>{settingsCopied === 'js' ? t.copied : t.copyCode}</span>
                  </button>
                </div>
                <pre style={{
                  backgroundColor: 'var(--panel-muted)',
                  color: 'var(--text-primary)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  overflowX: 'auto',
                  maxHeight: '180px',
                  margin: 0,
                  border: '1px solid var(--border-color)'
                }}>
                  {formJsCode}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: '8px', padding: '12px', backgroundColor: 'rgba(235, 237, 240, 0.4)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <div style={{ flexShrink: 0, color: 'var(--text-accent)', marginTop: '2px' }}>
                  <ExternalLink size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{t.embedInstructions}</span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.embedInstructionsText}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Welcome Email Mock Live Preview */}
          <div style={{ position: 'sticky', top: '20px' }}>
            <div className="browser-mockup">
              
              {/* Mock Window Header */}
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--panel-muted)', justifyContent: 'space-between' }}>
                <div className="browser-header-dots">
                  <span className="browser-dot" style={{ backgroundColor: '#ef4444' }} />
                  <span className="browser-dot" style={{ backgroundColor: '#eab308' }} />
                  <span className="browser-dot" style={{ backgroundColor: '#22c55e' }} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginInlineStart: '4px', textAlign: 'center' }}>
                  {t.previewTitle}
                </span>

                {/* Device Switcher */}
                <div style={{ display: 'flex', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('desktop')}
                    style={{
                      border: 'none',
                      backgroundColor: previewMode === 'desktop' ? 'var(--panel-muted)' : 'transparent',
                      color: previewMode === 'desktop' ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '2px 8px',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {t.desktopPreview}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('mobile')}
                    style={{
                      border: 'none',
                      backgroundColor: previewMode === 'mobile' ? 'var(--panel-muted)' : 'transparent',
                      color: previewMode === 'mobile' ? 'var(--text-primary)' : 'var(--text-muted)',
                      padding: '2px 8px',
                      fontSize: '9px',
                      fontWeight: 700,
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {t.mobilePreview}
                  </button>
                </div>
              </div>

              {previewMode === 'mobile' ? (
                /* SMARTPHONE MOCKUP FRAME */
                <div style={{ padding: '24px 16px', backgroundColor: 'var(--panel-muted)', display: 'flex', justifyContent: 'center' }}>
                  <div className="smartphone-mockup">
                    <div className="smartphone-notch">
                      <div className="smartphone-speaker" />
                    </div>
                    <div className="smartphone-screen" style={{ backgroundColor: '#ffffff' }}>
                      <div className="smartphone-status-bar">
                        <span>9:41</span>
                        <div style={{ display: 'flex', gap: '3px' }}>
                          <span>5G</span>
                          <span>100%</span>
                        </div>
                      </div>
                      
                      {/* Email Header Info */}
                      <div style={{ borderBottom: '1px solid #e4e4e7', paddingBottom: '8px', marginBottom: '12px', fontSize: '10px', color: '#71717a', direction: 'ltr' }}>
                        <div><strong>Subject:</strong> {settings.welcomeSubject}</div>
                      </div>

                      {/* Content */}
                      <div style={{ fontSize: '11px', lineHeight: '1.5', color: '#27272a', direction: 'ltr' }}>
                        {settings.welcomeEnabled ? (
                          <div 
                            dangerouslySetInnerHTML={{ 
                              __html: settings.welcomeBody
                                .replace(/\n/g, '<br/>')
                                .replace(/{name}/g, `<strong>${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</strong>`)
                                .replace(/{email}/g, 'client@domain.com') 
                            }} 
                          />
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0', gap: '8px', color: '#a1a1aa' }}>
                            <Mail size={24} style={{ color: '#d4d4d8' }} />
                            <span style={{ fontSize: '10px', fontStyle: 'italic' }}>
                              {lang === 'ar' ? 'قم بتفعيل رسالة الترحيب لرؤية المعاينة' : 'Enable welcome email to see preview'}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                /* DESKTOP EMAIL PREVIEW CONTENT */
                <>
                  {/* Mock Email Metadata */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewFrom}: </span>
                      <span style={{ fontFamily: 'monospace' }}>SMTP Sender &lt;no-reply@sumersend.com&gt;</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewTo}: </span>
                      <span style={{ fontFamily: 'monospace' }}>{t.previewDefaultName} &lt;client@domain.com&gt;</span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{t.previewSubject}: </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{settings.welcomeSubject}</span>
                    </div>
                  </div>

                  {/* Mock Email Content Box */}
                  <div style={{ 
                    padding: '24px 16px', 
                    backgroundColor: '#ffffff', 
                    color: '#111111', 
                    minHeight: '260px', 
                    maxHeight: '360px', 
                    overflowY: 'auto',
                    direction: 'ltr',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}>
                    <div style={{ maxWidth: '500px', margin: '0 auto', fontSize: '14px', lineHeight: '1.6', color: '#333333' }}>
                      {settings.welcomeEnabled ? (
                        <div 
                          dangerouslySetInnerHTML={{ 
                            __html: settings.welcomeBody
                              .replace(/\n/g, '<br/>')
                              .replace(/{name}/g, `<strong>${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</strong>`)
                              .replace(/{email}/g, 'client@domain.com') 
                          }} 
                        />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '10px', color: '#999999' }}>
                          <Mail size={32} style={{ color: '#cccccc' }} />
                          <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
                            {lang === 'ar' ? 'قم بتفعيل رسالة الترحيب لرؤية المعاينة' : 'Enable welcome email to see preview'}
                          </span>
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
