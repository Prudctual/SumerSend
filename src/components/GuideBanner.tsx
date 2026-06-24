import React from 'react';
import { X } from 'lucide-react';
import { BentoCard } from './LandingView';

interface GuideBannerProps {
  lang: 'en' | 'ar';
  show: boolean;
  onClose: () => void;
  title: string;
  description: string;
  badges?: React.ReactNode;
  visualContent?: React.ReactNode;
  style?: React.CSSProperties;
}

export const GuideBanner: React.FC<GuideBannerProps> = ({
  lang,
  show,
  onClose,
  title,
  description,
  badges,
  visualContent,
  style,
}) => {
  if (!show) return null;

  const isRtl = lang === 'ar';

  // Close Icon: position absolute, top 16px, left 16px (RTL) / right 16px (LTR)
  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      style={{
        position: 'absolute',
        top: '16px',
        left: isRtl ? '16px' : 'auto',
        right: isRtl ? 'auto' : '16px',
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        padding: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 30,
        borderRadius: '50%',
        transition: 'color 0.2s, background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.backgroundColor = 'var(--accent-bg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.backgroundColor = 'transparent';
      }}
      aria-label="Close guide"
    >
      <X size={15} />
    </button>
  );

  if (visualContent) {
    return (
      <BentoCard 
        className="onboarding-split-card" 
        style={{ 
          minHeight: '260px', 
          borderRadius: '24px', 
          marginBottom: '20px', 
          overflow: 'hidden', 
          position: 'relative', // "يجب أن تكون position: relative; (ضروري جداً لعمل زر الإغلاق)"
          display: 'flex', // "يجب أن تكون display: flex; و flex-direction: row;"
          flexDirection: isRtl ? 'row-reverse' : 'row', // "تأكد من دعم RTL بحيث يكون النص على اليمين والصورة على اليسار."
          justifyContent: 'space-between', // "أضف justify-content: space-between; و align-items: center;."
          alignItems: 'center',
          padding: '24px 40px', 
          boxSizing: 'border-box',
          width: '100%',
          ...style 
        }}
      >
        {closeButton}
        
        {/* Text Content Container: flex: 1, text-align: right (for RTL) */}
        <div style={{ 
          flex: 1, // "أعطها flex: 1; لتأخذ نصف المساحة."
          display: 'flex', 
          flexDirection: 'column', 
          gap: '8px', 
          textAlign: isRtl ? 'right' : 'left' // "اجعل محاذاة النص text-align: right; والمحتوى يبدأ من اليمين."
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500, margin: '0 0 8px 0' }}>
            {description}
          </p>
          {badges && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {badges}
            </div>
          )}
        </div>

        {/* Visual Content Container: flex: 1, display: flex, justify-content: flex-end */}
        <div style={{ 
          flex: 1, // "أعطها flex: 1; لتأخذ النصف الآخر."
          display: 'flex', // "استخدم display: flex; justify-content: flex-end; لدفع الرسم البياني إلى أقصى اليسار."
          justifyContent: 'flex-end', 
          alignItems: 'center' 
        }}>
          {visualContent}
        </div>
      </BentoCard>
    );
  }

  return (
    <BentoCard className="card" style={{ marginBottom: '20px', padding: '24px', backgroundColor: 'var(--panel-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', position: 'relative', overflow: 'hidden', ...style }}>
      {closeButton}
      <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: 'var(--accent-color)', opacity: 0.03, borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'relative', zIndex: 1, paddingInlineEnd: '24px', textAlign: isRtl ? 'right' : 'left' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{title}</h3>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{description}</p>
        {badges && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            {badges}
          </div>
        )}
      </div>
    </BentoCard>
  );
};
