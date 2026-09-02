'use client';

import { useState } from 'react';
import { GlowBorder } from '@/components/glow-border';

interface HomeScreenProps {
  onSubmit: (question: string) => void;
  onClearCache: () => void;
  isClearing?: boolean;
}

export function HomeScreen({ onSubmit, onClearCache, isClearing }: HomeScreenProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 gap-6">
      <h1 className="text-3xl font-semibold text-center text-foreground">
        What do you want to know?
      </h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xl">
        <GlowBorder radius={12} inline={false} spread={220}>
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything..."
            className="w-full px-5 py-4 rounded-xl bg-muted/30 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </GlowBorder>
      </form>
    </div>
  );
}