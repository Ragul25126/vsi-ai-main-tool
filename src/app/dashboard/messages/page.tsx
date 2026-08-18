"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Inbox, Send, File, Star, Archive, Trash2, Search as SearchIcon, 
  Filter, Plus, Paperclip, Mail, CheckCircle2, ArrowUpDown, Tag, AlertCircle, Clock
} from "lucide-react";
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
    <div className="flex h-[calc(100vh-64px)] bg-background text-foreground overflow-hidden relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-full bg-emerald-500 text-white font-semibold text-sm shadow-xl flex items-center gap-3"
          >
            <CheckCircle2 size={18} />
            <span>{typeof toastMessage === "string" ? toastMessage : toastMessage.text}</span>
            {typeof toastMessage === "object" && toastMessage.actionText && (
              <button
                onClick={toastMessage.onAction}
                className="ml-2 px-2.5 py-0.5 rounded-md bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition-colors underline cursor-pointer"
              >
                {toastMessage.actionText}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border hidden md:flex flex-col bg-card/60">
        <div className="p-4">
          <button 
            onClick={handleOpenNewCompose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white font-bold rounded-[16px] shadow-lg shadow-[#FF6B00]/20 transition-all hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Compose Message
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
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? "bg-[#FF6B00]/10 text-[#FF6B00]" 
                    : "text-muted-foreground hover:bg-muted-bg hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-[#FF6B00]" : "text-muted-foreground"} />
                  {folder.label}
                </div>
                {folder.badge !== undefined && folder.badge > 0 && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? "bg-[#FF6B00] text-white" : "bg-muted-bg text-muted-foreground border border-border/50"
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
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Toolbar */}
        <div className="h-16 border-b border-border flex items-center px-4 sm:px-6 justify-between shrink-0 bg-card/80 backdrop-blur-md gap-3">
          <div className="flex-1 max-w-md relative">
            <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              placeholder={`Search in ${activeFolder}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted-bg/60 border border-border rounded-full pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-[#FF6B00]/50 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(prev => prev === "newest" ? "oldest" : "newest")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted-bg/60 border border-border text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Sort Order"
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{sortBy === "newest" ? "Newest" : "Oldest"}</span>
            </button>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-muted-bg/60 border border-border rounded-full px-3 py-1.5 text-xs font-semibold text-muted-foreground outline-none cursor-pointer"
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
                  ? 'bg-[#FF6B00]/10 border-[#FF6B00]/50 text-[#FF6B00]' 
                  : 'bg-muted-bg/60 border-border text-muted-foreground hover:text-foreground'
              }`}
              title="Filter unread"
            >
              <Filter size={16} />
            </button>

            <button className="md:hidden p-2 rounded-full bg-[#FF6B00] text-white" onClick={handleOpenNewCompose}>
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
                  <div key={i} className="h-20 rounded-[20px] bg-card border border-border animate-pulse p-4" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {filteredMessages.length === 0 ? (
                  // Custom Empty States for Drafts, Archived, and standard folders
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground"
                  >
                    {activeFolder === "drafts" ? (
                      <>
                        <div className="text-5xl mb-4 select-none">📝</div>
                        <h3 className="text-xl font-bold text-foreground mb-1">No Drafts</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Your saved drafts will appear here.
                        </p>
                      </>
                    ) : activeFolder === "archived" ? (
                      <>
                        <div className="text-5xl mb-4 select-none">📦</div>
                        <h3 className="text-xl font-bold text-foreground mb-1">No Archived Messages</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Archived conversations will appear here.
                        </p>
                      </>
                    ) : activeFolder === "sent" ? (
                      <>
                        <div className="text-5xl mb-4 select-none">📨</div>
                        <h3 className="text-xl font-bold text-foreground mb-1">No Sent Messages</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Messages you compose and send will appear here.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-5xl mb-4 select-none">📥</div>
                        <h3 className="text-xl font-bold text-foreground mb-1">No Messages Found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
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
                          className={`group relative flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-[20px] border cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 ${
                            msg.status === "unread" 
                              ? "bg-card border-[#FF6B00]/50 shadow-md" 
                              : "bg-card/70 border-border hover:bg-card hover:border-border/80"
                          }`}
                        >
                          {/* Unread Bar Indicator */}
                          {msg.status === "unread" && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#FF6B00] rounded-r-full" />
                          )}

                          {/* Star / Avatar */}
                          <div className="flex items-center gap-3 shrink-0 sm:pl-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleStar(msg.id); }}
                              className={`p-1 rounded-full transition-colors ${
                                msg.isStarred 
                                  ? 'text-amber-400 hover:text-amber-500' 
                                  : 'text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10'
                              }`}
                            >
                              <Star size={18} fill={msg.isStarred ? "currentColor" : "none"} />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-muted-bg border border-border flex items-center justify-center shrink-0 overflow-hidden text-sm font-bold text-muted-foreground">
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
                                <h4 className={`text-sm truncate ${msg.status === "unread" ? 'font-bold text-foreground' : 'font-semibold text-foreground/80'}`}>
                                  {isDraft 
                                    ? `Draft: ${displayUser?.name || displayUser?.email || 'Recipient'}` 
                                    : activeFolder === "sent" 
                                    ? `To: ${displayUser?.name || displayUser?.email}` 
                                    : displayUser?.name || displayUser?.email}
                                </h4>

                                {/* Priority Badge */}
                                {msg.priority === "high" && (
                                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-bold uppercase">
                                    High
                                  </span>
                                )}
                                {isDraft && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase">
                                    Draft
                                  </span>
                                )}
                              </div>

                              <span className={`text-xs whitespace-nowrap ml-2 flex items-center gap-1 ${msg.status === "unread" ? 'font-bold text-[#FF6B00]' : 'text-muted-foreground'}`}>
                                <Clock size={12} className="opacity-70" />
                                {formattedDate} {formattedTime}
                              </span>
                            </div>

                            <div className="flex items-baseline gap-2">
                              <span className={`text-sm font-semibold truncate ${msg.status === "unread" ? 'text-foreground' : 'text-foreground/90'}`}>
                                {msg.subject || "(No Subject)"}
                              </span>
                              <span className="hidden sm:inline text-xs text-muted-foreground truncate flex-1">
                                — {msg.preview || "(No content)"}
                              </span>
                            </div>
                            <span className="sm:hidden text-xs text-muted-foreground truncate block mt-1">
                              {msg.preview || "(No content)"}
                            </span>
                          </div>

                          {/* Attachment Icon */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="absolute right-4 bottom-4 sm:static flex items-center justify-center p-1.5 rounded-full bg-muted-bg border border-border text-muted-foreground" title={`${msg.attachments.length} attachment(s)`}>
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
      </main>

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
