'use client';

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-md text-sm transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent',
            'placeholder:text-gray-400',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3 py-2 border rounded-md text-sm transition-colors resize-none',
            'focus:outline-none focus:ring-2 focus:ring-[#FF8C00] focus:border-transparent',
            'placeholder:text-gray-400',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 hover:border-gray-400',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
