import React, { useState, useEffect, useRef } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Languages,
  Cpu,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Play,
  Terminal,
  Sun,
  Moon
} from 'lucide-react';

interface LandingViewProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  setCurrentTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  user?: any;
}

// Reusable Apple-style Scroll Reveal Wrapper
export const ScrollReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glowColor?: string;
}

// Reusable Spotlight Cursor Glowing Bento Card
export const BentoCard: React.FC<BentoCardProps> = ({ children, className, style, glowColor }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const glowRgb = glowColor || 'var(--glow-rgb)';

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`card ${className || ''}`.trim()}
      style={{
        ...style,
        position: 'relative',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s',
        border: isHovered 
          ? `1px solid rgba(${glowColor ? glowColor : 'var(--glow-rgb)'}, 0.4)` 
          : '1px solid var(--border-color)',
        boxShadow: isHovered 
          ? `0 12px 30px rgba(${glowColor ? glowColor : 'var(--glow-rgb)'}, 0.04), 0 0 0 1px rgba(${glowColor ? glowColor : 'var(--glow-rgb)'}, 0.08)` 
          : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
        overflow: 'hidden'
      }}
    >
      {isHovered && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(${glowColor ? glowColor : 'var(--glow-rgb)'}, 0.08), transparent 80%)`,
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.25s'
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        {children}
      </div>
    </div>
  );
};

export const LandingView: React.FC<LandingViewProps> = ({
  lang,
  setLang,
  setCurrentTab,
  theme,
  setTheme,
  user,
}) => {
  const isAr = lang === 'ar';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [navIndicator, setNavIndicator] = useState({ left: 0, width: 0, opacity: 0 });
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);

  const navRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  // Hover states for interactive sections and pricing cards
  const [isConsoleHovered, setIsConsoleHovered] = useState(false);
  const [isIdeHovered, setIsIdeHovered] = useState(false);
  const [isEmailCardHovered, setIsEmailCardHovered] = useState(false);
  const [isSmsCardHovered, setIsSmsCardHovered] = useState(false);
  const [isWhatsappCardHovered, setIsWhatsappCardHovered] = useState(false);

  // State for pricing calculator
  const [emailCount, setEmailCount] = useState<number>(15000);
  const [smsCount, setSmsCount] = useState<number>(1500);
  const [whatsappCount, setWhatsappCount] = useState<number>(500);
  const [presetTier, setPresetTier] = useState<'starter' | 'growth' | 'enterprise' | null>('starter');

  // State for code snippet quickstarts
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'node' | 'python' | 'go'>('curl');
  const [copied, setCopied] = useState(false);


  // Interactive Live Dashboard Mockup State
  const [mockStats, setMockStats] = useState({ sent: 12480, rate: 99.98, balance: 142500 });
  const [mockTab, setMockTab] = useState<'all' | 'email' | 'sms' | 'whatsapp'>('all');
  const [mockLogs, setMockLogs] = useState([
    { id: '1', type: 'email', to: 'customer@mystore.iq', status: 'delivered', time: 'Just now' },
    { id: '2', type: 'sms', to: '0780***9281', status: 'delivered', time: '3m ago' },
    { id: '3', type: 'whatsapp', to: '0770***5432', status: 'delivered', time: '12m ago' },
    { id: '4', type: 'email', to: 'admin@iraqdev.org', status: 'delivered', time: '35m ago' }
  ]);
  const [graphPoints, setGraphPoints] = useState<number[]>([85, 75, 80, 55, 65, 45, 35]);

  // Bento Card Micro-simulation States
  const [smsOtpStatus, setSmsOtpStatus] = useState<'typing' | 'verified'>('typing');
  const [whatsappMockState, setWhatsappMockState] = useState<'idle' | 'confirmed' | 'cancelled'>('idle');

  // Rates in IQD
  const emailRate = 10;
  const smsRate = 120;
  const whatsappRate = 150;

  const totalCost = (emailCount * emailRate) + (smsCount * smsRate) + (whatsappCount * whatsappRate);


  useEffect(() => {
    // Loop the SMS OTP code verification in bento grid
    const interval = setInterval(() => {
      setSmsOtpStatus(prev => prev === 'typing' ? 'verified' : 'typing');
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 1. Scroll-aware auto-hide and active section scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      // Close dropdown if user scrolls down past a threshold
      if (currentScrollY > 50) {
        setIsMobileMenuOpen(false);
      }

      // Show/Hide header based on scroll direction - disabled so header remains visible
      if (currentScrollY > 150) {
        if (currentScrollY > lastScrollY.current) {
          // Scrolling down - close drawer but keep header visible
          setIsMobileMenuOpen(false);
        }
      }
      setShowHeader(true);
      lastScrollY.current = currentScrollY;

      // Active section bounds detection
      const scrollPosition = currentScrollY + 200;
      const featuresSection = document.getElementById('features');
      const pricingSection = document.getElementById('pricing');

      if (pricingSection && scrollPosition >= pricingSection.offsetTop) {
        setActiveSection('pricing');
      } else if (featuresSection && scrollPosition >= featuresSection.offsetTop) {
        setActiveSection('features');
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call to set active section correctly on mount
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Recalculate sliding highlight indicator coordinates on tab active/hover state change
  useEffect(() => {
    const updateIndicator = () => {
      const currentItem = hoveredItem || activeSection;
      const element = currentItem ? itemRefs.current[currentItem] : null;
      const navElement = navRef.current;
      
      if (element && navElement) {
        const navRect = navElement.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        setNavIndicator({
          left: elementRect.left - navRect.left,
          width: elementRect.width,
          opacity: 1
        });
      } else {
        setNavIndicator(prev => ({ ...prev, opacity: 0 }));
      }
    };

    // Use a small timeout to let the DOM settle, especially when changing language (RTL toggles sizes)
    const timeoutId = setTimeout(updateIndicator, 50);
    
    // Also update on resize to keep coordinate tracking accurate
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [activeSection, hoveredItem, lang]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (tier: 'starter' | 'growth' | 'enterprise') => {
    setPresetTier(tier);
    if (tier === 'starter') {
      setEmailCount(15000);
      setSmsCount(1500);
      setWhatsappCount(500);
    } else if (tier === 'growth') {
      setEmailCount(50000);
      setSmsCount(5000);
      setWhatsappCount(2000);
    } else if (tier === 'enterprise') {
      setEmailCount(100000);
      setSmsCount(20000);
      setWhatsappCount(10000);
    }
  };

  const handleSliderChange = (type: 'email' | 'sms' | 'whatsapp', val: number) => {
    setPresetTier(null);
    if (type === 'email') setEmailCount(val);
    if (type === 'sms') setSmsCount(val);
    if (type === 'whatsapp') setWhatsappCount(val);
  };

  const handleTriggerApiCall = () => {
    // Mock log trigger with sound/visual feedback
    const channels = ['email', 'sms', 'whatsapp'];
    const randomChannel = channels[Math.floor(Math.random() * channels.length)];
    const mockTo = randomChannel === 'email' 
      ? `customer_${Math.floor(Math.random() * 800) + 100}@gmail.com`
      : `07${['80', '77', '90'][Math.floor(Math.random()*3)]}***${Math.floor(1000 + Math.random()*9000)}`;

    const newLog = {
      id: Date.now().toString(),
      type: randomChannel,
      to: mockTo,
      status: 'delivered',
      time: 'Just now'
    };

    setMockLogs(prev => [newLog, ...prev.slice(0, 3)]);
    setMockStats(prev => ({
      sent: prev.sent + 1,
      rate: 99.98,
      balance: prev.balance - (randomChannel === 'email' ? emailRate : randomChannel === 'sms' ? smsRate : whatsappRate)
    }));

    // Update graph points to create real-time scrolling graph animation
    const nextPoint = Math.floor(Math.random() * 65) + 15; // y coordinate (15 to 80, lower is higher traffic)
    setGraphPoints(prev => [...prev.slice(1), nextPoint]);

    // Dispatch global toast event to show toast on top right of the viewport
    const toastEvent = new CustomEvent('sumer-toast', {
      detail: {
        message: randomChannel === 'email' 
          ? `API OK: Routed to ${mockTo} [10 IQD]` 
          : `API OK: Dispatched OTP to ${mockTo} [${randomChannel === 'sms' ? 120 : 150} IQD]`,
        type: randomChannel,
        duration: 3500
      }
    });
    window.dispatchEvent(toastEvent);
  };

  const getGraphPath = () => {
    const width = 400;
    const step = width / (graphPoints.length - 1);
    let d = `M 0 ${graphPoints[0]}`;
    for (let i = 1; i < graphPoints.length; i++) {
      const x = i * step;
      const y = graphPoints[i];
      const prevX = (i - 1) * step;
      const prevY = graphPoints[i - 1];
      const cp1x = prevX + step / 2;
      const cp1y = prevY;
      const cp2x = prevX + step / 2;
      const cp2y = y;
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x} ${y}`;
    }
    return d;
  };

  const filteredMockLogs = mockTab === 'all' 
    ? mockLogs 
    : mockLogs.filter(log => log.type === mockTab);

  const t = {
    en: {
      brand: 'Sumer Send',
      subBrand: 'Developer',
      tagline: 'Sumer Send for Developers',
      taglineSub: 'One platform. Every channel. Tailored for Iraq.',
      description: 'Integrate transactional Email API, local SMS OTP gateways, and interactive WhatsApp business messaging with single-digit millisecond latency. Designed to build secure, scalable customer communications.',
      enterConsole: 'Go to Console',
      sandbox: 'API Playground',
      features: 'Features',
      pricing: 'Pricing & Tiers',
      pricingSub: 'Pay-as-you-go billing calculated in Iraqi Dinars.',
      calcTitle: 'Configure Volume',
      calcDesc: 'Estimate monthly pricing by adjusting predicted volumes or selecting a quick preset.',
      emailRateLabel: '10 IQD per transaction',
      smsRateLabel: '120 IQD per transaction',
      whatsappRateLabel: '150 IQD per transaction',
      estMonthly: 'Monthly Cost',
      iqd: 'IQD',
      perMonth: 'per month',
      quickstart: 'Quickstart Integration',
      quickstartDesc: 'Implement Sumer Send in your runtime env. Copy-paste these snippets to integrate in seconds.',
      channelEmail: 'Email API Bridge',
      channelEmailDesc: 'Configure custom domains, verify DKIM records, and route transactional notifications directly to inbox.',
      channelSms: 'SMS OTP Gateway',
      channelSmsDesc: 'Verify identities instantly. High-priority routing for Zain, Asiacell, and Korek networks with direct local carrier tunnels.',
      channelWhatsapp: 'WhatsApp Business API',
      channelWhatsappDesc: 'Build rich transactional user experiences with media attachments, structured custom buttons, and templates.',
      showcaseTitle: 'Interactive Console Experience',
      showcaseDesc: 'Manage domains, inspect payloads, audit logs, configure webhooks, and trigger smart campaigns from a clean workspace.',
      footer: '© 2026 Sumer Send Developer. Crafted for Free Minds in Baghdad, Iraq.',
      presetStarter: 'Starter Plan',
      presetGrowth: 'Growth Plan',
      presetEnterprise: 'Enterprise Plan',
      latencyLabel: 'Baghdad Node Latency',
      statusActive: 'Active Nodes',
      triggerTest: 'Simulate API Call',
      consoleLogs: 'Live Console Log Output',
      consoleTraffic: 'Console API Traffic Flow'
    },
    ar: {
      brand: 'سومر سيند',
      subBrand: 'للمطورين',
      tagline: 'سومر سيند للمطورين',
      taglineSub: 'منصة موحدة. كافة قنوات الاتصال. مصممة للعراق.',
      description: 'اربط بوابة البريد الإلكتروني (Email API)، إشعارات الـ SMS OTP المحلية، ورسائل الواتساب التفاعلية بزمن استجابة فائق السرعة. مصممة لبناء قنوات اتصال آمنة وقابلة للتوسع.',
      enterConsole: 'الدخول للمنصة',
      sandbox: 'منصة الاختبار',
      features: 'المميزات البرمجية',
      pricing: 'الأسعار والتسعير',
      pricingSub: 'حساب مرن وشفاف يدفع حسب الاستهلاك الفعلي بالدينار العراقي.',
      calcTitle: 'تهيئة وتحديد حجم الاستهلاك',
      calcDesc: 'قم بتحريك المؤشرات لحساب التكلفة الشهرية المتوقعة أو اختر إحدى الباقات الجاهزة.',
      emailRateLabel: '10 د.ع لكل رسالة ناجحة',
      smsRateLabel: '120 د.ع لكل رسالة ناجحة',
      whatsappRateLabel: '150 د.ع لكل رسالة ناجحة',
      estMonthly: 'التكلفة الشهرية المتوقعة',
      iqd: 'دينار عراقي',
      perMonth: 'شهرياً',
      quickstart: 'دمج برمجيات سريع',
      quickstartDesc: 'اربط منصة سومر سيند مع مشروعك خلال ثوانٍ. انسخ الأكواد الجاهزة وابدأ الإرسال فوراً.',
      channelEmail: 'بريد المعاملات (Email API)',
      channelEmailDesc: 'أضف نطاقاتك، ووثق سجلات الـ DNS والـ DKIM، وأرسل رسائل المعاملات مباشرة لصندوق الوارد.',
      channelSms: 'رسائل التفعيل والـ OTP',
      channelSmsDesc: 'أكد هويات عملائك فوراً. إرسال فائق الأولوية لشبكات زين، آسيا سيل، وكورك عبر قنوات ربط مباشر.',
      channelWhatsapp: 'الواتساب التفاعلي للأعمال',
      channelWhatsappDesc: 'ابنِ تجارب تفاعلية غنية بالوسائط، الأزرار التفاعلية، والتحديثات الآلية لعملائك.',
      showcaseTitle: 'لوحة تحكم تفاعلية متكاملة',
      showcaseDesc: 'أدر نطاقاتك، وراجع سجلات الطلبات التفصيلية، ووجه الويب هوكس، وأطلق الحملات الذكية من مكان واحد.',
      footer: '© 2026 سومر سيند للمطورين. صُنع بعناية للعقول الحرة في بغداد، العراق.',
      presetStarter: 'باقة ستارت اب',
      presetGrowth: 'باقة النمو المتسارع',
      presetEnterprise: 'باقة المؤسسات والشركات',
      latencyLabel: 'زمن استجابة خادم بغداد',
      statusActive: 'الشبكة متصلة',
      triggerTest: 'محاكاة طلب API',
      consoleLogs: 'مخرجات سجلات التحكم المباشرة',
      consoleTraffic: 'تدفق مرور البيانات البرمجية'
    }
  };

  const currentT = t[lang];

  // Raw code strings for clipboard copy
  const codeSnippets = {
    curl: `curl -X POST "https://api.sumersend.com/v1/emails" \\
  -H "Authorization: Bearer sm_live_key_9281" \\
  -H "Content-Type: application/json" \\
  -d '{
    "from": "Sumer Send <admin@aiandthings.tech>",
    "to": "customer@gmail.com",
    "subject": "Order #9283 Dispatch Success",
    "html": "<h3>Your package is on its way!</h3>"
  }'`,
    node: `// Node.js - Dispatch Email
const fetch = require('node-fetch');

const payload = {
  from: "Sumer Send <admin@aiandthings.tech>",
  to: "customer@gmail.com",
  subject: "Welcome to our platform!",
  html: "<h2>Welcome!</h2><p>Thanks for subscribing.</p>"
};

fetch('https://api.sumersend.com/v1/emails', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sm_live_key_9281',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => console.log('Success:', data))
.catch(err => console.error('Error:', err));`,
    python: `# Python - Send Transactional Email
import requests

url = "https://api.sumersend.com/v1/emails"
headers = {
    "Authorization": "Bearer sm_live_key_9281",
    "Content-Type": "application/json"
}
payload = {
    "from": "Sumer Send <admin@aiandthings.tech>",
    "to": "customer@gmail.com",
    "subject": "System Confirmation",
    "html": "<h3>Account Activated Successfully</h3>"
}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
    go: `// Go - Send Transactional Email
package main

import (
	"bytes"
	"encoding/json"
	"net/http"
)

func main() {
	payload := map[string]interface{}{
		"from":    "Sumer Send <admin@aiandthings.tech>",
		"to":      "customer@gmail.com",
		"subject": "System Alert",
		"html":    "<b>CPU load exceeded</b>",
	}
	body, _ := json.Marshal(payload)
	
	req, _ := http.NewRequest("POST", "https://api.sumersend.com/v1/emails", bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer sm_live_key_9281")
	req.Header.Set("Content-Type", "application/json")
	
	client := &http.Client{}
	client.Do(req)
}`
  };

  const renderHighlightedCode = () => {
    switch (activeCodeTab) {
      case 'curl':
        return (
          <span style={{ color: '#a1a1aa' }}>
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>curl</span> <span style={{ color: '#38bdf8' }}>-X POST</span> <span style={{ color: '#e2e8f0' }}>"https://api.sumersend.com/v1/emails"</span> \<br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>-H</span> <span style={{ color: '#ecc94b' }}>"Authorization: Bearer sm_live_key_9281"</span> \<br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>-H</span> <span style={{ color: '#ecc94b' }}>"Content-Type: application/json"</span> \<br />
            &nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>-d</span> <span style={{ color: '#a78bfa' }}>{`'{`}</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"from"</span>: <span style={{ color: '#ecc94b' }}>"Sumer Send &lt;admin@aiandthings.tech&gt;"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"to"</span>: <span style={{ color: '#ecc94b' }}>"customer@gmail.com"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"subject"</span>: <span style={{ color: '#ecc94b' }}>"Order #9283 Dispatch Success"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"html"</span>: <span style={{ color: '#ecc94b' }}>"&lt;h3&gt;Your package is on its way!&lt;/h3&gt;"</span><br />
            &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>{`}'`}</span>
          </span>
        );
      case 'node':
        return (
          <span style={{ color: '#a1a1aa' }}>
            <span style={{ color: '#71717a' }}>// Node.js - Dispatch Email</span><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>const</span> <span style={{ color: '#e2e8f0' }}>fetch = require(</span><span style={{ color: '#ecc94b' }}>'node-fetch'</span><span style={{ color: '#e2e8f0' }}>);</span><br /><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>const</span> <span style={{ color: '#38bdf8' }}>payload</span> = <span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;from: <span style={{ color: '#ecc94b' }}>"Sumer Send &lt;admin@aiandthings.tech&gt;"</span>,<br />
            &nbsp;&nbsp;to: <span style={{ color: '#ecc94b' }}>"customer@gmail.com"</span>,<br />
            &nbsp;&nbsp;subject: <span style={{ color: '#ecc94b' }}>"Welcome to our platform!"</span>,<br />
            &nbsp;&nbsp;html: <span style={{ color: '#ecc94b' }}>"&lt;h2&gt;Welcome!&lt;/h2&gt;&lt;p&gt;Thanks for subscribing.&lt;/p&gt;"</span><br />
            <span style={{ color: '#a78bfa' }}>{`};`}</span><br /><br />
            <span style={{ color: '#38bdf8' }}>fetch</span>(<span style={{ color: '#ecc94b' }}>'https://api.sumersend.com/v1/emails'</span>, <span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;method: <span style={{ color: '#ecc94b' }}>'POST'</span>,<br />
            &nbsp;&nbsp;headers: <span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>'Authorization'</span>: <span style={{ color: '#ecc94b' }}>'Bearer sm_live_key_9281'</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>'Content-Type'</span>: <span style={{ color: '#ecc94b' }}>'application/json'</span><br />
            &nbsp;&nbsp;<span style={{ color: '#a78bfa' }}>{`}`}</span>,<br />
            &nbsp;&nbsp;body: <span style={{ color: '#e2e8f0' }}>JSON.stringify(payload)</span><br />
            <span style={{ color: '#a78bfa' }}>{`})`}</span><br />
            .<span style={{ color: '#38bdf8' }}>then</span>(res =&gt; res.<span style={{ color: '#38bdf8' }}>json</span>())<br />
            .<span style={{ color: '#38bdf8' }}>then</span>(data =&gt; console.<span style={{ color: '#38bdf8' }}>log</span>(<span style={{ color: '#ecc94b' }}>'Success:'</span>, data))<br />
            .<span style={{ color: '#38bdf8' }}>catch</span>(err =&gt; console.<span style={{ color: '#38bdf8' }}>error</span>(err));
          </span>
        );
      case 'python':
        return (
          <span style={{ color: '#a1a1aa' }}>
            <span style={{ color: '#71717a' }}># Python - Send Transactional Email</span><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>import</span> <span style={{ color: '#e2e8f0' }}>requests</span><br /><br />
            <span style={{ color: '#e2e8f0' }}>url = </span><span style={{ color: '#ecc94b' }}>"https://api.sumersend.com/v1/emails"</span><br />
            <span style={{ color: '#e2e8f0' }}>headers = </span><span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"Authorization"</span>: <span style={{ color: '#ecc94b' }}>"Bearer sm_live_key_9281"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"Content-Type"</span>: <span style={{ color: '#ecc94b' }}>"application/json"</span><br />
            <span style={{ color: '#a78bfa' }}>{`}`}</span><br />
            <span style={{ color: '#e2e8f0' }}>payload = </span><span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"from"</span>: <span style={{ color: '#ecc94b' }}>"Sumer Send &lt;admin@aiandthings.tech&gt;"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"to"</span>: <span style={{ color: '#ecc94b' }}>"customer@gmail.com"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"subject"</span>: <span style={{ color: '#ecc94b' }}>"System Confirmation"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"html"</span>: <span style={{ color: '#ecc94b' }}>"&lt;h3&gt;Account Activated Successfully&lt;/h3&gt;"</span><br />
            <span style={{ color: '#a78bfa' }}>{`}`}</span><br /><br />
            <span style={{ color: '#e2e8f0' }}>response = requests.</span><span style={{ color: '#38bdf8' }}>post</span>(url, json=payload, headers=headers)<br />
            <span style={{ color: '#38bdf8' }}>print</span>(response.json())
          </span>
        );
      case 'go':
        return (
          <span style={{ color: '#a1a1aa' }}>
            <span style={{ color: '#71717a' }}>// Go - Send Transactional Email</span><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>package</span> <span style={{ color: '#e2e8f0' }}>main</span><br /><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>import</span> <span style={{ color: '#e2e8f0' }}>{`(`}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"bytes"</span><br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"encoding/json"</span><br />
            &nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"net/http"</span><br />
            <span style={{ color: '#e2e8f0' }}>{`)`}</span><br /><br />
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>func</span> <span style={{ color: '#38bdf8' }}>main</span>() <span style={{ color: '#a78bfa' }}>{`{`}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>payload := map[string]interface{}{`{`}</span><br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"from"</span>:&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"Sumer Send &lt;admin@aiandthings.tech&gt;"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"to"</span>:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"customer@gmail.com"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"subject"</span>: <span style={{ color: '#ecc94b' }}>"System Alert"</span>,<br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"html"</span>:&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#ecc94b' }}>"&lt;b&gt;CPU load exceeded&lt;/b&gt;"</span>,<br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>{`}`}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>body, _ := json.Marshal(payload)</span><br /><br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>req, _ := http.NewRequest(</span><span style={{ color: '#ecc94b' }}>"POST"</span>, <span style={{ color: '#ecc94b' }}>"https://api.sumersend.com/v1/emails"</span>, bytes.NewBuffer(body))<br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>req.Header.Set(</span><span style={{ color: '#ecc94b' }}>"Authorization"</span>, <span style={{ color: '#ecc94b' }}>"Bearer sm_live_key_9281"</span>)<br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>req.Header.Set(</span><span style={{ color: '#ecc94b' }}>"Content-Type"</span>, <span style={{ color: '#ecc94b' }}>"application/json"</span>)<br /><br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>client := &amp;http.Client{}</span><br />
            &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>client.Do(req)</span><br />
            <span style={{ color: '#a78bfa' }}>{`}`}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color)', 
      color: 'var(--text-primary)',
      transition: 'background-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), color 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Arabic", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      overflowX: 'hidden',
      letterSpacing: isAr ? 'normal' : '-0.015em'
    }}>
      {/* Premium Apple Developer CSS & Keyframe Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes appleSlideUp {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes appleFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes envelopeFly {
          0% { transform: translate(-15px, 15px) scale(0.95); opacity: 0; }
          15% { opacity: 1; }
          50% { transform: translate(110px, -20px) scale(1.05) rotate(10deg); opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translate(220px, 0px) scale(0.9) rotate(0deg); opacity: 0; }
        }
        @keyframes radarSweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes toastProgressShrink {
          from { width: 100%; }
          to { width: 0%; }
        }

        /* Classes */
        .apple-animate-hero {
          animation: appleSlideUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .apple-animate-fade {
          animation: appleFade 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .bento-features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          contain: layout style;
        }
        @media (max-width: 768px) {
          .bento-features-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        .bento-col-span-2 {
          grid-column: span 2;
        }
        @media (max-width: 768px) {
          .bento-col-span-2 {
            grid-column: span 1 !important;
          }
        }
        
        .apple-bento-card {
          position: relative;
          background-color: var(--panel-bg);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          contain: content;
          height: 340px;
          box-sizing: border-box;
          transition: border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
                      box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .apple-bento-card:hover {
          border-color: var(--border-hover) !important;
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 12px 30px rgba(0,0,0,0.04);
        }
        [data-theme="dark"] .apple-bento-card:hover {
          box-shadow: 0 16px 40px rgba(0,0,0,0.45);
        }

        /* Preset Tier Buttons styling */
        .preset-btn {
          padding: 10px 20px;
          border-radius: 99px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: 1px solid var(--border-color);
          background-color: var(--panel-bg);
          color: var(--text-secondary);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .preset-btn.active {
          background-color: var(--text-primary);
          color: var(--bg-color);
          border-color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        [data-theme="dark"] .preset-btn.active {
          box-shadow: 0 4px 16px rgba(255, 255, 255, 0.05);
        }
        .preset-btn:hover:not(.active) {
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        /* High contrast styled code block */
        .mac-code-window pre {
          font-family: "SF Mono", "Fira Code", Monaco, Consolas, "Lucida Console", monospace;
          font-size: 12px;
          line-height: 1.6;
          color: #e2e8f0;
        }

        /* Custom apple slider styles */
        .apple-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          border-radius: 99px;
          outline: none;
          background: var(--border-color);
          transition: background 0.3s;
          cursor: pointer;
        }
        .apple-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--text-primary);
          border: 2px solid var(--bg-color);
          box-shadow: 0 2px 6px rgba(0,0,0,0.18);
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .apple-slider::-webkit-slider-thumb:hover {
          transform: scale(1.25);
        }
        .apple-slider::-webkit-slider-thumb:active {
          transform: scale(1.1);
        }

        /* Bento simula        /* Responsive Header Styling */
        .dropdown-drawer-link {
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          text-align: center;
          padding: 10px 16px;
          border-radius: 99px;
          transition: background-color 0.2s, color 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .dropdown-drawer-link:hover {
          background-color: rgba(0, 0, 0, 0.04);
          transform: scale(1.02);
        }
        [data-theme="dark"] .dropdown-drawer-link:hover {
          background-color: rgba(255, 255, 255, 0.06);
        }
        /* Unified Dropdown Drawer Animations matching inspoai.io */
        .mobile-dropdown-menu {
          position: fixed;
          top: 92px;
          left: 50%;
          width: 92%;
          max-width: 520px;
          z-index: 999;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          border-radius: 18px;
          font-family: var(--font-arabic), var(--font-family);
          opacity: 0;
          pointer-events: none;
          
          /* Anchor to top center for drag down / pull up vertical stretch */
          transform-origin: top center;
          transform: translateY(-36px) scaleY(0.5) scaleX(0.92) translateX(-50%);
          clip-path: inset(0 0 100% 0 rounded 18px);
          
          /* Snappy close transition (pull/stretch back up) */
          transition: opacity 0.25s cubic-bezier(0.32, 0.94, 0.6, 1),
                      transform 0.3s cubic-bezier(0.32, 0.94, 0.6, 1),
                      clip-path 0.3s cubic-bezier(0.32, 0.94, 0.6, 1),
                      background-color 0.3s, 
                      border-color 0.3s, 
                      box-shadow 0.3s;
        }

        /* Open State (Pull down with elastic spring stretch expanding to both sides of the header) */
        .mobile-dropdown-menu.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scaleY(1) scaleX(1) translateX(-50%);
          clip-path: inset(0 0 0% 0 rounded 18px);
          
          /* Elastic spring roll down transition */
          transition: opacity 0.35s ease-out,
                      transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      clip-path 0.55s cubic-bezier(0.16, 1, 0.3, 1),
                      background-color 0.3s, 
                      border-color 0.3s, 
                      box-shadow 0.3s;
        }

        /* Staggered Children Animations with 3D rotate and lift */
        .dropdown-stagger-item {
          opacity: 0;
          transform: translateY(16px) scale(0.96) rotateX(-8deg);
          transform-origin: top center;
          transition: opacity 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .mobile-dropdown-menu.open .dropdown-stagger-item {
          opacity: 1;
          transform: translateY(0) scale(1) rotateX(0deg);
        }

        /* Bypassing delays on close for instant unison snap-back */
        .mobile-dropdown-menu:not(.open) .dropdown-stagger-item {
          transition-delay: 0s !important;
          transition-duration: 0.18s;
          transform: translateY(8px) scale(0.98);
          opacity: 0;
        }

        /* Hover micro-interactions */
        .header-menu-toggle-btn {
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform: rotate(0deg) scale(1);
        }
        .header-menu-toggle-btn:hover {
          transform: rotate(0deg) scale(1.08);
        }
        .header-menu-toggle-btn:active {
          transform: rotate(0deg) scale(0.94);
        }
        .header-menu-toggle-btn.open {
          transform: rotate(180deg) scale(1);
        }
        .header-menu-toggle-btn.open:hover {
          transform: rotate(180deg) scale(1.08);
        }
        .header-menu-toggle-btn.open:active {
          transform: rotate(180deg) scale(0.94);
        }
        .header-logo-container:hover {
          transform: translateX(-50%) scale(1.05);
        }
        .header-cta-container:hover {
          transform: scale(1.02);
        }
        .header-cta-container:active {
          transform: scale(0.95);
        }
        .header-action-pill-btn {
          background-color: transparent;
          color: var(--text-primary);
          border: 1px solid var(--text-primary);
          transition: background-color 0.2s, transform 0.2s, border-color 0.2s;
        }
        .header-action-pill-btn:hover {
          background-color: var(--text-primary) !important;
          color: var(--panel-bg) !important;
        }
        .header-action-pill-btn:hover .arrow-icon {
          transform: translateX(2px);
        }
        [dir="rtl"] .header-action-pill-btn:hover .arrow-icon {
          transform: translateX(-2px) rotate(180deg);
        }
        [dir="rtl"] .header-action-pill-btn .arrow-icon {
          transform: rotate(180deg);
        }

        /* Desktop vs Mobile Header adjustments */
        .header-theme-toggle-desktop,
        .header-lang-toggle-desktop {
          display: none;
        }
        @media (min-width: 768px) {
          /* Expand header container */
          header {
            max-width: 960px !important;
          }
          /* Hide hamburger menu toggle */
          .header-menu-toggle-btn {
            display: none !important;
          }
          /* Logo placement change from absolute center to normal flow */
          .header-logo-container {
            position: static !important;
            left: auto !important;
            transform: none !important;
          }
          .header-logo-container:hover {
            transform: scale(1.05) !important;
          }
          /* Show desktop navigation links */
          .header-desktop-nav {
            display: flex !important;
          }
          /* Desktop Theme & Lang controls */
          .header-theme-toggle-desktop {
            display: flex !important;
          }
          .header-lang-toggle-desktop {
            display: flex !important;
          }
          .header-theme-toggle-desktop:hover,
          .header-lang-toggle-desktop:hover {
            background-color: rgba(0, 0, 0, 0.04);
            color: var(--text-primary);
          }
          [data-theme="dark"] .header-theme-toggle-desktop:hover,
          [data-theme="dark"] .header-lang-toggle-desktop:hover {
            background-color: rgba(255, 255, 255, 0.08);
          }
          .header-cta-container {
            gap: 8px !important;
          }
          /* Hide mobile dropdown drawer on desktop */
          .mobile-dropdown-menu {
            display: none !important;
          }
        }
      `}} />

      {/* Luxurious Centered Responsive Header matching inspoai.io */}
      <header style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: !showHeader 
          ? 'translateY(-80px) translateX(-50%) scale(0.92)' 
          : isScrolled 
            ? 'translateY(0) translateX(-50%) scale(0.98)' 
            : 'translateY(0) translateX(-50%) scale(1)',
        width: '92%',
        maxWidth: '520px',
        height: '56px',
        backgroundColor: theme === 'dark' ? 'rgba(10, 10, 10, 0.22)' : 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'saturate(180%) blur(40px)',
        WebkitBackdropFilter: 'saturate(180%) blur(40px)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '18px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-family)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, background-color 0.3s, box-shadow 0.3s',
        boxShadow: theme === 'dark'
          ? 'rgba(0, 0, 0, 0.5) 0px 16px 40px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(255, 255, 255, 0.03) 0px 0px 20px 0px inset'
          : 'rgba(0, 0, 0, 0.04) 0px 12px 32px, rgba(255, 255, 255, 0.75) 0px 1px 0px inset, rgba(255, 255, 255, 0.4) 0px 0px 20px 0px inset',
        opacity: showHeader ? 1 : 0,
        pointerEvents: showHeader ? 'auto' : 'none'
      }}>
        {/* Edge borders gradient wrapper */}
        <div className="nav-glass-card-edge" style={{ position: 'absolute', inset: 0, borderRadius: '17px', overflow: 'hidden', pointerEvents: 'none' }} />

        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          height: '100%',
          position: 'relative',
          zIndex: 10
        }}>
          
          {/* Column 1: Left Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open menu"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none'
            }}
            className={`header-menu-toggle-btn ${isMobileMenuOpen ? 'open' : ''}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6" style={{
                transform: isMobileMenuOpen ? 'translateY(6px) rotate(45deg)' : 'none',
                transformOrigin: '12px 6px',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} />
              <line x1="4" y1="12" x2="20" y2="12" style={{
                opacity: isMobileMenuOpen ? 0 : 1,
                transform: isMobileMenuOpen ? 'scaleX(0)' : 'none',
                transformOrigin: 'center',
                transition: 'opacity 0.2s, transform 0.2s'
              }} />
              <line x1="4" y1="18" x2="14" y2="18" style={{
                transform: isMobileMenuOpen ? 'translateY(-6px) rotate(-45deg) scaleX(1.6)' : 'none',
                transformOrigin: '9px 18px',
                transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }} />
            </svg>
          </button>

          {/* Column 2: Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setCurrentTab('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              textDecoration: 'none'
            }}
            className="header-logo-container"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-primary)' }}>
              <path d="M12 3L3 12H7V20H17V12H21L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {currentT.brand}
            </span>
          </a>

          {/* Column 2.5: Desktop Navigation Links (Center) */}
          <div className="header-desktop-nav" style={{
            display: 'none',
            alignItems: 'center',
            gap: '16px',
            height: '100%',
            justifyContent: 'center'
          }}>
            <a 
              href="#features" 
              onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} 
              style={{
                fontSize: '13.5px',
                fontWeight: activeSection === 'features' ? 600 : 500,
                color: activeSection === 'features' ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: activeSection === 'features' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'features') {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = activeSection === 'features' ? 'var(--text-primary)' : 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = activeSection === 'features' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') : 'transparent';
              }}
            >
              {isAr ? 'المميزات' : 'Features'}
            </a>
            <a 
              href="#pricing" 
              onClick={(e) => { e.preventDefault(); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} 
              style={{
                fontSize: '13.5px',
                fontWeight: activeSection === 'pricing' ? 600 : 500,
                color: activeSection === 'pricing' ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: activeSection === 'pricing' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (activeSection !== 'pricing') {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = activeSection === 'pricing' ? 'var(--text-primary)' : 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = activeSection === 'pricing' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)') : 'transparent';
              }}
            >
              {isAr ? 'الأسعار والخطط' : 'Pricing & Tiers'}
            </a>
            <a 
              href="#sandbox" 
              onClick={(e) => { e.preventDefault(); setCurrentTab('playground'); }} 
              style={{
                fontSize: '13.5px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.015)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-secondary)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isAr ? 'منصة الاختبار' : 'API Sandbox'}
            </a>
          </div>

          {/* Column 3: Right Sign In / Console action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="header-cta-container"
          >
            {/* Desktop Theme switcher */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                transition: 'color 0.2s, background-color 0.2s',
                boxSizing: 'border-box',
                width: '34px',
                height: '34px'
              }}
              className="header-theme-toggle-desktop"
              title={isAr ? 'تغيير المظهر' : 'Toggle Theme'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Desktop Language switcher */}
            <button 
              onClick={() => setLang(isAr ? 'en' : 'ar')} 
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-family)',
                fontSize: '11px',
                fontWeight: 600,
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px',
                borderRadius: '99px',
                transition: 'all 0.2s',
                boxSizing: 'border-box',
                height: '28px'
              }}
              className="header-lang-toggle-desktop"
              title={isAr ? 'English' : 'العربية'}
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            {user ? (
              <button
                onClick={() => setCurrentTab('dashboard')}
                className="header-action-pill-btn"
                style={{
                  height: '34px',
                  borderRadius: '99px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>{currentT.enterConsole}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }} className="arrow-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            ) : (
              <button
                onClick={() => setCurrentTab('auth-signin')}
                className="header-action-pill-btn"
                style={{
                  height: '34px',
                  borderRadius: '99px',
                  padding: '0 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }} className="arrow-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Unified Center-Aligned Dropdown Menu Drawer matching inspoai.io */}
      <div 
        className={`mobile-dropdown-menu ${isMobileMenuOpen ? 'open' : ''}`}
        style={{
          backgroundColor: theme === 'dark' ? 'rgba(10, 10, 10, 0.45)' : 'rgba(255, 255, 255, 0.55)',
          backdropFilter: 'saturate(180%) blur(40px)',
          WebkitBackdropFilter: 'saturate(180%) blur(40px)',
          border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: theme === 'dark'
            ? 'rgba(0, 0, 0, 0.5) 0px 20px 50px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(255, 255, 255, 0.03) 0px 0px 20px 0px inset'
            : 'rgba(0, 0, 0, 0.06) 0px 16px 40px, rgba(255, 255, 255, 0.75) 0px 1px 0px inset, rgba(255, 255, 255, 0.4) 0px 0px 20px 0px inset',
        }}
      >
        {/* Navigation Links */}
        <a 
          href="#features" 
          onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }} 
          className="dropdown-drawer-link dropdown-stagger-item"
          style={{ 
            fontWeight: activeSection === 'features' ? 700 : 500,
            color: activeSection === 'features' ? 'var(--accent-text)' : 'var(--text-primary)',
            backgroundColor: activeSection === 'features' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)') : 'transparent',
            transitionDelay: '0.04s'
          }}
        >
          <Zap size={15} style={{ opacity: 0.8 }} />
          <span>{isAr ? 'المميزات' : 'Features'}</span>
        </a>
        <a 
          href="#pricing" 
          onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }} 
          className="dropdown-drawer-link dropdown-stagger-item"
          style={{ 
            fontWeight: activeSection === 'pricing' ? 700 : 500,
            color: activeSection === 'pricing' ? 'var(--accent-text)' : 'var(--text-primary)',
            backgroundColor: activeSection === 'pricing' ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)') : 'transparent',
            transitionDelay: '0.08s'
          }}
        >
          <ShieldCheck size={15} style={{ opacity: 0.8 }} />
          <span>{isAr ? 'الأسعار والخطط' : 'Pricing & Tiers'}</span>
        </a>
        <a 
          href="#sandbox" 
          onClick={(e) => { e.preventDefault(); setIsMobileMenuOpen(false); setCurrentTab('playground'); }} 
          className="dropdown-drawer-link dropdown-stagger-item"
          style={{ 
            transitionDelay: '0.12s'
          }}
        >
          <Terminal size={15} style={{ opacity: 0.8 }} />
          <span>{isAr ? 'منصة الاختبار' : 'API Sandbox'}</span>
        </a>
        
        <div className="dropdown-stagger-item" style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0', transitionDelay: '0.16s' }} />
        
        <div className="dropdown-stagger-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0', transitionDelay: '0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            <Languages size={14} style={{ opacity: 0.7 }} />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.1px' }}>
              {isAr ? 'لغة الواجهة' : 'Interface Language'}
            </span>
          </div>
          <button 
            onClick={() => { setLang(isAr ? 'en' : 'ar'); }} 
            style={{ 
              background: 'none', 
              border: '1px solid var(--border-color)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)', 
              fontSize: '13px', 
              fontWeight: 600,
              width: '180px',
              height: '36px',
              borderRadius: '99px',
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {isAr ? 'English (EN)' : 'العربية (AR)'}
          </button>
        </div>

        <div className="dropdown-stagger-item" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '6px 0', transitionDelay: '0.24s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
            {theme === 'dark' ? <Moon size={14} style={{ opacity: 0.7 }} /> : <Sun size={14} style={{ opacity: 0.7 }} />}
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '-0.1px' }}>
              {isAr ? 'مظهر المنصة' : 'Theme Mode'}
            </span>
          </div>
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            style={{ 
              background: 'none', 
              border: '1px solid var(--border-color)', 
              cursor: 'pointer', 
              color: 'var(--text-primary)', 
              fontSize: '13px', 
              fontWeight: 600,
              width: '180px',
              height: '36px',
              borderRadius: '99px',
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {theme === 'dark' ? (isAr ? 'وضع النهار ☀️' : 'Light Mode ☀️') : (isAr ? 'الوضع الداكن 🌙' : 'Dark Mode 🌙')}
          </button>
        </div>
        
        {!user && (
          <>
            <div className="dropdown-stagger-item" style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0', transitionDelay: '0.28s' }} />
            <div className="dropdown-stagger-item" style={{ display: 'flex', flexDirection: 'column', gap: '8px', transitionDelay: '0.32s', alignItems: 'center' }}>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); setCurrentTab('auth-signup'); }} 
                className="btn-landing-primary"
                style={{
                  width: '180px',
                  height: '36px',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '99px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--panel-bg)',
                  border: '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxSizing: 'border-box'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                  e.currentTarget.style.transform = 'scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {isAr ? 'ابدأ مجاناً' : 'Get Started'}
              </button>
            </div>
          </>
        )}
      </div>

      <main id="landing-main-content">

      {/* Hero Section */}
      <section className="apple-animate-hero" style={{
        maxWidth: '960px',
        margin: '0 auto',
        padding: '70px 24px 40px 24px',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: 'var(--text-secondary)',
          display: 'block',
          marginBottom: '18px'
        }}>{currentT.taglineSub}</span>

        <h1 style={{
          fontSize: '60px',
          fontWeight: 800,
          letterSpacing: '-2.5px',
          lineHeight: 1.05,
          margin: '0 0 24px 0',
          color: 'var(--text-primary)'
        }}>
          {currentT.tagline}
        </h1>

        <p style={{
          fontSize: '19px',
          lineHeight: 1.55,
          color: 'var(--text-secondary)',
          maxWidth: '740px',
          margin: '0 auto 44px auto',
          fontWeight: 400,
          letterSpacing: '-0.3px'
        }}>
          {currentT.description}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <button 
            onClick={() => setCurrentTab('dashboard')} 
            className="btn-landing-primary"
            style={{ 
              backgroundColor: 'var(--text-primary)',
              color: 'var(--bg-color)',
              border: 'none',
              borderRadius: '999px',
              padding: '13px 30px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.88'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            {currentT.enterConsole}
          </button>
          <button 
            onClick={() => setCurrentTab('playground')} 
            style={{ 
              backgroundColor: 'var(--panel-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '999px',
              padding: '13px 30px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s, border-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--border-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            {currentT.sandbox}
          </button>
        </div>
      </section>

      {/* Bento Grid Features */}
      <ScrollReveal>
        <section id="features" style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '10px 24px 45px 24px',
        }}>
          <h2 style={{
            fontSize: '30px',
            fontWeight: 800,
            letterSpacing: '-0.8px',
            margin: '0 0 32px 0',
            textAlign: 'center',
            color: 'var(--text-primary)'
          }}>
            {isAr ? 'قنوات الإرسال المدعومة' : 'Supported Delivery Channels'}
          </h2>
          <div className="bento-features-grid">
            {/* Email API Card - Large (Span 2) */}
            <BentoCard glowColor="37, 99, 235" className="apple-bento-card bento-col-span-2">
              {/* Visual Simulator */}
              <div className="bento-sim-container" style={{ height: '120px', position: 'relative' }}>
                {/* Animated envelope and screen */}
                <div style={{
                  width: '60px',
                  height: '42px',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--panel-bg)',
                  position: 'absolute',
                  top: '40px',
                  left: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}>
                  <Terminal size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
                
                <div className="fly-email-plane">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                </div>

                <div style={{
                  width: '80px',
                  height: '50px',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '6px',
                  backgroundColor: 'var(--panel-bg)',
                  position: 'absolute',
                  top: '35px',
                  right: '30px',
                  padding: '6px',
                  boxShadow: '0 6px 15px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <span style={{ width: '12px', height: '3px', borderRadius: '1px', backgroundColor: 'var(--channel-email)' }} />
                    <span style={{ width: '25px', height: '3px', borderRadius: '1px', backgroundColor: 'var(--border-color)' }} />
                  </div>
                  <div style={{ height: '1.5px', width: '100%', backgroundColor: 'var(--border-color)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ height: '3px', width: '30px', backgroundColor: 'var(--border-color)', borderRadius: '1px' }} />
                    <span style={{ 
                      fontSize: '7px', 
                      fontWeight: 700, 
                      color: 'var(--success-text)', 
                      backgroundColor: 'var(--success-bg)', 
                      padding: '1px 3px', 
                      borderRadius: '2px' 
                    }}>INBOX</span>
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--channel-email)', marginBottom: '14px' }}>
                  <Mail size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>SMTP Bridge</span>
                </div>
                <h3 style={{ fontSize: '21px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>{currentT.channelEmail}</h3>
                <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                  {currentT.channelEmailDesc}
                </p>
              </div>
            </BentoCard>

            {/* Baghdad Latency Card - Small (Span 1) */}
            <BentoCard glowColor="249, 115, 22" className="apple-bento-card">
              {/* Radar Simulator */}
              <div className="bento-sim-container" style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', height: '110px' }}>
                <div style={{
                  position: 'relative',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div className="radar-sweep-line" />
                  <div style={{
                    position: 'absolute',
                    width: '35px',
                    height: '35px',
                    borderRadius: '50%',
                    border: '1.5px dashed rgba(var(--accent-rgb), 0.2)'
                  }} />
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent-color)',
                    zIndex: 2
                  }} />
                  {/* Latency pulse ring */}
                  <div style={{
                    position: 'absolute',
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    border: '2px solid var(--accent-color)',
                    animation: 'pulseRing 2s infinite ease-out',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--warning-color)', marginBottom: '14px' }}>
                  <Zap size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Network Performance</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>{isAr ? 'سرعة فائقة بالمللي ثانية' : 'Single-Digit Milliseconds'}</h3>
                <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'زمن إرسال فائق السرعة عبر خوادم محلية مستقرة.' : 'Fast execution and instant webhook delivery feedback loops.'}
                </p>
              </div>
            </BentoCard>

            {/* Carrier Info Card - Small (Span 1) */}
            <BentoCard glowColor="16, 185, 129" className="apple-bento-card">
              {/* Live routing visual */}
              <div className="bento-sim-container" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', height: '110px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '9.5px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  <span style={{ fontWeight: 700 }}>CARRIER ROUTER</span>
                  <span style={{ color: 'var(--success-text)', marginInlineStart: 'auto' }}>100% Tunnel UP</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ZAIN</span>
                  <span style={{ width: '40px', height: '2px', backgroundColor: 'var(--success-color)' }} />
                  <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>Priority OK</span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '8px', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>ASIA</span>
                  <span style={{ width: '40px', height: '2px', backgroundColor: 'var(--success-color)' }} />
                  <span style={{ fontSize: '7.5px', color: 'var(--text-muted)' }}>Priority OK</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success-text)', marginBottom: '14px' }}>
                  <Cpu size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Iraq Carriers</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>{isAr ? 'ربط الناقل المباشر' : 'Direct Carrier Tunnels'}</h3>
                <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'توصيل عبر خطوط مباشرة لكافة شبكات المحمول في العراق.' : 'Direct tunnels with local telecom operators for high delivery rates.'}
                </p>
              </div>
            </BentoCard>

            {/* SMS API Card - Large (Span 2) */}
            <BentoCard glowColor="16, 185, 129" className="apple-bento-card bento-col-span-2">
              {/* SMS Simulator visual */}
              <div className="bento-sim-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                <div style={{
                  width: '180px',
                  height: '80px',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '16px',
                  backgroundColor: 'var(--panel-bg)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', fontSize: '9px', borderBottom: '1.5px solid var(--border-color)', paddingBottom: '4px' }}>
                    <span style={{ fontWeight: 700 }}>OTP Verification</span>
                    <span style={{ color: 'var(--text-muted)', marginInlineStart: 'auto' }}>1s ago</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {smsOtpStatus === 'typing' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 600 }}>Code: [ 9 2 8</span>
                        <span style={{ width: '1.5px', height: '12px', backgroundColor: 'var(--text-primary)', animation: 'cursorBlink 1s infinite' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600 }}> ]</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-text)' }}>
                        <CheckCircle2 size={13} />
                        <span style={{ fontSize: '11.5px', fontWeight: 700 }}>9281 Verified</span>
                      </div>
                    )}
                  </div>
                  <div style={{ height: '3px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: smsOtpStatus === 'typing' ? '65%' : '100%', 
                      backgroundColor: smsOtpStatus === 'typing' ? 'var(--warning-color)' : 'var(--success-color)',
                      transition: 'width 0.4s, background-color 0.4s'
                    }} />
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--channel-sms)', marginBottom: '14px' }}>
                  <MessageSquare size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Zain / Asia / Korek</span>
                </div>
                <h3 style={{ fontSize: '21px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>{currentT.channelSms}</h3>
                <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                  {currentT.channelSmsDesc}
                </p>
              </div>
            </BentoCard>

            {/* WhatsApp API Card - Large (Span 2) */}
            <BentoCard glowColor="37, 211, 102" className="apple-bento-card bento-col-span-2">
              {/* Interactive WhatsApp chat visual */}
              <div className="bento-sim-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', height: '130px' }}>
                <div style={{
                  width: '240px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  backgroundColor: 'var(--panel-bg)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                  overflow: 'hidden'
                }}>
                  <div style={{ backgroundColor: '#075e54', padding: '6px 12px', color: 'white', fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'white' }} />
                    <span>Sumer Send Whatsapp Bridge</span>
                  </div>
                  <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ 
                      backgroundColor: 'rgba(var(--channel-whatsapp-rgb), 0.05)', 
                      border: '1px solid rgba(var(--channel-whatsapp-rgb), 0.1)', 
                      borderRadius: '8px', 
                    	padding: '6px 10px', 
                    	fontSize: '9.5px', 
                    	maxWidth: '85%' 
                    }}>
                      {whatsappMockState === 'idle' && "Hi Jasim, confirm booking #4829?"}
                      {whatsappMockState === 'confirmed' && "✅ Booking #4829 Confirmed. Thank you!"}
                      {whatsappMockState === 'cancelled' && "❌ Booking #4829 Cancelled."}
                    </div>
                    {whatsappMockState === 'idle' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button 
                          onClick={() => setWhatsappMockState('confirmed')}
                          style={{ flex: 1, padding: '4px', fontSize: '8px', fontWeight: 700, color: 'var(--success-text)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--panel-bg)' }}
                        >
                          Confirm
                        </button>
                        <button 
                          onClick={() => setWhatsappMockState('cancelled')}
                          style={{ flex: 1, padding: '4px', fontSize: '8px', fontWeight: 700, color: 'var(--danger-text)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'var(--panel-bg)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    {whatsappMockState !== 'idle' && (
                      <button 
                        onClick={() => setWhatsappMockState('idle')}
                        style={{ padding: '4px', fontSize: '8px', fontWeight: 600, color: 'var(--text-muted)', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'right' }}
                      >
                        Reset Sim
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--channel-whatsapp)', marginBottom: '14px' }}>
                  <Phone size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Meta API Suite</span>
                </div>
                <h3 style={{ fontSize: '21px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>{currentT.channelWhatsapp}</h3>
                <p style={{ fontSize: '13.5px', lineHeight: 1.55, color: 'var(--text-secondary)', margin: 0 }}>
                  {currentT.channelWhatsappDesc}
                </p>
              </div>
            </BentoCard>

            {/* Shield Security Card - Small (Span 1) */}
            <BentoCard glowColor="0, 107, 255" className="apple-bento-card">
              {/* Key signature visual */}
              <div className="bento-sim-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                <div style={{
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--panel-bg)',
                  padding: '10px 14px',
                  fontSize: '8px',
                  fontFamily: 'monospace',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ color: 'var(--text-muted)' }}># API KEY VERIFICATION</div>
                  <div style={{ color: 'var(--success-text)' }}>KEY_AUTHORIZED: true</div>
                  <div style={{ color: 'var(--accent-color)' }}>SIGNATURE: sha256_0a21f...</div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)', marginBottom: '14px' }}>
                  <ShieldCheck size={22} />
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Security Standards</span>
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px 0', letterSpacing: '-0.3px' }}>{isAr ? 'مصادقة حماية مشددة' : 'Enterprise Security'}</h3>
                <p style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--text-secondary)', margin: 0 }}>
                  {isAr ? 'حماية تامة للرموز عبر مفاتيح API وعمليات تحقق 2FA.' : 'Verify identities and audit activities through standard authentication layers.'}
                </p>
              </div>
            </BentoCard>
          </div>
        </section>
      </ScrollReveal>

      {/* Simulated Live Developer Console Mockup */}
      <ScrollReveal>
        <section style={{
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(var(--text-primary), 0.003)',
          padding: '50px 24px'
        }}>
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.8px', margin: '0 0 14px 0' }}>{currentT.showcaseTitle}</h2>
              <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.55 }}>{currentT.showcaseDesc}</p>
            </div>

            {/* Console CSS Simulated Window */}
            <div 
              onMouseEnter={() => setIsConsoleHovered(true)}
              onMouseLeave={() => setIsConsoleHovered(false)}
              style={{
                backgroundColor: theme === 'dark' ? '#09090b' : '#ffffff',
                border: isConsoleHovered 
                  ? '1px solid rgba(99, 102, 241, 0.5)' 
                  : '1px solid var(--border-color)',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: isConsoleHovered 
                  ? '0 20px 50px rgba(99, 102, 241, 0.12), 0 0 0 1px rgba(99, 102, 241, 0.15)' 
                  : '0 10px 40px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                transform: isConsoleHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s'
              }}
            >
              {/* Window title bar */}
              <div style={{
                height: '42px',
                borderBottom: '1px solid var(--border-color)',
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
                gap: '6px',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginLeft: '12px', letterSpacing: '0.2px' }}>
                    {isAr ? 'منصة تحكم سومر سيند (محاكاة)' : 'Sumer Send Platform Dashboard (Simulated)'}
                  </span>
                </div>
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: 'var(--success-text)',
                  backgroundColor: 'var(--success-bg)',
                  padding: '2px 8px',
                  borderRadius: '6px'
                }}>
                  {isAr ? 'متصل بالشبكة' : 'LIVE CONSOLE'}
                </div>
              </div>

              {/* Layout Wrapper */}
              <div style={{
                display: 'flex',
                minHeight: '340px'
              }}>
                {/* Mini Console Sidebar */}
                <div style={{
                  width: '60px',
                  borderInlineEnd: '1px solid var(--border-color)',
                  backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.005)' : 'rgba(0,0,0,0.005)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '20px 0',
                  gap: '24px'
                }}>
                  <div style={{ color: 'var(--accent-color)' }}><Cpu size={16} /></div>
                  <div style={{ color: 'var(--text-muted)' }}><Mail size={16} /></div>
                  <div style={{ color: 'var(--text-muted)' }}><MessageSquare size={16} /></div>
                  <div style={{ color: 'var(--text-muted)' }}><ShieldCheck size={16} /></div>
                </div>

                {/* Main Content simulation */}
                <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Stats Blocks */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Total Dispatched</span>
                      <span style={{ fontSize: '20px', fontWeight: 700 }}>{mockStats.sent.toLocaleString()}</span>
                    </div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Delivery Rate</span>
                      <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--success-text)' }}>{mockStats.rate}%</span>
                    </div>
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '12px 16px' }}>
                      <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>Wallet Balance</span>
                      <span style={{ fontSize: '18px', fontWeight: 700 }}>{mockStats.balance.toLocaleString()} <span style={{ fontSize: '10.5px', fontWeight: 500 }}>IQD</span></span>
                    </div>
                  </div>

                  {/* Live SVG Graph & Trigger Box */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
                    {/* Graph */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>{currentT.consoleTraffic}</span>
                      <svg viewBox="0 0 400 100" style={{ width: '100%', height: '80px', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.25"/>
                            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0.0"/>
                          </linearGradient>
                        </defs>
                        <line x1="0" y1="20" x2="400" y2="20" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="0" y1="50" x2="400" y2="50" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3,3" />
                        <line x1="0" y1="80" x2="400" y2="80" stroke="var(--border-color)" strokeWidth="0.5" strokeDasharray="3,3" />
                        
                        <path 
                          d={getGraphPath()} 
                          fill="none" 
                          stroke="var(--accent-color)" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                          style={{ transition: 'd 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                        <path 
                          d={`${getGraphPath()} L 400 100 L 0 100 Z`} 
                          fill="url(#chartGrad)" 
                          style={{ transition: 'd 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}
                        />
                        <circle cx="400" cy={graphPoints[graphPoints.length - 1]} r="4" fill="var(--accent-color)" style={{ transition: 'cy 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                        <circle cx="400" cy={graphPoints[graphPoints.length - 1]} r="8" fill="none" stroke="var(--accent-color)" strokeWidth="1.5" style={{ transition: 'cy 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                          <animate attributeName="r" values="4;12;4" dur="2s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite" />
                        </circle>
                      </svg>
                    </div>

                    {/* Trigger Simulator */}
                    <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Sandbox Gateway router</span>
                        <p style={{ fontSize: '10.5px', color: 'var(--text-muted)', margin: '0 0 12px 0' }}>Trigger simulated dispatch to inspect console log output changes.</p>
                      </div>

                      <button 
                        onClick={handleTriggerApiCall}
                        className="btn-landing-primary"
                        style={{
                          width: '100%',
                          backgroundColor: 'var(--text-primary)',
                          color: 'var(--bg-color)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                      >
                        <Play size={11} fill="currentColor" />
                        <span>{currentT.triggerTest}</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter and Logs list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700 }}>{currentT.consoleLogs}</span>
                      
                      {/* Log Filters */}
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {['all', 'email', 'sms', 'whatsapp'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => setMockTab(tab as any)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: mockTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                              backgroundColor: mockTab === tab ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : 'transparent'
                            }}
                          >
                            {tab.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Logs Table Output */}
                    <div style={{
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: theme === 'dark' ? '#060608' : '#fafafa'
                    }}>
                      {filteredMockLogs.map((log, index) => (
                        <div 
                          key={log.id} 
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 14px',
                            borderBottom: index === filteredMockLogs.length - 1 ? 'none' : '1px solid var(--border-color)',
                            fontSize: '11.5px',
                            animation: 'appleSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ 
                              fontSize: '8px', 
                              fontWeight: 700, 
                              padding: '2px 6px', 
                              borderRadius: '4px',
                              color: log.type === 'email' ? 'var(--channel-email-text)' : log.type === 'sms' ? 'var(--channel-sms-text)' : 'var(--channel-whatsapp-text)',
                              backgroundColor: log.type === 'email' ? 'rgba(var(--channel-email-rgb), 0.08)' : log.type === 'sms' ? 'rgba(var(--channel-sms-rgb), 0.08)' : 'rgba(var(--channel-whatsapp-rgb), 0.08)'
                            }}>
                              {log.type.toUpperCase()}
                            </span>
                            <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{log.to}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--success-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                              {log.status}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '10.5px' }}>{log.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Code quickstarts / Syntax IDE Block */}
      <ScrollReveal>
        <section id="sandbox" style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '70px 24px 50px 24px'
        }}>
          {/* Centered Heading */}
          <div style={{ textAlign: 'center', marginBottom: '44px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--text-secondary)',
              display: 'block',
              marginBottom: '12px'
            }}>{currentT.brand} API ENGINE</span>
            <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.7px', margin: '0 0 14px 0', color: 'var(--text-primary)' }}>{currentT.quickstart}</h2>
            <p style={{ fontSize: '15.5px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0', lineHeight: 1.55 }}>{currentT.quickstartDesc}</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '40px',
            alignItems: 'center'
          }}>
            {/* Left Column: Feature Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}><CheckCircle2 size={18} /></div>
                <div>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '3px' }}>{isAr ? 'تفويض بروتوكول Bearer بسيط وآمن' : 'Bearer Authorization'}</strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.45, display: 'block' }}>
                    {isAr ? 'مصادقة قياسية سهلة الربط باستخدام رموز المفاتيح sm_live أو sm_send.' : 'Simple auth integration using standard authorization headers.'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}><CheckCircle2 size={18} /></div>
                <div>
                  <strong style={{ fontSize: '14px', display: 'block', marginBottom: '3px' }}>{isAr ? 'عائد استجابة موحد ومفهوم' : 'JSON Standard Responses'}</strong>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.45, display: 'block' }}>
                    {isAr ? 'تتلقى ردوداً منظمة ومحددة لمعالجة التحليلات وإدارة الاستثناءات في كودك.' : 'Structured execution codes and trace identifiers for clean log management.'}
                  </span>
                </div>
              </div>
            </div>

            {/* IDE Window with copy option */}
            <div 
              className="mac-code-window" 
              onMouseEnter={() => setIsIdeHovered(true)}
              onMouseLeave={() => setIsIdeHovered(false)}
              style={{
                backgroundColor: '#09090b',
                border: isIdeHovered 
                  ? '1px solid rgba(139, 92, 246, 0.5)' 
                  : '1px solid #1c1c1f',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: isIdeHovered 
                  ? '0 20px 50px rgba(139, 92, 246, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.15)' 
                  : '0 12px 40px rgba(0,0,0,0.18)',
                transform: isIdeHovered ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s'
              }}
            >
              {/* Window tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                height: '38px',
                borderBottom: '1px solid #1a1a1e',
                backgroundColor: '#09090b'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['curl', 'node', 'python', 'go'].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => {
                        setActiveCodeTab(tab as any);
                        setCopied(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: activeCodeTab === tab ? '#ffffff' : '#a1a1aa',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '5px',
                        backgroundColor: activeCodeTab === tab ? '#1c1c21' : 'transparent',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab === 'curl' ? 'cURL' : tab === 'node' ? 'Node.js' : tab === 'python' ? 'Python' : 'Go'}
                    </button>
                  ))}
                </div>

                {/* Window buttons & copy option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={copyToClipboard}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#a1a1aa',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10px',
                      fontWeight: 700,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e2e8f0'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#a1a1aa'}
                    title="Copy snippet"
                  >
                    {copied ? <Check size={11} style={{ color: 'var(--success-text)' }} /> : <Copy size={11} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#27272a' }} />
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#27272a' }} />
                  </div>
                </div>
              </div>

              {/* Code viewport container */}
              <pre style={{
                margin: 0,
                padding: '20px',
                overflowX: 'auto',
                direction: 'ltr',
                textAlign: 'left',
                backgroundColor: '#09090b',
                minHeight: '260px'
              }}>
                <code>{renderHighlightedCode()}</code>
              </pre>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Apple Store style pricing calculator */}
      <ScrollReveal>
        <section id="pricing" style={{
          borderTop: '1px solid var(--border-color)',
          padding: '50px 24px',
          backgroundColor: 'var(--panel-bg)'
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '12px'
              }}>{currentT.pricing}</span>
              <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.7px', margin: '0 0 14px 0' }}>{currentT.calcTitle}</h2>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', margin: '0 0 36px 0' }}>{currentT.calcDesc}</p>

              {/* Sliding Segmented iOS Control */}
              <div style={{
                display: 'inline-flex',
                backgroundColor: theme === 'dark' ? '#18181b' : '#f4f4f5',
                padding: '4px',
                borderRadius: '99px',
                position: 'relative',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid var(--border-color)',
                boxSizing: 'border-box'
              }}>
                {/* Sliding Pill Background */}
                <div style={{
                  position: 'absolute',
                  top: '4px',
                  bottom: '4px',
                  left: isAr 
                    ? (presetTier === 'starter' ? 'calc(66.66% + 2px)' : presetTier === 'growth' ? 'calc(33.33% + 2px)' : '4px')
                    : (presetTier === 'starter' ? '4px' : presetTier === 'growth' ? 'calc(33.33% + 2px)' : 'calc(66.66% + 2px)'),
                  width: 'calc(33.33% - 6px)',
                  backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                  borderRadius: '99px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  transition: 'left 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  opacity: presetTier ? 1 : 0
                }} />
                
                {/* Segment Buttons */}
                {['starter', 'growth', 'enterprise'].map((tier) => (
                  <button
                    key={tier}
                    onClick={() => handleApplyPreset(tier as any)}
                    style={{
                      flex: 1,
                      backgroundColor: 'transparent',
                      border: 'none',
                      outline: 'none',
                      padding: '10px 0',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      borderRadius: '99px',
                      cursor: 'pointer',
                      zIndex: 1,
                      color: presetTier === tier 
                        ? 'var(--text-primary)' 
                        : 'var(--text-secondary)',
                      transition: 'color 0.25s'
                    }}
                  >
                    {tier === 'starter' ? currentT.presetStarter : tier === 'growth' ? currentT.presetGrowth : currentT.presetEnterprise}
                  </button>
                ))}
              </div>
            </div>

            {/* Configurator block */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '32px'
            }}>
              {/* Email configured slider */}
              <div 
                onMouseEnter={() => setIsEmailCardHovered(true)}
                onMouseLeave={() => setIsEmailCardHovered(false)}
                style={{
                  border: isEmailCardHovered 
                    ? '1px solid rgba(37, 99, 235, 0.5)' 
                    : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '28px',
                  backgroundColor: isEmailCardHovered 
                    ? (theme === 'dark' ? 'rgba(37, 99, 235, 0.02)' : 'rgba(37, 99, 235, 0.01)')
                    : 'rgba(var(--text-primary), 0.002)',
                  boxShadow: isEmailCardHovered 
                    ? '0 12px 30px rgba(37, 99, 235, 0.08), 0 0 0 1px rgba(37, 99, 235, 0.15)' 
                    : 'none',
                  transform: isEmailCardHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 700, marginBottom: '18px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} style={{ color: 'var(--channel-email)' }} /> 
                    {currentT.channelEmail}
                  </span>
                  <span>{emailCount.toLocaleString()} {isAr ? 'رسالة' : 'messages'}</span>
                </div>
                <input 
                  type="range" 
                  aria-label={isAr ? 'حجم البريد الإلكتروني' : 'Email Volume'}
                  min="0" 
                  max="100000" 
                  step="1000"
                  value={emailCount} 
                  onChange={(e) => handleSliderChange('email', parseInt(e.target.value))}
                  className="apple-slider"
                  style={{
                    background: `linear-gradient(${isAr ? '270deg' : '90deg'}, var(--channel-email) ${(emailCount / 100000) * 100}%, var(--border-color) ${(emailCount / 100000) * 100}%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  <span>0</span>
                  <span>{currentT.emailRateLabel}</span>
                  <span>100k</span>
                </div>
              </div>

              {/* SMS configured slider */}
              <div 
                onMouseEnter={() => setIsSmsCardHovered(true)}
                onMouseLeave={() => setIsSmsCardHovered(false)}
                style={{
                  border: isSmsCardHovered 
                    ? '1px solid rgba(16, 185, 129, 0.5)' 
                    : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '28px',
                  backgroundColor: isSmsCardHovered 
                    ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.02)' : 'rgba(16, 185, 129, 0.01)')
                    : 'rgba(var(--text-primary), 0.002)',
                  boxShadow: isSmsCardHovered 
                    ? '0 12px 30px rgba(16, 185, 129, 0.08), 0 0 0 1px rgba(16, 185, 129, 0.15)' 
                    : 'none',
                  transform: isSmsCardHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 700, marginBottom: '18px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={16} style={{ color: 'var(--channel-sms)' }} /> 
                    {currentT.channelSms}
                  </span>
                  <span>{smsCount.toLocaleString()} {isAr ? 'رسالة' : 'messages'}</span>
                </div>
                <input 
                  type="range" 
                  aria-label={isAr ? 'حجم رسائل SMS' : 'SMS Volume'}
                  min="0" 
                  max="20000" 
                  step="100"
                  value={smsCount} 
                  onChange={(e) => handleSliderChange('sms', parseInt(e.target.value))}
                  className="apple-slider"
                  style={{
                    background: `linear-gradient(${isAr ? '270deg' : '90deg'}, var(--channel-sms) ${(smsCount / 20000) * 100}%, var(--border-color) ${(smsCount / 20000) * 100}%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  <span>0</span>
                  <span>{currentT.smsRateLabel}</span>
                  <span>20k</span>
                </div>
              </div>

              {/* WhatsApp configured slider */}
              <div 
                onMouseEnter={() => setIsWhatsappCardHovered(true)}
                onMouseLeave={() => setIsWhatsappCardHovered(false)}
                style={{
                  border: isWhatsappCardHovered 
                    ? '1px solid rgba(37, 211, 102, 0.5)' 
                    : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '28px',
                  backgroundColor: isWhatsappCardHovered 
                    ? (theme === 'dark' ? 'rgba(37, 211, 102, 0.02)' : 'rgba(37, 211, 102, 0.01)')
                    : 'rgba(var(--text-primary), 0.002)',
                  boxShadow: isWhatsappCardHovered 
                    ? '0 12px 30px rgba(37, 211, 102, 0.08), 0 0 0 1px rgba(37, 211, 102, 0.15)' 
                    : 'none',
                  transform: isWhatsappCardHovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s, box-shadow 0.3s, background-color 0.3s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 700, marginBottom: '18px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} style={{ color: 'var(--channel-whatsapp)' }} /> 
                    {currentT.channelWhatsapp}
                  </span>
                  <span>{whatsappCount.toLocaleString()} {isAr ? 'رسالة' : 'messages'}</span>
                </div>
                <input 
                  type="range" 
                  aria-label={isAr ? 'حجم رسائل واتساب' : 'WhatsApp Volume'}
                  min="0" 
                  max="10000" 
                  step="100"
                  value={whatsappCount} 
                  onChange={(e) => handleSliderChange('whatsapp', parseInt(e.target.value))}
                  className="apple-slider"
                  style={{
                    background: `linear-gradient(${isAr ? '270deg' : '90deg'}, var(--channel-whatsapp) ${(whatsappCount / 10000) * 100}%, var(--border-color) ${(whatsappCount / 10000) * 100}%)`
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                  <span>0</span>
                  <span>{currentT.whatsappRateLabel}</span>
                  <span>10k</span>
                </div>
              </div>

              {/* Total monthly cost breakdown panel */}
              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '36px',
                marginTop: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', fontWeight: 700, marginBottom: '4px' }}>{currentT.estMonthly}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{currentT.pricingSub}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ 
                      fontSize: '44px', 
                      fontWeight: 800, 
                      letterSpacing: '-2px', 
                      color: 'var(--text-primary)'
                    }}>
                      {totalCost.toLocaleString()}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-secondary)' }}>{currentT.iqd}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/{currentT.perMonth}</span>
                  </div>
                </div>

                {/* Cost Breakdown split progress bar */}
                <div style={{
                  height: '6px',
                  width: '100%',
                  backgroundColor: 'var(--border-color)',
                  borderRadius: '99px',
                  display: 'flex',
                  overflow: 'hidden'
                }}>
                  <div 
                    style={{ 
                      width: `${totalCost > 0 ? ((emailCount * emailRate) / totalCost) * 100 : 0}%`, 
                      backgroundColor: 'var(--channel-email)', 
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} 
                    title="Email API Cost Share"
                  />
                  <div 
                    style={{ 
                      width: `${totalCost > 0 ? ((smsCount * smsRate) / totalCost) * 100 : 0}%`, 
                      backgroundColor: 'var(--channel-sms)', 
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} 
                    title="SMS OTP Cost Share"
                  />
                  <div 
                    style={{ 
                      width: `${totalCost > 0 ? ((whatsappCount * whatsappRate) / totalCost) * 100 : 0}%`, 
                      backgroundColor: 'var(--channel-whatsapp)', 
                      transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)' 
                    }} 
                    title="WhatsApp API Cost Share"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>
      </ScrollReveal>

      </main>

      {/* Luxurious Glassmorphic Floating Pill Footer matching Header style */}
      <footer style={{
        maxWidth: '520px',
        width: '92%',
        margin: '60px auto 40px auto',
        padding: '24px',
        backgroundColor: theme === 'dark' ? 'rgba(10, 10, 10, 0.22)' : 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'saturate(180%) blur(40px)',
        WebkitBackdropFilter: 'saturate(180%) blur(40px)',
        border: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '18px',
        textAlign: 'center',
        fontFamily: isAr ? 'var(--font-arabic)' : 'var(--font-family)',
        boxShadow: theme === 'dark'
          ? 'rgba(0, 0, 0, 0.4) 0px 12px 32px, rgba(255, 255, 255, 0.1) 0px 1px 0px inset, rgba(255, 255, 255, 0.03) 0px 0px 20px 0px inset'
          : 'rgba(0, 0, 0, 0.03) 0px 8px 24px, rgba(255, 255, 255, 0.75) 0px 1px 0px inset, rgba(255, 255, 255, 0.4) 0px 0px 20px 0px inset',
      }}>
        {/* Brand logo in footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--text-primary)' }}>
            <path d="M12 3L3 12H7V20H17V12H21L12 3Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 8V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 11L12 8L15 11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            {currentT.brand}
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          {currentT.footer}
        </p>
      </footer>
    </div>
  );
};
