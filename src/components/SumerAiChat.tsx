import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, RefreshCw, Check, ArrowRight, Maximize2, Minimize2, ArrowDown, Shield, Link2, Clock, Lock, Unlock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSumer } from '../context/SumerContext';
import confetti from 'canvas-confetti';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  code?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SumerAiChat: React.FC = () => {
  const {
    lang,
    theme,
    walletBalance,
    setWalletBalance,
    transactions,
    setTransactions,
    apiKeys,
    domains,
    webhooks,
    logs,
    setCurrentTab,
    setMsgBody,
    setPlaygroundChannel,
    behaviorProfile
  } = useSumer();

  // Paid Feature Gating States
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('sumer_ai_chat_unlocked') === 'true';
  });
  const [trialCount, setTrialCount] = useState(() => {
    const saved = localStorage.getItem('sumer_ai_trial_count');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [activationError, setActivationError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [streamingText, setStreamingText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showScrollBadge, setShowScrollBadge] = useState(false);
  
  const scrollerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  // Initialize Welcome Message
  useEffect(() => {
    const weaknesses = behaviorProfile?.insights.filter(i => i.type === 'weakness') || [];
    let alertMsgAr = '';
    let alertMsgEn = '';

    if (weaknesses.length > 0) {
      alertMsgAr = `\n\n📢 **توصيات خوارزمية ذكية لك**:\n${weaknesses.slice(0, 2).map(w => `- **${w.titleAr}**: ${w.descAr}`).join('\n')}`;
      alertMsgEn = `\n\n📢 **Real-time Diagnostic Insights**:\n${weaknesses.slice(0, 2).map(w => `- **${w.titleEn}**: ${w.descEn}`).join('\n')}`;
    }

    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      sender: 'assistant',
      text: lang === 'ar' 
        ? `مرحباً بك في بوابة الإشعارات العراقية **سومر سيند**! أنا مساعدك الذكي المدمج في لوحة التحكم.\n\nيمكنني مساعدتك في:\n- 💰 الاستعلام عن رصيد محفظتك وتفاصيل الشحن.\n- 🌐 مراجعة حالة النطاقات والويب هوكس المربوطة.\n- 📊 تلخيص سجلات الإرسال الأخيرة وعمليات النظام.\n- 💬 كتابة مسودة حملة إعلانية تفاعلية وتطبيقها فوراً.\n\nأو يمكنك سؤالي عن مواضيع مدونة **"مقالات للعقول الحرة"** الفلسفية! 🧠${alertMsgAr}`
        : `Welcome to **Sumer Send**, the Iraqi Notification Gateway! I am your smart co-pilot.\n\nI can help you with:\n- 💰 Checking your wallet balance & billing details.\n- 🌐 Reviewing your verified domains and webhooks.\n- 📊 Summarizing recent delivery logs and system activity.\n- 💬 Drafting promotional campaign copy and applying it directly.\n\nOr ask me anything about the **"Articles for Free Minds"** philosophy! 🧠${alertMsgEn}`,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  }, [lang, behaviorProfile]);

  // Handle scrolling of the container
  const handleScroll = () => {
    if (!scrollerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    isAtBottomRef.current = isAtBottom;
    
    if (!isAtBottom && (isThinking || streamingText || messages.length > 2)) {
      setShowScrollBadge(true);
    } else {
      setShowScrollBadge(false);
    }
  };

  const forceScrollToBottom = () => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
      isAtBottomRef.current = true;
      setShowScrollBadge(false);
    }
  };

  // Scroll to bottom as streaming text or thinking states update
  useEffect(() => {
    if (isAtBottomRef.current) {
      forceScrollToBottom();
    }
  }, [messages, streamingText, isThinking, thinkingStep]);

  // Handle Gated Feature Purchase/Activation
  const handleActivatePro = () => {
    setActivationError(null);
    const cost = 10000; // 10,000 IQD

    if (walletBalance < cost) {
      setActivationError(
        lang === 'ar'
          ? `رصيد محفظتك غير كافٍ. تحتاج إلى 10,000 د.ع لتفعيل الخدمة (رصيدك الحالي: ${walletBalance.toLocaleString()} د.ع).`
          : `Insufficient wallet balance. You need 10,000 IQD to activate (current balance: ${walletBalance.toLocaleString()} IQD).`
      );
      return;
    }

    // Process payment deduction
    setWalletBalance(prev => prev - cost);
    
    // Add transaction log
    const newTx = {
      id: 'tx_ai_' + Math.random().toString(36).substr(2, 9),
      type: 'usage',
      amount: -cost,
      description: lang === 'ar' ? 'رسوم ترقية وتفعيل مساعد سومر الذكي (Pro)' : 'Sumer AI Co-Pilot Pro activation fee',
      timestamp: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    // Save unlock state
    localStorage.setItem('sumer_ai_chat_unlocked', 'true');
    setIsUnlocked(true);

    // Boom! Confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Append Pro Welcome message
    const proWelcomeMsg: ChatMessage = {
      id: 'pro_activated',
      sender: 'assistant',
      text: lang === 'ar'
        ? 'تم تفعيل **باقة المحترفين (Pro Tier)** بنجاح! تم إلغاء حد الـ 20 رسالة وتوفير المساعد لك بلا حدود. 🎉\n\nرصيدك الحالي بالمحفظة تم تحديثه، وتم تسجيل رسوم التفعيل في حركات محفظتك المعتمدة.'
        : 'Premium **Pro Tier** activated successfully! The 20-message quota limit has been lifted. 🎉\n\nYour wallet balance is updated, and the activation fee is registered in your statements.',
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, proWelcomeMsg]);
  };

  // Handle relocking chat for testing/demo (Resets both pro status and trial counter)
  const handleRelockChat = () => {
    localStorage.removeItem('sumer_ai_chat_unlocked');
    localStorage.setItem('sumer_ai_trial_count', '0');
    setIsUnlocked(false);
    setTrialCount(0);
    setInputValue('');
    setStreamingText('');
    setIsThinking(false);
    setActivationError(null);
    
    const resetWelcomeMsg: ChatMessage = {
      id: 'welcome_' + Date.now(),
      sender: 'assistant',
      text: lang === 'ar' 
        ? 'مرحباً بك مجدداً! تم تصفير عداد الفترة التجريبية (0 / 20). يمكنك بدء محادثة تجريبية جديدة.'
        : 'Welcome back! The free trial counter has been reset (0 / 20). Feel free to start a new trial chat.',
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([resetWelcomeMsg]);
  };

  // Simple Markdown formatting parser
  const renderMarkdown = (text: string, isUser: boolean) => {
    if (!text) return null;
    const paragraphs = text.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      if (para.startsWith('- ') || para.startsWith('* ')) {
        const items = para.split(/\n[-*]\s+/);
        items[0] = items[0].replace(/^[-*]\s+/, '');
        return (
          <ul key={pIdx} className="chat-markdown-ul">
            {items.map((item, iIdx) => (
              <li key={iIdx} className="chat-markdown-li">
                {parseInlineFormatting(item, isUser)}
              </li>
            ))}
          </ul>
        );
      }

      if (para.startsWith('### ') || para.startsWith('## ')) {
        const cleanHeader = para.replace(/^#{2,3}\s+/, '');
        return (
          <h3 key={pIdx} className="chat-markdown-h3">
            {parseInlineFormatting(cleanHeader, isUser)}
          </h3>
        );
      }

      return (
        <p key={pIdx} style={{ margin: pIdx > 0 ? '8px 0 0 0' : 0 }}>
          {parseInlineFormatting(para, isUser)}
        </p>
      );
    });
  };

  const parseInlineFormatting = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={idx} style={{ fontWeight: 700 }}>{boldText}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        const codeText = part.slice(1, -1);
        return <code key={idx} className="chat-markdown-code">{codeText}</code>;
      }
      return part;
    });
  };

  // Progressive response typing effect
  const streamResponse = (fullResponse: string, onFinish: () => void, codeBlock?: string, action?: any) => {
    setIsThinking(false);
    setStreamingText('');
    let currentIndex = 0;
    const intervalTime = 10;
    
    isAtBottomRef.current = true;
    forceScrollToBottom();

    const timer = setInterval(() => {
      currentIndex += 3;
      if (currentIndex >= fullResponse.length) {
        clearInterval(timer);
        const newMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          sender: 'assistant',
          text: fullResponse,
          code: codeBlock,
          action: action,
          timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, newMsg]);
        setStreamingText('');
        onFinish();
      } else {
        setStreamingText(fullResponse.substring(0, currentIndex));
      }
    }, intervalTime);
  };

  const executeThinkingSteps = (onComplete: () => void) => {
    setIsThinking(true);
    setThinkingStep(1);
    
    setTimeout(() => {
      setThinkingStep(2);
      setTimeout(() => {
        setThinkingStep(3);
        setTimeout(() => {
          setIsThinking(false);
          setThinkingStep(0);
          onComplete();
        }, 600);
      }, 550);
    }, 500);
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim() || isThinking || streamingText) return;

    // Check trial limit
    if (!isUnlocked && trialCount >= 20) {
      return; // blocked by paywall
    }

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Increment trial count (only when not Pro)
    if (!isUnlocked) {
      const nextCount = trialCount + 1;
      setTrialCount(nextCount);
      localStorage.setItem('sumer_ai_trial_count', nextCount.toString());
    }
    
    executeThinkingSteps(() => {
      processAiResponse(textToSend);
    });
  };

  const processAiResponse = (input: string) => {
    const cleanInput = input.toLowerCase().trim();
    
    // 1. Philosophical Easter Egg for Jasim Kareem
    const philosophyKeywords = [
      'nietzsche', 'dostoevsky', 'jung', 'freeminds', 'philosophy', 'human behavior',
      'نيتشه', 'دوستويفسكي', 'يونغ', 'فلسفة', 'العقول الحرة', 'جاسم', 'كارل يونغ', 'السلوك البشري', 'المقال'
    ];
    const containsPhilosophy = philosophyKeywords.some(keyword => cleanInput.includes(keyword));

    if (containsPhilosophy) {
      const responseAr = `أهلاً بك يا أستاذ جاسم. ككاتب لمدونتك المتميزة **"مقالات للعقول الحرة"** على Substack، يسعدني الحديث معك بعمق هنا.\n\nإن سبر النفس الإنسانية وربطها بالدوافع الدقيقة كصراعات دوستويفسكي النفسية، أو فهم الأنماط الفكرية والظل مع كارل يونغ، يماثل تماماً سعينا لبناء بنية تحتية تقنية متكاملة لتواصل عميق وواضح.\n\nكما كتب فريدريش نيتشه: *"من يمتلك لمـاذا يعيش، يستطيع تحمل أي كيف تقريباً"*. في سومر سيند، نحن نهيئ لك الـ "كيف" التقنية لتنشر أفكار مقالك لقرائك الأحرار.\n\n### صياغة مقترحة لحملتك القادمة:\n- **العنوان**: 🧠 مقال جديد للعقول الحرة: تفكيك صراعات النفس والوعي\n- **الرسالة المرفقة**: مرحباً صديقنا العزيز، مقال عميق جديد تم نشره الآن. نغوص فيه في فكر نيتشه والتحليل النفسي ليونغ. اقرأ المقال وتأمل معنا عبر الرابط: https://prudctual.substack.com/\n\nاضغط على الزر بالأسفل لتطبيق القالب في نافذة الحملات فوراً.`;
      const responseEn = `Welcome, Professor Jasim. As the writer of **"Articles for Free Minds"** on Substack, I am thrilled to explore deep topics with you.\n\nDeciphering human behavior, like Dostoevsky's psychological struggles or Carl Jung's concepts of the collective unconscious, parallels our objective of designing a robust framework for clear communication.\n\nAs Friedrich Nietzsche famously stated: *"He who has a why to live can bear almost any how."* Sumer Send provides the technical "how" to broadcast your deep ideas to your audience.\n\n### Suggested Campaign Draft:\n- **Title**: 🧠 New Article for Free Minds: Deconstructing the Soul and Consciousness\n- **Message**: Hello reader! A new analytical article has been published in "Articles for Free Minds" diving into Nietzsche and Jung. Read it now at: https://prudctual.substack.com/\n\nClick the button below to apply this campaign copy instantly.`;

      streamResponse(
        lang === 'ar' ? responseAr : responseEn,
        () => {},
        undefined,
        {
          label: lang === 'ar' ? 'تطبيق قالب العقول الحرة للحملة' : 'Apply Free Minds Promo',
          onClick: () => {
            const promoText = lang === 'ar'
              ? 'مرحباً صديقنا العزيز، مقال عميق جديد تم نشره الآن في "مقالات للعقول الحرة". نغوص فيه في فكر نيتشه والتحليل النفسي ليونغ. اقرأ المقال وتأمل معنا عبر الرابط: https://prudctual.substack.com/'
              : 'Hello reader! A new analytical article has been published in "Articles for Free Minds" diving into Nietzsche and Jung. Read it now at: https://prudctual.substack.com/';
            setMsgBody(promoText);
            setPlaygroundChannel('whatsapp');
            setCurrentTab('campaigns');
            setIsExpanded(false);
          }
        }
      );
      return;
    }

    // 2. Domains Status Query
    if (cleanInput.includes('domain') || cleanInput.includes('dns') || cleanInput.includes('نطاق') || cleanInput.includes('دومين')) {
      if (!domains || domains.length === 0) {
        const responseAr = `لا توجد نطاقات (Domains) مضافة في حسابك حالياً.\n\nيمكنك إضافة نطاق جديد من مركز المطورين لتوثيق إرسال رسائل البريد الإلكتروني.`;
        const responseEn = `There are no verified domains in your account right now.\n\nYou can add a new domain in the Developer Center to authenticate email delivery.`;
        streamResponse(lang === 'ar' ? responseAr : responseEn, () => {});
        return;
      }

      let domainsListAr = `تحتوي محفظتك على **${domains.length} نطاق(ات)** مسجلة بالنظام:\n\n`;
      let domainsListEn = `You have **${domains.length} domain(s)** configured in the system:\n\n`;

      domains.forEach((dom) => {
        const statusStrAr = dom.status === 'verified' ? '🟢 موثق ونشط' : '🟡 قيد التحقق (ينقصه مفاتيح CNAME)';
        const statusStrEn = dom.status === 'verified' ? '🟢 Verified & Active' : '🟡 Pending (requires CNAME DNS setup)';
        domainsListAr += `- \`${dom.name}\`: ${statusStrAr}\n`;
        domainsListEn += `- \`${dom.name}\`: ${statusStrEn}\n`;
      });

      domainsListAr += `\nيرجى الانتقال لإدارة النطاقات لنسخ سجلات الـ DNS وإكمال التفعيل للـ domains المعلقة.`;
      domainsListEn += `\nPlease proceed to domains settings to copy the CNAME keys and complete the verification.`;

      streamResponse(lang === 'ar' ? domainsListAr : domainsListEn, () => {}, undefined, {
        label: lang === 'ar' ? 'إدارة النطاقات والـ DNS' : 'Manage Domains & DNS',
        onClick: () => {
          setCurrentTab('domains');
          setIsExpanded(false);
        }
      });
      return;
    }

    // 3. Webhooks Status Query
    if (cleanInput.includes('webhook') || cleanInput.includes('ويب هوك') || cleanInput.includes('ويب هوكس')) {
      if (!webhooks || webhooks.length === 0) {
        const responseAr = `لا يوجد ويب هوك (Webhooks) مضاف في حسابك حالياً.\n\nالويب هوك يفيدك في استلام إشعارات التسليم وفشل الإرسال فوراً على سيرفرك الخاص.`;
        const responseEn = `You do not have any active webhooks in your account.\n\nWebhooks help you receive instant delivery receipts and sending failure reports on your own server.`;
        streamResponse(lang === 'ar' ? responseAr : responseEn, () => {});
        return;
      }

      let whListAr = `الويب هوكس النشطة لحسابك حالياً:\n\n`;
      let whListEn = `Active webhooks for your account:\n\n`;

      webhooks.forEach((wh) => {
        whListAr += `- **الرابط**: \`${wh.url}\`\n  **الأحداث**: \`${wh.events.join(', ')}\`\n`;
        whListEn += `- **Endpoint**: \`${wh.url}\`\n  **Events**: \`${wh.events.join(', ')}\`\n`;
      });

      streamResponse(lang === 'ar' ? whListAr : whListEn, () => {}, undefined, {
        label: lang === 'ar' ? 'إعدادات الويب هوكس' : 'Webhooks Config',
        onClick: () => {
          setCurrentTab('webhooks');
          setIsExpanded(false);
        }
      });
      return;
    }

    // 4. Latest Logs Summary
    if (cleanInput.includes('log') || cleanInput.includes('process') || cleanInput.includes('عمليات') || cleanInput.includes('سجل') || cleanInput.includes('رسائل')) {
      if (!logs || logs.length === 0) {
        const responseAr = `سجل الإرسال فارغ حالياً. لم يتم إرسال أي رسائل بعد.`;
        const responseEn = `Your delivery logs are empty. No messages have been sent yet.`;
        streamResponse(lang === 'ar' ? responseAr : responseEn, () => {});
        return;
      }

      const recentLogs = logs.slice(0, 3);
      let logsAr = `آخر **${recentLogs.length} عمليات إرسال** تمت عبر المنصة:\n\n`;
      let logsEn = `Last **${recentLogs.length} transmissions** routed through Sumer Send:\n\n`;

      recentLogs.forEach((log) => {
        const channelIcon = log.type === 'whatsapp' ? '💬 WA' : log.type === 'sms' ? '📱 SMS' : '✉️ Mail';
        const dateStr = new Date(log.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-IQ' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        
        logsAr += `- **${channelIcon}** إلى \`${log.to}\` (حالة: \`${log.status === 'delivered' ? '🟢 تم التوصيل' : '🔴 فشل الإرسال'}\`) في ${dateStr}\n`;
        logsEn += `- **${channelIcon}** to \`${log.to}\` (status: \`${log.status === 'delivered' ? '🟢 Delivered' : '🔴 Failed'}\`) at ${dateStr}\n`;
      });

      logsAr += `\nيمكنك الاطلاع على التقارير الكاملة والتفاصيل من صفحة السجلات.`;
      logsEn += `\nYou can check the full detailed analytics reports in the logs manager.`;

      streamResponse(lang === 'ar' ? logsAr : logsEn, () => {}, undefined, {
        label: lang === 'ar' ? 'عرض السجلات والتقارير' : 'View Full Logs & Reports',
        onClick: () => {
          setCurrentTab('logs');
          setIsExpanded(false);
        }
      });
      return;
    }

    // 5. Balance & Recharge query
    if (cleanInput.includes('balance') || cleanInput.includes('wallet') || cleanInput.includes('رصيد') || cleanInput.includes('محفظ') || cleanInput.includes('شحن')) {
      const responseAr = `رصيد محفظتك الحالي هو **${walletBalance.toLocaleString()} د.ع**.\n\nيمكنك شحن رصيدك بكل سهولة في أي وقت عبر إرسال حوالة زين كاش (Zain Cash) أو آسيا حوالة (AsiaHawala) وسيقوم النظام تلقائياً بتحديث رصيدك لتفعيل بوابات الإرسال.`;
      const responseEn = `Your current wallet balance is **${walletBalance.toLocaleString()} IQD**.\n\nTo recharge your wallet, you can make a transfer via Zain Cash or AsiaHawala at any time, and the system will automatically top up your account.`;

      streamResponse(lang === 'ar' ? responseAr : responseEn, () => {}, undefined, {
        label: lang === 'ar' ? 'شحن المحفظة الآن' : 'Recharge Wallet Now',
        onClick: () => {
          setCurrentTab('billing');
          setIsExpanded(false);
        }
      });
      return;
    }

    // 6. API key query
    if (cleanInput.includes('api') || cleanInput.includes('key') || cleanInput.includes('مفتاح') || cleanInput.includes('توكن') || cleanInput.includes('ربط')) {
      const responseAr = `لديك حالياً **${apiKeys.length} مفتاح API نشط**.\n\nمفتاحك الرئيسي يبدأ بـ \`${apiKeys[0]?.key ? apiKeys[0].key.substring(0, 10) : 'sm_live_...'}...\`.\n\nإليك كود الإرسال السريع لرسائل الواتساب والـ SMS عبر الـ API الخاص بنا:`;
      const responseEn = `You currently have **${apiKeys.length} active API key(s)**.\n\nYour primary key starts with \`${apiKeys[0]?.key ? apiKeys[0].key.substring(0, 10) : 'sm_live_...'}...\`.\n\nHere is a quick code sample to send a message using our API:`;

      const codeSample = `curl -X POST https://api.sumersend.com/v1/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "07701234567",
    "channel": "whatsapp",
    "body": "مرحباً من كود بوابة سومر سيند!"
  }'`;

      streamResponse(lang === 'ar' ? responseAr : responseEn, () => {}, codeSample, {
        label: lang === 'ar' ? 'إدارة مفاتيح الـ API' : 'Manage API Keys',
        onClick: () => {
          setCurrentTab('apikeys');
          setIsExpanded(false);
        }
      });
      return;
    }

    // 7. Campaign draft query
    if (cleanInput.includes('campaign') || cleanInput.includes('draft') || cleanInput.includes('حملة') || cleanInput.includes('قالب') || cleanInput.includes('رسالة')) {
      const responseAr = `بالتأكيد! قمت بصياغة مسودة حملة تفاعلية مناسبة لعملائك في العراق:\n\n*"عزيزنا المشترك، يسرنا إبلاغك بأن متجرنا أطلق مجموعة مميزة من الخدمات الجديدة المصممة خصيصاً لك. لمعرفة المزيد تواصل معنا."*`;
      const responseEn = `Sure! I have written a notification draft suitable for your users:\n\n*"Dear subscriber, we are pleased to inform you that our store has launched a new set of premium features designed just for you. Contact us for more details."*`;

      const textToUse = lang === 'ar'
        ? 'عزيزنا المشترك، يسرنا إبلاغك بأن متجرنا أطلق مجموعة مميزة من الخدمات الجديدة المصممة خصيصاً لك. لمعرفة المزيد تواصل معنا.'
        : 'Dear subscriber, we are pleased to inform you that our store has launched a new set of premium features designed just for you. Contact us for more details.';

      streamResponse(lang === 'ar' ? responseAr : responseEn, () => {}, undefined, {
        label: lang === 'ar' ? 'تطبيق في أداة الحملات' : 'Apply to Campaign Builder',
        onClick: () => {
          setMsgBody(textToUse);
          setPlaygroundChannel('whatsapp');
          setCurrentTab('campaigns');
          setIsExpanded(false);
        }
      });
      return;
    }

    const fallbackAr = `عذراً، لم أفهم استفسارك بشكل كامل. أنا مصمم للمساعدة في:\n- 💰 استعلام رصيد المحفظة والشحن\n- 🌐 التحقق من حالة النطاقات والويب هوكس المربوطة\n- 📊 تلخيص آخر السجلات والعمليات المنفذة\n- 💬 كتابة وتطبيق حملات الواتساب والـ SMS\n\nأو يمكنك سؤالي عن فلسفة العقول الحرة لمدونتك! 🧠`;
    const fallbackEn = `Sorry, I didn't fully catch that. I am optimized to help you with:\n- 💰 Checking wallet balance & recharge status\n- 🌐 Listing verified domains and active webhooks\n- 📊 Summarizing recent logs & transmissions\n- 💬 Drafting and applying WhatsApp or SMS campaigns\n\nOr ask me about the philosophy of free minds! 🧠`;

    streamResponse(lang === 'ar' ? fallbackAr : fallbackEn, () => {});
  };

  const getThinkingStepText = () => {
    if (thinkingStep === 1) return lang === 'ar' ? '🔍 يجري تحليل استفسار العقل الحر...' : '🔍 Analyzing free mind query...';
    if (thinkingStep === 2) return lang === 'ar' ? '🗃️ يجري طلب ومقارنة بيانات النظام...' : '🗃️ Querying and cross-checking system metrics...';
    if (thinkingStep === 3) return lang === 'ar' ? '✍️ يجري تنسيق وصياغة الرد النهائي...' : '✍️ Formulating final formatted response...';
    return '';
  };

  const quickActions = lang === 'ar' 
    ? [
        { label: '🧠 العقول الحرة؟', query: 'حدثني عن فلسفة العقول الحرة' },
        { label: '📊 آخر العمليات', query: 'أعطني ملخصاً لآخر العمليات ورسائل الإرسال' },
        { label: '🌐 نطاقاتي النشطة؟', query: 'ما هي حالة النطاقات المضافة؟' },
        { label: '💰 كم رصيدي؟', query: 'كم رصيد المحفظة حالياً؟' },
      ]
    : [
        { label: '🧠 Free Minds?', query: 'Tell me about the philosophy of free minds' },
        { label: '📊 Recent Operations', query: 'Give me a summary of recent delivery logs' },
        { label: '🌐 Active Domains?', query: 'What is the status of my verified domains?' },
        { label: '💰 Wallet Balance', query: 'What is my current wallet balance?' },
      ];

  const getProgressBarClass = () => {
    if (trialCount >= 17) return 'chat-trial-progress-fill danger';
    if (trialCount >= 12) return 'chat-trial-progress-fill warning';
    return 'chat-trial-progress-fill';
  };

  // Determine if paywall should be shown: false Pro tier, AND sent 20 trial messages
  const isPaywallBlocked = !isUnlocked && trialCount >= 20;

  // The main chat console layout component rendering
  const renderChatConsole = () => (
    <div className="chat-container">
      
      {/* 3. Lock Overlay Gating when isPaywallBlocked is True */}
      {isPaywallBlocked && (
        <div className="chat-lock-overlay">
          <div className="chat-lock-card">
            <div className="chat-lock-icon-container">
              <Lock size={20} />
            </div>
            <span className="chat-lock-badge">Pro Upgrade</span>
            <h3 className="chat-lock-title">
              {lang === 'ar' ? 'انتهت الفترة التجريبية' : 'Free Trial Ended'}
            </h3>
            <p className="chat-lock-desc">
              {lang === 'ar' 
                ? 'لقد استهلكت كامل رصيدك التجريبي المجاني (20 رسالة). يرجى الاشتراك بمبلغ 10,000 د.ع لمواصلة استخدام المساعد الذكي.'
                : 'You have used all of your 20 free trial messages. Please upgrade to the Pro plan to continue chatting.'}
            </p>
            
            <div className="chat-lock-features">
              <div className="chat-lock-feature-item">
                <Check size={12} />
                <span>{lang === 'ar' ? 'فحص الرصيد، النطاقات والويب هوكس حياً' : 'Live queries of wallet, domains & webhooks'}</span>
              </div>
              <div className="chat-lock-feature-item">
                <Check size={12} />
                <span>{lang === 'ar' ? 'صياغة ونقل حملات الإرسال بنقرة واحدة' : 'One-click campaign writing & templates'}</span>
              </div>
              <div className="chat-lock-feature-item">
                <Check size={12} />
                <span>{lang === 'ar' ? 'تحليل ورصد سجلات الإرسال الأخيرة' : 'Analyzing recent transmission histories'}</span>
              </div>
            </div>

            <div className="chat-lock-price">
              {lang === 'ar' ? '10,000 د.ع / شهرياً' : '10,000 IQD / month'}
            </div>

            <button 
              onClick={handleActivatePro}
              className="chat-lock-btn"
            >
              {lang === 'ar' ? 'تفعيل باقة المحترفين الآن' : 'Activate Pro Now'}
            </button>

            {activationError && (
              <div className="chat-lock-alert">
                <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{activationError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-title">
          <Sparkles size={14} className="shimmer" style={{ color: 'var(--success-color)' }} />
          <span style={{ fontFamily: lang === 'ar' ? 'var(--font-arabic)' : 'var(--font-family)', fontSize: '13px' }}>
            {lang === 'ar' ? 'مساعد سومر الذكي' : 'Sumer AI Assistant'}
          </span>
          <span className="chat-status-dot"></span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Relock Demo Icon button (available when trial has started or unlocked) */}
          {(isUnlocked || trialCount > 0) && (
            <button 
              onClick={handleRelockChat}
              title={lang === 'ar' ? 'تصفير وإعادة قفل الميزة (للتجربة)' : 'Reset trial & lock feature (for demo)'}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '4px',
                borderRadius: '6px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--panel-muted)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Unlock size={12} style={{ color: 'var(--success-color)' }} />
            </button>
          )}

          {/* Maximize / Minimize toggle */}
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? (lang === 'ar' ? 'تصغير' : 'Collapse') : (lang === 'ar' ? 'تكبير كامل الشاشة' : 'Expand Fullscreen')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--panel-muted)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>

          {/* Reset Chat */}
          <button 
            onClick={() => {
              if (isPaywallBlocked) return;
              setMessages(prev => [prev[0]]);
              setInputValue('');
              setStreamingText('');
              setIsThinking(false);
            }}
            title={lang === 'ar' ? 'مسح المحادثة' : 'Clear Chat'}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'background 0.2s',
              opacity: !isPaywallBlocked ? 1 : 0.4,
              cursor: !isPaywallBlocked ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => !isPaywallBlocked && (e.currentTarget.style.backgroundColor = 'var(--panel-muted)')}
            onMouseLeave={(e) => !isPaywallBlocked && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>

      {/* MessageScroller with Scroll-Fade */}
      <div 
        ref={scrollerRef}
        onScroll={handleScroll}
        className="chat-scroller scroll-fade"
      >
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message-row ${msg.sender}`}>
            <div className={`chat-avatar ${msg.sender === 'user' ? 'user' : 'ai'}`}>
              {msg.sender === 'user' ? 'U' : 'S'}
            </div>
            <div className="chat-message-content">
              <div className="chat-bubble">
                {renderMarkdown(msg.text, msg.sender === 'user')}

                {msg.code && (
                  <pre className="chat-codeblock">
                    <code>{msg.code}</code>
                  </pre>
                )}

                {msg.action && (
                  <button 
                    onClick={msg.action.onClick}
                    className="chat-bubble-action-btn"
                  >
                    {msg.action.label}
                    <ArrowRight size={11} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
                  </button>
                )}
              </div>
              <span className="chat-message-time">{msg.timestamp}</span>
            </div>
          </div>
        ))}

        {/* Streaming/Typing message */}
        {streamingText && (
          <div className="chat-message-row assistant">
            <div className="chat-avatar ai">S</div>
            <div className="chat-message-content">
              <div className="chat-bubble">
                {renderMarkdown(streamingText, false)}
              </div>
            </div>
          </div>
        )}

        {/* Sequential Thinking State */}
        {isThinking && (
          <div className="chat-message-row assistant">
            <div className="chat-avatar ai">S</div>
            <div className="chat-message-content">
              <div className="chat-bubble" style={{ padding: '10px 14px' }}>
                <span className="shimmer" style={{ fontSize: '12px', fontWeight: 600 }}>
                  {getThinkingStepText()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Badge */}
      {showScrollBadge && (
        <button 
          onClick={forceScrollToBottom}
          className="chat-scroll-bottom-badge"
        >
          <ArrowDown size={11} />
          <span>{lang === 'ar' ? 'نزول للأسفل' : 'Scroll down'}</span>
        </button>
      )}

      {/* Chat Input & Quick Actions */}
      <div className="chat-input-bar">
        
        {/* Trial Progress Bar */}
        {!isUnlocked && (
          <div className="chat-trial-container">
            <div className="chat-trial-text-group">
              <span>{lang === 'ar' ? 'الفترة التجريبية للمساعد' : 'AI Assistant Free Trial'}</span>
              <span>{lang === 'ar' ? `المتبقي: ${20 - trialCount} / 20 رسالة` : `${20 - trialCount} / 20 msgs remaining`}</span>
            </div>
            <div className="chat-trial-progress-bar">
              <div 
                className={getProgressBarClass()} 
                style={{ width: `${(trialCount / 20) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Quick Actions Slider */}
        {!isPaywallBlocked && !streamingText && !isThinking && (
          <div className="chat-quick-actions">
            {quickActions.map((act, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(act.query)}
                className="chat-quick-pill"
              >
                {act.label}
              </button>
            ))}
          </div>
        )}

        {/* Text Input Container */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="chat-input-container"
          style={{ opacity: !isPaywallBlocked ? 1 : 0.6 }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              isPaywallBlocked 
                ? (lang === 'ar' ? 'انتهت الفترة التجريبية - يرجى الاشتراك' : 'Free trial ended - upgrade to continue')
                : (lang === 'ar' ? 'اسأل مساعد سومر...' : 'Ask Sumer Assistant...')
            }
            disabled={isPaywallBlocked || isThinking || !!streamingText}
            className="chat-input-field"
          />
          <button
            type="submit"
            disabled={isPaywallBlocked || !inputValue.trim() || isThinking || !!streamingText}
            className="chat-send-btn"
          >
            <Send size={12} style={{ transform: lang === 'ar' ? 'rotate(180deg)' : 'none' }} />
          </button>
        </form>
      </div>

    </div>
  );

  return (
    <>
      {/* 1. Bento Card View (Inline) */}
      <div className="bento-card-chat">
        {renderChatConsole()}
      </div>

      {/* 2. Expanded overlay drawer / Modal */}
      {isExpanded && (
        <div className="chat-overlay-modal" onClick={() => setIsExpanded(false)}>
          <div className="chat-overlay-content" onClick={(e) => e.stopPropagation()}>
            {renderChatConsole()}
          </div>
        </div>
      )}
    </>
  );
};
