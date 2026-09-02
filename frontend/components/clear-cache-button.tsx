'use client';

import { useState } from 'react';
import { clearCache } from '@/lib/api';
import { GlowBorder } from '@/components/glow-border';

export function ClearCacheButton() {
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleClick = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    try {
      const result = await clearCache();
      setMessage(`Cleared ${result.cleared_entries} cached results`);
    } catch {
      setMessage('Failed to clear cache');
    } finally {
      setConfirming(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="relative">
      <GlowBorder radius={8}>
        <button onClick={handleClick} className="px-3 py-2 rounded-lg text-sm">
          {confirming ? 'Confirm clear?' : 'Clear Cache'}
        </button>
      </GlowBorder>
      {message && (
        <div className="absolute top-full mt-2 right-0 text-xs bg-muted px-3 py-1.5 rounded whitespace-nowrap">
          {message}
        </div>
      )}
    </div>
  );
}