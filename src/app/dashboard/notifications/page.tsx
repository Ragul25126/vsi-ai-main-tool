"use client";

import React, { useState, useMemo } from "react";
import { Bell, Check, Trash2, Search, UserPlus, FileText, AlertCircle, ChevronRight, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNotifications, NotificationType, Notification } from "@/contexts/NotificationsContext";
import { motion } from "framer-motion";

export default function NotificationsPage() {
  const router = useRouter();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isNavigating, setIsNavigating] = useState(false);

  // Handlers
  const handleNavigateBack = () => {
    setIsNavigating(true);
    router.back();
  };

  const handleNotificationClick = (notification: Notification) => {
    setIsNavigating(true);
    router.push(`/dashboard/notifications/${notification.slug}`);
  };

  // Filtering & Search
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter(n => {
        if (filter === 'unread' && n.isRead) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          return n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q);
        }
        return true;
      });
  }, [notifications, filter, searchQuery]);

  // Icon mapping
  const getIcon = (type: NotificationType) => {
    switch(type) {
      case 'alert': return <AlertCircle size={16} className="text-critical" />;
      case 'system': return <Info size={16} className="text-brand-strong" />;
      case 'report': return <FileText size={16} className="text-primary" />;
      case 'user': return <UserPlus size={16} className="text-positive" />;
      default: return <Bell size={16} className="text-info" />;
    }
  };

  const getIconBg = (type: NotificationType) => {
    switch(type) {
      case 'alert': return 'bg-critical/10 border-critical/30';
      case 'system': return 'bg-brand-soft border-line';
      case 'report': return 'bg-primary/10 border-primary/20';
      case 'user': return 'bg-positive/10 border-positive/30';
      default: return 'bg-info/10 border-info/30';
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-4 sm:p-8 max-w-[1200px] mx-auto font-sans transition-colors bg-canvas min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/50 ">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <p className="text-body font-semibold text-ink">Navigating...</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-line/80 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={handleNavigateBack}
            className="p-2 rounded-full hover:bg-surface-2 text-ink-3 hover:text-ink transition-colors"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-display font-semibold text-ink flex items-center gap-2">
                Notifications
                {unreadCount > 0 && (
                  <span className="text-caption font-semibold bg-ink text-white px-2.5 py-0.5 rounded-control">
                    {unreadCount} New
                  </span>
                )}
              </h1>
            </div>
            <p className="text-caption sm:text-body text-ink-3 mt-1 font-medium">
              Manage your system alerts, reports, and AI engine updates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 rounded-control bg-surface border border-line text-ink hover:bg-surface-2 text-caption font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              <Check size={14} />
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Controls: Search and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Tabs */}
        <div className="flex items-center p-1 bg-surface border border-line/80 rounded-control w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-caption font-semibold transition-all ${
              filter === 'all' 
                ? 'bg-ink text-white ' 
                : 'text-ink-3 hover:text-ink hover:bg-surface-2'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-1.5 rounded-full text-caption font-semibold transition-all flex items-center gap-1.5 ${
              filter === 'unread' 
                ? 'bg-ink text-white ' 
                : 'text-ink-3 hover:text-ink hover:bg-surface-2'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className={`w-1.5 h-1.5 rounded-full ${filter === 'unread' ? 'bg-surface' : 'bg-ink'}`} />
            )}
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-surface border border-line rounded-control pl-9 pr-4 py-2 text-caption text-ink placeholder:text-ink-3 focus:outline-none focus:border-line-strong focus:ring-2 focus:ring-ink/10 transition-all"
          />
        </div>
      </div>

      {/* Notifications List */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {filteredNotifications.length === 0 ? (
          <motion.div variants={itemVariants} className="rounded-panel border border-dashed border-line bg-surface p-12 text-center mt-8">
            <Bell size={36} className="text-ink-3/50 mx-auto mb-3" />
            <p className="text-base font-semibold text-ink mb-1">No notifications</p>
            <p className="text-caption text-ink-3 max-w-md mx-auto">
              {searchQuery ? "We couldn't find any notifications matching your search." : "You're all caught up! There are no notifications to display right now."}
            </p>
          </motion.div>
        ) : (
          filteredNotifications.map((notification) => (
            <motion.div 
              key={notification.id}
              variants={itemVariants}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`group relative flex flex-col sm:flex-row gap-4 p-5 rounded-panel border transition-all duration-300 cursor-pointer ${
                notification.isRead 
                  ? 'bg-surface border-line/80 hover:border-line ' 
                  : 'bg-surface border-line hover:border-line '
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Unread Indicator */}
              {!notification.isRead && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ink rounded-r-full" />
              )}

              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-full border flex items-center justify-center ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className={`text-body font-semibold truncate ${notification.isRead ? 'text-ink' : 'text-ink'}`}>
                    {notification.title}
                  </h3>
                  <span className="text-caption font-semibold text-ink-3 shrink-0 whitespace-nowrap bg-surface-2 px-2 py-0.5 rounded-control border border-line group-hover:border-line transition-colors">
                    {notification.timestamp}
                  </span>
                </div>
                <p className={`text-caption ${notification.isRead ? 'text-ink-3' : 'text-ink/90 font-medium'}`}>
                  {notification.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 sm:mt-0 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(notification.id); }}
                    className="p-2 rounded-control bg-surface-2 hover:bg-positive/10 text-ink-3 hover:text-positive transition-colors border border-transparent hover:border-positive/30"
                    title="Mark as Read"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                  className="p-2 rounded-control bg-surface-2 hover:bg-critical/10 text-ink-3 hover:text-critical transition-colors border border-transparent hover:border-critical/30"
                  title="Delete Notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
