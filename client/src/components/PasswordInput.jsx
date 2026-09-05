import React, { useState } from 'react';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

export default function PasswordInput({ 
  value, 
  onChange, 
  placeholder = 'Enter password', 
  label = 'Password', 
  showRequirements = false,
  disabled = false,
  id = 'password-input'
}) {
  const [showPassword, setShowPassword] = useState(false);

  const requirements = [
    { label: 'Minimum 8 characters', test: (val) => val.length >= 8 },
    { label: 'At least one uppercase letter', test: (val) => /[A-Z]/.test(val) },
    { label: 'At least one number', test: (val) => /[0-9]/.test(val) },
    { label: 'At least one special character', test: (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val) }
  ];

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Lock className="w-4 h-4" />
        </div>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-gray-50 text-sm text-gray-900 pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all placeholder-gray-400"
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          disabled={disabled}
          tabIndex={-1}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showRequirements && value.length > 0 && (
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-[11px] space-y-1 mt-2 animate-fade-in">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Password Requirements:</div>
          {requirements.map((req, i) => {
            const passed = req.test(value);
            return (
              <div key={i} className="flex items-center gap-1.5 font-medium">
                {passed ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <X className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                )}
                <span className={passed ? 'text-emerald-700 font-bold' : 'text-gray-500'}>{req.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
