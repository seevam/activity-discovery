'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { QuoteSuggestion } from '@/types/collage';

interface QuoteSuggestionsProps {
  collageId: string;
  onSelectQuote: (quote: QuoteSuggestion) => void;
  onSkip: () => void;
}

export function QuoteSuggestions({ collageId, onSelectQuote, onSkip }: QuoteSuggestionsProps) {
  const [quotes, setQuotes] = useState<QuoteSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/collages/${collageId}/quotes`);

        if (!response.ok) {
          throw new Error('Failed to fetch quote suggestions');
        }

        const data = await response.json();
        setQuotes(data.quotes || []);
      } catch (err) {
        console.error('Error fetching quotes:', err);
        setError(err instanceof Error ? err.message : 'Failed to load quote suggestions');
      } finally {
        setLoading(false);
      }
    };

    if (collageId) {
      fetchQuotes();
    }
  }, [collageId]);

  const handleSelectQuote = (quote: QuoteSuggestion, index: number) => {
    setSelectedIndex(index);
    onSelectQuote(quote);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-pulse">
          <div className="text-4xl mb-3">💭</div>
          <p className="text-gray-600">Generating personalized quotes just for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700 text-sm">⚠️ {error}</p>
        </div>
        <Button onClick={onSkip} variant="secondary" className="w-full">
          Skip and Enter Your Own
        </Button>
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 mb-4">No quote suggestions available.</p>
        <Button onClick={onSkip} variant="secondary">
          Enter Your Own Quote
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-primary p-3 rounded">
        <p className="text-sm font-semibold text-gray-900">
          💡 Personalized for You
        </p>
        <p className="text-xs text-gray-700 mt-1">
          These quotes are selected based on your interests and themes. Click one to add it to your collage!
        </p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {quotes.map((quote, index) => (
          <button
            key={index}
            onClick={() => handleSelectQuote(quote, index)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
              selectedIndex === index
                ? 'border-blue-primary bg-blue-50'
                : 'border-gray-300 hover:border-blue-primary bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-3xl flex-shrink-0">💬</div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium mb-2 leading-relaxed">
                  "{quote.text}"
                </p>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  <span className="text-gray-600">— {quote.author}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                    {quote.theme}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-2 border-t">
        <Button onClick={onSkip} variant="secondary" size="sm" className="w-full">
          Or Write Your Own Quote
        </Button>
      </div>
    </div>
  );
}
