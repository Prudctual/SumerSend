import React from 'react';
import {
  FileText,
  Megaphone,
  Gift,
  MessageSquare,
  Building,
  Package,
  BarChart2,
  Lock,
  Coins,
  BookOpen,
  Receipt,
  Star,
  Bell,
  Rocket,
  Bot,
  Sparkles,
  Globe,
  Settings,
  Mail,
  Phone,
  HelpCircle,
  Info,
  Terminal,
  Activity,
  CheckCircle2,
  LayoutDashboard,
  History,
  Wallet,
  Languages,
  Plus
} from 'lucide-react';

const emojiMap: Record<string, any> = {
  // Emojis to Lucide components
  '📝': FileText,
  '📣': Megaphone,
  '🎁': Gift,
  '💬': MessageSquare,
  '🏨': Building,
  '📦': Package,
  '📊': BarChart2,
  '🔐': Lock,
  '💰': Coins,
  '📚': BookOpen,
  '🧾': Receipt,
  '⭐': Star,
  '🔔': Bell,
  '🚀': Rocket,
  '🤖': Bot,
  '✨': Sparkles,
  '🌐': Globe,
  '⚙️': Settings,
  '✉️': Mail,
  '📞': Phone,
  '💡': Info,
  '🛠️': Settings,
  '🖥️': Terminal,
  '📈': Activity,
  '✔️': CheckCircle2,
  '✓': CheckCircle2,
  '🛒': Package,
  '⚠️': Info,
  '🩺': Activity,
  '🍆': Bot, // fallback
  '✆': Phone,
  '✉': Mail,
  
  // Icon names to Lucide components
  'FileText': FileText,
  'Megaphone': Megaphone,
  'Gift': Gift,
  'MessageSquare': MessageSquare,
  'Building': Building,
  'Package': Package,
  'BarChart2': BarChart2,
  'Lock': Lock,
  'Coins': Coins,
  'BookOpen': BookOpen,
  'Receipt': Receipt,
  'Star': Star,
  'Bell': Bell,
  'Rocket': Rocket,
  'Bot': Bot,
  'Sparkles': Sparkles,
  'Globe': Globe,
  'Settings': Settings,
  'Mail': Mail,
  'Phone': Phone,
  'HelpCircle': HelpCircle,
  'Info': Info,
  'Terminal': Terminal,
  'LayoutDashboard': LayoutDashboard,
  'History': History,
  'Wallet': Wallet,
  'Languages': Languages,
  'Plus': Plus
};

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  color?: string;
}

export const renderTemplateIcon = (name: string, size = 16, className = '', color?: string, style?: React.CSSProperties) => {
  const IconComponent = emojiMap[name] || emojiMap[name.trim()] || HelpCircle;
  return <IconComponent size={size} className={className} color={color} style={style} />;
};

export const IconHelper: React.FC<IconProps> = ({ name, size = 16, className = '', color, style }) => {
  const IconComponent = emojiMap[name] || emojiMap[name.trim()] || HelpCircle;
  return <IconComponent size={size} className={className} color={color} style={style} />;
};
