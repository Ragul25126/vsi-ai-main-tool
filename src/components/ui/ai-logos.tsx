import React from "react";
import { SiGoogle, SiGooglegemini, SiPerplexity, SiAnthropic } from "react-icons/si";
import { RiOpenaiFill, RiTerminalBoxFill } from "react-icons/ri";

export function GoogleLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function OpenAILogo({ className = "w-5 h-5" }: { className?: string }) {
  return <RiOpenaiFill className={`${className} text-[#10A37F]`} />;
}

export function GeminiLogo({ className = "w-5 h-5" }: { className?: string }) {
  return <SiGooglegemini className={`${className} text-[#1A73E8] dark:text-[#8AB4F8]`} />;
}

export function PerplexityLogo({ className = "w-5 h-5" }: { className?: string }) {
  return <SiPerplexity className={`${className} text-[#20B8CD]`} />;
}

export function ClaudeLogo({ className = "w-5 h-5" }: { className?: string }) {
  return <SiAnthropic className={`${className} text-[#D97706]`} />;
}

export function CustomEngineLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
      <RiTerminalBoxFill className={className} />
    </div>
  );
}

export function AIEngineLogo({
  engine,
  className = "w-5 h-5",
}: {
  engine: string;
  className?: string;
}) {
  const normalized = (engine || "").toLowerCase();

  if (normalized.includes("google") || normalized.includes("aio") || normalized.includes("search")) {
    return <GoogleLogo className={className} />;
  }
  if (normalized.includes("chatgpt") || normalized.includes("openai") || normalized.includes("gpt")) {
    return <OpenAILogo className={className} />;
  }
  if (normalized.includes("gemini")) {
    return <GeminiLogo className={className} />;
  }
  if (normalized.includes("perplexity")) {
    return <PerplexityLogo className={className} />;
  }
  if (normalized.includes("claude") || normalized.includes("anthropic")) {
    return <ClaudeLogo className={className} />;
  }

  // Dedicated custom engine terminal icon
  return <CustomEngineLogo className={className} />;
}
