import React, { useState, useMemo, useEffect } from 'react';
import { apiFetch, API_BASE } from '../config';
import { 
  BarChart3, 
  Send, 
  History, 
  Wallet, 
  FileText, 
  Download, 
  Calendar, 
  ArrowUpRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  Info,
  TrendingUp,
  Zap,
  CreditCard,
  Mail,
  MessageSquare,
  MessageCircle,
  Check,
  Users
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ScrollReveal, BentoCard } from './LandingView';

interface ReportsViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  walletBalance: number;
  transactions: any[];
  domains: any[];
  setCurrentTab: (tab: string) => void;
  hideHeader?: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  lang,
  logs,
  walletBalance,
  transactions,
  domains,
  setCurrentTab,
  hideHeader = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'channels' | 'costs' | 'exports' | 'audience'>('overview');

  const handleSubTabChange = (tab: 'overview' | 'channels' | 'costs' | 'exports' | 'audience') => {
    setActiveSubTab(tab);
  };

  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsSearchQuery, setSubsSearchQuery] = useState('');

  useEffect(() => {
    apiFetch('/api/subscribers')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSubscribers(data);
        }
        setSubsLoading(false);
      })
      .catch(err => {
        console.warn('Failed to fetch subscribers for reports:', err);
        setSubsLoading(false);
      });
  }, []);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | '90d'>('7d');
  const [generatingReport, setGeneratingReport] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Exporter form state
  const [exportChannels, setExportChannels] = useState({ email: true, sms: true, whatsapp: true });
  const [exportMetrics, setExportMetrics] = useState({ volume: true, costs: true, latency: true });

  const translations = {
    en: {
      title: 'Detailed Reports',
      subtitle: 'Analytics and cost intelligence for your notification channels.',
      tabOverview: 'Overview',
      tabChannels: 'Channels Breakdown',
      tabCosts: 'Costs & Spend',
      tabExports: 'Exports & Invoices',
      tabAudience: 'Audience Analytics',
      
      // Card labels
      totalSent: 'Total Sent',
      successRate: 'Success Rate',
      avgLatency: 'Avg Latency',
      totalCost: 'Total Cost',
      
      // Chart labels
      volumeOverTime: 'Traffic Volume Comparison',
      volumeSub: 'Volume breakdown by channel and time interval.',
      legendEmail: 'Email',
      legendSMS: 'SMS',
      legendWA: 'WhatsApp',
      
      // Sub-metrics
      channelPerformance: 'Channel Performance Index',
      operatorDist: 'Iraqi Mobile Operators Distribution',
      latencyBreakdown: 'Channel Average Response Speed',
      costSummary: 'Wallet Spend Summary',
      invoiceList: 'Generated Monthly Invoices',
      customReport: 'Custom PDF Report Exporter',
      
      // Settings links
      quickIntegration: 'Quick Actions & Optimization Links',
      billingLink: 'Top up simulated wallet balance',
      domainLink: 'Check DKIM/SPF domain verification states',
      smtpLink: 'Configure customized SMTP server parameters',
      playgroundLink: 'Run quick notification sending diagnostic test',
      
      // General
      days: 'Days',
      hours: 'Hours',
      delivered: 'Delivered',
      failed: 'Failed',
      iqd: 'IQD',
      ms: 'ms',
      sec: 's',
      download: 'Download',
      generate: 'Generate Custom PDF',
      generating: 'Compiling metrics...',
      exportMsg: 'Your custom analytical report has been compiled and is ready for download.',
      selectChannels: 'Select Channels to Include',
      selectMetrics: 'Select Metrics to Include',
      noInvoices: 'No billing invoices found. Top up your wallet and send notifications to generate monthly billing history.'
    },
    ar: {
      title: 'التقارير التفصيلية',
      subtitle: 'تحليلات ذكية ومصاريف تفصيلية لكافة قنوات الإشعارات والربط الخاصة بك.',
      tabOverview: 'نظرة عامة',
      tabChannels: 'تحليل القنوات',
      tabCosts: 'التكاليف والمصاريف',
      tabExports: 'التصدير والفواتير',
      tabAudience: 'تحليلات المشتركين',
      
      // Card labels
      totalSent: 'إجمالي المرسل',
      successRate: 'نسبة النجاح',
      avgLatency: 'معدل التأخير',
      totalCost: 'إجمالي التكاليف',
      
      // Chart labels
      volumeOverTime: 'تحليل حجم تدفق البيانات',
      volumeSub: 'مقارنة تدفق وحجم الرسائل لكل قناة مع فترات زمنية محددة.',
      legendEmail: 'البريد',
      legendSMS: 'الـ SMS',
      legendWA: 'الواتساب',
      
      // Sub-metrics
      channelPerformance: 'مؤشر أداء القنوات',
      operatorDist: 'توزيع استخدام شبكات الاتصال العراقية',
      latencyBreakdown: 'معدل سرعة استجابة القنوات',
      costSummary: 'خلاصة استهلاك المحفظة',
      invoiceList: 'سجل الفواتير الشهرية الصادرة',
      customReport: 'مُصمم ومُصدّر تقارير PDF المخصصة',
      
      // Settings links
      quickIntegration: 'إجراءات سريعة وروابط تحسين الأداء',
      billingLink: 'شحن رصيد المحفظة التجريبية الآن',
      domainLink: 'مراجعة حالة نطاقات الـ DNS وتوثيق الـ SPF/DKIM',
      smtpLink: 'تهيئة وتعديل إعدادات خادم SMTP المخصص',
      playgroundLink: 'إجراء فحص سريع وتجربة إرسال عبر منصة المحاكاة',
      
      // General
      days: 'أيام',
      hours: 'ساعة',
      delivered: 'تم التوصيل',
      failed: 'فشل الإرسال',
      iqd: 'د.ع',
      ms: 'م.ث',
      sec: 'ثانية',
      download: 'تحميل',
      generate: 'توليد تقرير PDF مخصص',
      generating: 'جاري تجميع البيانات وتصميم الملف...',
      exportMsg: 'تم تجهيز وتجميع التقرير المالي والبرمجي الخاص بحسابك وهو جاهز للتحميل الآن.',
      selectChannels: 'اختر قنوات الاتصال المشمولة بالتقرير',
      selectMetrics: 'اختر البيانات والمؤشرات المشمولة بالتقرير',
      noInvoices: 'لا توجد فواتير صادرة حالياً. قم بشحن المحفظة وبدء الإرسال لتوليد سجل مالي شهري.'
    }
  };

  const t = translations[lang];

  // Dynamic calculations based on current logs and selected range
  const rangeFactor = useMemo(() => {
    switch (timeRange) {
      case '24h': return 0.4;
      case '7d': return 1.0;
      case '30d': return 3.2;
      case '90d': return 9.5;
    }
  }, [timeRange]);

  const stats = useMemo(() => {
    const emailDelivered = logs.filter(l => l.type === 'email' && l.status === 'delivered').length;
    const smsDelivered = logs.filter(l => l.type === 'sms' && l.status === 'delivered').length;
    const waDelivered = logs.filter(l => l.type === 'whatsapp' && l.status === 'delivered').length;

    // Scale up baseline statistics depending on range
    const baseEmail = Math.round(135 * rangeFactor);
    const baseSms = Math.round(245 * rangeFactor);
    const baseWa = Math.round(180 * rangeFactor);

    const emailTotal = baseEmail + emailDelivered;
    const smsTotal = baseSms + smsDelivered;
    const waTotal = baseWa + waDelivered;
    const total = emailTotal + smsTotal + waTotal;

    // Cost calculations
    const emailCost = emailTotal * 10;
    const smsCost = smsTotal * 120;
    const waCost = waTotal * 150;
    const totalCostValue = emailCost + smsCost + waCost;

    // Success Rate
    const totalSuccessRate = 99.85;

    // Latency
    const avgEmailLatency = 88; // ms
    const avgSmsLatency = 2.1; // seconds
    const avgWaLatency = 1.1; // seconds

    return {
      emailTotal,
      smsTotal,
      waTotal,
      total,
      totalCostValue,
      totalSuccessRate,
      avgEmailLatency,
      avgSmsLatency,
      avgWaLatency
    };
  }, [logs, rangeFactor]);

  // Generate date series for charts based on range
  const chartData = useMemo(() => {
    const result: { label: string; email: number; sms: number; whatsapp: number; cost: number }[] = [];
    const count = timeRange === '24h' ? 8 : timeRange === '7d' ? 7 : timeRange === '30d' ? 6 : 6;
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      let label = '';
      if (timeRange === '24h') {
        const h = new Date(now.getTime() - i * 3 * 60 * 60 * 1000);
        label = lang === 'en' 
          ? h.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true })
          : `${h.getHours() % 12 || 12} ${h.getHours() >= 12 ? 'م' : 'ص'}`;
      } else if (timeRange === '7d') {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        label = lang === 'en'
          ? d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })
          : `${d.getDate()} ${['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'][d.getDay()]}`;
      } else {
        const d = new Date(now.getTime() - i * (timeRange === '30d' ? 5 : 15) * 24 * 60 * 60 * 1000);
        label = lang === 'en'
          ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : `${d.getDate()} ${['كانون', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين', 'تشرين2', 'كانون2'][d.getMonth()]}`;
      }

      // Base simulated wave data
      const scale = rangeFactor / (count / 7);
      const email = Math.round((15 + Math.sin(i * 1.2) * 5) * scale);
      const sms = Math.round((28 + Math.cos(i * 0.9) * 8) * scale);
      const whatsapp = Math.round((20 + Math.sin(i * 0.7) * 6) * scale);
      const cost = email * 10 + sms * 120 + whatsapp * 150;

      result.push({ label, email, sms, whatsapp, cost });
    }
    return result;
  }, [timeRange, lang, rangeFactor]);

  // Network shares simulation
  const networkShares = useMemo(() => {
    const totalMobile = stats.smsTotal + stats.waTotal || 1;
    // Zain: ~55%, AsiaCell: ~30%, Korek: ~15%
    const zain = Math.round(totalMobile * 0.54);
    const asiacell = Math.round(totalMobile * 0.31);
    const korek = totalMobile - zain - asiacell;

    return {
      zain,
      asiacell,
      korek,
      zainPercent: Math.round((zain / totalMobile) * 100),
      asiacellPercent: Math.round((asiacell / totalMobile) * 100),
      korekPercent: Math.round((korek / totalMobile) * 100),
    };
  }, [stats]);

  // Email domains simulation
  const emailDomains = useMemo(() => {
    const total = stats.emailTotal || 1;
    const gmail = Math.round(total * 0.65);
    const yahoo = Math.round(total * 0.18);
    const corporate = total - gmail - yahoo;

    return {
      gmail,
      yahoo,
      corporate,
      gmailPercent: Math.round((gmail / total) * 100),
      yahooPercent: Math.round((yahoo / total) * 100),
      corporatePercent: Math.round((corporate / total) * 100),
    };
  }, [stats]);

  // Invoice listing simulation
  const invoices = useMemo(() => {
    return [
      { id: 'INV-2026-05', period: lang === 'en' ? 'May 2026' : 'أيار 2026', volume: 14580, cost: 235450, status: 'paid' },
      { id: 'INV-2026-04', period: lang === 'en' ? 'April 2026' : 'نيسان 2026', volume: 18230, cost: 289900, status: 'paid' },
      { id: 'INV-2026-03', period: lang === 'en' ? 'March 2026' : 'آذار 2026', volume: 12400, cost: 198420, status: 'paid' },
    ];
  }, [lang]);

  const generatePDFFromHTML = async (htmlContent: string, filename: string) => {
    // Create temporary container in the DOM
    // Placing it inside the viewport but invisible/un-interactable forces the browser's
    // layout and text-shaping (bidirectional Arabic layout) engine to shape ligatures properly.
    const container = document.createElement('div');
    container.id = 'pdf-render-container';
    container.style.position = 'fixed';
    container.style.left = '0';
    container.style.top = '0';
    container.style.zIndex = '-9999';
    container.style.opacity = '0'; // Completely invisible to the user
    container.style.pointerEvents = 'none';
    container.style.width = '794px'; // standard A4 pixel width at 96 DPI
    container.style.backgroundColor = '#ffffff';
    container.style.boxSizing = 'border-box';
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    try {
      // Ensure the Cairo and Inter fonts are fully loaded before rendering
      if (document.fonts) {
        await document.fonts.ready;
      }
      
      // Wait for rendering and styles to settle
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const canvas = await html2canvas(container, {
        scale: 2.2, // High resolution crisp output
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedContainer = clonedDoc.getElementById('pdf-render-container');
          if (clonedContainer) {
            clonedContainer.style.opacity = '1'; // Force opaque in the cloned DOM for rendering
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.85); // JPEG compression at 85% quality
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
      
      pdf.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      document.body.removeChild(container);
    }
  };

  const downloadReportLogic = async () => {
    const rangeText = timeRange === '24h' ? '24 Hours' : timeRange === '7d' ? '7 Days' : timeRange === '30d' ? '30 Days' : '90 Days';
    const rangeTextAr = timeRange === '24h' ? '24 ساعة' : timeRange === '7d' ? '7 أيام' : timeRange === '30d' ? '30 يوم' : '90 يوم';
    
    const htmlContent = `
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * {
    box-sizing: border-box;
  }
  .pdf-body {
    font-family: ${lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
    color: #000000;
    background-color: #ffffff;
    padding: 45px;
    direction: ${lang === 'ar' ? 'rtl' : 'ltr'};
    line-height: 1.5;
    margin: 0;
    letter-spacing: normal;
    -webkit-font-smoothing: antialiased;
    width: 794px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 20px;
    margin-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 800;
    color: #000000;
  }
  .brand-logo-box {
    width: 14px;
    height: 14px;
    background-color: #000000;
    border-radius: 3px;
  }
  .badge {
    font-size: 10px;
    font-weight: 700;
    color: #666666;
    background-color: #fafafa;
    border: 1px solid #eaeaea;
    padding: 4px 10px;
    border-radius: 6px;
    text-transform: uppercase;
  }
  .meta-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
    padding: 14px 18px;
    background-color: #fafafa;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    font-size: 11px;
  }
  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .meta-label {
    color: #666666;
    font-weight: 500;
  }
  .meta-value {
    color: #000000;
    font-weight: 700;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .card {
    border: 1px solid rgba(0, 0, 0, 0.06);
    border-radius: 8px;
    padding: 16px 20px;
    background-color: #ffffff;
  }
  .card-label {
    font-size: 10px;
    color: #666666;
    text-transform: uppercase;
    font-weight: 600;
  }
  .card-value {
    font-size: 22px;
    font-weight: 800;
    margin-top: 6px;
    color: #000000;
  }
  .section-title {
    font-size: 13px;
    font-weight: 800;
    color: #000000;
    margin: 0 0 14px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #eaeaea;
    text-transform: uppercase;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 28px;
    font-size: 12px;
  }
  th, td {
    border-bottom: 1px solid #eaeaea;
    padding: 10px 12px;
    text-align: ${lang === 'ar' ? 'right' : 'left'};
  }
  th {
    color: #666666;
    font-weight: 600;
    background-color: #fafafa;
    text-transform: uppercase;
    font-size: 10px;
  }
  td {
    color: #111111;
  }
  .td-primary {
    font-weight: 700;
    color: #000000;
  }
  .analytics-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    margin-bottom: 10px;
  }
  .analytics-col {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .progress-bar-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .progress-bar-label {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 600;
    color: #111111;
  }
  .progress-bar-bg {
    height: 6px;
    background-color: #eaeaea;
    border-radius: 3px;
    overflow: hidden;
    width: 100%;
  }
  .progress-bar-fill {
    height: 100%;
    border-radius: 3px;
  }
  .footer {
    margin-top: 40px;
    font-size: 10px;
    color: #888888;
    text-align: center;
    border-top: 1px solid #eaeaea;
    padding-top: 18px;
    line-height: 1.5;
  }
</style>

<div class="pdf-body">
  <div class="header">
    <div class="brand">
      <span class="brand-logo-box"></span>
      <span>${lang === 'ar' ? 'سومر سيند للمطورين' : 'SUMER SEND'}</span>
    </div>
    <div class="badge">${lang === 'ar' ? 'تقرير تحليلي رسمي' : 'OFFICIAL ANALYTICAL REPORT'}</div>
  </div>
  
  <div class="meta-section">
    <div class="meta-item">
      <span class="meta-label">${lang === 'ar' ? 'الحساب المنسوب له:' : 'Billed Account:'}</span>
      <span class="meta-value">${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">${lang === 'ar' ? 'نطاق التقرير:' : 'Reporting Range:'}</span>
      <span class="meta-value">${lang === 'ar' ? rangeTextAr : rangeText}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">${lang === 'ar' ? 'حالة البوابة:' : 'Gateway Status:'}</span>
      <span class="meta-value" style="color: #28a948;">${lang === 'ar' ? 'نشط (SLA متصل)' : 'ACTIVE (SLA OK)'}</span>
    </div>
    <div class="meta-item">
      <span class="meta-label">${lang === 'ar' ? 'تاريخ التوليد:' : 'Generated Date:'}</span>
      <span class="meta-value">2026-06-20</span>
    </div>
  </div>
  
  <div class="grid">
    ${exportMetrics.volume ? `
    <div class="card">
      <span class="card-label">${lang === 'ar' ? 'إجمالي الإشعارات المرسلة' : 'Total Dispatched'}</span>
      <div class="card-value">${stats.total.toLocaleString()}</div>
    </div>
    ` : ''}
    ${exportMetrics.costs ? `
    <div class="card">
      <span class="card-label">${lang === 'ar' ? 'إجمالي المبالغ المستهلكة' : 'Accumulated Cost'}</span>
      <div class="card-value">${stats.totalCostValue.toLocaleString()} IQD</div>
    </div>
    ` : ''}
    ${exportMetrics.latency ? `
    <div class="card">
      <span class="card-label">${lang === 'ar' ? 'نسبة النجاح العامة' : 'Success Rate'}</span>
      <div class="card-value" style="color: #28a948;">${stats.totalSuccessRate}%</div>
    </div>
    ` : ''}
  </div>

  <div class="section-title">${lang === 'ar' ? 'تفاصيل نشاط واستهلاك القنوات' : 'Channel Activity Breakdown'}</div>
  <table>
    <thead>
      <tr>
        <th>${lang === 'ar' ? 'القناة البرمجية' : 'Channel'}</th>
        <th>${lang === 'ar' ? 'حجم الإرسال الفعلي' : 'Volume'}</th>
        <th>${lang === 'ar' ? 'متوسط التأخير' : 'Avg Latency'}</th>
        <th>${lang === 'ar' ? 'السعر المفرد' : 'Unit Cost'}</th>
        <th>${lang === 'ar' ? 'المجموع المستهلك' : 'Subtotal Spent'}</th>
      </tr>
    </thead>
    <tbody>
      ${exportChannels.email ? `
      <tr>
        <td class="td-primary">${lang === 'ar' ? 'بريد المعاملات (Email API)' : 'Email API Bridge'}</td>
        <td>${stats.emailTotal.toLocaleString()}</td>
        <td>${stats.avgEmailLatency}ms</td>
        <td>10 IQD</td>
        <td class="td-primary">${(stats.emailTotal * 10).toLocaleString()} IQD</td>
      </tr>
      ` : ''}
      ${exportChannels.sms ? `
      <tr>
        <td class="td-primary">${lang === 'ar' ? 'بوابة رسائل التحقق (SMS OTP)' : 'SMS OTP Gateway'}</td>
        <td>${stats.smsTotal.toLocaleString()}</td>
        <td>${stats.avgSmsLatency}s</td>
        <td>120 IQD</td>
        <td class="td-primary">${(stats.smsTotal * 120).toLocaleString()} IQD</td>
      </tr>
      ` : ''}
      ${exportChannels.whatsapp ? `
      <tr>
        <td class="td-primary">${lang === 'ar' ? 'واتساب الأعمال (WA API)' : 'WhatsApp Business API'}</td>
        <td>${stats.waTotal.toLocaleString()}</td>
        <td>${stats.avgWaLatency}s</td>
        <td>150 IQD</td>
        <td class="td-primary">${(stats.waTotal * 150).toLocaleString()} IQD</td>
      </tr>
      ` : ''}
    </tbody>
  </table>

  <div class="analytics-section">
    <div class="analytics-col">
      <div class="section-title">${lang === 'ar' ? 'توزيع شبكات الاتصال الوطنية' : 'Iraqi Telecom Carrier Share'}</div>
      
      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>زين العراق (Zain)</span>
          <span>${networkShares.zainPercent}% (${networkShares.zain.toLocaleString()})</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${networkShares.zainPercent}%; background-color: #ffcc00;"></div>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>آسياسيل (Asiacell)</span>
          <span>${networkShares.asiacellPercent}% (${networkShares.asiacell.toLocaleString()})</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${networkShares.asiacellPercent}%; background-color: #ff3366;"></div>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>كورك تيلكوم (Korek)</span>
          <span>${networkShares.korekPercent}% (${networkShares.korek.toLocaleString()})</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${networkShares.korekPercent}%; background-color: #006bff;"></div>
        </div>
      </div>
    </div>

    <div class="analytics-col">
      <div class="section-title">${lang === 'ar' ? 'توزيع نطاقات المستلمین' : 'Recipient Email Domains share'}</div>
      
      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>Gmail.com</span>
          <span>${emailDomains.gmailPercent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${emailDomains.gmailPercent}%; background-color: #ea4335;"></div>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>Yahoo.com / Outlook.com</span>
          <span>${emailDomains.yahooPercent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${emailDomains.yahooPercent}%; background-color: #6001d2;"></div>
        </div>
      </div>

      <div class="progress-bar-container">
        <div class="progress-bar-label">
          <span>${lang === 'ar' ? 'نطاقات شركات خاصة' : 'Private Corporate Domains'}</span>
          <span>${emailDomains.corporatePercent}%</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${emailDomains.corporatePercent}%; background-color: #111111;"></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    ${lang === 'ar' 
      ? 'تم إنشاء هذا التقرير تلقائياً عبر منصة سومر سيند للإشعارات المتكاملة، بغداد، العراق. © 2026'
      : 'Generated automatically via Sumer Send Gateway Platform, Baghdad, Iraq. © 2026'}
  </div>
</div>
    `;
    
    await generatePDFFromHTML(htmlContent, `sumer_send_report_${timeRange}.pdf`);
  };

  const handleExport = async () => {
    setGeneratingReport(true);
    setExportSuccess(false);
    
    const startEvent = new CustomEvent('sumer-toast', {
      detail: {
        message: lang === 'ar' ? 'جاري توليد تقرير PDF وتحميله برمجياً...' : 'Generating and downloading PDF report...',
        type: 'info',
        duration: 2500
      }
    });
    window.dispatchEvent(startEvent);

    try {
      // Small delay to let spinner show
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Perform the actual PDF generation and download
      await downloadReportLogic();
      
      setExportSuccess(true);
      
      const successEvent = new CustomEvent('sumer-toast', {
        detail: {
          message: lang === 'ar' ? 'تم تنزيل التقرير بصيغة PDF بنجاح!' : 'PDF report downloaded successfully!',
          type: 'success',
          duration: 3000
        }
      });
      window.dispatchEvent(successEvent);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      const errEvent = new CustomEvent('sumer-toast', {
        detail: {
          message: lang === 'ar' ? 'فشل تصدير ملف التقرير.' : 'Failed to export report file.',
          type: 'error',
          duration: 3000
        }
      });
      window.dispatchEvent(errEvent);
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleDownloadReport = async (e: React.MouseEvent) => {
    e.preventDefault();
    await downloadReportLogic();
  };

  const handleDownloadInvoice = async (inv: any) => {
    const htmlContent = `
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  * {
    box-sizing: border-box;
  }
  .pdf-body {
    font-family: ${lang === 'ar' ? "'Cairo', sans-serif" : "'Inter', sans-serif"};
    color: #000000;
    background-color: #ffffff;
    padding: 50px;
    direction: ${lang === 'ar' ? 'rtl' : 'ltr'};
    line-height: 1.5;
    margin: 0;
    letter-spacing: normal;
    -webkit-font-smoothing: antialiased;
    width: 794px;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eaeaea;
    padding-bottom: 20px;
    margin-bottom: 28px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 800;
    color: #000000;
  }
  .brand-logo-box {
    width: 14px;
    height: 14px;
    background-color: #000000;
    border-radius: 3px;
  }
  .invoice-title {
    font-size: 14px;
    font-weight: 800;
    color: #000000;
    text-transform: uppercase;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
    margin-bottom: 36px;
    font-size: 12px;
  }
  .meta-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .meta-title {
    font-weight: 700;
    color: #000000;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .meta-line {
    color: #444444;
    display: flex;
    justify-content: space-between;
  }
  .meta-label {
    color: #666666;
  }
  .meta-value {
    font-weight: 600;
    color: #000000;
  }
  .status-badge {
    display: inline-flex;
    align-items: center;
    background-color: #ecfdf5;
    color: #047857;
    border: 1px solid #a7f3d0;
    font-weight: 700;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 9999px;
    text-transform: uppercase;
    width: fit-content;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 36px;
    font-size: 12px;
  }
  th, td {
    border-bottom: 1px solid #eaeaea;
    padding: 12px 14px;
    text-align: ${lang === 'ar' ? 'right' : 'left'};
  }
  th {
    color: #666666;
    font-weight: 600;
    background-color: #fafafa;
    text-transform: uppercase;
    font-size: 10px;
  }
  td {
    color: #111111;
  }
  .td-primary {
    font-weight: 700;
    color: #000000;
  }
  .total-row td {
    border-top: 2px solid #000000;
    border-bottom: 2px double #000000;
    font-weight: 800;
    font-size: 14px;
    color: #000000;
    background-color: #fafafa;
  }
  .payment-note {
    font-size: 11px;
    color: #666666;
    background-color: #fafafa;
    border: 1px solid #eaeaea;
    border-radius: 6px;
    padding: 12px 16px;
    margin-bottom: 36px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .payment-note-dot {
    width: 6px;
    height: 6px;
    background-color: #28a948;
    border-radius: 50%;
  }
  .footer {
    margin-top: 80px;
    font-size: 10px;
    color: #888888;
    text-align: center;
    border-top: 1px solid #eaeaea;
    padding-top: 18px;
    line-height: 1.5;
  }
</style>

<div class="pdf-body">
  <div class="header">
    <div class="brand">
      <span class="brand-logo-box"></span>
      <span>${lang === 'ar' ? 'بوابة سومر سيند' : 'SUMER SEND GATEWAY'}</span>
    </div>
    <div class="invoice-title">${lang === 'ar' ? 'فاتورة ضريبية رسمية' : 'OFFICIAL BILLING INVOICE'}</div>
  </div>

  <div class="meta-grid">
    <div class="meta-col">
      <div class="meta-title">${lang === 'ar' ? 'مستندة إلى:' : 'Billed To:'}</div>
      <div class="meta-line" style="font-weight: 700; color: #000000;">${lang === 'ar' ? 'جاسم كريم' : 'Jasim Kareem'}</div>
      <div class="meta-line">Baghdad, Iraq</div>
      <div class="meta-line">developer@sumer.send</div>
    </div>
    <div class="meta-col">
      <div class="meta-title">${lang === 'ar' ? 'تفاصيل الفاتورة:' : 'Invoice Details:'}</div>
      <div class="meta-line">
        <span class="meta-label">${lang === 'ar' ? 'رقم الفاتورة:' : 'Invoice No:'}</span>
        <span class="meta-value">${inv.id}</span>
      </div>
      <div class="meta-line">
        <span class="meta-label">${lang === 'ar' ? 'الفترة الزمنية:' : 'Billing Period:'}</span>
        <span class="meta-value">${inv.period}</span>
      </div>
      <div class="meta-line">
        <span class="meta-label">${lang === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</span>
        <span class="status-badge">${lang === 'ar' ? 'مدفوعة' : 'PAID'}</span>
      </div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>${lang === 'ar' ? 'تفاصيل الخدمة والربط' : 'Service Description'}</th>
        <th>${lang === 'ar' ? 'حجم الاستهلاك (الرسائل)' : 'Volume'}</th>
        <th>${lang === 'ar' ? 'إجمالي التكلفة' : 'Amount'}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="td-primary">${lang === 'ar' ? 'إشعارات المراسلات المدمجة (Email, SMS, WA)' : 'Integrated Notification Dispatch Volume'}</td>
        <td>${inv.volume.toLocaleString()}</td>
        <td class="td-primary">${inv.cost.toLocaleString()} IQD</td>
      </tr>
      <tr class="total-row">
        <td colspan="2" style="text-align: ${lang === 'ar' ? 'left' : 'right'};">${lang === 'ar' ? 'المبلغ الإجمالي المستحق:' : 'Total Amount Due:'}</td>
        <td>${inv.cost.toLocaleString()} IQD</td>
      </tr>
    </tbody>
  </table>

  <div class="payment-note">
    <span class="payment-note-dot"></span>
    <span>
      ${lang === 'ar'
        ? 'تمت تسوية هذه الفاتورة تلقائياً وخصمها من الرصيد المتاح للمحفظة عبر (Zain Cash / زين كاش).'
        : 'This invoice has been automatically settled and debited from the active wallet balance via Zain Cash.'}
    </span>
  </div>

  <div class="footer">
    ${lang === 'ar'
      ? 'شكراً لتعاملك مع بوابة سومر سيند. تم تحصيل هذه الفاتورة تلقائياً من رصيد المحفظة. نسخة بغداد.'
      : 'Thank you for choosing Sumer Send. This invoice has been automatically settled via your wallet balance. Baghdad Edition.'}
  </div>
</div>
    `;
    
    const event = new CustomEvent('sumer-toast', {
      detail: {
        message: lang === 'ar' ? `جاري تحميل الفاتورة ${inv.id} بصيغة PDF...` : `Downloading invoice ${inv.id} as PDF...`,
        type: 'success',
        duration: 2500
      }
    });
    window.dispatchEvent(event);
    
    await generatePDFFromHTML(htmlContent, `sumer_send_invoice_${inv.id}.pdf`);
  };

  return (
    <ScrollReveal>
      <div style={{ maxWidth: '1200px', margin: '0 auto', direction: lang === 'ar' ? 'rtl' : 'ltr' }}>
      
      {/* Title & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        {!hideHeader && (
          <div>
            <h1 style={{ 
              fontSize: '26px', 
              fontWeight: 800, 
              letterSpacing: lang === 'ar' ? '0' : '-0.5px', 
              lineHeight: 1.15,
              marginBottom: '0px',
              color: 'var(--text-primary)'
            }}>{t.title}</h1>
          </div>
        )}

        {/* Time Range Selector */}
        <div className="capsule-tab-container">
          {(['24h', '7d', '30d', '90d'] as const).map((range) => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`capsule-tab-btn ${timeRange === range ? 'active' : ''}`}
            >
              {range === '24h' && (lang === 'ar' ? '24 ساعة' : '24h')}
              {range === '7d' && (lang === 'ar' ? '7 أيام' : '7d')}
              {range === '30d' && (lang === 'ar' ? '30 يوم' : '30d')}
              {range === '90d' && (lang === 'ar' ? '90 يوم' : '90d')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Subtabs Navigation */}
      <div className="capsule-tab-container" style={{ marginBottom: '24px' }}>
        <button 
          onClick={() => handleSubTabChange('overview')} 
          className={`capsule-tab-btn ${activeSubTab === 'overview' ? 'active' : ''}`}
        >
          <Activity size={14} style={{ marginInlineEnd: '6px' }} />
          {t.tabOverview}
        </button>
        <button 
          onClick={() => handleSubTabChange('channels')} 
          className={`capsule-tab-btn ${activeSubTab === 'channels' ? 'active' : ''}`}
        >
          <Send size={14} style={{ marginInlineEnd: '6px' }} />
          {t.tabChannels}
        </button>
        <button 
          onClick={() => handleSubTabChange('costs')} 
          className={`capsule-tab-btn ${activeSubTab === 'costs' ? 'active' : ''}`}
        >
          <Wallet size={14} style={{ marginInlineEnd: '6px' }} />
          {t.tabCosts}
        </button>
        <button 
          onClick={() => handleSubTabChange('exports')} 
          className={`capsule-tab-btn ${activeSubTab === 'exports' ? 'active' : ''}`}
        >
          <FileText size={14} style={{ marginInlineEnd: '6px' }} />
          {t.tabExports}
        </button>
        <button 
          onClick={() => handleSubTabChange('audience')} 
          className={`capsule-tab-btn ${activeSubTab === 'audience' ? 'active' : ''}`}
        >
          <Users size={14} style={{ marginInlineEnd: '6px' }} />
          {t.tabAudience}
        </button>
      </div>

      <div className="reports-content-container" key={activeSubTab}>
      {activeSubTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Key Metric Highlight Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            {/* Total Sent */}
            <BentoCard 
              className="dashboard-card bento-metric-card sms-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Send size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.totalSent}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat">{stats.total.toLocaleString()}</span>
                <span className="bento-trend-badge neutral">
                  <span>IQD</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  Email: {stats.emailTotal} • SMS: {stats.smsTotal} • WA: {stats.waTotal}
                </span>
                <button className="bento-details-btn" onClick={() => handleSubTabChange('channels')}>
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
                <span className="bento-value tabular-nums-stat" style={{ color: 'var(--success-color)' }}>{stats.totalSuccessRate}%</span>
                <span className="bento-trend-badge up">
                  <CheckCircle2 size={10} />
                  <span>99%</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'ar' ? 'ضمن حدود الـ SLA' : 'Optimal SLA'}
                </span>
                <button className="bento-details-btn" onClick={() => handleSubTabChange('channels')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>

            {/* Avg Latency */}
            <BentoCard 
              className="dashboard-card bento-metric-card wa-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.avgLatency}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat">
                  1.4 <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>{t.sec}</span>
                </span>
                <span className="bento-trend-badge neutral">
                  <span>Sec</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  Email: {stats.avgEmailLatency}{t.ms} • SMS: {stats.avgSmsLatency}{t.sec}
                </span>
                <button className="bento-details-btn" onClick={() => handleSubTabChange('channels')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>

            {/* Total Cost */}
            <BentoCard 
              className="dashboard-card bento-metric-card email-card" 
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '140px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={15} className="bento-icon" style={{ opacity: 0.8 }} />
                  <span className="bento-header-title">{t.totalCost}</span>
                </div>
                <button className="bento-options-btn">•••</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px', marginBottom: '8px' }}>
                <span className="bento-value tabular-nums-stat" style={{ fontSize: '24px' }}>
                  {stats.totalCostValue.toLocaleString()}{' '}
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>IQD</span>
                </span>
                <span className="bento-trend-badge neutral">
                  <span>IQD</span>
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: 'auto' }}>
                <span className="bento-desc">
                  {lang === 'ar' ? 'بالدينار العراقي' : 'In Iraqi Dinars'}
                </span>
                <button className="bento-details-btn" onClick={() => handleSubTabChange('costs')}>
                  <span>{lang === 'en' ? 'See Details' : 'عرض التفاصيل'}</span>
                  <span>→</span>
                </button>
              </div>
            </BentoCard>
          </div>

          {/* Interactive Comparison Chart Card */}
          <div className="card" style={{ padding: '24px', borderRadius: '8px', overflow: 'visible' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{t.volumeOverTime}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>{t.volumeSub}</p>
            </div>

            {/* Simulated Multi-Line/Bar Chart */}
            <div style={{ width: '100%', overflowX: 'auto', position: 'relative', direction: 'ltr', minHeight: '230px' }}>
              <div style={{ display: 'flex', height: '160px', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', minWidth: '500px' }}>
                {chartData.map((d, idx) => {
                  const total = d.email + d.sms + d.whatsapp || 1;
                  const maxChartVal = Math.max(...chartData.map(cd => cd.email + cd.sms + cd.whatsapp)) * 1.1 || 100;
                  
                  const hEmail = (d.email / maxChartVal) * 140;
                  const hSms = (d.sms / maxChartVal) * 140;
                  const hWa = (d.whatsapp / maxChartVal) * 140;

                  return (
                    <div 
                      key={idx} 
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        flex: 1, 
                        height: '100%', 
                        justifyContent: 'flex-end', 
                        position: 'relative',
                        backgroundColor: hoveredIdx === idx ? 'rgba(var(--accent-rgb), 0.03)' : 'transparent',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      {/* Stacked Bar components */}
                      <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', width: '28px', height: '140px', justifyContent: 'center' }}>
                        <div 
                          style={{ width: '7px', height: `${hEmail}px`, backgroundColor: 'var(--accent-color)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease' }} 
                        />
                        <div 
                          style={{ width: '7px', height: `${hSms}px`, backgroundColor: 'var(--success-color)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease' }} 
                        />
                        <div 
                          style={{ width: '7px', height: `${hWa}px`, backgroundColor: 'var(--channel-whatsapp)', borderRadius: '2px 2px 0 0', transition: 'height 0.3s ease' }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Flexbox HTML Labels underneath to avoid SVG BiDi issues */}
              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '9px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                fontFamily: 'Cairo, system-ui, -apple-system, sans-serif',
                minWidth: '500px'
              }}>
                {chartData.map((d, idx) => (
                  <div 
                    key={idx} 
                    style={{
                      width: '0',
                      display: 'flex',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      direction: lang === 'ar' ? 'rtl' : 'ltr'
                    }}
                  >
                    {d.label}
                  </div>
                ))}
              </div>

              {/* Interactive HTML Tooltip outside SVG */}
              {hoveredIdx !== null && (
                <div style={{
                  position: 'absolute',
                  left: `${((hoveredIdx + 0.5) / chartData.length) * 100}%`,
                  bottom: '180px',
                  transform: 'translateX(-50%)',
                  pointerEvents: 'none',
                  zIndex: 10,
                  backgroundColor: 'var(--panel-bg)',
                  border: '1px solid var(--card-border-color)',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  fontSize: '11px',
                  color: 'var(--text-primary)',
                  minWidth: '145px',
                  direction: lang === 'ar' ? 'rtl' : 'ltr'
                }}>
                  <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '5px' }}>
                    {chartData[hoveredIdx].label}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
                      <span>{lang === 'ar' ? 'البريد:' : 'Email:'}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].email}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                      <span>{lang === 'ar' ? 'SMS:' : 'SMS:'}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].sms}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }}></span>
                      <span>{lang === 'ar' ? 'واتساب:' : 'WhatsApp:'}</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].whatsapp}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Legend */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '16px', fontSize: '11px', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.legendEmail}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.legendSMS}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>{t.legendWA}</span>
              </div>
            </div>
          </div>

          {/* Regional Networks & Domain Share breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* Iraqi Telecom Distribution */}
            <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{t.operatorDist}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Zain Iraq */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>زين العراق (Zain)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{networkShares.zainPercent}% ({networkShares.zain.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${networkShares.zainPercent}%`, backgroundColor: '#ffcc00' }} />
                  </div>
                </div>

                {/* AsiaCell */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>آسياسيل (Asiacell)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{networkShares.asiacellPercent}% ({networkShares.asiacell.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${networkShares.asiacellPercent}%`, backgroundColor: '#ff3366' }} />
                  </div>
                </div>

                {/* Korek */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>كورك تيلكوم (Korek)</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{networkShares.korekPercent}% ({networkShares.korek.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${networkShares.korekPercent}%`, backgroundColor: '#006bff' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Email Domain Share */}
            <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'توزيع نطاقات البريد الإلكتروني للمستقبلين' : 'Recipient Email Domains share'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Gmail */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Gmail.com</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{emailDomains.gmailPercent}% ({emailDomains.gmail.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${emailDomains.gmailPercent}%`, backgroundColor: '#ea4335' }} />
                  </div>
                </div>

                {/* Yahoo */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>Yahoo.com / Outlook.com</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{emailDomains.yahooPercent}% ({emailDomains.yahoo.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${emailDomains.yahooPercent}%`, backgroundColor: '#6001d2' }} />
                  </div>
                </div>

                {/* Corporate */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{lang === 'ar' ? 'نطاقات شركات ومؤسسات (Corporate)' : 'Private Corporate domains'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{emailDomains.corporatePercent}% ({emailDomains.corporate.toLocaleString()})</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${emailDomains.corporatePercent}%`, backgroundColor: 'var(--text-primary)' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Quick actions links */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px', borderInlineStart: '4px solid var(--accent-color)' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 12px 0', color: 'var(--text-primary)' }}>{t.quickIntegration}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              <button onClick={() => setCurrentTab('billing')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'inherit', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }} className="hover-link">
                <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                <span>{t.billingLink}</span>
              </button>
              <button onClick={() => setCurrentTab('domains')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'inherit', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }} className="hover-link">
                <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                <span>{t.domainLink}</span>
              </button>
              <button onClick={() => setCurrentTab('smtp')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'inherit', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }} className="hover-link">
                <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                <span>{t.smtpLink}</span>
              </button>
              <button onClick={() => setCurrentTab('playground')} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'inherit', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }} className="hover-link">
                <ChevronRight size={14} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                <span>{t.playgroundLink}</span>
              </button>
            </div>
          </div>

        </div>
      )}

      {/* CHANNELS BREAKDOWN SUBTAB */}
      {activeSubTab === 'channels' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Email Channel Performance Card */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'قناة البريد الإلكتروني (Email API Bridge)' : 'Email API Bridge channel'}
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#28a948', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--success-bg)' }}>
                {lang === 'ar' ? 'متصل وموثق' : 'DKIM Connected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'حجم الإرسال الفعلي' : 'Delivered Count'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.emailTotal}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'معدل سرعة الوصول (Latency)' : 'Average Dispatch speed'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.avgEmailLatency} {t.ms}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'توثيق سجلات النطاق' : 'Domain Authentication'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#28a948', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> SPF / DKIM
                </div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'السعر الافتراضي' : 'Unit Cost'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>10 {t.iqd}</div>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--panel-muted)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
              <span>{lang === 'ar' ? 'يتم توقيع كافة رسائل المعاملات تلقائياً عبر مفتاح النطاق الموثق لمنع تصنيفها كرسائل غير مرغوب فيها.' : 'All emails are automatically signed via corporate domain key, maintaining 99.9% inbox delivery.'}</span>
            </div>
          </div>

          {/* SMS Channel Performance Card */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'رسائل التفعيل ورموز التحقق (SMS OTP Gateway)' : 'SMS OTP Gateway channel'}
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#28a948', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--success-bg)' }}>
                {lang === 'ar' ? 'الشبكات متصلة' : 'Carriers Connected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'حجم الإرسال الفعلي' : 'Delivered Count'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.smsTotal}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'زمن التوصيل بالشبكات (Latency)' : 'Average network delivery time'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.avgSmsLatency} {t.sec}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'حالة نفق الاتصال المحلي' : 'Carrier tunnels status'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>3/3 Tunnel Nodes</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'السعر الافتراضي' : 'Unit Cost'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>120 {t.iqd}</div>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--panel-muted)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
              <span>{lang === 'ar' ? 'يتم التوجيه المباشر بالاتفاق مع مزودي الاتصالات الرئيسيين (زين، آسياسيل، كورك) لضمان تسليم الـ OTP خلال أقل من 3 ثوان.' : 'Direct tunnels with major carriers (Zain, Asiacell, Korek) guarantee instant OTP popups on target devices.'}</span>
            </div>
          </div>

          {/* WhatsApp Channel Performance Card */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }} />
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'الواتساب التفاعلي للأعمال (WhatsApp Business API)' : 'WhatsApp Business API channel'}
                </h3>
              </div>
              <span style={{ fontSize: '11px', color: '#28a948', fontWeight: 600, padding: '2px 8px', borderRadius: '8px', backgroundColor: 'var(--success-bg)' }}>
                {lang === 'ar' ? 'متصل ونشط' : 'API Node Connected'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'حجم الإرسال الفعلي' : 'Delivered Count'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.waTotal}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'معدل التوصيل الفوري' : 'Average dispatch latency'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{stats.avgWaLatency} {t.sec}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'نسبة القراءة والتفاعل (CTR)' : 'Click-through & Read rate'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#28a948', marginTop: '4px' }}>92.4% Read</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'السعر الافتراضي' : 'Unit Cost'}</span>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>150 {t.iqd}</div>
              </div>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', backgroundColor: 'var(--panel-muted)', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Info size={14} style={{ color: 'var(--text-primary)', flexShrink: 0 }} />
              <span>{lang === 'ar' ? 'يدعم إرسال وسائط تفاعلية متعددة، وأزرار الاستجابة السريعة، وعينات النماذج المسبقة المعتمدة للمؤسسات.' : 'Supports interactive media templates, quick replies, buttons, and verified business template layouts.'}</span>
            </div>
          </div>

        </div>
      )}

      {/* COST & FINANCE SUBTAB */}
      {activeSubTab === 'costs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Cost Allocation Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            
            {/* Spend Breakdown card */}
            <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'توزيع التكاليف على القنوات (IQD)' : 'Cost Allocation by Channel (IQD)'}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Email Costs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{lang === 'ar' ? 'بريد المعاملات (10 د.ع)' : 'Email API (10 IQD)'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{(stats.emailTotal * 10).toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((stats.emailTotal * 10) / stats.totalCostValue) * 100}%`, backgroundColor: 'var(--accent-color)' }} />
                  </div>
                </div>

                {/* SMS Costs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{lang === 'ar' ? 'رسائل الـ SMS الـ (120 د.ع)' : 'SMS OTP (120 IQD)'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{(stats.smsTotal * 120).toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((stats.smsTotal * 120) / stats.totalCostValue) * 100}%`, backgroundColor: 'var(--success-color)' }} />
                  </div>
                </div>

                {/* WA Costs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-primary)' }}>{lang === 'ar' ? 'رسائل الواتساب (150 د.ع)' : 'WhatsApp (150 IQD)'}</span>
                    <span style={{ color: 'var(--text-secondary)' }}>{(stats.waTotal * 150).toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((stats.waTotal * 150) / stats.totalCostValue) * 100}%`, backgroundColor: 'var(--channel-whatsapp)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Wallet Summary card */}
            <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{t.costSummary}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'الرصيد المتبقي الحالي' : 'Available Wallet Balance'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{walletBalance.toLocaleString()} {t.iqd}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'إجمالي ما تم استهلاكه' : 'Accumulated Range Cost'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{stats.totalCostValue.toLocaleString()} {t.iqd}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'عمليات الشحن الناجحة' : 'Successful Wallet Topups'}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{transactions.length} {lang === 'ar' ? 'عمليات شحن' : 'Deposits'}</span>
                </div>
              </div>

              <button 
                onClick={() => setCurrentTab('billing')}
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Wallet size={14} />
                <span>{lang === 'ar' ? 'شحن الرصيد / Zain Cash' : 'Top up Credits / Zain Cash'}</span>
              </button>
            </div>
          </div>

          {/* Transactions Table block */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
              {lang === 'ar' ? 'سجل العمليات المالية الأخيرة للمحفظة' : 'Recent Wallet Transactions'}
            </h3>
            {transactions.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {lang === 'ar' ? 'لا توجد شحنات رصيد مسجلة حتى الآن.' : 'No wallet transaction logs available yet.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="v-table" style={{ fontSize: '12px' }}>
                  <thead>
                    <tr>
                      <th>{lang === 'ar' ? 'المعرف' : 'ID'}</th>
                      <th>{lang === 'ar' ? 'القيمة' : 'Amount'}</th>
                      <th>{lang === 'ar' ? 'الوسيلة' : 'Method'}</th>
                      <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      <th>{lang === 'ar' ? 'التاريخ' : 'Date'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tx.id || `TX-${idx + 1000}`}</td>
                        <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>+{tx.amount.toLocaleString()} {t.iqd}</td>
                        <td>{tx.method || 'Zain Cash'}</td>
                        <td>
                          <span style={{ 
                            fontSize: '10px', 
                            color: 'var(--success-text)', 
                            backgroundColor: 'var(--success-bg)', 
                            padding: '2px 6px', 
                            borderRadius: '8px',
                            fontWeight: 600
                          }}>{lang === 'ar' ? 'ناجحة' : 'Completed'}</span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{tx.date || 'Just now'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* EXPORTS & INVOICES SUBTAB */}
      {activeSubTab === 'exports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Custom PDF Exporter module */}
          <div className="card" style={{ padding: '24px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{t.customReport}</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
              {lang === 'ar' ? 'حدد البيانات والتواريخ المطلوبة لتوليد وتصدير ملف تقارير PDF بتصميم متناسق.' : 'Define dates and variables below to generate custom printed reports for corporate review.'}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {/* Channel Selector */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  {t.selectChannels}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Email Channel */}
                  <div 
                    onClick={() => !generatingReport && setExportChannels({ ...exportChannels, email: !exportChannels.email })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportChannels.email ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportChannels.email 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportChannels.email ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportChannels.email ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportChannels.email ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <Mail size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'بريد المعاملات' : 'Email API Bridge'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'حجم إرسال البريد والـ SMTP' : 'Email API and SMTP gateway traffic'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportChannels.email ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportChannels.email ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportChannels.email && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* SMS Channel */}
                  <div 
                    onClick={() => !generatingReport && setExportChannels({ ...exportChannels, sms: !exportChannels.sms })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportChannels.sms ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportChannels.sms 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportChannels.sms ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportChannels.sms ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportChannels.sms ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <MessageSquare size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'رسائل الـ SMS والتحقق' : 'SMS OTP Gateway'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'رسائل الـ SMS الثنائية والمحلية' : 'SMS verification and carrier gateway logs'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportChannels.sms ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportChannels.sms ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportChannels.sms && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* WhatsApp Channel */}
                  <div 
                    onClick={() => !generatingReport && setExportChannels({ ...exportChannels, whatsapp: !exportChannels.whatsapp })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportChannels.whatsapp ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportChannels.whatsapp 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportChannels.whatsapp ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportChannels.whatsapp ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportChannels.whatsapp ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <MessageCircle size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'الواتساب للأعمال' : 'WhatsApp Business API'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'حملات وسحابة الواتساب للأعمال' : 'WhatsApp Cloud API interactions'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportChannels.whatsapp ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportChannels.whatsapp ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportChannels.whatsapp && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                </div>
              </div>

              {/* Metrics selector */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '12px', letterSpacing: '0.05em' }}>
                  {t.selectMetrics}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Volume Metric */}
                  <div 
                    onClick={() => !generatingReport && setExportMetrics({ ...exportMetrics, volume: !exportMetrics.volume })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportMetrics.volume ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportMetrics.volume 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportMetrics.volume ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportMetrics.volume ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportMetrics.volume ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <TrendingUp size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'حجم تدفق الرسائل والإرسال' : 'Sending Volume & Success'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'مخطط حجم الحركة ومعدلات التسليم' : 'Total delivery rate & traffic analytics'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportMetrics.volume ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportMetrics.volume ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportMetrics.volume && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Costs Metric */}
                  <div 
                    onClick={() => !generatingReport && setExportMetrics({ ...exportMetrics, costs: !exportMetrics.costs })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportMetrics.costs ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportMetrics.costs 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportMetrics.costs ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportMetrics.costs ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportMetrics.costs ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <Wallet size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'التكاليف والمصروفات المالية' : 'Financial Spend & Invoices'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'الإنفاق بالدينار والخصومات التراكمية' : 'Billed costs and wallet spend records'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportMetrics.costs ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportMetrics.costs ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportMetrics.costs && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                  {/* Latency Metric */}
                  <div 
                    onClick={() => !generatingReport && setExportMetrics({ ...exportMetrics, latency: !exportMetrics.latency })}
                    className="report-choice-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      cursor: generatingReport ? 'not-allowed' : 'pointer',
                      border: exportMetrics.latency ? '1.5px solid #10b981' : '1px solid var(--border-color)',
                      background: exportMetrics.latency 
                        ? 'var(--report-choice-active-bg)' 
                        : 'var(--report-choice-bg)',
                      color: exportMetrics.latency ? '#10b981' : 'var(--text-primary)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: exportMetrics.latency ? 'rgba(16, 185, 129, 0.12)' : 'var(--panel-muted)',
                      color: exportMetrics.latency ? '#10b981' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      <Clock size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexGrow: 1, textAlign: 'start' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'معدلات السرعة والاستجابة (SLA)' : 'Dispatch Latency & SLA Metrics'}
                      </span>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                        {lang === 'ar' ? 'أزمنة التأخير وتوصيل رموز الـ OTP' : 'Average transit delays and SLA performance'}
                      </span>
                    </div>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '5px',
                      border: exportMetrics.latency ? '2px solid #10b981' : '2px solid var(--border-color)',
                      background: exportMetrics.latency ? '#10b981' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}>
                      {exportMetrics.latency && <Check size={11} strokeWidth={3} />}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={handleExport}
                disabled={generatingReport || (!exportChannels.email && !exportChannels.sms && !exportChannels.whatsapp)}
                className="btn btn-primary"
                style={{ 
                  width: 'fit-content', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: (generatingReport || (!exportChannels.email && !exportChannels.sms && !exportChannels.whatsapp)) ? 0.6 : 1,
                  cursor: (generatingReport || (!exportChannels.email && !exportChannels.sms && !exportChannels.whatsapp)) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {generatingReport ? (
                  <span className="btn-spinner" />
                ) : (
                  <Download size={15} />
                )}
                <span>{generatingReport ? (lang === 'ar' ? 'جاري التوليد والتحميل...' : 'Generating & Downloading...') : (lang === 'ar' ? 'توليد وتحميل تقرير PDF مخصص' : 'Generate & Download Custom PDF')}</span>
              </button>
            </div>
          </div>

          {/* Invoices List block */}
          <div className="card" style={{ padding: '20px', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>{t.invoiceList}</h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="v-table" style={{ fontSize: '12px' }}>
                <thead>
                  <tr>
                    <th>{lang === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}</th>
                    <th>{lang === 'ar' ? 'الفترة الزمنية' : 'Billing Period'}</th>
                    <th>{lang === 'ar' ? 'حجم الاستهلاك' : 'Message Volume'}</th>
                    <th>{lang === 'ar' ? 'التكلفة الإجمالية' : 'Invoice Cost'}</th>
                    <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th style={{ textAlign: 'center' }}>{lang === 'ar' ? 'الإجراء' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.id}</td>
                      <td>{inv.period}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{inv.volume.toLocaleString()} {lang === 'ar' ? 'رسالة' : 'msgs'}</td>
                      <td style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{inv.cost.toLocaleString()} {t.iqd}</td>
                      <td>
                        <span style={{ 
                          fontSize: '10px', 
                          color: 'var(--success-text)', 
                          backgroundColor: 'var(--success-bg)', 
                          padding: '2px 6px', 
                          borderRadius: '8px',
                          fontWeight: 600
                        }}>{lang === 'ar' ? 'مدفوعة' : 'Paid'}</span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDownloadInvoice(inv)}
                          className="btn" 
                          style={{ padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Download size={12} />
                          <span>{t.download}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'audience' && (() => {
        const sortedSubscribers = [...subscribers].sort((a, b) => new Date(a.createdAt || a.created_at).getTime() - new Date(b.createdAt || b.created_at).getTime());
        const dailyTotals: Record<string, number> = {};
        sortedSubscribers.forEach(s => {
          const dateStr = new Date(s.createdAt || s.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
          dailyTotals[dateStr] = (dailyTotals[dateStr] || 0) + 1;
        });

        let runningTotal = 0;
        const growthData = Object.entries(dailyTotals).map(([date, val]) => {
          runningTotal += val as number;
          return { date, count: runningTotal };
        });

        const recentActivity = [...subscribers].sort((a, b) => new Date(b.createdAt || b.created_at).getTime() - new Date(a.createdAt || a.created_at).getTime());
        const filteredSubs = recentActivity.filter(s => {
          if (!subsSearchQuery.trim()) return true;
          const q = subsSearchQuery.toLowerCase();
          return (
            (s.email && s.email.toLowerCase().includes(q)) || 
            (s.name && s.name.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q)) ||
            (s.status && s.status.toLowerCase().includes(q))
          );
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Top Level Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              <BentoCard className="dashboard-card bento-metric-card sms-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={15} style={{ opacity: 0.8 }} />
                    <span className="bento-header-title">{lang === 'ar' ? 'إجمالي قاعدة الاتصال' : 'Total Audience'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                  <div className="bento-value" style={{ fontSize: '28px', fontWeight: 800 }}>{subscribers.length}</div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>100%</span>
                </div>
              </BentoCard>

              <BentoCard className="dashboard-card bento-metric-card email-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} style={{ opacity: 0.8 }} />
                    <span className="bento-header-title">{lang === 'ar' ? 'المشتركون النشطون' : 'Active Subscribers'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                  <div className="bento-value" style={{ fontSize: '28px', fontWeight: 800 }}>{subscribers.filter(s => s.status === 'active').length}</div>
                  <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>
                    {subscribers.length > 0 ? ((subscribers.filter(s => s.status === 'active').length / subscribers.length) * 100).toFixed(0) : '0'}%
                  </span>
                </div>
              </BentoCard>

              <BentoCard className="dashboard-card bento-metric-card wa-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '130px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={15} style={{ opacity: 0.8 }} />
                    <span className="bento-header-title">{lang === 'ar' ? 'الملغى اشتراكهم' : 'Unsubscribed'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '12px' }}>
                  <div className="bento-value" style={{ fontSize: '28px', fontWeight: 800 }}>{subscribers.filter(s => s.status === 'unsubscribed').length}</div>
                  <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 600 }}>
                    {subscribers.length > 0 ? ((subscribers.filter(s => s.status === 'unsubscribed').length / subscribers.length) * 100).toFixed(0) : '0'}%
                  </span>
                </div>
              </BentoCard>
            </div>

            {/* Charts Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
              {/* SVG Growth Chart */}
              <div className="card" style={{ padding: '24px', borderRadius: '8px', overflow: 'visible' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'منحنى نمو قاعدة المشتركين' : 'Audience Growth Trend'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                  {lang === 'ar' ? 'متابعة الزيادة التراكمية في أعداد المشتركين.' : 'Cumulative growth of subscribers over time.'}
                </p>

                {growthData.length > 0 ? (() => {
                  const maxVal = Math.max(...growthData.map(d => d.count)) * 1.15 || 10;
                  const points = growthData.map((d, idx) => {
                    const x = growthData.length > 1 ? (idx / (growthData.length - 1)) * 100 : 50;
                    const y = 100 - (d.count / maxVal) * 100;
                    return `${x},${y}`;
                  }).join(' ');

                  return (
                    <div style={{ position: 'relative', width: '100%', direction: 'ltr' }}>
                      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '160px', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.00"/>
                          </linearGradient>
                        </defs>
                        <path
                          d={`M0,100 L${points} L100,100 Z`}
                          fill="url(#chartGrad)"
                          style={{ transition: 'all 0.3s ease' }}
                        />
                        <polyline
                          fill="none"
                          stroke="var(--accent-color)"
                          strokeWidth="2"
                          points={points}
                          style={{ transition: 'all 0.3s ease' }}
                        />
                        <line x1="0" y1="50" x2="100" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3" />
                        <line x1="0" y1="0" x2="100" y2="0" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3" />
                      </svg>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                        <span>{growthData[0]?.date}</span>
                        <span>{growthData[Math.floor(growthData.length / 2)]?.date}</span>
                        <span>{growthData[growthData.length - 1]?.date}</span>
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {lang === 'ar' ? 'لا تتوفر بيانات نمو كافية حتى الآن.' : 'No growth data available yet.'}
                  </div>
                )}
              </div>

              {/* Entrypoints progress card */}
              <div className="card" style={{ padding: '24px', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                  {lang === 'ar' ? 'مصادر الاشتراكات' : 'Subscription Entrypoints'}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px 0' }}>
                  {lang === 'ar' ? 'توزيع المشتركين حسب وسيلة التسجيل في النظام.' : 'Distribution of audience by signup method.'}
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { key: 'hosted_page', nameAr: 'الصفحة المخصصة (Hosted Page)', nameEn: 'Hosted Opt-in Page', color: 'var(--accent-color)' },
                    { key: 'embed_form', nameAr: 'النموذج المضمن (Embed Form)', nameEn: 'Embedded Forms', color: 'var(--success-color)' },
                    { key: 'manual', nameAr: 'إضافة يدوية', nameEn: 'Manual Admin Add', color: 'var(--channel-whatsapp)' },
                    { key: 'import', nameAr: 'استيراد ملف (Excel/CSV)', nameEn: 'Bulk Import', color: '#f59e0b' },
                    { key: 'api', nameAr: 'الربط البرمجي (API Gateway)', nameEn: 'Direct API Access', color: '#8b5cf6' }
                  ].map(src => {
                    const count = subscribers.filter(s => (s.metadata?.source || 'unknown') === src.key).length;
                    const percent = subscribers.length > 0 ? Math.round((count / subscribers.length) * 100) : 0;
                    return (
                      <div key={src.key}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 500 }}>{lang === 'ar' ? src.nameAr : src.nameEn}</span>
                          <span style={{ color: 'var(--text-secondary)' }}>{count} ({percent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${percent}%`, height: '100%', backgroundColor: src.color, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Subscriber Activity Logs */}
            <div className="card" style={{ padding: '24px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    {lang === 'ar' ? 'سجل حركات المشتركين (المشتركون والملغون)' : 'Recent Subscription Activity Logs'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    {lang === 'ar' ? 'استعراض من اشترك ومن ألغى الاشتراك وتفاصيل العمليات.' : 'Audit logs of who joined and who unsubscribed.'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'البحث بالبريد الإلكتروني أو الاسم...' : 'Search by email or name...'}
                  value={subsSearchQuery}
                  onChange={(e) => setSubsSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--panel-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    maxWidth: '240px',
                    width: '100%'
                  }}
                />
              </div>

              {subsLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'جاري تحميل سجلات المشتركين...' : 'Loading subscriber audit logs...'}
                </div>
              ) : filteredSubs.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table className="v-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th>{lang === 'ar' ? 'الاسم' : 'Name'}</th>
                        <th>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</th>
                        <th>{lang === 'ar' ? 'قناة المصدر' : 'Source'}</th>
                        <th>{lang === 'ar' ? 'التاريخ والوقت' : 'Timestamp'}</th>
                        <th>{lang === 'ar' ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubs.map((sub, idx) => {
                        const dateFormatted = new Date(sub.createdAt || sub.created_at).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
                        const sourceName = sub.metadata?.source || 'unknown';
                        const badgeBg = sub.status === 'active' ? 'var(--success-bg)' : 'var(--error-bg)';
                        const badgeText = sub.status === 'active' ? 'var(--success-text)' : 'var(--error-text)';
                        
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.name || '—'}</td>
                            <td>{sub.email}</td>
                            <td style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                              {sourceName.replace('_', ' ')}
                            </td>
                            <td>{dateFormatted}</td>
                            <td>
                              <span style={{ 
                                fontSize: '10px', 
                                color: badgeText, 
                                backgroundColor: badgeBg, 
                                padding: '2px 8px', 
                                borderRadius: '8px',
                                fontWeight: 600
                              }}>
                                {sub.status === 'active' ? (lang === 'ar' ? 'مشترك نشط' : 'Subscribed') : (lang === 'ar' ? 'إلغاء الاشتراك' : 'Unsubscribed')}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No activity logs found matching the filter.'}
                </div>
              )}
            </div>
          </div>
        );
      })()}
      </div>
      </div>
    </ScrollReveal>
  );
};
