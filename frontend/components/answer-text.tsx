'use client';

import { CitationBadge } from './citation-badge';

interface AnswerTextProps {
  text: string;
  onCitationClick: (index: number) => void;
}

export function AnswerText({ text, onCitationClick }: AnswerTextProps) {
  // Parse citation markers [n] in the text and replace with clickable badges
  const parts: (string | { type: 'citation'; number: number })[] = [];
  const citationRegex = /\[(\d+)\]/g;
  let lastIndex = 0;
  let match;

  while ((match = citationRegex.exec(text)) !== null) {
    // Add text before the citation
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    // Add citation badge
    parts.push({
      type: 'citation',
      number: parseInt(match[1], 10),
    });
    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return (
    <div className="text-foreground leading-relaxed">
      {parts.map((part, idx) => {
        if (typeof part === 'string') {
          return (
            <span key={idx}>{part}</span>
          );
        }
        return (
          <CitationBadge
            key={idx}
            number={part.number}
            onClick={() => onCitationClick(part.number - 1)}
          />
        );
      })}
    </div>
  );
}
