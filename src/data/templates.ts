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
  body: string;
  icon: string;
  variables: TemplateVariable[];
  type?: 'email' | 'sms' | 'whatsapp';
}

export const templatesDb: { email: TemplateItem[]; sms: TemplateItem[]; whatsapp: TemplateItem[] } = {
  email: [
    {
      id: 'welcome_substack',
      nameAr: 'نشرة "مقالات للعقول الحرة"',
      nameEn: 'Free Minds Substack Digest',
      descAr: 'رسالة ترحيبية إبداعية مخصصة للمشتركين الجدد في المدونة مع اقتباسات فلسفية وتنسيق راقٍ.',
      descEn: 'A creative, clean welcome digest for your Substack subscribers featuring classic philosophical motifs.',
      subjectAr: 'مرحباً بك في "{{blog_name}}"',
      subjectEn: 'Welcome to {{blog_name}}! Let\'s think freely',
      icon: 'BookOpen',
      variables: [
        { key: 'writer_name', labelAr: 'اسم الكاتب', labelEn: 'Writer Name', defaultValAr: 'جاسم كريم', defaultValEn: 'Jasim Kareem' },
        { key: 'reader_name', labelAr: 'اسم القارئ', labelEn: 'Reader Name', defaultValAr: 'العقل الحر', defaultValEn: 'Free Thinker' },
        { key: 'blog_name', labelAr: 'اسم المدونة', labelEn: 'Blog Name', defaultValAr: 'مقالات للعقول الحرة', defaultValEn: 'Articles for Free Minds' },
        { key: 'blog_desc', labelAr: 'وصف المدونة', labelEn: 'Blog Description', defaultValAr: 'تحليلات عميقة في الفلسفة، علم النفس، والعلوم العصبية', defaultValEn: 'Deep analytical essays on philosophy, psychology, and neuroscience' },
        { key: 'quote_text', labelAr: 'نص الاقتباس', labelEn: 'Quote Text', defaultValAr: 'من ينظر إلى الخارج يحلم، ومن ينظر إلى الداخل يستيقظ.', defaultValEn: 'Who looks outside, dreams; who looks inside, awakes.' },
        { key: 'quote_author', labelAr: 'قائل الاقتباس', labelEn: 'Quote Author', defaultValAr: 'كارل غوستاف يونغ', defaultValEn: 'Carl Jung' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
  <div style="background-color: #09090b; padding: 35px 20px; text-align: center; color: #ffffff; border-bottom: 1px solid #1f1f23;">
    <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #a1a1aa; display: block; margin-bottom: 8px;">مَدَوَّنَة {{writer_name}}</span>
    <h1 style="margin: 0; font-size: 24px; font-weight: 700; font-family: 'Cairo', sans-serif;">{{blog_name}}</h1>
    <p style="margin: 8px 0 0 0; font-size: 13px; color: #a1a1aa;">{{blog_desc}}</p>
  </div>
  
  <div style="padding: 35px 30px;">
    <h2 style="font-size: 18px; font-weight: 600; color: #09090b; margin-top: 0; margin-bottom: 15px;">مرحباً بك {{reader_name}}،</h2>
    <p style="color: #444444; font-size: 14px; line-height: 1.8; margin-bottom: 25px;">لقد انضممت للتو إلى مجتمع يبحث في عمق الطبيعة البشرية والسلوك الإنساني. هنا لا نكتفي بالسطح؛ بل نغوص عميقاً مستلهمين من أعمال دوستويفسكي ويونغ ونيتشه لنكتشف خبايا العقل الباطن.</p>
    
    <div style="border-right: 3px solid #09090b; padding-right: 15px; margin: 25px 0; font-style: italic; color: #333333;">
      <p style="margin: 0; font-size: 14px; line-height: 1.6; font-weight: 500;">"{{quote_text}}"</p>
      <span style="font-size: 12px; color: #666666; display: block; margin-top: 5px;">— {{quote_author}}</span>
    </div>

    <h3 style="font-size: 15px; font-weight: 700; color: #09090b; margin-top: 30px; margin-bottom: 12px;">ماذا ينتظرك في بريدك؟</h3>
    
    <div style="margin-bottom: 15px; padding: 15px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 8px;">
      <strong style="color: #2563eb; font-size: 14px; display: block; margin-bottom: 4px;">تحليلات يونغ النفسية (Analytical Psychology):</strong>
      <span style="color: #555555; font-size: 13px; line-height: 1.5; display: block;">تفكيك العقد النفسية، الأنماط البدئية (Archetypes), ومفهوم الظل الذاتي.</span>
    </div>
    
    <div style="margin-bottom: 15px; padding: 15px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 8px;">
      <strong style="color: #10b981; font-size: 14px; display: block; margin-bottom: 4px;">العلوم العصبية والسلوك (Neuroscience):</strong>
      <span style="color: #555555; font-size: 13px; line-height: 1.5; display: block;">كيف تصنع الناقلات العصبية إدراكنا وقراراتنا اليومية?</span>
    </div>
    
    <div style="margin-bottom: 25px; padding: 15px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 8px;">
      <strong style="color: #f59e0b; font-size: 14px; display: block; margin-bottom: 4px;">فلسفة القوة والوجود (Philosophy):</strong>
      <span style="color: #555555; font-size: 13px; line-height: 1.5; display: block;">مناقشة أفكار التغلب على الذات عند نيتشه وتساؤلات الوجودية الكبرى.</span>
    </div>

    <div style="text-align: center; margin-top: 30px; margin-bottom: 10px;">
      <a href="https://prudctual.substack.com/" style="display: inline-block; background-color: #09090b; color: #ffffff; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">تصفح المقالات السابقة</a>
    </div>
  </div>

  <div style="background-color: #f4f4f5; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #eaeaea; line-height: 1.6;">
    تصلك هذه الرسالة لأنك اشتركت في مدونة {{blog_name}}.<br>
    © 2026 {{blog_name}}. كل الحقوق محفوظة.<br>
    <a href="https://prudctual.substack.com/" style="color: #2563eb; text-decoration: none; margin-top: 5px; display: inline-block;">إدارة الاشتراك</a>
  </div>
</div>`
    },
    {
      id: 'receipt_invoice',
      nameAr: 'فاتورة شحن رصيد - زين كاش',
      nameEn: 'Top-up Invoice (Zain Cash)',
      descAr: 'قالب إيصال دفع رسمي ومفصل يرسل للعميل بعد شحن رصيد محفظته عبر زين كاش.',
      descEn: 'A clean transactional receipt template sent to customers after completing a Zain Cash wallet top-up.',
      subjectAr: 'إيصال دفع: تم شحن محفظتك بنجاح',
      subjectEn: 'Payment Receipt: Wallet Funded Successfully',
      icon: 'Receipt',
      variables: [
        { key: 'tx_id', labelAr: 'رقم العملية', labelEn: 'Transaction ID', defaultValAr: 'TX928172', defaultValEn: 'TX928172' },
        { key: 'payment_method', labelAr: 'وسيلة الدفع', labelEn: 'Payment Method', defaultValAr: 'زين كاش (Zain Cash)', defaultValEn: 'Zain Cash' },
        { key: 'date', labelAr: 'تاريخ العملية', labelEn: 'Transaction Date', defaultValAr: '2026-06-15 13:09', defaultValEn: '2026-06-15 13:09' },
        { key: 'amount', labelAr: 'المبلغ المشحون', labelEn: 'Amount Funded', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' },
        { key: 'balance', labelAr: 'الرصيد الكلي الحالي', labelEn: 'Current Balance', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 500px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="padding: 25px; border-bottom: 1px dashed #eaeaea; text-align: center;">
    <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; background-color: #e6f7f0; color: #10b981; border-radius: 50%; font-size: 24px; margin-bottom: 12px; text-align: center;">✓</div>
    <h2 style="margin: 0; font-size: 18px; color: #09090b; font-weight: 700;">تم استلام الدفعة بنجاح</h2>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #71717a;">شكراً لك على شحن رصيدك في منصة Sumer Send</p>
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
      <strong>تنويه:</strong> يتم خصم رسوم الإرسال تلقائياً من محفظتك كالتالي: الإيميل (10 د.ع)، الـ SMS (120 د.ع)، والواتساب (150 د.ع).
    </div>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    بوابة Sumer Send للمطورين • بغداد، العراق
  </div>
</div>`
    },
    {
      id: 'otp_code',
      nameAr: 'رمز التحقق ثنائي العامل OTP',
      nameEn: 'Secure Verification OTP',
      descAr: 'قالب كود التحقق السريع المكون من 6 أرقام مع إرشادات الأمان وتنبيه انتهاء الصلاحية.',
      descEn: 'A sleek, simple 6-digit OTP code layout with security warning and expiration indicators.',
      subjectAr: 'رمز التحقق ثنائي العامل الخاص بك',
      subjectEn: 'Your Sumer Send verification code',
      icon: 'Lock',
      variables: [
        { key: 'otp_code', labelAr: 'رمز التحقق', labelEn: 'OTP Code', defaultValAr: '827104', defaultValEn: '827104' },
        { key: 'expiry_mins', labelAr: 'دقائق انتهاء الصلاحية', labelEn: 'Expiration (Minutes)', defaultValAr: '5', defaultValEn: '5' }
      ],
      body: `<div style="font-family: 'Cairo', sans-serif, system-ui; max-width: 450px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff; direction: rtl; text-align: right;">
  <div style="background-color: #09090b; padding: 25px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 16px; font-weight: 600;">Sumer Send Security</h2>
  </div>
  
  <div style="padding: 30px;">
    <h3 style="margin-top: 0; font-size: 16px; color: #09090b;">طلب تسجيل دخول أو تفعيل</h3>
    <p style="color: #555555; font-size: 13px; line-height: 1.6; margin-bottom: 20px;">لقد طلبت الحصول على رمز التحقق لتسجيل الدخول إلى حساب المطور الخاص بك في سومر سيند. يرجى استخدام الرمز التالي:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <div style="display: inline-block; background-color: #f4f4f5; letter-spacing: 6px; font-family: monospace; font-size: 28px; font-weight: 700; color: #09090b; padding: 12px 30px; border-radius: 6px; border: 1px solid #eaeaea; direction: ltr;">{{otp_code}}</div>
      <span style="display: block; font-size: 11px; color: #ef4444; margin-top: 8px;">ينتهي صلاحية هذا الرمز خلال {{expiry_mins}} دقائق فقط</span>
    </div>
    
    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
    
    <p style="color: #888888; font-size: 11px; line-height: 1.5; margin: 0;">إذا لم تقم بطلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني. لا تشارك هذا الرمز مع أي شخص لحماية حسابك من الاختراق.</p>
  </div>
  
  <div style="background-color: #f4f4f5; padding: 15px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #eaeaea;">
    دعم الحماية والأمان • سومر سيند العراق
  </div>
</div>`
    },
    {
      id: 'ahmed_sobhi_dedication',
      nameAr: 'إهداء لأحمد صبحي (AI and things)',
      nameEn: 'Dedication to Ahmed Sobhi (AI and things)',
      descAr: 'قالب إيميل إبداعي وتفاعلي مخصص لإرسال تهنئة لأحمد صبحي بتوقيع موقع AI and things.',
      descEn: 'A creative email dedication for Ahmed Sobhi signed by AI and things.',
      subjectAr: 'مرحباً أحمد صبحي | إهداء خاص من AI and things',
      subjectEn: 'Hello Ahmed Sobhi | Special Dedication from AI and things',
      icon: 'Sparkles',
      variables: [
        { key: 'friend_name', labelAr: 'اسم الصديق', labelEn: 'Friend\'s Name', defaultValAr: 'أحمد صبحي', defaultValEn: 'Ahmed Sobhi' },
        { key: 'sender_site', labelAr: 'الموقع المهدِي', labelEn: 'Sender Site', defaultValAr: 'AI and things', defaultValEn: 'AI and things' }
      ],
      body: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; border: 1px solid #e4e4e7; border-radius: 12px; overflow: hidden; direction: rtl; text-align: right; background-color: #fafafa; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
  <!-- Top Banner / Header -->
  <div style="background: linear-gradient(135deg, #09090b 0%, #27272a 100%); padding: 30px; text-align: center; color: #ffffff;">
    <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px;">ذكاء وأشياء | {{sender_site}}</h2>
    <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 13px;">تكنولوجيا المستقبل بأيدي الحاضر</p>
  </div>
  
  <!-- Content Body -->
  <div style="padding: 35px 25px; background-color: #ffffff;">
    <h3 style="margin-top: 0; color: #09090b; font-size: 18px; font-weight: 700; border-bottom: 2px solid #f4f4f5; padding-bottom: 15px; display: inline-block;">مرحباً بصديقنا المبدع، {{friend_name}}!</h3>
    
    <p style="color: #27272a; font-size: 15px; line-height: 1.6; margin-top: 20px;">
      هذه رسالة تحية وتقدير خاصة مُرسلة إليك مباشرة عبر منصة <strong>Sumer Send</strong> المتكاملة للإشعارات الذكية. يسعدنا جداً تواصلنا معك ومشاركتك شغف التكنولوجيا والذكاء الاصطناعي.
    </p>

    <!-- Creative Quote Card -->
    <div style="margin: 25px 0; padding: 20px; background-color: #f9fafb; border-right: 4px solid #09090b; border-radius: 4px; box-shadow: inset 0 0 8px rgba(0,0,0,0.01);">
      <p style="color: #4b5563; font-style: italic; font-size: 14px; line-height: 1.6; margin: 0;">
        "الذكاء ليس فقط في المعرفة، بل في القدرة على تطبيق المعرفة في الواقع العملي وتطويع التكنولوجيا لخدمة الإنسانية."
      </p>
      <span style="display: block; text-align: left; font-size: 11px; color: #9ca3af; margin-top: 8px; font-weight: 600;">— فريق {{sender_site}}</span>
    </div>

    <p style="color: #3f3f46; font-size: 14px; line-height: 1.6;">
      نتمنى لك رحلة ملهمة مليئة بالابتكار والإبداع الرقمي، ونتطلع دوماً لرؤية أعمالك ومشاريعك التكنولوجية المميزة في المستقبل القريب.
    </p>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #fafafa; padding: 20px; text-align: center; font-size: 12px; color: #71717a; border-top: 1px solid #eaeaea;">
    تلقيت هذه الرسالة كإهداء خاص • جميع الحقوق محفوظة لـ <strong>{{sender_site}}</strong><br>
    تكنولوجيا وتطوير الإشعارات الذكية الذاتية
  </div>
</div>`
    },
    {
      id: 'absi_tabsi_sarcastic',
      nameAr: 'قالب عبسي تبسي الساخر',
      nameEn: 'Absi Tabsi Sarcastic Report',
      descAr: 'قالب إيميل تشخيص نفسي ساخر مخصص لعبسي تبسي من فريق AI and things.',
      descEn: 'A sarcastic clinical psychology report for Absi Tabsi by AI and things.',
      subjectAr: 'تقرير التشخيص النفسي الرقمي: حالة عبسي تبسي المستعصية',
      subjectEn: 'Digital Psychological Diagnostics: Absi Tabsi\'s Case',
      icon: 'Bot',
      variables: [
        { key: 'absi_name', labelAr: 'اسم المريض', labelEn: 'Patient Name', defaultValAr: 'عبسي تبسي', defaultValEn: 'Absi Tabsi' },
        { key: 'autism_ratio', labelAr: 'نسبة التوحد الرقمي', labelEn: 'Introversion Ratio', defaultValAr: '99.99%', defaultValEn: '99.99%' },
        { key: 'last_grass_touch', labelAr: 'آخر عهد بالعشب', labelEn: 'Last Grass Touch', defaultValAr: 'سنة 2018 (العصر البرونزي)', defaultValEn: 'Year 2018' },
        { key: 'favorite_dish', labelAr: 'الوجبة المفضلة', labelEn: 'Favorite Dish', defaultValAr: 'تبسي باذنجان دسم جداً', defaultValEn: 'Extra Oily Eggplant Tabsi' },
        { key: 'caffeine_level', labelAr: 'معدل الكافيين', labelEn: 'Caffeine Intake', defaultValAr: '12 كوب قهوة + 4 علب مشروب طاقة', defaultValEn: '12 Cups Coffee + 4 Energy Drinks' }
      ],
      body: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Cairo', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; direction: rtl; text-align: right; background-color: #09090b; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); color: #e4e4e7;">
  <!-- Tech / Terminal Style Header -->
  <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 30px 25px; text-align: center; border-bottom: 2px solid #ef4444; position: relative;">
    <div style="position: absolute; top: 12px; right: 15px; background-color: #ef4444; color: #ffffff; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; font-family: monospace; letter-spacing: 0.5px;">SYSTEM ALERT: CRITICAL</div>
    <h2 style="margin: 15px 0 5px 0; font-size: 22px; font-weight: 800; color: #ef4444; letter-spacing: 0.5px;">مركز سومر للتحليل السلوكي وعلاج التوحد البرمجي</h2>
    <p style="margin: 0; color: #a1a1aa; font-size: 13px; font-family: monospace;">تقرير التشخيص النفسي الرقمي للحالة #404-ABSI-TABSI</p>
  </div>
  
  <!-- Content Body -->
  <div style="padding: 30px 25px; background-color: #09090b;">
    <p style="color: #a1a1aa; font-size: 13px; font-family: monospace; margin-top: 0; margin-bottom: 20px; border-bottom: 1px solid #27272a; padding-bottom: 10px;">
      [!] تم إنشاء هذا التقرير تلقائياً بناءً على تحليل سجلات الـ Git commits ومعدل استهلاك المعكرونة والقهوة.
    </p>

    <h3 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-top: 0; margin-bottom: 15px;">الملخص السريري للمريض: <span style="color: #ef4444;">{{absi_name}}</span></h3>
    
    <p style="color: #d4d4d8; font-size: 14px; line-height: 1.7; margin-bottom: 25px;">
      بعد إجراء الفحوصات والتحليلات الجنائية الرقمية على حسابات المريض البرمجية، تبيّن لخبراء <strong>AI and things</strong> السلوكيين أن المريض يعاني من حالة متقدمة من <strong>"متلازمة التبسي الانعزالي الحاد" (Acute Tabsi Isolation Syndrome)</strong>، وهي حالة تصيب المبرمجين الذين يستبدلون التفاعل البشري بـ RGB lights وأكواد البايثون.
    </p>

    <!-- Diagnosis Metrics Table -->
    <div style="margin: 25px 0; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px;">
      <h4 style="color: #ef4444; margin: 0 0 15px 0; font-size: 14px; font-weight: 700; font-family: monospace;">المؤشرات الحيوية الرقمية:</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #d4d4d8;">
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 0; color: #a1a1aa; font-weight: 500;">مستوى العزلة والتوحد الرقمي:</td>
          <td style="padding: 10px 0; text-align: left; color: #ef4444; font-weight: bold; font-size: 15px;">{{autism_ratio}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 0; color: #a1a1aa; font-weight: 500;">...آخر مرة لمس فيها العشب الحقيقي:</td>
          <td style="padding: 10px 0; text-align: left; color: #f59e0b; font-weight: bold; direction: ltr;">{{last_grass_touch}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 0; color: #a1a1aa; font-weight: 500;">الغذاء والوقود البيولوجي الأساسي:</td>
          <td style="padding: 10px 0; text-align: left; color: #10b981; font-weight: bold;">{{favorite_dish}}</td>
        </tr>
        <tr style="border-bottom: 1px solid #27272a;">
          <td style="padding: 10px 0; color: #a1a1aa; font-weight: 500;">مستوى الكافيين ومشروبات الطاقة:</td>
          <td style="padding: 10px 0; text-align: left; color: #ef4444; font-weight: bold;">{{caffeine_level}}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: #a1a1aa; font-weight: 500;">حساسية العين للضوء الطبيعي:</td>
          <td style="padding: 10px 0; text-align: left; color: #f59e0b; font-weight: bold;">خطأ 503 (الخدمة غير متوفرة خارج الغرفة)</td>
        </tr>
      </table>
    </div>

    <!-- Sarcastic Graphic representation of Isolation Level -->
    <div style="margin: 25px 0; text-align: center;">
      <span style="font-size: 12px; color: #a1a1aa; display: block; margin-bottom: 8px; font-family: monospace;">[مقياس الانطوائية الرقمية للمريض]</span>
      <div style="background-color: #18181b; border: 1px solid #27272a; height: 18px; border-radius: 9px; overflow: hidden; display: flex; width: 100%;">
        <div style="background: linear-gradient(90deg, #10b981 0%, #f59e0b 60%, #ef4444 100%); width: 99.99%; text-align: center; color: white; font-size: 10px; line-height: 18px; font-weight: 700; font-family: monospace;">CRITICAL LEVEL (99.99%)</div>
      </div>
    </div>

    <!-- Medical Advice Section -->
    <h4 style="color: #ffffff; margin: 25px 0 12px 0; font-size: 15px; font-weight: 700; border-bottom: 1px solid #27272a; padding-bottom: 8px;">بروتوكول العلاج الإجباري المقترح:</h4>
    <ul style="color: #a1a1aa; font-size: 13px; line-height: 1.7; padding-right: 20px; margin: 0;">
      <li style="margin-bottom: 10px;">
        <strong style="color: #ffffff;">الجرعة اليومية من الشمس:</strong> فتح النافذة لمدة 30 ثانية للنظر إلى كوكب الأرض وتأكيد وجود حياة خارج شاشتك.
      </li>
      <li style="margin-bottom: 10px;">
        <strong style="color: #ffffff;">موازنة الوجبات الغذائية:</strong> تقليل نسبة الباذنجان في التبسي لتجنب تحول خلايا الدماغ إلى كود باينري غير قابل للترجمة.
      </li>
      <li style="margin-bottom: 10px;">
        <strong style="color: #ffffff;">العلاج بالتأهيل الاجتماعي:</strong> التحدث مع إنسان حقيقي (ليس ChatGPT أو Siri) بصوت مسموع لمرة واحدة أسبوعياً على الأقل.
      </li>
      <li>
        <strong style="color: #ffffff;">بروتوكول الطوارئ:</strong> عند سماع جرس الباب لتسلم الدليفري، يُمنع الاختباء خلف الباب؛ بل يجب إلقاء التحية ومواجهة العالم الخارجي بشجاعة.
      </li>
    </ul>
    
    <div style="margin-top: 30px; padding: 15px; background-color: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 6px;">
      <p style="margin: 0; color: #ef4444; font-size: 12px; line-height: 1.5; text-align: center; font-weight: 600;">
        تحذير طبي: الاستمرار في هذا السلوك قد يؤدي إلى تحول المريض إلى مجرد سطر برمجي في مصفوفة مجهولة!
      </p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #18181b; padding: 20px; text-align: center; font-size: 11px; color: #71717a; border-top: 1px solid #27272a; line-height: 1.6; font-family: monospace;">
    تم الإرسال بواسطة منصة <strong>Sumer Send</strong> • التشخيص الساخر برعاية <strong>AI and things</strong><br>
    جميع الحقوق الطبية والتحشيشية محفوظة © 2026
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
        { key: 'otp_code', labelAr: 'رمز التحقق', labelEn: 'OTP Code', defaultValAr: '9281', defaultValEn: '9281' },
        { key: 'expiry_mins', labelAr: 'دقائق الصلاحية', labelEn: 'Expiration Minutes', defaultValAr: '5', defaultValEn: '5' }
      ],
      body: 'رمز التحقق (OTP) الخاص بك لمنصة سومر سيند هو: {{otp_code}}. يرجى عدم مشاركته مع أي شخص. تنتهي صلاحية الرمز خلال {{expiry_mins}} دقائق.'
    },
    {
      id: 'sms_payment',
      nameAr: 'إشعار استلام دفعة زين كاش',
      nameEn: 'Payment Success Alert',
      descAr: 'رسالة نصية تؤكد استلام دفعة شحن المحفظة وتعطي المستخدم رصيده الإجمالي المتبقي.',
      descEn: 'SMS message notifying user of a successful wallet top-up and current balance.',
      icon: 'Coins',
      variables: [
        { key: 'amount', labelAr: 'المبلغ المشحون', labelEn: 'Amount', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' },
        { key: 'payment_method', labelAr: 'وسيلة الدفع', labelEn: 'Payment Method', defaultValAr: 'زين كاش', defaultValEn: 'Zain Cash' },
        { key: 'balance', labelAr: 'الرصيد الحالي', labelEn: 'Current Balance', defaultValAr: '50,000 د.ع', defaultValEn: '50,000 IQD' }
      ],
      body: 'تم استلام دفعة بقيمة {{amount}} بنجاح عبر {{payment_method}} لحسابك في Sumer Send. رصيدك الحالي هو {{balance}}. شكراً لك!'
    },
    {
      id: 'sms_domain',
      nameAr: 'تنبيه تفعيل النطاق (Domain Active)',
      nameEn: 'Domain Verification Alert',
      descAr: 'رسالة قصيرة للمطور لإعلامه بنجاح ربط النطاق وبدء إمكانية الإرسال البرمجي.',
      descEn: 'Alert informing developers that their domain verification has completed.',
      icon: 'Globe',
      variables: [
        { key: 'domain_name', labelAr: 'النطاق', labelEn: 'Domain Name', defaultValAr: 'mystore.iq', defaultValEn: 'mystore.iq' }
      ],
      body: 'تنبيه من Sumer Send: تم تفعيل نطاقك {{domain_name}} بنجاح. يمكنك الآن بدء الإرسال الحقيقي عبر الـ API.'
    }
  ],
  whatsapp: [
    {
      id: 'wa_booking',
      nameAr: 'تأكيد حجز الفنادق (Grand Millennium)',
      nameEn: 'Hotel Booking Confirmation',
      descAr: 'نموذج رسالة تفاعلية لإعلام العملاء بتأكيد الحجوزات وتفاصيل التواريخ والرموز.',
      descEn: 'Detailed hotel booking voucher message perfect for Basra Millennium or Babylon hotels.',
      icon: 'Building',
      variables: [
        { key: 'guest_name', labelAr: 'اسم النزيل', labelEn: 'Guest Name', defaultValAr: 'أحمد', defaultValEn: 'Ahmed' },
        { key: 'hotel_name', labelAr: 'اسم الفندق', labelEn: 'Hotel Name', defaultValAr: 'فندق غراند ميليليوم البصرة', defaultValEn: 'Grand Millennium Basra' },
        { key: 'booking_id', labelAr: 'رقم الحجز', labelEn: 'Booking ID', defaultValAr: '#GM-82910', defaultValEn: '#GM-82910' },
        { key: 'checkin_date', labelAr: 'تاريخ الدخول', labelEn: 'Check-in Date', defaultValAr: '2026-06-20', defaultValEn: '2026-06-20' }
      ],
      body: 'أهلاً {{guest_name}}، تم تأكيد حجزك في {{hotel_name}}. رقم الحجز: {{booking_id}}. تاريخ الدخول: {{checkin_date}}. نتمنى لك إقامة سعيدة!'
    },
    {
      id: 'wa_delivery',
      nameAr: 'إشعار شحن Zain Delivery',
      nameEn: 'Delivery Tracking Alert',
      descAr: 'رسالة تحتوي على رقم تتبع ورابط مباشر للتتبع عبر واتساب.',
      descEn: 'WhatsApp message informing client of package delivery with tracking link.',
      icon: 'Package',
      variables: [
        { key: 'order_id', labelAr: 'رقم الطلب', labelEn: 'Order ID', defaultValAr: '#9283', defaultValEn: '#9283' },
        { key: 'carrier', labelAr: 'الناقل/المندوب', labelEn: 'Carrier/Captain', defaultValAr: 'كابتن زين', defaultValEn: 'Zain Captain' },
        { key: 'tracking_link', labelAr: 'رابط التتبع', labelEn: 'Tracking Link', defaultValAr: 'https://zain.delivery/t/9283', defaultValEn: 'https://zain.delivery/t/9283' }
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
        { key: 'sent_count', labelAr: 'إجمالي المرسل', labelEn: 'Total Sent', defaultValAr: '12,480', defaultValEn: '12,480' },
        { key: 'delivery_rate', labelAr: 'نسبة التوصيل', labelEn: 'Delivery Rate', defaultValAr: '99.8%', defaultValEn: '99.8%' },
        { key: 'remaining_balance', labelAr: 'الرصيد المتبقي', labelEn: 'Remaining Balance', defaultValAr: '15,200 د.ع', defaultValEn: '15,200 IQD' }
      ],
      body: 'تقريرك الشهري من Sumer Send: إجمالي الرسائل المرسلة: {{sent_count}}. نسبة التوصيل: {{delivery_rate}}. الرصيد المتبقي: {{remaining_balance}}. يرجى شحن الرصيد لتجنب انقطاع الخدمة.'
    }
  ]
};
