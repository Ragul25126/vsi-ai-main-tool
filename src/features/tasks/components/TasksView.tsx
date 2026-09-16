"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  CheckSquare,
  Clock,
  Activity,
  CheckCircle2,
  ChevronRight,
  Plus,
  Search,
  Filter,
  BarChart2,
  Users,
  Sparkles,
  Zap,
  TrendingUp,
  X,
  FileText,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  Layers,
} from "lucide-react";

export interface TaskItem {
  id: string;
  client_id: string;
  client_name: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  priority: number;
  group: string;
  owner: string;
  keyword: string | null;
  stale: boolean;
}

const INITIAL_TASKS: TaskItem[] = [];

export default function TasksView() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [activeTab, setActiveTab] = useState<"all" | "open" | "todo" | "in_progress" | "done">("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [filterOwner, setFilterOwner] = useState<string>("all");

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newClient, setNewClient] = useState("Valgrow Labs");
  const [newGroup, setNewGroup] = useState("Content");
  const [newOwner, setNewOwner] = useState("SEO");

  useEffect(() => {
    async function loadTasksFromSupabase() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) {
          const mapped: TaskItem[] = data.map((t: any) => ({
            id: t.id,
            client_id: t.client_id || "1",
            client_name: t.client_name || "Enterprise Client",
            title: t.title,
            status:
              t.status === "completed" || t.status === "done"
                ? "done"
                : t.status === "in_progress"
                ? "in_progress"
                : "todo",
            priority: t.priority === "high" ? 1 : t.priority === "low" ? 3 : 2,
            group: t.group || "Content",
            owner: t.owner || "SEO",
            keyword: t.keyword || null,
            stale: Boolean(t.stale),
          }));
          setTasks(mapped);
        }
      } catch (err) {
        console.error("Error loading tasks from Supabase:", err);
      }
    }
    loadTasksFromSupabase();
  }, []);

  // Counts
  const counts = {
    all: tasks.length,
    open: tasks.filter((t) => t.status !== "done").length,
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  const progressPercent =
    counts.all > 0 ? Math.round((counts.done / counts.all) * 100) : 0;

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "open" && t.status === "done") return false;
    if (activeTab === "todo" && t.status !== "todo") return false;
    if (activeTab === "in_progress" && t.status !== "in_progress") return false;
    if (activeTab === "done" && t.status !== "done") return false;
    if (filterOwner !== "all" && t.owner !== filterOwner) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.client_name.toLowerCase().includes(q) ||
        (t.keyword && t.keyword.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTaskItem: TaskItem = {
      id: `t-${Date.now()}`,
      client_id: "1",
      client_name: newClient,
      title: newTitle.trim(),
      status: "todo",
      priority: 1,
      group: newGroup,
      owner: newOwner,
      keyword: null,
      stale: false,
    };

    setTasks([newTaskItem, ...tasks]);
    setNewTitle("");
    setShowModal(false);

    try {
      const supabase = createClient();
      await supabase.from("tasks").insert({
        title: newTaskItem.title,
        status: "todo",
        priority: "medium",
      });
    } catch {}
  };

  const toggleTaskStatus = async (id: string) => {
    const currentTask = tasks.find((t) => t.id === id);
    if (!currentTask) return;

    let nextStatus: TaskItem["status"] = "todo";
    if (currentTask.status === "todo") nextStatus = "in_progress";
    else if (currentTask.status === "in_progress") nextStatus = "done";
    else nextStatus = "todo";

    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: nextStatus } : t))
    );

    try {
      const supabase = createClient();
      await supabase
        .from("tasks")
        .update({
          status: nextStatus === "done" ? "completed" : nextStatus,
        })
        .eq("id", id);
    } catch {}
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background animate-fadeIn pb-12">
      
      {/* ── 1. CLEAN ENTERPRISE HERO HEADER ── */}
      <div className="relative bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-6 sm:p-7 shadow-xs overflow-hidden">
        
        {/* Subtle Warm Amber Glow Background */}
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-orange-50/60 via-amber-50/20 to-transparent dark:from-orange-950/20 dark:via-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Left: Icon + Eyebrow + Title + Subtitle */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#FF5A1F] dark:text-orange-400 border border-orange-100/80 dark:border-orange-900/40 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <CheckSquare size={22} className="stroke-[2.5]" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold tracking-wider uppercase text-[#FF5A1F]">
                GET THINGS DONE
              </span>
              <h1 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-foreground tracking-tight leading-tight">
                Tasks &amp; Audits
              </h1>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-muted-foreground font-normal max-w-xl leading-relaxed">
                Track and manage execution tickets across your agency. Stay organized and turn insights into action.
              </p>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
            
            {/* Status Live Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-50 dark:bg-muted/50 border border-slate-200/70 dark:border-border text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Action Board Ready</span>
            </div>

            {/* New Task Primary Button */}
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04D16] text-white px-5 py-2.5 rounded-full font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer shrink-0"
            >
              <Plus size={15} className="stroke-[3]" />
              <span>New Task</span>
            </button>

          </div>

        </div>

      </div>

      {/* ── 2. TOP 4 KPI STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Open Tasks (Soft Orange) */}
        <button
          type="button"
          onClick={() => setActiveTab("open")}
          className={`bg-gradient-to-r from-[#FFFBF7] to-[#FFF5ED] dark:from-orange-950/20 dark:to-orange-900/10 border ${
            activeTab === "open"
              ? "border-[#FF5A1F] ring-1 ring-[#FF5A1F]/30 shadow-xs"
              : "border-[#FFE8D6] dark:border-orange-900/40 hover:border-orange-300"
          } rounded-2xl p-4.5 flex items-center justify-between transition-all text-left cursor-pointer group`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFF0E6] dark:bg-orange-900/50 text-[#FF5A1F] flex items-center justify-center shrink-0">
              <FileText size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Open Tasks</p>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none mt-1">
                {counts.open}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                Need attention
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#FFE8D6] dark:bg-orange-900/40 text-[#FF5A1F] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ChevronRight size={13} className="stroke-[2.5]" />
          </div>
        </button>

        {/* Card 2: To Do (Soft Blue) */}
        <button
          type="button"
          onClick={() => setActiveTab("todo")}
          className={`bg-gradient-to-r from-[#F8FAFF] to-[#EFF5FF] dark:from-blue-950/20 dark:to-blue-900/10 border ${
            activeTab === "todo"
              ? "border-[#2563EB] ring-1 ring-[#2563EB]/30 shadow-xs"
              : "border-[#E0ECFD] dark:border-blue-900/40 hover:border-blue-300"
          } rounded-2xl p-4.5 flex items-center justify-between transition-all text-left cursor-pointer group`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3FF] dark:bg-blue-900/50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Clock size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">To Do</p>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none mt-1">
                {counts.todo}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                Ready to start
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#E0ECFD] dark:bg-blue-900/40 text-[#2563EB] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ChevronRight size={13} className="stroke-[2.5]" />
          </div>
        </button>

        {/* Card 3: In Progress (Soft Purple) */}
        <button
          type="button"
          onClick={() => setActiveTab("in_progress")}
          className={`bg-gradient-to-r from-[#FAF6FF] to-[#F5EEFF] dark:from-purple-950/20 dark:to-purple-900/10 border ${
            activeTab === "in_progress"
              ? "border-[#7C3AED] ring-1 ring-[#7C3AED]/30 shadow-xs"
              : "border-[#EDE2FE] dark:border-purple-900/40 hover:border-purple-300"
          } rounded-2xl p-4.5 flex items-center justify-between transition-all text-left cursor-pointer group`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F3E8FF] dark:bg-purple-900/50 text-[#7C3AED] flex items-center justify-center shrink-0">
              <Activity size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">In Progress</p>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none mt-1">
                {counts.in_progress}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                Currently working
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#EDE2FE] dark:bg-purple-900/40 text-[#7C3AED] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ChevronRight size={13} className="stroke-[2.5]" />
          </div>
        </button>

        {/* Card 4: Completed (Soft Green) */}
        <button
          type="button"
          onClick={() => setActiveTab("done")}
          className={`bg-gradient-to-r from-[#F7FCF9] to-[#EFF9F3] dark:from-emerald-950/20 dark:to-emerald-900/10 border ${
            activeTab === "done"
              ? "border-[#16A34A] ring-1 ring-[#16A34A]/30 shadow-xs"
              : "border-[#DBF2E3] dark:border-emerald-900/40 hover:border-emerald-300"
          } rounded-2xl p-4.5 flex items-center justify-between transition-all text-left cursor-pointer group`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8F8EE] dark:bg-emerald-900/50 text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckSquare size={18} className="stroke-[2.2]" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Completed</p>
              <p className="text-2xl font-black text-slate-900 dark:text-foreground leading-none mt-1">
                {counts.done}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium mt-0.5">
                Finished tasks
              </p>
            </div>
          </div>
          <div className="w-6 h-6 rounded-full bg-[#DBF2E3] dark:bg-emerald-900/40 text-[#16A34A] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
            <ChevronRight size={13} className="stroke-[2.5]" />
          </div>
        </button>

      </div>

      {/* ── 3. FILTER TABS & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        
        {/* Left Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "all"
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted font-semibold"
            }`}
          >
            All Tasks
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("open")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "open"
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted font-semibold"
            }`}
          >
            Open ({counts.open})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("todo")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "todo"
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted font-semibold"
            }`}
          >
            To Do ({counts.todo})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("in_progress")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "in_progress"
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted font-semibold"
            }`}
          >
            In Progress ({counts.in_progress})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("done")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "done"
                ? "bg-[#FF5A1F] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-muted font-semibold"
            }`}
          >
            Done ({counts.done})
          </button>

        </div>

        {/* Right Search Input & Filter Dropdown Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-slate-400 focus:outline-none focus:border-[#FF5A1F] shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterOwner(filterOwner === "all" ? "SEO" : "all")}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            <Filter size={13} className="text-slate-500" />
            <span>Filter</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>

      </div>

      {/* ── 4. TWO-COLUMN WORKSPACE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-4">
          
          {filteredTasks.length === 0 ? (
            /* CLEAN VECTOR EMPTY STATE */
            <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-3xl p-10 sm:p-14 text-center shadow-xs flex flex-col items-center justify-center space-y-5">
              
              {/* Central Vector Clipboard & Magnifying Glass Graphic */}
              <div className="relative flex items-center justify-center my-1 select-none">
                <svg width="110" height="100" viewBox="0 0 110 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xs">
                  {/* Subtle Background Glow Circle */}
                  <circle cx="55" cy="50" r="42" fill="#FFF9F5" />
                  
                  {/* Clipboard Paper */}
                  <rect x="25" y="14" width="56" height="72" rx="8" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2.5" />
                  {/* Top Clip */}
                  <rect x="42" y="8" width="22" height="11" rx="3.5" fill="#94A3B8" />
                  <circle cx="53" cy="13.5" r="2.5" fill="#FFFFFF" />
                  
                  {/* Checklist Items */}
                  <rect x="33" y="28" width="9" height="9" rx="2.5" fill="#FFF3EB" stroke="#FF5A1F" strokeWidth="1.5" />
                  <path d="M35.5 32.5L37 34L39.5 31" stroke="#FF5A1F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="48" y1="32.5" x2="72" y2="32.5" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
                  
                  <rect x="33" y="44" width="9" height="9" rx="2.5" fill="#FFF3EB" stroke="#FF5A1F" strokeWidth="1.5" />
                  <path d="M35.5 48.5L37 50L39.5 47" stroke="#FF5A1F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="48" y1="48.5" x2="68" y2="48.5" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

                  <rect x="33" y="60" width="9" height="9" rx="2.5" fill="#FFF3EB" stroke="#FF5A1F" strokeWidth="1.5" />
                  <path d="M35.5 64.5L37 66L39.5 63" stroke="#FF5A1F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="48" y1="64.5" x2="70" y2="64.5" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Sparkles */}
                  <path d="M88 20L92 16M94 25L99 25M90 30L94 34" stroke="#F97316" strokeWidth="1.8" strokeLinecap="round" />
                </svg>

                {/* 3D Tilted Magnifying Glass */}
                <div className="absolute -bottom-1 -right-1 transform translate-x-2">
                  <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                    <circle cx="18" cy="18" r="12" fill="#3B82F6" fillOpacity="0.12" stroke="#2563EB" strokeWidth="3" />
                    <line x1="27" y1="27" x2="38" y2="38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-1.5 max-w-md">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-foreground">
                  No open tasks yet
                </h3>
                <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium leading-relaxed">
                  You&apos;re all caught up! Create a new task to get started or check other tabs.
                </p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-[#FF5A1F] hover:bg-[#E04D16] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
              >
                <Plus size={15} className="stroke-[3]" />
                <span>Create Your First Task</span>
              </button>

              {/* 3 Feature Highlights Row */}
              <div className="flex flex-wrap items-center justify-center gap-6 pt-6 border-t border-slate-100 dark:border-border w-full text-slate-600 dark:text-slate-400 text-xs font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#FF5A1F]">⚡</span>
                  <span>Turn insights into action</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-500">👥</span>
                  <span>Assign to your team</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-500">📊</span>
                  <span>Track progress easily</span>
                </div>
              </div>

            </div>
          ) : (
            /* Populated Tasks List */
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTaskStatus(task.id)}
                  className="bg-white dark:bg-card border border-slate-200/80 dark:border-border hover:border-orange-300 dark:hover:border-orange-800 rounded-2xl p-4.5 flex items-start gap-3.5 transition-all shadow-2xs group cursor-pointer"
                  title="Click to cycle status"
                >
                  <div className="pt-0.5">
                    {task.status === "done" ? (
                      <CheckCircle2 size={18} className="text-emerald-500 stroke-[2.5]" />
                    ) : task.status === "in_progress" ? (
                      <Activity size={18} className="text-purple-500 stroke-[2.5]" />
                    ) : (
                      <Clock size={18} className="text-blue-500 stroke-[2.5]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <p
                        className={`text-xs font-bold leading-snug ${
                          task.status === "done"
                            ? "line-through text-slate-400"
                            : "text-slate-900 dark:text-foreground"
                        }`}
                      >
                        {task.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 ${
                          task.status === "done"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : task.status === "in_progress"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {task.status === "done"
                          ? "Done"
                          : task.status === "in_progress"
                          ? "In Progress"
                          : "To Do"}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10.5px] px-2 py-0.5 rounded bg-slate-100 dark:bg-muted text-slate-600 font-semibold">
                        {task.group}
                      </span>
                      <span className="text-[10.5px] px-2 py-0.5 rounded bg-orange-50 text-[#FF5A1F] border border-orange-100 font-semibold">
                        👤 {task.owner}
                      </span>
                      {task.keyword && (
                        <span className="text-[10.5px] text-slate-400 truncate max-w-[200px]">
                          🔑 {task.keyword}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column (Analytics & Progress Widgets) */}
        <div className="space-y-4">
          
          {/* Widget 1: Overall Progress */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-foreground">
              <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <BarChart2 size={14} className="stroke-[2.5]" />
              </div>
              <span>Overall Progress</span>
            </div>

            <div className="flex items-center gap-5 pt-1">
              
              {/* Circular Gauge Meter with 0% */}
              <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-muted"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-base font-black text-slate-900 dark:text-foreground">
                    {progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Breakdown Legend */}
              <div className="space-y-2 flex-1 text-xs font-semibold">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    <span>To Do</span>
                  </div>
                  <span className="text-slate-900 dark:text-foreground font-bold">{counts.todo}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                    <span>In Progress</span>
                  </div>
                  <span className="text-slate-900 dark:text-foreground font-bold">{counts.in_progress}</span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    <span>Done</span>
                  </div>
                  <span className="text-slate-900 dark:text-foreground font-bold">{counts.done}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Widget 2: Tasks by Owner */}
          <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-2xl p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-foreground">
                <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                  <Users size={14} className="stroke-[2.5]" />
                </div>
                <span>Tasks by Owner</span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </div>

            <div className="space-y-2.5 pt-1">
              {[
                { role: "Writer", count: tasks.filter((t) => t.owner === "Writer").length },
                { role: "Developer", count: tasks.filter((t) => t.owner === "Developer").length },
                { role: "SEO", count: tasks.filter((t) => t.owner === "SEO").length },
                { role: "Outreach", count: tasks.filter((t) => t.owner === "Outreach").length },
              ].map(({ role, count }) => (
                <div key={role} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">{role}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-200 dark:bg-slate-700 rounded-full"
                        style={{
                          width: `${Math.min(
                            (count / Math.max(tasks.length, 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="font-bold text-slate-900 dark:text-foreground w-3 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── 5. BOTTOM QUOTE BANNER ── */}
      <div className="bg-[#FFF9F5] dark:bg-orange-950/20 border border-orange-100/80 dark:border-orange-900/40 rounded-2xl p-3.5 px-5 flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-2 text-[#9A3412] dark:text-orange-200 font-semibold italic">
          <Sparkles size={15} className="text-[#FF5A1F] shrink-0 not-italic" />
          <span>&ldquo;Consistent execution turns strategy into growth.&rdquo;</span>
        </div>
        <Link
          href="/dashboard/prompts"
          className="text-[#FF5A1F] dark:text-orange-400 font-bold hover:underline flex items-center gap-1 shrink-0"
        >
          <span>Keep going</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* ── NEW TASK MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-border pb-3">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-foreground">
                Create New Task
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-foreground cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-foreground mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optimize H2 headers for keyword..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-foreground mb-1">
                    Client
                  </label>
                  <select
                    value={newClient}
                    onChange={(e) => setNewClient(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="Valgrow Labs">Valgrow Labs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-foreground mb-1">
                    Group
                  </label>
                  <select
                    value={newGroup}
                    onChange={(e) => setNewGroup(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-[#FF5A1F]"
                  >
                    <option value="Content">Content</option>
                    <option value="Technical">Technical</option>
                    <option value="Off-page">Off-page</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-foreground mb-1">
                  Owner Role
                </label>
                <select
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option value="SEO">SEO</option>
                  <option value="Writer">Writer</option>
                  <option value="Developer">Developer</option>
                  <option value="Outreach">Outreach</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-100 dark:hover:bg-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#FF5A1F] hover:bg-[#E04D16] text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
