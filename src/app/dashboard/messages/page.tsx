"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Archive, ArrowUpDown, CheckCircle2, Clock, File, FileText, Filter, Inbox, Mail, Paperclip, Plus, Search as SearchIcon, Send, Star, Tag, Trash2 } from "lucide-react";
import { useMessages } from "@/contexts/MessagesContext";
import { MessageFolder, Message } from "@/lib/types/messages";
import ComposeModal from "@/components/messages/ComposeModal";

export default function MessagesPage() {
  const router = useRouter();
  const { 
    messages, 
    isLoading,
    activeFolder, 
    setActiveFolder, 
    unreadCount, 
    draftsCount,
    archivedCount,
    markAsRead, 
    toggleStar, 
    toastMessage,
    editingDraft,
    setEditingDraft 
  } = useMessages();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");

  const folders: { id: MessageFolder; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "inbox", label: "Inbox", icon: Inbox, badge: unreadCount },
    { id: "unread", label: "Unread", icon: Mail },
    { id: "starred", label: "Starred", icon: Star },
    { id: "sent", label: "Sent", icon: Send },
    { id: "drafts", label: "Drafts", icon: File, badge: draftsCount },
    { id: "archived", label: "Archived", icon: Archive, badge: archivedCount },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  const filteredMessages = useMemo(() => {
    let filtered = messages;
    
    // Folder filter
    if (activeFolder === "unread") {
      filtered = filtered.filter(m => m.status === "unread" && m.folder !== "trash");
    } else if (activeFolder === "starred") {
      filtered = filtered.filter(m => m.isStarred && m.folder !== "trash");
    } else {
      filtered = filtered.filter(m => m.folder === activeFolder);
    }

    // Toggle unread filter
    if (filterUnread) {
      filtered = filtered.filter(m => m.status === "unread");
    }

    // Priority filter
    if (filterPriority !== "all") {
      filtered = filtered.filter(m => m.priority === filterPriority);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => 
        m.subject.toLowerCase().includes(q) ||
        m.sender.name.toLowerCase().includes(q) ||
        m.sender.email.toLowerCase().includes(q) ||
        m.recipient.name.toLowerCase().includes(q) ||
        m.recipient.email.toLowerCase().includes(q) ||
        m.preview.toLowerCase().includes(q)
      );
    }

    // Sorting (Newest or Oldest)
    return [...filtered].sort((a, b) => {
      const timeA = new Date(a.lastSaved || a.timestamp).getTime();
      const timeB = new Date(b.lastSaved || b.timestamp).getTime();
      return sortBy === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [messages, activeFolder, searchQuery, filterUnread, filterPriority, sortBy]);

  const handleMessageClick = (msg: Message) => {
    if (activeFolder === "drafts" || msg.folder === "drafts" || msg.status === "draft") {
      setEditingDraft(msg);
      setIsComposeOpen(true);
      return;
    }

    if (msg.status === "unread") {
      markAsRead(msg.id);
    }
    router.push(`/dashboard/messages/${msg.id}`);
  };

  const handleOpenNewCompose = () => {
    setEditingDraft(null);
    setIsComposeOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-canvas text-ink overflow-hidden relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-control bg-positive text-white font-semibold text-body shadow-overlay flex items-center gap-3"
          >
            <CheckCircle2 size={18} />
            <span>{typeof toastMessage === "string" ? toastMessage : toastMessage.text}</span>
            {typeof toastMessage === "object" && toastMessage.actionText && (
              <button
                onClick={toastMessage.onAction}
                className="ml-2 px-2.5 py-0.5 rounded-control bg-surface/20 hover:bg-surface/30 text-white font-semibold text-caption transition-colors underline cursor-pointer"
              >
                {toastMessage.actionText}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-line hidden md:flex flex-col bg-surface/60">
        <div className="p-4">
          <button 
            onClick={handleOpenNewCompose}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-control bg-ink text-body font-medium text-white transition-colors hover:bg-ink-2 active:translate-y-px"
          >
            <Plus size={15} strokeWidth={2} aria-hidden />
            New message
          </button>
        </div>
        
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {folders.map(folder => {
            const Icon = folder.icon;
            const isActive = activeFolder === folder.id;
            return (
              <button
                key={folder.id}
                onClick={() => setActiveFolder(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-panel text-body font-semibold transition-colors ${
                  isActive 
                    ? "bg-brand-soft text-brand-strong" 
                    : "text-ink-3 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-brand-strong" : "text-ink-3"} />
                  {folder.label}
                </div>
                {folder.badge !== undefined && folder.badge > 0 && (
                  <span className={`text-caption font-semibold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-ink text-white" : "bg-surface-2 text-ink-3 border border-line/50"
                  }`}>
                    {folder.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Message List */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Toolbar */}
        <div className="h-16 border-b border-line flex items-center px-4 sm:px-6 justify-between shrink-0 bg-surface/80 gap-3">
          <div className="flex-1 max-w-md relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input 
              type="text" 
              placeholder={`Search in ${activeFolder}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-2/60 border border-line rounded-control pl-9 pr-4 py-2 text-body text-ink outline-none focus:border-line-strong transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(prev => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-control bg-surface-2/60 border border-line text-caption font-semibold text-ink-3 hover:text-ink transition-colors"
              title="Toggle Sort Order"
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{sortBy === "newest" ? "Newest" : "Oldest"}</span>
            </button>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-surface-2/60 border border-line rounded-control px-3 py-1.5 text-caption font-semibold text-ink-3 outline-none cursor-pointer"
            >
              <option value="all">All Priority</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            {/* Unread Filter Toggle */}
            <button 
              onClick={() => setFilterUnread(!filterUnread)}
              className={`p-2 rounded-full border transition-colors ${
                filterUnread 
                  ? 'bg-brand-soft border-line-strong text-brand-strong' 
                  : 'bg-surface-2/60 border-line text-ink-3 hover:text-ink'
              }`}
              title="Filter unread"
            >
              <Filter size={16} />
            </button>

            <button className="md:hidden p-2 rounded-full bg-ink text-white" onClick={handleOpenNewCompose}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Message List Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              // Loading Skeleton
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-20 rounded-panel bg-surface border border-line animate-pulse p-4" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredMessages.length === 0 ? (
                  // Custom Empty States for Drafts, Archived, and standard folders
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-24 text-center text-ink-3"
                  >
                    {activeFolder === "drafts" ? (
                      <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3"><FileText size={20} strokeWidth={1.6} aria-hidden /></div>
                        <h3 className="mb-1 text-[1.0625rem] font-semibold leading-6 text-ink">No drafts</h3>
                        <p className="text-body text-ink-3 max-w-sm">
                          Your saved drafts will appear here.
                        </p>
                      </>
                    ) : activeFolder === "archived" ? (
                      <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3"><Archive size={20} strokeWidth={1.6} aria-hidden /></div>
                        <h3 className="mb-1 text-[1.0625rem] font-semibold leading-6 text-ink">No archived messages</h3>
                        <p className="text-body text-ink-3 max-w-sm">
                          Archived conversations will appear here.
                        </p>
                      </>
                    ) : activeFolder === "sent" ? (
                      <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3"><Send size={20} strokeWidth={1.6} aria-hidden /></div>
                        <h3 className="mb-1 text-[1.0625rem] font-semibold leading-6 text-ink">No sent messages</h3>
                        <p className="text-body text-ink-3 max-w-sm">
                          Messages you compose and send will appear here.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-ink-3"><Inbox size={20} strokeWidth={1.6} aria-hidden /></div>
                        <h3 className="mb-1 text-[1.0625rem] font-semibold leading-6 text-ink">No messages</h3>
                        <p className="text-body text-ink-3 max-w-sm">
                          You&apos;re all caught up in {activeFolder}.
                        </p>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div 
                    variants={containerVariants} 
                    initial="hidden" 
                    animate="show"
                    className="space-y-3"
                  >
                    {filteredMessages.map(msg => {
                      const isDraft = msg.folder === "drafts" || msg.status === "draft";
                      const displayUser = (activeFolder === "sent" || isDraft) ? msg.recipient : msg.sender;

                      const formattedTime = new Date(msg.lastSaved || msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      });
                      const formattedDate = new Date(msg.lastSaved || msg.timestamp).toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric' 
                      });

                      return (
                        <motion.div 
                          key={msg.id}
                          variants={itemVariants}
                          onClick={() => handleMessageClick(msg)}
                          className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-panel border cursor-pointer transition-all duration-200  hover:shadow-overlay hover:shadow-black/5 ${
                            msg.status === "unread" 
                              ? "bg-surface border-line-strong " 
                              : "bg-surface/70 border-line hover:bg-surface hover:border-line/80"
                          }`}
                        >
                          {/* Unread Bar Indicator */}
                          {msg.status === "unread" && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-ink rounded-r-full" />
                          )}

                          {/* Star / Avatar */}
                          <div className="flex items-center gap-3 shrink-0 sm:pl-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}
                              className={`p-1 rounded-full transition-colors ${
                                msg.isStarred 
                                  ? 'text-brand-strong hover:text-ink' 
                                  : 'text-ink-3 hover:text-ink hover:bg-surface-2'
                              }`}
                            >
                              <Star size={18} fill={msg.isStarred ? "currentColor" : "none"} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-surface-2 border border-line flex items-center justify-center shrink-0 overflow-hidden text-body font-semibold text-ink-3">
                              {displayUser?.avatar ? (
                                <img src={displayUser.avatar} alt={displayUser.name} className="w-full h-full object-cover" />
                              ) : (
                                (displayUser?.name || displayUser?.email || "M").charAt(0).toUpperCase()
                              )}
                            </div>
                          </div>

                          {/* Message Metadata & Body Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1 gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <h4 className={`text-body truncate ${msg.status === "unread" ? 'font-semibold text-ink' : 'font-semibold text-ink/80'}`}>
                                  {isDraft 
                                    ? `Draft: ${displayUser?.name || displayUser?.email || 'Recipient'}` 
                                    : activeFolder === "sent" 
                                    ? `To: ${displayUser?.name || displayUser?.email}` 
                                    : displayUser?.name || displayUser?.email}
                                </h4>

                                {/* Priority Badge */}
                                {msg.priority === "high" && (
                                  <span className="px-1.5 py-0.5 rounded bg-critical/10 border border-critical/30 text-critical text-caption font-semibold">
                                    High
                                  </span>
                                )}
                                {isDraft && (
                                  <span className="px-1.5 py-0.5 rounded bg-brand-soft border border-line text-brand-strong text-caption font-semibold">
                                    Draft
                                  </span>
                                )}
                              </div>

                              <span className={`text-caption whitespace-nowrap ml-2 flex items-center gap-1 ${msg.status === "unread" ? 'font-semibold text-brand-strong' : 'text-ink-3'}`}>
                                <Clock size={12} className="opacity-70" />
                                {formattedDate} {formattedTime}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className={`text-body font-semibold truncate ${msg.status === "unread" ? 'text-ink' : 'text-ink/90'}`}>
                                {msg.subject || "(No Subject)"}
                              </span>
                              <span className="hidden sm:inline text-caption text-ink-3 truncate flex-1">
                                - {msg.preview || "(No content)"}
                              </span>
                            </div>
                            <span className="sm:hidden text-caption text-ink-3 truncate block mt-1">
                              {msg.preview || "(No content)"}
                            </span>
                          </div>

                          {/* Attachment Icon */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="absolute right-4 bottom-4 sm:static flex items-center justify-center p-1.5 rounded-control bg-surface-2 border border-line text-ink-3" title={`${msg.attachments.length} attachment(s)`}>
                              <Paperclip size={14} />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <ComposeModal 
        isOpen={isComposeOpen} 
        onClose={() => {
          setIsComposeOpen(false);
          setEditingDraft(null);
        }} 
        draftData={editingDraft}
      />
    </div>
  );
}
