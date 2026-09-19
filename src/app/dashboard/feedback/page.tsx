"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, Star, ThumbsUp, Filter, Search, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FeedbackItem {
 id: string;
 category: "Feature Request" | "Bug Report" | "UX Improvement";
 subject: string;
 message: string;
 author: string;
 createdAt: string;
 status: "Open" | "In Review" | "Resolved";
 upvotes: number;
}

const initialFeedback: FeedbackItem[] = [
 {
 id: "fb-1",
 category: "Feature Request",
 subject: "Add Claude 3.5 Sonnet Citations",
 message: "Would love to track citation links returned in Claude 3.5 Sonnet generative answers alongside ChatGPT.",
 author: "agency@valgrow.com",
 createdAt: "2026-07-21",
 status: "In Review",
 upvotes: 24,
 },
 {
 id: "fb-2",
 category: "UX Improvement",
 subject: "Dark Mode Contrast for Trajectory Chart",
 message: "The trajectory chart looks great in dark mode! Could we increase line width for winning citations?",
 author: "client@valgrowlabs.com",
 createdAt: "2026-07-20",
 status: "Resolved",
 upvotes: 12,
 },
 {
 id: "fb-3",
 category: "Bug Report",
 subject: "PDF Report Title Overflow",
 message: "When exporting PDF for clients with long company names, title wraps onto second page.",
 author: "support@agency.org",
 createdAt: "2026-07-18",
 status: "Open",
 upvotes: 7,
 },
];

export default function FeedbackPage() {
 const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(initialFeedback);
 const [subject, setSubject] = useState("");
 const [message, setMessage] = useState("");
 const [category, setCategory] = useState<FeedbackItem["category"]>("Feature Request");
 const [submitted, setSubmitted] = useState(false);
 const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);

  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  const isDummy = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    return url.includes("dummy") || url.includes("your-project.supabase.co") || url.includes("localhost:54321") || url === "";
  };

  const mapDatabaseCategory = (cat: string): "Feature Request" | "Bug Report" | "UX Improvement" => {
    if (cat === "bug") return "Bug Report";
    if (cat === "idea") return "Feature Request";
    return "UX Improvement";
  };

  const checkSupabaseConfig = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || url.includes("dummy") || url.includes("your-project.supabase.co")) {
      throw new Error("Supabase is not configured. Please define NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.");
    }
    if (!key || key.includes("anon_key_here")) {
      throw new Error("Supabase Anon Key is missing or invalid. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
  };

  const fetchMyFeedback = async () => {
    if (authLoading) return;

    try {
      checkSupabaseConfig();
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (data && Array.isArray(data)) {
        const mapped: FeedbackItem[] = data.map((item: any) => {
          const cat = mapDatabaseCategory(item.category);
          const subj = item.context_data?.subject || "Feedback Submission";
          const statusMap = (stat: string): FeedbackItem["status"] => {
            if (stat === "done" || stat === "Resolved") return "Resolved";
            if (stat === "triaged" || stat === "in_progress" || stat === "In Review") return "In Review";
            return "Open";
          };
          return {
            id: item.id,
            category: cat,
            subject: subj,
            message: item.message,
            author: "you@agency.com",
            createdAt: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
            status: statusMap(item.status),
            upvotes: 1,
          };
        });
        setMyFeedback(mapped);
      }
    } catch (e: any) {
      console.warn("Failed to fetch feedback from Supabase directly:", e);
      const msg = e instanceof Error && e.message === "fetch failed"
        ? "Database connection failed: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL."
        : e.message || String(e);
      // Log to console for dev validation
      console.error("My Feedback load error:", msg);
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch (e) {
        console.error("Error loading session:", e);
      } finally {
        setAuthLoading(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchMyFeedback();
    }
  }, [authLoading]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    if (authLoading) {
      alert("Authentication is still loading. Please try again in a moment.");
      return;
    }

    const newItem: FeedbackItem = {
      id: `fb-${Date.now()}`,
      category,
      subject: subject.trim(),
      message: message.trim(),
      author: "you@agency.com",
      createdAt: new Date().toISOString().split("T")[0],
      status: "Open",
      upvotes: 1,
    };

    // Keep existing community list update
    setFeedbackList([newItem, ...feedbackList]);

    const apiCategory = 
      category === "Bug Report" ? "bug" : 
      category === "Feature Request" ? "idea" : "general";

    try {
      checkSupabaseConfig();
      const supabase = createClient();
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error("No authenticated session found. Please sign in again.");
      }

      // Fetch user's profile to get agency_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("agency_id")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        throw new Error(`Profile fetch failed: ${profileError.message}`);
      }

      const insertPayload = {
        agency_id: profile?.agency_id ?? null,
        user_id: currentUser.id,
        category: apiCategory,
        rating: null,
        subject: subject.trim() || null,
        message: message.trim(),
        attachment_url: null,
        page_url: "/dashboard/feedback",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
        context_data: {
          subject: subject.trim(),
          submitted_from: "dashboard_feedback_page",
          timestamp: new Date().toISOString(),
        },
        status: "new",
      };

      const { data: insertedData, error: insertError } = await supabase
        .from("feedback")
        .insert(insertPayload)
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      const insertedId = insertedData?.id;
      const insertedItem: FeedbackItem = {
        id: insertedId || `fb-${Date.now()}`,
        category,
        subject: subject.trim(),
        message: message.trim(),
        author: "you@agency.com",
        createdAt: new Date().toISOString().split("T")[0],
        status: "Open",
        upvotes: 1,
      };

      // Immediately add the inserted record to list
      setMyFeedback((prev) => [insertedItem, ...prev]);

      // Clear form and show success
      setSubject("");
      setMessage("");
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);

      // Re-fetch to confirm/sync
      await fetchMyFeedback();
    } catch (err: any) {
      console.error("Feedback direct DB insert failed:", err);
      const msg = err instanceof Error && err.message === "fetch failed"
        ? "Database connection failed: The database server is unreachable. Please verify NEXT_PUBLIC_SUPABASE_URL is correct and the database is active."
        : err.message || String(err);
      alert(`Error submitting feedback: ${msg}`);
    }
  };

  const handleUpvote = (id: string) => {
    setFeedbackList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, upvotes: item.upvotes + 1 } : item))
    );
  };

 return (
 <div className="mx-auto w-full max-w-[1240px] animate-fade-in space-y-10 px-4 pb-24 pt-6 font-sans md:px-8 md:pt-9 xl:px-10">
 {/* Page Header */}
 <header className="border-b border-line pb-7">
 <h1 className="text-display font-semibold text-ink">Feedback</h1>
 <p className="mt-2 max-w-[65ch] text-body text-ink-2 md:text-[0.9375rem] md:leading-6">
 Tell us what could be better. Every message goes to the people who build VSI.
 </p>
 </header>

 {submitted && (
 <div role="status" className="flex items-center gap-2 rounded-panel bg-positive-soft p-3.5 text-support font-medium text-positive">
 <CheckCircle2 size={16} />
 <span>Thank you! Your feedback has been submitted to the product team.</span>
 </div>
 )}

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
 {/* Submit Form (5 Cols) */}
 <div className="lg:col-span-5 bg-surface rounded-panel border border-line p-6 space-y-4">
 <h2 className="text-[1.0625rem] font-semibold leading-6 text-ink">Send feedback</h2>

 <form onSubmit={handleSubmitFeedback} className="space-y-4">
 <div>
 <label className="block text-caption font-semibold text-ink mb-1">
 Category
 </label>
 <select
 value={category}
 onChange={(e) => setCategory(e.target.value as FeedbackItem["category"])}
 className="w-full rounded-panel border border-line bg-canvas px-3.5 py-2 text-caption text-ink focus:outline-none focus:border-line-strong"
 >
 <option value="Feature Request">Feature Request</option>
 <option value="Bug Report">Bug Report</option>
 <option value="UX Improvement">UX Improvement</option>
 </select>
 </div>

 <div>
 <label className="block text-caption font-semibold text-ink mb-1">
 Subject
 </label>
 <input
 type="text"
 required
 placeholder="Brief summary of your feedback..."
 value={subject}
 onChange={(e) => setSubject(e.target.value)}
 className="w-full rounded-panel border border-line bg-canvas px-3.5 py-2 text-caption text-ink focus:outline-none focus:border-line-strong"
 />
 </div>

 <div>
 <label className="block text-caption font-semibold text-ink mb-1">
 Details
 </label>
 <textarea
 rows={5}
 required
 placeholder="Describe how this feature will improve your workflow..."
 value={message}
 onChange={(e) => setMessage(e.target.value)}
 className="w-full rounded-panel border border-line bg-canvas p-3.5 text-caption text-ink focus:outline-none focus:border-line-strong"
 />
 </div>

 <button
 type="submit"
 className="w-full flex items-center justify-center gap-2 rounded-control bg-ink hover:bg-ink-2 text-white px-4 py-2.5 text-caption font-semibold transition-colors"
 >
 <Send size={14} />
 <span>Send feedback</span>
 </button>
 </form>
 </div>

 {/* Existing Feedback Board (7 Cols) */}
 <div className="lg:col-span-7 space-y-4">
 <div className="flex flex-wrap items-baseline justify-between gap-2">
 <h2 className="text-[1.0625rem] font-semibold leading-6 text-ink">What feedback looks like</h2>
 <span className="rounded-control border border-dashed border-line-strong px-2 py-0.5 text-caption text-ink-3">Examples, not real requests</span>
 </div>

 <div className="space-y-3">
 {feedbackList.map((item) => (
 <div
 key={item.id}
 className="bg-surface rounded-panel border border-line p-5 flex items-start gap-4"
 >
 <button
 onClick={() => handleUpvote(item.id)}
 className="flex flex-col items-center justify-center rounded-panel bg-surface-2 hover:bg-brand-soft hover:text-ink border border-line px-3 py-2 text-ink-3 transition-colors shrink-0"
 >
 <ThumbsUp size={14} />
 <span className="text-caption font-semibold mt-1">{item.upvotes}</span>
 </button>

 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap mb-1">
 <span className="text-caption font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
 {item.category}
 </span>
 <span className={`text-caption font-semibold px-2 py-0.5 rounded ${
 item.status === "Resolved" ? "bg-positive-soft text-positive" :
 item.status === "In Review" ? "bg-info-soft text-info" :
 "bg-surface-2 text-ink-2"
 }`}>
 {item.status}
 </span>
 </div>

 <h3 className="text-body font-semibold text-ink">{item.subject}</h3>
 <p className="text-caption text-ink-2 mt-1">{item.message}</p>

 <div className="mt-3 flex items-center justify-between text-caption text-ink-2">
 <span>Submitted by {item.author}</span>
 <span>{item.createdAt}</span>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* My Submitted Feedback Section */}
 <div className="mt-12 pt-8 border-t border-line space-y-6">
   <h2 className="text-[1.0625rem] font-semibold leading-6 text-ink">Your feedback</h2>
   
   {myFeedback.length === 0 ? (
     <div className="rounded-panel border border-dashed border-line p-10 text-center text-ink-2 text-body">
       You haven't submitted any feedback yet.
     </div>
   ) : (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       {myFeedback.map((item) => (
         <div key={item.id} className="bg-surface rounded-panel border border-line p-5 flex flex-col justify-between gap-4">
            <div className="space-y-3">
               <div className="flex items-center justify-between gap-2 flex-wrap">
                 <span className="text-caption font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                   {item.category}
                 </span>
                 <span className={`text-caption font-semibold px-2 py-0.5 rounded ${
                   item.status === "Resolved" ? "bg-positive-soft text-positive" :
                   item.status === "In Review" ? "bg-info-soft text-info" :
                   "bg-surface-2 text-ink-2"
                 }`}>
                   {item.status}
                 </span>
               </div>
               
               <div>
                 <h3 className="text-body font-semibold text-ink">{item.subject}</h3>
                 <p className="text-caption text-ink-2 mt-1 whitespace-pre-wrap leading-relaxed">{item.message}</p>
               </div>
            </div>
            
            <div className="pt-3 border-t border-line/40 flex items-center justify-between text-caption text-ink-2">
               <span>Submitted by you</span>
               <span>{item.createdAt}</span>
            </div>
         </div>
       ))}
     </div>
   )}
 </div>
 </div>
 );
}
