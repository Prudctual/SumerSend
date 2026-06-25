

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, Phone, MessageSquare, AlertCircle, Search, FileText, Download, ChevronDown, Copy, Check, Server, CheckCheck } from 'lucide-react';
import { ScrollReveal, BentoCard } from './LandingView';
import { GuideBanner } from './GuideBanner';

interface LogsViewProps {
  lang: 'en' | 'ar';
  logs: any[];
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
  hideHeader?: boolean;
}

export const LogsView: React.FC<LogsViewProps> = ({ lang, logs, setLogs, hideHeader = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [showGuide, setShowGuide] = useState(true);
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<'preview' | 'trace' | 'payload'>('preview');
  const [copiedPayload, setCopiedPayload] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setSelectedLog(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getTraceEvents = (log: any) => {
    const time = new Date(log.timestamp);
    const isDelivered = log.status === 'delivered';
    
    const step1Time = new Date(time.getTime() - 1200).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const step2Time = new Date(time.getTime() - 950).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const step3Time = new Date(time.getTime() - 350).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const step4Time = time.toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const events = [
      {
        title: lang === 'en' ? 'API Request Received' : 'تم استلام طلب الـ API',
        desc: lang === 'en' ? 'Client authenticated and payload validated successfully.' : 'تم التحقق من هوية العميل والتحقق من صحة البيانات المرسلة.',
        time: step1Time,
        status: 'success'
      },
      {
        title: lang === 'en' ? 'Enqueued for Processing' : 'تمت الإضافة إلى صف المعالجة',
        desc: lang === 'en' ? `Message added to queue. Queue ID: q_${log.id}` : `تم إدراج الرسالة في صف الإرسال الذكي. رقم الصف: q_${log.id}`,
        time: step2Time,
        status: 'success'
      }
    ];

    if (log.type === 'email') {
      events.push({
        title: lang === 'en' ? 'SMTP Handshake' : 'اتصال بروتوكول SMTP',
        desc: lang === 'en' ? 'Established connection with Sumer SMTP Relay Server.' : 'تم إنشاء اتصال آمن بنجاح مع سيرفر ترحيل البريد الإلكتروني.',
        time: step3Time,
        status: 'success'
      });
      events.push({
        title: isDelivered ? (lang === 'en' ? 'Email Delivered' : 'تم تسليم البريد الإلكتروني') : (lang === 'en' ? 'Email Delivery Failed' : 'فشل تسليم البريد الإلكتروني'),
        desc: isDelivered 
          ? (lang === 'en' ? `Server responded: 250 OK (Queued mail for delivery to ${log.to})` : `استجابة السيرفر: 250 OK (تم قبول البريد للتوصيل إلى ${log.to})`)
          : (lang === 'en' ? 'Server responded: 550 User mailbox unavailable' : 'استجابة السيرفر: 550 صندوق بريد المستخدم غير متوفر'),
        time: step4Time,
        status: isDelivered ? 'success' : 'failed'
      });
    } else if (log.type === 'sms') {
      const carrier = log.to.startsWith('078') || log.to.startsWith('079') ? 'Zain Iraq' : log.to.startsWith('077') ? 'Asiacell' : 'Korek Telecom';
      events.push({
        title: lang === 'en' ? `Routed to ${carrier} SMSC` : `توجيه الرسالة إلى مركز خدمة ${carrier}`,
        desc: lang === 'en' ? `Connecting to regional SMS Center via SMPP v3.4.` : `تم الاتصال ببوابة إرسال الرسائل الإقليمية عبر بروتوكول SMPP v3.4.`,
        time: step3Time,
        status: 'success'
      });
      events.push({
        title: isDelivered ? (lang === 'en' ? 'SMS Delivered' : 'تم تسليم الرسالة القصيرة') : (lang === 'en' ? 'SMS Delivery Failed' : 'فشل تسليم الرسالة القصيرة'),
        desc: isDelivered
          ? (lang === 'en' ? `Handset confirmed receipt (DR status: DELIVRD).` : `أكد جهاز الهاتف الاستلام بنجاح (حالة التقرير: تم التسليم).`)
          : (lang === 'en' ? 'Delivery expired or handset unreachable.' : 'انتهت صلاحية الإرسال أو تعذر الوصول إلى الهاتف.'),
        time: step4Time,
        status: isDelivered ? 'success' : 'failed'
      });
    } else {
      events.push({
        title: lang === 'en' ? 'Meta Cloud API Handshake' : 'اتصال بوابة Meta Cloud API',
        desc: lang === 'en' ? 'Payload successfully dispatched to WhatsApp Enterprise API.' : 'تم إرسال الطلب بنجاح إلى واجهة برمجة تطبيقات واتساب للأعمال.',
        time: step3Time,
        status: 'success'
      });
      events.push({
        title: isDelivered ? (lang === 'en' ? 'WhatsApp Message Delivered' : 'تم تسليم رسالة الواتساب') : (lang === 'en' ? 'WhatsApp Delivery Failed' : 'فشل تسليم رسالة الواتساب'),
        desc: isDelivered
          ? (lang === 'en' ? 'Recipient device received message (Double checkmarks active).' : 'استلم جهاز المتلقي الرسالة (علامات الصح المزدوجة نشطة).')
          : (lang === 'en' ? 'Recipient number is not registered on WhatsApp.' : 'رقم المستلم غير مسجل في خدمة واتساب.'),
        time: step4Time,
        status: isDelivered ? 'success' : 'failed'
      });
    }

    return events;
  };

  const getMetadataDetails = (log: any) => {
    const isDelivered = log.status === 'delivered';
    const provider = log.type === 'email' 
      ? 'Sumer SMTP Relay Engine' 
      : log.type === 'sms' 
        ? (log.to.startsWith('078') || log.to.startsWith('079') ? 'Zain SMS Gateway' : log.to.startsWith('077') ? 'Asiacell SMS Gateway' : 'Korek SMS Gateway')
        : 'Meta Cloud API (WhatsApp Business)';

    // Estimate size of message body
    const sizeBytes = new Blob([log.body]).size;

    return {
      statusCode: isDelivered ? '200 OK' : '500 Error',
      latency: log.type === 'email' ? '312ms' : log.type === 'sms' ? '145ms' : '204ms',
      provider,
      ip: '109.127.80.34 (Baghdad-IDC)',
      size: `${sizeBytes} Bytes`
    };
  };

  const handleCopyPayload = (log: any) => {
    const jsonStr = JSON.stringify(log, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleClearLogs = () => {
    const confirmMsg = lang === 'en' 
      ? 'Are you sure you want to clear all logs? This cannot be undone.' 
      : 'هل أنت متأكد من مسح جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.';
    if (window.confirm(confirmMsg)) {
      fetch('http://127.0.0.1:3000/api/logs', {
        method: 'DELETE'
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLogs([]);
          }
        })
        .catch(err => {
          console.error('Failed to clear logs on server:', err);
          setLogs([]);
        });
    }
  };

  const translations = {
    en: {
      title: 'Sending Logs & Traces',
      subtitle: 'Complete chronological history of sent emails, SMS, and WhatsApp messages.',
      searchPlaceholder: 'Search by recipient, subject, or content...',
      all: 'All Statuses',
      delivered: 'Delivered',
      failed: 'Failed / Pending',
      allChannels: 'All Channels',
      email: 'Email',
      sms: 'SMS',
      whatsapp: 'WhatsApp',
      id: 'Log ID',
      channel: 'Channel',
      from: 'From',
      to: 'To',
      subject: 'Subject / Content Preview',
      status: 'Status',
      time: 'Time',
      empty: 'No match found in logs history.',
      guideTitle: 'Understanding Send Traces & Webhooks',
      guideText: 'Track message states in real time from dispatch to delivery. In production, delivery status updates (Delivered, Bounced, Opened) are pushed automatically to your server via Webhooks.',
    },
    ar: {
      title: 'سجلات الإرسال والتتبع',
      subtitle: 'سجل تاريخي كامل لعمليات إرسال البريد الإلكتروني والـ SMS والواتساب المحدثة حياً.',
      searchPlaceholder: 'ابحث بالمستقبل، العنوان أو محتوى الرسالة...',
      all: 'جميع الحالات',
      delivered: 'تم التوصيل',
      failed: 'فشل / معلق',
      allChannels: 'جميع القنوات',
      email: 'البريد الإلكتروني',
      sms: 'الرسائل النصية SMS',
      whatsapp: 'الواتساب',
      id: 'رقم السجل',
      channel: 'القناة',
      from: 'المرسل',
      to: 'المستقبل',
      subject: 'الموضوع / معاينة المحتوى',
      status: 'الحالة',
      time: 'الوقت',
      empty: 'لم يتم العثور على نتائج في سجلات الإرسال.',
      guideTitle: 'تتبع مسار الرسائل والـ Webhooks',
      guideText: 'تتبع حالة رسائلك لحظياً من الإرسال وحتى التسليم. في بيئة الإنتاج، يتم إرسال تحديثات الحالة (تم التسليم، ارتداد، فتح) تلقائياً لخادمك عبر الويب هوكس.',
    },
  };

  const t = translations[lang];

  // Filter logs based on search, status and channel filters
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.to.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (log.subject && log.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.body && log.body.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'delivered' && log.status === 'delivered') ||
      (statusFilter === 'failed' && log.status !== 'delivered');

    const matchesChannel = 
      channelFilter === 'all' || 
      log.type === channelFilter;

    return matchesSearch && matchesStatus && matchesChannel;
  });

  const exportToJSON = () => {
    const dataStr = JSON.stringify(filteredLogs, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sumer_send_logs_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToCSV = () => {
    const headers = ['Log ID', 'Channel', 'From', 'To', 'Subject/Content', 'Status', 'Timestamp'];
    const csvRows = [headers.join(',')];

    filteredLogs.forEach(log => {
      const row = [
        log.id,
        log.type,
        log.from || '',
        log.to,
        log.type === 'email' ? (log.subject || '') : (log.body || ''),
        log.status,
        log.timestamp
      ];
      csvRows.push(row.map(val => {
        const str = typeof val === 'string' ? val : String(val);
        return `"${str.replaceAll('"', '""')}"`;
      }).join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sumer_send_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  return (
    <ScrollReveal>
      <div style={{ marginBottom: '20px' }} className="flex-between">
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          {/* Export Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button 
              className="btn" 
              style={{ 
                fontSize: '12px', 
                padding: '6px 12px', 
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={14} />
              <span>{lang === 'en' ? 'Export Data' : 'تصدير البيانات'}</span>
              <ChevronDown size={12} style={{ transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {showExportMenu && (
              <>
                <div 
                  style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 998 }}
                  onClick={() => setShowExportMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: lang === 'en' ? 0 : 'auto',
                  left: lang === 'ar' ? 0 : 'auto',
                  marginTop: '8px',
                  backgroundColor: 'var(--panel-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  padding: '6px 0',
                  minWidth: '155px',
                  zIndex: 999,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <button
                    onClick={exportToCSV}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      background: 'none',
                      border: 'none',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FileText size={12} />
                    <span>{lang === 'en' ? 'Export as CSV' : 'تصدير بصيغة CSV'}</span>
                  </button>
                  <button
                    onClick={exportToJSON}
                    style={{
                      padding: '8px 16px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      background: 'none',
                      border: 'none',
                      textAlign: lang === 'ar' ? 'right' : 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.15s',
                      width: '100%'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FileText size={12} />
                    <span>{lang === 'en' ? 'Export as JSON' : 'تصدير بصيغة JSON'}</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <button 
            className="btn" 
            style={{ 
              fontSize: '12px', 
              padding: '6px 12px', 
              borderColor: 'var(--danger-text)', 
              color: 'var(--danger-text)', 
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }} 
            onClick={handleClearLogs}
          >
            {lang === 'en' ? 'Clear Logs' : 'تفريغ السجلات'}
          </button>
        </div>
      </div>



      {/* Filters Bar */}
      <div className="card" style={{ padding: '20px', marginBottom: '20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <div style={{ flex: 2, minWidth: '240px', position: 'relative' }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: lang === 'en' ? '12px' : 'auto', right: lang === 'ar' ? '12px' : 'auto', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            ref={searchInputRef}
            type="text"
            className="form-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ paddingLeft: lang === 'en' ? '36px' : '12px', paddingRight: lang === 'ar' ? '36px' : '12px' }}
          />
        </div>

        {/* Channel Filter */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <select
            className="form-input"
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            style={{ 
              appearance: 'none', 
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', 
              backgroundSize: '16px',
              paddingLeft: lang === 'ar' ? '36px' : '12px',
              paddingRight: lang === 'en' ? '36px' : '12px'
            }}
          >
            <option value="all">{t.allChannels}</option>
            <option value="email">{t.email}</option>
            <option value="sms">{t.sms}</option>
            <option value="whatsapp">{t.whatsapp}</option>
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ flex: 1, minWidth: '150px' }}>
          <select
            className="form-input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              appearance: 'none', 
              backgroundImage: 'url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23888\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'/%3E%3C/svg%3E")', 
              backgroundRepeat: 'no-repeat', 
              backgroundPosition: lang === 'en' ? 'right 12px center' : 'left 12px center', 
              backgroundSize: '16px',
              paddingLeft: lang === 'ar' ? '36px' : '12px',
              paddingRight: lang === 'en' ? '36px' : '12px'
            }}
          >
            <option value="all">{t.all}</option>
            <option value="delivered">{t.delivered}</option>
            <option value="failed">{t.failed}</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="table-container">
        {filteredLogs.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            <AlertCircle size={32} style={{ marginBottom: '10px', color: 'var(--text-muted)' }} />
            <p>{t.empty}</p>
          </div>
        ) : (
          <table className="v-table">
            <thead>
              <tr>
                <th style={{ width: '10%' }}>{t.id}</th>
                <th>{t.channel}</th>
                <th>{t.from}</th>
                <th>{t.to}</th>
                <th style={{ width: '35%' }}>{t.subject}</th>
                <th>{t.status}</th>
                <th>{t.time}</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.slice().reverse().map((log) => (
                <tr key={log.id} onClick={() => { setSelectedLog(log); setActiveDetailTab('preview'); setCopiedPayload(false); }} style={{ transition: 'background-color 0.15s ease' }}>
                  <td className="tabular-nums-stat" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    #{log.id.slice(-6)}
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.type === 'email' && <Mail size={14} color="#0070f3" />}
                      {log.type === 'sms' && <Phone size={14} color="#4cd964" />}
                      {log.type === 'whatsapp' && <MessageSquare size={14} color="#25d366" />}
                      <span>{log.type}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={log.from}>
                    {log.from}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={log.to}>
                    {log.to}
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.type === 'email' ? log.subject : log.body}>
                    {log.type === 'email' ? log.subject : log.body}
                  </td>
                  <td>
                    <span className={`status-chip status-chip-${log.status === 'delivered' ? 'success' : 'warning'}`}>
                      {log.status === 'delivered' ? t.delivered : t.failed}
                    </span>
                  </td>
                  <td className="tabular-nums-stat" style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Details Side Drawer Panel */}
      {selectedLog && createPortal(
        <div 
          className={`drawer-overlay ${lang === 'ar' ? 'rtl' : 'ltr'}`}
          onClick={() => setSelectedLog(null)}
        >
          <div 
            className={`drawer-card ${lang === 'ar' ? 'rtl' : 'ltr'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                  {lang === 'ar' ? 'تفاصيل الإرسال والتتبع' : 'Log Trace Details'}
                </h3>
                <span className={`status-chip status-chip-${selectedLog.status === 'delivered' ? 'success' : 'warning'}`} style={{ fontSize: '11px', padding: '2px 8px' }}>
                  {selectedLog.status === 'delivered' ? t.delivered : t.failed}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  #{selectedLog.id}
                </span>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedLog(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 'normal',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="vercel-tabs-container" style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <button 
                onClick={() => setActiveDetailTab('preview')}
                className={`vercel-tab-btn ${activeDetailTab === 'preview' ? 'active' : ''}`}
              >
                <span>{lang === 'ar' ? 'معاينة' : 'Preview'}</span>
              </button>
              <button 
                onClick={() => setActiveDetailTab('trace')}
                className={`vercel-tab-btn ${activeDetailTab === 'trace' ? 'active' : ''}`}
              >
                <span>{lang === 'ar' ? 'تتبع الإرسال' : 'Delivery Trace'}</span>
              </button>
              <button 
                onClick={() => setActiveDetailTab('payload')}
                className={`vercel-tab-btn ${activeDetailTab === 'payload' ? 'active' : ''}`}
              >
                <span>{lang === 'ar' ? 'بيانات الـ JSON' : 'JSON Payload'}</span>
              </button>
            </div>

            {/* Tab Contents Container */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              {/* TAB 1: PREVIEW */}
              {activeDetailTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Info Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '100px 1fr', 
                    gap: '8px 12px', 
                    fontSize: '13px', 
                    backgroundColor: 'var(--bg-color)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    lineHeight: 1.5
                  }}>
                    <strong style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'القناة:' : 'Channel:'}</strong>
                    <span style={{ textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                      {selectedLog.type === 'email' && <Mail size={14} color="#0070f3" />}
                      {selectedLog.type === 'sms' && <Phone size={14} color="#4cd964" />}
                      {selectedLog.type === 'whatsapp' && <MessageSquare size={14} color="#25d366" />}
                      <span>{selectedLog.type}</span>
                    </span>

                    <strong style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المرسل:' : 'From:'}</strong>
                    <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedLog.from || '-'}</span>

                    <strong style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'المستقبل:' : 'To:'}</strong>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', wordBreak: 'break-all' }}>{selectedLog.to}</span>

                    {selectedLog.type === 'email' && selectedLog.subject && (
                      <>
                        <strong style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الموضوع:' : 'Subject:'}</strong>
                        <span style={{ fontWeight: 500 }}>{selectedLog.subject}</span>
                      </>
                    )}

                    <strong style={{ color: 'var(--text-muted)' }}>{lang === 'ar' ? 'الوقت:' : 'Time:'}</strong>
                    <span>{new Date(selectedLog.timestamp).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ')}</span>
                  </div>

                  {/* Simulator Device Frames */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 650, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileText size={14} color="var(--text-secondary)" />
                      <span>{lang === 'ar' ? 'معاينة محتوى الرسالة' : 'Sent Message Preview'}</span>
                    </h4>

                    {selectedLog.type === 'email' ? (
                      /* Clean Email Frame */
                      <div style={{ width: '100%' }}>
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
                              <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet">
                                <style>
                                  html, body {
                                    margin: 0;
                                    padding: 0;
                                    width: 100%;
                                    font-family: 'Cairo', -apple-system, sans-serif;
                                    background-color: transparent;
                                  }
                                  * {
                                    box-sizing: border-box;
                                  }
                                  img, table, td, div {
                                    max-width: 100% !important;
                                  }
                                </style>
                              </head>
                              <body>
                                ${selectedLog.body}
                              </body>
                            </html>
                          `}
                          title="Logs Email Preview"
                          onLoad={(e) => {
                            const iframe = e.currentTarget;
                            if (iframe.contentWindow) {
                              // Reset height to measure true content height
                              iframe.style.height = '0px';
                              iframe.style.height = `${iframe.contentWindow.document.body.scrollHeight}px`;
                            }
                          }}
                          style={{
                            width: '100%',
                            height: '200px',
                            border: 'none',
                            display: 'block',
                            backgroundColor: 'transparent'
                          }}
                        />
                      </div>
                    ) : selectedLog.type === 'whatsapp' ? (
                      /* WhatsApp Simulator Mockup */
                      <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'var(--whatsapp-chat-bg)',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {/* WhatsApp Top Bar */}
                        <div style={{
                          backgroundColor: '#008069',
                          color: '#ffffff',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          direction: 'ltr'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '18px', cursor: 'pointer', opacity: 0.8 }}>←</span>
                            <div style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              backgroundColor: '#128c7e',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              fontSize: '14px',
                              color: '#ffffff',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                            }}>
                              S
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>Sumer Send API</span>
                                <span style={{
                                  backgroundColor: '#ffffff',
                                  color: '#008069',
                                  borderRadius: '50%',
                                  width: '12px',
                                  height: '12px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '8px',
                                  fontWeight: 'bold'
                                }}>✓</span>
                              </div>
                              <span style={{ fontSize: '10px', opacity: 0.85 }}>
                                {lang === 'ar' ? 'حساب أعمال موثق' : 'Verified Business'}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '14px', fontSize: '16px', opacity: 0.9 }}>
                            <span>📞</span>
                            <span>⋮</span>
                          </div>
                        </div>

                        {/* WhatsApp Message Panel */}
                        <div style={{
                          padding: '16px',
                          backgroundColor: 'var(--whatsapp-chat-bg)',
                          backgroundImage: 'var(--whatsapp-chat-bg-pattern)',
                          backgroundSize: '10px 10px',
                          backgroundPosition: '0 0, 5px 5px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ alignSelf: 'center', margin: '8px 0', padding: '4px 12px', backgroundColor: 'rgba(255, 255, 255, 0.75)', color: '#54656f', fontSize: '10px', borderRadius: '6px', boxShadow: '0 1px 1px rgba(0,0,0,0.05)', textTransform: 'uppercase' }}>
                            {lang === 'ar' ? 'اليوم' : 'Today'}
                          </div>

                          <div style={{
                            alignSelf: 'flex-end',
                            maxWidth: '85%',
                            backgroundColor: 'var(--whatsapp-bubble-bg)',
                            color: 'var(--whatsapp-bubble-text)',
                            borderRadius: '8px',
                            borderTopRightRadius: '0',
                            padding: '8px 12px 6px 12px',
                            position: 'relative',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.12)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            direction: 'ltr',
                            textAlign: 'left'
                          }}>
                            <p style={{
                              fontSize: '13px',
                              lineHeight: '1.5',
                              margin: '0 0 4px 0',
                              whiteSpace: 'pre-line',
                              alignSelf: 'flex-start'
                            }}>
                              {selectedLog.body}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '9px', color: 'var(--whatsapp-bubble-meta)' }}>
                              <span>{new Date(selectedLog.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })}</span>
                              {selectedLog.status === 'delivered' ? (
                                <CheckCheck size={14} color="#53bdeb" />
                              ) : (
                                <Check size={14} />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* SMS Simulator Mockup */
                      <div style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'var(--sms-chat-bg)',
                        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}>
                        {/* SMS Top Bar */}
                        <div style={{
                          backgroundColor: 'var(--panel-bg)',
                          borderBottom: '1px solid var(--border-color)',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          direction: 'ltr'
                        }}>
                          <span style={{ color: 'var(--accent-color)', fontSize: '14px', cursor: 'pointer' }}>
                            {lang === 'ar' ? '← الرسائل' : '← Messages'}
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                              {selectedLog.to.slice(0, 15)}
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                              {lang === 'ar' ? 'عبر بوابة الرسائل' : 'via SMS Gateway'}
                            </span>
                          </div>
                          <span style={{ color: 'var(--accent-color)', fontSize: '14px', cursor: 'pointer', visibility: 'hidden' }}>
                            Edit
                          </span>
                        </div>

                        {/* SMS Message panel */}
                        <div style={{
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <div style={{ alignSelf: 'center', margin: '8px 0', color: 'var(--text-muted)', fontSize: '10px' }}>
                            {new Date(selectedLog.timestamp).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                          </div>

                          <div style={{
                            alignSelf: 'flex-end',
                            maxWidth: '80%',
                            backgroundColor: 'var(--sms-bubble-bg)',
                            color: 'var(--sms-bubble-text)',
                            borderRadius: '18px',
                            borderBottomRightRadius: '4px',
                            padding: '10px 14px',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                            direction: 'ltr',
                            textAlign: 'left'
                          }}>
                            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-line' }}>
                              {selectedLog.body}
                            </p>
                          </div>
                          
                          {selectedLog.status === 'delivered' && (
                            <span style={{
                              alignSelf: 'flex-end',
                              fontSize: '10px',
                              color: 'var(--text-muted)',
                              marginTop: '4px',
                              marginRight: '6px'
                            }}>
                              {lang === 'ar' ? 'تم تسليمها' : 'Delivered'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: DELIVERY TRACE */}
              {activeDetailTab === 'trace' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ 
                    backgroundColor: 'var(--bg-color)',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                  }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                      {lang === 'ar' ? 'خط التتبع الزمني للإرسال' : 'Delivery Audit Timeline'}
                    </h4>

                    {/* Timeline Flow */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                      {getTraceEvents(selectedLog).map((event, idx, arr) => {
                        const isSuccess = event.status === 'success';
                        const isLast = idx === arr.length - 1;
                        return (
                          <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                            {/* Icon & Connector Line */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                              <div style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: isSuccess ? 'var(--success-bg)' : 'var(--danger-bg)',
                                border: `2px solid ${isSuccess ? 'var(--success-color)' : 'var(--danger-color)'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2
                              }}>
                                <div style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: isSuccess ? 'var(--success-text)' : 'var(--danger-text)'
                                }} />
                              </div>
                              {!isLast && (
                                <div style={{
                                  width: '2px',
                                  flex: 1,
                                  backgroundColor: 'var(--border-color)',
                                  margin: '4px 0'
                                }} />
                              )}
                            </div>

                            {/* Event Content */}
                            <div style={{ flex: 1, paddingBottom: isLast ? '0' : '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px', marginBottom: '4px' }}>
                                <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                                  {event.title}
                                </h5>
                                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                                  {event.time}
                                </span>
                              </div>
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', margin: 0 }}>
                                {event.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Diagnostic Information */}
                  <div style={{
                    backgroundColor: 'var(--bg-color)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <Server size={14} color="var(--text-muted)" />
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {lang === 'ar' ? 'تفاصيل الاتصال وخادم البوابة' : 'Relay Gateway & Connection Details'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      {[
                        { label: lang === 'ar' ? 'رمز الحالة' : 'Status Code', value: getMetadataDetails(selectedLog).statusCode, isBadge: true },
                        { label: lang === 'ar' ? 'زمن الاستجابة' : 'Latency', value: getMetadataDetails(selectedLog).latency },
                        { label: lang === 'ar' ? 'عنوان خادم الإرسال' : 'Gateway Host IP', value: getMetadataDetails(selectedLog).ip },
                        { label: lang === 'ar' ? 'حجم الرسالة' : 'Payload Size', value: getMetadataDetails(selectedLog).size },
                        { label: lang === 'ar' ? 'بوابة التوصيل' : 'Delivery Provider', value: getMetadataDetails(selectedLog).provider },
                      ].map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                          {item.isBadge ? (
                            <span className={`status-chip status-chip-${selectedLog.status === 'delivered' ? 'success' : 'warning'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                              {item.value}
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'monospace', fontWeight: 500, color: 'var(--text-primary)' }}>
                              {item.value}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: JSON PAYLOAD */}
              {activeDetailTab === 'payload' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {lang === 'ar' ? 'بيانات الـ JSON الكاملة للطلب:' : 'Raw JSON log record:'}
                    </span>
                    <button
                      onClick={() => handleCopyPayload(selectedLog)}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-color)'}
                    >
                      {copiedPayload ? (
                        <>
                          <Check size={12} color="var(--success-text)" />
                          <span style={{ color: 'var(--success-text)' }}>{lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>{lang === 'ar' ? 'نسخ البيانات' : 'Copy Payload'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre style={{
                    margin: 0,
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#09090b',
                    color: '#e4e4e7',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    overflowX: 'auto',
                    maxHeight: '480px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                    direction: 'ltr'
                  }}>
                    <code>{JSON.stringify(selectedLog, null, 2)}</code>
                  </pre>
                </div>
              )}

            </div>
          </div>
        </div>,
        document.body
      )}
    </ScrollReveal>
  );
};
