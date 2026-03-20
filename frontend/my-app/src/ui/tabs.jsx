import { useState } from 'react';

export function Tabs({ value, onValueChange, children, className = '' }) {
  return (
    <div className={className}>
      {typeof children === 'function'
        ? children({ value, onValueChange })
        : children}
    </div>
  );
}

export function TabsList({ children, className = '' }) {
  return (
    <div className={`flex space-x-1 ${className}`} role="tablist">
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = '', ...props }) {
  return (
    <button
      type="button"
      role="tab"
      className={`px-4 py-2 text-sm font-medium transition-colors ${className}`}
      data-value={value}
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  return (
    <div role="tabpanel" className={className} data-value={value}>
      {children}
    </div>
  );
}
