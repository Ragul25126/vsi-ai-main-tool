"use client";

import { MessageSquareText } from "lucide-react";

const QUESTIONS = [
  "What should I fix first?",
  "Why is my AI visibility where it is?",
  "Which competitors show up instead of us, and why?",
  "Which of our searches are close to Google's first page?",
  "What did the last site audit find?",
  "Which open tasks will make the biggest difference?",
];

/** Opens the chat panel with a question about the active project. */
export default function ChatStarter() {
  const ask = (question: string) => window.dispatchEvent(new CustomEvent("vsi:ask", { detail: { question } }));
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {QUESTIONS.map((q) => (
        <li key={q}>
          <button
            type="button"
            onClick={() => ask(q)}
            className="flex w-full items-center gap-2.5 rounded-control border border-line bg-surface px-3 py-2.5 text-left text-body text-ink hover:border-line-strong hover:bg-surface-2"
          >
            <MessageSquareText size={16} strokeWidth={1.75} className="shrink-0 text-ink-3" aria-hidden />
            {q}
          </button>
        </li>
      ))}
    </ul>
  );
}
