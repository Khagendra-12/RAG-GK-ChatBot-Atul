'use client';

interface CitationBadgeProps {
  number: number;
  onClick: () => void;
}

export function CitationBadge({ number, onClick }: CitationBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-accent text-accent-foreground hover:bg-accent/90 transition-colors cursor-pointer ml-0.5 align-super"
      aria-label={`Citation ${number}`}
      type="button"
    >
      {number}
    </button>
  );
}
