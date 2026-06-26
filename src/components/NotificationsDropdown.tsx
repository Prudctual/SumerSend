import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

interface NotificationsDropdownProps {
  lang: 'ar' | 'en';
}

export default function NotificationsDropdown({ lang }: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper to format time elapsed
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) {
      return lang === 'ar' ? 'الآن' : 'just now';
    }
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return lang === 'ar' 
        ? `منذ ${minutes} دقيقة` 
        : `${minutes}m ago`;
    }
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return lang === 'ar' 
        ? `منذ ${hours} ساعة` 
        : `${hours}h ago`;
    }
    const days = Math.floor(hours / 24);
    return lang === 'ar' 
      ? `منذ ${days} يوم` 
      : `${days}d ago`;
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/notifications/read-all', {
        method: 'PUT',
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { 
            message: lang === 'ar' ? 'تم تحديد كل الإشعارات كمقروءة' : 'Marked all notifications as read', 
            type: 'success' 
          }
        }));
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:3000/api/notifications/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/notifications', {
        method: 'DELETE',
      });
      if (res.ok) {
        setNotifications([]);
        window.dispatchEvent(new CustomEvent('sumer-toast', {
          detail: { 
            message: lang === 'ar' ? 'تم مسح جميع الإشعارات' : 'Cleared all notifications', 
            type: 'success' 
          }
        }));
      }
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={16} className="nt-icon-success" />;
      case 'warning':
        return <AlertTriangle size={16} className="nt-icon-warning" />;
      case 'error':
        return <XCircle size={16} className="nt-icon-error" />;
      default:
        return <Info size={16} className="nt-icon-info" />;
    }
  };

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        className="navbar-notification-btn" 
        onClick={() => setIsOpen(!isOpen)}
        title={lang === 'ar' ? 'الإشعارات' : 'Notifications'}
      >
        <Bell size={15} />
        {unreadCount > 0 && <span className="navbar-notification-dot"></span>}
      </button>

      {isOpen && (
        <div className={`notifications-popover ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
          <div className="notifications-header">
            <span className="notifications-title">
              {lang === 'ar' ? 'الإشعارات' : 'Notifications'}
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </span>
            {notifications.length > 0 && (
              <div className="notifications-actions">
                <button className="text-btn" onClick={handleMarkAllAsRead}>
                  {lang === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                </button>
                <span className="divider">|</span>
                <button className="text-btn danger" onClick={handleClearAll}>
                  {lang === 'ar' ? 'مسح الكل' : 'Clear all'}
                </button>
              </div>
            )}
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="notifications-empty">
                <Bell size={32} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                <span>{lang === 'ar' ? 'لا توجد إشعارات حالياً' : 'No notifications yet'}</span>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`notification-item ${!n.isRead ? 'unread' : ''}`}>
                  <div className="notification-status-indicator">
                    {!n.isRead && <span className="unread-dot"></span>}
                    {renderIcon(n.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title-row">
                      <span className="notification-title-text">{n.title}</span>
                      <span className="notification-time">{formatTime(n.createdAt)}</span>
                    </div>
                    <p className="notification-body">{n.body}</p>
                    <div className="notification-item-actions">
                      {!n.isRead && (
                        <button 
                          className="action-btn-read" 
                          onClick={() => handleMarkAsRead(n.id)}
                          title={lang === 'ar' ? 'تحديد كمقروء' : 'Mark as read'}
                        >
                          <Check size={12} />
                        </button>
                      )}
                      <button 
                        className="action-btn-delete" 
                        onClick={() => handleDelete(n.id)}
                        title={lang === 'ar' ? 'حذف' : 'Delete'}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
