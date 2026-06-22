


import React from 'react';
import { Mail, MessageSquare, Phone, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const step1Done = domains.every((d: any) => d.status === 'verified');
  const step2Done = transactions.length > 1;
  const step3Done = apiKeys.length > 1;
  const step4Done = logs.length > 3;

  let completedSteps = 0;
  if (step1Done) completedSteps++;
  if (step2Done) completedSteps++;
  if (step3Done) completedSteps++;
  if (step4Done) completedSteps++;
  const progressPercent = Math.round((completedSteps / 4) * 100);

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

  // Calculate stats based on logs
  const emailCount = logs.filter(log => log.type === 'email' && log.status === 'delivered').length;
  const smsCount = logs.filter(log => log.type === 'sms' && log.status === 'delivered').length;
  const waCount = logs.filter(log => log.type === 'whatsapp' && log.status === 'delivered').length;
  
  const totalSent = logs.length;
  const totalDelivered = logs.filter(log => log.status === 'delivered').length;
  const deliveryRateValue = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 100;

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
  return (
    <ScrollReveal>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: 800, 
          letterSpacing: lang === 'ar' ? '0' : '-1.5px', 
          lineHeight: 1.15,
          marginBottom: '8px',
          color: 'var(--text-primary)'
        }}>{t.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', fontWeight: 500 }}>{t.subtitle}</p>
      </div>

      {/* Onboarding Checklist Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', background: 'var(--panel-bg)', borderRadius: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {lang === 'ar' ? 'خطوات تهيئة وتفعيل الحساب' : 'Developer Onboarding Steps'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {lang === 'ar' ? 'اتبع الخطوات المتسلسلة الأربعة التالية لتفعيل خادم المراسلة بالكامل.' : 'Follow these four sequential steps to fully set up and test your gateway.'}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {progressPercent}% {lang === 'ar' ? 'مكتمل' : 'Completed'}
            </span>
            <div style={{ width: '120px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: '#006bff', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {/* Step 1 */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: step1Done ? 'var(--panel-muted)' : 'var(--panel-bg)',
            opacity: step1Done ? 0.8 : 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.2s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  backgroundColor: step1Done ? 'var(--success-color)' : 'var(--text-primary)', 
                  color: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {step1Done ? '✓' : '1'}
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {lang === 'ar' ? 'توثيق النطاق' : 'Domain Auth'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                {lang === 'ar' ? 'قم بتفعيل النطاق المعلق (DNS) لتمكين توقيع البريد.' : 'Verify pending domain DNS to enable digital signing.'}
              </p>
            </div>
            {!step1Done ? (
              <button onClick={() => setCurrentTab('domains')} className="btn btn-primary" style={{ width: '100%', minHeight: '32px', fontSize: '12px', padding: '4px 8px' }}>
                {lang === 'ar' ? 'ربط النطاق' : 'Verify Domain'}
              </button>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>{lang === 'ar' ? 'تم التفعيل' : 'Active'}</span>
              </div>
            )}
          </div>

          {/* Step 2 */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: step2Done ? 'var(--panel-muted)' : 'var(--panel-bg)',
            opacity: step2Done ? 0.8 : 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.2s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  backgroundColor: step2Done ? 'var(--success-color)' : 'var(--text-primary)', 
                  color: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {step2Done ? '✓' : '2'}
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {lang === 'ar' ? 'شحن رصيد المحفظة' : 'Deposit Credits'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                {lang === 'ar' ? 'قم بعملية شحن تجريبية للمحفظة عبر بوابة زين كاش.' : 'Simulate a Zain Cash top up to cover sending costs.'}
              </p>
            </div>
            {!step2Done ? (
              <button onClick={() => setCurrentTab('billing')} className="btn" style={{ width: '100%', minHeight: '32px', fontSize: '12px', padding: '4px 8px' }}>
                {lang === 'ar' ? 'شحن الآن' : 'Charge Wallet'}
              </button>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>{lang === 'ar' ? 'تم الشحن' : 'Funded'}</span>
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: step3Done ? 'var(--panel-muted)' : 'var(--panel-bg)',
            opacity: step3Done ? 0.8 : 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.2s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  backgroundColor: step3Done ? 'var(--success-color)' : 'var(--text-primary)', 
                  color: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {step3Done ? '✓' : '3'}
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {lang === 'ar' ? 'توليد مفتاح API' : 'Create API Key'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                {lang === 'ar' ? 'أضف مفتاح API مخصص لربطه بتطبيقاتك البرمجية.' : 'Add a custom key to connect your application backend.'}
              </p>
            </div>
            {!step3Done ? (
              <button onClick={() => setCurrentTab('api')} className="btn" style={{ width: '100%', minHeight: '32px', fontSize: '12px', padding: '4px 8px' }}>
                {lang === 'ar' ? 'توليد مفتاح' : 'Generate Key'}
              </button>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>{lang === 'ar' ? 'تمت الإضافة' : 'Key Active'}</span>
              </div>
            )}
          </div>

          {/* Step 4 */}
          <div style={{ 
            padding: '16px', 
            borderRadius: '6px', 
            border: '1px solid var(--border-color)', 
            backgroundColor: step4Done ? 'var(--panel-muted)' : 'var(--panel-bg)',
            opacity: step4Done ? 0.8 : 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '160px',
            transition: 'all 0.2s'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ 
                  width: '22px', 
                  height: '22px', 
                  borderRadius: '50%', 
                  backgroundColor: step4Done ? 'var(--success-color)' : 'var(--text-primary)', 
                  color: 'var(--bg-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}>
                  {step4Done ? '✓' : '4'}
                </div>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {lang === 'ar' ? 'إرسال أول اختبار' : 'Send Test API'}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 12px 0' }}>
                {lang === 'ar' ? 'أرسل رسالة تجريبية من منصة الاختبار لترى وصولها الفوري.' : 'Send a message in the playground to test live dispatch.'}
              </p>
            </div>
            {!step4Done ? (
              <button onClick={() => setCurrentTab('playground')} className="btn" style={{ width: '100%', minHeight: '32px', fontSize: '12px', padding: '4px 8px' }}>
                {lang === 'ar' ? 'منصة الاختبار' : 'Go Playground'}
              </button>
            ) : (
              <div style={{ fontSize: '11px', color: 'var(--success-color)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>{lang === 'ar' ? 'تم الإرسال' : 'Dispatched'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Chart section */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px', overflow: 'visible' }}>
        <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {lang === 'ar' ? 'تحليل حجم الحركة اليومية' : 'Daily Traffic Analytics'}
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {lang === 'ar' ? 'توزيع عمليات التوصيل الناجحة للقنوات الثلاث' : 'Successful delivery volume distribution across channels'}
              </span>
            </div>
            <button 
              onClick={() => setCurrentTab('reports')}
              className="btn"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>{lang === 'ar' ? 'التقارير التفصيلية ↗' : 'Detailed Reports ↗'}</span>
            </button>
          </div>
          
          {/* Time Range Selector */}
          <div className="capsule-tab-container">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button 
                key={range}
                onClick={() => { setTimeRange(range); setHoveredIdx(null); }}
                className={`capsule-tab-btn ${timeRange === range ? 'active' : ''}`}
              >
                {range === '24h' && (lang === 'ar' ? '24 ساعة' : '24h')}
                {range === '7d' && (lang === 'ar' ? '7 أيام' : '7d')}
                {range === '30d' && (lang === 'ar' ? '30 يوم' : '30d')}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Secondary Metrics row */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              {lang === 'ar' ? 'الحجم الإجمالي' : 'Total Volume'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalVolume.toLocaleString()}
            </span>
          </div>
          <div style={{ borderInlineStart: '1px solid var(--border-color)', paddingInlineStart: '20px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              {lang === 'ar' ? 'المعدل اليومي' : 'Daily Average'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {avgVolume.toLocaleString()}
            </span>
          </div>
          <div style={{ borderInlineStart: '1px solid var(--border-color)', paddingInlineStart: '20px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
              {lang === 'ar' ? 'حجم الذروة' : 'Peak Volume'}
            </span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {peakVolume.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Interactive Legend Toggles */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
            <button 
              onClick={() => setShowEmail(!showEmail)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showEmail ? 'var(--bg-color)' : 'transparent',
                border: showEmail ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                opacity: showEmail ? 1 : 0.5,
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              title={lang === 'ar' ? 'تفعيل/تعطيل البريد الإلكتروني' : 'Toggle Email Line'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-color)' }}></span>
              <span style={{ fontWeight: 600, fontSize: '12px', color: showEmail ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'Email' : 'البريد'}</span>
            </button>
            
            <button 
              onClick={() => setShowSms(!showSms)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showSms ? 'var(--bg-color)' : 'transparent',
                border: showSms ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                opacity: showSms ? 1 : 0.5,
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              title={lang === 'ar' ? 'تفعيل/تعطيل الـ SMS' : 'Toggle SMS Line'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
              <span style={{ fontWeight: 600, fontSize: '12px', color: showSms ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'SMS' : 'الـ SMS'}</span>
            </button>

            <button 
              onClick={() => setShowWhatsapp(!showWhatsapp)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: showWhatsapp ? 'var(--bg-color)' : 'transparent',
                border: showWhatsapp ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                opacity: showWhatsapp ? 1 : 0.5,
                padding: '6px 12px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
              title={lang === 'ar' ? 'تفعيل/تعطيل الواتساب' : 'Toggle WhatsApp Line'}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }}></span>
              <span style={{ fontWeight: 600, fontSize: '12px', color: showWhatsapp ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{lang === 'en' ? 'WhatsApp' : 'الواتساب'}</span>
            </button>
          </div>
        </div>

        {/* SVG Render */}
        <div style={{ width: '100%', overflowX: 'auto', direction: 'ltr', position: 'relative' }}>
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ width: '100%', minWidth: '550px', height: 'auto', display: 'block', overflow: 'visible' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <defs>
              <linearGradient id="emailGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="smsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--success-color)" stopOpacity="0.15" />
                <stop offset="100%" stopColor="var(--success-color)" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="whatsappGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--channel-whatsapp)" stopOpacity="0.15" />
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

            {/* Node Dots & glowing halos */}
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
            minWidth: `${(chartWidth / width) * 550}px`,
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

          {/* Interactive HTML Tooltip outside SVG */}
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
              borderRadius: '6px',
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
                  <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].email}</span>
                </div>
              )}
              
              {showSms && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></span>
                    <span>{lang === 'ar' ? 'الـ SMS:' : 'SMS:'}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].sms}</span>
                </div>
              )}
              
              {showWhatsapp && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--channel-whatsapp)' }}></span>
                    <span>{lang === 'ar' ? 'الواتساب:' : 'WhatsApp:'}</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>{chartData[hoveredIdx].whatsapp}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '4px', marginTop: '4px', fontWeight: 700 }}>
                <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span style={{ color: 'var(--accent-color)' }}>
                  {(showEmail ? chartData[hoveredIdx].email : 0) + 
                   (showSms ? chartData[hoveredIdx].sms : 0) + 
                   (showWhatsapp ? chartData[hoveredIdx].whatsapp : 0)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <BentoCard className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.totalEmails}</span>
            <div className="card-icon-circle" style={{ backgroundColor: 'rgba(0, 112, 243, 0.08)' }}>
              <Mail size={15} color="#0070f3" />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{emailCount}</div>
          <div style={{ marginTop: '8px' }}>
            <span className="trend-pill up">
              <TrendingUp size={11} />
              <span>+12% {lang === 'en' ? 'this week' : 'هذا الأسبوع'}</span>
            </span>
          </div>
        </BentoCard>

        <BentoCard className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.totalSMS}</span>
            <div className="card-icon-circle" style={{ backgroundColor: 'rgba(76, 217, 100, 0.08)' }}>
              <Phone size={15} color="#22c55e" />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{smsCount}</div>
          <div style={{ marginTop: '8px' }}>
            <span className="trend-pill up">
              <TrendingUp size={11} />
              <span>+8% {lang === 'en' ? 'this week' : 'هذا الأسبوع'}</span>
            </span>
          </div>
        </BentoCard>

        <BentoCard className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.totalWA}</span>
            <div className="card-icon-circle" style={{ backgroundColor: 'rgba(37, 211, 102, 0.08)' }}>
              <MessageSquare size={15} color="#12b050" />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{waCount}</div>
          <div style={{ marginTop: '8px' }}>
            <span className="trend-pill up">
              <TrendingUp size={11} />
              <span>+24% {lang === 'en' ? 'this week' : 'هذا الأسبوع'}</span>
            </span>
          </div>
        </BentoCard>

        <BentoCard className="card" style={{ padding: '16px 20px', backgroundColor: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.deliveryRate}</span>
            <div className="card-icon-circle" style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}>
              <CheckCircle2 size={15} color="var(--success-color)" />
            </div>
          </div>
          <div className="card-value" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>{deliveryRateValue}%</div>
          <div style={{ marginTop: '8px' }}>
            <span className="trend-pill neutral">
              <span>{lang === 'en' ? 'Industry standard: 98%' : 'المعيار القياسي: 98%'}</span>
            </span>
          </div>
        </BentoCard>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        {/* Recent Send Logs */}
        <div style={{ flex: 2, minWidth: '350px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>{t.recentActivity}</h2>
          <div className="table-container">
            {logs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                <AlertCircle size={28} style={{ marginBottom: '8px', color: 'var(--text-muted)' }} />
                <p>{t.noActivity}</p>
              </div>
            ) : (
              <table className="v-table">
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.channel}</th>
                    <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.recipient}</th>
                    <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.status}</th>
                    <th style={{ padding: '8px 12px', fontSize: '12px' }}>{t.time}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(-5).reverse().map((log) => (
                    <tr key={log.id}>
                      <td style={{ textTransform: 'capitalize', padding: '8px 12px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {log.type === 'email' && <Mail size={12} color="#0070f3" />}
                          {log.type === 'sms' && <Phone size={12} color="#4cd964" />}
                          {log.type === 'whatsapp' && <MessageSquare size={12} color="#25d366" />}
                          <span>{log.type}</span>
                        </div>
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '13px' }}>{log.to}</td>
                      <td style={{ padding: '8px 12px' }}>
                        <span className={`status-pill ${log.status === 'delivered' ? 'success' : 'warning'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '8px 12px' }}>
                        {new Date(log.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Iraqi Operator statistics breakdown */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>{t.operatorStats}</h2>
          <div className="card" style={{ padding: '16px' }}>
            <div style={{ marginBottom: '14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#ffcc00' }}>{lang === 'en' ? 'Zain Iraq' : 'زين العراق'}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>
                    {lang === 'en' ? 'Avg Latency: 1.1s • Delivery: 99.8%' : 'متوسط التأخير: 1.1 ثانية • التوصيل: 99.8%'}
                  </span>
                </div>
                <span style={{ fontWeight: 700 }}>{zainPercent || 0}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${zainPercent || 0}%`, backgroundColor: '#ffcc00' }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <div className="flex-between" style={{ marginBottom: '4px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#ff3366' }}>{lang === 'en' ? 'AsiaCell' : 'آسياسيل'}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>
                    {lang === 'en' ? 'Avg Latency: 0.9s • Delivery: 99.9%' : 'متوسط التأخير: 0.9 ثانية • التوصيل: 99.9%'}
                  </span>
                </div>
                <span style={{ fontWeight: 700 }}>{asiacellPercent || 0}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${asiacellPercent || 0}%`, backgroundColor: '#ff3366' }}></div>
              </div>
            </div>

            <div>
              <div className="flex-between" style={{ marginBottom: '4px', fontSize: '13px' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#00bfff' }}>{lang === 'en' ? 'Korek Telecom' : 'كورك تليكوم'}</span>
                  <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '1px' }}>
                    {lang === 'en' ? 'Avg Latency: 1.4s • Delivery: 99.2%' : 'متوسط التأخير: 1.4 ثانية • التوصيل: 99.2%'}
                  </span>
                </div>
                <span style={{ fontWeight: 700 }}>{korekPercent || 0}%</span>
              </div>
              <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${korekPercent || 0}%`, backgroundColor: '#00bfff' }}></div>
              </div>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4, borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              {lang === 'en' 
                ? 'Calculated dynamically based on +964 phone number prefixes sent via APIs.'
                : 'يتم احتساب النسب تلقائياً بناءً على بادئات الأرقام العراقية (+964) التي تستقبل رسائل الـ SMS والـ WhatsApp.'}
            </div>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
};
