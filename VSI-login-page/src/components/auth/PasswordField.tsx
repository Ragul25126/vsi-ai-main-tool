import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  id = 'password',
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label htmlFor={id} className="text-xs font-semibold text-zinc-300 tracking-wide">
        {label}
      </label>

      <div className="relative flex items-center">
        {/* Left icon */}
        <div className="absolute left-3.5 pointer-events-none text-[#ff2b2b] shrink-0">
          <Lock className="w-5 h-5" />
        </div>

        {/* Input */}
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`w-full bg-zinc-950/90 text-white placeholder-zinc-500 text-sm rounded-xl pl-11 pr-11 py-3.5 border transition-all duration-200 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.25)]'
              : 'border-zinc-800 focus:border-[#ff2b2b] focus:ring-1 focus:ring-[#ff2b2b]/40 focus:shadow-[0_0_15px_rgba(255,43,43,0.25)]'
          } ${className}`}
          {...props}
        />

        {/* Eye Toggle Button */}
        <button
          type="button"
          onClick={toggleVisibility}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute right-3.5 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus:text-white"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
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
