'use client';

import { Source } from '@/lib/api';
import { ExternalLink } from 'lucide-react';
import { GlowBorder } from '@/components/glow-border';

interface SourceCardProps {
  source: Source;
  number: number;
  isHighlighted: boolean;
}

export function SourceCard({ source, number, isHighlighted }: SourceCardProps) {
  const domain = new URL(source.url).hostname.replace('www.', '');

  return (
    <GlowBorder radius={8} inline={false} sweepOnMount={false} className="w-full">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        data-source-card
        className={`block p-4 rounded-lg border transition-all ${
          isHighlighted
            ? 'bg-accent/10 border-accent shadow-sm'
            : 'bg-muted/30 border-border hover:bg-muted/50 hover:border-border/80'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-xs font-semibold text-accent">
            {number}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground hover:underline truncate">
              {source.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">{domain}</p>
            {source.published_date && (
              <p className="text-xs text-muted-foreground/70 mt-1">{source.published_date}</p>
            )}
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>
      </a>
    </GlowBorder>
  );
}