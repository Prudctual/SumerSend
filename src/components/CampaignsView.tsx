import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronLeft, 
  FileText, 
  Check, 
  Clock, 
  ArrowLeft,
  Mail,
  MessageSquare,
  Send,
  Megaphone,
  Coins,
  Activity,
  TrendingUp,
  Lock,
  Upload,
  FileSpreadsheet,
  Users,
  Smartphone,
  Laptop
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { templatesDb } from '../data/templates';
import type { TemplateItem } from '../data/templates';
import { ScrollReveal, BentoCard } from './LandingView';
import { renderTemplateIcon } from './IconHelper';
import { TemplateBuilder } from './TemplateBuilder';

interface CampaignsViewProps {
  lang: 'en' | 'ar';
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  setPhoneNotifications: React.Dispatch<React.SetStateAction<any[]>>;
  hideHeader?: boolean;
}

interface Recipient {
  name: string;
  to: string;
  status: 'pending' | 'sending' | 'delivered' | 'failed';
  error?: string | null;
  variables?: Record<string, string>;
}

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'whatsapp';
  status: 'draft' | 'sending' | 'completed' | 'failed';
  subject: string;
  body: string;
  recipientsCount: number;
  successCount: number;
  failedCount: number;
  totalCost: number;
  timestamp: string;
  recipients: Recipient[];
}

const defaultCampaignsList: Campaign[] = [
  {
    id: "camp_819283",
    name: "حملة الترويج لعروض عيد الأضحى - بغداد",
    type: "sms",
    status: "completed",
    subject: "",
    body: "أهلاً {{name}}، خصم 30% بانتظارك في جميع فروعنا ببغداد بمناسبة قرب حلول العيد! زورنا الآن.",
    recipientsCount: 12,
    successCount: 11,
    failedCount: 1,
    totalCost: 1440,
    timestamp: "2026-06-12T10:15:30.000Z",
    recipients: [
      { name: "جاسم كريم", to: "07801234567", status: "delivered", error: null },
      { name: "أحمد علي", to: "07709876543", status: "delivered", error: null },
      { name: "مصطفى ناجي", to: "07501112222", status: "delivered", error: null },
      { name: "زينب حسن", to: "07812223333", status: "delivered", error: null },
      { name: "عمر فاضل", to: "07718889999", status: "delivered", error: null },
      { name: "حسن محمود", to: "07804445555", status: "delivered", error: null },
      { name: "مريم عبدالله", to: "07507778888", status: "delivered", error: null },
      { name: "علي حسين", to: "07703334444", status: "delivered", error: null },
      { name: "فاطمة جعفر", to: "07815556666", status: "delivered", error: null },
      { name: "سجاد عباس", to: "07502223333", status: "delivered", error: null },
      { name: "حوراء عباس", to: "07816667777", status: "delivered", error: null },
      { name: "كرار محمد", to: "07704445555", status: "failed", error: "Invalid phone number" }
    ]
  },
  {
    id: "camp_192837",
    name: "إشعارات تذكير سلة الشراء المتروكة - البريد الإكتروني",
    type: "email",
    status: "completed",
    subject: "هل نسيت شيئاً في سلتك؟",
    body: "عزيزي {{name}}، المنتجات التي أضفتها إلى سلتك ما زالت بانتظارك. استخدم الكود SUMER10 للحصول على خصم 10% إضافي عند إتمام الشراء الآن!",
    recipientsCount: 5,
    successCount: 5,
    failedCount: 0,
    totalCost: 50,
    timestamp: "2026-06-10T14:20:00.000Z",
    recipients: [
      { name: "Jasim Kareem", to: "customer1@gmail.com", status: "delivered", error: null },
      { name: "Ahmad Ali", to: "customer2@gmail.com", status: "delivered", error: null },
      { name: "Mustafa Naji", to: "customer3@gmail.com", status: "delivered", error: null },
      { name: "Zainab Hasan", to: "customer4@gmail.com", status: "delivered", error: null },
      { name: "Omar Fadhil", to: "customer5@gmail.com", status: "delivered", error: null }
    ]
  },
  {
    id: "camp_512938",
    name: "تأكيد الحجز وتحديثات الحساب - واتساب",
    type: "whatsapp",
    status: "completed",
    subject: "",
    body: "مرحباً {{name}}، تم تأكيد حجزك بنجاح في فندق البصرة الدولي. رقم الحجز: #BSR-9812. نتمنى لك إقامة سعيدة!",
    recipientsCount: 8,
    successCount: 7,
    failedCount: 1,
    totalCost: 1200,
    timestamp: "2026-06-14T09:30:15.000Z",
    recipients: [
      { name: "جاسم كريم", to: "07801234567", status: "delivered", error: null },
      { name: "أحمد علي", to: "07709876543", status: "delivered", error: null },
      { name: "مصطفى ناجي", to: "07501112222", status: "delivered", error: null },
      { name: "زينب حسن", to: "07812223333", status: "delivered", error: null },
      { name: "عمر فاضل", to: "07718889999", status: "delivered", error: null },
      { name: "حسن محمود", to: "07804445555", status: "delivered", error: null },
      { name: "مريم عبدالله", to: "07507778888", status: "delivered", error: null },
      { name: "علي حسين", to: "07703334444", status: "failed", error: "WhatsApp Account Inactive" }
    ]
  }
];

// ponytail: corrupted demo HTML templates are omitted; add fixtures back when seeded templates are needed.
const defaultCustomTemplates: any[] = [];

export const CampaignsView: React.FC<CampaignsViewProps> = ({
  lang,
  walletBalance,
  setWalletBalance,
  setLogs,
  setPhoneNotifications,
  hideHeader = false,
}) => {
  const [viewState, setViewState] = useState<'list' | 'create' | 'progress'>('list');
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaignsList);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const changeViewStateAndCampaign = (nextState: 'list' | 'create' | 'progress', nextCampaign: Campaign | null) => {
    setViewState(nextState);
    setSelectedCampaign(nextCampaign);
  };

  // Campaigns list sub-tab navigation
  const [campaignSubTab, setCampaignSubTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [customTemplates, setCustomTemplates] = useState<any[]>(defaultCustomTemplates);
  const [activeTemplateFilter, setActiveTemplateFilter] = useState<'all' | 'sms' | 'email' | 'whatsapp'>('all');

  // Security 2FA states
  const [securityConfig, setSecurityConfig] = useState<any>(null);
  const [smtpConfig, setSmtpConfig] = useState<any>(null);
  const [is2faModalOpen, setIs2faModalOpen] = useState(false);
  const [verificationOtpInput, setVerificationOtpInput] = useState('');
  const [verificationOtpError, setVerificationOtpError] = useState<string | null>(null);
  const [pendingOtpCode, setPendingOtpCode] = useState<string | null>(null);

  // Load security config
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/security/config')
      .then(res => res.json())
      .then(data => setSecurityConfig(data))
      .catch(err => console.warn('Could not load security config in campaigns:', err));
  }, [viewState]);

  // Load SMTP config
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/smtp/config')
      .then(res => res.json())
      .then(data => setSmtpConfig(data))
      .catch(err => console.warn('Could not load SMTP config in campaigns:', err));
  }, []);

  // Custom Template Builder State
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [editingBuilderTemplate, setEditingBuilderTemplate] = useState<TemplateItem | null>(null);



  // Load custom templates from server
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/templates/custom')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCustomTemplates(data);
      })
      .catch(err => console.warn('Could not load custom templates, using fallback:', err));
  }, []);

  const getMergedTemplates = (channel: 'email' | 'sms' | 'whatsapp') => {
    const staticList = templatesDb[channel] || [];
    const customList = customTemplates.filter(t => t.type === channel) || [];
    return [...staticList, ...customList];
  };

  const getFilteredTemplates = () => {
    const all = [
      ...templatesDb.email.map(t => ({ ...t, type: 'email' })),
      ...templatesDb.sms.map(t => ({ ...t, type: 'sms' })),
      ...templatesDb.whatsapp.map(t => ({ ...t, type: 'whatsapp' }))
    ];
    const allMerged = [...all, ...customTemplates];
    
    if (activeTemplateFilter === 'all') return allMerged;
    return allMerged.filter(t => t.type === activeTemplateFilter);
  };

  const handleBuilderSave = async (payload: TemplateItem) => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/templates/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const saved = await res.json();
        setCustomTemplates(prev => {
          const idx = prev.findIndex(t => t.id === saved.id);
          if (idx !== -1) {
            return prev.map(t => t.id === saved.id ? saved : t);
          } else {
            return [...prev, saved];
          }
        });
        setIsCreatingTemplate(false);
        setEditingBuilderTemplate(null);
      }
    } catch (err) {
      console.error('Failed to save custom template:', err);
      alert(lang === 'en' ? 'Failed to save template. Make sure server is running.' : 'فشل حفظ القالب. تأكد من تشغيل الخادم.');
    }
  };

  const handleDeleteTemplate = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'en' ? 'Delete this template?' : 'هل أنت متأكد من حذف هذا القالب؟')) return;

    try {
      const res = await fetch(`http://127.0.0.1:3000/api/templates/custom/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCustomTemplates(prev => prev.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
      // Fallback
      setCustomTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTemplate = (template: any) => {
    setEditingBuilderTemplate(template as TemplateItem);
    setIsCreatingTemplate(true);
  };

  // Form Wizard State
  const [step, setStep] = useState(1);
  const [campName, setCampName] = useState('');
  const [campChannel, setCampChannel] = useState<'email' | 'sms' | 'whatsapp'>('sms');
  const [campTemplateId, setCampTemplateId] = useState('');
  const [campSubject, setCampSubject] = useState('');
  const [campBody, setCampBody] = useState('');
  const [csvText, setCsvText] = useState('');
  const [parsedRecipients, setParsedRecipients] = useState<Recipient[]>([]);
  const [duplicateCount, setDuplicateCount] = useState<number>(0);
  const [parseError, setParseError] = useState<string | null>(null);

  // Premium Campaigns Builder states (Matching Subscribers View)
  const [audienceSource, setAudienceSource] = useState<'current' | 'upload' | 'manual'>('current');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedHeaders, setUploadedHeaders] = useState<string[]>([]);
  const [uploadedRows, setUploadedRows] = useState<any[]>([]);
  const [mapEmail, setMapEmail] = useState('');
  const [mapName, setMapName] = useState('');
  const [mapPhone, setMapPhone] = useState('');
  const [saveTemplateForFuture, setSaveTemplateForFuture] = useState(false);
  const [newCustomTemplateName, setNewCustomTemplateName] = useState('');
  const [previewSubIndex, setPreviewSubIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [testSendTo, setTestSendTo] = useState('');
  const [isTestSending, setIsTestSending] = useState(false);
  
  // Loaded Subscribers List for opt-in database targeting
  const [subscribers, setSubscribers] = useState<any[]>([]);
  
  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load subscribers for campaign target selector
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSubscribers(data);
      })
      .catch(err => console.warn('Could not load subscribers in CampaignsView:', err));
  }, [viewState]);

  // Pre-populate template if directed from Templates tab
  useEffect(() => {
    const pendingTemplateId = localStorage.getItem('sumersend_selected_template_id');
    if (pendingTemplateId) {
      let foundTemplate: any = null;
      const channels: ('email' | 'sms' | 'whatsapp')[] = ['email', 'sms', 'whatsapp'];
      for (const ch of channels) {
        const list = getMergedTemplates(ch);
        const match = list.find(t => t.id === pendingTemplateId);
        if (match) {
          foundTemplate = match;
          break;
        }
      }

      if (foundTemplate) {
        setCampChannel(foundTemplate.type || 'email');
        setCampTemplateId(foundTemplate.id);
        setCampBody(foundTemplate.body);
        if (foundTemplate.type === 'email') {
          setCampSubject(lang === 'ar' ? (foundTemplate.subjectAr || '') : (foundTemplate.subjectEn || ''));
        }
        setCampName(lang === 'ar'
          ? `حملة ${foundTemplate.nameAr || foundTemplate.nameEn}`
          : `Campaign: ${foundTemplate.nameEn || foundTemplate.nameAr}`
        );
        setViewState('create');
        setStep(1);
      }
      localStorage.removeItem('sumersend_selected_template_id');
    }
  }, [customTemplates, lang]);

  // Execution Progress State
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [execLogs, setExecLogs] = useState<string[]>([]);
  const [execProgress, setExecProgress] = useState(0);

  const t = {
    en: {
      title: 'Smart Campaigns',
      subtitle: 'Compose, personalize, and broadcast bulk notifications to customer lists.',
      createBtn: 'Create Campaign',
      activeCampaigns: 'Active Campaigns',
      totalCampaigns: 'Total Campaigns',
      messagesSent: 'Messages Dispatched',
      successRate: 'Avg Success Rate',
      spent: 'Total Spent',
      iqd: 'IQD',
      historyTitle: 'Campaign Logs & History',
      colName: 'Campaign Name',
      colChannel: 'Channel',
      colRecipients: 'Recipients',
      colCost: 'Cost',
      colStatus: 'Status',
      colDate: 'Date Launched',
      actions: 'Actions',
      noCampaigns: 'No campaigns recorded yet. Launch your first marketing or notification campaign.',
      
      // Wizard
      stepBasics: 'Basics',
      stepComposer: 'Composer',
      stepAudience: 'Audience',
      stepReview: 'Launch',
      campNameLabel: 'Campaign Name',
      campNamePl: 'e.g., Basra Eid Promo 2026',
      channelLabel: 'Target Notification Channel',
      channelDesc: 'Choose the medium to dispatch this bulk notification campaign.',
      
      selectTemplate: 'Select Message Template (Optional)',
      customSubject: 'Email Subject Line',
      emailSubPl: 'Enter the subject line...',
      messageBodyLabel: 'Message Body Composer',
      bodyDesc: 'Support tags: Use {{name}} to dynamically inject the recipient\'s name.',
      bodyPl: 'Write your template content here...',

      audienceTitle: 'Audience List (CSV or Copied Records)',
      csvDesc: 'Paste comma-separated rows. The header MUST contain "to" (email or phone) and optional "name".',
      csvPl: 'name,to\nJasim Kareem,07801234567\nAhmad Ali,07709876543',
      loadDemoBtn: 'Load Sample Audience CSV',
      parsedSuccess: 'Successfully parsed {count} recipients!',
      parsedTags: 'Detected variables: {tags}',
      parseErrEmpty: 'Invalid input. Please upload or paste recipient records.',
      parseErrHeaders: 'Missing required "to" column in headers.',

      summaryCost: 'Estimated Campaign Budget',
      summaryCostDetails: '{count} messages * {rate} IQD = {total} IQD',
      balanceWarning: 'Warning: Insufficient wallet balance. Top up to enable dispatching.',
      launchBtn: 'Launch Campaign',
      cancelBtn: 'Cancel',
      nextBtn: 'Next',
      backBtn: 'Back',

      // Progress Console
      progressTitle: 'Campaign Execution Terminal',
      progressDesc: 'Broadcasting messages dynamically. The simulated phone on the right will receive incoming alerts incrementally.',
      sendingStatus: 'Sending campaign: {name}',
      completedStatus: 'Campaign successfully completed!',
      progressLogs: 'Real-time Execution Logs',
      logsFinished: 'Broadcast completed successfully. All delivery logs synced to database.',
    },
    ar: {
      title: 'الحملات الذكية والرسائل الجماعية',
      subtitle: 'أطلق حملات إعلامية وتنبيهات مخصصة لقوائم عملائك حياً ومباشرة عبر القنوات المختلفة.',
      createBtn: 'إنشاء حملة جديدة',
      activeCampaigns: 'الحملات النشطة',
      totalCampaigns: 'إجمالي الحملات',
      messagesSent: 'الرسائل المرسلة',
      successRate: 'معدل النجاح',
      spent: 'إجمالي المصاريف',
      iqd: 'د.ع',
      historyTitle: 'سجل وأرشيف الحملات المنجزة',
      colName: 'اسم الحملة',
      colChannel: 'القناة',
      colRecipients: 'المستلمون',
      colCost: 'التكلفة الإجمالية',
      colStatus: 'الحالة',
      colDate: 'تاريخ الإطلاق',
      actions: 'العمليات',
      noCampaigns: 'لا توجد حملات مسجلة حالياً. أطلق حملتك البريدية أو الدعائية الأولى الآن.',
      
      // Wizard
      stepBasics: 'المعلومات الأساسية',
      stepComposer: 'محتوى الرسالة',
      stepAudience: 'قائمة المستهدفين',
      stepReview: 'المراجعة والإطلاق',
      campNameLabel: 'اسم الحملة الإعلانية',
      campNamePl: 'مثال: عرض عيد الأضحى في البصرة 2026',
      channelLabel: 'قناة الإرسال المستهدفة',
      channelDesc: 'اختر الوسيلة المفضلة لإيصال هذه الرسالة الجماعية.',
      
      selectTemplate: 'اختر قالب رسالة جاهز (اختياري)',
      customSubject: 'عنوان البريد الإلكتروني',
      emailSubPl: 'اكتب عنوان الرسالة هنا...',
      messageBodyLabel: 'محرر نص الرسالة',
      bodyDesc: 'دعم المتغيرات: اكتب {{name}} في النص ليتم استبداله باسم المستلم تلقائياً.',
      bodyPl: 'اكتب نص الرسالة أو حدد قالباً...',

      audienceTitle: 'قائمة المستلمين (ملف CSV أو نسخ لصق)',
      csvDesc: 'ألصق أسطر مفصولة بفواصل. يجب أن يحتوي السطر الأول على رأس العمود "to" (البريد أو الهاتف) والعمود الاختياري "name".',
      csvPl: 'name,to\nجاسم كريم,07801234567\nأحمد علي,07709876543',
      loadDemoBtn: 'تحميل عينة مستلمين تجريبية',
      parsedSuccess: 'تم تحليل وفك ترميز {count} مستلم بنجاح!',
      parsedTags: 'المتغيرات المكتشفة: {tags}',
      parseErrEmpty: 'المدخلات غير صالحة. يرجى لصق بيانات المستلمين.',
      parseErrHeaders: 'فشل التحليل: حقل المستلم "to" مطلوب في سطر الأعمدة الأول.',

      summaryCost: 'التكلفة والميزانية التقديرية للحملة',
      summaryCostDetails: '{count} رسالة * {rate} د.ع = {total} د.ع',
      balanceWarning: 'تنبيه: رصيد المحفظة الحالي غير كافٍ لتشغيل هذه الحملة. يرجى الشحن أولاً.',
      launchBtn: 'إطلاق الحملة الجماعية الآن',
      cancelBtn: 'إلغاء',
      nextBtn: 'التالي',
      backBtn: 'السابق',

      // Progress Console
      progressTitle: 'طرفية تشغيل وإرسال الحملة',
      progressDesc: 'يتم بث وتوصيل الرسائل للمستلمين حياً. الهاتف المحاكي في الواجهة الرئيسية سيستقبل التنبيهات تدريجياً.',
      sendingStatus: 'جاري إطلاق حملة: {name}',
      completedStatus: 'اكتملت الحملة بنجاح وتوزيع كافة الإشعارات!',
      progressLogs: 'سجلات التنفيذ الفوري (Live Logs)',
      logsFinished: 'اكتمل البث الجماعي بنجاح! تم حفظ وتحديث كافة تقارير التسليم بنجاح.',
    }
  }[lang];

  // Fetch campaign history on mount
  useEffect(() => {
    fetch('http://127.0.0.1:3000/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCampaigns(data);
      })
      .catch(err => console.warn('Could not load campaigns list, using fallback:', err));
  }, []);

  // getAudienceList resolves the recipient array based on selected source
  const getAudienceList = (): Recipient[] => {
    if (audienceSource === 'current') {
      return subscribers
        .filter((s: any) => s.status === 'active')
        .map((s: any) => ({
          name: s.name || '',
          to: campChannel === 'email' ? s.email : (s.phone || s.email),
          status: 'pending' as const,
          error: null,
          variables: { name: s.name || '', email: s.email, phone: s.phone || '' }
        }));
    } else if (audienceSource === 'upload') {
      return uploadedRows.map((row: any) => {
        const emailVal = mapEmail ? String(row[mapEmail] || '').trim() : '';
        const nameVal = mapName ? String(row[mapName] || '').trim() : '';
        const phoneVal = mapPhone ? String(row[mapPhone] || '').trim() : '';
        const toVal = campChannel === 'email' ? emailVal : (phoneVal || emailVal);
        
        // build variables dictionary from all row fields
        const variables: Record<string, string> = {};
        Object.keys(row).forEach(k => {
          variables[k] = String(row[k] || '');
          variables[k.toLowerCase()] = String(row[k] || '');
        });
        
        return {
          name: nameVal || (lang === 'en' ? 'Recipient' : 'مستلم'),
          to: toVal,
          status: 'pending' as const,
          error: null,
          variables
        };
      }).filter(r => r.to);
    } else {
      return parsedRecipients;
    }
  };

  // Pre-load demo CSV data based on channel
  const handleLoadDemoCSV = () => {
    if (campChannel === 'email') {
      setCsvText(
        `name,to\nJasim Kareem,customer1@gmail.com\nAhmad Ali,customer2@gmail.com\nMustafa Naji,customer3@gmail.com\nZainab Hasan,customer4@gmail.com\nOmar Fadhil,customer5@gmail.com`
      );
    } else {
      setCsvText(
        `name,to\nجاسم كريم,07801234567\nأحمد علي,07709876543\nمصطفى ناجي,07501112222\nزينب حسن,07812223333\nعمر فاضل,07718889999`
      );
    }
  };

  // Parse CSV records
  useEffect(() => {
    if (!csvText.trim()) {
      setParsedRecipients([]);
      setParseError(null);
      setDuplicateCount(0);
      return;
    }

    const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length < 2) {
      setParseError(t.parseErrEmpty);
      setParsedRecipients([]);
      setDuplicateCount(0);
      return;
    }

    const headersRaw = lines[0].split(',').map(h => h.trim());
    const headersLower = headersRaw.map(h => h.toLowerCase());
    const toIndex = headersLower.indexOf('to');
    const nameIndex = headersLower.indexOf('name');

    if (toIndex === -1) {
      setParseError(t.parseErrHeaders);
      setParsedRecipients([]);
      setDuplicateCount(0);
      return;
    }

    setParseError(null);
    const list: Recipient[] = [];
    const seenTo = new Set<string>();
    let dupes = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < headersRaw.length) continue;
      
      const toValue = parts[toIndex];
      const normalizedTo = toValue.trim().toLowerCase();
      if (!normalizedTo) continue;

      if (seenTo.has(normalizedTo)) {
        dupes++;
        continue;
      }
      seenTo.add(normalizedTo);
      
      const nameValue = nameIndex !== -1 ? parts[nameIndex] : (lang === 'en' ? 'Recipient' : 'مستلم');

      if (toValue) {
        const variables: Record<string, string> = {};
        headersRaw.forEach((header, idx) => {
          const hLower = header.toLowerCase();
          if (hLower !== 'to' && hLower !== 'name') {
            variables[header] = parts[idx] || '';
            variables[hLower] = parts[idx] || '';
          }
        });

        list.push({
          name: nameValue,
          to: toValue,
          status: 'pending',
          error: null,
          variables
        });
      }
    }

    setDuplicateCount(dupes);
    setParsedRecipients(list);
  }, [csvText, campChannel]);

  const processCampaignFile = (file: File) => {
    setUploadedFileName(file.name);
    setParseError(null);
    
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
        setUploadedHeaders(headers);

        const objectsJson = XLSX.utils.sheet_to_json(worksheet);
        setUploadedRows(objectsJson);

        // Auto map columns
        const emailIdx = headers.findIndex((h: string) => /email|mail|البريد|الايميل/i.test(h));
        const nameIdx = headers.findIndex((h: string) => /name|fullname|الاسم|الزبون|العميل/i.test(h));
        const phoneIdx = headers.findIndex((h: string) => /phone|tel|mobile|هاتف|جوال|رقم/i.test(h));

        if (emailIdx !== -1) {
          setMapEmail(headers[emailIdx]);
        } else if (headers.length > 0) {
          setMapEmail(headers[0]);
        }
        if (nameIdx !== -1) {
          setMapName(headers[nameIdx]);
        }
        if (phoneIdx !== -1) {
          setMapPhone(headers[phoneIdx]);
        }

        // If email or any columns mapped, auto set audience and advance
        if (emailIdx !== -1 || headers.length > 0) {
          const emailCol = emailIdx !== -1 ? headers[emailIdx] : headers[0];
          const nameCol = nameIdx !== -1 ? headers[nameIdx] : '';
          const phoneCol = phoneIdx !== -1 ? headers[phoneIdx] : '';
          
          const mapped = objectsJson.map((row: any) => {
            const emailVal = row[emailCol] ? String(row[emailCol]).trim() : '';
            const nameVal = nameCol && row[nameCol] ? String(row[nameCol]).trim() : '';
            const phoneVal = phoneCol && row[phoneCol] ? String(row[phoneCol]).trim() : '';
            const toVal = campChannel === 'email' ? emailVal : (phoneVal || emailVal);
            
            // build variables dictionary from all row fields
            const variables: Record<string, string> = {};
            Object.keys(row).forEach(k => {
              variables[k] = String(row[k] || '');
              variables[k.toLowerCase()] = String(row[k] || '');
            });

            return {
              name: nameVal || (lang === 'en' ? 'Recipient' : 'مستلم'),
              to: toVal,
              status: 'pending' as const,
              error: null,
              variables
            };
          }).filter(s => s.to);

          setStep(4); // auto advance to Step 4 (Review/Launch)
        }
      } catch (err: any) {
        setParseError(lang === 'ar' ? `فشل تحليل الملف: ${err.message}` : `File parsing failed: ${err.message}`);
      }
    };
    fileReader.onerror = () => {
      setParseError(lang === 'ar' ? 'فشل قراءة الملف.' : 'FileReader error occurred.');
    };
    fileReader.readAsArrayBuffer(file);
  };

  const handleMapColumns = () => {
    if (!mapEmail && !mapPhone) {
      alert(lang === 'ar' ? 'يرجى تحديد عمود واحد على الأقل للمستلم.' : 'Please select at least one column for recipient.');
      return;
    }
    setStep(4);
  };

  const insertTokenToComposer = (token: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCampBody(prev => prev + token);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setCampBody(before + token + after);
    
    // Refocus and place cursor directly after the inserted token
    setTimeout(() => {
      textarea.focus();
      const newPos = start + token.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 50);
  };

  const getPreviewText = (text: string, recipient: any) => {
    if (!text) return '';
    let result = text;

    // Find all placeholders matching {{variable}} or {{ variable }} or {variable} or { variable }
    const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}|\{\s*([a-zA-Z0-9_]+)\s*\}/g;
    const tags: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1] || match[2];
      if (!tags.includes(tag)) {
        tags.push(tag);
      }
    }

    const template = getMergedTemplates(campChannel).find(t => t.id === campTemplateId);

    const isNameTag = (t: string) => {
      const tagLower = t.toLowerCase().replace(/[^a-z0-9_]/g, '');
      const nameTags = [
        'name', 'username', 'user_name', 'customer_name', 'customername',
        'recipient_name', 'recipientname', 'reader_name', 'readername', 'friend_name',
        'friendname', 'member_name', 'membername', 'client_name', 'clientname',
        'subscriber_name', 'subscribername', 'user'
      ];
      if (nameTags.includes(tagLower)) return true;
      if (tagLower.endsWith('name')) {
        const excludes = ['platform', 'service', 'event', 'company', 'sender', 'brand', 'site', 'app', 'coupon', 'bank', 'product', 'hotel'];
        return !excludes.some(ex => tagLower.startsWith(ex));
      }
      return false;
    };

    tags.forEach(tag => {
      let val: any = undefined;
      const tagLower = tag.toLowerCase();

      if (recipient) {
        // 1. Direct field match or case variations in variables
        val = recipient[tag] || recipient.variables?.[tag] || recipient.variables?.[tagLower];
        
        // 2. Smart mapping for common names/emails/phones
        if (val === undefined) {
          if (isNameTag(tag)) {
            val = recipient.name;
          } else if (tagLower === 'email') {
            val = recipient.email || recipient.to || '';
          } else if (tagLower === 'phone') {
            val = recipient.phone || recipient.to || '';
          }
        }

        // 3. Fallback to template variable default if val is still undefined
        if (val === undefined && template) {
          const tmplVar = template.variables?.find((v: any) => v.key === tag);
          if (tmplVar) {
            val = lang === 'ar' ? (tmplVar.defaultValAr || tmplVar.defaultValEn) : (tmplVar.defaultValEn || tmplVar.defaultValAr);
          }
        }

        // 4. Default fallback if still undefined for a specific recipient (replace with empty to avoid code tags in preview)
        if (val === undefined) {
          val = '';
        }

        // Clean up resolved value if it's a name tag
        if (isNameTag(tag)) {
          const trimmedName = recipient.name ? recipient.name.trim() : '';
          const defaultPlaceholders = [
            'عضو رائع', 'valued member', 'أحمد علي', 'ahmed ali',
            'مستخدمنا العزيز', 'valued user', 'عميلنا المميز', 'valued customer',
            'عميلنا العزيز', 'قارئنا الكريم', 'valued reader', 'مستلم', 'recipient',
            'شريكنا العزيز', 'valued partner', 'أحمد', 'ahmed'
          ];
          if (trimmedName && !defaultPlaceholders.includes(trimmedName.toLowerCase())) {
            val = trimmedName;
          } else {
            const valStr = val ? String(val).trim() : '';
            if (!valStr || defaultPlaceholders.includes(valStr.toLowerCase())) {
              val = lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber';
            } else {
              val = valStr;
            }
          }
        }
      } else {
        // If no recipient is provided (general preview mode)
        // 1. Try template variable defaults
        if (template) {
          const tmplVar = template.variables?.find((v: any) => v.key === tag);
          if (tmplVar) {
            val = lang === 'ar' ? (tmplVar.defaultValAr || tmplVar.defaultValEn) : (tmplVar.defaultValEn || tmplVar.defaultValAr);
          }
        }

        // 2. Try generic placeholder fallback
        if (val === undefined) {
          if (isNameTag(tag)) {
            val = lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber';
          } else if (tagLower === 'email') {
            val = lang === 'ar' ? 'البريد الإلكتروني' : 'Email';
          } else if (tagLower === 'phone') {
            val = lang === 'ar' ? 'رقم الهاتف' : 'Phone Number';
          }
        } else if (isNameTag(tag)) {
          // If template default is a generic placeholder, replace it in preview too
          const valStr = String(val).trim();
          const defaultPlaceholders = [
            'عضو رائع', 'valued member', 'أحمد علي', 'ahmed ali',
            'مستخدمنا العزيز', 'valued user', 'عميلنا المميز', 'valued customer',
            'عميلنا العزيز', 'قارئنا الكريم', 'valued reader', 'مستلم', 'recipient',
            'شريكنا العزيز', 'valued partner', 'أحمد', 'ahmed'
          ];
          if (defaultPlaceholders.includes(valStr.toLowerCase())) {
            val = lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber';
          }
        }
      }

      // Perform replacement if we resolved a value
      if (val !== undefined) {
        const escapeTag = tag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const tagRegexDouble = new RegExp(`\\{\\{\\s*${escapeTag}\\s*\\}\\}`, 'g');
        const tagRegexSingle = new RegExp(`\\{\\s*${escapeTag}\\s*\\}`, 'g');
        result = result.replace(tagRegexDouble, val).replace(tagRegexSingle, val);
      }
    });

    // Final literal replacement to make sure no "عضو رائع" or "Valued Member" escapes in the text under any circumstances
    if (recipient && recipient.name && recipient.name.trim()) {
      const subName = recipient.name.trim();
      const defaultPlaceholders = [
        'عضو رائع', 'valued member', 'أحمد علي', 'ahmed ali',
        'مستخدمنا العزيز', 'valued user', 'عميلنا المميز', 'valued customer',
        'عميلنا العزيز', 'قارئنا الكريم', 'valued reader', 'مستلم', 'recipient',
        'شريكنا العزيز', 'valued partner', 'أحمد', 'ahmed'
      ];
      const finalName = defaultPlaceholders.includes(subName.toLowerCase()) ? (lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber') : subName;
      result = result
        .replace(/عضو رائع/g, finalName)
        .replace(/Valued Member/g, finalName);
    } else {
      const fallback = lang === 'ar' ? 'مشتركنا الكريم' : 'Valued Subscriber';
      result = result
        .replace(/عضو رائع/g, fallback)
        .replace(/Valued Member/g, fallback);
    }

    return result;
  };

  const handleSendTestMessage = async () => {
    if (!testSendTo.trim()) {
      alert(lang === 'ar' ? 'يرجى إدخال وجهة الإرسال التجريبي.' : 'Please enter a test destination.');
      return;
    }
    
    setIsTestSending(true);
    
    const audience = getAudienceList();
    const mockRecipient = audience[previewSubIndex] || { 
      name: lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem', 
      email: 'jasim@prudctual.substack.com', 
      to: campChannel === 'email' ? 'jasim@prudctual.substack.com' : '07801234567',
      variables: {}
    };
    
    const subjectText = getPreviewText(campSubject, mockRecipient);
    const bodyText = getPreviewText(campBody, mockRecipient);
    
    const payload = campChannel === 'email' ? {
      to: testSendTo,
      subject: subjectText || 'Test Send',
      html: `<p>${bodyText}</p>`
    } : {
      to: testSendTo,
      body: bodyText
    };

    const endpoint = campChannel === 'email' ? 'emails' : campChannel;
    const url = `http://127.0.0.1:3000/v1/${endpoint}`;

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sm_live_campaign_auth'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { 
            message: lang === 'ar' ? 'تم إرسال الرسالة التجريبية بنجاح!' : 'Test message sent successfully!', 
            type: 'success' 
          }
        }));
      } else {
        const data = await res.json();
        throw new Error(data.error?.message || 'Send failed');
      }
    } catch (err: any) {
      alert((lang === 'ar' ? 'فشل إرسال التجربة: ' : 'Test send failed: ') + err.message);
    } finally {
      setIsTestSending(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (id: string) => {
    setCampTemplateId(id);
    const template = getMergedTemplates(campChannel).find(temp => temp.id === id);
    if (template) {
      setCampBody(template.body);
      if (campChannel === 'email') {
        setCampSubject(lang === 'ar' ? (template.subjectAr || '') : (template.subjectEn || ''));
      }
    }
  };

  const getCostPerMessage = () => {
    return campChannel === 'email' ? 10 : campChannel === 'sms' ? 120 : 150;
  };

  const calculateTotalCost = () => {
    return getAudienceList().length * getCostPerMessage();
  };

  const isBalanceSufficient = () => {
    return walletBalance >= calculateTotalCost();
  };

  // Launch Campaign Simulation
  const handleLaunchCampaign = async () => {
    if (!campName.trim()) {
      alert(lang === 'en' ? 'Please enter a campaign name.' : 'يرجى إدخال اسم الحملة.');
      return;
    }

    const audience = getAudienceList();
    if (audience.length === 0) {
      alert(lang === 'en' ? 'Audience list is empty.' : 'قائمة المستهدفين فارغة.');
      return;
    }

    const totalCost = calculateTotalCost();
    if (walletBalance < totalCost) {
      alert(t.balanceWarning);
      return;
    }

    // Check 2FA security configuration
    if (securityConfig && securityConfig.verified && securityConfig.requireCampaign2FA) {
      try {
        setVerificationOtpError(null);
        setVerificationOtpInput('');
        
        const res = await fetch('http://127.0.0.1:3000/api/security/verify-phone', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: securityConfig.phone })
        });
        const data = await res.json();
        
        if (res.ok && data.otp) {
          setPendingOtpCode(data.otp);
          setIs2faModalOpen(true);
          
          // Trigger mock SMS notification on phone
          setPhoneNotifications(prev => [
            {
              id: 'security_2fa_camp_' + Date.now(),
              type: 'sms',
              title: 'SMS: Sumer Security',
              body: `رمز التحقق الثنائي لإطلاق حملتك "${campName}" هو: ${data.otp}. لا تشارك هذا الرمز.`,
              time: 'Now'
            },
            ...prev
          ]);
        } else {
          // If verify-phone failed, fallback
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setPendingOtpCode(code);
          setIs2faModalOpen(true);
        }
      } catch (err) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingOtpCode(code);
        setIs2faModalOpen(true);
      }
      return;
    }

    executeCampaignLaunch(totalCost);
  };

  const executeCampaignLaunch = async (totalCost: number) => {
    // Save template for future use if checked
    if (saveTemplateForFuture && newCustomTemplateName.trim()) {
      try {
        const templatePayload = {
          nameAr: lang === 'ar' ? newCustomTemplateName : 'قالب مخصص',
          nameEn: lang === 'en' ? newCustomTemplateName : 'Custom Template',
          descAr: 'تم حفظه من معالج إطلاق الحملات',
          descEn: 'Saved from Campaign Wizard',
          subjectAr: campSubject,
          subjectEn: campSubject,
          body: campBody,
          icon: 'FileText',
          variables: [],
          type: campChannel
        };
        const res = await fetch('http://127.0.0.1:3000/api/templates/custom', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(templatePayload)
        });
        if (res.ok) {
          const saved = await res.json();
          setCustomTemplates(prev => [...prev, saved]);
        }
      } catch (err) {
        console.warn('Failed to save template during campaign launch:', err);
      }
    }

    const audience = getAudienceList();

    // Step 1: Create Campaign Draft on Backend
    changeViewStateAndCampaign('progress', null);
    setExecProgress(0);
    setExecLogs([`> Starting Campaign: ${campName}...`, `> Target Channel: ${campChannel.toUpperCase()}`]);

    let createdCamp: Campaign;
    try {
      const res = await fetch('http://127.0.0.1:3000/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campName,
          type: campChannel,
          subject: campSubject,
          body: campBody,
          recipients: audience,
          totalCost
        })
      });
      createdCamp = await res.json();
      setActiveCampaign(createdCamp);
      setCampaigns(prev => [createdCamp, ...prev]);
    } catch (e) {
      console.warn('Backend server offline. Simulating local fallback...');
      createdCamp = {
        id: 'camp_' + Math.floor(100000 + Math.random() * 900000).toString(),
        name: campName,
        type: campChannel,
        status: 'sending',
        subject: campSubject,
        body: campBody,
        recipientsCount: audience.length,
        successCount: 0,
        failedCount: 0,
        totalCost,
        timestamp: new Date().toISOString(),
        recipients: audience
      };
      setActiveCampaign(createdCamp);
    }

    // Step 2: Loop recipients and dispatch
    const updatedRecipients = [...createdCamp.recipients];
    let successes = 0;
    let failures = 0;
    const rate = getCostPerMessage();
    let currentBalance = walletBalance;

    for (let index = 0; index < updatedRecipients.length; index++) {
      const rc = updatedRecipients[index];
      
      setExecLogs(prev => [...prev, `> [${index + 1}/${updatedRecipients.length}] Sending to ${rc.name} (${rc.to})...`]);
      updatedRecipients[index].status = 'sending';

      if (currentBalance < rate) {
        failures++;
        updatedRecipients[index].status = 'failed';
        updatedRecipients[index].error = 'Insufficient balance';
        setExecLogs(prev => [...prev, `  [Failed] Error: Insufficient Wallet Balance.`]);
        continue;
      }
      
      // Compute personalized message and subject
      const personalizedBody = getPreviewText(campBody, rc);
      const personalizedSubject = campChannel === 'email' ? getPreviewText(campSubject, rc) : '';
      
      const payload = campChannel === 'email' ? {
        from: smtpConfig?.from || undefined,
        to: rc.to,
        subject: personalizedSubject || 'Campaign Alert!',
        html: `<p>${personalizedBody}</p>`
      } : {
        to: rc.to,
        body: personalizedBody
      };

      const endpoint = campChannel === 'email' ? 'emails' : campChannel;
      const url = `http://127.0.0.1:3000/v1/${endpoint}`;

      // Wait 100ms between sends to simulate latency but keep it very fast
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const sendRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sm_live_campaign_auth'
          },
          body: JSON.stringify(payload)
        });
        const sendData = await sendRes.json();
        
        if (!sendRes.ok) {
          throw { isServerError: true, message: sendData.error?.message || 'Dispatch failed' };
        }

        // Success
        successes++;
        updatedRecipients[index].status = 'delivered';
        currentBalance -= rate;
        setWalletBalance(currentBalance);
        
        setExecLogs(prev => [
          ...prev, 
          `  [Success] Status: 200 OK | Message ID: ${sendData.id || 'msg_sim'} (${rate} IQD deducted)`
        ]);

        // Push phone mockup notification preview
        setPhoneNotifications(prev => [
          {
            id: Date.now().toString() + index,
            type: campChannel,
            title: campChannel === 'email' ? (campSubject || 'New Mail') : campChannel === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
            body: personalizedBody,
            time: 'Now'
          },
          ...prev
        ]);

      } catch (err: any) {
        if (err.isServerError) {
          failures++;
          updatedRecipients[index].status = 'failed';
          updatedRecipients[index].error = err.message;
          setExecLogs(prev => [
            ...prev,
            `  [Failed] Error: ${err.message}`
          ]);
        } else {
          // Fallback simulation if server connection fails
          console.warn(`Fallback dispatch for ${rc.to}:`, err.message);
          
          // Check if balance allows fallback send
          if (currentBalance >= rate) {
            successes++;
            updatedRecipients[index].status = 'delivered';
            currentBalance -= rate;
            setWalletBalance(currentBalance);
            
            setExecLogs(prev => [
              ...prev, 
              `  [Success Fallback] Status: 200 OK | ID: ${campChannel}_${Math.floor(100000 + Math.random()*900000)}`
            ]);

            setPhoneNotifications(prev => [
              {
                id: Date.now().toString() + index,
                type: campChannel,
                title: campChannel === 'email' ? (campSubject || 'New Mail') : campChannel === 'sms' ? 'SMS: Sumer Send' : 'WhatsApp: Sumer Send',
                body: personalizedBody,
                time: 'Now'
              },
              ...prev
            ]);
          } else {
            failures++;
            updatedRecipients[index].status = 'failed';
            updatedRecipients[index].error = 'Insufficient balance';
            setExecLogs(prev => [...prev, `  [Failed] Error: Insufficient Wallet Balance.`]);
          }
        }
      }

      // Sync logs inside frontend
      fetch('http://127.0.0.1:3000/api/logs')
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setLogs(data);
        })
        .catch(() => {});

      // Update progress bar
      setExecProgress(Math.round(((index + 1) / updatedRecipients.length) * 100));
    }

    // Update Campaign final status on Backend
    const completedCampaign = {
      ...createdCamp,
      status: 'completed' as const,
      successCount: successes,
      failedCount: failures,
      recipients: updatedRecipients
    };

    setExecLogs(prev => [...prev, `> Updating campaign records...`]);

    try {
      await fetch(`http://127.0.0.1:3000/api/campaigns/${createdCamp.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          successCount: successes,
          failedCount: failures,
          recipients: updatedRecipients
        })
      });
    } catch (e) {
      console.warn('Could not persist final campaign stats to backend.');
    }

    setCampaigns(prev => prev.map(c => c.id === createdCamp.id ? completedCampaign : c));
    setActiveCampaign(completedCampaign);
    setExecLogs(prev => [...prev, `> ${t.logsFinished}`]);

    // Dispatch custom event for global toast notification & trigger success overlay
    const isAr = lang === 'ar';
    window.dispatchEvent(new CustomEvent('sumer-toast', {
      detail: {
        message: isAr
          ? `تم اكتمال إرسال الحملة الإعلانية بنجاح لـ ${successes} مستلم!`
          : `Campaign completed! Successfully sent to ${successes} recipients.`,
        type: 'success'
      }
    }));
    window.dispatchEvent(new CustomEvent('sumer-success-screen'));
  };

  // Delete Campaign
  const handleDeleteCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === 'en' ? 'Delete this campaign from history?' : 'حذف هذه الحملة من السجل التاريخي؟')) return;

    fetch(`http://127.0.0.1:3000/api/campaigns/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCampaigns(prev => prev.filter(c => c.id !== id));
          if (selectedCampaign?.id === id) changeViewStateAndCampaign('list', null);
        }
      })
      .catch(() => {
        // local delete fallback
        setCampaigns(prev => prev.filter(c => c.id !== id));
        if (selectedCampaign?.id === id) changeViewStateAndCampaign('list', null);
      });
  };

  const getOverallStats = () => {
    const total = campaigns.length;
    const sent = campaigns.reduce((acc, c) => acc + c.recipientsCount, 0);
    const successes = campaigns.reduce((acc, c) => acc + c.successCount, 0);
    const successRate = sent > 0 ? Math.round((successes / sent) * 100) : 0;
    const spent = campaigns.reduce((acc, c) => acc + c.totalCost, 0);

    return { total, sent, successRate, spent };
  };

  const stats = getOverallStats();

  return (
    <ScrollReveal>
      <div className="campaigns-view-container">
      {/* VIEW 1: CAMPAIGNS LIST & DASHBOARD */}
      {viewState === 'list' && !selectedCampaign && (
        <div>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            {!hideHeader && (
              <div>
                <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '0px' }}>{t.title}</h1>
              </div>
            )}
            <button 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontWeight: 600 }}
              onClick={() => {
                changeViewStateAndCampaign('create', null);
                setStep(1);
                setCampName('');
                setCampChannel('sms');
                setCampTemplateId('');
                setCampSubject('');
                setCampBody('');
                setCsvText('');
                setParsedRecipients([]);
              }}
            >
              <Plus size={16} />
              <span>{t.createBtn}</span>
            </button>
          </div>

          {/* Aggregate Metrics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            
            {/* Total Campaigns */}
            <BentoCard 
              className="dashboard-card bento-metric-card wa-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Megaphone size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.totalCampaigns}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat">{stats.total}</span>
                <span className="bento-trend-badge neutral">
                  <span>+0%</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'en' ? 'All-time campaigns' : 'إجمالي الحملات الكلي'}
                </span>
                <button className="bento-details-btn" onClick={() => setCampaignSubTab('campaigns')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>

            {/* Messages Sent */}
            <BentoCard 
              className="dashboard-card bento-metric-card sms-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.messagesSent}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat">{stats.sent}</span>
                <span className="bento-trend-badge up">
                  <TrendingUp size={10} />
                  <span>18%</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'en' ? 'Successful delivery' : 'توصيل ناجح بالكامل'}
                </span>
                <button className="bento-details-btn" onClick={() => setCampaignSubTab('campaigns')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>

            {/* Success Rate */}
            <BentoCard 
              className="dashboard-card bento-metric-card delivery-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.successRate}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat">{stats.successRate}%</span>
                <span className="bento-trend-badge up">
                  <CheckCircle2 size={10} />
                  <span>99%</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'en' ? 'Within SLA target' : 'ضمن أهداف الخدمة'}
                </span>
                <button className="bento-details-btn" onClick={() => setCampaignSubTab('campaigns')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>

            {/* Total Expenses */}
            <BentoCard 
              className="dashboard-card bento-metric-card email-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Coins size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.spent}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat" style={{ fontSize: '24px' }}>
                  {stats.spent.toLocaleString()}{' '}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.iqd}</span>
                </span>
                <span className="bento-trend-badge neutral">
                  <span>IQD</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'en' ? 'Accumulated cost' : 'الإنفاق التراكمي المجمع'}
                </span>
                <button className="bento-details-btn" onClick={() => setCampaignSubTab('campaigns')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>
          </div>

          {/* Templates tab navigation is removed here since it is now a dedicated standalone page in Sidebar and Dashboard */}

          {campaignSubTab === 'campaigns' ? (
            /* Campaigns History */
            <BentoCard className="card glass-history-card" glowColor="59, 130, 246" style={{ padding: '24px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>{t.historyTitle}</h3>
              
              {campaigns.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Clock size={32} style={{ marginBottom: '10px', color: 'var(--border-color)' }} />
                  <p style={{ fontSize: '14px' }}>{t.noCampaigns}</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="v-table">
                    <thead>
                      <tr>
                        <th>{t.colName}</th>
                        <th>{t.colChannel}</th>
                        <th>{t.colRecipients}</th>
                        <th>{t.colCost}</th>
                        <th>{t.colStatus}</th>
                        <th>{t.colDate}</th>
                        <th style={{ textAlign: 'center' }}>{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((camp) => (
                        <tr key={camp.id} onClick={() => changeViewStateAndCampaign('list', camp)} style={{ cursor: 'pointer', transition: 'background-color 0.15s' }}>
                          <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {camp.name}
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>
                            <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px', fontWeight: 800 }}>
                              {camp.type}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600 }}>
                            {camp.recipientsCount}
                          </td>
                          <td style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
                            {camp.totalCost.toLocaleString()} {t.iqd}
                          </td>
                          <td>
                            <span className={`badge badge-${camp.status === 'completed' ? 'success' : camp.status === 'sending' ? 'warning' : 'secondary'}`}>
                              {camp.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {new Date(camp.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="btn"
                              style={{ padding: '4px 8px', borderColor: 'var(--danger-text)', color: 'var(--danger-text)', background: 'none' }}
                              onClick={(e) => handleDeleteCampaign(camp.id, e)}
                            >
                              <Trash2 size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </BentoCard>
          ) : (
            /* Template Management tab rendering */
            <div>
              {!isCreatingTemplate ? (
                /* GALLERY VIEW */
                <div>
                  <div className="flex-between" style={{ marginBottom: '20px', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                        {lang === 'ar' ? 'معرض وقوالب الرسائل الذكية' : 'Smart Message Templates Gallery'}
                      </h3>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
                      onClick={() => {
                        setEditingBuilderTemplate(null);
                        setIsCreatingTemplate(true);
                      }}
                    >
                      <Plus size={14} />
                      <span>{lang === 'ar' ? 'إنشاء قالب جديد' : 'Create New Template'}</span>
                    </button>
                  </div>

                  {/* Channels Pill Filters */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {['all', 'sms', 'email', 'whatsapp'].map(filterType => {
                      const isActive = activeTemplateFilter === filterType;
                      return (
                        <button
                          key={filterType}
                          type="button"
                          className="btn"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '4px',
                            borderColor: isActive ? 'var(--text-primary)' : 'var(--border-color)',
                            backgroundColor: isActive ? 'var(--text-primary)' : 'transparent',
                            color: isActive ? 'var(--background-color)' : 'var(--text-primary)'
                          }}
                          onClick={() => setActiveTemplateFilter(filterType as any)}
                        >
                          {filterType === 'all' && (lang === 'ar' ? 'الكل' : 'All')}
                          {filterType === 'sms' && (lang === 'ar' ? 'رسائل قصيرة SMS' : 'SMS')}
                          {filterType === 'email' && (lang === 'ar' ? 'بريد إلكتروني' : 'Email')}
                          {filterType === 'whatsapp' && (lang === 'ar' ? 'واتساب' : 'WhatsApp')}
                        </button>
                      );
                    })}
                  </div>

                  {/* Template Cards Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {getFilteredTemplates().map(temp => {
                      const isCustom = temp.id.startsWith('temp_cust_');
                      return (
                        <div 
                          key={temp.id} 
                          className="card" 
                          style={{ 
                            padding: '20px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between', 
                            minHeight: '220px', 
                            transition: 'all 0.15s ease' 
                          }}
                        >
                          <div>
                            <div className="flex-between" style={{ alignItems: 'flex-start', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', color: 'var(--text-secondary)' }}>
                                  {renderTemplateIcon(temp.icon || 'FileText', 20)}
                                </span>
                                <div>
                                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>
                                    {lang === 'ar' ? temp.nameAr : temp.nameEn}
                                  </h4>
                                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px', display: 'block', fontWeight: 600 }}>
                                    {temp.type === 'email' && 'Email'}
                                    {temp.type === 'sms' && 'SMS'}
                                    {temp.type === 'whatsapp' && 'WhatsApp'}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`badge badge-${isCustom ? 'warning' : 'secondary'}`}
                                style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px' }}
                              >
                                {isCustom ? (lang === 'ar' ? 'مخصص' : 'Custom') : (lang === 'ar' ? 'نظام' : 'System')}
                              </span>
                            </div>
                            
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.5, minHeight: '36px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {lang === 'ar' ? temp.descAr : temp.descEn}
                            </p>

                            {temp.variables && temp.variables.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                                {temp.variables.map((v: any) => (
                                  <span key={v.key} style={{ fontSize: '10px', backgroundColor: 'var(--panel-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
                                    {`{{${v.key}}}`}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {isCustom ? (
                              <>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: '4px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                  onClick={() => handleEditTemplate(temp)}
                                >
                                  {lang === 'ar' ? 'تعديل' : 'Edit'}
                                </button>
                                <button
                                  type="button"
                                  className="btn"
                                  style={{ padding: '4px 10px', fontSize: '11px', borderColor: 'var(--danger-text)', color: 'var(--danger-text)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                  onClick={(e) => handleDeleteTemplate(temp.id, e)}
                                >
                                  {lang === 'ar' ? 'حذف' : 'Delete'}
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {lang === 'ar' ? 'قالب نظام للقراءة فقط' : 'Read-only System Template'}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Visual Template Builder */
                <TemplateBuilder
                  lang={lang}
                  template={editingBuilderTemplate}
                  initialCategory={activeTemplateFilter === 'all' ? 'email' : activeTemplateFilter as 'email' | 'sms' | 'whatsapp'}
                  onSave={handleBuilderSave}
                  onCancel={() => {
                    setIsCreatingTemplate(false);
                    setEditingBuilderTemplate(null);
                  }}
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CAMPAIGN DETAILS VIEW */}
      {selectedCampaign && (
        <div>
          <button 
            className="btn" 
            style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            onClick={() => changeViewStateAndCampaign('list', null)}
          >
            <ArrowLeft size={14} />
            <span>{lang === 'en' ? 'Back to Campaigns' : 'العودة لقائمة الحملات'}</span>
          </button>

          <div className="card" style={{ padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '10px', marginBottom: '6px', display: 'inline-block' }}>{selectedCampaign.type}</span>
                <h2 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>{selectedCampaign.name}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {lang === 'en' ? 'Launched on:' : 'أطلقت بتاريخ:'} {new Date(selectedCampaign.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge badge-${selectedCampaign.status === 'completed' ? 'success' : 'warning'}`} style={{ fontSize: '12px', padding: '6px 12px' }}>
                  {selectedCampaign.status}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 700, marginTop: '8px', color: 'var(--accent-color)' }}>
                  {selectedCampaign.totalCost.toLocaleString()} {t.iqd}
                </h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Recipients' : 'إجمالي المستلمين'}</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '4px 0 0 0' }}>{selectedCampaign.recipientsCount}</h4>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: '#4cd964' }}>{lang === 'en' ? 'Delivered' : 'تم التوصيل'}</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#4cd964', margin: '4px 0 0 0' }}>{selectedCampaign.successCount}</h4>
              </div>
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: '#ff3b30' }}>{lang === 'en' ? 'Failed' : 'فشلت'}</span>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#ff3b30', margin: '4px 0 0 0' }}>{selectedCampaign.failedCount}</h4>
              </div>
            </div>

            {selectedCampaign.subject && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang === 'en' ? 'Email Subject:' : 'عنوان البريد:'}</strong>
                <p style={{ margin: 0, fontSize: '13px', padding: '10px', backgroundColor: 'var(--panel-bg)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>{selectedCampaign.subject}</p>
              </div>
            )}

            <div>
              <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>{lang === 'en' ? 'Message Template Content:' : 'محتوى الرسالة المعتمد:'}</strong>
              <pre style={{ margin: 0, padding: '12px', fontSize: '13px', whiteSpace: 'pre-wrap', backgroundColor: 'var(--panel-bg)', borderRadius: '4px', border: '1px solid var(--border-color)', fontFamily: 'sans-serif', lineHeight: 1.4 }}>{selectedCampaign.body}</pre>
            </div>
          </div>

          {/* Recipients Table list inside campaign detail */}
          <div className="card" style={{ padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '12px' }}>{lang === 'en' ? 'Campaign Dispatch Matrix' : 'جدول توزيع وتسليم الرسائل'}</h3>
            <div className="table-container">
              <table className="v-table">
                <thead>
                  <tr>
                    <th>{lang === 'en' ? 'Recipient Name' : 'اسم المستلم'}</th>
                    <th>{lang === 'en' ? 'Target Destination' : 'العنوان / رقم الهاتف'}</th>
                    <th>{lang === 'en' ? 'Delivery Status' : 'حالة التسليم'}</th>
                    <th>{lang === 'en' ? 'Logs/Reason' : 'السبب / السجل'}</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCampaign.recipients.map((rc, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{rc.name}</td>
                      <td>{rc.to}</td>
                      <td>
                        <span className={`badge badge-${rc.status === 'delivered' ? 'success' : rc.status === 'failed' ? 'danger' : 'warning'}`}>
                          {rc.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {rc.error || (rc.status === 'delivered' ? (lang === 'en' ? 'Sent successfully' : 'تم الإرسال والتسليم') : '')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: CAMPAIGN BUILDER WIZARD */}
      {viewState === 'create' && (
        <BentoCard className="card" glowColor="37, 99, 235" style={{ padding: '24px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Wizard Steps indicator bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            {[1, 2, 3, 4].map(s => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: step === s ? 'var(--accent-color)' : step > s ? 'var(--success-color)' : 'var(--border-color)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800
                }}>
                  {step > s ? <Check size={14} /> : s}
                </span>
                <span style={{ 
                  fontSize: '13px', 
                  fontWeight: step === s ? 700 : 500,
                  color: step === s ? 'var(--text-primary)' : 'var(--text-secondary)'
                }}>
                  {s === 1 && t.stepBasics}
                  {s === 2 && t.stepComposer}
                  {s === 3 && t.stepAudience}
                  {s === 4 && t.stepReview}
                </span>
                {s < 4 && <ChevronRight size={14} color="var(--border-color)" style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />}
              </div>
            ))}
          </div>

          {/* STEP 1: BASICS */}
          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>{t.campNameLabel}</label>
                <input
                  type="text"
                  className="form-input"
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder={t.campNamePl}
                  style={{ height: '40px' }}
                />
              </div>

              <div>
                <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>{t.channelLabel}</label>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px 0' }}>{t.channelDesc}</p>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {(['sms', 'whatsapp', 'email'] as const).map(ch => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setCampChannel(ch)}
                      className={`btn ${campChannel === ch ? 'btn-primary' : ''}`}
                      style={{ 
                        flex: 1, 
                        padding: '16px 8px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '8px', 
                        background: campChannel === ch ? '' : 'none', 
                        border: '1px solid var(--border-color)' 
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ch === 'email' && <Mail size={18} />}
                        {ch === 'sms' && <MessageSquare size={18} />}
                        {ch === 'whatsapp' && <Send size={18} />}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {ch === 'email' && (lang === 'en' ? 'Email Campaign' : 'حملة بريد')}
                        {ch === 'sms' && (lang === 'en' ? 'SMS Campaign' : 'حملة رسائل قصيرة')}
                        {ch === 'whatsapp' && (lang === 'en' ? 'WhatsApp Campaign' : 'حملة واتساب')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COMPOSER */}
          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>{t.selectTemplate}</label>
                <select
                  className="form-input"
                  value={campTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  style={{ height: '40px', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', backgroundSize: '16px' }}
                >
                  <option value="">{lang === 'en' ? '-- Select a template --' : '-- اختر قالباً جاهزاً --'}</option>
                  {getMergedTemplates(campChannel).map(temp => (
                    <option key={temp.id} value={temp.id}>
                      {lang === 'ar' ? temp.nameAr : temp.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {campChannel === 'email' && (
                <div>
                  <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>{t.customSubject}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={campSubject}
                    onChange={(e) => setCampSubject(e.target.value)}
                    placeholder={t.emailSubPl}
                    style={{ height: '40px' }}
                  />
                </div>
              )}

              <div>
                <label className="form-label" style={{ marginBottom: '4px', display: 'block' }}>{t.messageBodyLabel}</label>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px 0' }}>{t.bodyDesc}</p>
                <textarea
                  ref={textareaRef}
                  className="form-input"
                  rows={6}
                  value={campBody}
                  onChange={(e) => setCampBody(e.target.value)}
                  placeholder={t.bodyPl}
                  style={{ fontFamily: 'monospace', fontSize: '13px', padding: '12px', lineHeight: 1.5 }}
                />
              </div>

              {/* Token Helpers */}
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', backgroundColor: 'var(--panel-bg)' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  {lang === 'ar' ? 'انقر لإدراج متغير تخصيص في موضع المؤشر:' : 'Click to insert dynamic personalization token:'}
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => insertTokenToComposer('{{name}}')}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <span>{"{{name}}"}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({lang === 'ar' ? 'اسم العميل' : 'Name'})</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => insertTokenToComposer('{{email}}')}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <span>{"{{email}}"}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({lang === 'ar' ? 'البريد' : 'Email'})</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => insertTokenToComposer('{{phone}}')}
                    className="btn"
                    style={{ padding: '6px 12px', fontSize: '11.5px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                  >
                    <span>{"{{phone}}"}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({lang === 'ar' ? 'الهاتف' : 'Phone'})</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: AUDIENCE */}
          {step === 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                
                {/* Current Subscribers card */}
                <div 
                  onClick={() => { setAudienceSource('current'); setParseError(null); }}
                  style={{
                    border: '1px solid ' + (audienceSource === 'current' ? 'var(--text-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: audienceSource === 'current' ? 'var(--panel-bg)' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Users size={16} color={audienceSource === 'current' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'المشتركين في النظام' : 'System Subscribers'}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {lang === 'ar' 
                      ? `استخدام قاعدة المشتركين الحالية. النشطون: ${subscribers.filter(s => s.status === 'active').length} مشترك.`
                      : `Use current opt-in database. Active: ${subscribers.filter(s => s.status === 'active').length} users.`}
                  </p>
                </div>

                {/* Upload Spreadsheet card */}
                <div 
                  onClick={() => { setAudienceSource('upload'); setParseError(null); }}
                  style={{
                    border: '1px solid ' + (audienceSource === 'upload' ? 'var(--text-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: audienceSource === 'upload' ? 'var(--panel-bg)' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FileSpreadsheet size={16} color={audienceSource === 'upload' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'تحميل ملف Excel / CSV' : 'Spreadsheet Uploader'}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {lang === 'ar'
                      ? 'رفع ملف Excel يحتوي على قائمة عملائك وتعيين الحقول فوراً.'
                      : 'Upload a spreadsheet containing customer rows and map fields.'}
                  </p>
                  {uploadedFileName && (
                    <div style={{ marginTop: '6px', fontSize: '10px', color: 'var(--success-color)', fontWeight: 600 }}>
                      {lang === 'ar' ? `✓ تم تحميل: ${uploadedFileName}` : `✓ Loaded: ${uploadedFileName}`}
                    </div>
                  )}
                </div>

                {/* Copied CSV Text card */}
                <div 
                  onClick={() => { setAudienceSource('manual'); setParseError(null); }}
                  style={{
                    border: '1px solid ' + (audienceSource === 'manual' ? 'var(--text-primary)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    backgroundColor: audienceSource === 'manual' ? 'var(--panel-bg)' : 'transparent',
                    transition: 'all 0.2s ease',
                    textAlign: lang === 'ar' ? 'right' : 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FileText size={16} color={audienceSource === 'manual' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'لصق نص CSV يدوي' : 'Paste CSV Text'}
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {lang === 'ar'
                      ? 'نسخ ولصق قائمة جهات اتصال مفصولة بفاصلة مباشرة.'
                      : 'Manually copy-paste comma-separated recipient lines.'}
                  </p>
                </div>
              </div>

              {/* Conditional Options Render */}
              {audienceSource === 'current' && (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'var(--panel-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--success-color)' }}>
                    <CheckCircle2 size={16} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>
                      {lang === 'ar' 
                        ? `قاعدة البيانات نشطة وجاهزة! سيتم إرسال الحملة لـ ${subscribers.filter(s => s.status === 'active').length} مشترك نشط.`
                        : `Database active! Ready to dispatch to ${subscribers.filter(s => s.status === 'active').length} active opt-ins.`}
                    </span>
                  </div>
                </div>
              )}

              {audienceSource === 'upload' && (
                <div style={{ border: '1px dashed var(--border-color)', borderRadius: '8px', padding: '20px', backgroundColor: 'var(--panel-bg)' }}>
                  {!uploadedFileName ? (
                    <div 
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={28} color="var(--text-secondary)" />
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>
                        {lang === 'ar' ? 'انقر لتصفح ورفع ملف جهات الاتصال' : 'Click to browse contact spreadsheet'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'يدعم الملفات بصيغة .xlsx, .csv أو .xls' : 'Supports .xlsx, .csv or .xls files'}
                      </span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display: 'none' }} 
                        accept=".xlsx,.xls,.csv" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) processCampaignFile(file);
                        }}
                      />
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>
                          {lang === 'ar' ? `الملف المرفوع: ${uploadedFileName}` : `Uploaded file: ${uploadedFileName}`}
                        </span>
                        <button 
                          className="btn" 
                          style={{ padding: '4px 10px', fontSize: '11px' }}
                          onClick={() => { setUploadedFileName(''); setUploadedRows([]); setUploadedHeaders([]); }}
                        >
                          {lang === 'ar' ? 'تغيير الملف' : 'Change File'}
                        </button>
                      </div>

                      {/* Columns Mapping section */}
                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <h5 style={{ margin: 0, fontSize: '12.5px', fontWeight: 700 }}>
                          {lang === 'ar' ? 'ربط وتعيين حقول الملف أعلاه:' : 'Map spreadsheet headers to columns:'}
                        </h5>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              {lang === 'ar' ? 'عمود البريد الإلكتروني (مطلوب)' : 'Email (Required)'}
                            </label>
                            <select 
                              className="form-input" 
                              style={{ height: '34px', fontSize: '12px', padding: '0 8px' }} 
                              value={mapEmail} 
                              onChange={(e) => setMapEmail(e.target.value)}
                            >
                              <option value="">-- select --</option>
                              {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              {lang === 'ar' ? 'عمود الاسم (اختياري)' : 'Name (Optional)'}
                            </label>
                            <select 
                              className="form-input" 
                              style={{ height: '34px', fontSize: '12px', padding: '0 8px' }} 
                              value={mapName} 
                              onChange={(e) => setMapName(e.target.value)}
                            >
                              <option value="">-- select --</option>
                              {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                              {lang === 'ar' ? 'عمود الهاتف (اختياري)' : 'Phone (Optional)'}
                            </label>
                            <select 
                              className="form-input" 
                              style={{ height: '34px', fontSize: '12px', padding: '0 8px' }} 
                              value={mapPhone} 
                              onChange={(e) => setMapPhone(e.target.value)}
                            >
                              <option value="">-- select --</option>
                              {uploadedHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                        </div>

                        <button 
                          className="btn btn-primary" 
                          style={{ alignSelf: 'flex-end', height: '32px', fontSize: '11.5px', borderRadius: '6px', padding: '0 14px', marginTop: '6px' }}
                          onClick={handleMapColumns}
                        >
                          {lang === 'ar' ? 'تطبيق المزامنة والربط' : 'Apply Mapping'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {audienceSource === 'manual' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="flex-between" style={{ alignItems: 'center' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>{lang === 'ar' ? 'محتوى نص CSV:' : 'Pasted CSV Lines:'}</label>
                    <button 
                      type="button" 
                      onClick={handleLoadDemoCSV}
                      className="btn"
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', fontSize: '10.5px' }}
                    >
                      <FileText size={11} />
                      <span>{t.loadDemoBtn}</span>
                    </button>
                  </div>
                  
                  <textarea
                    className="form-input"
                    rows={6}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={t.csvPl}
                    style={{ fontFamily: 'monospace', fontSize: '12px', padding: '12px', lineHeight: 1.4, direction: 'ltr', textAlign: 'left' }}
                  />

                  {parsedRecipients.length > 0 && !parseError && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(76,217,100,0.1)', color: '#4cd964', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <CheckCircle2 size={13} />
                        <span>{t.parsedSuccess.replace('{count}', parsedRecipients.length.toString())}</span>
                      </div>
                      {duplicateCount > 0 && (
                        <div style={{ padding: '8px 12px', borderRadius: '4px', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <AlertCircle size={13} />
                          <span>
                            {lang === 'ar' 
                              ? `تم استبعاد ${duplicateCount} مستلم مكرر تلقائياً.` 
                              : `Successfully excluded ${duplicateCount} duplicate recipient(s) automatically.`}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {parseError && (
                <div style={{ padding: '10px 14px', borderRadius: '4px', backgroundColor: 'rgba(255,59,48,0.1)', color: '#ff3b30', fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertCircle size={14} />
                  <span>{parseError}</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & LIVE PREVIEW */}
          {step === 4 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
              
              {/* Left Pane: Summary, Cost, Templates, Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px', backgroundColor: 'var(--panel-bg)' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>📢</span>
                    <span>{lang === 'en' ? 'Campaign Parameters Summary' : 'ملخص مواصفات الحملة'}</span>
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Campaign Name:' : 'اسم الحملة:'}</span>{' '}
                      <strong style={{ color: 'var(--text-primary)' }}>{campName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Channel:' : 'القناة:'}</span>{' '}
                      <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '10px' }}>{campChannel}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Audience Size:' : 'حجم قائمة الجمهور المستهدف:'}</span>{' '}
                      <strong>{getAudienceList().length} {lang === 'en' ? 'Recipients' : 'مستلم'}</strong>
                    </div>
                  </div>
                </div>

                {/* Cost Box */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{t.summaryCost}</span>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, margin: '6px 0', color: 'var(--accent-color)' }}>
                    {calculateTotalCost().toLocaleString()} {t.iqd}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                    {t.summaryCostDetails
                      .replace('{count}', getAudienceList().length.toString())
                      .replace('{rate}', getCostPerMessage().toString())
                      .replace('{total}', calculateTotalCost().toLocaleString())}
                  </p>
                </div>

                {/* Save Template for Future Use Option */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', backgroundColor: 'var(--panel-bg)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                    <input 
                      type="checkbox" 
                      checked={saveTemplateForFuture} 
                      onChange={(e) => setSaveTemplateForFuture(e.target.checked)} 
                      style={{ accentColor: 'var(--accent-color)' }}
                    />
                    <span>{lang === 'ar' ? 'حفظ هذا التصميم كقالب جديد للاستخدام المستقبلي' : 'Save this design as a template for future use'}</span>
                  </label>
                  
                  {saveTemplateForFuture && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'اسم القالب المخصص الجديد:' : 'New Custom Template Name:'}
                      </label>
                      <input 
                        type="text" 
                        className="form-input" 
                        style={{ height: '34px', fontSize: '12px' }} 
                        value={newCustomTemplateName} 
                        onChange={(e) => setNewCustomTemplateName(e.target.value)} 
                        placeholder={lang === 'ar' ? 'مثال: نشرة عروض البصرة 2026' : 'e.g. Basra Promo Template 2026'} 
                      />
                    </div>
                  )}
                </div>

                {/* Wallet Balance verification status */}
                {!isBalanceSufficient() ? (
                  <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: 'rgba(255,59,48,0.06)', border: '1px solid rgba(255, 59, 48, 0.2)', color: '#ff3b30', fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <AlertCircle size={18} />
                    <span>{t.balanceWarning}</span>
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', borderRadius: '6px', backgroundColor: 'rgba(76,217,100,0.1)', color: '#4cd964', fontSize: '13px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <CheckCircle2 size={16} />
                    <span>{lang === 'en' ? 'Wallet balance is sufficient. Ready to launch.' : 'رصيد المحفظة الإلكترونية كافٍ لتشغيل الحملة بنجاح.'}</span>
                  </div>
                )}
              </div>

              {/* Right Pane: Real-time Live Preview with desktop/mobile mode & test send */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  
                  {/* Recipient browser */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {lang === 'ar' ? 'تخصيص المعاينة حسب:' : 'Resolve Preview For:'}
                    </span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button 
                        type="button"
                        className="btn" 
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                        disabled={previewSubIndex === 0}
                        onClick={() => setPreviewSubIndex(p => Math.max(0, p - 1))}
                      >
                        &larr;
                      </button>
                      
                      <select
                        className="form-input"
                        style={{ height: '30px', fontSize: '11.5px', padding: '0 6px', width: '130px' }}
                        value={previewSubIndex}
                        onChange={(e) => setPreviewSubIndex(Number(e.target.value))}
                      >
                        {getAudienceList().slice(0, 15).map((aud, idx) => (
                          <option key={idx} value={idx}>
                            {aud.name || aud.to}
                          </option>
                        ))}
                        {getAudienceList().length === 0 && (
                          <option value="0">{lang === 'ar' ? 'لا يوجد مستلمين' : 'No Recipients'}</option>
                        )}
                      </select>

                      <button 
                        type="button"
                        className="btn" 
                        style={{ padding: '4px 8px', borderRadius: '6px' }}
                        disabled={previewSubIndex >= getAudienceList().length - 1}
                        onClick={() => setPreviewSubIndex(p => Math.min(getAudienceList().length - 1, p + 1))}
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Desktop / Mobile view mode toggle */}
                  <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                    <button 
                      type="button"
                      className="btn" 
                      style={{ border: 'none', background: previewMode === 'desktop' ? 'var(--text-primary)' : 'transparent', color: previewMode === 'desktop' ? 'var(--background-color)' : 'var(--text-secondary)', padding: '6px 12px', fontSize: '11px', borderRadius: 0 }}
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Laptop size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                      {lang === 'ar' ? 'شاشة كاملة' : 'Desktop'}
                    </button>
                    <button 
                      type="button"
                      className="btn" 
                      style={{ border: 'none', background: previewMode === 'mobile' ? 'var(--text-primary)' : 'transparent', color: previewMode === 'mobile' ? 'var(--background-color)' : 'var(--text-secondary)', padding: '6px 12px', fontSize: '11px', borderRadius: 0 }}
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone size={12} style={{ display: 'inline', marginInlineEnd: '4px' }} />
                      {lang === 'ar' ? 'هاتف' : 'Mobile'}
                    </button>
                  </div>
                </div>

                {/* Preview Frame Container */}
                <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#09090b', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{
                    width: previewMode === 'mobile' ? '280px' : '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: previewMode === 'mobile' ? '20px' : '4px',
                    border: previewMode === 'mobile' ? '10px solid #18181b' : 'none',
                    height: '280px',
                    overflowY: 'auto',
                    color: '#000000',
                    textAlign: lang === 'ar' ? 'right' : 'left',
                    direction: lang === 'ar' ? 'rtl' : 'ltr'
                  }}>
                    
                    {/* Mock Email Frame */}
                    {campChannel === 'email' ? (
                      <div>
                        <div style={{ padding: '10px', borderBottom: '1px solid #e4e4e7', backgroundColor: '#f4f4f5', fontSize: '11px', color: '#3f3f46', direction: lang === 'ar' ? 'rtl' : 'ltr', textAlign: lang === 'ar' ? 'right' : 'left' }}>
                          <div><strong>{lang === 'ar' ? 'من:' : 'From:'}</strong> sumersend@prudctual.com</div>
                          <div><strong>{lang === 'ar' ? 'إلى:' : 'To:'}</strong> {getAudienceList()[previewSubIndex]?.to || 'jasim@prudctual.substack.com'}</div>
                          <div style={{ marginTop: '4px' }}><strong>{lang === 'ar' ? 'الموضوع:' : 'Subject:'}</strong> {getPreviewText(campSubject, getAudienceList()[previewSubIndex]) || '(لا يوجد عنوان)'}</div>
                        </div>
                        
                        <div 
                          style={{ padding: '16px', fontSize: '13px', lineHeight: 1.5 }}
                          dangerouslySetInnerHTML={{ __html: getPreviewText(campBody, getAudienceList()[previewSubIndex]).replace(/\n/g, '<br />') }}
                        />
                      </div>
                    ) : (
                      // Mock Mobile Chat Bubble (WhatsApp / SMS)
                      <div style={{
                        backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                        backgroundSize: 'cover',
                        height: '100%',
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        minHeight: '260px'
                      }}>
                        <div style={{
                          alignSelf: lang === 'ar' ? 'flex-start' : 'flex-end',
                          backgroundColor: campChannel === 'whatsapp' ? '#dcf8c6' : '#e5e5ea',
                          color: '#000000',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          maxWidth: '85%',
                          fontSize: '12px',
                          lineHeight: 1.4,
                          boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                          textAlign: lang === 'ar' ? 'right' : 'left',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {getPreviewText(campBody, getAudienceList()[previewSubIndex]) || '(محتوى الرسالة فارغ)'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Send Dispatcher Block */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'var(--panel-bg)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700 }}>
                      {lang === 'ar' ? 'إرسال رسالة تجريبية سريعة:' : 'Send Test Sample:'}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {lang === 'ar' ? 'تحقق من وصول الرسالة فعلياً لهاتفك أو بريدك الإلكتروني.' : 'Verify delivery directly on your real mailbox or phone.'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ height: '32px', fontSize: '12px', flex: 1 }} 
                      placeholder={campChannel === 'email' ? 'your-email@gmail.com' : '07801234567'} 
                      value={testSendTo}
                      onChange={(e) => setTestSendTo(e.target.value)}
                    />
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      style={{ height: '32px', fontSize: '12px', padding: '0 12px', borderRadius: '6px' }}
                      disabled={isTestSending}
                      onClick={handleSendTestMessage}
                    >
                      {isTestSending ? '...' : (lang === 'ar' ? 'إرسال تجربة' : 'Send Test')}
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Wizard Footer controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
            {step === 1 ? (
              <button className="btn" onClick={() => changeViewStateAndCampaign('list', null)}>{t.cancelBtn}</button>
            ) : (
              <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => setStep(step - 1)}>
                <ChevronLeft size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                <span>{t.backBtn}</span>
              </button>
            )}

            {step < 4 ? (
              <button 
                className="btn btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                disabled={
                  (step === 1 && !campName.trim()) || 
                  (step === 2 && !campBody.trim()) || 
                  (step === 3 && (getAudienceList().length === 0 || !!parseError))
                }
                onClick={() => setStep(step + 1)}
              >
                <span>{t.nextBtn}</span>
                <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </button>
            ) : (
              <button 
                className="btn btn-primary" 
                disabled={!isBalanceSufficient() || getAudienceList().length === 0}
                onClick={handleLaunchCampaign}
              >
                {t.launchBtn}
              </button>
            )}
          </div>
        </BentoCard>
      )}

      {/* VIEW 4: LIVE DISPATCHING PROGRESS */}
      {viewState === 'progress' && activeCampaign && (
        <BentoCard className="card" glowColor="16, 185, 129" style={{ padding: '24px', borderRadius: '8px', maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span className="pulse-dot" style={{ display: execProgress < 100 ? 'inline-block' : 'none' }}></span>
            <span>{t.progressTitle}</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>{t.progressDesc}</p>

          {/* Progress Indicators */}
          <div style={{ marginBottom: '24px' }}>
            <div className="flex-between" style={{ marginBottom: '8px', fontSize: '13px', fontWeight: 600 }}>
              <span>
                {execProgress < 100 
                  ? t.sendingStatus.replace('{name}', activeCampaign.name)
                  : t.completedStatus}
              </span>
              <span>{execProgress}%</span>
            </div>
            
            {/* Progress Bar slider container */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
              <div 
                style={{ 
                  width: `${execProgress}%`, 
                  height: '100%', 
                  backgroundColor: execProgress < 100 ? 'var(--accent-color)' : 'var(--success-color)',
                  transition: 'width 0.3s ease-out' 
                }} 
              />
            </div>
          </div>

          {/* Real-time Logs Console */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label className="form-label" style={{ fontSize: '12px' }}>{t.progressLogs}</label>
            
            <div style={{ 
              backgroundColor: '#000000', 
              border: '1px solid #27272a', 
              borderRadius: '6px', 
              padding: '20px', 
              fontFamily: 'monospace', 
              fontSize: '12px', 
              color: '#00ff66', 
              minHeight: '220px',
              maxHeight: '350px',
              overflowY: 'auto',
              direction: 'ltr',
              textAlign: 'left'
            }}>
              {execLogs.map((log, idx) => {
                let color = '#00ff66';
                if (log.startsWith('> [') || log.startsWith('> Starting') || log.startsWith('> Target')) {
                  color = '#60a5fa'; // Blue
                } else if (log.includes('[Success]')) {
                  color = '#34d399'; // Green
                } else if (log.includes('[Failed]')) {
                  color = '#f87171'; // Red
                } else if (log.includes('[Success Fallback]')) {
                  color = '#a1a1aa'; // Muted
                }
                return (
                  <pre key={idx} style={{ margin: '0 0 6px 0', whiteSpace: 'pre-wrap', color }}>
                    {log}
                  </pre>
                );
              })}
            </div>
          </div>

          {/* Back button visible only when completed */}
          {execProgress === 100 && (
            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  changeViewStateAndCampaign('list', null);
                }}
              >
                {lang === 'en' ? 'Done & Close' : 'إكمال وإغلاق'}
              </button>
            </div>
          )}
        </BentoCard>
      )}

      {is2faModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '28px',
            boxShadow: 'var(--shadow-large)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--panel-bg)',
            borderRadius: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <Lock size={16} color="var(--text-primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'تأكيد الهوية ثنائي العامل (2FA)' : 'Two-Factor Verification (2FA)'}
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'حماية الحساب والأمان الإضافي' : 'Additional account security verification'}
                </p>
              </div>
            </div>

            <p style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {lang === 'ar' 
                ? `لقد قمنا بإرسال رمز تحقق OTP مكون من 6 أرقام إلى هاتفك المرتبط (${securityConfig?.phone || '078xxxxxxxx'}). يرجى إدخال الرمز أدناه للمتابعة.`
                : `We have sent a 6-digit OTP code to your linked phone (${securityConfig?.phone || '078xxxxxxxx'}). Please enter the code below to continue.`}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                maxLength={6}
                value={verificationOtpInput}
                onChange={(e) => {
                  setVerificationOtpInput(e.target.value.replace(/\D/g, ''));
                  setVerificationOtpError(null);
                }}
                placeholder="000000"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '8px',
                  padding: '10px',
                  borderRadius: '6px',
                  border: verificationOtpError ? '1px solid #ef4444' : '1px solid var(--border-color)',
                  backgroundColor: 'var(--panel-bg)',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
              {verificationOtpError && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', margin: '6px 0 0 0' }}>
                  {verificationOtpError}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="btn"
                style={{
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setIs2faModalOpen(false);
                  setVerificationOtpInput('');
                  setVerificationOtpError(null);
                }}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                className="btn btn-primary"
                style={{
                  fontSize: '12px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                onClick={async () => {
                  if (verificationOtpInput.length !== 6) {
                    setVerificationOtpError(lang === 'ar' ? 'يجب إدخال 6 أرقام.' : 'Code must be 6 digits.');
                    return;
                  }
                  
                  try {
                    const res = await fetch('http://127.0.0.1:3000/api/security/confirm-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ otp: verificationOtpInput })
                    });
                    
                    if (res.ok) {
                      setIs2faModalOpen(false);
                      setVerificationOtpInput('');
                      executeCampaignLaunch(calculateTotalCost());
                    } else {
                      if (pendingOtpCode && verificationOtpInput === pendingOtpCode) {
                        setIs2faModalOpen(false);
                        setVerificationOtpInput('');
                        executeCampaignLaunch(calculateTotalCost());
                      } else {
                        const errData = await res.json();
                        setVerificationOtpError(errData.error || (lang === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid code.'));
                      }
                    }
                  } catch (e) {
                    if (pendingOtpCode && verificationOtpInput === pendingOtpCode) {
                      setIs2faModalOpen(false);
                      setVerificationOtpInput('');
                      executeCampaignLaunch(calculateTotalCost());
                    } else {
                      setVerificationOtpError(lang === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid code.');
                    }
                  }
                }}
              >
                {lang === 'ar' ? 'تأكيد وإطلاق' : 'Confirm & Launch'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ScrollReveal>
  );
};
