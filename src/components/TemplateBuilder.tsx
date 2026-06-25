import React, { useState, useEffect, useRef } from 'react';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Sparkles, 
  Settings, 
  Eye, 
  Code, 
  FileText, 
  Smartphone, 
  Monitor, 
  ArrowLeft, 
  HelpCircle, 
  AlertTriangle,
  Info,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  SeparatorHorizontal,
  BookOpen,
  Clock,
  Coins
} from 'lucide-react';
import type { TemplateItem, TemplateVariable } from '../data/templates';

interface TemplateBuilderProps {
  lang: 'en' | 'ar';
  template?: TemplateItem | null; // null if creating new
  initialCategory?: 'email' | 'sms' | 'whatsapp';
  onSave: (template: TemplateItem) => Promise<void>;
  onCancel: () => void;
}

export interface TemplateBlock {
  id: string;
  type: 'header' | 'text' | 'button' | 'image' | 'quote' | 'divider' | 'spacer' | 'footer';
  content: string;
  align?: 'center' | 'left' | 'right';
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  borderRadius?: number;
  url?: string;
  src?: string;
  alt?: string;
  height?: number; // for spacer
  title?: string; // for header
  subtitle?: string; // for header
  quoteAuthor?: string; // for quote
}

interface ColorPickerInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ColorPickerInput: React.FC<ColorPickerInputProps> = ({ label, value, onChange }) => {
  return (
    <div className="form-group" style={{ marginBottom: '12px' }}>
      <label>{label}</label>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          backgroundColor: value,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          flexShrink: 0
        }}>
          <input 
            type="color" 
            value={value.startsWith('#') && value.length === 7 ? value : '#ffffff'} 
            onChange={(e) => onChange(e.target.value)}
            style={{ 
              position: 'absolute',
              top: '-8px',
              left: '-8px',
              width: '44px',
              height: '44px',
              padding: 0,
              border: 'none',
              cursor: 'pointer',
              opacity: 0
            }}
          />
          <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: value,
            pointerEvents: 'none'
          }} />
        </div>
        <input 
          type="text" 
          value={value} 
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^#[0-9A-F]{0,6}$/i.test(val)) {
              onChange(val);
            }
          }}
          placeholder="#FFFFFF"
          maxLength={7}
          style={{ 
            fontFamily: 'monospace',
            fontSize: '12px',
            textTransform: 'uppercase'
          }}
        />
      </div>
    </div>
  );
};

// Preset options for template icon
const ICON_PRESETS = ['📝', '✉️', '📱', '🔔', '💬', '💡', '🔍', '📘', '🧠', '⚙️', '🔒', '🏆'];

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  lang,
  template,
  initialCategory = 'email',
  onSave,
  onCancel
}) => {
  const isAr = lang === 'ar';

  // Core Template States
  const [id, setId] = useState<string>(template?.id || '');
  const [nameAr, setNameAr] = useState(template?.nameAr || '');
  const [nameEn, setNameEn] = useState(template?.nameEn || '');
  const [descAr, setDescAr] = useState(template?.descAr || '');
  const [descEn, setDescEn] = useState(template?.descEn || '');
  const [subjectAr, setSubjectAr] = useState(template?.subjectAr || '');
  const [subjectEn, setSubjectEn] = useState(template?.subjectEn || '');
  const [category, setCategory] = useState<'email' | 'sms' | 'whatsapp'>(
    (template?.type as 'email' | 'sms' | 'whatsapp') || initialCategory
  );
  const [icon, setIcon] = useState(template?.icon || '📝');
  const [showIconPicker, setShowIconPicker] = useState(false);

  // Email Builder Specific States: Blocks list
  const [blocks, setBlocks] = useState<TemplateBlock[]>([]);
  
  // Text-based Builder States: SMS/WhatsApp body
  const [textBody, setTextBody] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertTag = (field: string) => {
    if (!textareaRef.current) {
      setTextBody(prev => prev + ` {{${field}}}`);
      return;
    }
    const textarea = textareaRef.current;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const currentText = textarea.value;
    const tagToInsert = `{{${field}}}`;
    const newText = currentText.substring(0, startPos) + tagToInsert + currentText.substring(endPos);
    setTextBody(newText);
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + tagToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Editor configuration states
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isRawHtmlMode, setIsRawHtmlMode] = useState(false);
  
  // Custom global styling states for the compiled Email
  const [canvasBg, setCanvasBg] = useState('#f4f4f5');
  const [containerBg, setContainerBg] = useState('#ffffff');
  const [containerWidth, setContainerWidth] = useState(600);
  const [primaryColor, setPrimaryColor] = useState('#09090b');
  const [globalTextColor, setGlobalTextColor] = useState('#333333');
  const [globalFont, setGlobalFont] = useState('Cairo');

  // AI assistant state
  const [aiTone, setAiTone] = useState<'philosophical' | 'psychological' | 'neuroscience' | 'persuasive' | 'standard'>('philosophical');
  const [aiBlockType, setAiBlockType] = useState<'intro' | 'quote' | 'cta' | 'body'>('intro');
  const [aiLanguage, setAiLanguage] = useState<'ar' | 'en'>(lang);
  const [aiResult, setAiResult] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Variables parsed from blocks/text
  const [variables, setVariables] = useState<TemplateVariable[]>([]);
  const [variablePreviewValues, setVariablePreviewValues] = useState<Record<string, string>>({});

  // Onboarding tour state
  const [tourStep, setTourStep] = useState<number | null>(null);

  // Drag and Drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  // Parse template variables dynamically
  useEffect(() => {
    let sourceText = '';
    if (category === 'email') {
      sourceText = blocks.map(b => `${b.content} ${b.title || ''} ${b.subtitle || ''} ${b.quoteAuthor || ''} ${b.url || ''}`).join(' ');
      sourceText += ` ${subjectAr} ${subjectEn}`;
    } else {
      sourceText = textBody;
    }

    // Extract double curly brackets variables: {{variable_name}}
    const regex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(sourceText)) !== null) {
      matches.add(match[1]);
    }

    const uniqueVars = Array.from(matches);
    const newVars: TemplateVariable[] = uniqueVars.map(v => {
      const existing = (template?.variables || []).find(ev => ev.key === v) || variables.find(ev => ev.key === v);
      return existing || {
        key: v,
        labelAr: v.replace(/_/g, ' '),
        labelEn: v.replace(/_/g, ' '),
        defaultValAr: `[${v}]`,
        defaultValEn: `[${v}]`
      };
    });

    setVariables(newVars);

    // Populate variable preview defaults while preserving custom values
    setVariablePreviewValues(prev => {
      const updated = { ...prev };
      newVars.forEach(v => {
        if (updated[v.key] === undefined) {
          updated[v.key] = lang === 'ar' ? (v.defaultValAr || `[${v.key}]`) : (v.defaultValEn || `[${v.key}]`);
        }
      });
      // Clean up deleted variables from preview values
      const keys = new Set(newVars.map(v => v.key));
      Object.keys(updated).forEach(k => {
        if (!keys.has(k)) {
          delete updated[k];
        }
      });
      return updated;
    });
  }, [blocks, textBody, category, subjectAr, subjectEn]);

  // Load existing template data on startup
  useEffect(() => {
    if (template) {
      setId(template.id);
      if (template.type === 'email' || (!template.type && template.subjectAr)) {
        setCategory('email');
        const parsedBlocks = tryParseHtmlToBlocks(template.body);
        setBlocks(parsedBlocks);
      } else {
        setCategory((template.type as any) || 'sms');
        setTextBody(template.body);
      }
    } else {
      // Default initial email blocks for new email templates
      const initialBlocks: TemplateBlock[] = [
        {
          id: 'b_header',
          type: 'header',
          title: isAr ? 'عنوان القالب الإبداعي' : 'Creative Digest Title',
          subtitle: isAr ? 'تحليلات عميقة في الفلسفة وعلم النفس' : 'Deep essays on philosophy & behavior',
          content: isAr ? 'اسم الكاتب' : 'Jasim Kareem',
          align: 'center',
          backgroundColor: '#09090b',
          color: '#ffffff',
          padding: '24px'
        },
        {
          id: 'b_text_1',
          type: 'text',
          content: isAr 
            ? 'مرحباً بك {{reader_name}}، هنا نكتب للذين لا يكتفون بالظواهر بل يبحثون في أعماق النفس البشرية مستلهمين من فلسفة نيتشه وعلم نفس كارل يونغ.' 
            : 'Welcome {{reader_name}}, we write for those who are unsatisfied with the surface, digging deeper into human behavior inspired by Nietzsche and Carl Jung.',
          fontSize: 14,
          align: isAr ? 'right' : 'left',
          padding: '16px'
        },
        {
          id: 'b_quote',
          type: 'quote',
          content: isAr 
            ? 'من ينظر إلى الخارج يحلم، ومن ينظر إلى الداخل يستيقظ.' 
            : 'Who looks outside, dreams; who looks inside, awakes.',
          quoteAuthor: isAr ? 'كارل غوستاف يونغ' : 'Carl G. Jung',
          padding: '16px 20px',
          color: '#09090b'
        },
        {
          id: 'b_btn',
          type: 'button',
          content: isAr ? 'تصفح المقالات الكاملة' : 'Read Full Essays',
          url: 'https://prudctual.substack.com/',
          backgroundColor: '#09090b',
          color: '#ffffff',
          borderRadius: 6,
          align: 'center',
          padding: '12px 28px'
        },
        {
          id: 'b_footer',
          type: 'footer',
          content: isAr 
            ? 'تصلك هذه الرسالة لأنك اشتركت في مجتمعنا الحر.' 
            : 'You receive this message because you subscribed to our community.',
          align: 'center',
          padding: '20px'
        }
      ];
      setBlocks(initialBlocks);
      setTextBody(isAr ? 'مرحباً بك {{reader_name}} في منصتنا الرقمية. كود التحقق الخاص بك هو {{otp_code}} وهو صالح لمدة 5 دقائق.' : 'Hello {{reader_name}}, your verification code is {{otp_code}}. It expires in 5 minutes.');
    }
  }, [template]);

  // Fallback parser to reconstruct blocks from our rendered HTML comment tags or rebuild from simple blocks
  const tryParseHtmlToBlocks = (htmlStr: string): TemplateBlock[] => {
    // If we embedded the blocks metadata as a JSON comment inside the HTML, extract it!
    const metaMatch = htmlStr.match(/<!-- SUMERSEND_METADATA_START([\s\S]*?)SUMERSEND_METADATA_END -->/);
    if (metaMatch) {
      try {
        const data = JSON.parse(metaMatch[1].trim());
        if (Array.isArray(data.blocks)) {
          // Recover canvas configuration if present
          if (data.canvasBg) setCanvasBg(data.canvasBg);
          if (data.containerBg) setContainerBg(data.containerBg);
          if (data.containerWidth) setContainerWidth(data.containerWidth);
          if (data.primaryColor) setPrimaryColor(data.primaryColor);
          if (data.globalTextColor) setGlobalTextColor(data.globalTextColor);
          if (data.globalFont) setGlobalFont(data.globalFont);
          return data.blocks;
        }
      } catch (e) {
        console.warn('Failed to parse embedded template blocks metadata:', e);
      }
    }

    // Fallback to generating a simple text block with the HTML body if it cannot be parsed structurally
    return [
      {
        id: 'block_imported',
        type: 'text',
        content: htmlStr,
        fontSize: 14,
        align: 'left',
        padding: '15px'
      }
    ];
  };

  // Compile visual blocks into clean, standard inline-styled HTML
  const compileBlocksToHTML = (blockArray: TemplateBlock[]): string => {
    const isRtl = lang === 'ar';
    const direction = isRtl ? 'rtl' : 'ltr';

    const renderedBlocks = blockArray.map(block => {
      const align = block.align || (isRtl ? 'right' : 'left');
      const fontSize = block.fontSize ? `${block.fontSize}px` : '14px';
      const color = block.color || globalTextColor;
      const blockBg = block.backgroundColor ? `background-color: ${block.backgroundColor};` : '';
      const pad = block.padding || '15px';
      const rad = block.borderRadius ? `${block.borderRadius}px` : '0px';

      switch (block.type) {
        case 'header':
          return `
            <div style="background-color: ${block.backgroundColor || primaryColor}; padding: ${pad}; text-align: ${align}; color: ${block.color || '#ffffff'}; border-bottom: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6); display: block; margin-bottom: 8px;">${block.content || ''}</span>
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; line-height: 1.3;">${block.title || ''}</h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: rgba(255,255,255,0.7); font-weight: 400;">${block.subtitle || ''}</p>
            </div>
          `;

        case 'text':
          return `
            <div style="padding: ${pad}; text-align: ${align}; color: ${color}; font-size: ${fontSize}; line-height: 1.8; ${blockBg}">
              ${block.content.replace(/\n/g, '<br/>')}
            </div>
          `;

        case 'button':
          const btnAlign = block.align || 'center';
          return `
            <div style="padding: ${pad}; text-align: ${btnAlign}; ${blockBg}">
              <a href="${block.url || '#'}" target="_blank" style="display: inline-block; background-color: ${block.backgroundColor || primaryColor}; color: ${block.color || '#ffffff'}; padding: 12px 28px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: ${rad}; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.2s;">
                ${block.content}
              </a>
            </div>
          `;

        case 'image':
          return `
            <div style="padding: ${pad}; text-align: ${align}; ${blockBg}">
              <img src="${block.src || 'https://via.placeholder.com/600x250?text=Sumer+Send+Image'}" alt="${block.alt || 'Template Image'}" style="max-width: 100%; height: auto; border-radius: ${rad}; display: block; margin: ${align === 'center' ? '0 auto' : '0'};" />
            </div>
          `;

        case 'quote':
          const borderStyle = isRtl ? `border-right: 3px solid ${primaryColor};` : `border-left: 3px solid ${primaryColor};`;
          return `
            <div style="padding: ${pad}; ${blockBg}">
              <div style="${borderStyle} padding: 5px 15px; margin: 10px 0; color: ${color}; font-style: italic; text-align: ${align};">
                <p style="margin: 0; font-size: 15px; line-height: 1.6; font-weight: 500;">"${block.content}"</p>
                ${block.quoteAuthor ? `<span style="font-size: 12px; color: #666666; display: block; margin-top: 6px;">— ${block.quoteAuthor}</span>` : ''}
              </div>
            </div>
          `;

        case 'divider':
          return `
            <div style="padding: ${pad}; ${blockBg}">
              <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 0;" />
            </div>
          `;

        case 'spacer':
          return `
            <div style="height: ${block.height || 20}px; ${blockBg}"></div>
          `;

        case 'footer':
          return `
            <div style="background-color: ${block.backgroundColor || '#f4f4f5'}; padding: ${pad}; text-align: ${align}; font-size: 12px; color: #71717a; border-top: 1px solid #eaeaea; line-height: 1.6;">
              <p style="margin: 0 0 8px 0;">${block.content}</p>
              <p style="margin: 0;">© 2026 Sumer Send. All rights reserved.</p>
              <a href="https://prudctual.substack.com/" style="color: #2563eb; text-decoration: none; display: inline-block; margin-top: 8px;">Unsubscribe | إدارة الاشتراك</a>
            </div>
          `;

        default:
          return '';
      }
    }).join('\n');

    // Build standard, email-compliant layout wrapping
    const bodyHtml = `
      <div style="font-family: '${globalFont}', 'Cairo', 'Inter', sans-serif, system-ui; background-color: ${canvasBg}; padding: 30px 10px; min-height: 100%; direction: ${direction};">
        <div style="max-width: ${containerWidth}px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; background-color: ${containerBg}; box-shadow: 0 4px 20px rgba(0,0,0,0.03);">
          ${renderedBlocks}
        </div>
      </div>
    `;

    // Embed structure metadata as JSON comment at the end of the HTML for future roundtrip editing!
    const metadata = {
      blocks: blockArray,
      canvasBg,
      containerBg,
      containerWidth,
      primaryColor,
      globalTextColor,
      globalFont
    };
    const metadataComment = `\n<!-- SUMERSEND_METADATA_START\n${JSON.stringify(metadata, null, 2)}\nSUMERSEND_METADATA_END -->`;

    return bodyHtml + metadataComment;
  };

  // Compile preview body with filled variable preview values
  const getCompiledBody = () => {
    let result = '';
    if (category === 'email') {
      result = compileBlocksToHTML(blocks);
    } else {
      result = textBody;
    }

    // Replace dynamic variables with user-input preview values or fallback to default value / placeholder
    variables.forEach(v => {
      const placeholder = `{{${v.key}}}`;
      const val = variablePreviewValues[v.key];
      const defaultVal = lang === 'ar' ? v.defaultValAr : v.defaultValEn;
      const finalVal = (val !== undefined && val !== '') 
        ? val 
        : ((defaultVal !== undefined && defaultVal !== '') ? defaultVal : `{{${v.key}}}`);
      result = result.replaceAll(placeholder, finalVal);
    });

    return result;
  };

  // Add block to canvas helper
  const handleAddBlock = (type: TemplateBlock['type']) => {
    const newId = `block_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    let newBlock: TemplateBlock;

    switch (type) {
      case 'header':
        newBlock = {
          id: newId,
          type: 'header',
          title: isAr ? 'عنوان الفصل الجديد' : 'New Analytical Title',
          subtitle: isAr ? 'تحليلات وتأملات فلسفية' : 'Reflections & philosophical studies',
          content: isAr ? 'اسم الناشر' : 'Jasim Kareem',
          backgroundColor: '#09090b',
          color: '#ffffff',
          align: 'center',
          padding: '24px'
        };
        break;
      case 'text':
        newBlock = {
          id: newId,
          type: 'text',
          content: isAr 
            ? 'اكتب هنا فقرتك النفسية أو الفلسفية العميقة. يمكنك تضمين متغيرات مثل {{variable_name}} لإضفاء لمسة تخصيص مميزة لكل مشترك.' 
            : 'Write your psychological insight or deep philosophical concept here. Include dynamic fields like {{variable_name}} to personalize this block.',
          fontSize: 14,
          align: isAr ? 'right' : 'left',
          padding: '16px'
        };
        break;
      case 'button':
        newBlock = {
          id: newId,
          type: 'button',
          content: isAr ? 'اقرأ المقال بالكامل' : 'Read Full Essay',
          url: 'https://prudctual.substack.com/',
          backgroundColor: '#09090b',
          color: '#ffffff',
          borderRadius: 6,
          align: 'center',
          padding: '12px 28px'
        };
        break;
      case 'image':
        newBlock = {
          id: newId,
          type: 'image',
          content: '',
          src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
          alt: 'Meditation & Calmness',
          align: 'center',
          borderRadius: 8,
          padding: '15px'
        };
        break;
      case 'quote':
        newBlock = {
          id: newId,
          type: 'quote',
          content: isAr 
            ? 'الفيلسوف يبحث عن الضوء في زوايا النفس المظلمة.' 
            : 'The philosopher searches for light in the darkest corners of the psyche.',
          quoteAuthor: isAr ? 'فريدريك نيتشه' : 'Friedrich Nietzsche',
          padding: '16px 20px',
          color: '#09090b'
        };
        break;
      case 'divider':
        newBlock = {
          id: newId,
          type: 'divider',
          content: '',
          padding: '15px'
        };
        break;
      case 'spacer':
        newBlock = {
          id: newId,
          type: 'spacer',
          content: '',
          height: 30
        };
        break;
      case 'footer':
        newBlock = {
          id: newId,
          type: 'footer',
          content: isAr 
            ? 'تصلك هذه الرسالة لأنك اشتركت في مجتمع مقالات للعقول الحرة.' 
            : 'You receive this message because you are subscribed to Articles for Free Minds.',
          align: 'center',
          padding: '20px'
        };
        break;
    }

    setBlocks(prev => {
      const selectedIdx = prev.findIndex(b => b.id === selectedBlockId);
      if (selectedIdx !== -1) {
        const updated = [...prev];
        updated.splice(selectedIdx + 1, 0, newBlock);
        return updated;
      }
      return [...prev, newBlock];
    });
    setSelectedBlockId(newId);
  };

  // Reorder elements
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    const list = [...blocks];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;
    setBlocks(list);
  };

  // Duplicate Block
  const duplicateBlock = (index: number) => {
    const list = [...blocks];
    const source = list[index];
    const copy: TemplateBlock = {
      ...source,
      id: `block_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    list.splice(index + 1, 0, copy);
    setBlocks(list);
    setSelectedBlockId(copy.id);
  };

  // Delete Block
  const deleteBlock = (idToDelete: string) => {
    setBlocks(prev => prev.filter(b => b.id !== idToDelete));
    if (selectedBlockId === idToDelete) {
      setSelectedBlockId(null);
    }
  };

  // Drag and Drop implementation
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...blocks];
    const item = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, item);
    setDraggedIndex(index);
    setBlocks(list);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Smart AI Generation Copywriter Logic
  const handleGenerateAiText = () => {
    setIsGeneratingAi(true);

    // Realistic simulation generating excellent analytical philosophical/psychological contents
    setTimeout(() => {
      let text = '';
      if (aiLanguage === 'ar') {
        if (aiTone === 'philosophical') {
          if (aiBlockType === 'intro') {
            text = 'لنتأمل سوياً في فلسفة التغلب على الذات عند فريدريك نيتشه. العقل البشري ليس وعاءً للمعلومات، بل هو قوة إرادة نشطة تسعى للتجاوز المستمر والتطوير الدائم.';
          } else if (aiBlockType === 'quote') {
            text = 'المعاناة ليست عائقاً أمام الحياة؛ بل هي الشرط الأساسي لولادة القوة وعظمة الروح الإنسانية في مواجهة العدم.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'خض مغامرة التفكير الحر واقرأ المقال الكامل الآن';
          } else {
            text = 'إن الفكر الفلسفي لا يقدم لنا إجابات جاهزة، بل يمنحنا أدوات تفكيك المفاهيم السائدة. عندما ننظر إلى أعمال دوستويفسكي، نكتشف كيف أن صراعات الإنسان الداخلية هي المسرح الحقيقي الذي تنبثق منه خياراتنا الوجودية والأخلاقية الكبرى.';
          }
        } else if (aiTone === 'psychological') {
          if (aiBlockType === 'intro') {
            text = 'في رحلتنا لاكتشاف خفايا العقل الباطن، نجد أن كارل يونغ قد رسم لنا خريطة واضحة. الدمج النفسي وتصالح الإنسان مع ظله الذاتي (The Shadow) هما البوابة الوحيدة للشفاء والكلية الذاتية.';
          } else if (aiBlockType === 'quote') {
            text = 'من لا يدرك الصراع في داخله، سيواجهه في الخارج على أنه قدر مكتوب.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'ابدأ رحلة استكشاف النفس وتفقد المقال كاملاً';
          } else {
            text = 'إن النفس البشرية تبحث دوماً عن معنى لتكامل أجزائها. العقد النفسية التي تتشكل في الطفولة تؤثر على خياراتنا المهنية والعاطفية بطريقة خفية. من خلال سبر أغوار اللاوعي الجمعي وفهم الرموز البدئية، نستطيع أخيراً كسر الأنماط المتكررة وعيش حياة أكثر وعياً.';
          }
        } else if (aiTone === 'neuroscience') {
          if (aiBlockType === 'intro') {
            text = 'كيف تصنع الناقلات العصبية مثل الدوبامين والسيروتونين إدراكنا اليومي؟ العلم الحديث يتقاطع مع علم النفس الفلسفي ليكشف أسرار كيميائنا الداخلية.';
          } else if (aiBlockType === 'quote') {
            text = 'العقل والدماغ وجهان لعملة واحدة؛ الأول يمثل الوعي والأخير يمثل الآلة التي تعزف لحنه.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'اكتشف العلوم العصبية للسلوك الإنساني';
          } else {
            text = 'تؤثر اللدونة العصبية (Neuroplasticity) بشكل مباشر على قدرتنا على التكيف والتعلم. عندما نتبنى عادات جديدة، فإننا نعيد حرفياً تشكيل المسارات التشابكية في أدمغتنا. هذا الترابط الكيميائي والكهربائي يوضح كيف أن السلوك ليس ثابتاً بل هو عملية مرنة يمكن قيادتها بالوعي والتكرار.';
          }
        } else {
          // Standard / Persuasive
          text = 'يسعدنا جداً انضمامك إلينا اليوم. يسعدنا تقديم نشرتنا البريدية الشاملة التي تركز على المواضيع التحليلية العميقة التي تهمك لتوسيع الآفاق الفكرية.';
        }
      } else {
        // English
        if (aiTone === 'philosophical') {
          if (aiBlockType === 'intro') {
            text = 'Let us examine Nietzsche\'s philosophy of self-overcoming. The human mind is not a passive collector of facts, but a dynamic will that seeks to transcend its limits and grow.';
          } else if (aiBlockType === 'quote') {
            text = 'What does not kill me, makes me stronger. Out of life\'s school of war, I forge my power.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'Uncover Deep Philosophical Essays Now';
          } else {
            text = 'Existential inquiry does not provide easy answers; instead, it dismantles our conventional illusions. By studying Dostoyevsky, we learn that the internal struggle of the soul is the real theater of moral and psychological growth.';
          }
        } else if (aiTone === 'psychological') {
          if (aiBlockType === 'intro') {
            text = 'In our quest to understand the unconscious mind, Carl Jung offers an invaluable compass. Integrating our shadow is the only true pathway to psychological wholeness.';
          } else if (aiBlockType === 'quote') {
            text = 'Until you make the unconscious conscious, it will direct your life and you will call it fate.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'Explore Psychological Individuation Now';
          } else {
            text = 'Complexes formed during developmental stages silently dictate our daily choices. Only by uncovering archetypal patterns and engaging in shadow work can we hope to live an authentic, self-determined life.';
          }
        } else if (aiTone === 'neuroscience') {
          if (aiBlockType === 'intro') {
            text = 'How do neurotransmitters like dopamine and serotonin shape our daily cognitive perception? Modern science bridges with psychology to reveal our internal chemical coding.';
          } else if (aiBlockType === 'quote') {
            text = 'The brain is the hardware, but the mind is the software playing the complex music of consciousness.';
            setAiResult(text);
            setIsGeneratingAi(false);
            return;
          } else if (aiBlockType === 'cta') {
            text = 'Read The Neurobiology of Behavior';
          } else {
            text = 'Neuroplasticity proves that the adult brain is not statically wired. By consciously practicing new behaviors, we literally prune old synaptic networks and construct fresh neural pathways, reinforcing growth.';
          }
        } else {
          text = 'We are absolutely thrilled to welcome you to our digital space. Enjoy our curated analytical updates designed to expand your cognitive horizons.';
        }
      }

      setAiResult(text);
      setIsGeneratingAi(false);
    }, 800);
  };

  // Apply AI Generated Text to selected block or main text body
  const handleApplyAiText = () => {
    if (!aiResult) return;
    if (category === 'email') {
      if (selectedBlockId) {
        setBlocks(prev => prev.map(b => {
          if (b.id === selectedBlockId) {
            return { ...b, content: aiResult };
          }
          return b;
        }));
      } else {
        // Append new text block with generated AI content
        const newId = `block_${Date.now()}`;
        setBlocks(prev => [...prev, {
          id: newId,
          type: 'text',
          content: aiResult,
          fontSize: 14,
          align: aiLanguage === 'ar' ? 'right' : 'left',
          padding: '16px'
        }]);
        setSelectedBlockId(newId);
      }
    } else {
      // For SMS/WA, append to main text body
      setTextBody(prev => {
        const spacer = prev ? '\n\n' : '';
        return prev + spacer + aiResult;
      });
    }
    setAiResult('');
  };

  // Compile final template and save
  const handleSave = async () => {
    if (isAr) {
      if (!nameAr.trim()) {
        alert('يرجى إدخال اسم القالب باللغة العربية');
        return;
      }
    } else {
      if (!nameEn.trim()) {
        alert('Please enter template name in English');
        return;
      }
    }

    setIsSavingInProgress(true);
    
    // Auto-fill alternate language fields if empty
    const finalNameAr = nameAr.trim() || nameEn.trim() || 'قالب مخصص';
    const finalNameEn = nameEn.trim() || nameAr.trim() || 'Custom Template';
    const finalDescAr = descAr.trim() || descEn.trim() || '';
    const finalDescEn = descEn.trim() || descAr.trim() || '';

    const compiledBody = category === 'email' ? compileBlocksToHTML(blocks) : textBody;

    const payload: TemplateItem = {
      id: id || undefined as any, // backend generates new ID if undefined
      nameAr: finalNameAr,
      nameEn: finalNameEn,
      descAr: finalDescAr,
      descEn: finalDescEn,
      subjectAr: category === 'email' ? (subjectAr || 'تنبيه جديد') : undefined,
      subjectEn: category === 'email' ? (subjectEn || 'New Alert') : undefined,
      body: compiledBody,
      icon,
      variables,
      type: category
    };

    try {
      await onSave(payload);
    } catch (e) {
      console.error(e);
      alert(isAr ? 'حدث خطأ أثناء حفظ القالب. تأكد من تشغيل السيرفر.' : 'Failed to save template. Make sure server is running.');
    } finally {
      setIsSavingInProgress(false);
    }
  };

  // --- Calculated Layout Analytics Calculations ---
  
  // 1. HTML Size
  const computedHtml = category === 'email' ? compileBlocksToHTML(blocks) : '';
  const htmlSizeBytes = new Blob([computedHtml]).size;
  const isHtmlClipped = htmlSizeBytes > 102 * 1024; // 102KB Gmail clipping limit

  // 2. Readability & Reading Time
  const fullText = category === 'email' 
    ? blocks.map(b => b.content + ' ' + (b.title || '')).join(' ') 
    : textBody;
  const wordCount = fullText.trim().split(/\s+/).filter(Boolean).length;
  const estReadingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  const getReadabilityScore = () => {
    if (wordCount < 10) return isAr ? 'بسيط جداً' : 'Very Simple';
    const sentences = fullText.split(/[.؟?!\n]/).filter(Boolean).length || 1;
    const avgSentenceLength = wordCount / sentences;
    
    if (avgSentenceLength < 8) return isAr ? 'سهل الفهم' : 'Easy';
    if (avgSentenceLength < 16) return isAr ? 'متوسط الصعوبة' : 'Intermediate';
    return isAr ? 'أكاديمي/عميق' : 'Analytical/Deep';
  };

  // 3. Spam Analyzer
  const getSpamScoreResult = () => {
    const spamWords = ['free', 'money', 'claim', 'guarantee', '100%', 'cash', 'gift', 'win', 'earn', 'مجاناً', 'أرباح', 'ضمان', 'هدية', 'اربح', 'كاش', 'عاجل', 'دولار'];
    const detected: string[] = [];
    const lowerBody = fullText.toLowerCase();
    const lowerSubject = category === 'email' ? (subjectAr + ' ' + subjectEn).toLowerCase() : '';

    spamWords.forEach(word => {
      if (lowerBody.includes(word) || lowerSubject.includes(word)) {
        detected.push(word);
      }
    });

    if (detected.length === 0) return { score: 99, rating: isAr ? 'آمن وموثوق' : 'Clean & Safe', color: 'var(--success-color)' };
    if (detected.length < 3) return { score: 80, rating: isAr ? 'مقبول (تجنب التكرار)' : 'Acceptable', color: '#f59e0b', detected };
    return { score: 55, rating: isAr ? 'خطر الرسائل المزعجة (Spam)' : 'Spam Alert Warning', color: 'var(--danger-color)', detected };
  };

  const spamDetails = getSpamScoreResult();

  // 4. SMS Parts calculations
  const getSmsPartsDetails = () => {
    const isArabicSms = /[\u0600-\u06FF]/.test(textBody);
    const charCount = textBody.length;
    let limitFirstPart = 160;
    let limitMultiPart = 153;

    if (isArabicSms) {
      limitFirstPart = 70;
      limitMultiPart = 67;
    }

    let parts = 1;
    if (charCount > limitFirstPart) {
      parts = Math.ceil(charCount / limitMultiPart);
    }

    return {
      encoding: isArabicSms ? 'Unicode (Arabic)' : 'GSM-7 (English)',
      charCount,
      parts,
      costEstimate: parts * (category === 'sms' ? 120 : 150)
    };
  };

  const smsParts = getSmsPartsDetails();

  // Onboarding Tour Steps Configuration
  const tourSteps = [
    {
      titleEn: 'Components Palette',
      titleAr: 'قائمة العناصر',
      textEn: 'Use this panel to add structural layout blocks: headers, text paragraphs, quotes, dividers, images, or CTA buttons to your email canvas.',
      textAr: 'استخدم هذه اللوحة لإضافة عناصر الهيكل الأساسية: ترويسة، فقرات نصية، اقتباسات، فواصل، أو أزرار تفاعلية إلى ساحة عمل البريد الإلكتروني.'
    },
    {
      titleEn: 'Canvas Editor Workspace',
      titleAr: 'ساحة العمل التفاعلية',
      textEn: 'Hover over blocks here to duplicate, delete, reorder by dragging, or click to inspect and style. Double click text to edit inline.',
      textAr: 'مرر الماوس فوق العناصر هنا لتكرارها، حذفها، إعادة ترتيبها بالسحب والإفلات، أو انقر عليها لتعديل تنسيقها وألوانها.'
    },
    {
      titleEn: 'Property Inspector',
      titleAr: 'مفتش الخصائص والتنسيق',
      textEn: 'Customize font sizes, background colors, custom margins, alignments, and button links for the selected block row.',
      textAr: 'هنا يمكنك تخصيص أحجام الخطوط، ألوان الخلفيات، الحواف الإضافية، المحاذاة، وروابط الأزرار الفعالة للعنصر المحدد.'
    },
    {
      titleEn: 'Smart AI Copywriter',
      titleAr: 'مساعد الكتابة الذكي',
      textEn: 'Simulate philosophical content generations in Arabic & English. Generate ideas, quotes, or optimize copy instantly.',
      textAr: 'يقوم بمحاكاة توليد المقالات العميقة في الفلسفة وعلم النفس لمساعدتك في كتابة نصوص النشرات البريدية بضغطة زر.'
    },
    {
      titleEn: 'Calculated Layout Analytics',
      titleAr: 'التحليلات والمقاييس المحسوبة',
      textEn: 'Review the technical footprint: estimated file size (HTML), spam trigger keywords, reading times, and SMS message segmentation metrics.',
      textAr: 'يفحص الأبعاد البرمجية للمظاريف: حجم الكود النهائي، الكلمات المزعجة، متوسط مدة القراءة، وأقسام رسائل الهاتف.'
    }
  ];

  const handleNextTourStep = () => {
    if (tourStep === null) return;
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(null); // Finish
    }
  };

  const renderOnboardingOverlay = () => {
    if (tourStep === null) return null;
    const step = tourSteps[tourStep];

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cairo', 'Inter', sans-serif"
      }}>
        <div className="card" style={{
          maxWidth: '450px',
          width: '90%',
          padding: '24px',
          backgroundColor: 'var(--panel-bg)',
          borderRadius: '12px',
          border: '1.5px solid var(--border-color)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          direction: isAr ? 'rtl' : 'ltr',
          textAlign: isAr ? 'right' : 'left',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-color)', letterSpacing: '1px' }}>
              {isAr ? `خطوة المساعدة ${tourStep + 1} من ${tourSteps.length}` : `Step ${tourStep + 1} of ${tourSteps.length}`}
            </span>
            <button 
              onClick={() => setTourStep(null)} 
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px' }}
            >
              ✕
            </button>
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
            {isAr ? step.titleAr : step.titleEn}
          </h3>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px 0' }}>
            {isAr ? step.textAr : step.textEn}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setTourStep(null)} 
              className="btn"
              style={{ fontSize: '13px', padding: '6px 12px' }}
            >
              {isAr ? 'إنهاء الجولة' : 'Skip Tour'}
            </button>
            
            <button 
              onClick={handleNextTourStep} 
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{tourStep === tourSteps.length - 1 ? (isAr ? 'حسناً، فهمت' : 'Finish') : (isAr ? 'التالي' : 'Next Step')}</span>
              {tourStep !== tourSteps.length - 1 && <span>➔</span>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StylesInjector = () => (
    <style>{`
      @keyframes scaleUp {
        from { transform: scale(0.96); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      .canvas-block-wrapper {
        border: 1px dashed transparent;
        transition: all 0.2s ease-in-out;
        position: relative;
        cursor: pointer;
      }
      .canvas-block-wrapper:hover {
        border: 1px dashed var(--accent-color);
        background-color: rgba(var(--accent-rgb), 0.01);
      }
      .canvas-block-wrapper.selected {
        border: 1px solid var(--accent-color) !important;
        background-color: rgba(var(--accent-rgb), 0.02) !important;
      }
      .block-controls-overlay {
        display: none;
        position: absolute;
        top: -12px;
        right: 10px;
        background-color: var(--panel-bg);
        border: 1.5px solid var(--border-color);
        border-radius: 6px;
        padding: 2px 4px;
        gap: 2px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        z-index: 10;
        animation: scaleUp 0.15s ease;
      }
      .canvas-block-wrapper:hover .block-controls-overlay {
        display: flex;
      }
      .canvas-block-wrapper.selected .block-controls-overlay {
        display: flex;
        border-color: var(--accent-color);
      }
      .control-btn {
        background: none;
        border: none;
        padding: 4px;
        border-radius: 4px;
        cursor: pointer;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .control-btn:hover {
        color: var(--text-primary);
        background-color: var(--bg-color);
      }
      .control-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .control-btn.danger-btn:hover {
        color: var(--danger-color);
        background-color: var(--danger-bg);
      }
      .palette-item {
        border: 1.5px solid var(--border-color);
        background-color: var(--panel-bg);
        cursor: grab;
      }
      .palette-item:hover {
        border-color: var(--accent-color);
        background-color: rgba(var(--accent-rgb), 0.02);
      }
      .builder-sidebar-form .form-group {
        margin-bottom: 12px;
      }
      .builder-sidebar-form label {
        display: block;
        font-size: 10px;
        font-weight: 700;
        color: var(--text-secondary);
        margin-bottom: 4px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .builder-sidebar-form input,
      .builder-sidebar-form textarea,
      .builder-sidebar-form select {
        width: 100%;
        padding: 6px 10px !important;
        font-size: 12px !important;
        border-radius: 6px !important;
        border: 1px solid var(--border-color) !important;
        background-color: var(--panel-bg) !important;
        color: var(--text-primary) !important;
      }
      .builder-sidebar-form input:focus,
      .builder-sidebar-form textarea:focus,
      .builder-sidebar-form select:focus {
        border-color: var(--accent-color) !important;
        outline: none !important;
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1) !important;
      }
      .tb-input-group {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--panel-bg);
        padding: 0 12px;
        height: 38px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      .tb-input-group:hover {
        border-color: var(--border-hover, #d1d5db);
      }
      .tb-input-group:focus-within {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
      }
      .tb-input-field {
        border: none !important;
        background: none !important;
        outline: none !important;
        font-size: 13px !important;
        font-weight: 600 !important;
        color: var(--text-primary) !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 100% !important;
        width: 180px;
      }
      .tb-desc-group {
        display: flex;
        align-items: center;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background-color: var(--panel-bg);
        padding: 0 12px;
        height: 38px;
        width: 260px;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      .tb-desc-group:hover {
        border-color: var(--border-hover, #d1d5db);
      }
      .tb-desc-group:focus-within {
        border-color: var(--accent-color);
        box-shadow: 0 0 0 2px rgba(var(--accent-rgb), 0.1);
      }
      .tb-desc-field {
        border: none !important;
        background: none !important;
        outline: none !important;
        font-size: 12px !important;
        color: var(--text-secondary) !important;
        padding: 0 !important;
        margin: 0 !important;
        height: 100% !important;
        width: 100%;
      }
      .tb-emoji-trigger {
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;
        user-select: none;
      }
      .tb-emoji-trigger:hover {
        background-color: var(--panel-muted);
      }
    `}</style>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', animation: 'scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}>
      <StylesInjector />
      {renderOnboardingOverlay()}

      {/* 1. Header Toolbar Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid var(--border-color)', 
        paddingBottom: '15px', 
        marginBottom: '15px', 
        flexWrap: 'wrap', 
        gap: '12px',
        direction: isAr ? 'rtl' : 'ltr'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={onCancel} 
            className="btn" 
            style={{ 
              width: '38px', 
              height: '38px', 
              borderRadius: '50%', 
              padding: 0, 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0
            }}
            title={isAr ? 'رجوع' : 'Back'}
          >
            <ArrowLeft size={16} style={{ transform: isAr ? 'rotate(180deg)' : 'none' }} />
          </button>
          
          {/* Vertical Separator Line */}
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border-color)', flexShrink: 0 }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="tb-input-group">
              {/* Emoji Icon Picker */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span 
                  onClick={() => setShowIconPicker(prev => !prev)}
                  className="tb-emoji-trigger"
                  title={isAr ? 'تغيير الأيقونة التعبيرية' : 'Change emoji icon'}
                >
                  {icon}
                </span>

                {showIconPicker && (
                  <>
                    <div 
                      onClick={() => setShowIconPicker(false)}
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: isAr ? 'auto' : '0',
                      right: isAr ? '0' : 'auto',
                      marginTop: '6px',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--panel-bg)',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      zIndex: 1001,
                      width: '150px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '6px'
                    }}>
                      {ICON_PRESETS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setIcon(emoji);
                            setShowIconPicker(false);
                          }}
                          style={{
                            fontSize: '16px',
                            padding: '4px',
                            background: 'none',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.1s ease',
                            outline: 'none',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Inner Separator */}
              <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)', margin: '0 8px', flexShrink: 0 }} />

              {/* Title Input */}
              <input 
                type="text" 
                value={isAr ? nameAr : nameEn} 
                onChange={(e) => {
                  if (isAr) setNameAr(e.target.value);
                  else setNameEn(e.target.value);
                }}
                placeholder={isAr ? 'اسم القالب المخصص...' : 'Custom template name...'}
                className="tb-input-field"
              />

              {/* Category Badge */}
              <span className={`badge ${category === 'email' ? 'badge-blue' : category === 'sms' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '9px', padding: '2px 6px', height: 'fit-content', marginInlineStart: '8px' }}>
                {category.toUpperCase()}
              </span>
            </div>
            
            <div className="tb-desc-group">
              {/* Description Subtitle */}
              <input 
                type="text"
                value={isAr ? descAr : descEn}
                onChange={(e) => {
                  if (isAr) setDescAr(e.target.value);
                  else setDescEn(e.target.value);
                }}
                placeholder={isAr ? 'أضف وصفاً موجزاً للقالب...' : 'Short description...'}
                className="tb-desc-field"
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => setTourStep(0)} 
            className="btn" 
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', height: '38px' }}
          >
            <HelpCircle size={14} />
            <span>{isAr ? 'مساعدة باللوحة' : 'Builder Tour'}</span>
          </button>

          {category === 'email' && (
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)} 
              className={`btn ${isPreviewMode ? 'btn-primary' : ''}`}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', height: '38px' }}
            >
              <Eye size={14} />
              <span>{isPreviewMode ? (isAr ? 'وضع التحرير' : 'Edit Mode') : (isAr ? 'معاينة حية' : 'Live Preview')}</span>
            </button>
          )}

          <button 
            onClick={handleSave} 
            disabled={isSavingInProgress}
            className="btn btn-primary"
            style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontWeight: 700, height: '38px' }}
          >
            {isSavingInProgress ? '...' : (isAr ? 'حفظ ونشر القالب' : 'Publish & Save')}
          </button>
        </div>
      </div>

      {/* 2. Main Builder Columns Grid */}
      <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden', minHeight: 0 }}>
        
        {/* EMAIL DRAG-AND-DROP BUILDER */}
        {category === 'email' && !isPreviewMode && (
          <>
            {/* Column A: Left Components List Palette */}
            <div style={{ width: '220px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', paddingRight: '5px' }}>
              <div style={{ paddingBottom: '6px', borderBottom: '1px solid var(--border-color)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', margin: 0 }}>
                  {isAr ? 'عناصر التخطيط' : 'LAYOUT BLOCKS'}
                </h4>
              </div>

              {[
                { type: 'header', labelAr: 'ترويسة الرسالة', labelEn: 'Header Block', descAr: 'شعار وعنوان رئيسي', descEn: 'Banner & logo title', icon: BookOpen },
                { type: 'text', labelAr: 'فقرة نصية', labelEn: 'Text Paragraph', descAr: 'نص إبداعي منسق', descEn: 'Main content paragraph', icon: Type },
                { type: 'button', labelAr: 'زر تفاعلي (CTA)', labelEn: 'Action Button', descAr: 'رابط مباشر وعنوان', descEn: 'Clickable URL button', icon: MousePointerClick },
                { type: 'image', labelAr: 'صورة مرئية', labelEn: 'Visual Image', descAr: 'رابط صورة أو غلاف', descEn: 'Responsive graphic block', icon: ImageIcon },
                { type: 'quote', labelAr: 'اقتباس فلسفي', labelEn: 'Philosophical Quote', descAr: 'إبراز اقتباس وكاتب', descEn: 'Stylized quotation block', icon: FileText },
                { type: 'divider', labelAr: 'فاصل أفقي', labelEn: 'Section Divider', descAr: 'خط رفيع للتنظيم', descEn: 'Horizontal separation line', icon: SeparatorHorizontal },
                { type: 'spacer', labelAr: 'مساحة فارغة', labelEn: 'Vertical Spacer', descAr: 'فراغ إضافي للحسابات', descEn: 'Blank spacing element', icon: SeparatorHorizontal },
                { type: 'footer', labelAr: 'توقيع وتذييل', labelEn: 'Footer block', descAr: 'روابط الاشتراك وحقوق', descEn: 'Links & compliance notice', icon: Type }
              ].map(blockOpt => {
                const BlockIcon = blockOpt.icon;
                return (
                  <div
                    key={blockOpt.type}
                    onClick={() => handleAddBlock(blockOpt.type as any)}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('blockType', blockOpt.type);
                    }}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      textAlign: isAr ? 'right' : 'left'
                    }}
                    className="palette-item"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                      <BlockIcon size={14} color="var(--accent-color)" />
                      <strong style={{ fontSize: '13px' }}>{isAr ? blockOpt.labelAr : blockOpt.labelEn}</strong>
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      {isAr ? blockOpt.descAr : blockOpt.descEn}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Column B: Center Visual Canvas */}
            <div 
              onClick={() => setSelectedBlockId(null)}
              style={{ 
                flex: 1, 
                backgroundColor: canvasBg, 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                overflowY: 'auto',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const type = e.dataTransfer.getData('blockType');
                if (type) {
                  handleAddBlock(type as any);
                }
              }}
            >
              <div style={{
                width: '100%',
                maxWidth: `${containerWidth}px`,
                backgroundColor: 'var(--panel-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 15px',
                fontSize: '12px',
                color: 'var(--text-primary)',
                marginBottom: '15px',
                display: 'flex',
                gap: '8px',
                alignItems: 'center'
              }}>
                <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{isAr ? 'عنوان البريد:' : 'Subject:'}</span>
                <input 
                  type="text" 
                  value={isAr ? subjectAr : subjectEn}
                  onChange={(e) => {
                    if (isAr) setSubjectAr(e.target.value);
                    else setSubjectEn(e.target.value);
                  }}
                  placeholder={isAr ? 'أدخل عنوان الرسالة الترويجي...' : 'Enter email subject line...'}
                  style={{ flex: 1, border: 'none', background: 'none', outline: 'none', fontSize: '12px', color: 'var(--text-primary)' }}
                />
              </div>

              {/* Central Simulated Canvas Document */}
              <div 
                style={{ 
                  width: '100%', 
                  maxWidth: `${containerWidth}px`, 
                  backgroundColor: containerBg, 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                  border: '1px solid var(--border-color)',
                  overflow: 'hidden',
                  direction: isAr ? 'rtl' : 'ltr',
                  fontFamily: `'${globalFont}', sans-serif`
                }}
              >
                {blocks.length === 0 ? (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Plus size={32} style={{ margin: '0 auto 12px auto', display: 'block', color: 'var(--border-color)' }} />
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      {isAr ? 'اسحب العناصر هنا أو انقر لإضافتها وتنسيقها' : 'Drag elements here or click items to populate canvas'}
                    </p>
                  </div>
                ) : (
                  blocks.map((block, idx) => {
                    const isSelected = selectedBlockId === block.id;
                    const align = block.align || (isAr ? 'right' : 'left');
                    const fontSize = block.fontSize ? `${block.fontSize}px` : '14px';
                    const color = block.color || globalTextColor;

                    let parsedContent = block.content;
                    Object.entries(variablePreviewValues).forEach(([key, val]) => {
                      parsedContent = parsedContent.replaceAll(`{{${key}}}`, val || `{{${key}}}`);
                    });

                     return (
                      <div
                        key={block.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                        }}
                        draggable={!isSelected}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`canvas-block-wrapper ${isSelected ? 'selected' : ''}`}
                      >
                        {/* Reorder controls overlay */}
                        <div className="block-controls-overlay">
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'up'); }}
                            className="control-btn"
                            disabled={idx === 0}
                            title={isAr ? 'أعلى' : 'Move Up'}
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); moveBlock(idx, 'down'); }}
                            className="control-btn"
                            disabled={idx === blocks.length - 1}
                            title={isAr ? 'أسفل' : 'Move Down'}
                          >
                            <ArrowDown size={12} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); duplicateBlock(idx); }}
                            className="control-btn"
                            title={isAr ? 'تكرار' : 'Duplicate'}
                          >
                            <Copy size={12} />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                            className="control-btn danger-btn"
                            title={isAr ? 'حذف' : 'Delete'}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Rendering blocks inside canvas */}
                        {block.type === 'header' && (
                          <div style={{ 
                            backgroundColor: block.backgroundColor || primaryColor, 
                            padding: block.padding || '24px', 
                            textAlign: align,
                            color: block.color || '#ffffff',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, display: 'block', marginBottom: '6px' }}>
                              {isSelected ? (
                                <input
                                  type="text"
                                  value={block.content}
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                  placeholder={isAr ? 'اللقب الأعلى...' : 'Upper Title...'}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', font: 'inherit', width: '100%', textAlign: align }}
                                />
                              ) : parsedContent}
                            </span>
                            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>
                              {isSelected ? (
                                <input
                                  type="text"
                                  value={block.title || ''}
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))}
                                  placeholder={isAr ? 'العنوان الأساسي...' : 'Primary Title...'}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', font: 'inherit', width: '100%', textAlign: align, fontWeight: 'inherit' }}
                                />
                              ) : block.title}
                            </h1>
                            <p style={{ margin: '6px 0 0 0', fontSize: '12px', opacity: 0.7 }}>
                              {isSelected ? (
                                <input
                                  type="text"
                                  value={block.subtitle || ''}
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, subtitle: e.target.value } : b))}
                                  placeholder={isAr ? 'العنوان الفرعي...' : 'Sub-header...'}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ background: 'transparent', border: 'none', outline: 'none', color: 'inherit', font: 'inherit', width: '100%', textAlign: align }}
                                />
                              ) : block.subtitle}
                            </p>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <div style={{ 
                            padding: block.padding || '16px', 
                            textAlign: align, 
                            color, 
                            fontSize, 
                            lineHeight: 1.7,
                            backgroundColor: block.backgroundColor || 'transparent',
                            whiteSpace: 'pre-wrap'
                          }}>
                            {isSelected ? (
                              <textarea
                                value={block.content}
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                placeholder={isAr ? 'اكتب نص الفقرة هنا...' : 'Type paragraph text here...'}
                                rows={Math.max(2, block.content.split('\n').length)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: 'inherit',
                                  font: 'inherit',
                                  fontSize: 'inherit',
                                  lineHeight: 'inherit',
                                  width: '100%',
                                  textAlign: align,
                                  resize: 'none',
                                  padding: 0,
                                  margin: 0
                                }}
                              />
                            ) : parsedContent}
                          </div>
                        )}

                        {block.type === 'button' && (
                          <div style={{ 
                            padding: block.padding || '16px', 
                            textAlign: align,
                            backgroundColor: block.backgroundColor || 'transparent'
                          }}>
                            <span style={{ 
                              display: 'inline-block', 
                              backgroundColor: block.backgroundColor || primaryColor, 
                              color: block.color || '#ffffff', 
                              padding: '10px 24px', 
                              fontSize: '13px', 
                              fontWeight: 600, 
                              borderRadius: block.borderRadius ? `${block.borderRadius}px` : '4px',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                            }}>
                              {isSelected ? (
                                <input
                                  type="text"
                                  value={block.content}
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                  placeholder={isAr ? 'نص الزر...' : 'Button text...'}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: 'inherit',
                                    font: 'inherit',
                                    fontWeight: 'inherit',
                                    width: 'auto',
                                    textAlign: 'center',
                                    padding: 0,
                                    margin: 0
                                  }}
                                />
                              ) : parsedContent}
                            </span>
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div style={{ 
                            padding: block.padding || '15px', 
                            textAlign: align,
                            backgroundColor: block.backgroundColor || 'transparent'
                          }}>
                            <img 
                              src={block.src || 'https://via.placeholder.com/600x250?text=Sumer+Send'} 
                              alt={block.alt || 'Visual'} 
                              style={{ maxWidth: '100%', height: 'auto', borderRadius: block.borderRadius ? `${block.borderRadius}px` : '4px', display: 'block', margin: align === 'center' ? '0 auto' : '0' }}
                            />
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div style={{ 
                            padding: block.padding || '16px 20px',
                            backgroundColor: block.backgroundColor || 'transparent'
                          }}>
                            <div style={{ 
                              borderRight: isAr ? `3px solid ${primaryColor}` : 'none', 
                              borderLeft: !isAr ? `3px solid ${primaryColor}` : 'none', 
                              paddingRight: isAr ? '15px' : '0',
                              paddingLeft: !isAr ? '15px' : '0',
                              fontStyle: 'italic',
                              textAlign: align,
                              color
                            }}>
                              {isSelected ? (
                                <>
                                  <textarea
                                    value={block.content}
                                    onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                    placeholder={isAr ? 'نص الاقتباس...' : 'Quote content...'}
                                    rows={Math.max(1, block.content.split('\n').length)}
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      outline: 'none',
                                      color: 'inherit',
                                      font: 'inherit',
                                      fontWeight: 'inherit',
                                      width: '100%',
                                      textAlign: align,
                                      resize: 'none',
                                      padding: 0,
                                      margin: 0
                                    }}
                                  />
                                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '6px', fontSize: '11px', opacity: 0.8, justifyContent: align === 'center' ? 'center' : 'flex-start' }}>
                                    <span>—</span>
                                    <input
                                      type="text"
                                      value={block.quoteAuthor || ''}
                                      onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, quoteAuthor: e.target.value } : b))}
                                      placeholder={isAr ? 'الكاتب...' : 'Author...'}
                                      onClick={(e) => e.stopPropagation()}
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        color: 'inherit',
                                        font: 'inherit',
                                        width: '120px',
                                        padding: 0,
                                        margin: 0
                                      }}
                                    />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>"{parsedContent}"</p>
                                  {block.quoteAuthor && <span style={{ fontSize: '11px', color: '#666', display: 'block', marginTop: '4px' }}>— {block.quoteAuthor}</span>}
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        {block.type === 'divider' && (
                          <div style={{ padding: block.padding || '15px', backgroundColor: block.backgroundColor || 'transparent' }}>
                            <hr style={{ border: 0, borderTop: '1px solid var(--border-color)', margin: 0 }} />
                          </div>
                        )}

                        {block.type === 'spacer' && (
                          <div style={{ height: `${block.height || 20}px`, backgroundColor: block.backgroundColor || 'transparent' }}></div>
                        )}

                        {block.type === 'footer' && (
                          <div style={{ 
                            backgroundColor: block.backgroundColor || '#f4f4f5', 
                            padding: block.padding || '20px', 
                            textAlign: align,
                            fontSize: '11px', 
                            color: '#71717a', 
                            borderTop: '1px solid #eaeaea', 
                            lineHeight: 1.5 
                          }}>
                            {isSelected ? (
                              <textarea
                                value={block.content}
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                placeholder={isAr ? 'نص التذييل...' : 'Footer text...'}
                                rows={Math.max(1, block.content.split('\n').length)}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  outline: 'none',
                                  color: 'inherit',
                                  font: 'inherit',
                                  width: '100%',
                                  textAlign: align,
                                  resize: 'none',
                                  padding: 0,
                                  margin: 0
                                }}
                              />
                            ) : (
                              <p style={{ margin: '0 0 4px 0', whiteSpace: 'pre-wrap' }}>{parsedContent}</p>
                            )}
                            <p style={{ margin: 0 }}>© 2026 Sumer Send. All rights reserved.</p>
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Column C: Right Properties & Smart Tools Inspector */}
            <div className="builder-sidebar-form" style={{ width: '310px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
              
              {/* Properties Editor card */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <Settings size={14} color="var(--accent-color)" />
                  <strong style={{ fontSize: '13px' }}>
                    {selectedBlockId ? (isAr ? 'تعديل العنصر المحدد' : 'Block Customizer') : (isAr ? 'تنسيق القالب العام' : 'Canvas Settings')}
                  </strong>
                </div>

                {selectedBlockId ? (
                  // Block Specific property configuration inputs
                  (() => {
                    const block = blocks.find(b => b.id === selectedBlockId);
                    if (!block) return null;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {block.type === 'header' && (
                          <>
                            <div className="form-group">
                              <label>{isAr ? 'اللقب الأعلى' : 'Upper Title / Writer'}</label>
                              <input 
                                type="text" 
                                value={block.content} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                              />
                            </div>
                            <div className="form-group">
                              <label>{isAr ? 'العنوان الأساسي' : 'Primary Title'}</label>
                              <input 
                                type="text" 
                                value={block.title || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, title: e.target.value } : b))}
                              />
                            </div>
                            <div className="form-group">
                              <label>{isAr ? 'العنوان الفرعي' : 'Sub-header'}</label>
                              <input 
                                type="text" 
                                value={block.subtitle || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, subtitle: e.target.value } : b))}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'text' && (
                          <div className="form-group">
                            <label>{isAr ? 'نص الفقرة' : 'Paragraph Body'}</label>
                            <textarea 
                              rows={4}
                              value={block.content} 
                              onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                              style={{ width: '100%', fontSize: '12px', resize: 'vertical' }}
                            />
                          </div>
                        )}

                        {block.type === 'button' && (
                          <>
                            <div className="form-group">
                              <label>{isAr ? 'نص الزر' : 'Button Label'}</label>
                              <input 
                                type="text" 
                                value={block.content} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                              />
                            </div>
                            <div className="form-group">
                              <label>{isAr ? 'رابط الزر (URL)' : 'Destination URL'}</label>
                              <input 
                                type="text" 
                                value={block.url || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, url: e.target.value } : b))}
                              />
                            </div>
                            <div className="form-group" style={{ marginBottom: '12px' }}>
                              <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                {isAr ? 'حافة دائرية (Radius)' : 'Border Radius'} ({block.borderRadius || 0}px)
                              </label>
                              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input 
                                  type="range" 
                                  min={0}
                                  max={30}
                                  value={block.borderRadius || 0} 
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, borderRadius: parseInt(e.target.value) || 0 } : b))}
                                  style={{ flex: 1, accentColor: 'var(--accent-color)', height: '4px', cursor: 'pointer' }}
                                />
                                <input 
                                  type="number"
                                  min={0}
                                  max={30}
                                  value={block.borderRadius || 0}
                                  onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, borderRadius: parseInt(e.target.value) || 0 } : b))}
                                  style={{
                                    width: '60px',
                                    textAlign: 'center'
                                  }}
                                />
                              </div>
                            </div>
                          </>
                        )}

                        {block.type === 'image' && (
                          <>
                            <div className="form-group">
                              <label>{isAr ? 'رابط الصورة (URL)' : 'Image Source URL'}</label>
                              <input 
                                type="text" 
                                value={block.src || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, src: e.target.value } : b))}
                              />
                            </div>
                            <div className="form-group">
                              <label>{isAr ? 'النص البديل (Alt)' : 'Alternate Description'}</label>
                              <input 
                                type="text" 
                                value={block.alt || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, alt: e.target.value } : b))}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'quote' && (
                          <>
                            <div className="form-group">
                              <label>{isAr ? 'نص الاقتباس' : 'Quotation content'}</label>
                              <textarea 
                                rows={3}
                                value={block.content} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                                style={{ width: '100%', fontSize: '12px' }}
                              />
                            </div>
                            <div className="form-group">
                              <label>{isAr ? 'القائل (الكاتب)' : 'Author Signature'}</label>
                              <input 
                                type="text" 
                                value={block.quoteAuthor || ''} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, quoteAuthor: e.target.value } : b))}
                              />
                            </div>
                          </>
                        )}

                        {block.type === 'spacer' && (
                          <div className="form-group" style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {isAr ? 'ارتفاع الفراغ' : 'Spacer Height'} ({block.height || 20}px)
                            </label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                              <input 
                                type="range" 
                                min={5}
                                max={150}
                                value={block.height || 20} 
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, height: parseInt(e.target.value) || 20 } : b))}
                                style={{ flex: 1, accentColor: 'var(--accent-color)', height: '4px', cursor: 'pointer' }}
                              />
                              <input 
                                type="number"
                                min={5}
                                max={200}
                                value={block.height || 20}
                                onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, height: parseInt(e.target.value) || 20 } : b))}
                                style={{
                                  width: '60px',
                                  textAlign: 'center'
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {block.type === 'footer' && (
                          <div className="form-group">
                            <label>{isAr ? 'نص التذييل الإضافي' : 'Footer Content text'}</label>
                            <textarea 
                              rows={2}
                              value={block.content} 
                              onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content: e.target.value } : b))}
                              style={{ width: '100%', fontSize: '12px' }}
                            />
                          </div>
                        )}

                        {block.type !== 'spacer' && block.type !== 'divider' && (
                          <>
                            <div className="form-group">
                              <label>{isAr ? 'المحاذاة' : 'Text Alignment'}</label>
                              <div style={{ display: 'flex', gap: '5px' }}>
                                {['left', 'center', 'right'].map(alignOpt => (
                                  <button
                                    key={alignOpt}
                                    type="button"
                                    onClick={() => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, align: alignOpt as any } : b))}
                                    className={`btn ${block.align === alignOpt ? 'btn-primary' : ''}`}
                                    style={{ flex: 1, fontSize: '10px', padding: '4px' }}
                                  >
                                    {alignOpt.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {block.type === 'text' && (
                              <div className="form-group" style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  {isAr ? 'حجم الخط' : 'Font Size'} ({block.fontSize || 14}px)
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                  <input 
                                    type="range" 
                                    min={10}
                                    max={36}
                                    value={block.fontSize || 14} 
                                    onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, fontSize: parseInt(e.target.value) || 14 } : b))}
                                    style={{ flex: 1, accentColor: 'var(--accent-color)', height: '4px', cursor: 'pointer' }}
                                  />
                                  <input 
                                    type="number"
                                    min={10}
                                    max={36}
                                    value={block.fontSize || 14}
                                    onChange={(e) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, fontSize: parseInt(e.target.value) || 14 } : b))}
                                    style={{
                                      width: '60px',
                                      textAlign: 'center'
                                    }}
                                  />
                                </div>
                              </div>
                            )}

                            <ColorPickerInput 
                              label={isAr ? 'لون الخلفية الخاص' : 'Custom Background'}
                              value={block.backgroundColor || '#ffffff'}
                              onChange={(val) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, backgroundColor: val } : b))}
                            />

                            <ColorPickerInput 
                              label={isAr ? 'لون النص الخاص' : 'Custom Text Color'}
                              value={block.color || '#333333'}
                              onChange={(val) => setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, color: val } : b))}
                            />
                          </>
                        )}

                        <button 
                          onClick={() => setSelectedBlockId(null)} 
                          className="btn"
                          style={{ fontSize: '11px', marginTop: '10px' }}
                        >
                          {isAr ? 'إغلاق المفتش والعودة' : 'Back to global settings'}
                        </button>
                      </div>
                    );
                  })()
                ) : (
                  // Canvas Global properties configuration
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Template Metadata Editing */}
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '4px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isAr ? 'بيانات القالب الأساسية' : 'Template Details'}
                      </h4>
                      
                      <div className="form-group">
                        <label>{isAr ? 'الاسم (بالعربية)' : 'Name (Arabic)'}</label>
                        <input 
                          type="text" 
                          value={nameAr} 
                          onChange={(e) => setNameAr(e.target.value)}
                          placeholder={isAr ? 'مثال: نشرة الفلسفة الأسبوعية' : 'e.g. Arabic Name'}
                        />
                      </div>
                      <div className="form-group">
                        <label>{isAr ? 'الاسم (بالإنجليزية)' : 'Name (English)'}</label>
                        <input 
                          type="text" 
                          value={nameEn} 
                          onChange={(e) => setNameEn(e.target.value)}
                          placeholder={isAr ? 'مثال: Weekly Newsletter' : 'e.g. English Name'}
                        />
                      </div>
                      <div className="form-group">
                        <label>{isAr ? 'الوصف (بالعربية)' : 'Description (Arabic)'}</label>
                        <textarea 
                          rows={2}
                          value={descAr} 
                          onChange={(e) => setDescAr(e.target.value)}
                          placeholder={isAr ? 'وصف مختصر للقالب...' : 'Arabic description...'}
                          style={{ resize: 'none' }}
                        />
                      </div>
                      <div className="form-group">
                        <label>{isAr ? 'الوصف (بالإنجليزية)' : 'Description (English)'}</label>
                        <textarea 
                          rows={2}
                          value={descEn} 
                          onChange={(e) => setDescEn(e.target.value)}
                          placeholder={isAr ? 'وصف بالإنجليزية...' : 'English description...'}
                          style={{ resize: 'none' }}
                        />
                      </div>
                    </div>

                    <h4 style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', margin: '4px 0 0 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {isAr ? 'تصميم المظهر العام' : 'Canvas Design'}
                    </h4>
                    <ColorPickerInput 
                      label={isAr ? 'خلفية الساحة الخارجية' : 'Outer Canvas BG'}
                      value={canvasBg}
                      onChange={setCanvasBg}
                    />
                    
                    <ColorPickerInput 
                      label={isAr ? 'خلفية وعاء المحتوى' : 'Inner Container BG'}
                      value={containerBg}
                      onChange={setContainerBg}
                    />

                    <ColorPickerInput 
                      label={isAr ? 'اللون الأساسي للعلامة' : 'Brand Primary Color'}
                      value={primaryColor}
                      onChange={setPrimaryColor}
                    />

                    <ColorPickerInput 
                      label={isAr ? 'اللون العام للنصوص' : 'Global Text Color'}
                      value={globalTextColor}
                      onChange={setGlobalTextColor}
                    />

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isAr ? 'عرض الحاوية' : 'Container Width'} ({containerWidth}px)
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input 
                          type="range" 
                          min={450}
                          max={800}
                          step={10}
                          value={containerWidth} 
                          onChange={(e) => setContainerWidth(parseInt(e.target.value) || 600)}
                          style={{ flex: 1, accentColor: 'var(--accent-color)', height: '4px', cursor: 'pointer' }}
                        />
                        <input 
                          type="number"
                          min={450}
                          max={800}
                          value={containerWidth}
                          onChange={(e) => setContainerWidth(parseInt(e.target.value) || 600)}
                          style={{
                            width: '70px',
                            textAlign: 'center'
                          }}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {isAr ? 'الخط العام للرسالة' : 'Global Font Family'}
                      </label>
                      <select 
                        value={globalFont} 
                        onChange={(e) => setGlobalFont(e.target.value)}
                        style={{ width: '100%', cursor: 'pointer' }}
                      >
                        <option value="Cairo">Cairo (Arabic Cairo)</option>
                        <option value="Inter">Inter (Clean English)</option>
                        <option value="system-ui">System Default</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart AI copywriting tool */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                  <Sparkles size={14} color="var(--accent-color)" />
                  <strong style={{ fontSize: '13px' }}>{isAr ? 'مساعد الكتابة الفلسفي ذكي' : 'Philosophical AI Copywriter'}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="form-group">
                    <label>{isAr ? 'الأسلوب والنبرة الفكرية' : 'Intellectual Tone'}</label>
                    <select value={aiTone} onChange={(e) => setAiTone(e.target.value as any)} style={{ fontSize: '12px' }}>
                      <option value="philosophical">Philosophical (Nietzsche / فلسفي)</option>
                      <option value="psychological">Psychological (Jung / علم النفس)</option>
                      <option value="neuroscience">Neuroscience (الأعصاب والسلوك)</option>
                      <option value="persuasive">Persuasive (مقنع ومباشر)</option>
                      <option value="standard">Standard Welcome (ترحيب اعتيادي)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{isAr ? 'نوع الجزء المطلوب' : 'Block Section Type'}</label>
                    <select value={aiBlockType} onChange={(e) => setAiBlockType(e.target.value as any)} style={{ fontSize: '12px' }}>
                      <option value="intro">Introduction Hook (مقدمة مثيرة)</option>
                      <option value="quote">Deep Quote (اقتباس عميق)</option>
                      <option value="body">Body Insight (تحليل صلب الموضوع)</option>
                      <option value="cta">Action Button text (زر تفاعلي)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>{isAr ? 'لغة التوليد' : 'Language'}</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button 
                        onClick={() => setAiLanguage('ar')}
                        className={`btn ${aiLanguage === 'ar' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, fontSize: '11px', padding: '4px' }}
                      >
                        العربية
                      </button>
                      <button 
                        onClick={() => setAiLanguage('en')}
                        className={`btn ${aiLanguage === 'en' ? 'btn-primary' : ''}`}
                        style={{ flex: 1, fontSize: '11px', padding: '4px' }}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiText}
                    disabled={isGeneratingAi}
                    className="btn"
                    style={{ fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', backgroundColor: 'var(--accent-color)', color: '#ffffff', border: 'none' }}
                  >
                    <Sparkles size={13} />
                    <span>{isGeneratingAi ? (isAr ? 'جار التوليد...' : 'Thinking...') : (isAr ? 'توليد نص ذكي' : 'Generate Content')}</span>
                  </button>

                  {aiResult && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '12px', 
                      backgroundColor: 'var(--bg-color)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border-color)',
                      fontSize: '12px',
                      lineHeight: 1.5
                    }}>
                      <p style={{ margin: '0 0 10px 0', fontStyle: 'italic', direction: aiLanguage === 'ar' ? 'rtl' : 'ltr', textAlign: aiLanguage === 'ar' ? 'right' : 'left' }}>
                        "{aiResult}"
                      </p>
                      
                      <button
                        onClick={handleApplyAiText}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '11px', padding: '6px' }}
                      >
                        {selectedBlockId ? (isAr ? 'تطبيق على العنصر المحدد' : 'Inject to Selected Block') : (isAr ? 'إدراج كعنصر جديد' : 'Insert as New Block')}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}

        {/* EMAIL PREVIEW MODE */}
        {category === 'email' && isPreviewMode && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--panel-bg)', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setPreviewDevice('desktop')}
                  className={`btn ${previewDevice === 'desktop' ? 'btn-primary' : ''}`}
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                >
                  <Monitor size={14} />
                  <span>{isAr ? 'حاسوب مكتب' : 'Desktop View'}</span>
                </button>
                <button 
                  onClick={() => setPreviewDevice('mobile')}
                  className={`btn ${previewDevice === 'mobile' ? 'btn-primary' : ''}`}
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                >
                  <Smartphone size={14} />
                  <span>{isAr ? 'هاتف محمول' : 'Mobile View'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setIsRawHtmlMode(!isRawHtmlMode)}
                  className="btn"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
                >
                  <Code size={14} />
                  <span>{isRawHtmlMode ? (isAr ? 'معاينة مرئية' : 'Visual Preview') : (isAr ? 'عرض كود HTML' : 'Show Source Code')}</span>
                </button>
              </div>
            </div>

            <div style={{ 
              flex: 1, 
              border: '1.5px solid var(--border-color)', 
              borderRadius: '12px', 
              backgroundColor: '#f4f4f5', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              overflow: 'hidden',
              padding: '20px'
            }}>
              {isRawHtmlMode ? (
                <textarea
                  readOnly
                  value={getCompiledBody()}
                  style={{
                    width: '100%',
                    height: '100%',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    backgroundColor: '#1e1e1e',
                    color: '#a9b1d6',
                    padding: '20px',
                    borderRadius: '8px',
                    border: 'none',
                    resize: 'none'
                  }}
                />
              ) : previewDevice === 'mobile' ? (
                <div style={{
                  width: '360px',
                  height: '680px',
                  maxHeight: '100%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                  borderRadius: '36px',
                  border: '12px solid #18181b',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {/* Dynamic Island / Notch */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '84px',
                    height: '22px',
                    borderRadius: '11px',
                    backgroundColor: '#000',
                    zIndex: 100
                  }} />

                  {/* Status Bar */}
                  <div style={{
                    height: '34px',
                    padding: isAr ? '0 16px 0 24px' : '0 24px 0 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#000',
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid #f4f4f5',
                    zIndex: 90,
                    userSelect: 'none'
                  }}>
                    <span>9:41 AM</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {/* Signal Icons */}
                      <span style={{ fontSize: '10px' }}>📶</span>
                      <span style={{ fontSize: '12px', fontWeight: 'bold' }}>🔋</span>
                    </div>
                  </div>

                  {/* Phone Screen Frame Content */}
                  <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                            <style>
                              html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
                            </style>
                          </head>
                          <body>
                            ${getCompiledBody()}
                          </body>
                        </html>
                      `}
                      title="Compiled HTML Template preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>

                  {/* Home Indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '5px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '110px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: '#888',
                    zIndex: 100
                  }} />
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '680px',
                  maxHeight: '100%',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                  {/* Browser Mockup Top bar */}
                  <div style={{
                    height: '40px',
                    backgroundColor: 'var(--panel-muted)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    gap: '16px',
                    userSelect: 'none'
                  }}>
                    {/* Window Controls */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ff5f56' }} />
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
                      <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#27c93f' }} />
                    </div>

                    {/* Address bar */}
                    <div style={{
                      backgroundColor: 'var(--panel-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flex: 1,
                      maxWidth: '480px',
                      margin: '0 auto',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '10px' }}>🔒</span>
                      <span>sumersend.com/templates/preview/{id || 'temp'}</span>
                    </div>

                    {/* Spacer for centering */}
                    <div style={{ width: '45px' }} />
                  </div>

                  {/* Browser Mockup Content */}
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <link rel="preconnect" href="https://fonts.googleapis.com">
                            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
                            <style>
                              html, body { margin: 0; padding: 0; height: 100%; width: 100%; }
                            </style>
                          </head>
                          <body>
                            ${getCompiledBody()}
                          </body>
                        </html>
                      `}
                      title="Compiled HTML Template preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXT-BASED BUILDERS (SMS & WHATSAPP) */}
        {(category === 'sms' || category === 'whatsapp') && (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="card" style={{ 
                padding: '24px', 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--panel-bg)',
                boxShadow: 'var(--card-shadow)',
                borderTop: category === 'whatsapp' ? '4px solid #10b981' : '4px solid #3b82f6',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Card Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: category === 'whatsapp' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: category === 'whatsapp' ? '#10b981' : '#3b82f6',
                      fontWeight: 'bold'
                    }}>
                      {category === 'whatsapp' ? '💬' : '📱'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        {isAr ? 'محتوى نص الرسالة' : 'Message Text Content'}
                      </h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                        {category === 'whatsapp' 
                          ? (isAr ? 'قالب الواتساب التفاعلي' : 'Interactive WhatsApp template') 
                          : (isAr ? 'رسالة نصية قصيرة مباشرة' : 'Direct SMS template')
                        }
                      </p>
                    </div>
                  </div>
                  
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--panel-muted)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      backgroundColor: category === 'whatsapp' ? '#10b981' : '#3b82f6',
                      boxShadow: `0 0 8px ${category === 'whatsapp' ? '#10b981' : '#3b82f6'}`
                    }} />
                    {isAr ? 'مترابط بالمعاينة' : 'Linked to preview'}
                  </span>
                </div>

                {/* Suggestions Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>✨</span>
                      <span>{isAr ? 'حقول الإدراج السريع:' : 'Quick insert fields:'}</span>
                    </span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                      {isAr ? '(سيتم إدراج الحقل المختار عند موضع مؤشر الكتابة)' : '(Selected field will be inserted at the cursor)'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    flexWrap: 'wrap', 
                    padding: '14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-color)',
                    direction: isAr ? 'rtl' : 'ltr'
                  }}>
                    {[
                      { key: 'reader_name', labelAr: 'اسم المستلم (القارئ)', labelEn: 'Recipient Name', icon: '👤', color: '#3b82f6' },
                      { key: 'writer_name', labelAr: 'اسم المرسل (الكاتب)', labelEn: 'Sender Name', icon: '✍️', color: '#10b981' },
                      { key: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email Address', icon: '✉️', color: '#f59e0b' },
                      { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone Number', icon: '📞', color: '#8b5cf6' },
                      { key: 'otp_code', labelAr: 'رمز التحقق (OTP)', labelEn: 'OTP Code', icon: '🔒', color: '#ef4444' },
                      { key: 'blog_name', labelAr: 'اسم الموقع / المدونة', labelEn: 'Site/Blog Name', icon: '🌐', color: '#06b6d4' },
                      { key: 'amount', labelAr: 'المبلغ / الفاتورة', labelEn: 'Amount', icon: '💰', color: '#10b981' },
                      { key: 'date', labelAr: 'التاريخ', labelEn: 'Date', icon: '📅', color: '#6b7280' }
                    ].map(s => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => handleInsertTag(s.key)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          borderRadius: '6px',
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--panel-muted)';
                          e.currentTarget.style.borderColor = s.color;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = `0 4px 10px rgba(0,0,0,0.04)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = 'var(--border-color)';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.03)';
                        }}
                      >
                        <span style={{ color: s.color, display: 'inline-flex', alignItems: 'center' }}>{s.icon}</span>
                        <span>{isAr ? s.labelAr : s.labelEn}</span>
                        <span style={{ 
                          fontSize: '9.5px', 
                          color: s.color, 
                          backgroundColor: `${s.color}12`,
                          padding: '2px 5px',
                          borderRadius: '4px',
                          fontFamily: 'monospace',
                          fontWeight: 600
                        }}>
                          {`{{${s.key}}}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Textarea Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {isAr ? 'نص الرسالة:' : 'Message Text:'}
                  </span>
                  <textarea
                    ref={textareaRef}
                    value={textBody}
                    onChange={(e) => setTextBody(e.target.value)}
                    placeholder={
                      category === 'whatsapp' 
                        ? (isAr ? 'أدخل كود رسالة الواتساب...\nمثال: مرحباً بك {{reader_name}}...' : 'Enter WhatsApp message text...\nExample: Hello {{reader_name}}...')
                        : (isAr ? 'أدخل نص رسالة الـ SMS المباشرة...\nمثال: رمز التحقق {{otp_code}}...' : 'Enter SMS text content...\nExample: Your verification OTP is {{otp_code}}...')
                    }
                    style={{
                      width: '100%',
                      height: '120px',
                      minHeight: '100px',
                      maxHeight: '220px',
                      resize: 'vertical',
                      padding: '14px 16px',
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: '13.5px',
                      lineHeight: '1.6',
                      direction: isAr ? 'rtl' : 'ltr',
                      textAlign: isAr ? 'right' : 'left',
                      borderRadius: '6px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#ffffff',
                      color: 'var(--text-primary)',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = category === 'whatsapp' ? '#10b981' : '#3b82f6';
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${category === 'whatsapp' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)'}, inset 0 1px 2px rgba(0,0,0,0.02)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="builder-sidebar-form" style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="card" style={{ 
                padding: '24px 20px', 
                flex: 1, 
                backgroundColor: 'var(--bg-color)', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '15px' }}>
                  {isAr ? 'معاينة محاكاة الهاتف' : 'Live Smartphone Mockup'}
                </span>

                <div style={{
                  width: '280px',
                  height: '460px',
                  backgroundColor: category === 'whatsapp' ? 'var(--whatsapp-chat-bg)' : 'var(--sms-chat-bg)', 
                  border: '12px solid var(--phone-frame-border)',
                  borderRadius: '38px',
                  boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3), var(--phone-frame-inner-shadow)',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  userSelect: 'none'
                }}>
                  {/* Dynamic Island Notch */}
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '76px',
                    height: '18px',
                    borderRadius: '9px',
                    backgroundColor: '#000000',
                    zIndex: 110,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: '#1f1f23',
                      position: 'absolute',
                      right: '12px'
                    }} />
                  </div>

                  {/* Status Bar */}
                  <div style={{
                    height: '28px',
                    padding: '6px 16px 0 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '9px',
                    fontWeight: '600',
                    color: category === 'whatsapp' ? 'var(--whatsapp-bubble-meta)' : 'var(--text-muted)',
                    zIndex: 100,
                    direction: 'ltr'
                  }}>
                    <span>9:41</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <div style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '6px' }}>
                        <div style={{ width: '1.5px', height: '2px', backgroundColor: 'currentColor', borderRadius: '0.5px' }} />
                        <div style={{ width: '1.5px', height: '3.5px', backgroundColor: 'currentColor', borderRadius: '0.5px' }} />
                        <div style={{ width: '1.5px', height: '5px', backgroundColor: 'currentColor', borderRadius: '0.5px' }} />
                        <div style={{ width: '1.5px', height: '6px', backgroundColor: 'currentColor', borderRadius: '0.5px' }} />
                      </div>
                      <span style={{ fontSize: '9px', lineHeight: 1 }}>📶</span>
                      <div style={{
                        width: '14px',
                        height: '7px',
                        border: '1px solid currentColor',
                        borderRadius: '2px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.5px'
                      }}>
                        <div style={{ width: '9px', height: '100%', backgroundColor: 'currentColor', borderRadius: '0.5px' }} />
                        <div style={{
                          position: 'absolute',
                          right: '-2px',
                          top: '1.5px',
                          width: '1.2px',
                          height: '2.5px',
                          backgroundColor: 'currentColor',
                          borderTopRightRadius: '0.5px',
                          borderBottomRightRadius: '0.5px'
                        }} />
                      </div>
                    </div>
                  </div>

                  {/* App Header */}
                  {category === 'whatsapp' ? (
                    <div style={{
                      backgroundColor: 'var(--whatsapp-header-bg)',
                      color: 'var(--whatsapp-header-text)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                      zIndex: 90
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.8 }}>←</span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--whatsapp-avatar-bg)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                          fontSize: '12px',
                          color: '#075e54'
                        }}>
                          S
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', lineHeight: 1.1 }}>Sumer Send</span>
                          <span style={{ fontSize: '7.5px', opacity: 0.8, marginTop: '1px' }}>
                            {isAr ? 'حساب تجاري رسمي' : 'Official Business'}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '12px', opacity: 0.8 }}>
                        <span>📞</span>
                        <span>⋮</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'var(--sms-header-bg)',
                      color: 'var(--sms-header-text)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      borderBottom: '1px solid var(--border-color)',
                      zIndex: 90
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <span style={{ fontSize: '12px', color: 'var(--accent-color)', cursor: 'pointer' }}>←</span>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: 'var(--text-secondary)'
                          }}>
                            👤
                          </div>
                          <span style={{ fontSize: '9px', fontWeight: '600', marginTop: '2px' }}>Sumer Send</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Chat Message Box Container */}
                  <div style={{
                    flex: 1,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflowY: 'auto',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      {category === 'whatsapp' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{
                            fontSize: '8px',
                            color: 'var(--whatsapp-bubble-meta)',
                            backgroundColor: 'var(--whatsapp-received-bg)',
                            opacity: 0.9,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            alignSelf: 'center',
                            marginBottom: '6px',
                            boxShadow: '0 0.5px 1px rgba(0,0,0,0.05)'
                          }}>
                            {isAr ? 'اليوم' : 'TODAY'}
                          </span>

                          <div style={{
                            alignSelf: isAr ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            backgroundColor: 'var(--whatsapp-received-bg)',
                            color: 'var(--whatsapp-received-text)',
                            borderRadius: '8px',
                            borderTopLeftRadius: isAr ? '8px' : '0px',
                            borderTopRightRadius: isAr ? '0px' : '8px',
                            padding: '8px 10px',
                            boxShadow: '0 1px 1.5px rgba(0,0,0,0.12)',
                            position: 'relative'
                          }}>
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: isAr ? 'auto' : '-6px',
                              right: isAr ? '-6px' : 'auto',
                              width: 0,
                              height: 0,
                              borderStyle: 'solid',
                              borderWidth: '0 8px 8px 0',
                              borderColor: `transparent var(--whatsapp-received-bg) transparent transparent`,
                              transform: isAr ? 'scaleX(-1)' : 'none'
                            }} />

                            <p style={{
                              fontSize: '11px',
                              margin: 0,
                              whiteSpace: 'pre-wrap',
                              direction: isAr ? 'rtl' : 'ltr',
                              textAlign: isAr ? 'right' : 'left',
                              lineHeight: 1.4
                            }}>
                              {getCompiledBody() || '...'}
                            </p>
                            
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '2px',
                              fontSize: '7.5px',
                              color: 'var(--whatsapp-bubble-meta)',
                              marginTop: '4px',
                              textAlign: 'right'
                            }}>
                              <span>10:00 PM</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '8px', color: 'var(--text-muted)', alignSelf: 'center', margin: '2px 0' }}>
                            {isAr ? 'اليوم • رسالة نصية' : 'Today • SMS Message'}
                          </span>
                          
                          <div style={{
                            alignSelf: isAr ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            backgroundColor: 'var(--sms-received-bg)',
                            color: 'var(--sms-received-text)',
                            borderRadius: '16px',
                            borderBottomLeftRadius: isAr ? '16px' : '4px',
                            borderBottomRightRadius: isAr ? '4px' : '16px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            lineHeight: 1.4,
                            direction: isAr ? 'rtl' : 'ltr',
                            textAlign: isAr ? 'right' : 'left',
                            position: 'relative',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                          }}>
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {getCompiledBody() || '...'}
                            </p>
                            <span style={{
                              position: 'absolute',
                              bottom: '-12px',
                              left: isAr ? 'auto' : '6px',
                              right: isAr ? '6px' : 'auto',
                              fontSize: '7.5px',
                              color: 'var(--text-muted)'
                            }}>
                              Sumer Send
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{
                      marginTop: 'auto',
                      paddingTop: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      direction: isAr ? 'rtl' : 'ltr'
                    }}>
                      {category === 'whatsapp' ? (
                        <>
                          <div style={{
                            flex: 1,
                            backgroundColor: 'var(--whatsapp-received-bg)',
                            borderRadius: '18px',
                            padding: '4px 10px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
                          }}>
                            <span style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.6 }}>😀</span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', flex: 1 }}>
                              {isAr ? 'اكتب رسالة...' : 'Type a message...'}
                            </span>
                            <span style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.6 }}>📎</span>
                            <span style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.6 }}>📷</span>
                          </div>
                          <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: '#00a884',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}>
                            🎙️
                          </div>
                        </>
                      ) : (
                        <div style={{
                          flex: 1,
                          backgroundColor: 'var(--sms-received-bg)',
                          borderRadius: '16px',
                          padding: '5px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          border: '1px solid var(--border-color)'
                        }}>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flex: 1 }}>
                            {isAr ? 'رسالة نصية...' : 'Text Message...'}
                          </span>
                          <span style={{ fontSize: '11px', cursor: 'pointer', opacity: 0.6 }}>💬</span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Text AI Generator copywriter pane */}
              <div className="card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <Sparkles size={14} color="var(--accent-color)" />
                  <strong style={{ fontSize: '12px' }}>{isAr ? 'مساعد النصوص الذكي للشبكات' : 'Text Message AI Helper'}</strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <select value={aiTone} onChange={(e) => setAiTone(e.target.value as any)} style={{ fontSize: '11px', padding: '4px' }}>
                    <option value="philosophical">Philosophical Thought / فكر فلسفي</option>
                    <option value="psychological">Psychology Insights / علم نفس عميق</option>
                    <option value="persuasive">Direct Alert / إشعار مباشر سريع</option>
                  </select>
                  
                  <button 
                    onClick={handleGenerateAiText} 
                    disabled={isGeneratingAi} 
                    className="btn btn-primary"
                    style={{ fontSize: '11px', padding: '6px' }}
                  >
                    {isGeneratingAi ? '...' : (isAr ? 'توليد فكرة نصية' : 'Generate SMS Content')}
                  </button>

                  {aiResult && (
                    <div style={{ fontSize: '11px', padding: '8px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', marginTop: '6px' }}>
                      <p style={{ margin: '0 0 6px 0', fontStyle: 'italic' }}>"{aiResult}"</p>
                      <button onClick={handleApplyAiText} className="btn" style={{ width: '100%', fontSize: '10px', padding: '4px' }}>
                        {isAr ? 'إدراج النص بالكامل' : 'Append to Body'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

      </div>

      {/* 3. Variables Inspector Drawer Sub-Panel */}
      {variables.length > 0 && (
        <div style={{ 
          marginTop: '15px', 
          padding: '12px 18px', 
          backgroundColor: 'var(--panel-bg)', 
          border: '1.5px solid var(--border-color)', 
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Info size={14} color="var(--accent-color)" />
            <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
              {isAr ? 'حقول المتغيرات المكتشفة في القالب' : 'Detected Dynamic Template Variables'}
            </strong>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              {isAr ? '(أدخل قيم اختبارية أدناه للمعاينة الحية)' : '(Type test values below to preview locally)'}
            </span>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            marginTop: '4px'
          }}>
            {variables.map(v => (
              <div
                key={v.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px',
                  backgroundColor: 'var(--bg-color)',
                  border: '1.5px solid var(--border-color)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent-color)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.04)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--accent-bg)',
                    color: 'var(--accent-text)',
                    fontWeight: '700',
                    letterSpacing: '0.3px',
                    direction: 'ltr',
                    display: 'inline-block'
                  }}>
                    {`{{${v.key}}}`}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {isAr ? 'متغير ديناميكي' : 'Dynamic Var'}
                  </span>
                </div>

                {(() => {
                  const isLongText = (
                    v.key.toLowerCase().includes('desc') || 
                    v.key.toLowerCase().includes('text') || 
                    v.key.toLowerCase().includes('body') ||
                    v.key.toLowerCase().includes('content') ||
                    v.labelAr.includes('وصف') || 
                    v.labelAr.includes('نص') || 
                    v.labelAr.includes('محتوى') ||
                    (v.labelEn || '').toLowerCase().includes('desc') || 
                    (v.labelEn || '').toLowerCase().includes('text') ||
                    (v.labelEn || '').toLowerCase().includes('body') ||
                    (v.labelEn || '').toLowerCase().includes('content')
                  );

                  return isLongText ? (
                    <textarea
                      value={variablePreviewValues[v.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariablePreviewValues(prev => ({ ...prev, [v.key]: val }));
                        
                        setVariables(prev => prev.map(item => {
                          if (item.key === v.key) {
                            return {
                              ...item,
                              defaultValAr: isAr ? val : item.defaultValAr,
                              defaultValEn: !isAr ? val : item.defaultValEn
                            };
                          }
                          return item;
                        }));
                      }}
                      placeholder={isAr ? 'قيمة المعاينة التلقائية...' : 'Test preview value...'}
                      rows={2}
                      style={{
                        padding: '8px 10px',
                        fontSize: '11px',
                        width: '100%',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        backgroundColor: 'var(--panel-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        resize: 'vertical',
                        fontFamily: 'inherit',
                        lineHeight: 1.4
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-color)';
                        e.target.style.boxShadow = '0 0 0 1px var(--accent-bg)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={variablePreviewValues[v.key] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariablePreviewValues(prev => ({ ...prev, [v.key]: val }));
                        
                        setVariables(prev => prev.map(item => {
                          if (item.key === v.key) {
                            return {
                              ...item,
                              defaultValAr: isAr ? val : item.defaultValAr,
                              defaultValEn: !isAr ? val : item.defaultValEn
                            };
                          }
                          return item;
                        }));
                      }}
                      placeholder={isAr ? 'قيمة المعاينة التلقائية...' : 'Test preview value...'}
                      style={{
                        padding: '6px 10px',
                        fontSize: '11px',
                        width: '100%',
                        border: '1px solid var(--border-color)',
                        borderRadius: '5px',
                        backgroundColor: 'var(--panel-bg)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.15s ease',
                        height: '32px'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'var(--accent-color)';
                        e.target.style.boxShadow = '0 0 0 1px var(--accent-bg)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Calculated Layout Analytics Panel */}
      <div style={{ 
        marginTop: '15px', 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '15px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '12px' 
      }}>
        {category === 'email' ? (
          <>
            {/* HTML Payload Size Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: isHtmlClipped ? 'rgba(239, 68, 68, 0.04)' : 'var(--panel-bg)', 
                border: `1.5px solid ${isHtmlClipped ? 'var(--danger-color)' : 'var(--border-color)'}`,
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isHtmlClipped ? 'var(--danger-color)' : 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isHtmlClipped ? 'var(--danger-color)' : 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <FileText size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'حجم كود HTML المتوقع' : 'HTML Payload size'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', color: isHtmlClipped ? 'var(--danger-color)' : 'var(--text-primary)', marginTop: '2px' }}>
                <span>{(htmlSizeBytes / 1024).toFixed(1)} KB</span>
                {isHtmlClipped && <AlertTriangle size={13} />}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isHtmlClipped 
                  ? (isAr ? 'تنبيه: يتجاوز 102KB وسيتم قصه في Gmail' : 'Warning: Exceeds 102KB, Gmail will clip it') 
                  : (isAr ? 'ممتاز: آمن وضمن حدود قنوات البريد' : 'Excellent: Safe within mail specs')}
              </span>
            </div>

            {/* Readability Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--panel-bg)', 
                border: '1.5px solid var(--border-color)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <BookOpen size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'الوضوح ومستوى القراءة' : 'Readability & Complexity'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {getReadabilityScore()}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isAr ? `المحتوى يتألف من ${wordCount} كلمة` : `Contains ${wordCount} words total`}
              </span>
            </div>

            {/* Reading Duration Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--panel-bg)', 
                border: '1.5px solid var(--border-color)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Clock size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'مدة القراءة التقديرية' : 'Est. Reading Duration'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {isAr ? `${estReadingTimeMinutes} دقيقة` : `${estReadingTimeMinutes} min`}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isAr ? 'بمعدل قراءة 200 كلمة/دقيقة' : 'Based on average 200 wpm speed'}
              </span>
            </div>

            {/* Spam Trigger Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 
                  spamDetails.score === 55 
                    ? 'rgba(239, 68, 68, 0.04)' 
                    : spamDetails.score === 80 
                      ? 'rgba(245, 158, 11, 0.04)' 
                      : 'var(--panel-bg)', 
                border: `1.5px solid ${
                  spamDetails.score === 55 
                    ? 'var(--danger-color)' 
                    : spamDetails.score === 80 
                      ? 'var(--warning-color)' 
                      : 'var(--border-color)'
                }`,
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 
                  spamDetails.score === 55 
                    ? 'var(--danger-color)' 
                    : spamDetails.score === 80 
                      ? 'var(--warning-color)' 
                      : 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 
                  spamDetails.score === 55 
                    ? 'var(--danger-color)' 
                    : spamDetails.score === 80 
                      ? 'var(--warning-color)' 
                      : 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <AlertTriangle size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'مؤشر الكلمات الترويجية المزعجة' : 'Spam Trigger Check'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: spamDetails.color, marginTop: '2px' }}>
                {spamDetails.rating} ({spamDetails.score}%)
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {spamDetails.detected && spamDetails.detected.length > 0 
                  ? (isAr ? `الكلمات المكتشفة: ${spamDetails.detected.join(', ')}` : `Keywords: ${spamDetails.detected.join(', ')}`)
                  : (isAr ? 'لم يتم كشف أي كلمات مشبوهة' : 'No suspicious keywords found')}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Characters Count Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--panel-bg)', 
                border: '1.5px solid var(--border-color)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Type size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'عدد الحروف المكتوبة' : 'Characters Count'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {smsParts.charCount} {isAr ? 'حرف' : 'chars'}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isAr ? `ترميز: ${smsParts.encoding}` : `Encoding: ${smsParts.encoding}`}
              </span>
            </div>

            {/* SMS Segments Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--panel-bg)', 
                border: '1.5px solid var(--border-color)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <SeparatorHorizontal size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'عدد أجزاء الرسالة' : 'SMS Segments'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--text-primary)', marginTop: '2px' }}>
                {smsParts.parts} {isAr ? 'أجزاء' : 'parts'}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isAr 
                  ? `أول جزء 70 حرف، الباقي 67 للرسالة` 
                  : `First part 160 chars, then 153 chars`}
              </span>
            </div>

            {/* Estimated Cost Card */}
            <div 
              style={{ 
                padding: '14px 16px', 
                borderRadius: '10px', 
                backgroundColor: 'var(--panel-bg)', 
                border: '1.5px solid var(--border-color)',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.04)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                <Coins size={13} />
                <span style={{ fontSize: '10.5px', fontWeight: 500 }}>
                  {isAr ? 'التكلفة التقريبية لكل إرسال' : 'Estimated Cost Per Sent'}
                </span>
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--accent-color)', marginTop: '2px' }}>
                {smsParts.costEstimate} {isAr ? 'د.ع' : 'IQD'}
              </strong>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                {isAr ? 'تخصم مباشرة من رصيد محفظتك' : 'Deducted directly from wallet balance'}
              </span>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
