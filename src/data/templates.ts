export interface TemplateVariable {
  key: string;
  labelAr: string;
  labelEn: string;
  defaultValAr: string;
  defaultValEn: string;
}

export interface TemplateItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  subjectAr?: string;
  subjectEn?: string;
  icon: string;
  variables: TemplateVariable[];
  body: string;
  type?: 'email' | 'sms' | 'whatsapp';
}

export const templatesDb: { email: TemplateItem[]; sms: TemplateItem[]; whatsapp: TemplateItem[] } = {
  email: [
    {
      id: 'welcome_onboarding',
      nameAr: 'ترحيب بالمنصة وتفعيل الحساب',
      nameEn: 'Welcome & Onboarding',
      descAr: 'قالب ترحيبي احترافي للمشتركين أو المستخدمين الجدد يعرض خطوات البدء وزر الانطلاق.',
      descEn: 'A professional welcome email for new users, showing startup steps and a call to action.',
      subjectAr: 'أهلاً بك في {{platform_name}}! دعنا نساعدك في البدء 🚀',
      subjectEn: 'Welcome to {{platform_name}}! Let\'s get started 🚀',
      icon: 'Sparkles',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'user_name', labelAr: 'اسم المستخدم', labelEn: 'User Name', defaultValAr: 'عضو رائع', defaultValEn: 'Valued Member' },
        { key: 'platform_desc', labelAr: 'وصف قصير للمنصة', labelEn: 'Platform Description', defaultValAr: 'شريكك الذكي في التطور والنمو الرقمي', defaultValEn: 'Your smart partner in digital growth' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header -->
  <div style="background-color: #09090b; padding: 35px 20px; text-align: center; color: #ffffff;">
    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; display: block; margin-bottom: 8px;">مرحباً بك في</span>
    <h1 style="margin: 0; font-size: 22px; font-weight: 700; font-family: 'Cairo', sans-serif;">{{platform_name}}</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #a1a1aa;">{{platform_desc}}</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <h2 style="font-size: 18px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px;">مرحباً {{user_name}}،</h2>
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
      يسعدنا جداً انضمامك إلى <strong>{{platform_name}}</strong>. نحن متحمسون لمرافقتك في هذه الرحلة وتقديم أفضل الأدوات والخدمات التي تدعم نجاحك وأهدافك الرقمية.
    </p>

    <h3 style="font-size: 15px; font-weight: 700; color: #09090b; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #f4f4f5; padding-bottom: 8px;">ثلاث خطوات سريعة للبدء:</h3>
    
    <div style="margin-bottom: 15px; padding: 15px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; display: flex; align-items: flex-start; gap: 12px;">
      <div style="background-color: #09090b; color: #ffffff; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; flex-shrink: 0;">١</div>
      <div>
        <strong style="color: #09090b; font-size: 14px; display: block; margin-bottom: 4px;">إكمال إعدادات حسابك</strong>
        <span style="color: #71717a; font-size: 12px; line-height: 1.5; display: block;">أضف معلوماتك الشخصية الأساسية وخصص ملفك التعريفي.</span>
      </div>
    </div>
    
    <div style="margin-bottom: 15px; padding: 15px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; display: flex; align-items: flex-start; gap: 12px;">
      <div style="background-color: #09090b; color: #ffffff; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; flex-shrink: 0;">٢</div>
      <div>
        <strong style="color: #09090b; font-size: 14px; display: block; margin-bottom: 4px;">استكشاف لوحة التحكم</strong>
        <span style="color: #71717a; font-size: 12px; line-height: 1.5; display: block;">تعرف على الميزات والأدوات المتاحة وطرق دمجها في سير عملك.</span>
      </div>
    </div>
    
    <div style="margin-bottom: 25px; padding: 15px; background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; display: flex; align-items: flex-start; gap: 12px;">
      <div style="background-color: #09090b; color: #ffffff; width: 24px; height: 24px; line-height: 24px; text-align: center; border-radius: 50%; font-size: 12px; font-weight: bold; flex-shrink: 0;">٣</div>
      <div>
        <strong style="color: #09090b; font-size: 14px; display: block; margin-bottom: 4px;">تفعيل الإشعارات والتكاملات</strong>
        <span style="color: #71717a; font-size: 12px; line-height: 1.5; display: block;">اربط نظامك معنا لتلقي وإرسال التنبيهات بصورة تلقائية وفورية.</span>
      </div>
    </div>

    <div style="text-align: center; margin: 35px 0 10px 0;">
      <a href="https://example.com" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">تفعيل الحساب والبدء الآن</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الرسالة لأنك قمت بإنشاء حساب في {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">إلغاء الاشتراك</a>
  </div>
</div>`
    },
    {
      id: 'otp_verification',
      nameAr: 'رمز التحقق ثنائي العامل OTP',
      nameEn: 'Secure Verification OTP',
      descAr: 'تصميم أمني وعصري لإرسال رمز تحقق مؤقت للتحقق من الهوية أو تسجيل الدخول.',
      descEn: 'A sleek, simple 6-digit OTP code layout with security warning and expiration indicators.',
      subjectAr: 'رمز التحقق ثنائي العامل الخاص بك',
      subjectEn: 'Your secure verification OTP code',
      icon: 'Lock',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'otp_code', labelAr: 'رمز التحقق', labelEn: 'OTP Code', defaultValAr: '827104', defaultValEn: '827104' },
        { key: 'expiry_mins', labelAr: 'دقائق انتهاء الصلاحية', labelEn: 'Expiration (Minutes)', defaultValAr: '5', defaultValEn: '5' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 450px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #09090b; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 16px; font-weight: 600;">{{platform_name}} Security</h2>
  </div>
  
  <div style="padding: 30px;">
    <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">طلب تسجيل دخول أو تفعيل</h3>
    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">لقد طلبت الحصول على رمز التحقق لتسجيل الدخول إلى حسابك في <strong>{{platform_name}}</strong>. يرجى استخدام الرمز التالي:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <div class="otp-code-box" title="Click to copy / اضغط للنسخ" style="display: inline-block; background-color: #f4f4f5; letter-spacing: 6px; font-family: monospace; font-size: 28px; font-weight: 700; color: #09090b; padding: 12px 30px; border-radius: 6px; border: 1px solid #eaeaea; direction: ltr; cursor: pointer; transition: all 0.2s; user-select: all;">{{otp_code}}</div>
      <span style="display: block; font-size: 11px; color: #ef4444; margin-top: 8px;">ينتهي صلاحية هذا الرمز خلال {{expiry_mins}} دقائق فقط</span>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
    
    <p style="color: #888888; font-size: 11px; line-height: 1.5; margin: 0;">إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني. لا تشارك هذا الرمز مع أي شخص لحماية حسابك من الاختراق والوصول غير المصرح به.</p>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    دعم الحماية والأمان • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'payment_invoice',
      nameAr: 'إيصال دفع وفاتورة إلكترونية',
      nameEn: 'Top-up Invoice & Receipt',
      descAr: 'قالب منظم وواضح لعرض تفاصيل الدفع والعمليات المالية مع تفصيل الرصيد الكلي.',
      descEn: 'A clean transactional receipt template sent to customers after completing a payment or wallet top-up.',
      subjectAr: 'إيصال دفع: تم شحن حسابك بنجاح',
      subjectEn: 'Payment Receipt: Account Funded Successfully',
      icon: 'Receipt',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'tx_id', labelAr: 'رقم العملية', labelEn: 'Transaction ID', defaultValAr: 'TX928172', defaultValEn: 'TX928172' },
        { key: 'payment_method', labelAr: 'وسيلة الدفع', labelEn: 'Payment Method', defaultValAr: 'بطاقة ائتمانية / زين كاش', defaultValEn: 'Credit Card / Zain Cash' },
        { key: 'date', labelAr: 'تاريخ العملية', labelEn: 'Transaction Date', defaultValAr: '2026-06-15 13:09', defaultValEn: '2026-06-15 13:09' },
        { key: 'amount', labelAr: 'المبلغ المشحون', labelEn: 'Amount Funded', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' },
        { key: 'balance', labelAr: 'الرصيد الكلي الحالي', labelEn: 'Current Balance', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="padding: 25px; border-bottom: 1px dashed #eaeaea; text-align: center;">
    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: #e6f7f0; color: #10b981; border-radius: 50%; font-size: 24px; margin-bottom: 12px; text-align: center;">✓</div>
    <h2 style="margin: 0; font-size: 18px; color: #09090b; font-weight: 700;">تم استلام الدفعة بنجاح</h2>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #71717a;">شكراً لك على الدفع وشحن رصيدك في {{platform_name}}</p>
  </div>
  
  <div style="padding: 25px;">
    <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
      <tr>
        <td style="padding: 8px 0; color: #71717a;">رقم العملية</td>
        <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{tx_id}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #71717a;">وسيلة الدفع</td>
        <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{payment_method}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #71717a;">تاريخ العملية</td>
        <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{date}}</td>
      </tr>
      <tr style="border-top: 1px solid #eaeaea; border-bottom: 1px solid #eaeaea;">
        <td style="padding: 12px 0; font-size: 14px; font-weight: 700; color: #09090b;">المبلغ المشحون</td>
        <td style="padding: 12px 0; font-size: 16px; font-weight: 700; text-align: left; color: #10b981;">{{amount}}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #71717a;">الرصيد الكلي الحالي</td>
        <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{balance}}</td>
      </tr>
    </table>
    
    <div style="margin-top: 25px; padding: 12px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; font-size: 12px; color: #666666; line-height: 1.5;">
      <strong>ملاحظة:</strong> يتم تفعيل الرصيد مباشرة في حسابك فور اكتمال الدورة المالية للعملية. إذا واجهت أي مشاكل في التحديث المباشر للرصيد يرجى الاتصال بمركز المساعدة.
    </div>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    بوابة الدفع والفوترة • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'newsletter_digest',
      nameAr: 'النشرة البريدية ومخلص الأخبار',
      nameEn: 'Newsletter & Digest',
      descAr: 'قالب مناسب لإرسال المقالات الأسبوعية والتحديثات لجمهورك بشكل منظم وقابل للتصفح السريع.',
      descEn: 'An elegant digest template layout for sharing articles, links, or weekly roundups with your audience.',
      subjectAr: 'النشرة الإخبارية: أبرز المقالات والتحديثات المفيدة لعامة المهتمين 📰',
      subjectEn: 'Weekly Digest: Top Articles and Updates 📰',
      icon: 'BookOpen',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'newsletter_title', labelAr: 'عنوان النشرة', labelEn: 'Newsletter Title', defaultValAr: 'مستجدات التطور الرقمي والذكاء', defaultValEn: 'Digital Growth Insights' },
        { key: 'article_1_title', labelAr: 'عنوان المقال الأول', labelEn: 'Article 1 Title', defaultValAr: 'مستقبل الذكاء الاصطناعي في بيئة العمل السحابية', defaultValEn: 'The Future of AI in Cloud Workspace' },
        { key: 'article_1_summary', labelAr: 'ملخص المقال الأول', labelEn: 'Article 1 Summary', defaultValAr: 'نناقش في هذا المقال كيف يمكن للشركات الاستفادة من النماذج اللغوية الكبيرة لتحسين سرعة وجودة كتابة الأكواد والتقارير المالية اليومية.', defaultValEn: 'We discuss how companies can leverage LLMs to optimize codebase generation and daily financial reporting workflows.' },
        { key: 'article_2_title', labelAr: 'عنوان المقال الثاني', labelEn: 'Article 2 Title', defaultValAr: 'بروتوكولات الأمان السحابي وعقبات الهجمات السيبرانية', defaultValEn: 'Cloud Security Protocols and Cybersecurity Mitigation' },
        { key: 'article_2_summary', labelAr: 'ملخص المقال الثاني', labelEn: 'Article 2 Summary', defaultValAr: 'استعراض سريع لأفضل 5 ممارسات لحماية واجهات الـ API الخاصة بك من الثغرات الأمنية الشائعة مثل حقن الأكواد والمصادقة المكسورة.', defaultValEn: 'A quick review of the top 5 practices to protect your API endpoints from common security vulnerabilities.' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #09090b 0%, #27272a 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px;">تحديثات أسبوعية • WEEKLY DIGEST</div>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; font-family: 'Cairo', sans-serif;">{{newsletter_title}}</h1>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #a1a1aa;">بواسطة فريق {{platform_name}}</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <h2 style="font-size: 16px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f4f4f5; padding-bottom: 10px;">إليك أبرز مقالات الأسبوع المختارة بعناية:</h2>
    
    <!-- Article 1 -->
    <div style="margin-bottom: 30px;">
      <h3 style="font-size: 15px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 8px;">🔥 {{article_1_title}}</h3>
      <p style="color: #52525b; font-size: 13px; line-height: 1.7; margin: 0 0 12px 0;">
        {{article_1_summary}}
      </p>
      <a href="https://example.com" style="color: #2563eb; font-size: 13px; text-decoration: none; font-weight: 600; display: inline-block;">أكمل القراءة ←</a>
    </div>

    <!-- Divider -->
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 25px 0;">

    <!-- Article 2 -->
    <div style="margin-bottom: 10px;">
      <h3 style="font-size: 15px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 8px;">🛡️ {{article_2_title}}</h3>
      <p style="color: #52525b; font-size: 13px; line-height: 1.7; margin: 0 0 12px 0;">
        {{article_2_summary}}
      </p>
      <a href="https://example.com" style="color: #2563eb; font-size: 13px; text-decoration: none; font-weight: 600; display: inline-block;">أكمل القراءة ←</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه النشرة كأحد المشتركين المهتمين بمحتوى {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">إلغاء الاشتراك من القائمة البريدية</a>
  </div>
</div>`
    },
    {
      id: 'security_alert',
      nameAr: 'تنبيه أمني وتسجيل دخول جديد',
      nameEn: 'Security Alert (New Login)',
      descAr: 'إشعار فوري يتم إرساله عند رصد عملية تسجيل دخول جديدة من جهاز أو موقع غير معروف لحماية الحساب.',
      descEn: 'An immediate security alert sent when a new login event occurs from an unrecognized device or browser.',
      subjectAr: 'تنبيه أمني: تسجيل دخول جديد إلى حسابك ⚠️',
      subjectEn: 'Security Alert: New Login to Your Account ⚠️',
      icon: 'ShieldAlert',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'device', labelAr: 'الجهاز / المتصفح', labelEn: 'Device / Browser', defaultValAr: 'Chrome on macOS (10.15)', defaultValEn: 'Chrome on macOS (10.15)' },
        { key: 'ip_address', labelAr: 'عنوان IP', labelEn: 'IP Address', defaultValAr: '192.168.1.1', defaultValEn: '192.168.1.1' },
        { key: 'time', labelAr: 'وقت الدخول', labelEn: 'Login Time', defaultValAr: '2026-06-25 15:45 (GMT+3)', defaultValEn: '2026-06-25 15:45 (GMT+3)' },
        { key: 'location', labelAr: 'الموقع التقريبي', labelEn: 'Approximate Location', defaultValAr: 'بغداد، العراق', defaultValEn: 'Baghdad, Iraq' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #ef4444; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px; font-weight: 700;">تنبيه تسجيل دخول جديد</h2>
  </div>
  
  <div style="padding: 30px;">
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
      تم رصد عملية تسجيل دخول جديدة لحسابك في <strong>{{platform_name}}</strong>. يرجى مراجعة التفاصيل أدناه للتأكد من موثوقية هذه العملية:
    </p>
    
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
        <tr>
          <td style="padding: 8px 0; color: #71717a;">الجهاز / المتصفح:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{device}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">عنوان IP:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{ip_address}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">الوقت والتاريخ:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{time}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">الموقع التقريبي:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{location}}</td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px; padding: 15px; margin-bottom: 25px; font-size: 12px; color: #ef4444; line-height: 1.6;">
      <strong>هام جداً:</strong> إذا لم تقم بعملية تسجيل الدخول هذه، فإن حسابك قد يكون معرضاً للاختراق. يرجى النقر على الزر أدناه فوراً لتغيير كلمة مرورك وحماية حسابك.
    </div>

    <div style="text-align: center;">
      <a href="https://example.com/reset" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(239, 68, 68, 0.15);">تغيير كلمة المرور فوراً</a>
    </div>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    دعم الحماية والأمان • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'password_reset',
      nameAr: 'إعادة تعيين كلمة المرور',
      nameEn: 'Password Reset',
      descAr: 'قالب بسيط ومباشر يحتوي على زر آمن وتوجيهات واضحة لإعادة تعيين كلمة المرور.',
      descEn: 'A clean, transactional password reset email with a clear CTA and warning instructions.',
      subjectAr: 'طلب إعادة تعيين كلمة المرور الخاصة بك',
      subjectEn: 'Reset Your Password Instructions',
      icon: 'Key',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'user_name', labelAr: 'اسم المستخدم', labelEn: 'User Name', defaultValAr: 'مستخدمنا العزيز', defaultValEn: 'Valued User' },
        { key: 'reset_link', labelAr: 'رابط إعادة التعيين', labelEn: 'Reset Link', defaultValAr: 'https://example.com/reset-confirm?token=xyz', defaultValEn: 'https://example.com/reset-confirm?token=xyz' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 480px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #09090b; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 16px; font-weight: 600;">{{platform_name}} Authentication</h2>
  </div>
  
  <div style="padding: 30px;">
    <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">هل نسيت كلمة المرور؟</h3>
    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 25px;">
      مرحباً {{user_name}}، لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>{{platform_name}}</strong>. يرجى النقر على الزر أدناه للمتابعة:
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{reset_link}}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">إعادة تعيين كلمة المرور</a>
    </div>

    <p style="color: #71717a; font-size: 12px; line-height: 1.5; margin-bottom: 20px;">
      هذا الرابط صالح للاستخدام لمدة 60 دقيقة فقط من وقت الإرسال.
    </p>
    
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
    
    <p style="color: #888888; font-size: 11px; line-height: 1.5; margin: 0;">
      إذا لم تكن قد طلبت إعادة تعيين كلمة المرور الخاصة بك، يرجى تجاهل هذا البريد الإلكتروني وسيبقى حسابك آمناً. لا تقم بمشاركة هذا الرابط مع أي شخص على الإطلاق.
    </p>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    بوابة الأمان والتحقق • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'service_maintenance',
      nameAr: 'تنبيه أعمال الصيانة وتحديث الخدمة',
      nameEn: 'Service Maintenance Notice',
      descAr: 'رسالة لإبلاغ المستخدمين بأعمال الصيانة المجدولة وفترات توقف الخدمة المتوقعة.',
      descEn: 'A service announcement template for informing users of scheduled maintenance operations.',
      subjectAr: 'إشعار: أعمال صيانة مجدولة وتحديث للنظام 🛠️',
      subjectEn: 'Notice: Scheduled Service Maintenance 🛠️',
      icon: 'Activity',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'start_time', labelAr: 'تاريخ ووقت البدء', labelEn: 'Start Time', defaultValAr: 'الجمعة 26 يونيو، الساعة 2:00 صباحاً (GMT+3)', defaultValEn: 'Friday June 26, 2:00 AM (GMT+3)' },
        { key: 'duration', labelAr: 'المدة المتوقعة', labelEn: 'Expected Duration', defaultValAr: 'ساعتين (2)', defaultValEn: '2 Hours' },
        { key: 'impact', labelAr: 'التأثير المتوقع', labelEn: 'Expected Impact', defaultValAr: 'توقف مؤقت للموقع وواجهة الـ API أثناء أعمال الصيانة.', defaultValEn: 'Temporary unavailability of the web dashboard and APIs during the window.' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #f59e0b; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 18px; font-weight: 700;">صيانة دورية مجدولة للخدمة</h2>
  </div>
  
  <div style="padding: 30px;">
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.6; margin-top: 0; margin-bottom: 20px;">
      عزيزنا المشترك، يرجى العلم بأنه تم جدولة أعمال صيانة وتحديث لأنظمتنا الأساسية في <strong>{{platform_name}}</strong>، وذلك لضمان سرعة واستقرار الخدمات وتحسين مستويات الحماية والأمان.
    </p>
    
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
        <tr>
          <td style="padding: 8px 0; color: #71717a;">وقت البدء:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{start_time}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">المدة المتوقعة:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{duration}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; vertical-align: top; color: #71717a;">التأثير المتوقع:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #ef4444;">{{impact}}</td>
        </tr>
      </table>
    </div>

    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
      سنبذل قصارى جهدنا لتقليص فترات التوقف وإكمال أعمال التحديث في أسرع وقت ممكن. إذا كان لديك أي استفسار أو مخاوف بشأن هذا التحديث يرجى التواصل معنا قبل موعد الصيانة.
    </p>

    <div style="text-align: center;">
      <a href="https://status.example.com" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">متابعة حالة خوادمنا</a>
    </div>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    فريق العمليات والصيانة • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'marketing_offer',
      nameAr: 'حملة ترويجية وعروض خاصة',
      nameEn: 'Promotional Campaign Offer',
      descAr: 'تصميم تسويقي جذاب لإبراز الخصومات والمميزات الخاصة مع كود كوبون وزر الشراء.',
      descEn: 'An eye-catching marketing template to showcase discounts, coupons, and seasonal sales.',
      subjectAr: 'لفترة محدودة: خصم حصري {{discount_percent}}% على جميع خطط الاشتراك 🎉',
      subjectEn: 'Limited Time: {{discount_percent}}% Off All Annual Plans 🎉',
      icon: 'Percent',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'discount_percent', labelAr: 'نسبة الخصم', labelEn: 'Discount Percent', defaultValAr: '30', defaultValEn: '30' },
        { key: 'coupon_code', labelAr: 'كود الكوبون', labelEn: 'Coupon Code', defaultValAr: 'SUMER30', defaultValEn: 'SUMER30' },
        { key: 'offer_expiry', labelAr: 'نهاية العرض', labelEn: 'Offer Expiration', defaultValAr: '30 يونيو 2026', defaultValEn: 'June 30, 2026' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: #ffffff;">
    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #c084fc; display: block; margin-bottom: 8px;">عرض حصري ولفترة محدودة</span>
    <h1 style="margin: 0; font-size: 24px; font-weight: 800; font-family: 'Cairo', sans-serif;">وفر {{discount_percent}}% من قيمة اشتراكك</h1>
    <p style="margin: 6px 0 0 0; font-size: 13px; color: #ddd6fe;">ارتقِ بأعمالك وحقق نتائج مذهلة معنا في {{platform_name}}</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-top: 0; margin-bottom: 20px;">
      يسعدنا أن نقدم لك فرصة استثنائية لترقية حسابك والحصول على ميزاتنا المتقدمة بخصم حصري غير مسبوق يصل إلى <strong>{{discount_percent}}%</strong> على جميع خططنا.
    </p>

    <!-- Coupon Box -->
    <div style="text-align: center; background-color: #fafafa; border: 2px dashed #7c3aed; border-radius: 8px; padding: 20px; margin: 25px 0;">
      <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 6px;">استخدم كود الكوبون عند الدفع:</span>
      <div style="display: inline-block; font-size: 24px; font-weight: bold; color: #7c3aed; letter-spacing: 2px;">{{coupon_code}}</div>
      <span style="display: block; font-size: 11px; color: #ef4444; margin-top: 8px; font-weight: 600;">ينتهي هذا العرض بتاريخ: {{offer_expiry}}</span>
    </div>

    <h3 style="font-size: 15px; font-weight: 700; color: #09090b; margin-top: 30px; margin-bottom: 12px;">لماذا تختار باقتنا الاحترافية؟</h3>
    
    <div style="margin-bottom: 12px; font-size: 13px; color: #52525b; line-height: 1.6;">
      <strong>⚡ أداء بدون حدود:</strong> سرعات توصيل خارقة ومعدل جاهزية 99.9%.
    </div>
    <div style="margin-bottom: 12px; font-size: 13px; color: #52525b; line-height: 1.6;">
      <strong>📊 تقارير متقدمة:</strong> احصل على تحليلات دقيقة تتبع رحلة كل عميل وتفاصيل تفاعله.
    </div>
    <div style="margin-bottom: 25px; font-size: 13px; color: #52525b; line-height: 1.6;">
      <strong>📞 دعم فني خاص:</strong> تواصل مع مدراء حسابات مخصصين لحل مشاكلك ودعم نموك.
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="https://example.com/checkout?coupon={{coupon_code}}" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 12px 30px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2);">استخدم الخصم الآن</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الرسالة بناءً على اشتراكك في قائمة عروض {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">تفضيلات الإشعارات</a>
  </div>
</div>`
    },
    {
      id: 'booking_confirmation',
      nameAr: 'تأكيد الحجز وتفاصيل الموعد',
      nameEn: 'Booking & Appointment Confirmation',
      descAr: 'قالب مخصص لتأكيد الحجوزات أو المواعيد الطبية والخدمية مع تفاصيل الزمان والمكان.',
      descEn: 'A detailed transactional email template confirming bookings, events, or service appointments.',
      subjectAr: 'تم تأكيد حجزك بنجاح! تفاصيل موعدك 📅',
      subjectEn: 'Booking Confirmed! Your appointment details 📅',
      icon: 'Calendar',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'customer_name', labelAr: 'اسم العميل', labelEn: 'Customer Name', defaultValAr: 'أحمد علي', defaultValEn: 'Ahmed Ali' },
        { key: 'service_name', labelAr: 'الخدمة / الموعد', labelEn: 'Service / Event Name', defaultValAr: 'حجز جناح فندقي / موعد استشارة', defaultValEn: 'Hotel Suite Reservation / Consultation' },
        { key: 'booking_id', labelAr: 'رقم الحجز', labelEn: 'Booking ID', defaultValAr: 'BK-9921', defaultValEn: 'BK-9921' },
        { key: 'booking_date', labelAr: 'التاريخ والوقت', labelEn: 'Date & Time', defaultValAr: 'السبت 27 يونيو 2026، الساعة 10:00 صباحاً', defaultValEn: 'Saturday June 27, 2026, at 10:00 AM' },
        { key: 'location', labelAr: 'الموقع / العنوان', labelEn: 'Location', defaultValAr: 'شارع الرشيد، بغداد، العراق', defaultValEn: 'Al-Rasheed Street, Baghdad, Iraq' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #09090b; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 16px; font-weight: 600;">تأكيد الحجز الرسمي</h2>
  </div>
  
  <div style="padding: 30px;">
    <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">مرحباً {{customer_name}}،</h3>
    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">
      يسعدنا إبلاغك بأنه تم تأكيد حجزك لـ <strong>{{service_name}}</strong> بنجاح. تفاصيل الحجز موضحة في الجدول التالي:
    </p>
    
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
        <tr>
          <td style="padding: 8px 0; color: #71717a;">رقم الحجز:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{booking_id}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">الخدمة:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{service_name}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">التاريخ والوقت:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{booking_date}}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;">العنوان / الموقع:</td>
          <td style="padding: 8px 0; font-weight: 600; text-align: left; color: #09090b;">{{location}}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-bottom: 10px;">
      <a href="https://example.com/bookings/{{booking_id}}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px;">إدارة وحفظ الحجز</a>
    </div>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    نظام إدارة الحجوزات الآلي • {{platform_name}}
  </div>
</div>`
    },
    {
      id: 'abandoned_cart',
      nameAr: 'استرجاع سلة التسوق المتروكة',
      nameEn: 'Abandoned Cart Recovery',
      descAr: 'رسالة تذكيرية ذكية لتشجيع العملاء على إتمام عملية الشراء عبر تقديم حافز أو تذكير بالمنتجات.',
      descEn: 'An engaging recovery template designed to bring back shoppers who left items in their cart.',
      subjectAr: 'هل نسيت شيئاً؟ منتجاتك المفضلة لا تزال تنتظرك! 🛒',
      subjectEn: 'Forgot something? Your items are waiting! 🛒',
      icon: 'ShoppingBag',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة/المتجر', labelEn: 'Store/Platform Name', defaultValAr: 'متجرنا الإلكتروني', defaultValEn: 'Our E-Commerce Store' },
        { key: 'customer_name', labelAr: 'اسم العميل', labelEn: 'Customer Name', defaultValAr: 'عميلنا المميز', defaultValEn: 'Valued Customer' },
        { key: 'discount_percent', labelAr: 'نسبة الخصم', labelEn: 'Discount Percent', defaultValAr: '10', defaultValEn: '10' },
        { key: 'coupon_code', labelAr: 'كوبون الخصم', labelEn: 'Coupon Code', defaultValAr: 'CART10', defaultValEn: 'CART10' },
        { key: 'cart_link', labelAr: 'رابط العودة للسلة', labelEn: 'Cart URL', defaultValAr: 'https://example.com/cart', defaultValEn: 'https://example.com/cart' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header -->
  <div style="background-color: #09090b; padding: 35px 20px; text-align: center; color: #ffffff;">
    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; display: block; margin-bottom: 8px;">تذكير بطلبك المتروك</span>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; font-family: 'Cairo', sans-serif;">سلة تسوقك في {{platform_name}}</h1>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <h2 style="font-size: 17px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px;">مرحباً {{customer_name}}،</h2>
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 20px;">
      لاحظنا أنك تركت بعض المنتجات الرائعة في سلة التسوق الخاصة بك قبل إنهاء الدفع. لا تقلق، لقد قمنا بحفظ المنتجات وتأمينها لك مؤقتاً لتتمكن من إتمام الشراء.
    </p>

    <!-- Discount Box -->
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <span style="font-size: 13px; color: #09090b; display: block; margin-bottom: 6px; font-weight: bold;">توفير إضافي لإكمال طلبك:</span>
      <p style="margin: 0 0 12px 0; font-size: 13px; color: #52525b; line-height: 1.5;">
        استخدم الكوبون التالي عند الدفع للحصول على خصم <strong>{{discount_percent}}%</strong> إضافي على إجمالي سلتك:
      </p>
      <div style="display: inline-block; font-size: 22px; font-weight: bold; color: #09090b; background-color: #f4f4f5; border: 1px solid #e4e4e7; padding: 6px 20px; border-radius: 4px; letter-spacing: 1px;">{{coupon_code}}</div>
    </div>

    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 25px;">
      المخزون من المنتجات التي اخترتها محدود جداً وقد تنفذ في أي لحظة. اضغط على الزر أدناه للعودة لسلة التسوق الخاصة بك مباشرة وإتمام عملية الشراء بضغطة واحدة.
    </p>

    <div style="text-align: center; margin: 30px 0 10px 0;">
      <a href="{{cart_link}}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">العودة إلى السلة وإتمام الدفع</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تلقيت هذه الرسالة لأنك تركت منتجات في سلة تسوق {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">إلغاء الاشتراك</a>
  </div>
</div>`
    },
    {
      id: 'nps_survey',
      nameAr: 'تقييم الخدمة واستطلاع الرأي (NPS)',
      nameEn: 'Customer Feedback & NPS',
      descAr: 'قالب استطلاع آراء العملاء وتجربتهم مع أزرار تفاعلية ونظام تقييم رقمي (1-10) أنيق.',
      descEn: 'A minimalist feedback email layout containing an interactive NPS scale (1-10) for customer reviews.',
      subjectAr: 'شاركنا رأيك: كيف كانت تجربتك مع {{platform_name}}؟ ⭐',
      subjectEn: 'We\'d love your feedback: How was your experience with {{platform_name}}? ⭐',
      icon: 'Star',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'customer_name', labelAr: 'اسم العميل', labelEn: 'Customer Name', defaultValAr: 'عميلنا العزيز', defaultValEn: 'Valued Customer' },
        { key: 'product_service', labelAr: 'الخدمة / المنتج', labelEn: 'Product/Service Name', defaultValAr: 'طلبك الأخير', defaultValEn: 'your recent interaction' },
        { key: 'survey_link', labelAr: 'رابط الاستطلاع المخصص', labelEn: 'Custom Survey Link', defaultValAr: 'https://example.com/survey', defaultValEn: 'https://example.com/survey' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header Banner -->
  <div style="background-color: #09090b; padding: 35px 20px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px;">استطلاع رأي العملاء • FEEDBACK</div>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; font-family: 'Cairo', sans-serif;">{{platform_name}}</h1>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <h2 style="font-size: 17px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px;">مرحباً {{customer_name}}،</h2>
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
      نشكرك على اختيارك <strong>{{platform_name}}</strong> لاستخدام <strong>{{product_service}}</strong>. نحن نسعى دائماً لتقديم أفضل تجربة ممكنة، ويسعدنا جداً معرفة رأيك لمساعدتنا في تحسين خدماتنا باستمرار.
    </p>

    <!-- NPS Question -->
    <h3 style="font-size: 14px; font-weight: 700; color: #09090b; text-align: center; margin-bottom: 20px; line-height: 1.6;">
      ما هي احتمالية توصيتك بـ {{platform_name}} لصديق أو زميل؟
    </h3>

    <!-- Interactive Scale -->
    <div style="margin: 25px 0; direction: ltr; text-align: center;">
      <table align="center" style="margin: 0 auto; border-collapse: separate; border-spacing: 6px;">
        <tr>
          <!-- 1 to 10 scale buttons -->
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=1" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">1</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=2" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">2</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=3" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">3</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=4" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">4</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=5" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">5</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=6" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">6</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=7" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">7</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=8" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">8</a>
          </td>
          <td style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=9" style="color: #52525b; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">9</a>
          </td>
          <td style="background-color: #09090b; border: 1px solid #09090b; border-radius: 8px; width: 38px; height: 38px; text-align: center; vertical-align: middle;">
            <a href="{{survey_link}}?score=10" style="color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; display: block; line-height: 38px;">10</a>
          </td>
        </tr>
      </table>
      
      <!-- Scale Labels -->
      <table align="center" style="width: 440px; margin: 8px auto 0 auto; border-collapse: collapse; font-size: 11px; color: #71717a;">
        <tr>
          <td style="text-align: left; width: 50%;">1 - غير محتمل أبداً</td>
          <td style="text-align: right; width: 50%;">10 - محتمل جداً 🚀</td>
        </tr>
      </table>
    </div>

    <!-- Additional Comment Box Info -->
    <p style="color: #71717a; font-size: 12px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
      عند اختيارك لأي رقم، سيتم فتح صفحة استطلاع قصيرة تتيح لك كتابة ملاحظات إضافية.
    </p>

    <!-- Alternative Link CTA -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="{{survey_link}}" style="display: inline-block; background-color: #fafafa; border: 1px solid #e4e4e7; color: #09090b; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);">تقديم استبيان تفصيلي</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الرسالة بناءً على تعاملك الأخير مع {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">إلغاء الاشتراك</a>
  </div>
</div>`
    },
    {
      id: 'analytics_report',
      nameAr: 'تقرير الأداء والإحصائيات الدوري',
      nameEn: 'Monthly Analytics Dashboard',
      descAr: 'قالب يعرض ملخص البيانات الدورية ونسب النجاح بأسلوب البطاقات التفاعلية الأنيق.',
      descEn: 'A rich visual report template for sending usage statistics, delivery metrics, and highlights.',
      subjectAr: 'تقريرك الإحصائي لـ {{platform_name}} لشهر {{report_month}} 📈',
      subjectEn: 'Your {{platform_name}} Monthly Report for {{report_month}} 📈',
      icon: 'BarChart2',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'report_month', labelAr: 'شهر التقرير', labelEn: 'Report Month', defaultValAr: 'يونيو 2026', defaultValEn: 'June 2026' },
        { key: 'user_name', labelAr: 'اسم المستخدم', labelEn: 'User Name', defaultValAr: 'شريكنا العزيز', defaultValEn: 'Valued Partner' },
        { key: 'stat_sent', labelAr: 'إجمالي الرسائل المرسلة', labelEn: 'Total Sent Messages', defaultValAr: '142,500', defaultValEn: '142,500' },
        { key: 'stat_delivered', labelAr: 'نسبة وصول الرسائل', labelEn: 'Delivery Rate', defaultValAr: '99.85%', defaultValEn: '99.85%' },
        { key: 'stat_saved', labelAr: 'التكلفة التي تم توفيرها', labelEn: 'Cost Saved', defaultValAr: '$1,240', defaultValEn: '$1,240' },
        { key: 'stat_api_calls', labelAr: 'إجمالي طلبات الـ API', labelEn: 'Total API Requests', defaultValAr: '320,410', defaultValEn: '320,410' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Header Banner -->
  <div style="background: linear-gradient(135deg, #09090b 0%, #27272a 100%); padding: 35px 20px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 12px; letter-spacing: 0.5px;">التقرير الإحصائي الشهري • ANALYTICS</div>
    <h1 style="margin: 0; font-size: 20px; font-weight: 700; font-family: 'Cairo', sans-serif;">{{platform_name}}</h1>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #a1a1aa;">تحديث الأداء لـ {{report_month}}</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px 25px;">
    <h2 style="font-size: 17px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px;">مرحباً {{user_name}}،</h2>
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
      نضع بين يديك تقرير الأداء الشهري الخاص بنشاطك على منصتنا. نأمل أن تساهم هذه الإحصائيات في تحسين فهمك لفاعلية وسرعة توصيل إشعاراتك الرقمية.
    </p>

    <!-- Grid Cards (2x2) -->
    <div style="margin: 25px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <!-- Card 1 -->
          <td style="width: 50%; padding: 0 0 12px 6px; vertical-align: top;">
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px;">
              <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 8px; font-weight: 600;">الرسائل الصادرة</span>
              <strong style="font-size: 22px; color: #09090b; display: block; font-family: sans-serif;">{{stat_sent}}</strong>
              <span style="font-size: 11px; color: #10b981; display: block; margin-top: 4px;">+12% زيادة عن الشهر الماضي</span>
            </div>
          </td>
          <!-- Card 2 -->
          <td style="width: 50%; padding: 0 6px 12px 0; vertical-align: top;">
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px;">
              <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 8px; font-weight: 600;">معدل الوصول</span>
              <strong style="font-size: 22px; color: #09090b; display: block; font-family: sans-serif;">{{stat_delivered}}</strong>
              <span style="font-size: 11px; color: #71717a; display: block; margin-top: 4px;">ضمن النطاق الأمثل</span>
            </div>
          </td>
        </tr>
        <tr>
          <!-- Card 3 -->
          <td style="width: 50%; padding: 12px 0 0 6px; vertical-align: top;">
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px;">
              <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 8px; font-weight: 600;">التكلفة الموفرة</span>
              <strong style="font-size: 22px; color: #10b981; display: block; font-family: sans-serif;">{{stat_saved}}</strong>
              <span style="font-size: 11px; color: #71717a; display: block; margin-top: 4px;">بفضل توجيه القنوات الذكي</span>
            </div>
          </td>
          <!-- Card 4 -->
          <td style="width: 50%; padding: 12px 6px 0 0; vertical-align: top;">
            <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px;">
              <span style="font-size: 11px; color: #71717a; display: block; margin-bottom: 8px; font-weight: 600;">طلبات الـ API</span>
              <strong style="font-size: 22px; color: #09090b; display: block; font-family: sans-serif;">{{stat_api_calls}}</strong>
              <span style="font-size: 11px; color: #71717a; display: block; margin-top: 4px;">متوسط وقت الاستجابة 85ms</span>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div style="background-color: rgba(9, 9, 11, 0.02); border: 1px solid #e4e4e7; border-radius: 8px; padding: 15px; margin-bottom: 25px; font-size: 12px; color: #52525b; line-height: 1.6;">
      <strong>تحليل الشهر:</strong> يوضح التقرير ارتفاعاً إيجابياً في جودة توصيل الإشعارات بنسبة 0.4% عن الشهر السابق، مع بقاء معدلات الأمان والحماية متطابقة تماماً مع المعايير المطلوبة.
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-top: 30px;">
      <a href="https://example.com/dashboard" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">عرض التفاصيل في لوحة التحكم</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الرسالة بناءً على اشتراك حسابك في التقارير الإحصائية الدورية لـ {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.<br>
    <a href="#" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">تعديل تفضيلات الإشعارات</a>
  </div>
</div>`
    },
    {
      id: 'workspace_invite',
      nameAr: 'دعوة انضمام لمساحة عمل أو مشروع',
      nameEn: 'Workspace & Team Invitation',
      descAr: 'قالب دعوة احترافي يوضح اسم الداعي، الدور المقترح، ومساحة العمل مع زر قبول فوري جذاب.',
      descEn: 'A premium invitation email design letting users invite collaborators to their workspace, project, or organization.',
      subjectAr: 'لقد دعاك {{inviter_name}} للانضمام إلى مساحة العمل {{workspace_name}} 🚀',
      subjectEn: '{{inviter_name}} invited you to join the {{workspace_name}} workspace 🚀',
      icon: 'Rocket',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'inviter_name', labelAr: 'اسم المرسل/الداعي', labelEn: 'Inviter Name', defaultValAr: 'جاسم كريم', defaultValEn: 'Jasim Kareem' },
        { key: 'workspace_name', labelAr: 'اسم مساحة العمل', labelEn: 'Workspace Name', defaultValAr: 'فريق التطوير والمنتجات', defaultValEn: 'Dev & Product Team' },
        { key: 'role_name', labelAr: 'الدور المقترح للمدعو', labelEn: 'Proposed Role', defaultValAr: 'مطور برمجيات', defaultValEn: 'Software Developer' },
        { key: 'invite_link', labelAr: 'رابط قبول الدعوة', labelEn: 'Accept Invite Link', defaultValAr: 'https://example.com/invite/accept?token=xyz', defaultValEn: 'https://example.com/invite/accept?token=xyz' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Top Accent -->
  <div style="height: 6px; background-color: #09090b;"></div>
  
  <!-- Content -->
  <div style="padding: 35px 30px;">
    <!-- Visual Representation of Collaboration -->
    <div style="text-align: center; margin-bottom: 25px; direction: ltr;">
      <table align="center" style="margin: 0 auto; border-collapse: collapse;">
        <tr>
          <!-- Inviter Avatar Placeholder -->
          <td>
            <div style="width: 44px; height: 44px; line-height: 44px; background-color: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 50%; color: #09090b; font-weight: bold; font-size: 14px; text-align: center;">JK</div>
          </td>
          <!-- Connector line -->
          <td style="padding: 0 15px;">
            <div style="width: 30px; height: 1px; border-top: 1px dashed #a1a1aa;"></div>
          </td>
          <!-- App Logo / Platform representation -->
          <td>
            <div style="width: 48px; height: 48px; line-height: 48px; background-color: #09090b; border-radius: 12px; color: #ffffff; font-weight: bold; font-size: 18px; text-align: center;">SS</div>
          </td>
        </tr>
      </table>
    </div>

    <h2 style="font-size: 18px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 15px; text-align: center;">انضم إلى مساحة العمل</h2>
    
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 20px; text-align: center;">
      لقد قام <strong>{{inviter_name}}</strong> بدعوتك للانضمام ومشاركة العمل في مساحة <strong>{{workspace_name}}</strong> على منصة {{platform_name}} بصفتك <strong>{{role_name}}</strong>.
    </p>

    <!-- Invitation details card -->
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #444444;">
        <tr>
          <td style="padding: 6px 0; color: #71717a;">الداعي:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: left; color: #09090b;">{{inviter_name}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">مساحة العمل:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: left; color: #09090b;">{{workspace_name}}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #71717a;">الدور المقترح:</td>
          <td style="padding: 6px 0; font-weight: 600; text-align: left; color: #09090b;">{{role_name}}</td>
        </tr>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 25px;">
      <a href="{{invite_link}}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">قبول الدعوة والانضمام للمشروع</a>
    </div>

    <hr style="border: 0; border-top: 1px solid #f4f4f5; margin: 20px 0;">

    <p style="color: #888888; font-size: 11px; line-height: 1.5; margin: 0; text-align: center;">
      إذا لم تكن تتوقع هذه الدعوة، يمكنك ببساطة تجاهلها. لن يتم إضافتك للمشروع إلا بعد النقر على زر القبول.
    </p>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الدعوة لأن {{inviter_name}} أرسلها إلى بريدك الإلكتروني.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.
  </div>
</div>`
    },
    {
      id: 'trial_expiration',
      nameAr: 'تنبيه قرب انتهاء الفترة التجريبية',
      nameEn: 'Trial Expiration Reminder',
      descAr: 'تصميم تذكيري راقٍ لحث العملاء على ترقية الاشتراك قبل توقف الميزات المجانية، مع مقارنة سريعة للباقات.',
      descEn: 'A professional trial expiry reminder showing days remaining, features list, and direct pricing upgrade routes.',
      subjectAr: 'تنبيه: متبقي {{days_left}} أيام فقط على انتهاء فترتك التجريبية ⏳',
      subjectEn: 'Warning: Only {{days_left}} days left in your free trial ⏳',
      icon: 'Bell',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا الرقمية', defaultValEn: 'Our Digital Platform' },
        { key: 'user_name', labelAr: 'اسم المستخدم', labelEn: 'User Name', defaultValAr: 'مستخدمنا العزيز', defaultValEn: 'Valued User' },
        { key: 'days_left', labelAr: 'أيام الصلاحية المتبقية', labelEn: 'Days Remaining', defaultValAr: '3', defaultValEn: '3' },
        { key: 'upgrade_link', labelAr: 'رابط صفحة الترقية', labelEn: 'Upgrade Page Link', defaultValAr: 'https://example.com/billing', defaultValEn: 'https://example.com/billing' }
      ],
      body: `<div style="font-family: 'Cairo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.02);">
  <!-- Top Warning Accent -->
  <div style="height: 6px; background-color: #f59e0b;"></div>
  
  <!-- Content -->
  <div style="padding: 35px 30px;">
    <h2 style="font-size: 18px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 15px;">الفترة التجريبية أوشكت على الانتهاء</h2>
    
    <p style="color: #3f3f46; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">
      مرحباً {{user_name}}، نود تذكيرك بأنه متبقي <strong>{{days_left}} أيام فقط</strong> على انتهاء الفترة التجريبية المجانية الخاصة بك في <strong>{{platform_name}}</strong>.
    </p>

    <!-- Visual Countdown Progress -->
    <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin-bottom: 25px; text-align: center;">
      <span style="font-size: 12px; color: #71717a; display: block; margin-bottom: 10px;">انقضى 11 يوماً من أصل 14 يوماً</span>
      <!-- Progress Bar Container -->
      <div style="height: 8px; background-color: #e4e4e7; border-radius: 4px; overflow: hidden; direction: ltr; margin: 0 auto; max-width: 320px;">
        <!-- 78% filled bar -->
        <div style="height: 8px; width: 78%; background-color: #f59e0b; border-radius: 4px;"></div>
      </div>
      <span style="font-size: 12px; color: #ef4444; display: block; margin-top: 10px; font-weight: 600;">أكمل ترقية حسابك الآن لتفادي انقطاع الخدمة</span>
    </div>

    <h3 style="font-size: 14px; font-weight: 700; color: #09090b; margin-top: 0; margin-bottom: 12px;">الميزات التي ستفقد صلاحية استخدامها:</h3>
    
    <div style="margin-bottom: 10px; font-size: 13px; color: #52525b; line-height: 1.5; padding-right: 15px; position: relative;">
      <span style="position: absolute; right: 0; color: #ef4444;">•</span>
      إمكانية إرسال حملات البريد المتعددة للمشتركين.
    </div>
    <div style="margin-bottom: 10px; font-size: 13px; color: #52525b; line-height: 1.5; padding-right: 15px; position: relative;">
      <span style="position: absolute; right: 0; color: #ef4444;">•</span>
      الوصول غير المحدود لـ Webhooks والربط المقبل.
    </div>
    <div style="margin-bottom: 25px; font-size: 13px; color: #52525b; line-height: 1.5; padding-right: 15px; position: relative;">
      <span style="position: absolute; right: 0; color: #ef4444;">•</span>
      تقارير التحليلات المتقدمة وتتبع نسبة الفتح والنقر.
    </div>

    <!-- CTA -->
    <div style="text-align: center; margin-bottom: 15px;">
      <a href="{{upgrade_link}}" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 30px; font-size: 13px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">ترقية الاشتراك للمستوى الاحترافي</a>
    </div>
  </div>

  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #e4e4e7; line-height: 1.6;">
    تصلك هذه الرسالة التنبيهية التلقائية بخصوص حالة حسابك التجريبي في {{platform_name}}.<br>
    © 2026 {{platform_name}}. جميع الحقوق محفوظة.
  </div>
</div>`
    }
  ],
  sms: [
    {
      id: 'sms_otp',
      nameAr: 'رمز التحقق (SMS OTP)',
      nameEn: 'SMS Verification OTP',
      descAr: 'الرسالة السريعة لرموز الـ OTP لضمان التوصيل الفوري بأسلوب مختصر ومباشر.',
      descEn: 'Instant verification message format for quick OTP codes sent to mobile clients.',
      icon: 'MessageSquare',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا', defaultValEn: 'Our Platform' },
        { key: 'otp_code', labelAr: 'رمز التحقق', labelEn: 'OTP Code', defaultValAr: '9281', defaultValEn: '9281' },
        { key: 'expiry_mins', labelAr: 'دقائق الصلاحية', labelEn: 'Expiration Minutes', defaultValAr: '5', defaultValEn: '5' }
      ],
      body: 'رمز التحقق (OTP) الخاص بك لمنصة {{platform_name}} هو: {{otp_code}}. يرجى عدم مشاركته مع أي شخص. تنتهي صلاحية الرمز خلال {{expiry_mins}} دقائق.'
    },
    {
      id: 'sms_payment',
      nameAr: 'إشعار استلام دفعة شحن المحفظة',
      nameEn: 'Payment Success Alert',
      descAr: 'رسالة نصية تؤكد استلام دفعة شحن المحفظة وتعطي المستخدم رصيده الإجمالي المتبقي.',
      descEn: 'SMS message notifying user of a successful wallet top-up and current balance.',
      icon: 'Coins',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا', defaultValEn: 'Our Platform' },
        { key: 'amount', labelAr: 'المبلغ المشحون', labelEn: 'Amount', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' },
        { key: 'payment_method', labelAr: 'وسيلة الدفع', labelEn: 'Payment Method', defaultValAr: 'زين كاش', defaultValEn: 'Zain Cash' },
        { key: 'balance', labelAr: 'الرصيد الحالي', labelEn: 'Current Balance', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' }
      ],
      body: 'تم استلام دفعة بقيمة {{amount}} بنجاح عبر {{payment_method}} لحسابك في {{platform_name}}. رصيدك الحالي هو {{balance}}. شكراً لك!'
    },
    {
      id: 'sms_domain',
      nameAr: 'تنبيه تفعيل النطاق (Domain Active)',
      nameEn: 'Domain Verification Alert',
      descAr: 'رسالة قصيرة للمطور لإعلامه بنجاح ربط النطاق وبدء إمكانية الإرسال البرمجي.',
      descEn: 'Alert informing developers that their domain verification has completed.',
      icon: 'Globe',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا', defaultValEn: 'Our Platform' },
        { key: 'domain_name', labelAr: 'النطاق', labelEn: 'Domain Name', defaultValAr: 'mystore.iq', defaultValEn: 'mystore.iq' }
      ],
      body: 'تنبيه من {{platform_name}}: تم تفعيل نطاقك {{domain_name}} بنجاح. يمكنك الآن بدء الإرسال الحقيقي عبر الـ API.'
    },
    {
      id: 'sms_campaign_alert',
      nameAr: 'حملة تسويقية ورابط فوري (SMS)',
      nameEn: 'SMS Marketing Campaign',
      descAr: 'رسالة ترويجية قصيرة ومباشرة مع كود خصم ورابط تتبع قصير.',
      descEn: 'A short marketing message including a discount code and target link.',
      icon: 'Megaphone',
      variables: [
        { key: 'brand_name', labelAr: 'اسم العلامة التجارية', labelEn: 'Brand Name', defaultValAr: 'سومر سنِد', defaultValEn: 'SumerSend' },
        { key: 'discount_pct', labelAr: 'نسبة الخصم', labelEn: 'Discount Percent', defaultValAr: '25%', defaultValEn: '25%' },
        { key: 'coupon', labelAr: 'كود الكوبون', labelEn: 'Coupon Code', defaultValAr: 'SMS25', defaultValEn: 'SMS25' },
        { key: 'link', labelAr: 'رابط الشراء', labelEn: 'Action Link', defaultValAr: 'sumer.me/sale', defaultValEn: 'sumer.me/sale' }
      ],
      body: 'عروض {{brand_name}} الحصرية! احصل على خصم {{discount_pct}} باستخدام الكوبون: {{coupon}} عند الدفع. تسوق الآن عبر الرابط: {{link}}'
    }
  ],
  whatsapp: [
    {
      id: 'wa_booking',
      nameAr: 'تأكيد حجز الفنادق والخدمات',
      nameEn: 'Booking Confirmation',
      descAr: 'نموذج رسالة تفاعلية لإعلام العملاء بتأكيد الحجوزات وتفاصيل التواريخ والرموز.',
      descEn: 'Detailed hotel or service booking voucher message.',
      icon: 'Building',
      variables: [
        { key: 'guest_name', labelAr: 'اسم النزيل', labelEn: 'Guest Name', defaultValAr: 'أحمد', defaultValEn: 'Ahmed' },
        { key: 'hotel_name', labelAr: 'مكان الحجز', labelEn: 'Booking Location', defaultValAr: 'فندق بابل الدولي', defaultValEn: 'Babylon International Hotel' },
        { key: 'booking_id', labelAr: 'رقم الحجز', labelEn: 'Booking ID', defaultValAr: '#BK-82910', defaultValEn: '#BK-82910' },
        { key: 'checkin_date', labelAr: 'تاريخ الدخول', labelEn: 'Check-in Date', defaultValAr: '2026-06-20', defaultValEn: '2026-06-20' }
      ],
      body: 'أهلاً {{guest_name}}، تم تأكيد حجزك في {{hotel_name}}. رقم الحجز: {{booking_id}}. تاريخ الدخول: {{checkin_date}}. نتمنى لك إقامة سعيدة!'
    },
    {
      id: 'wa_delivery',
      nameAr: 'إشعار شحن الطرود وتتبع التوصيل',
      nameEn: 'Delivery Tracking Alert',
      descAr: 'رسالة تحتوي على رقم تتبع ورابط مباشر للتتبع عبر واتساب.',
      descEn: 'WhatsApp message informing client of package delivery with tracking link.',
      icon: 'Package',
      variables: [
        { key: 'order_id', labelAr: 'رقم الطلب', labelEn: 'Order ID', defaultValAr: '#9283', defaultValEn: '#9283' },
        { key: 'carrier', labelAr: 'الناقل/المندوب', labelEn: 'Carrier/Captain', defaultValAr: 'كابتن التوصيل', defaultValEn: 'Delivery Captain' },
        { key: 'tracking_link', labelAr: 'رابط التتبع', labelEn: 'Tracking Link', defaultValAr: 'https://delivery.example.com/t/9283', defaultValEn: 'https://delivery.example.com/t/9283' }
      ],
      body: 'عزيزي العميل، طلبك رقم {{order_id}} قيد التوصيل الآن مع {{carrier}}. يمكنك تتبع الشحنة عبر الرابط التالي: {{tracking_link}}. شكراً لاختيارك لنا!'
    },
    {
      id: 'wa_report',
      nameAr: 'التقرير البرمجي الشهري للمطورين',
      nameEn: 'Monthly Developer Summary',
      descAr: 'رسالة إحصائية شهرية ملخصة للمطور تبين أداء الإرسال وحالة المحفظة المتبقية.',
      descEn: 'Summary showing monthly counts, delivery metrics, and remaining balance details.',
      icon: 'BarChart2',
      variables: [
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'منصتنا', defaultValEn: 'Our Platform' },
        { key: 'sent_count', labelAr: 'إجمالي المرسل', labelEn: 'Total Sent', defaultValAr: '12,480', defaultValEn: '12,480' },
        { key: 'delivery_rate', labelAr: 'نسبة التوصيل', labelEn: 'Delivery Rate', defaultValAr: '99.8%', defaultValEn: '99.8%' },
        { key: 'remaining_balance', labelAr: 'الرصيد المتبقي', labelEn: 'Remaining Balance', defaultValAr: '15,200 د.ع', defaultValEn: '15,200 IQD' }
      ],
      body: 'تقريرك الشهري من {{platform_name}}: إجمالي الرسائل المرسلة: {{sent_count}}. نسبة التوصيل: {{delivery_rate}}. الرصيد المتبقي: {{remaining_balance}}. يرجى شحن الرصيد لتجنب انقطاع الخدمة.'
    },
    {
      id: 'wa_usage_alert',
      nameAr: 'تنبيه استهلاك الموارد المرتفع',
      nameEn: 'WhatsApp High Usage Alert',
      descAr: 'إشعار فوري للمطورين عند اقتراب استهلاك الرصيد أو الموارد من الحد الأقصى.',
      descEn: 'Urgent notification for developers indicating API usage has exceeded a specific threshold.',
      icon: 'Bell',
      variables: [
        { key: 'dev_name', labelAr: 'اسم المطور', labelEn: 'Developer Name', defaultValAr: 'جاسم', defaultValEn: 'Jasim' },
        { key: 'threshold', labelAr: 'نسبة الاستهلاك', labelEn: 'Usage Threshold', defaultValAr: '90%', defaultValEn: '90%' },
        { key: 'platform_name', labelAr: 'اسم المنصة', labelEn: 'Platform Name', defaultValAr: 'SumerSend', defaultValEn: 'SumerSend' },
        { key: 'action_link', labelAr: 'رابط الشحن', labelEn: 'Recharge Link', defaultValAr: 'https://sumersend.com/billing', defaultValEn: 'https://sumersend.com/billing' }
      ],
      body: 'مرحباً {{dev_name}}، تنبيه عاجل من {{platform_name}}: استهلاكك للحصة الحالية تجاوز {{threshold}}. لتفادي انقطاع الخدمة، يرجى ترقية باقتك أو شحن الرصيد الآن: {{action_link}}'
    }
  ]
};
