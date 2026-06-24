

import React, { useState, useMemo, useEffect } from 'react';
import { Wallet, Plus, Clock, Shield, AlertCircle, ArrowUpRight, BarChart3, Settings, CreditCard, Download, CheckCircle2, Mail, MessageSquare, Phone, Zap, Layers } from 'lucide-react';
import confetti from 'canvas-confetti';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScrollReveal, BentoCard } from './LandingView';

interface BillingViewProps {
  lang: 'en' | 'ar';
  walletBalance: number;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  transactions: any[];
  setTransactions: React.Dispatch<React.SetStateAction<any[]>>;
}

export const BillingView: React.FC<BillingViewProps> = ({
  lang,
  walletBalance,
  setWalletBalance,
  transactions,
  setTransactions,
}) => {
  const [activeTab, setActiveTab] = useState<'wallet' | 'tariff'>('wallet');
  const [showZainModal, setShowZainModal] = useState(false);
  const [showFastPayModal, setShowFastPayModal] = useState(false);
  const [amount, setAmount] = useState('25000');
  const [phoneNumber, setPhoneNumber] = useState('07801234567');
  const [pin, setPin] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [showGuide, setShowGuide] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const [autoTopUp, setAutoTopUp] = useState(false);
  const [txFilter, setTxFilter] = useState<'all' | 'topup' | 'usage'>('all');

  const translations = {
    en: {
      title: 'Wallet & Billing',
      subtitle: 'Manage your balances, review usage, and top up via local Iraqi gateways.',
      currentBalance: 'Available Balance',
      totalSpent: 'Total Spent This Month',
      topUpBtn: 'Top Up Wallet',
      zainCash: 'Zain Cash',
      fastPay: 'FastPay',
      recentTx: 'Transactions History',
      txId: 'Tx ID',
      provider: 'Provider / Type',
      amountText: 'Amount',
      status: 'Status',
      date: 'Date',
      iqd: 'IQD',
      noTx: 'No transactions recorded yet.',
      walletNum: 'Wallet Number',
      walletPin: 'Wallet PIN (4 Digits)',
      walletOtp: 'Enter OTP Code',
      payBtn: 'Proceed to Pay',
      verifyBtn: 'Verify & Complete Payment',
      cancel: 'Cancel',
      phoneError: 'Please enter a valid Iraqi phone number (e.g. 07801234567).',
      pinError: 'Please enter a 4-digit wallet PIN.',
      otpError: 'Please enter the 6-digit OTP code sent to your phone.',
      guideTitle: 'Local Iraqi Payments & Billing',
      guideText: 'Sumer Send operates natively in Iraqi Dinars (IQD). Easily load your wallet or set up automatic top-ups using Zain Cash and FastPay.',
      usageTitle: 'Usage Analytics',
      autoTopUpTitle: 'Auto-Top Up',
      autoTopUpDesc: 'Automatically reload 25,000 IQD when balance falls below 10,000 IQD.',
      savedWallets: 'Saved Payment Methods',
      pricingTitle: 'Pricing & Tariffs',
      emailTariff: '10 IQD / Email',
      smsTariff: '120 IQD / SMS',
      waTariff: '150 IQD / WhatsApp',
      downloadInvoice: 'Invoice',
      filterAll: 'All',
      filterTopup: 'Top-ups',
      filterUsage: 'Usage',
      exportCSV: 'Export CSV',
    },
    ar: {
      title: 'المحفظة والشحن',
      subtitle: 'إدارة الرصيد، مراجعة الاستهلاك، والشحن عبر بوابات الدفع المحلية.',
      currentBalance: 'الرصيد المتاح',
      totalSpent: 'إجمالي المصروفات هذا الشهر',
      topUpBtn: 'شحن المحفظة',
      zainCash: 'زين كاش',
      fastPay: 'فاست بي',
      recentTx: 'سجل الحركات المالية',
      txId: 'رقم العملية',
      provider: 'النوع / البوابة',
      amountText: 'المبلغ',
      status: 'الحالة',
      date: 'التاريخ',
      iqd: 'د.ع',
      noTx: 'لا توجد حركات مسجلة بعد.',
      walletNum: 'رقم المحفظة (رقم الهاتف)',
      walletPin: 'الرمز السري (4 أرقام)',
      walletOtp: 'أدخل رمز التحقق (OTP)',
      payBtn: 'الانتقال للدفع',
      verifyBtn: 'تأكيد ودفع المبلغ',
      cancel: 'إلغاء',
      phoneError: 'يرجى إدخال رقم هاتف عراقي صحيح (مثل 07801234567).',
      pinError: 'يرجى إدخال رمز المحفظة السري (4 أرقام).',
      otpError: 'يرجى إدخال رمز التحقق المكون من 6 أرقام.',
      guideTitle: 'بوابات الدفع والاستهلاك',
      guideText: 'تعمل المنصة بالدينار العراقي (IQD). يمكنك شحن محفظتك أو تفعيل الشحن التلقائي لتجنب توقف الخدمة بالدفع المباشر عبر زين كاش أو فاست بي.',
      usageTitle: 'إحصائيات الاستهلاك',
      autoTopUpTitle: 'الشحن التلقائي',
      autoTopUpDesc: 'شحن رصيد بقيمة 25,000 د.ع تلقائياً عندما يقل الرصيد عن 10,000 د.ع.',
      savedWallets: 'طرق الدفع المحفوظة',
      pricingTitle: 'جدول الأسعار (التعرفة)',
      emailTariff: '10 د.ع / إيميل',
      smsTariff: '120 د.ع / رسالة',
      waTariff: '150 د.ع / واتساب',
      downloadInvoice: 'فاتورة',
      filterAll: 'الكل',
      filterTopup: 'الشحن',
      filterUsage: 'الاستهلاك',
      exportCSV: 'تصدير الكشف',
    },
  };

  const t = translations[lang];

  // Mock analytics data
  const totalSpent = 14500;
  const emailSpent = 2500;
  const smsSpent = 7500;
  const waSpent = 4500;

  const handleProceedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      setError(t.phoneError);
      return;
    }
    if (!pin || pin.length !== 4) {
      setError(t.pinError);
      return;
    }
    setError('');
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setStep(2);
    }, 1000);
  };

  const handleVerifyOTP = (e: React.FormEvent, provider: 'Zain Cash' | 'FastPay') => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError(t.otpError);
      return;
    }

    setError('');
    setIsVerifying(true);
    
    const depositAmount = parseInt(amount);

    fetch('http://127.0.0.1:3000/api/wallet/topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        amount: depositAmount,
        phoneNumber: phoneNumber
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to deposit funds');
        return res.json();
      })
      .then(data => {
        if (data.balance !== undefined) {
          setWalletBalance(data.balance);
        }
        if (Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      })
      .catch(err => {
        console.error('Failed to post top-up:', err);
        // Local fallback in case server is not running
        setWalletBalance(prev => prev + depositAmount);
        const newTx = {
          id: 'TX' + Math.floor(100000 + Math.random() * 900000).toString(),
          provider,
          amount: depositAmount,
          status: 'completed',
          date: new Date().toISOString(),
          description: `Simulated top-up via ${provider}`
        };
        setTransactions([newTx, ...transactions]);
      })
      .finally(() => {
        setIsVerifying(false);
        setShowZainModal(false);
        setShowFastPayModal(false);
        setStep(1);
        setPin('');
        setOtp('');
        setError('');
      });
  };

  const [invoiceTx, setInvoiceTx] = useState<any | null>(null);

  useEffect(() => {
    if (invoiceTx) {
      setTimeout(() => {
        const element = document.getElementById('invoice-template');
        if (element) {
          // Increase scale to 3 to make text razor sharp
          html2canvas(element, { scale: 3, useCORS: true }).then((canvas) => {
            // Use JPEG at high quality (0.95) to preserve sharp edges while keeping file size low
            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            // Enable compression on the jsPDF document
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            // Add image as JPEG to optimize the stream
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
            pdf.save(`Invoice_${invoiceTx.id}.pdf`);
            setInvoiceTx(null);
          });
        }
      }, 100);
    }
  }, [invoiceTx]);

  const downloadInvoice = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      setInvoiceTx(tx);
    }
  };

  const filteredTx = useMemo(() => {
    if (txFilter === 'topup') return transactions.filter(tx => tx.provider === 'Zain Cash' || tx.provider === 'FastPay');
    if (txFilter === 'usage') return transactions.filter(tx => tx.provider !== 'Zain Cash' && tx.provider !== 'FastPay');
    return transactions;
  }, [transactions, txFilter]);

  const exportToCSV = () => {
    const BOM = '\uFEFF';
    let csvContent = BOM + `${t.txId},${t.provider},${t.amountText},${t.status},${t.date}\n`;
    
    filteredTx.forEach(tx => {
      const dateStr = new Date(tx.date).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ', { dateStyle: 'medium', timeStyle: 'short' }).replace(/,/g, '');
      const amountStr = tx.provider === 'Usage' ? `-${tx.amount}` : `+${tx.amount}`;
      const statusStr = lang === 'en' ? 'Completed' : 'مكتملة';
      csvContent += `${tx.id},${tx.provider},${amountStr},${statusStr},${dateStr}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `SumerSend_Transactions_${txFilter}_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Premium Modal Styles
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '20px', animation: 'fadeIn 0.2s ease-out'
  };

  const modalContentStyle = (color: string): React.CSSProperties => ({
    backgroundColor: 'var(--bg-color)',
    borderRadius: '12px', width: '100%', maxWidth: '400px',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--card-shadow-hover)',
    overflow: 'hidden', transform: 'translateY(0)',
    animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
  });

  return (
    <ScrollReveal>
      <div style={{ marginBottom: '20px' }} className="flex-between">
        <div>
          <h1 style={{ 
            fontSize: '26px', 
            fontWeight: 800, 
            letterSpacing: lang === 'ar' ? '0' : '-0.5px', 
            lineHeight: 1.15,
            marginBottom: '6px',
            color: 'var(--text-primary)'
          }}>{t.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>{t.subtitle}</p>
        </div>
        <button 
          className="btn" 
          style={{ 
            fontSize: '12px', 
            padding: '8px 16px',
            borderRadius: '999px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--panel-bg)',
            fontWeight: 600
          }} 
          onClick={() => setShowGuide(!showGuide)}
        >
          {showGuide ? (lang === 'en' ? 'Hide Guide' : 'إخفاء الدليل') : (lang === 'en' ? 'Show Guide' : 'عرض الدليل')}
        </button>
      </div>

      {showGuide && (
        <div className="onboarding-split-card" style={{ minHeight: '260px', borderRadius: '16px' }}>
          {/* Left Info Column */}
          <div className="onboarding-split-info" style={{ padding: '24px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{t.guideTitle}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500, margin: '0 0 20px 0', textAlign: 'start' }}>
                {t.guideText}
              </p>
            </div>
            
            {/* Rates Badges */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="sumer-badge" style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-text)', border: '1px solid var(--border-color)', padding: '4px 10px', fontSize: '11px' }}>
                {lang === 'ar' ? 'البريد: 10 د.ع' : 'Email: 10 IQD'}
              </span>
              <span className="sumer-badge" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid var(--border-color)', padding: '4px 10px', fontSize: '11px' }}>
                {lang === 'ar' ? 'رسائل SMS: 120 د.ع' : 'SMS: 120 IQD'}
              </span>
              <span className="sumer-badge" style={{ backgroundColor: 'rgba(37, 211, 102, 0.06)', color: '#12b050', border: '1px solid var(--border-color)', padding: '4px 10px', fontSize: '11px' }}>
                {lang === 'ar' ? 'الواتساب: 150 د.ع' : 'WhatsApp: 150 IQD'}
              </span>
            </div>
          </div>

          {/* Right Column with Visual comparison bar charts */}
          <div className="onboarding-split-visual" style={{ padding: '20px', borderTopRightRadius: '16px', borderBottomRightRadius: '16px' }}>
            <div className="mockup-floating-card" style={{ padding: '12px 16px', maxWidth: '240px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', textAlign: 'start' }}>
                {lang === 'ar' ? 'مقارنة تعرفة الشبكات' : 'Operator Gateway Rates'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 600, marginBottom: '2px' }}>
                    <span style={{ color: '#ffcc00' }}>Zain SMS</span>
                    <span className="tabular-nums-stat" style={{ color: 'var(--text-primary)' }}>120 IQD</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '80%', backgroundColor: '#ffcc00' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 600, marginBottom: '2px' }}>
                    <span style={{ color: '#ff3366' }}>AsiaCell SMS</span>
                    <span className="tabular-nums-stat" style={{ color: 'var(--text-primary)' }}>120 IQD</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '80%', backgroundColor: '#ff3366' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', fontWeight: 600, marginBottom: '2px' }}>
                    <span style={{ color: '#25d366' }}>WhatsApp API</span>
                    <span className="tabular-nums-stat" style={{ color: 'var(--text-primary)' }}>150 IQD</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: '#25d366' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="vercel-tabs-container" style={{ marginBottom: '24px', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('wallet')}
          className={`vercel-tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
        >
          <Wallet size={15} />
          <span>{lang === 'ar' ? 'المحفظة والشحن' : 'Wallet & Deposit'}</span>
        </button>
        <button
          onClick={() => setActiveTab('tariff')}
          className={`vercel-tab-btn ${activeTab === 'tariff' ? 'active' : ''}`}
        >
          <CreditCard size={15} />
          <span>{lang === 'ar' ? 'التعرفة وحالة الشبكات' : 'Tariff & Gateway Rates'}</span>
        </button>
      </div>

      {activeTab === 'wallet' ? (
        <>
          {/* Top Row: Balance & Analytics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            {/* Balance Card */}
            <BentoCard className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', backgroundColor: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'var(--accent-color)', opacity: 0.05, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.currentBalance}</span>
                    <span className="status-pill success">{lang === 'en' ? 'Active' : 'نشط'}</span>
                  </div>
                  <div className="card-icon-circle" style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)' }}>
                    <Wallet size={16} color="var(--accent-color)" />
                  </div>
                </div>
                <div style={{ fontSize: '36px', fontWeight: 800, margin: '12px 0 20px 0', display: 'flex', alignItems: 'baseline', gap: '6px', letterSpacing: '-1px', color: 'var(--text-primary)' }}>
                  <span>{walletBalance.toLocaleString()}</span>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.iqd}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => setShowZainModal(true)} style={{ flex: 1, gap: '8px', padding: '12px', background: '#ffcc00', color: '#000', border: '1px solid #e6b800', borderRadius: '6px', boxShadow: 'none' }}>
                  <Plus size={18} />
                  <span style={{ fontWeight: 700 }}>{t.zainCash}</span>
                </button>
                <button className="btn btn-primary" onClick={() => setShowFastPayModal(true)} style={{ flex: 1, gap: '8px', padding: '12px', background: '#ff3366', color: '#fff', border: '1px solid #d91c4d', borderRadius: '6px', boxShadow: 'none' }}>
                  <Plus size={18} />
                  <span style={{ fontWeight: 700 }}>{t.fastPay}</span>
                </button>
              </div>
            </BentoCard>

            {/* Analytics Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'start' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t.usageTitle}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.totalSpent}: <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{totalSpent.toLocaleString()} {t.iqd}</strong></span>
                </div>
                <div className="card-icon-circle" style={{ backgroundColor: 'rgba(120, 120, 120, 0.08)' }}>
                  <BarChart3 size={16} color="var(--text-secondary)" />
                </div>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
                <div>
                  <div className="flex-between" style={{ fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} color="#0070f3"/> Email</span>
                    <span style={{ fontWeight: 600 }}>{emailSpent.toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(emailSpent/totalSpent)*100}%`, height: '100%', backgroundColor: '#0070f3', borderRadius: '3px' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex-between" style={{ fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MessageSquare size={14} color="#10b981"/> SMS</span>
                    <span style={{ fontWeight: 600 }}>{smsSpent.toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(smsSpent/totalSpent)*100}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '3px' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex-between" style={{ fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} color="#f59e0b"/> WhatsApp</span>
                    <span style={{ fontWeight: 600 }}>{waSpent.toLocaleString()} {t.iqd}</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${(waSpent/totalSpent)*100}%`, height: '100%', backgroundColor: '#f59e0b', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Settings & Pricing */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            {/* Auto Top-up & Wallets */}
            <div className="card" style={{ borderRadius: '16px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Settings size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '15px' }}>{t.autoTopUpTitle} & {t.savedWallets}</span>
              </div>
              
              <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: autoTopUp ? 'rgba(var(--accent-rgb), 0.05)' : 'transparent', transition: 'all 0.2s' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={16} color={autoTopUp ? "var(--accent-color)" : "var(--text-muted)"} />
                    {t.autoTopUpTitle}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.autoTopUpDesc}</div>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                  <input type="checkbox" style={{ opacity: 0, width: 0, height: 0 }} checked={autoTopUp} onChange={(e) => setAutoTopUp(e.target.checked)} />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: autoTopUp ? 'var(--accent-color)' : 'var(--border-color)', transition: '0.4s', borderRadius: '24px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: autoTopUp ? '22px' : '3px', bottom: '3px', backgroundColor: 'white', transition: '0.4s', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}></span>
                  </span>
                </label>
              </div>

              <div style={{ padding: '12px 16px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'rgba(255, 204, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#ffcc00" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>Zain Cash</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>0780 **** 567</div>
                </div>
                <button className="btn" style={{ padding: '6px 12px', fontSize: '12px' }}>Edit</button>
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="card" style={{ borderRadius: '16px' }}>
              <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Shield size={16} color="var(--text-secondary)" />
                <span style={{ fontSize: '15px' }}>{t.pricingTitle}</span>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 112, 243, 0.05)', border: '1px solid rgba(0, 112, 243, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}><Mail size={18} color="#0070f3" /></div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Email Delivery</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#0070f3' }}>{t.emailTariff}</span>
                </div>
                
                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}><MessageSquare size={18} color="#10b981" /></div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>SMS OTP</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#10b981' }}>{t.smsTariff}</span>
                </div>

                <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ padding: '8px', backgroundColor: 'var(--panel-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}><Phone size={18} color="#f59e0b" /></div>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>WhatsApp Business</span>
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: '#f59e0b' }}>{t.waTariff}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700 }}>{t.recentTx}</h2>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-color)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <button onClick={() => setTxFilter('all')} className={`btn ${txFilter === 'all' ? 'btn-primary' : ''}`} style={{ padding: '6px 16px', fontSize: '13px', border: 'none' }}>{t.filterAll}</button>
                  <button onClick={() => setTxFilter('topup')} className={`btn ${txFilter === 'topup' ? 'btn-primary' : ''}`} style={{ padding: '6px 16px', fontSize: '13px', border: 'none' }}>{t.filterTopup}</button>
                  <button onClick={() => setTxFilter('usage')} className={`btn ${txFilter === 'usage' ? 'btn-primary' : ''}`} style={{ padding: '6px 16px', fontSize: '13px', border: 'none' }}>{t.filterUsage}</button>
                </div>
                <button onClick={exportToCSV} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                  <Download size={16} />
                  <span style={{ fontWeight: 600 }}>{t.exportCSV}</span>
                </button>
              </div>
            </div>
            
            <div className="table-container" style={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              {filteredTx.length === 0 ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Clock size={40} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                  <p style={{ fontSize: '15px' }}>{t.noTx}</p>
                </div>
              ) : (
                <table className="v-table">
                  <thead>
                    <tr>
                      <th>{t.txId}</th>
                      <th>{t.provider}</th>
                      <th>{t.amountText}</th>
                      <th>{t.status}</th>
                      <th>{t.date}</th>
                      <th style={{ textAlign: lang === 'en' ? 'right' : 'left' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTx.map((tx) => (
                      <tr key={tx.id} style={{ transition: 'background-color 0.2s' }}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{tx.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {tx.provider === 'Zain Cash' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffcc00' }}></div>}
                            {tx.provider === 'FastPay' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff3366' }}></div>}
                            {tx.provider === 'Usage' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--text-muted)' }}></div>}
                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{tx.provider}</span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, fontSize: '14px' }}>
                          {tx.provider === 'Usage' ? (
                            <span style={{ color: 'var(--text-primary)' }}>-{tx.amount.toLocaleString()} {t.iqd}</span>
                          ) : (
                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ArrowUpRight size={14} />
                              +{tx.amount.toLocaleString()} {t.iqd}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} />
                            {lang === 'en' ? 'Completed' : 'مكتملة'}
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {new Date(tx.date).toLocaleString(lang === 'en' ? 'en-US' : 'ar-IQ', { dateStyle: 'medium', timeStyle: 'short' })}
                        </td>
                        <td style={{ textAlign: lang === 'en' ? 'right' : 'left' }}>
                          {tx.provider !== 'Usage' && (
                            <button onClick={() => downloadInvoice(tx.id)} className="btn" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              <Download size={14} />
                              {t.downloadInvoice}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Architecture diagram */}
          <div className="card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 750, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-color)" />
              <span>{lang === 'ar' ? 'البنية التحتية وهندسة الإرسال' : 'Sumer Send Infrastructure Architecture'}</span>
            </h3>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {lang === 'ar' 
                ? 'تعتمد المنصة على موزع بريد خلفي (Local SMTP Dispatcher) لإرسال رسائل الإيميل الحقيقية مباشرة إلى صندوق البريد الوارد للمستخدمين، وتتكامل برمجياً عبر بوابات الـ API المحلية لشبكات الجيل الرابع في العراق لإيصال رسائل الهاتف المحمول الفورية بمرونة تامة.' 
                : 'Sumer Send triggers SMTP servers running in the background to forward actual transactional mails, and hooks directly into localized 4G telecom network aggregators inside Iraq for rapid SMS & WhatsApp notification updates.'}
            </p>

            <div style={{ 
              backgroundColor: 'var(--bg-color)', 
              borderRadius: '8px', 
              padding: '25px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              gap: '15px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ padding: '10px 14px', border: '1px solid var(--text-primary)', borderRadius: '6px', backgroundColor: 'var(--panel-bg)', fontSize: '12px', fontWeight: 'bold' }}>
                SDK / API Calls
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              
              <div style={{ padding: '10px 14px', border: '1px solid var(--accent-color)', borderRadius: '6px', backgroundColor: 'var(--panel-bg)', fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-color)', textAlign: 'center' }}>
                Sumer Send Gateways<br/><span style={{ fontSize: '10px', fontWeight: 'normal' }}>Region: Baghdad</span>
              </div>
              <div style={{ color: 'var(--text-muted)' }}>➔</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <Mail size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>SMTP Server (Node / Port 3000)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <MessageSquare size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>Zain Cash & SMS Aggregator</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 10px', border: '1px solid var(--border-color)', borderRadius: '4px', backgroundColor: 'var(--panel-bg)', fontSize: '10px', fontWeight: 500 }}>
                  <Phone size={12} style={{ color: 'var(--text-secondary)' }} />
                  <span>Asiacell / Korek Mobile Bridge</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            
            {/* Status indicators */}
            <div className="card" style={{ flex: 1, minWidth: '300px', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
                {lang === 'ar' ? 'حالة بوابات وقنوات الاتصال' : 'Gateway Service Connectivity'}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>SMTP Mail Engine (Port 3000)</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل ونشط' : 'Online & Active'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Zain Iraq SMS Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Asiacell Iraq Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Korek Telecom Gateway</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل' : 'Connected'}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>WhatsApp Cloud (Basra Hub)</span>
                  <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success-text)', display: 'inline-block' }}></span>
                    {lang === 'ar' ? 'متصل ونشط' : 'Online & Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rates & pricing */}
            <div className="card" style={{ flex: 1, minWidth: '300px', padding: '24px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>
                {lang === 'ar' ? 'تفاصيل تعرفة الشبكات المحلية' : 'Local Operators Tariff Rates'}
              </h3>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ textAlign: lang === 'ar' ? 'right' : 'left', paddingBottom: '8px' }}>
                      {lang === 'ar' ? 'الخدمة / القناة' : 'Service / Channel'}
                    </th>
                    <th style={{ textAlign: lang === 'ar' ? 'left' : 'right', paddingBottom: '8px' }}>
                      {lang === 'ar' ? 'التعرفة والرسوم' : 'Tariff Cost'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'البريد الإلكتروني (Email API)' : 'Email API Delivery'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--accent-color)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      10 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'رسائل الجوال القصيرة (SMS Gateway)' : 'Local SMS Delivery'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--success-text)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      120 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 500 }}>
                      {lang === 'ar' ? 'رسائل الواتساب للشركات (WhatsApp)' : 'WhatsApp Messaging'}
                    </td>
                    <td style={{ padding: '12px 0', color: 'var(--warning-text)', fontWeight: 'bold', textAlign: lang === 'ar' ? 'left' : 'right' }}>
                      150 د.ع <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ رسالة</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              
              <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {lang === 'ar'
                  ? '* تعتمد الفوترة والخصم الفعلي من رصيد المحفظة بالعملة المحلية مباشرة (الـ دينار عراقي IQD).'
                  : '* Billing is calculated and deducted in real-time in Iraqi Dinar (IQD) from your linked wallet balance.'}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Zain Cash Simulator Modal */}
      {showZainModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle('#ffcc00')}>
            <div style={{ padding: '20px', backgroundColor: '#ffcc00', color: '#000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>Zain Cash</span>
              <button onClick={() => { setShowZainModal(false); setStep(1); setError(''); }} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '14px' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Merchant' : 'التاجر'}</span>
                  <span style={{ fontWeight: 700 }}>Sumer Send API</span>
                </div>
                <div className="flex-between" style={{ paddingTop: '12px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Amount' : 'المبلغ الإجمالي'}</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: '#e6b800' }}>{parseInt(amount).toLocaleString()} {t.iqd}</span>
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-text)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleProceedPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'en' ? 'Top-up Amount' : 'مبلغ الشحن'}</label>
                    <select className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '12px', fontSize: '15px' }}>
                      <option value="5000">5,000 د.ع</option>
                      <option value="15000">15,000 د.ع</option>
                      <option value="25000">25,000 د.ع</option>
                      <option value="50000">50,000 د.ع</option>
                      <option value="100000">100,000 د.ع</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.walletNum}</label>
                    <input type="text" className="form-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="078XXXXXXXX" style={{ padding: '12px', fontSize: '15px', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.walletPin}</label>
                    <input type="password" maxLength={4} className="form-input" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" style={{ letterSpacing: '8px', textAlign: 'center', padding: '12px', fontSize: '20px' }} />
                  </div>

                  <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#ffcc00', border: '1px solid #e6b800', color: '#000', fontWeight: 700, fontSize: '15px', marginTop: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1, transition: 'transform 0.1s', transform: isProcessing ? 'scale(0.98)' : 'scale(1)' }}>
                    {isProcessing ? '...' : t.payBtn}
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => handleVerifyOTP(e, 'Zain Cash')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255, 204, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Phone size={28} color="#e6b800" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {lang === 'en' ? `Verification code sent to ${phoneNumber}` : `تم إرسال رمز التحقق لرقمك ${phoneNumber}`}
                    </p>
                    <p style={{ fontSize: '13px', color: '#e6b800', fontWeight: 600 }}>
                      {lang === 'en' ? 'Enter 123456 to simulate success' : 'أدخل الرمز 123456 لإتمام الدفع بنجاح'}
                    </p>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input type="text" maxLength={6} className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="••••••" style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '24px', fontWeight: 800, padding: '16px' }} />
                  </div>

                  <button type="submit" disabled={isVerifying} style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#ffcc00', border: '1px solid #e6b800', color: '#000', fontWeight: 700, fontSize: '15px', cursor: isVerifying ? 'not-allowed' : 'pointer', opacity: isVerifying ? 0.7 : 1 }}>
                    {isVerifying ? '...' : t.verifyBtn}
                  </button>

                  <button type="button" style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setStep(1)} disabled={isVerifying}>
                    {lang === 'en' ? 'Back' : 'تراجع'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FastPay Simulator Modal */}
      {showFastPayModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle('#ff3366')}>
            <div style={{ padding: '20px', backgroundColor: '#ff3366', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', fontWeight: 900, letterSpacing: '-0.5px' }}>FastPay</span>
              <button onClick={() => { setShowFastPayModal(false); setStep(1); setError(''); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>✕</button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '24px', backgroundColor: 'rgba(0,0,0,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', fontSize: '14px' }}>
                <div className="flex-between" style={{ marginBottom: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Merchant' : 'التاجر'}</span>
                  <span style={{ fontWeight: 700 }}>Sumer Send API</span>
                </div>
                <div className="flex-between" style={{ paddingTop: '12px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{lang === 'en' ? 'Total Amount' : 'المبلغ الإجمالي'}</span>
                  <span style={{ fontWeight: 800, fontSize: '18px', color: '#ff3366' }}>{parseInt(amount).toLocaleString()} {t.iqd}</span>
                </div>
              </div>

              {error && (
                <div style={{ color: 'var(--danger-text)', backgroundColor: 'var(--danger-bg)', border: '1px solid var(--danger-text)', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleProceedPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{lang === 'en' ? 'Top-up Amount' : 'مبلغ الشحن'}</label>
                    <select className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '12px', fontSize: '15px' }}>
                      <option value="5000">5,000 د.ع</option>
                      <option value="15000">15,000 د.ع</option>
                      <option value="25000">25,000 د.ع</option>
                      <option value="50000">50,000 د.ع</option>
                      <option value="100000">100,000 د.ع</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.walletNum}</label>
                    <input type="text" className="form-input" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="077XXXXXXXX" style={{ padding: '12px', fontSize: '15px', fontFamily: 'var(--font-mono)' }} />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">{t.walletPin}</label>
                    <input type="password" maxLength={4} className="form-input" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="••••" style={{ letterSpacing: '8px', textAlign: 'center', padding: '12px', fontSize: '20px' }} />
                  </div>

                  <button type="submit" disabled={isProcessing} style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#ff3366', border: '1px solid #d91c4d', color: '#fff', fontWeight: 700, fontSize: '15px', marginTop: '8px', cursor: isProcessing ? 'not-allowed' : 'pointer', opacity: isProcessing ? 0.7 : 1, transition: 'transform 0.1s', transform: isProcessing ? 'scale(0.98)' : 'scale(1)' }}>
                    {isProcessing ? '...' : t.payBtn}
                  </button>
                </form>
              ) : (
                <form onSubmit={(e) => handleVerifyOTP(e, 'FastPay')} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(255, 51, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                      <Phone size={28} color="#ff3366" />
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: 1.5 }}>
                      {lang === 'en' ? `Verification code sent to ${phoneNumber}` : `تم إرسال رمز التحقق لرقمك ${phoneNumber}`}
                    </p>
                    <p style={{ fontSize: '13px', color: '#ff3366', fontWeight: 600 }}>
                      {lang === 'en' ? 'Enter 123456 to simulate success' : 'أدخل الرمز 123456 لإتمام الدفع بنجاح'}
                    </p>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <input type="text" maxLength={6} className="form-input" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="••••••" style={{ letterSpacing: '12px', textAlign: 'center', fontSize: '24px', fontWeight: 800, padding: '16px' }} />
                  </div>

                  <button type="submit" disabled={isVerifying} style={{ width: '100%', padding: '14px', borderRadius: '6px', backgroundColor: '#ff3366', border: '1px solid #d91c4d', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: isVerifying ? 'not-allowed' : 'pointer', opacity: isVerifying ? 0.7 : 1 }}>
                    {isVerifying ? '...' : t.verifyBtn}
                  </button>

                  <button type="button" style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }} onClick={() => setStep(1)} disabled={isVerifying}>
                    {lang === 'en' ? 'Back' : 'تراجع'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Hidden Invoice Template for PDF Generation */}
      {invoiceTx && (
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1 }}>
          <div id="invoice-template" style={{ width: '794px', minHeight: '1123px', padding: '60px', backgroundColor: '#ffffff', color: '#09090b', direction: 'rtl', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #eaeaea', paddingBottom: '20px', marginBottom: '30px' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: '#09090b' }}>سومر سيند | Sumer Send</h1>
                <p style={{ margin: '8px 0 0 0', color: '#555', fontSize: '14px' }}>منصة الإشعارات والرسائل الذكية - بغداد، العراق</p>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#0070f3' }}>فاتورة إلكترونية</div>
                <div style={{ fontSize: '14px', color: '#555', marginTop: '8px' }}>Official E-Invoice</div>
              </div>
            </div>

            {/* Details */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', marginBottom: '40px' }}>
              <div style={{ backgroundColor: '#fafafa', padding: '15px 20px', borderRadius: '8px', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>رقم العملية (Transaction ID)</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{invoiceTx.id}</div>
              </div>
              <div style={{ backgroundColor: '#fafafa', padding: '15px 20px', borderRadius: '8px', flex: 1 }}>
                <div style={{ fontSize: '12px', color: '#777', marginBottom: '4px' }}>التاريخ والوقت (Date & Time)</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>{new Date(invoiceTx.date).toLocaleString('ar-IQ')}</div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px', marginBottom: '20px' }}>تفاصيل الشحن والدفع</h2>
              
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f4f5' }}>
                    <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>الوصف</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>بوابة الدفع (Provider)</th>
                    <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>الحالة (Status)</th>
                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>المبلغ (Amount)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '16px 12px', borderBottom: '1px solid #eee' }}>شحن رصيد المحفظة المركزية</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center', borderBottom: '1px solid #eee', fontWeight: 600 }}>{invoiceTx.provider}</td>
                    <td style={{ padding: '16px 12px', textAlign: 'center', borderBottom: '1px solid #eee', color: '#10b981', fontWeight: 600 }}>مدفوعة (Paid)</td>
                    <td style={{ padding: '16px 12px', textAlign: 'left', borderBottom: '1px solid #eee', fontWeight: 700 }}>{invoiceTx.amount.toLocaleString()} د.ع</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '300px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '8px', border: '1px solid #eaeaea' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#555' }}>المبلغ الإجمالي:</span>
                    <span style={{ fontWeight: 700 }}>{invoiceTx.amount.toLocaleString()} د.ع</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
                    <span style={{ fontWeight: 800 }}>الصافي المدفوع:</span>
                    <span style={{ fontWeight: 800, color: '#0070f3', fontSize: '18px' }}>{invoiceTx.amount.toLocaleString()} د.ع</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 'auto', paddingTop: '60px', textAlign: 'center', color: '#777', fontSize: '12px' }}>
              <p style={{ margin: '0 0 5px 0' }}>هذه الفاتورة مصُدرة آلياً من نظام سومر سيند ولا تتطلب توقيعاً فعلياً.</p>
              <p style={{ margin: '0 0 5px 0' }}>© {new Date().getFullYear()} Sumer Send Platform. All rights reserved. بغداد، العراق.</p>
              <p style={{ margin: 0 }}>This is a computer-generated document. No signature is required.</p>
            </div>
          </div>
        </div>
      )}
    </ScrollReveal>
  );
};
