'use client';

interface WelcomeSectionProps {
  onSuggestedQuestion: (question: string) => void;
}

const SUGGESTED_QUESTIONS = [
  'Who won the latest F1 race?',
  'What\'s the latest on the EU-Mercosur trade deal?',
  'What are the recent developments in AI regulation?',
];

export function WelcomeSection({ onSuggestedQuestion }: WelcomeSectionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">
        General Knowledge Assistant
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
        Ask any question about news, politics, stocks, laws, or current events—get answers backed by live, cited web sources.
      </p>

      <div className="space-y-3 w-full max-w-md">
        <p className="text-sm text-muted-foreground mb-4">Try asking about:</p>
        {SUGGESTED_QUESTIONS.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSuggestedQuestion(question)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 text-foreground text-sm font-medium transition-colors text-left"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
