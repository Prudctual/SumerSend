import React from 'react';
import { Mail, MessageSquare, Phone, TrendingUp, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, X, Sparkles, Plus } from 'lucide-react';
import { ScrollReveal, BentoCard } from './LandingView';

interface DashboardViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  setCurrentTab: (tab: string) => void;
  domains?: any[];
  apiKeys?: any[];
  walletBalance?: number;
  transactions?: any[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
  lang, 
  logs, 
  setCurrentTab,
  domains = [],
  apiKeys = [],
  walletBalance = 0,
  transactions = []
}) => {
  const [showStepsAnyway, setShowStepsAnyway] = React.useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = React.useState(() => {
    return localStorage.getItem('sumer_onboarding_dismissed_v2') === 'true';
  });

  const step1Done = domains.length > 0 && domains.every((d: any) => d.status === 'verified');
  const step2Done = transactions.length > 1;
  const step3Done = apiKeys.length > 1;
  const step4Done = logs.length > 3;

  let completedSteps = 0;
  if (step1Done) completedSteps++;
  if (step2Done) completedSteps++;
  if (step3Done) completedSteps++;
  if (step4Done) completedSteps++;
  const progressPercent = Math.round((completedSteps / 4) * 100);

  const nextStep = !step1Done ? 1 : (!step2Done ? 2 : (!step3Done ? 3 : (!step4Done ? 4 : 0)));
  const [activeStep, setActiveStep] = React.useState<number>(nextStep > 0 ? nextStep - 1 : 0);

  React.useEffect(() => {
    if (nextStep > 0) {
      setActiveStep(nextStep - 1);
    }
  }, [nextStep]);

  React.useEffect(() => {
    if (step1Done && step2Done && step3Done && step4Done) {
      const hasCelebrated = localStorage.getItem('sumer_onboarding_celebrated');
      if (!hasCelebrated) {
        localStorage.setItem('sumer_onboarding_celebrated', 'true');
        window.dispatchEvent(new CustomEvent('sumer-success-screen'));
      }
    } else {
      localStorage.removeItem('sumer_onboarding_celebrated');
    }
  }, [step1Done, step2Done, step3Done, step4Done]);

  const onboardingSteps = [
    {
      id: 1,
      titleAr: 'توثيق النطاق',
      titleEn: 'Domain Verification',
      descAr: 'قم بتفعيل النطاق المعلق (DNS) لتمكين توقيع البريد وإرسال موثوق.',
      descEn: 'Verify your pending domain DNS to enable digital signing (DKIM/SPF) for secure deliverability.',
      isDone: step1Done,
      actionTab: 'domains',
      actionTextAr: 'ربط النطاق',
      actionTextEn: 'Verify Domain',
    },
    {
      id: 2,
      titleAr: 'شحن رصيد المحفظة',
      titleEn: 'Deposit Credits',
      descAr: 'قم بعملية شحن المحفظة عبر بوابة زين كاش لتغطية تكاليف الإرسال والـ API.',
      descEn: 'Top up your account wallet via Zain Cash gateway to cover carrier API transmission fees.',
      isDone: step2Done,
      actionTab: 'billing',
      actionTextAr: 'شحن الآن',
      actionTextEn: 'Top-up Wallet',
    },
    {
      id: 3,
      titleAr: 'توليد مفتاح API',
      titleEn: 'Create API Key',
      descAr: 'أضف مفتاح API مخصص لربطه بتطبيقاتك البرمجية والبدء بالإرسال التلقائي.',
      descEn: 'Generate a secure API key to authenticate and connect your backend services.',
      isDone: step3Done,
      actionTab: 'api',
      actionTextAr: 'توليد مفتاح',
      actionTextEn: 'Generate Key',
    },
    {
      id: 4,
      titleAr: 'إرسال أول اختبار',
      titleEn: 'Send Test API',
      descAr: 'أرسل رسالة تجريبية من منصة الاختبار لترى وصولها الفوري إلى الهاتف.',
      descEn: 'Send a sandbox test notification in the playground to check instant delivery.',
      isDone: step4Done,
      actionTab: 'playground',
      actionTextAr: 'منصة الاختبار',
      actionTextEn: 'Go to Playground',
    }
  ];

  const translations = {
    en: {
      title: 'System Overview',
      subtitle: 'Real-time metrics for your Iraqi developer API suite.',
      totalEmails: 'Emails Delivered',
      totalSMS: 'SMS Delivered',
      totalWA: 'WhatsApp Sent',
      deliveryRate: 'Delivery Rate',
      recentActivity: 'Recent Sends Activity',
      channel: 'Channel',
      recipient: 'Recipient',
      status: 'Status',
      time: 'Time',
      operatorStats: 'Iraqi Telecom Networks Share',
      noActivity: 'No message logs found. Go to Playground to send some!',
      welcomeTitle: 'Sumer Send Quick Start Guide',
      welcomeSubtitle: 'Follow these 4 simple steps to test the developer notification suite:',
      step1: 'Link & Verify Domain: Add your domain name (e.g. shop.iq) in the Domains tab and check DNS.',
      step2: 'Top up Wallet: Load simulated credits to cover email (10 IQD), SMS (120 IQD), or WhatsApp (150 IQD) sending fees.',
      step3: 'Compose & Simulate: Use the Playground console to send test messages and watch them trigger phone popups.',
      step4: 'Integrate SDK: Copy the generated code block in Node.js, Python, or cURL directly into your server code.',
    },
    ar: {
      title: 'نظرة عامة على النظام',
      subtitle: 'إحصائيات فورية ولقطات أداء لبوابة الإشعارات العراقية الخاصة بك.',
      totalEmails: 'البريد الإلكتروني المرسل',
      totalSMS: 'رسائل الـ SMS المرسلة',
      totalWA: 'رسائل الواتساب المرسلة',
      deliveryRate: 'نسبة النجاح والتوصيل',
      recentActivity: 'آخر عمليات الإرسال والأنشطة',
      channel: 'القناة',
      recipient: 'المستقبل',
      status: 'الحالة',
      time: 'الوقت',
      operatorStats: 'إحصائيات شبكات الاتصال العراقية',
      noActivity: 'لا توجد سجلات حالية. توجه لمنصة الاختبار لإرسال رسائلك الأولى!',
      welcomeTitle: 'دليل البدء السريع لبوابة سومر سيند',
      welcomeSubtitle: 'اتبع الخطوات الأربع البسيطة التالية لتجربة واختبار نظام إرسال الإشعارات بالكامل:',
      step1: 'ربط وتفعيل النطاق: أضف نطاق موقعك (مثل shop.iq) في تبويب النطاقات ثم اضغط "تحقق" لتفعيله.',
      step2: 'شحن رصيد المحفظة: قم بشحن رصيدك لتغطية تكاليف الإرسال (البريد: 10 د.ع، SMS: 120 د.ع، الواتساب: 150 د.ع).',
      step3: 'الإرسال والمحاكاة: استخدم منصة الاختبار لإرسال رسائل تجريبية ومشاهدتها حياً على محاكي الموبايل.',
      step4: 'دمج الشفرة البرمجية: انسخ كود الـ SDK الجاهز (Node.js أو Python) وألصقه مباشرة في خادمك لربط الـ API.',
    },
  };

  const t = translations[lang];

  // State variables for interactive chart
  const [timeRange, setTimeRange] = React.useState<'24h' | '7d' | '30d'>('7d');
  const [showEmail, setShowEmail] = React.useState(true);
  const [showSms, setShowSms] = React.useState(true);
  const [showWhatsapp, setShowWhatsapp] = React.useState(true);
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  // State variables for interactive calendar strip
  const [selectedDayIdx, setSelectedDayIdx] = React.useState<number>(3); // Default to today (index 3)

  const calendarDays = React.useMemo(() => {
    const days = [];
    const now = new Date();
    // Generate 5 days: 3 days prior, today (index 3), and tomorrow (index 4)
    for (let i = -3; i <= 1; i++) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
      days.push({
        num: d.getDate(),
        name: d.toLocaleDateString(lang === 'en' ? 'en-US' : 'ar-IQ', { weekday: 'short' }),
        isToday: i === 0,
        date: d
      });
    }
    return days;
  }, [lang]);

  // Calculate stats based on logs
  const emailCount = logs.filter(log => log.type === 'email' && log.status === 'delivered').length;
  const smsCount = logs.filter(log => log.type === 'sms' && log.status === 'delivered').length;
  const waCount = logs.filter(log => log.type === 'whatsapp' && log.status === 'delivered').length;
  
  const totalSent = logs.length;
  const totalDelivered = logs.filter(log => log.status === 'delivered').length;
  const deliveryRateValue = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;

  const emailTotal = logs.filter(log => log.type === 'email').length;
  const smsTotal = logs.filter(log => log.type === 'sms').length;
  const waTotal = logs.filter(log => log.type === 'whatsapp').length;

  const emailSuccessRate = emailTotal > 0 ? Math.round((emailCount / emailTotal) * 100) : 100;
  const smsSuccessRate = smsTotal > 0 ? Math.round((smsCount / smsTotal) * 100) : 100;
  const waSuccessRate = waTotal > 0 ? Math.round((waCount / waTotal) * 100) : 100;

  // Simulate operator stats based on Iraqi phone number prefixes
  // Zain: 078, 077
  // AsiaCell: 077
  // Korek: 075
  const getOperatorCounts = () => {
    let zain = 0, asiacell = 0, korek = 0;
    logs.forEach(log => {
      if (log.type === 'sms' || log.type === 'whatsapp') {
        const phone = log.to || '';
        if (phone.includes('78') || phone.includes('79')) zain++;
        else if (phone.includes('77')) asiacell++;
        else if (phone.includes('75')) korek++;
        else zain++; // fallback
      }
    });
    return { zain, asiacell, korek };
  };

  const operators = getOperatorCounts();
  const totalMobile = operators.zain + operators.asiacell + operators.korek || 1;

  const zainPercent = Math.round((operators.zain / totalMobile) * 100);
  const asiacellPercent = Math.round((operators.asiacell / totalMobile) * 100);
  const korekPercent = Math.round((operators.korek / totalMobile) * 100);

  // Generate last 7 days, 30 days, or 24 hours metrics for chart
  const chartData = React.useMemo(() => {
    const result: { dateStr: string, email: number, sms: number, whatsapp: number }[] = [];
    const now = new Date();

    const getFormatDateStr = (d: Date) => {
      if (lang === 'en') {
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      const monthsAr = [
        'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران',
        'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'
      ];
      return `${d.getDate()} ${monthsAr[d.getMonth()]}`;
    };

    const getFormatTimeStr = (d: Date) => {
      if (lang === 'en') {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      let hours = d.getHours();
      const minutes = d.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'م' : 'ص';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${hours}:${minutes} ${ampm}`;
    };

    if (timeRange === '24h') {
      const intervals = 12; // every 2 hours
      for (let i = intervals - 1; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 2 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);

        const hourOfDay = end.getHours();
        const activityFactor = Math.sin((hourOfDay - 6) / 24 * 2 * Math.PI) * 0.3 + 0.7; // 0.4 to 1.0 peak afternoon
        
        const baseEmail = Math.round((7 + Math.sin((11 - i) * 0.8) * 3) * activityFactor);
        const baseSms = Math.round((15 + Math.cos((11 - i) * 0.7) * 5) * activityFactor);
        const baseWhatsapp = Math.round((10 + Math.sin((11 - i) * 0.5) * 4) * activityFactor);

        const periodLogs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= start && logDate < end;
        });

        const realEmail = periodLogs.filter(l => l.type === 'email' && l.status === 'delivered').length;
        const realSms = periodLogs.filter(l => l.type === 'sms' && l.status === 'delivered').length;
        const realWhatsapp = periodLogs.filter(l => l.type === 'whatsapp' && l.status === 'delivered').length;

        const dateStr = getFormatTimeStr(end);

        result.push({
          dateStr,
          email: baseEmail + realEmail,
          sms: baseSms + realSms,
          whatsapp: baseWhatsapp + realWhatsapp
        });
      }
    } else if (timeRange === '7d') {
      const days = 7;
      const baseline = [
        { email: 12, sms: 25, whatsapp: 18 },
        { email: 19, sms: 34, whatsapp: 22 },
        { email: 15, sms: 28, whatsapp: 30 },
        { email: 22, sms: 45, whatsapp: 35 },
        { email: 30, sms: 41, whatsapp: 28 },
        { email: 25, sms: 38, whatsapp: 40 },
        { email: 0, sms: 0, whatsapp: 0 }
      ];

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = getFormatDateStr(d);

        const dayLogs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.getDate() === d.getDate() &&
                 logDate.getMonth() === d.getMonth() &&
                 logDate.getFullYear() === d.getFullYear();
        });

        const realEmail = dayLogs.filter(l => l.type === 'email' && l.status === 'delivered').length;
        const realSms = dayLogs.filter(l => l.type === 'sms' && l.status === 'delivered').length;
        const realWhatsapp = dayLogs.filter(l => l.type === 'whatsapp' && l.status === 'delivered').length;

        const base = baseline[6 - i] || { email: 0, sms: 0, whatsapp: 0 };

        result.push({
          dateStr,
          email: base.email + realEmail,
          sms: base.sms + realSms,
          whatsapp: base.whatsapp + realWhatsapp
        });
      }
    } else { // 30d
      const days = 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const dateStr = getFormatDateStr(d);

        const baseEmail = Math.round(14 + Math.sin((29 - i) * 0.4) * 6 + ((29 - i) % 3) * 2);
        const baseSms = Math.round(28 + Math.cos((29 - i) * 0.35) * 11 + ((29 - i) % 4) * 3);
        const baseWhatsapp = Math.round(18 + Math.sin((29 - i) * 0.25) * 8 + ((29 - i) % 5) * 3);

        const dayLogs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate.getDate() === d.getDate() &&
                 logDate.getMonth() === d.getMonth() &&
                 logDate.getFullYear() === d.getFullYear();
        });

        const realEmail = dayLogs.filter(l => l.type === 'email' && l.status === 'delivered').length;
        const realSms = dayLogs.filter(l => l.type === 'sms' && l.status === 'delivered').length;
        const realWhatsapp = dayLogs.filter(l => l.type === 'whatsapp' && l.status === 'delivered').length;

        const finalBaseEmail = i === 0 ? 0 : baseEmail;
        const finalBaseSms = i === 0 ? 0 : baseSms;
        const finalBaseWhatsapp = i === 0 ? 0 : baseWhatsapp;

        result.push({
          dateStr,
          email: finalBaseEmail + realEmail,
          sms: finalBaseSms + realSms,
          whatsapp: finalBaseWhatsapp + realWhatsapp
        });
      }
    }

    return result;
  }, [logs, lang, timeRange]);

  const width = 600;
  const height = 220;
  const paddingX = 45;
  const paddingY = 25;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  // Auto-scale chart vertical height depending on toggled channels
  const maxVal = React.useMemo(() => {
    const max = Math.max(
      ...chartData.map(d => {
        const valEmail = showEmail ? d.email : 0;
        const valSms = showSms ? d.sms : 0;
        const valWhatsapp = showWhatsapp ? d.whatsapp : 0;
        return Math.max(valEmail, valSms, valWhatsapp);
      })
    );
    return max > 0 ? max * 1.25 : 50;
  }, [chartData, showEmail, showSms, showWhatsapp]);

  const getPoints = (key: 'email' | 'sms' | 'whatsapp') => {
    return chartData.map((d, index) => {
      const x = paddingX + (index * chartWidth) / (chartData.length - 1);
      const y = height - paddingY - (d[key] / maxVal) * chartHeight;
      return { x, y };
    });
  };

  const emailPoints = getPoints('email');
  const smsPoints = getPoints('sms');
  const whatsappPoints = getPoints('whatsapp');

  // Interpolate cubic splines for paths
  const makeSmoothPathStr = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cp1x = p0.x + (p1.x - p0.x) / 3;
      const cp1y = p0.y;
      const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
      const cp2y = p1.y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };
  
  const makeSmoothAreaPathStr = (points: { x: number, y: number }[]) => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${makeSmoothPathStr(points)} L ${last.x} ${height - paddingY} L ${first.x} ${height - paddingY} Z`;
  };

  // Calculate stats dynamically for secondary headers
  const totalVolume = React.useMemo(() => {
    return chartData.reduce((acc, curr) => {
      return acc + (showEmail ? curr.email : 0) + (showSms ? curr.sms : 0) + (showWhatsapp ? curr.whatsapp : 0);
    }, 0);
  }, [chartData, showEmail, showSms, showWhatsapp]);

  const avgVolume = Math.round(totalVolume / chartData.length);

  const peakVolume = React.useMemo(() => {
    const vals = chartData.map(d => (showEmail ? d.email : 0) + (showSms ? d.sms : 0) + (showWhatsapp ? d.whatsapp : 0));
    return vals.length > 0 ? Math.max(...vals) : 0;
  }, [chartData, showEmail, showSms, showWhatsapp]);

  // Handle hover index selection
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    
    const svgX = (clientX / rect.width) * width;
    const colWidth = chartWidth / (chartData.length - 1);
    const relativeX = svgX - paddingX;
    
    let index = Math.round(relativeX / colWidth);
    if (index < 0) index = 0;
    if (index >= chartData.length) index = chartData.length - 1;
    
    setHoveredIdx(index);
  };

  // Calculate dynamic y position of tooltip based on visible data points
  const getAverageTooltipY = () => {
    if (hoveredIdx === null) return height / 2;
    const activeY: number[] = [];
    if (showEmail && emailPoints[hoveredIdx]) activeY.push(emailPoints[hoveredIdx].y);
    if (showSms && smsPoints[hoveredIdx]) activeY.push(smsPoints[hoveredIdx].y);
    if (showWhatsapp && whatsappPoints[hoveredIdx]) activeY.push(whatsappPoints[hoveredIdx].y);
    
    if (activeY.length === 0) return height / 2;
    return activeY.reduce((sum, v) => sum + v, 0) / activeY.length;
  };
  const renderOnboardingChecklist = () => {
    return (
      <>
      {(!onboardingDismissed || showStepsAnyway) && (
        progressPercent === 100 && !showStepsAnyway ? (
          <div className="dashboard-card" style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '24px',
            borderRadius: '24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '150px', height: '150px', background: 'var(--success-color)', opacity: 0.04, borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                color: 'var(--success-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                <Sparkles size={24} style={{ color: 'var(--success-color)' }} />
              </div>
              <div style={{ flex: 1, minWidth: '280px', textAlign: 'start' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span>{lang === 'ar' ? 'تهانينا! حساب المطور الخاص بك نشط وجاهز للإنتاج' : 'Congratulations! Your developer account is fully configured'}</span>
                  <span className="sumer-badge success" style={{ padding: '2px 8px', fontSize: '11px' }}>{lang === 'ar' ? 'مكتمل بنسبة 100%' : '100% Completed'}</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                  {lang === 'ar' 
                    ? 'لقد قمت بتهيئة النطاق، شحن المحفظة، توليد المفاتيح، والتحقق من إرسال أول طلب API بنجاح. خادم المراسلة العراقي الآن متكامل بالكامل وجاهز للربط الفعلي.' 
                    : 'You have verified your domain, funded your wallet, generated API credentials, and completed live transmission checks. Your localized Iraqi gateway is active.'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button onClick={() => setCurrentTab('code')} className="btn btn-primary" style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '99px' }}>
                  {lang === 'ar' ? 'عرض وثائق الـ SDK' : 'Integrate SDK Code'}
                </button>
                <button 
                  onClick={() => setShowStepsAnyway(true)}
                  className="btn" 
                  style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '99px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}
                >
                  {lang === 'ar' ? 'مراجعة الخطوات' : 'Review Steps'}
                </button>
              </div>
            </div>
            {/* Close button for congratulations banner */}
            <button
              onClick={() => {
                localStorage.setItem('sumer_onboarding_dismissed_v2', 'true');
                setOnboardingDismissed(true);
                setShowStepsAnyway(false);
              }}
              style={{
                position: 'absolute',
                top: '12px',
                right: lang === 'ar' ? 'auto' : '12px',
                left: lang === 'ar' ? '12px' : 'auto',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--panel-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="onboarding-split-card" style={{ borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
            {/* Left Info Column */}
            <div className="onboarding-split-info" style={{ padding: '32px' }}>
              {/* Close button for onboarding slider */}
              <button
                onClick={() => {
                  localStorage.setItem('sumer_onboarding_dismissed_v2', 'true');
                  setOnboardingDismissed(true);
                  setShowStepsAnyway(false);
                }}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: lang === 'ar' ? 'auto' : '16px',
                  left: lang === 'ar' ? '16px' : 'auto',
                  background: 'var(--panel-muted)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <X size={14} />
              </button>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span className="sumer-badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)', fontWeight: 700, fontSize: '11px', padding: '3px 8px', borderRadius: '8px' }}>
                    {lang === 'ar' ? 'دليل تهيئة النظام' : 'SYSTEM SETUP GUIDE'}
                  </span>
                  <span className="tabular-nums-stat" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {completedSteps}/4 {lang === 'ar' ? 'مكتمل' : 'Completed'} ({progressPercent}%)
                  </span>
                </div>

                <div style={{ textAlign: 'start' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: onboardingSteps[activeStep].isDone ? 'var(--success-color)' : 'var(--text-primary)',
                      color: onboardingSteps[activeStep].isDone ? '#fff' : 'var(--bg-color)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {onboardingSteps[activeStep].isDone ? '✓' : onboardingSteps[activeStep].id}
                    </span>
                    <span>{lang === 'ar' ? onboardingSteps[activeStep].titleAr : onboardingSteps[activeStep].titleEn}</span>
                    {onboardingSteps[activeStep].isDone && (
                      <span className="sumer-badge success" style={{ fontSize: '10px', padding: '2px 6px' }}>
                        {lang === 'ar' ? 'مكتمل' : 'Done'}
                      </span>
                    )}
                  </h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px', minHeight: '60px' }}>
                    {lang === 'ar' ? onboardingSteps[activeStep].descAr : onboardingSteps[activeStep].descEn}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: 'auto' }}>
                {/* Main Action Button */}
                <button
                  onClick={() => setCurrentTab(onboardingSteps[activeStep].actionTab)}
                  className="btn btn-primary"
                  style={{
                    padding: '8px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    borderRadius: '99px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{lang === 'ar' ? onboardingSteps[activeStep].actionTextAr : onboardingSteps[activeStep].actionTextEn}</span>
                </button>

                {/* Prominent Blue "فهمت" Button on the final step */}
                {activeStep === 3 && (
                  <button
                    onClick={() => {
                      localStorage.setItem('sumer_onboarding_dismissed_v2', 'true');
                      setOnboardingDismissed(true);
                      setShowStepsAnyway(false);
                    }}
                    style={{
                      backgroundColor: '#006bff',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 24px',
                      fontSize: '13px',
                      fontWeight: 700,
                      borderRadius: '99px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 107, 255, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0056cc';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 107, 255, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#006bff';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 107, 255, 0.25)';
                    }}
                  >
                    {lang === 'ar' ? 'فهمت' : 'Got it'}
                  </button>
                )}
              </div>

              {/* Slider Controls Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                {/* Dots */}
                <div className="onboarding-dots-container">
                  {onboardingSteps.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className={`onboarding-dot ${idx === activeStep ? 'active' : ''} ${step.isDone ? 'done' : ''}`}
                      title={lang === 'ar' ? step.titleAr : step.titleEn}
                    />
                  ))}
                </div>

                {/* Navigation Arrows */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    disabled={activeStep === 0}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: activeStep === 0 ? 0.4 : 1,
                      cursor: activeStep === 0 ? 'not-allowed' : 'pointer',
                      backgroundColor: 'var(--panel-muted)',
                      border: '1px solid var(--border-color)',
                      minWidth: 'auto',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeStep !== 0) {
                        e.currentTarget.style.backgroundColor = 'var(--border-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                    }}
                  >
                    {lang === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  </button>
                  <button
                    disabled={activeStep === onboardingSteps.length - 1}
                    onClick={() => setActiveStep(prev => prev + 1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: activeStep === onboardingSteps.length - 1 ? 0.4 : 1,
                      cursor: activeStep === onboardingSteps.length - 1 ? 'not-allowed' : 'pointer',
                      backgroundColor: 'var(--panel-muted)',
                      border: '1px solid var(--border-color)',
                      minWidth: 'auto',
                      color: 'var(--text-primary)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (activeStep !== onboardingSteps.length - 1) {
                        e.currentTarget.style.backgroundColor = 'var(--border-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                    }}
                  >
                    {lang === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Visual Preview Column */}
            <div className="onboarding-split-visual" style={{ minHeight: '300px' }}>
              {activeStep === 0 && (
                <div className="mockup-floating-card" style={{ width: '100%', maxWidth: '280px', textAlign: 'start' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' }}>DNS Records</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>shop.iq</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                    {/* TXT Record */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>TXT (SPF)</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>v=spf1 include:sumer...</span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#10b981', fontWeight: 600 }}>
                        <span className="pulse-dot-verified" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        {lang === 'ar' ? 'موثق' : 'Verified'}
                      </span>
                    </div>
                    {/* MX Record */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>MX</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>feedback-smtp.sumer...</span>
                      </div>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#10b981', fontWeight: 600 }}>
                        <span className="pulse-dot-verified" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                        {lang === 'ar' ? 'موثق' : 'Verified'}
                      </span>
                    </div>
                    {/* DKIM Record */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>CNAME (DKIM)</span>
                        <span style={{ fontSize: '9px', color: 'var(--text-muted)', display: 'block', fontFamily: 'monospace' }}>sumer._domainkey...</span>
                      </div>
                      {step1Done ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#10b981', fontWeight: 600 }}>
                          <span className="pulse-dot-verified" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          {lang === 'ar' ? 'موثق' : 'Verified'}
                        </span>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#f59e0b', fontWeight: 600 }}>
                          <span className="pulse-dot-pending" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                          {lang === 'ar' ? 'معلق' : 'Pending'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 1 && (
                <div className="mockup-floating-card" style={{ width: '100%', maxWidth: '250px', padding: '0', overflow: 'hidden', borderBottomStyle: 'dashed', borderBottomWidth: '2px' }}>
                  <div style={{ backgroundColor: '#ff9900', padding: '12px', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px' }}>ZAIN CASH</span>
                    <span style={{ fontSize: '9px', opacity: 0.9, fontWeight: 700 }}>{lang === 'ar' ? 'إيصال شحن' : 'RECEIPT'}</span>
                  </div>
                  <div style={{ padding: '16px', fontSize: '11px', textAlign: 'start' }}>
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block' }}>{lang === 'ar' ? 'رصيد مضاف' : 'Credits Deposited'}</span>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>50,000 IQD</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px dashed var(--border-color)', paddingTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الحالة:' : 'Status:'}</span>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{lang === 'ar' ? 'ناجحة' : 'SUCCESS'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'رقم العملية:' : 'Txn ID:'}</span>
                        <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>#ZC-897210</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المحفظة:' : 'Wallet:'}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>0782***392</span>
                      </div>
                    </div>
                    {/* Barcode representation */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ height: '24px', width: '120px', background: 'repeating-linear-gradient(90deg, var(--text-primary) 0px, var(--text-primary) 2px, transparent 2px, transparent 6px, var(--text-primary) 6px, var(--text-primary) 7px, transparent 7px, transparent 10px)' }}></div>
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>964780912234</span>
                    </div>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="mockup-code-terminal" style={{ width: '100%', maxWidth: '280px', direction: 'ltr' }}>
                  <div className="mockup-code-header">
                    <div className="mockup-code-dot" style={{ backgroundColor: '#ff5f56' }} />
                    <div className="mockup-code-dot" style={{ backgroundColor: '#ffbd2e' }} />
                    <div className="mockup-code-dot" style={{ backgroundColor: '#27c93f' }} />
                    <span style={{ marginLeft: '8px', color: '#565f89', fontSize: '10px' }}>sumer-node.js</span>
                  </div>
                  <div className="mockup-code-body">
                    <div style={{ color: '#89ddff' }}><span style={{ color: '#e0af68' }}>const</span> Sumer = <span style={{ color: '#0db9d7' }}>require</span>(<span style={{ color: '#9ece6a' }}>'sumersend'</span>);</div>
                    <div style={{ color: '#89ddff' }}><span style={{ color: '#e0af68' }}>const</span> client = <span style={{ color: '#e0af68' }}>new</span> <span style={{ color: '#0db9d7' }}>Sumer</span>(<span style={{ color: '#9ece6a' }}>'sm_live_...'</span>);</div>
                    <div style={{ color: '#565f89', margin: '4px 0' }}>// Send SMS via Zain/AsiaCell</div>
                    <div style={{ color: '#89ddff' }}>client.sms.send(&#123;</div>
                    <div style={{ paddingLeft: '12px', color: '#bb9af3' }}>to: <span style={{ color: '#9ece6a' }}>"+9647800000000"</span>,</div>
                    <div style={{ paddingLeft: '12px', color: '#bb9af3' }}>body: <span style={{ color: '#9ece6a' }}>"كود التفعيل: 4892"</span></div>
                    <div style={{ color: '#89ddff' }}>&#125;).then(console.log);</div>
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="mockup-phone-frame" style={{ direction: 'ltr' }}>
                  <div className="mockup-phone-notch" />
                  {/* iOS Status Bar */}
                  <div style={{ 
                    height: '14px', 
                    padding: '0 10px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    color: '#fff', 
                    fontSize: '8px', 
                    zIndex: 2, 
                    position: 'relative',
                    fontFamily: 'system-ui'
                  }}>
                    <span style={{ fontWeight: 600 }}>9:41</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {/* Signal */}
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                        <rect x="0" y="4" width="1.5" height="2" rx="0.5" />
                        <rect x="2" y="3" width="1.5" height="3" rx="0.5" />
                        <rect x="4" y="2" width="1.5" height="4" rx="0.5" />
                        <rect x="6" y="1" width="1.5" height="5" rx="0.5" />
                        <rect x="8" y="0" width="1.5" height="6" rx="0.5" />
                      </svg>
                      {/* Battery */}
                      <div style={{ width: '11px', height: '6px', border: '1px solid #fff', borderRadius: '1.5px', padding: '0.5px', display: 'flex' }}>
                        <div style={{ flex: 1, backgroundColor: '#fff', borderRadius: '0.5px' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone screen background */}
                  <div style={{ 
                    flex: 1, 
                    background: 'linear-gradient(to bottom, #111827, #1f2937)', 
                    padding: '12px 8px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px',
                    position: 'relative' 
                  }}>
                    <div style={{ flex: 1 }} />
                    
                    {/* Notification card */}
                    <div className="mockup-phone-notification" style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      backdropFilter: 'blur(10px)', 
                      borderRadius: '10px', 
                      padding: '8px', 
                      color: '#fff', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'start',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                      animation: 'slideInNotification 0.4s ease-out',
                      direction: lang === 'ar' ? 'rtl' : 'ltr'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#006bff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '7px', fontWeight: 800 }}>S</div>
                          <span style={{ fontSize: '8px', fontWeight: 600 }}>SUMER SEND</span>
                        </div>
                        <span style={{ fontSize: '7px', opacity: 0.6 }}>{lang === 'ar' ? 'الآن' : 'now'}</span>
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 600, marginBottom: '1px' }}>{lang === 'ar' ? 'تنبيه بوابة المطور' : 'Developer Gateway Test'}</div>
                      <p style={{ fontSize: '8px', margin: 0, opacity: 0.8, lineHeight: 1.3 }}>
                        {lang === 'ar' ? 'تم توصيل أول رسالة API بنجاح 🚀' : 'First API dispatch successfully processed 🚀'}
                      </p>
                    </div>
                    
                    <div style={{ flex: 1 }} />
                    {/* Indicator bar */}
                    <div style={{ width: '50px', height: '3px', backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '1.5px', margin: '0 auto' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
      </>
    );
  };

  return (
    <ScrollReveal>
      {/* Onboarding Checklist Card */}
      {renderOnboardingChecklist()}

      {/* Stats Cards */}
      <div className="dashboard-metric-grid">
        {/* Email Card */}
        <BentoCard 
          className="dashboard-card bento-metric-card email-card" 
          glowColor="168, 85, 247"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={15} className="bento-icon" style={{ opacity: 0.8 }} />
              <span className="bento-header-title">{t.totalEmails}</span>
            </div>
            <button className="bento-options-btn">•••</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
            <span className="bento-value tabular-nums-stat">{emailCount}</span>
            <span className="bento-trend-badge up">
              <TrendingUp size={10} />
              <span>12%</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bento-desc">
              {lang === 'ar' ? 'بناءً على الصادر الكلي' : 'Based on total outbound'}
            </span>
            <button 
              className="bento-details-btn" 
              onClick={() => setCurrentTab('reports')}
            >
              <span>{lang === 'ar' ? 'التفاصيل' : 'See Details'}</span>
              <ChevronRight size={10} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>
        </BentoCard>

        {/* SMS Card */}
        <BentoCard 
          className="dashboard-card bento-metric-card sms-card" 
          glowColor="244, 63, 94"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={15} className="bento-icon" style={{ opacity: 0.8 }} />
              <span className="bento-header-title">{t.totalSMS}</span>
            </div>
            <button className="bento-options-btn">•••</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
            <span className="bento-value tabular-nums-stat">{smsCount}</span>
            <span className="bento-trend-badge up">
              <TrendingUp size={10} />
              <span>8%</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bento-desc">
              {lang === 'ar' ? 'بناءً على الرسائل المرسلة' : 'Based on SMS sent'}
            </span>
            <button 
              className="bento-details-btn" 
              onClick={() => setCurrentTab('reports')}
            >
              <span>{lang === 'ar' ? 'التفاصيل' : 'See Details'}</span>
              <ChevronRight size={10} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>
        </BentoCard>

        {/* WhatsApp Card */}
        <BentoCard 
          className="dashboard-card bento-metric-card wa-card" 
          glowColor="14, 165, 233"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageSquare size={15} className="bento-icon" style={{ opacity: 0.8 }} />
              <span className="bento-header-title">{t.totalWA}</span>
            </div>
            <button className="bento-options-btn">•••</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
            <span className="bento-value tabular-nums-stat">{waCount}</span>
            <span className="bento-trend-badge up">
              <TrendingUp size={10} />
              <span>24%</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bento-desc">
              {lang === 'ar' ? 'بناءً على النشاط الأخير' : 'Based on recent activity'}
            </span>
            <button 
              className="bento-details-btn" 
              onClick={() => setCurrentTab('reports')}
            >
              <span>{lang === 'ar' ? 'التفاصيل' : 'See Details'}</span>
              <ChevronRight size={10} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>
        </BentoCard>

        {/* Delivery Rate Card */}
        <BentoCard 
          className="dashboard-card bento-metric-card delivery-card" 
          glowColor="234, 179, 8"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={15} className="bento-icon" style={{ opacity: 0.8 }} />
              <span className="bento-header-title">{t.deliveryRate}</span>
            </div>
            <button className="bento-options-btn">•••</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '14px', marginBottom: '14px' }}>
            <span className="bento-value tabular-nums-stat">{deliveryRateValue}%</span>
            <span className="bento-trend-badge neutral">
              <span>98%</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="bento-desc">
              {lang === 'ar' ? 'مقارنة بالمعيار القياسي' : 'Compared to standard'}
            </span>
            <button 
              className="bento-details-btn" 
              onClick={() => setCurrentTab('reports')}
            >
              <span>{lang === 'ar' ? 'التفاصيل' : 'See Details'}</span>
              <ChevronRight size={10} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>
        </BentoCard>
      </div>

      {/* Tier 2: Middle Split Grid (Traffic Analytics, Donut Chart, Calendar Strip) */}
      <div className="dashboard-tier2-grid">
        {/* A. Traffic Analytics Line Chart */}
        <div className="dashboard-card" style={{ overflow: 'visible', padding: '20px 24px', borderRadius: '24px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
          <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)', textAlign: 'start' }}>
                {lang === 'ar' ? 'تحليل حجم الحركة اليومية' : 'Daily Traffic Analytics'}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textAlign: 'start' }}>
                {lang === 'ar' ? 'توزيع عمليات التوصيل الناجحة للقنوات الثلاث' : 'Successful delivery volume distribution across channels'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setCurrentTab('reports')}
                className="btn"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: '99px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--panel-bg)',
                  color: 'var(--text-primary)',
                  height: '28px'
                }}
              >
                <span>{lang === 'ar' ? 'التقارير التفصيلية ↗' : 'Detailed Reports ↗'}</span>
              </button>
              
              {/* Time Range Selector */}
              <div className="capsule-tab-container" style={{ display: 'flex', height: '28px', alignItems: 'center' }}>
                {(['24h', '7d', '30d'] as const).map((range) => (
                  <button 
                    key={range}
                    onClick={() => { setTimeRange(range); setHoveredIdx(null); }}
                    className={`capsule-tab-btn ${timeRange === range ? 'active' : ''}`}
                    style={{ fontSize: '11px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {range === '24h' && (lang === 'ar' ? '24 ساعة' : '24h')}
                    {range === '7d' && (lang === 'ar' ? '7 أيام' : '7d')}
                    {range === '30d' && (lang === 'ar' ? '30 يوم' : '30d')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Legend and stats */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px', 
            borderBottom: '1px solid var(--border-color)', 
            paddingBottom: '10px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 600 }}>
                  {lang === 'ar' ? 'الحجم الإجمالي' : 'Total Volume'}
                </span>
                <span className="tabular-nums-stat" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {totalVolume.toLocaleString()}
                </span>
              </div>
              <div style={{ borderInlineStart: '1px solid var(--border-color)', paddingInlineStart: '16px', height: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', marginBottom: '2px', fontWeight: 600 }}>
                  {lang === 'ar' ? 'المعدل اليومي' : 'Daily Average'}
                </span>
                <span className="tabular-nums-stat" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>
                  {avgVolume.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Interactive Legend Toggles */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button 
                onClick={() => setShowEmail(!showEmail)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: showEmail ? 'rgba(0, 112, 243, 0.08)' : 'transparent',
                  border: showEmail ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  opacity: showEmail ? 1 : 0.5,
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  height: '28px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
                <span style={{ fontWeight: 600, color: showEmail ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'Email' : 'البريد'}</span>
              </button>
              
              <button 
                onClick={() => setShowSms(!showSms)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: showSms ? 'rgba(34, 197, 94, 0.08)' : 'transparent',
                  border: showSms ? '1px solid var(--success-color)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  opacity: showSms ? 1 : 0.5,
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  height: '28px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                <span style={{ fontWeight: 600, color: showSms ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'SMS' : 'الـ SMS'}</span>
              </button>

              <button 
                onClick={() => setShowWhatsapp(!showWhatsapp)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: showWhatsapp ? 'rgba(37, 211, 102, 0.08)' : 'transparent',
                  border: showWhatsapp ? '1px solid var(--channel-whatsapp)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  opacity: showWhatsapp ? 1 : 0.5,
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '11px',
                  height: '28px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }}></span>
                <span style={{ fontWeight: 600, color: showWhatsapp ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'WhatsApp' : 'الواتساب'}</span>
              </button>
            </div>
          </div>

          {/* SVG Render */}
          <div style={{ width: '100%', overflowX: 'auto', direction: 'ltr', position: 'relative' }}>
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              style={{ width: '100%', minWidth: '450px', height: 'auto', display: 'block', overflow: 'visible' }}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <defs>
                <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="smsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--success-color)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--success-color)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="whatsappGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--channel-whatsapp)" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="var(--channel-whatsapp)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = paddingY + ratio * chartHeight;
                const value = Math.round(maxVal * (1 - ratio));
                return (
                  <g key={idx}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={width - paddingX} 
                      y2={y} 
                      stroke="var(--border-color)" 
                      strokeWidth="0.8" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingX - 10} 
                      y={y + 3} 
                      textAnchor="end" 
                      fill="var(--text-secondary)" 
                      style={{ fontSize: '9px', fontFamily: 'monospace' }}
                    >
                      {value}
                    </text>
                  </g>
                );
              })}

              {/* Area Fills */}
              {showEmail && <path d={makeSmoothAreaPathStr(emailPoints)} fill="url(#emailGrad)" style={{ transition: 'opacity 0.2s' }} />}
              {showSms && <path d={makeSmoothAreaPathStr(smsPoints)} fill="url(#smsGrad)" style={{ transition: 'opacity 0.2s' }} />}
              {showWhatsapp && <path d={makeSmoothAreaPathStr(whatsappPoints)} fill="url(#whatsappGrad)" style={{ transition: 'opacity 0.2s' }} />}

              {/* Stroke Lines */}
              {showEmail && <path d={makeSmoothPathStr(emailPoints)} fill="none" stroke="var(--accent-color)" strokeWidth="2.5" strokeLinecap="round" />}
              {showSms && <path d={makeSmoothPathStr(smsPoints)} fill="none" stroke="var(--success-color)" strokeWidth="2.5" strokeLinecap="round" />}
              {showWhatsapp && <path d={makeSmoothPathStr(whatsappPoints)} fill="none" stroke="var(--channel-whatsapp)" strokeWidth="2.5" strokeLinecap="round" />}

              {/* Hover Vertical tracking line */}
              {hoveredIdx !== null && (
                <line
                  x1={paddingX + (hoveredIdx * chartWidth) / (chartData.length - 1)}
                  y1={paddingY}
                  x2={paddingX + (hoveredIdx * chartWidth) / (chartData.length - 1)}
                  y2={height - paddingY}
                  stroke="var(--border-hover)"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />
              )}

              {/* Node Dots */}
              {showEmail && emailPoints.map((p, i) => (
                <g key={`e-${i}`}>
                  {hoveredIdx === i && (
                    <circle cx={p.x} cy={p.y} r="8" fill="rgba(0, 112, 243, 0.18)" />
                  )}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredIdx === i ? "5.5" : "4"} 
                    fill="var(--panel-bg)" 
                    stroke="var(--accent-color)" 
                    strokeWidth="2" 
                    style={{ transition: 'r 0.1s ease' }}
                  />
                </g>
              ))}
              
              {showSms && smsPoints.map((p, i) => (
                <g key={`s-${i}`}>
                  {hoveredIdx === i && (
                    <circle cx={p.x} cy={p.y} r="8" fill="rgba(16, 185, 129, 0.18)" />
                  )}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredIdx === i ? "5.5" : "4"} 
                    fill="var(--panel-bg)" 
                    stroke="var(--success-color)" 
                    strokeWidth="2" 
                    style={{ transition: 'r 0.1s ease' }}
                  />
                </g>
              ))}
              
              {showWhatsapp && whatsappPoints.map((p, i) => (
                <g key={`w-${i}`}>
                  {hoveredIdx === i && (
                    <circle cx={p.x} cy={p.y} r="8" fill="rgba(37, 211, 102, 0.18)" />
                  )}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={hoveredIdx === i ? "5.5" : "4"} 
                    fill="var(--panel-bg)" 
                    stroke="var(--channel-whatsapp)" 
                    strokeWidth="2" 
                    style={{ transition: 'r 0.1s ease' }}
                  />
                </g>
              ))}
            </svg>

            {/* HTML X-Axis Labels */}
            <div style={{
              position: 'absolute',
              bottom: '2px',
              left: `${(paddingX / width) * 100}%`,
              width: `${(chartWidth / width) * 100}%`,
              minWidth: `${(chartWidth / width) * 450}px`,
              display: 'flex',
              justifyContent: 'space-between',
              pointerEvents: 'none',
              fontSize: '9px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              fontFamily: 'Cairo, system-ui, -apple-system, sans-serif'
            }}>
              {chartData.map((d, idx) => {
                const showLabel = timeRange !== '30d' || idx === 0 || idx === chartData.length - 1 || idx % 5 === 0;
                return (
                  <div 
                    key={idx} 
                    style={{
                      visibility: showLabel ? 'visible' : 'hidden',
                      width: '0',
                      display: 'flex',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap',
                      direction: lang === 'ar' ? 'rtl' : 'ltr'
                    }}
                  >
                    {d.dateStr}
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {hoveredIdx !== null && (
              <div style={{
                position: 'absolute',
                left: `${((paddingX + (hoveredIdx * chartWidth) / (chartData.length - 1)) / width) * 100}%`,
                top: `${(getAverageTooltipY() / height) * 100}%`,
                transform: `translate(${
                  ((paddingX + (hoveredIdx * chartWidth) / (chartData.length - 1) + 15 + 155) > width) 
                    ? '-110%' 
                    : '10%'
                }, -50%)`,
                pointerEvents: 'none',
                zIndex: 10,
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '8px 12px',
                boxShadow: 'var(--shadow-large)',
                fontSize: '11px',
                color: 'var(--text-primary)',
                minWidth: '150px',
                transition: 'left 0.08s ease, top 0.08s ease',
                direction: lang === 'ar' ? 'rtl' : 'ltr'
              }}>
                <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '5px', fontSize: '11px' }}>
                  {chartData[hoveredIdx].dateStr}
                </div>
                
                {showEmail && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
                      <span>{lang === 'ar' ? 'البريد:' : 'Email:'}</span>
                    </div>
                    <span className="tabular-nums-stat" style={{ fontWeight: 700 }}>{chartData[hoveredIdx].email}</span>
                  </div>
                )}
                
                {showSms && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                      <span>{lang === 'ar' ? 'الـ SMS:' : 'SMS:'}</span>
                    </div>
                    <span className="tabular-nums-stat" style={{ fontWeight: 700 }}>{chartData[hoveredIdx].sms}</span>
                  </div>
                )}
                
                {showWhatsapp && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }}></span>
                      <span>{lang === 'ar' ? 'الواتساب:' : 'WhatsApp:'}</span>
                    </div>
                    <span className="tabular-nums-stat" style={{ fontWeight: 700 }}>{chartData[hoveredIdx].whatsapp}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '4px', fontWeight: 700 }}>
                  <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="tabular-nums-stat" style={{ color: 'var(--accent-color)' }}>
                    {(showEmail ? chartData[hoveredIdx].email : 0) + 
                     (showSms ? chartData[hoveredIdx].sms : 0) + 
                     (showWhatsapp ? chartData[hoveredIdx].whatsapp : 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* B. Success Rate Donut Chart Widget */}
        <div className="donut-chart-card dashboard-card" style={{ display: 'flex', flexDirection: 'column', height: 'auto', minHeight: '340px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)', textAlign: 'start' }}>
              {lang === 'ar' ? 'تحليل نسب نجاح القنوات' : 'Channel Success Analysis'}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textAlign: 'start' }}>
              {lang === 'ar' ? 'معدلات التوصيل الفردية ونسب القنوات' : 'Individual delivery rates and ratios'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* Left: Concentric Rings SVG */}
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0, margin: '0 auto' }}>
              <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', overflow: 'visible', width: '120px', height: '120px' }}>
                {/* 1. Outer Ring: Email (Radius: 48, StrokeWidth: 6) */}
                <circle cx="60" cy="60" r="48" fill="transparent" stroke="var(--border-color)" strokeWidth="6" opacity="0.4" />
                <circle 
                  cx="60" cy="60" r="48" fill="transparent" stroke="#a855f7" strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - emailSuccessRate / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />

                {/* 2. Middle Ring: SMS (Radius: 38, StrokeWidth: 6) */}
                <circle cx="60" cy="60" r="38" fill="transparent" stroke="var(--border-color)" strokeWidth="6" opacity="0.4" />
                <circle 
                  cx="60" cy="60" r="38" fill="transparent" stroke="#f43f5e" strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - smsSuccessRate / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />

                {/* 3. Inner Ring: WhatsApp (Radius: 28, StrokeWidth: 6) */}
                <circle cx="60" cy="60" r="28" fill="transparent" stroke="var(--border-color)" strokeWidth="6" opacity="0.4" />
                <circle 
                  cx="60" cy="60" r="28" fill="transparent" stroke="#0ea5e9" strokeWidth="6" 
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - waSuccessRate / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
              </svg>
              {/* Overall success center text */}
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{deliveryRateValue}%</span>
                <span style={{ fontSize: '8px', color: 'var(--text-secondary)' }}>{lang === 'ar' ? 'الإجمالي' : 'Overall'}</span>
              </div>
            </div>

            {/* Right: Ratios and Details list */}
            <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Email details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#a855f7' }}></span>
                    <span style={{ fontWeight: 600 }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{emailSuccessRate}%</span>
                </div>
                <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${emailSuccessRate}%`, backgroundColor: '#a855f7', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{emailCount} / {emailTotal} {lang === 'ar' ? 'مكتمل' : 'delivered'}</span>
              </div>

              {/* SMS details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f43f5e' }}></span>
                    <span style={{ fontWeight: 600 }}>{lang === 'ar' ? 'الرسائل القصيرة SMS' : 'SMS'}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{smsSuccessRate}%</span>
                </div>
                <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${smsSuccessRate}%`, backgroundColor: '#f43f5e', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{smsCount} / {smsTotal} {lang === 'ar' ? 'مكتمل' : 'delivered'}</span>
              </div>

              {/* WhatsApp details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0ea5e9' }}></span>
                    <span style={{ fontWeight: 600 }}>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>{waSuccessRate}%</span>
                </div>
                <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${waSuccessRate}%`, backgroundColor: '#0ea5e9', borderRadius: '2px' }}></div>
                </div>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{waCount} / {waTotal} {lang === 'ar' ? 'مكتمل' : 'delivered'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* C. Active Channels / Calendar Strip Widget */}
        <div className="calendar-strip-card dashboard-card" style={{ backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 2px 0', color: 'var(--text-primary)', textAlign: 'start' }}>
              {lang === 'ar' ? 'القنوات النشطة' : 'Active Channels'}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', textAlign: 'start' }}>
              {lang === 'ar' ? 'مخطط الإرسال اليومي' : 'Daily timeline'}
            </span>
          </div>

          <div className="calendar-strip">
            {calendarDays.map((day, idx) => (
              <button 
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`calendar-day-btn ${selectedDayIdx === idx ? 'active' : ''}`}
                style={{ border: 'none', cursor: 'pointer', outline: 'none' }}
              >
                <span className="calendar-day-num">{day.num}</span>
                <span className="calendar-day-name">{day.name}</span>
              </button>
            ))}
          </div>

          <div className="calendar-active-items">
            {selectedDayIdx === 3 ? ( // Today
              <>
                <div className="calendar-item-card">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="calendar-item-title">{lang === 'ar' ? 'خدمة التحقق OTP' : 'Zain OTP Verify'}</span>
                    <span className="calendar-item-tag purple">{lang === 'ar' ? 'رسائل SMS' : 'SMS API'}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.6, transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                </div>

                <div className="calendar-item-card">
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span className="calendar-item-title">{lang === 'ar' ? 'إشعارات البريد الصادر' : 'SMTP Store Billing'}</span>
                    <span className="calendar-item-tag blue">{lang === 'ar' ? 'نظام SMTP' : 'Email Node'}</span>
                  </div>
                  <ChevronRight size={14} style={{ opacity: 0.6, transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                </div>
              </>
            ) : selectedDayIdx === 2 ? ( // Yesterday
              <div className="calendar-item-card">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="calendar-item-title">{lang === 'ar' ? 'حملة التسويق عبر البريد' : 'Email Promo Campaign'}</span>
                  <span className="calendar-item-tag blue">{lang === 'ar' ? 'نظام SMTP' : 'Email Node'}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.6, transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </div>
            ) : selectedDayIdx === 1 ? ( // 2 days ago
              <div className="calendar-item-card">
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="calendar-item-title">{lang === 'ar' ? 'إشعارات واتساب للدعم' : 'Support WhatsApp Dispatch'}</span>
                  <span className="calendar-item-tag pink">{lang === 'ar' ? 'واتساب' : 'WhatsApp API'}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.6, transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
              </div>
            ) : selectedDayIdx === 0 ? ( // 3 days ago
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '16px', color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'center' }}>
                <span>{lang === 'ar' ? 'لا توجد قنوات نشطة في هذا اليوم' : 'No active channels on this day'}</span>
              </div>
            ) : ( // Tomorrow
              <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '16px', color: 'var(--text-secondary)', fontSize: '11px', textAlign: 'center' }}>
                <span>{lang === 'ar' ? 'لم تبدأ حركة اليوم بعد' : 'Traffic has not started yet'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 3: Bottom Split Grid (Activities Schedule, Upcoming Milestones) */}
      <div className="dashboard-tier3-grid">
        {/* A. Activities Schedule List */}
        <div style={{ minWidth: '0' }}>
          <div className="flex-between" style={{ marginBottom: '14px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textAlign: 'start' }}>
              {lang === 'ar' ? 'جدول الأنشطة الأخير' : 'Activities Schedule'}
            </h2>
            <button 
              onClick={() => setCurrentTab('logs')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>{lang === 'ar' ? 'عرض السجلات' : 'View Logs'}</span>
              <ChevronRight size={12} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>

          <div className="activities-schedule-list">
            {logs.length === 0 ? (
              <div className="dashboard-card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '24px' }}>
                <AlertCircle size={28} style={{ marginBottom: '8px', color: 'var(--text-muted)', opacity: 0.6 }} />
                <p>{t.noActivity}</p>
              </div>
            ) : (
              logs.slice(-3).reverse().map((log, idx) => {
                const isPurple = log.type === 'email';
                const isPink = log.type === 'sms';
                const colorClass = isPurple ? 'purple' : (isPink ? 'pink' : 'blue');
                
                let titleText = '';
                if (log.type === 'email') titleText = lang === 'ar' ? 'رسالة بريد إلكتروني صادرة' : 'Outbound Transactional Email';
                else if (log.type === 'sms') titleText = lang === 'ar' ? 'رمز تحقق SMS OTP' : 'SMS Code Dispatch';
                else titleText = lang === 'ar' ? 'إشعار واتساب تلقائي' : 'WhatsApp Notification';

                return (
                  <div key={log.id} className="activity-schedule-item">
                    <div className="activity-schedule-left">
                      <div className={`activity-channel-icon-outer ${colorClass}`}>
                        {log.type === 'email' && <Mail size={15} />}
                        {log.type === 'sms' && <Phone size={15} />}
                        {log.type === 'whatsapp' && <MessageSquare size={15} />}
                      </div>
                      <div>
                        <h4 className="activity-schedule-title">{titleText}</h4>
                        <span className="activity-schedule-subtitle tabular-nums-stat">{log.to}</span>
                      </div>
                    </div>

                    <div className="activity-schedule-right">
                      <span className={`activity-schedule-status-pill ${log.status === 'delivered' ? 'done' : 'on-hold'}`}>
                        {log.status === 'delivered' ? (lang === 'ar' ? 'مكتمل' : 'Done') : (lang === 'ar' ? 'قيد الانتظار' : 'On hold')}
                      </span>
                      <span className="activity-schedule-time">
                        {new Date(log.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: 'numeric', minute: '2-digit', hour12: true })}
                      </span>
                      <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}>•••</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* B. Upcoming Events & Milestones */}
        <div style={{ minWidth: '0' }}>
          <div className="flex-between" style={{ marginBottom: '14px', alignItems: 'center' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textAlign: 'start' }}>
              {lang === 'ar' ? 'الفعاليات والأحداث القادمة' : 'Upcoming Events'}
            </h2>
            <button 
              onClick={() => setCurrentTab('system')}
              style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              <span>{lang === 'ar' ? 'عرض الأحداث' : 'View Events'}</span>
              <ChevronRight size={12} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
            </button>
          </div>

          <div className="upcoming-milestones-list">
            <div className="milestone-card">
              <div className="milestone-header">
                <span className="milestone-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  28 Sep, 2026
                </span>
                <span className="milestone-priority">★ 4.9</span>
              </div>
              <h4 className="milestone-title">
                {lang === 'ar' ? 'ترقية بوابة شبكة زين كاش المباشرة' : 'Zain Cash Direct API v3 Integration'}
              </h4>
              <div className="milestone-footer">
                <span className="milestone-tag">{lang === 'ar' ? 'بوابات الدفع' : 'Billing Gateway'}</span>
                <div className="milestone-assignees">
                  <div className="milestone-assignee-avatar" style={{ backgroundColor: '#a855f7', color: '#fff' }}>JK</div>
                  <div className="milestone-assignee-avatar" style={{ backgroundColor: '#10b981', color: '#fff' }}>MH</div>
                  <div className="milestone-assignee-avatar" style={{ backgroundColor: '#f43f5e', color: '#fff' }}>AS</div>
                </div>
              </div>
            </div>

            <div className="milestone-card">
              <div className="milestone-header">
                <span className="milestone-date">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginInlineEnd: '4px' }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  12 Oct, 2026
                </span>
                <span className="milestone-priority">★ 4.8</span>
              </div>
              <h4 className="milestone-title">
                {lang === 'ar' ? 'إطلاق واجهة Sandbox للمطورين العراقيين' : 'Sumer Send Developer Sandbox Launch'}
              </h4>
              <div className="milestone-footer">
                <span className="milestone-tag">{lang === 'ar' ? 'حزم الـ SDK' : 'SDK Release'}</span>
                <div className="milestone-assignees">
                  <div className="milestone-assignee-avatar" style={{ backgroundColor: '#0ea5e9', color: '#fff' }}>AS</div>
                  <div className="milestone-assignee-avatar" style={{ backgroundColor: '#eab308', color: '#fff' }}>JK</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
