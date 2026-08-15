"use client";

import { createContext, useContext, useState, useCallback } from "react";
import FeedbackModal from "@/components/FeedbackModal";

interface FeedbackContextValue {
  openFeedback: () => void;
  closeFeedback: () => void;
}

const FeedbackContext = createContext<FeedbackContextValue>({
  openFeedback: () => {},
  closeFeedback: () => {},
});

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const openFeedback  = useCallback(() => setOpen(true),  []);
  const closeFeedback = useCallback(() => setOpen(false), []);

  return (
    <FeedbackContext.Provider value={{ openFeedback, closeFeedback }}>
      {children}
      <FeedbackModal open={open} onClose={closeFeedback} />
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  return useContext(FeedbackContext);
}
