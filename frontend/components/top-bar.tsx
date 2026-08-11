'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface TopBarProps {
  modelTier: 'lite' | 'standard' | null;
  onModelTierChange: (tier: 'lite' | 'standard' | null) => void;
  onNewChat: () => void;
  onClearCache: () => Promise<void>;
  isClearing?: boolean;
}

export function TopBar({
  modelTier,
  onModelTierChange,
  onNewChat,
  onClearCache,
  isClearing,
}: TopBarProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearToast, setClearToast] = useState<string | null>(null);

  const handleClearCache = async () => {
    setShowClearConfirm(false);
    try {
      await onClearCache();
      setClearToast('Cache cleared');
      setTimeout(() => setClearToast(null), 3000);
    } catch (error) {
      setClearToast('Failed to clear cache');
      setTimeout(() => setClearToast(null), 3000);
    }
  };

  return (
    <>
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">General Knowledge Assistant</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Tier Selector */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => onModelTierChange('lite')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  modelTier === 'lite'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Lite: faster responses"
              >
                Lite
              </button>
              <button
                onClick={() => onModelTierChange('standard')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  modelTier === 'standard'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Standard: more accurate responses"
              >
                Standard
              </button>
            </div>

            {/* Clear Cache Button */}
            <div className="relative">
              <button
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                title="Clear search cache"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {showClearConfirm && (
                <div className="absolute right-0 top-full mt-2 bg-background border border-border rounded-lg shadow-lg p-3 w-48 z-50">
                  <p className="text-sm text-foreground mb-3">Clear all cached results?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 px-3 py-1.5 text-sm rounded border border-border hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearCache}
                      disabled={isClearing}
                      className="flex-1 px-3 py-1.5 text-sm rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors disabled:opacity-50"
                    >
                      {isClearing ? 'Clearing...' : 'Clear'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* New Chat Button */}
            <Button
              onClick={onNewChat}
              variant="outline"
              size="sm"
              className="text-sm"
            >
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {clearToast && (
        <div className="fixed bottom-4 right-4 bg-foreground text-background px-4 py-2 rounded-lg text-sm font-medium z-50">
          {clearToast}
        </div>
      )}
    </>
  );
}
