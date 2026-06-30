import React, { useState, useRef, useEffect } from 'react';
import { backgroundData } from '../data/background_data';
import { 
  Mail, MessageSquare, Phone, Check, Globe, Shield, Zap, Code, 
  Terminal, Sparkles, ArrowRight, ArrowLeft, SunMoon, Languages, 
  Lock, Cpu, Database, ChevronRight, Activity, Share2, Layers, Copy
} from 'lucide-react';

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
          ? `1px solid rgba(${glowColor ? glowColor : '24, 24, 27'}, 0.4)` 
          : '1px solid var(--border-color)',
        boxShadow: isHovered 
          ? `0 12px 30px rgba(${glowColor ? glowColor : '24, 24, 27'}, 0.04), 0 0 0 1px rgba(${glowColor ? glowColor : '24, 24, 27'}, 0.08)` 
          : 'none',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        cursor: 'pointer',
        overflow: 'hidden',
        backgroundColor: 'var(--panel-bg)',
        borderRadius: '16px',
        padding: '24px'
      }}
    >
      {isHovered && (
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(280px circle at ${coords.x}px ${coords.y}px, rgba(${glowColor ? glowColor : '24, 24, 27'}, 0.06), transparent 80%)`,
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



export const PixelShaderLogo: React.FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: -1000, y: -1000, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // SVG path data from Artboard 2.svg
    const pathData = "M629.75,552.54c-22.91-10.27-46.54-17.17-72.24-15.95.12-.61.1-.78.18-.84,1.2-.9,2.45-1.74,3.63-2.68,29.98-23.97,42.71-55.02,35.06-92.67-11.14-54.83-65.97-87.63-120-73.02-34.39,9.3-61.05,40.11-65.06,75.2-1.95,17.05-8.08,24.26-24.65,28.77-5.74,1.56-11.62,2.67-17.32,4.37-7.74,2.31-11.33,8.83-10.11,16.66,1.73,11.08,8.96,18.02,17.54,23.91,13.89,9.54,29.99,12.78,46.17,15.67,5.65,1.01,11.34,1.74,17.81,2.71-5.6,3.24-10.1,6.46-14.21,10.15-25.42,22.83-40.64,50.61-41.52,85.44-.12,4.56,1.12,5.85,5.74,5.84,57.86-.16,115.72-.2,173.58-.06,23.95.06,42.11-10.1,54.89-30.05,9.68-15.1,13.21-31.87,12.87-49.65-.04-2.11-.41-2.92-2.37-3.79ZM462.32,520.51c-2.1.36-4.16.58-6.27.49-24.92-.82-48.9-5.64-71.28-17.02-4.12-2.1-8.29-4.33-11.18-8.15-3.06-4.04-2.22-6.55,2.65-7.69,4.21-.98,8.52-1.55,12.75-2.49,7.84-1.74,14.77-5.32,21.17-10.22,7.54-5.78,13.59-5.31,20.31,1.56,10.11,10.35,20.61,20.18,32.98,27.84,1.94,1.2,3.37,2.98,4.38,5.05,2.65,5.44.42,9.59-5.5,10.61ZM539.86,445.44l-4.18,1.15c-.44.16-.89.29-1.34.42,0,0-.01,0-.02,0-5.17,1.96-11.16,4.93-15.91,9.3-3.46,3.19-8.91,17.26-11.59,24.6-.55,1.52-2.69,1.52-3.26.01-2.03-5.38-5.6-14.36-8.72-20.04h0c-1.17-1.85-2.38-3.43-3.62-4.57-.81-.74-1.48-1.43-2.05-2.09-.01-.01-.02-.02-.04-.04-4.15-3.17-8.89-5.47-13.11-7.09-.44-.14-1.15-.38-1.6-.52l-4.18-1.15c-1.71-.47-1.7-2.89,0-3.36l3.78-1.03s.01,0,.02,0c5.13-1.8,11.34-4.67,16.4-8.95,0,0,.01,0,.02-.02.28-.3.58-.6.92-.91.48-.44.95-.95,1.42-1.51,0,0,0,0,0,0,3.46-4.85,8.16-16.68,10.61-23.16.57-1.5,2.69-1.52,3.25-.02,2.77,7.32,8.43,21.5,11.91,24.7,5.23,4.81,11.99,7.94,17.48,9.87,0,0,.01,0,.02,0l3.78,1.03c1.71.47,1.71,2.89,0,3.36Z";
    
    const path = new Path2D(pathData);

    const render = () => {
      const speed = mouse.isHovered ? 0.08 : 0.03;
      time += speed;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const scale = 0.58; 
      const step = 8; 
      const screenPixelSize = step * scale;

      // 3D Perspective Rotation Calculations
      let rotX = 0;
      let rotY = 0;

      if (mouse.isHovered) {
        // Calculate normalized offset from center (-1 to 1)
        const dx = (mouse.x - w / 2) / (w / 2);
        const dy = (mouse.y - h / 2) / (h / 2);
        // Tilt towards cursor (max 26 degrees)
        rotY = dx * 26;
        rotX = -dy * 26;
      } else {
        // Gentle 3D idle floating oscillation
        rotY = Math.sin(time * 0.8) * 14;
        rotX = Math.cos(time * 0.8) * 8;
      }

      // Apply 3D transform directly to style
      canvas.style.transform = `perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;

      for (let y = 140; y < 860; y += step) {
        for (let x = 140; x < 860; x += step) {
          if (ctx.isPointInPath(path, x, y)) {
            let screenX = (x - 500) * scale + w / 2;
            let screenY = (y - 500) * scale + h / 2;

            let hoverFactor = 0;
            if (mouse.isHovered) {
              const dx = screenX - mouse.x;
              const dy = screenY - mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 150) {
                hoverFactor = (1 - dist / 150);
                
                const angle = Math.atan2(dy, dx);
                const push = hoverFactor * 22 * Math.sin(time * 8 + dist * 0.06);
                screenX += Math.cos(angle) * push;
                screenY += Math.sin(angle) * push;
              }
            }

            const nx = x / 1000;
            const ny = y / 1000;

            const wave1 = Math.sin(nx * 8 + time * 2) * 0.5 + 0.5;
            const wave2 = Math.cos(ny * 8 - time * 1.5) * 0.5 + 0.5;
            const wave3 = Math.sin((nx + ny) * 6 + time * 3) * 0.5 + 0.5;

            let r = Math.floor(114 + 120 * wave1);
            let g = Math.floor(38 + 50 * wave2);
            let b = Math.floor(255 - 40 * wave3);

            if (hoverFactor > 0) {
              r = Math.floor(r * (1 - hoverFactor) + 20 * hoverFactor); 
              g = Math.floor(g * (1 - hoverFactor) + 220 * hoverFactor); 
              b = Math.floor(b * (1 - hoverFactor) + 255 * hoverFactor); 
            }

            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            ctx.fillRect(
              screenX - screenPixelSize / 2,
              screenY - screenPixelSize / 2,
              screenPixelSize - 0.7,
              screenPixelSize - 0.7
            );

            ctx.fillStyle = theme === 'dark' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(screenX - screenPixelSize / 2, screenY - screenPixelSize / 2, screenPixelSize, 0.7);
            ctx.fillRect(screenX - screenPixelSize / 2, screenY - screenPixelSize / 2, 0.7, screenPixelSize);
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [mouse]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const domX = e.clientX - rect.left;
      const domY = e.clientY - rect.top;
      setMouse({
        x: domX * (canvas.width / rect.width),
        y: domY * (canvas.height / rect.height),
        isHovered: true
      });
    }
  };

  const handleMouseLeave = () => {
    setMouse({ x: -1000, y: -1000, isHovered: false });
  };

  return (
    <div 
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '10px',
        position: 'relative'
      }}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '260px',
          height: '260px',
          imageRendering: 'pixelated',
          cursor: 'crosshair', 
          transformStyle: 'preserve-3d',
          transition: 'transform 0.12s ease-out, filter 0.3s',
          filter: theme === 'dark'
            ? 'drop-shadow(0 0 35px rgba(114, 38, 255, 0.45))'
            : 'drop-shadow(0 0 20px rgba(114, 38, 255, 0.15))',
        }}
      />
    </div>
  );
};

interface LandingViewProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  onNavigate: (tab: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  lang,
  setLang,
  theme,
  setTheme,
  onNavigate
}) => {
  const isRtl = lang === 'ar';
  const [emailInput, setEmailInput] = useState('');
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [activeCodeLang, setActiveCodeLang] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copied, setCopied] = useState(false);

  // Localization Dictionary
  const content = {
    en: {
      brand: 'Sumer Send',
      tagline: 'Developer-first communication platform',
      nav: {
        products: 'Products',
        pricing: 'Pricing',
        docs: 'Documentation',
        login: 'Sign In',
        signup: 'Get Started Free'
      },
      hero: {
        title: 'Smart Messaging Infrastructure for Iraq',
        subtitle: 'Sync WhatsApp sessions, route local carrier SMS, and dispatch transactional emails with a single unified API. Designed for high performance and zero delivery latency.',
        inputPlaceholder: 'Enter your business email',
        cta: 'Start Free',
        badge: 'NEW: Official API Integration',
        features: ['No credit card required', 'Free WhatsApp sync', 'Local gateway speeds']
      },
      marquee: 'TRUSTED BY INNOVATIVE DEVELOPERS AND TEAMS IN IRAQ',
      products: {
        title: 'Unified Communication Channels',
        desc: 'Everything you need to message users, verify transactions, and run campaigns programmatically.',
        whatsapp: {
          label: 'WhatsApp Sync',
          title: 'Direct WhatsApp Sync via WebSockets',
          desc: 'Instantly connect personal or business WhatsApp numbers by scanning a secure QR code. Send automated transaction alerts, customer confirmations, and interactive button menus with no Meta approval delay.',
          metric: 'Real-time sync status'
        },
        sms: {
          label: 'SMS Gateway',
          title: 'High-Deliverability Local SMS Routes',
          desc: 'Direct integration with Iraqi mobile operators (Zain, Asiacell, Korek). Send verification OTPs and transactional notifications with verified sender names, automatically routing messages for maximum speed.',
          metric: 'Carrier-grade routing'
        },
        email: {
          label: 'Email SMTP',
          title: 'Premium Transactional Email API',
          desc: 'Reliable email delivery with built-in DNS configuration guides (SPF/DKIM/DMX). Keep your automated password resets and notification emails out of the spam folder with verified sender domains.',
          metric: 'Inbox-optimized delivery'
        }
      },
      code: {
        title: 'Integrate in seconds',
        desc: 'Sumer Send provides clean APIs that drop directly into your software stack. Start dispatching alerts with just a few lines of code.',
        tabs: {
          curl: 'cURL',
          js: 'JavaScript',
          py: 'Python'
        }
      },
      bento: {
        title: 'Engineered for Digital Scale',
        desc: 'A robust backbone for financial portals, retail websites, and developer startups.',
        stat1: 'Delivered Messages',
        stat1Num: '+5,000,000',
        stat2: 'API Uptime SLA',
        stat2Num: '99.98%',
        stat3: 'Response Latency',
        stat3Num: '< 20ms',
        payments: 'Local Wallet Top-ups',
        paymentsDesc: 'Top up your API balance instantly using local wallets like Zain Cash, AsiaHawala, or credit cards. Fully automated billing and invoicing.',
        security: 'Enterprise Security',
        securityDesc: 'Low-level cryptographic Argon2 password hashing, secure JWT tokens, and sandboxed execution ensure your keys remain confidential.'
      },
      ctaBanner: {
        title: 'Ready to upgrade your messaging stack?',
        desc: 'Create your developer account in less than two minutes. Get free trial credits to test all features instantly.',
        btn: 'Get Started for Free'
      },
      footer: {
        copyright: '© 2026 Sumer Send. All rights reserved.',
        product: 'Product',
        features: 'Features',
        developers: 'Developers',
        docs: 'API Reference',
        status: 'System Status',
        legal: 'Legal',
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        security: 'Security Standards'
      }
    },
    ar: {
      brand: 'سومر سيند',
      tagline: 'منصة الإشعارات الأولى للمطورين في العراق',
      nav: {
        products: 'المنتجات',
        pricing: 'الأسعار',
        docs: 'التوثيق البرمجي',
        login: 'تسجيل الدخول',
        signup: 'ابدأ مجاناً'
      },
      hero: {
        title: 'البنية التحتية الذكية للمراسلة والإشعارات في العراق',
        subtitle: 'اربط جلسات واتساب، أرسل رسائل SMS محلية موثوقة، وبث رسائل البريد الإلكتروني عبر API موحد. مصممة للمطورين والشركات للوصول الفوري بدون تأخير.',
        inputPlaceholder: 'أدخل بريدك الإلكتروني للعمل',
        cta: 'ابدأ مجاناً',
        badge: 'جديد: واجهة ربط الواتساب الرسمية',
        features: ['لا يتطلب بطاقة ائتمان', 'ربط مجاني للواتساب', 'بوابة دفع عراقية محلية']
      },
      marquee: 'موثوقة ومستخدمة من قبل المطورين والشركات الناشئة في العراق',
      products: {
        title: 'قنوات تواصل متكاملة وموحدة',
        desc: 'كل ما تحتاجه لإرسال رسائل التنبيه والتحقق الثنائي والرسائل الترويجية برمجياً عبر بوابة واحدة.',
        whatsapp: {
          label: 'ربط واتساب',
          title: 'ربط جلسات واتساب فورياً عبر الويب سوكيت',
          desc: 'اربط حساب الواتساب الخاص بك (الشخصي أو الأعمال) بمجرد مسح رمز الـ QR. أرسل إشعارات المعاملات، الردود التلقائية، والقوائم التفاعلية لعملائك دون انتظار موافقة ميتا المعقدة.',
          metric: 'مزامنة لحظية مباشرة'
        },
        sms: {
          label: 'بوابة الـ SMS',
          title: 'رسائل نصية SMS عراقية عالية الموثوقية',
          desc: 'اتصال مباشر بشبكات الهواتف المحلية (زين، آسيا سيل، كورك) لضمان تسليم رسائل التحقق (OTP) والتنبيهات باسم مرسل خاص بشركتك وبأقصى سرعة ممكنة.',
          metric: 'توجيه ذكي عبر الشبكات'
        },
        email: {
          label: 'إرسال البريد SMTP',
          title: 'خادم SMTP احترافي لرسائل المعاملات',
          desc: 'بوابة إرسال البريد الإلكتروني البرمجية مع لوحة إعداد متكاملة لسجلات DNS (SPF/DKIM/DMARC) لضمان وصول رسائل استعادة كلمة المرور والتنبيهات لصندوق الوارد مباشرة.',
          metric: 'توصيل محسن لصندوق الوارد'
        }
      },
      code: {
        title: 'معدة للمطورين. تكامل خلال دقائق.',
        desc: 'واجهة برمجية (API) بسيطة ومباشرة وموثقة بالكامل. اختر لغتك البرمجية المفضلة وابدأ بالربط فوراً.',
        tabs: {
          curl: 'cURL',
          js: 'JavaScript',
          py: 'Python'
        }
      },
      bento: {
        title: 'بنية تحتية متطورة تواكب نمو أعمالك',
        desc: 'العمود الفقري للمتاجر الرقمية، الأنظمة المالية، وبوابات المطورين الحديثة في العراق.',
        stat1: 'رسالة تم تسليمها',
        stat1Num: '+5,000,000',
        stat2: 'وقت التشغيل SLA',
        stat2Num: '99.98%',
        stat3: 'زمن استجابة الـ API',
        stat3Num: '< 20ms',
        payments: 'شحن رصيد المحفظة محلياً',
        paymentsDesc: 'اشحن رصيد المراسلة الخاص بك فوراً وبأتمتة كاملة باستخدام المحافظ الإلكترونية العراقية (زين كاش، آسيا حوالة) أو بطاقات الدفع الأخرى.',
        security: 'أمان وحماية بمستوى مؤسساتي',
        securityDesc: 'تشفير كلمات المرور عبر Argon2، توليد مفاتيح API مشفرة، وتأمين وحماية الهوية عبر توكنات JWT مشفرة بالكامل.'
      },
      ctaBanner: {
        title: 'جاهز لترقية بنيتك البرمجية للمراسلة؟',
        desc: 'أنشئ حساب مطور مجاني في أقل من دقيقتين، واحصل على رصيد تجريبي مجاني لتجربة كافة القنوات.',
        btn: 'ابدأ التسجيل مجاناً'
      },
      footer: {
        copyright: '© 2026 سومر سيند. جميع الحقوق محفوظة.',
        product: 'المنصة',
        features: 'الميزات والخدمات',
        developers: 'المطورون',
        docs: 'التوثيق البرمجي والـ API',
        status: 'حالة النظام والشبكة',
        legal: 'القوانين',
        privacy: 'سياسة الخصوصية',
        terms: 'شروط الخدمة',
        security: 'معايير الأمان والامتثال'
      }
    }
  }[lang];

  // Code snippets for the API playground
  const codeSnippets = {
    curl: `curl -X POST https://api.sumersend.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "channel": "${activeTab}",
    "to": "+9647700000000",
    "content": "Your verification code is: 48927"
  }'`,
    javascript: `// Initialize Sumer Send SDK
import { SumerClient } from 'sumersend';

const sumer = new SumerClient({ apiKey: 'YOUR_API_KEY' });

await sumer.messages.create({
  channel: '${activeTab}',
  to: '+9647700000000',
  content: 'Your verification code is: 48927'
});`,
    python: `# Initialize Sumer Send Client
from sumersend import SumerClient

sumer = SumerClient(api_key='YOUR_API_KEY')

response = sumer.messages.create(
    channel='${activeTab}',
    to='+9647700000000',
    content='Your verification code is: 48927'
)`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeLang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartFree = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      localStorage.setItem('pre_filled_email', emailInput);
      onNavigate('auth-signup');
    } else {
      onNavigate('auth-signup');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-color)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      fontFamily: isRtl ? 'var(--font-arabic)' : 'var(--font-family)',
      direction: isRtl ? 'rtl' : 'ltr',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* 1. Header Navigation */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(var(--panel-bg-rgb), 0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-color)',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              cursor: 'pointer',
              fontWeight: '800',
              fontSize: '20px',
              letterSpacing: isRtl ? 'normal' : '-0.5px'
            }}
          >
            <img 
              src="/artboard2.svg" 
              alt="Sumer Send Logo" 
              style={{
                width: '32px',
                height: '32px',
                objectFit: 'contain'
              }}
            />
            <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>{content.brand}</span>
          </div>

          {/* Navigation Links */}
          <nav className="nav-menu" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>{content.nav.products}</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>{content.nav.pricing}</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer' }}>{content.nav.docs}</span>
          </nav>
        </div>

        {/* Right Nav Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Languages size={16} />
            <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <SunMoon size={18} />
          </button>

          {/* Actions */}
          <button 
            onClick={() => onNavigate('auth-signin')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            {content.nav.login}
          </button>

          <button 
            onClick={() => onNavigate('auth-signup')}
            style={{
              backgroundColor: 'var(--text-primary)',
              color: 'var(--panel-bg)',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              padding: '10px 20px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>{content.nav.signup}</span>
            {isRtl ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
          </button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section style={{
        padding: '80px 24px 60px',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glow behind hero */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(232, 255, 0, 0.08) 0%, transparent 70%)',
          zIndex: 0,
          pointerEvents: 'none'
        }} />

        {/* Pixel Art Crowd background behind Hero contents */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '30%',
          width: 0,
          height: 0,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {backgroundData.z_0.filter((img: any) => {
            const leftVal = parseFloat(img.style.left) || 0;
            const topVal = parseFloat(img.style.top) || 0;
            return Math.abs(leftVal) > 420 || Math.abs(topVal) > 380;
          }).map((img: any, i: number) => (
            <img
              key={`hero-bg-z0-${i}`}
              src={`${img.src}?v=4`}
              alt=""
              className="hilos-crowd-img"
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                left: img.style.left,
                top: img.style.top,
                width: img.style.width || 'var(--login-crowd-size)',
                transform: img.style.transform,
                transformOrigin: img.style['transform-origin'] || '50% 72%',
                transition: img.style.transition || 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',
                zIndex: parseInt(img.style['z-index'] || '0'),
                animationDelay: `${(i * -0.17).toFixed(2)}s`
              }}
            />
          ))}
          {backgroundData.z_20.filter((img: any) => {
            const leftVal = parseFloat(img.style.left) || 0;
            const topVal = parseFloat(img.style.top) || 0;
            return Math.abs(leftVal) > 420 || Math.abs(topVal) > 380;
          }).map((img: any, i: number) => (
            <img
              key={`hero-bg-z20-${i}`}
              src={`${img.src}?v=4`}
              alt=""
              className="hilos-crowd-img"
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                left: img.style.left,
                top: img.style.top,
                width: img.style.width || 'var(--login-crowd-size)',
                transform: img.style.transform,
                transformOrigin: img.style['transform-origin'] || '50% 72%',
                transition: img.style.transition || 'transform 90ms cubic-bezier(0.2, 0, 0, 1)',
                zIndex: parseInt(img.style['z-index'] || '0'),
                animationDelay: `${((i + 12) * -0.19).toFixed(2)}s`
              }}
            />
          ))}
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>


          {/* Title */}
          <h1 style={{
            fontSize: '56px',
            fontWeight: '800',
            lineHeight: '1.15',
            letterSpacing: isRtl ? 'normal' : '-1.5px',
            maxWidth: '900px',
            margin: '0 auto 24px',
            color: 'var(--text-primary)'
          }}>
            {content.hero.title}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 40px',
            fontWeight: 400
          }}>
            {content.hero.subtitle}
          </p>

          {/* Inline Signup Form (Apollo.io style) */}
          <form 
            onSubmit={handleStartFree}
            style={{
              display: 'flex',
              maxWidth: '520px',
              margin: '0 auto 24px',
              gap: '12px',
              backgroundColor: 'var(--panel-bg)',
              padding: '8px',
              borderRadius: '32px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, padding: '0 12px' }}>
              <Mail size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                type="email"
                placeholder={content.hero.inputPlaceholder}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'none',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  padding: '8px 12px',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--text-primary)',
                color: 'var(--panel-bg)',
                border: 'none',
                borderRadius: '24px',
                fontWeight: 600,
                fontSize: '15px',
                padding: '12px 28px',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              {content.hero.cta}
            </button>
          </form>

          {/* Trust features */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            flexWrap: 'wrap',
            fontSize: '13px',
            color: 'var(--text-muted)',
            fontWeight: 500,
            marginBottom: '32px'
          }}>
            {content.hero.features.map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Check size={14} style={{ color: 'var(--success-color)' }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* LARGE INTERACTIVE PIXEL SHADER LOGO */}
          <PixelShaderLogo theme={theme} />
        </div>
      </section>

      {/* 3. Logo Marquee */}
      <section style={{
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '32px 24px',
        backgroundColor: 'rgba(var(--panel-bg-rgb), 0.3)',
        overflow: 'hidden'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            letterSpacing: '1px',
            textAlign: 'center',
            marginBottom: '20px',
            textTransform: 'uppercase'
          }}>
            {content.marquee}
          </p>

          {/* Simple Row of Integration/Tech Badges */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '48px',
            flexWrap: 'wrap',
            opacity: 0.65
          }}>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)' }}>زين كاش</div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)' }}>آسيا حوالة</div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)' }}>FastPay</div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Database size={16} /> Supabase
            </div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} /> Node.js
            </div>
            <div style={{ fontWeight: '700', fontSize: '16px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={16} /> Vercel
            </div>
          </div>
        </div>
      </section>

      {/* 4. Product Tabbed Showcase Section */}
      <section style={{
        padding: '100px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
            {content.products.title}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {content.products.desc}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '320px 1fr',
          gap: '48px',
          alignItems: 'start'
        }}>
          {/* Left Tabs selectors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setActiveTab('whatsapp')}
              style={{
                textAlign: isRtl ? 'right' : 'left',
                padding: '20px',
                borderRadius: '12px',
                background: activeTab === 'whatsapp' ? 'var(--panel-bg)' : 'none',
                border: activeTab === 'whatsapp' ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'whatsapp' ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'whatsapp' ? '#25d366' : 'var(--panel-muted)',
                  color: activeTab === 'whatsapp' ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  <MessageSquare size={16} />
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  {content.products.whatsapp.label}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('sms')}
              style={{
                textAlign: isRtl ? 'right' : 'left',
                padding: '20px',
                borderRadius: '12px',
                background: activeTab === 'sms' ? 'var(--panel-bg)' : 'none',
                border: activeTab === 'sms' ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'sms' ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'sms' ? '#10b981' : 'var(--panel-muted)',
                  color: activeTab === 'sms' ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  <Phone size={16} />
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  {content.products.sms.label}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              style={{
                textAlign: isRtl ? 'right' : 'left',
                padding: '20px',
                borderRadius: '12px',
                background: activeTab === 'email' ? 'var(--panel-bg)' : 'none',
                border: activeTab === 'email' ? '1px solid var(--border-color)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: activeTab === 'email' ? '0 4px 20px rgba(0,0,0,0.03)' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: activeTab === 'email' ? '#2563eb' : 'var(--panel-muted)',
                  color: activeTab === 'email' ? 'white' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold'
                }}>
                  <Mail size={16} />
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)' }}>
                  {content.products.email.label}
                </span>
              </div>
            </button>
          </div>

          {/* Right Preview Card */}
          <div style={{
            backgroundColor: 'var(--panel-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.02)',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '40px',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            {/* Description Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {content.products[activeTab].title}
              </h3>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                {content.products[activeTab].desc}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success-color)'
                }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {content.products[activeTab].metric}
                </span>
              </div>
            </div>

            {/* Visual Simulator */}
            <div style={{
              backgroundColor: 'var(--input-bg)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              height: '320px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
              padding: '20px'
            }}>
              {activeTab === 'whatsapp' && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#008069' }}>Scan QR Code</div>
                  {/* Mock QR Code */}
                  <div style={{
                    width: '120px',
                    height: '120px',
                    backgroundColor: '#111',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: '4px'
                  }}>
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} style={{
                        backgroundColor: (i % 2 === 0 || i % 3 === 0) ? 'white' : 'transparent',
                        borderRadius: '2px'
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Scan with WhatsApp to sync your session WebSockets
                  </div>
                </div>
              )}

              {activeTab === 'sms' && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>Operator Gateway</span>
                    <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>ONLINE</span>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
                  {/* Mock SMS Routes */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>Zain Iraq</span>
                      <span style={{ color: 'var(--text-secondary)' }}>0.015s Latency</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>Asiacell</span>
                      <span style={{ color: 'var(--text-secondary)' }}>0.018s Latency</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', backgroundColor: 'var(--input-bg)', borderRadius: '6px', fontSize: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>Korek Telecom</span>
                      <span style={{ color: 'var(--text-secondary)' }}>0.020s Latency</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'email' && (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Domain DNS Records</div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>SPF (txt)</span>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ VERIFIED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>DKIM (txt)</span>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ VERIFIED</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>DMARC (txt)</span>
                      <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ VERIFIED</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Code terminal Sandbox Section */}
      <section style={{
        padding: '60px 24px 100px',
        backgroundColor: '#0a0d0b',
        color: '#f0f7f3'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center'
        }}>
          {/* Left Title details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            <h2 style={{ fontSize: '36px', fontWeight: '800', lineHeight: 1.2 }}>
              {content.code.title}
            </h2>
            <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#a2b5ab' }}>
              {content.code.desc}
            </p>
          </div>

          {/* Right Terminal interface */}
          <div style={{
            backgroundColor: '#121614',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden'
          }}>
            {/* Terminal Tab switcher */}
            <div style={{
              backgroundColor: '#181e1b',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255,255,255,0.06)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setActiveCodeLang('curl')}
                  style={{
                    backgroundColor: activeCodeLang === 'curl' ? '#121614' : 'transparent',
                    border: 'none',
                    color: activeCodeLang === 'curl' ? '#e8ff00' : '#718278',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {content.code.tabs.curl}
                </button>
                <button
                  onClick={() => setActiveCodeLang('javascript')}
                  style={{
                    backgroundColor: activeCodeLang === 'javascript' ? '#121614' : 'transparent',
                    border: 'none',
                    color: activeCodeLang === 'javascript' ? '#e8ff00' : '#718278',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {content.code.tabs.js}
                </button>
                <button
                  onClick={() => setActiveCodeLang('python')}
                  style={{
                    backgroundColor: activeCodeLang === 'python' ? '#121614' : 'transparent',
                    border: 'none',
                    color: activeCodeLang === 'python' ? '#e8ff00' : '#718278',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  {content.code.tabs.py}
                </button>
              </div>

              {/* Copy button */}
              <button
                onClick={handleCopyCode}
                style={{
                  background: 'none',
                  border: 'none',
                  color: copied ? '#34d399' : '#718278',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px'
                }}
              >
                <Copy size={14} />
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Terminal Body */}
            <div style={{ padding: '24px', position: 'relative' }}>
              <pre style={{
                margin: 0,
                fontSize: '13px',
                fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
                lineHeight: '1.6',
                color: '#e8efeb',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                direction: 'ltr',
                textAlign: 'left'
              }}>
                <code>{codeSnippets[activeCodeLang]}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Stats & Bento Grid Section */}
      <section style={{
        padding: '100px 24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', marginBottom: '16px' }}>
            {content.bento.title}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            {content.bento.desc}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px'
        }}>
          {/* Card 1: Delivered messages */}
          <BentoCard glowColor="37, 211, 102">
            <div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {content.bento.stat1Num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {content.bento.stat1}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--success-color)', fontSize: '13px', fontWeight: 600 }}>
              <Activity size={16} />
              <span>Real-time delivery stats</span>
            </div>
          </BentoCard>

          {/* Card 2: Uptime SLA */}
          <BentoCard glowColor="37, 99, 235">
            <div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {content.bento.stat2Num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {content.bento.stat2}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--success-color)', fontSize: '13px', fontWeight: 600 }}>
              <Shield size={16} />
              <span>SLA backed guarantees</span>
            </div>
          </BentoCard>

          {/* Card 3: Latency */}
          <BentoCard glowColor="16, 185, 129">
            <div>
              <div style={{ fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {content.bento.stat3Num}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {content.bento.stat3}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--success-color)', fontSize: '13px', fontWeight: 600 }}>
              <Zap size={16} />
              <span>Edge cached responses</span>
            </div>
          </BentoCard>

          {/* Card 4: Local wallet payments */}
          <BentoCard className="span-2" style={{ gridColumn: 'span 2' }} glowColor="245, 158, 11">
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {content.bento.payments}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {content.bento.paymentsDesc}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', fontWeight: 'bold', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span style={{ padding: '6px 12px', backgroundColor: 'var(--panel-muted)', borderRadius: '6px' }}>Zain Cash</span>
              <span style={{ padding: '6px 12px', backgroundColor: 'var(--panel-muted)', borderRadius: '6px' }}>AsiaHawala</span>
              <span style={{ padding: '6px 12px', backgroundColor: 'var(--panel-muted)', borderRadius: '6px' }}>Visa / MasterCard</span>
            </div>
          </BentoCard>

          {/* Card 5: Security */}
          <BentoCard glowColor="239, 68, 68">
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                {content.bento.security}
              </h3>
              <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
                {content.bento.securityDesc}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '24px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
              <Lock size={16} />
              <span>JWT & Argon2 active</span>
            </div>
          </BentoCard>
        </div>
      </section>

      {/* 7. Call To Action Banner */}
      <section style={{
        padding: '80px 24px',
        backgroundColor: 'var(--text-primary)',
        color: 'var(--panel-bg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Neon accent glow */}
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(232, 255, 0, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '20px', letterSpacing: isRtl ? 'normal' : '-1px' }}>
            {content.ctaBanner.title}
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', opacity: 0.8, marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
            {content.ctaBanner.desc}
          </p>
          <button
            onClick={() => onNavigate('auth-signup')}
            style={{
              backgroundColor: 'var(--panel-bg)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '24px',
              fontWeight: 700,
              fontSize: '16px',
              padding: '14px 32px',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            {content.ctaBanner.btn}
          </button>
        </div>
      </section>

      {/* 8. Footer (Bird.com Style) */}
      <footer style={{
        padding: '80px 24px 40px',
        backgroundColor: 'transparent'
      }}>
        <div className="bird-footer-container">
          <div className="bird-footer-grid">
            {/* Column 1: Products */}
            <div className="bird-footer-col">
              <p className="bird-footer-col-title">{isRtl ? 'المنصة' : 'Platform'}</p>
              <div className="bird-footer-col-links">
                <span className="bird-footer-link" onClick={() => setActiveTab('whatsapp')}>{isRtl ? 'ربط واتساب' : 'WhatsApp Sync'}</span>
                <span className="bird-footer-link" onClick={() => setActiveTab('sms')}>{isRtl ? 'بوابة SMS' : 'SMS Gateway'}</span>
                <span className="bird-footer-link" onClick={() => setActiveTab('email')}>{isRtl ? 'إرسال بريد SMTP' : 'Email SMTP'}</span>
                <span className="bird-footer-link" onClick={() => onNavigate('auth-signup')}>{isRtl ? 'حساب تجريبي' : 'Developer Sandbox'}</span>
              </div>
            </div>

            {/* Column 2: Resources */}
            <div className="bird-footer-col">
              <p className="bird-footer-col-title">{isRtl ? 'المصادر' : 'Resources'}</p>
              <div className="bird-footer-col-links">
                <span className="bird-footer-link">{isRtl ? 'التوثيق البرمجي' : 'API Documentation'}</span>
                <span className="bird-footer-link">{isRtl ? 'دليل البدء السريع' : 'Quickstart Guide'}</span>
                <span className="bird-footer-link">{isRtl ? 'مفاتيح الـ API' : 'API Keys Guide'}</span>
                <span className="bird-footer-link">{isRtl ? 'سجل التغييرات' : 'Changelog'}</span>
              </div>
            </div>

            {/* Column 3: Company */}
            <div className="bird-footer-col">
              <p className="bird-footer-col-title">{isRtl ? 'الشركة' : 'Company'}</p>
              <div className="bird-footer-col-links">
                <span className="bird-footer-link">{isRtl ? 'من نحن' : 'About Us'}</span>
                <span className="bird-footer-link">{isRtl ? 'الأسعار' : 'Pricing Plans'}</span>
                <span className="bird-footer-link">{isRtl ? 'شروط الخدمة' : 'Terms of Use'}</span>
                <span className="bird-footer-link">{isRtl ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
              </div>
            </div>

            {/* Column 4: Local Support & Integrations */}
            <div className="bird-footer-col">
              <p className="bird-footer-col-title">{isRtl ? 'الدعم والشركاء' : 'Local Partners'}</p>
              <div className="bird-footer-col-links">
                <span className="bird-footer-link" style={{ fontWeight: 'bold' }}>زين كاش</span>
                <span className="bird-footer-link" style={{ fontWeight: 'bold' }}>آسيا حوالة</span>
                <span className="bird-footer-link" style={{ fontWeight: 'bold' }}>FastPay</span>
                <a href="mailto:support@sumersend.com" className="bird-footer-link" style={{ fontSize: '13px' }}>support@sumersend.com</a>
              </div>
            </div>
          </div>

          {/* Bottom Bar: Copyright & System Status */}
          <div className="bird-footer-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {isRtl ? '© 2026 سومر سيند. جميع الحقوق محفوظة.' : '© 2026 Sumer Send. All rights reserved.'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }} />
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--success-text)' }}>
                  {isRtl ? 'جميع الأنظمة تعمل بكفاءة' : 'All systems operational'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <span className="bird-footer-link">LinkedIn</span>
              <span className="bird-footer-link">GitHub</span>
              <span className="bird-footer-link">Twitter</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE PIXEL SHADER LOGO */}
        <PixelShaderLogo theme={theme} />
      </footer>
    </div>
  );
};
