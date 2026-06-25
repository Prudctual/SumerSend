import React from 'react';

interface SkeletonViewProps {
  tab: string;
  lang: 'en' | 'ar';
}

export const SkeletonView: React.FC<SkeletonViewProps> = ({ tab, lang }) => {
  const isRtl = lang === 'ar';
  const alignStyle: React.CSSProperties = {
    textAlign: isRtl ? 'right' : 'left',
    direction: isRtl ? 'rtl' : 'ltr',
  };

  // Helper to render skeleton pulsing bars
  const Bar = ({ width, height = 12, marginBottom = 0, style = {} }: { width: string | number; height?: number; marginBottom?: number; style?: React.CSSProperties }) => (
    <div 
      className="skeleton-pulse skeleton-text" 
      style={{ 
        width, 
        height: `${height}px`, 
        marginBottom: `${marginBottom}px`, 
        ...style 
      }} 
    />
  );

  // Helper to render skeleton pulsing circles
  const Circle = ({ size, style = {} }: { size: number; style?: React.CSSProperties }) => (
    <div 
      className="skeleton-pulse skeleton-circle" 
      style={{ 
        width: `${size}px`, 
        height: `${size}px`, 
        ...style 
      }} 
    />
  );

  // Helper to render skeleton cards
  const Card = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <div className="skeleton-card" style={style}>
      {children}
    </div>
  );

  // 1. Dashboard Skeleton
  const renderDashboardSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 4 Metrics Cards */}
      <div className="dashboard-metric-grid">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} style={{ height: '110px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Bar width="80px" height={10} />
              <Circle size={28} />
            </div>
            <Bar width="120px" height={24} style={{ marginTop: '8px' }} />
            <Bar width="60px" height={8} />
          </Card>
        ))}
      </div>

      {/* Bento split grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px', width: '100%' }}>
        {/* Daily Traffic Analysis Chart Card */}
        <Card style={{ height: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <Bar width="160px" height={16} />
              <Bar width="100px" height={10} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Bar width="60px" height={28} style={{ borderRadius: '99px' }} />
              <Bar width="60px" height={28} style={{ borderRadius: '99px' }} />
            </div>
          </div>
          {/* Simulated chart bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flex: 1, height: '180px', padding: '10px 20px 0 20px', borderBottom: '1px solid var(--border-color)' }}>
            {[60, 120, 80, 150, 100, 170, 90, 140, 110, 160, 70, 130].map((h, idx) => (
              <div 
                key={idx} 
                className="skeleton-pulse" 
                style={{ 
                  width: '6%', 
                  height: `${h}px`, 
                  borderRadius: '4px 4px 0 0',
                  opacity: 0.7 - (idx % 3) * 0.15 
                }} 
              />
            ))}
          </div>
          {/* Chart X-axis labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Bar key={i} width="30px" height={8} />
            ))}
          </div>
        </Card>

        {/* Sent SMS Messages Card */}
        <Card style={{ height: '340px' }}>
          <div style={{ marginBottom: '20px' }}>
            <Bar width="180px" height={16} marginBottom={6} />
            <Bar width="120px" height={10} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i < 4 ? '12px' : '0', borderBottom: i < 4 ? '1px solid var(--border-color)' : 'none' }}>
                <Circle size={32} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Bar width="100px" height={11} />
                    <Bar width="50px" height={9} />
                  </div>
                  <Bar width="140px" height={9} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // 2. Messaging & Console Skeleton
  const renderConsoleSkeleton = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top pill tabs placeholder */}
      <div style={{ display: 'flex', gap: '8px', padding: '4px', background: 'var(--panel-muted)', borderRadius: '10px', width: 'fit-content', marginBottom: '8px' }}>
        {[1, 2, 3].map((i) => (
          <Bar key={i} width="110px" height={32} style={{ borderRadius: '8px' }} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '7.5fr 4.5fr', gap: '20px', width: '100%' }}>
        {/* Large form card */}
        <Card style={{ minHeight: '500px', gap: '24px' }}>
          <div>
            <Bar width="140px" height={16} marginBottom={6} />
            <Bar width="220px" height={10} />
          </div>
          
          {/* Form fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Bar width="100px" height={12} />
                <Bar width="100%" height={40} style={{ borderRadius: '8px' }} />
              </div>
            ))}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Bar width="80px" height={12} />
              <Bar width="100%" height={140} style={{ borderRadius: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <Bar width="140px" height={42} style={{ borderRadius: '99px' }} />
              <Bar width="100px" height={42} style={{ borderRadius: '99px', opacity: 0.5 }} />
            </div>
          </div>
        </Card>

        {/* Phone Simulator Card */}
        <Card style={{ minHeight: '500px', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          {/* Outer bezel */}
          <div style={{ width: '100%', maxWidth: '270px', height: '450px', border: '8px solid var(--border-color)', borderRadius: '36px', position: 'relative', display: 'flex', flexDirection: 'column', background: 'var(--bg-color)', overflow: 'hidden' }}>
            {/* Notch */}
            <div style={{ width: '90px', height: '18px', backgroundColor: 'var(--border-color)', borderRadius: '0 0 12px 12px', margin: '0 auto', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }} />
            
            {/* Simulator screen content */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '36px 16px 16px 16px', gap: '16px' }}>
              {/* Top info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Circle size={28} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <Bar width="70px" height={9} />
                  <Bar width="40px" height={7} />
                </div>
              </div>
              
              {/* Chat bubbles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%', padding: '10px', borderRadius: '14px 14px 14px 2px', background: 'var(--panel-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Bar width="120px" height={8} />
                  <Bar width="90px" height={8} />
                </div>
                <div style={{ alignSelf: 'flex-end', maxWidth: '80%', padding: '10px', borderRadius: '14px 14px 2px 14px', background: 'rgba(2, 132, 199, 0.1)', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                  <Bar width="130px" height={8} style={{ background: 'rgba(2, 132, 199, 0.2)' }} />
                  <Bar width="70px" height={8} style={{ background: 'rgba(2, 132, 199, 0.2)' }} />
                </div>
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%', padding: '10px', borderRadius: '14px 14px 14px 2px', background: 'var(--panel-muted)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Bar width="100px" height={8} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  // 3. Subscribers & Table Skeleton (used for logs, subscribers)
  const renderTableSkeleton = (rowCount = 7, colCount = 5) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
      {/* Search and control bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
        <Bar width="260px" height={38} style={{ borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '10px' }}>
          <Bar width="110px" height={38} style={{ borderRadius: '99px' }} />
          <Bar width="90px" height={38} style={{ borderRadius: '99px', opacity: 0.6 }} />
        </div>
      </div>

      {/* Main table card */}
      <Card style={{ padding: '0px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}>
          <table className="v-table">
            <thead>
              <tr>
                {Array.from({ length: colCount }).map((_, i) => (
                  <th key={i}>
                    <Bar width={i === 0 ? '30px' : i === 1 ? '120px' : '80px'} height={10} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rowCount }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: colCount }).map((_, c) => (
                    <td key={c}>
                      {c === 0 ? (
                        <Bar width="18px" height={18} style={{ borderRadius: '4px' }} />
                      ) : c === 1 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Circle size={28} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <Bar width="100px" height={11} />
                            <Bar width="60px" height={8} />
                          </div>
                        </div>
                      ) : c === colCount - 1 ? (
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Bar width="60px" height={22} style={{ borderRadius: '99px' }} />
                        </div>
                      ) : (
                        <Bar width="80px" height={10} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // 4. Sidebar + Content Panel Skeleton (used for developer hub, channels, settings)
  const renderSidebarContentSkeleton = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', width: '100%', minHeight: '450px' }}>
      {/* Settings sub-sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {[1, 2, 3, 4].map((i) => (
          <Bar key={i} width="100%" height={36} style={{ borderRadius: '8px', opacity: i === 1 ? 1 : 0.4 }} />
        ))}
      </div>

      {/* Main settings panel */}
      <Card style={{ gap: '24px' }}>
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
          <Bar width="200px" height={18} marginBottom={6} />
          <Bar width="320px" height={10} />
        </div>

        {/* Content rows / form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none', paddingBottom: i < 3 ? '20px' : '0' }}>
              <Bar width="120px" height={12} />
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
                <Bar width="100%" height={38} style={{ borderRadius: '8px', flex: 1 }} />
                {i === 2 && <Bar width="80px" height={38} style={{ borderRadius: '8px' }} />}
              </div>
              <Bar width="240px" height={8} style={{ opacity: 0.6 }} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Determine which skeleton structure to render based on the current tab
  const getSkeletonLayout = () => {
    if (tab === 'dashboard') {
      return renderDashboardSkeleton();
    }
    if (['send', 'playground', 'campaigns', 'templates'].includes(tab)) {
      return renderConsoleSkeleton();
    }
    if (['subscribers', 'subscribers-list', 'subscribers-settings'].includes(tab)) {
      return renderTableSkeleton(6, 5);
    }
    if (['logs', 'reports', 'logs-list'].includes(tab)) {
      return renderTableSkeleton(8, 6);
    }
    // Default fallback for channels, developer settings, billing etc.
    return renderSidebarContentSkeleton();
  };

  return (
    <div style={{ ...alignStyle, width: '100%' }}>
      {getSkeletonLayout()}
    </div>
  );
};
