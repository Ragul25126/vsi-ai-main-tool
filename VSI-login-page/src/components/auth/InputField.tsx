import React from 'react';
import { Mail, AlertCircle } from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon = <Mail className="w-5 h-5 text-[#FF5500]" />,
  id,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-300 tracking-wide">
        {label}
      </label>

      <div className="relative flex items-center">
        {/* Left icon */}
        <div className="absolute left-3.5 pointer-events-none text-[#FF5500] shrink-0">
          {icon}
        </div>

        {/* Input */}
        <input
          id={id}
          className={`w-full bg-[#0F1219]/90 text-white placeholder-zinc-500 text-sm rounded-xl pl-11 pr-4 py-3.5 border transition-all duration-200 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
              : 'border-zinc-800 focus:border-[#FF5500] focus:ring-1 focus:ring-[#FF5500]/40 focus:shadow-[0_0_18px_rgba(255,85,0,0.25)]'
          } ${className}`}
          {...props}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-red-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

