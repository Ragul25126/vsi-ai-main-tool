"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Message, MessageFolder, ComposeDraft, ToastPayload } from "@/lib/types/messages";

interface MessagesContextProps {
  messages: Message[];
  isLoading: boolean;
  activeFolder: MessageFolder;
  setActiveFolder: (folder: MessageFolder) => void;
  unreadCount: number;
  draftsCount: number;
  archivedCount: number;
  toastMessage: ToastPayload;
  setToastMessage: (msg: ToastPayload) => void;
  refreshMessages: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAsUnread: (id: string) => Promise<void>;
  toggleStar: (id: string) => Promise<void>;
  moveToFolder: (id: string, folder: MessageFolder) => Promise<void>;
  archiveMessage: (id: string) => Promise<void>;
  moveToInbox: (id: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  deleteDraft: (id: string) => Promise<void>;
  deletePermanently: (id: string) => Promise<void>;
  restoreMessage: (id: string, folder?: MessageFolder) => Promise<void>;
  updateMessageLabels: (id: string, labels: string[]) => Promise<void>;
  updateMessage: (id: string, updates: Partial<Message>) => Promise<void>;
  sendMessage: (draft: ComposeDraft) => Promise<void>;
  saveDraft: (draft: ComposeDraft) => Promise<string | undefined>;
  editingDraft: Message | null;
  setEditingDraft: (msg: Message | null) => void;
}

const MessagesContext = createContext<MessagesContextProps | undefined>(undefined);

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFolder, setActiveFolder] = useState<MessageFolder>("inbox");
  const [toastMessage, setToastMessage] = useState<ToastPayload>(null);
  const [editingDraft, setEditingDraft] = useState<Message | null>(null);

  // Fetch messages from backend API
  const refreshMessages = useCallback(async () => {
    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.messages)) {
          setMessages(json.messages);
        }
      }
    } catch (e) {
      console.error("Failed to fetch messages from API", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMessages();
    // Auto sync every 15 seconds for realtime multi-device sync
    const interval = setInterval(() => {
      refreshMessages();
    }, 15000);
    return () => clearInterval(interval);
  }, [refreshMessages]);

  const unreadCount = messages.filter(m => m.status === "unread" && m.folder === "inbox").length;
  const draftsCount = messages.filter(m => m.folder === "drafts").length;
  const archivedCount = messages.filter(m => m.folder === "archived").length;

  const markAsRead = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "read", updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "read" })
      });
    } catch {}
  };

  const markAsUnread = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: "unread", updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "unread" })
      });
    } catch {}
  };

  const toggleStar = async (id: string) => {
    const target = messages.find(m => m.id === id);
    if (!target) return;
    const newStar = !target.isStarred;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: newStar, updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isStarred: newStar })
      });
    } catch {}
  };

  const moveToFolder = async (id: string, folder: MessageFolder) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder, updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, folder })
      });
    } catch {}
  };

  const archiveMessage = async (id: string) => {
    await moveToFolder(id, "archived");
    setToastMessage("Message moved to Archive");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const moveToInbox = async (id: string) => {
    await moveToFolder(id, "inbox");
    setToastMessage("Message moved to Inbox");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deleteMessage = async (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, folder: "trash", updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, folder: "trash" })
      });
    } catch {}
  };

  const deleteDraft = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {}
    setToastMessage("Draft discarded.");
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deletePermanently = async (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    try {
      await fetch(`/api/messages?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    } catch {}
  };

  const restoreMessage = async (id: string, folder: MessageFolder = "inbox") => {
    await moveToFolder(id, folder);
  };

  const updateMessageLabels = async (id: string, labels: string[]) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, labels, updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, labels })
      });
    } catch {}
  };

  const updateMessage = async (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m));
    try {
      await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates })
      });
    } catch {}
  };

  const sendMessage = async (draft: ComposeDraft) => {
    const plainText = (draft.body || "").replace(/<[^>]+>/g, '').trim();
    const now = new Date().toISOString();
    const sentMsg: Message = {
      id: `msg-sent-${Date.now()}`,
      sender: { name: "Me (Admin)", email: "admin@searchintel.com" },
      recipient: { name: draft.to, email: draft.to },
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject || "(No Subject)",
      preview: plainText.substring(0, 75) || "(No content)",
      body: draft.body || plainText,
      timestamp: now,
      updatedAt: now,
      lastSaved: now,
      status: "read",
      priority: draft.priority || "normal",
      folder: "sent",
      isStarred: false,
      attachments: draft.attachments || [],
    };

    // If sending an existing draft, remove the draft item
    if (draft.id) {
      deletePermanently(draft.id);
    }

    setMessages(prev => [sentMsg, ...prev.filter(m => draft.id ? m.id !== draft.id : true)]);
    setActiveFolder("sent");
    setToastMessage("Message sent successfully.");
    setTimeout(() => setToastMessage(null), 3000);

    // Save to API
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sentMsg)
      });
    } catch {}
  };

  const saveDraft = async (draft: ComposeDraft): Promise<string | undefined> => {
    if (!draft.to && !draft.subject && !draft.body) return undefined;

    const plainText = (draft.body || "").replace(/<[^>]+>/g, '').trim();
    const now = new Date().toISOString();
    const draftId = draft.id || `msg-draft-${Date.now()}`;

    const draftMsg: Message = {
      id: draftId,
      sender: { name: "Me (Admin)", email: "admin@searchintel.com" },
      recipient: { name: draft.to || "Recipient", email: draft.to || "recipient@example.com" },
      cc: draft.cc,
      bcc: draft.bcc,
      subject: draft.subject || "(No Subject)",
      preview: plainText.substring(0, 75) || "(Draft content)",
      body: draft.body || plainText,
      timestamp: now,
      updatedAt: now,
      lastSaved: now,
      status: "draft",
      priority: draft.priority || "normal",
      folder: "drafts",
      isStarred: false,
      attachments: draft.attachments || [],
    };

    const isExisting = messages.some(m => m.id === draftId);

    setMessages(prev => [draftMsg, ...prev.filter(m => m.id !== draftMsg.id)]);

    try {
      if (isExisting) {
        await fetch("/api/messages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: draftId,
            to: draft.to,
            cc: draft.cc,
            bcc: draft.bcc,
            subject: draft.subject,
            body: draft.body,
            priority: draft.priority || "normal",
            attachments: draft.attachments || [],
            folder: "drafts",
            status: "draft",
            lastSaved: now
          })
        });
      } else {
        await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draftMsg)
        });
      }
    } catch {}

    return draftId;
  };

  return (
    <MessagesContext.Provider value={{
      messages,
      isLoading,
      activeFolder,
      setActiveFolder,
      unreadCount,
      draftsCount,
      archivedCount,
      toastMessage,
      setToastMessage,
      refreshMessages,
      markAsRead,
      markAsUnread,
      toggleStar,
      moveToFolder,
      archiveMessage,
      moveToInbox,
      deleteMessage,
      deleteDraft,
      deletePermanently,
      restoreMessage,
      updateMessageLabels,
      updateMessage,
      sendMessage,
      saveDraft,
      editingDraft,
      setEditingDraft,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error("useMessages must be used within a MessagesProvider");
  }
  return context;
}
