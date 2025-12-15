'use client';

import { useState } from 'react';
import { QuoteSuggestion } from '@/types/collage';
import { QUOTE_LIBRARY, searchQuotes, getAllQuotes } from '@/lib/constants/quoteLibrary';
import { Button } from '@/components/ui/Button';

interface QuoteLibraryProps {
  onSelectQuote: (quote: QuoteSuggestion) => void;
  onBack: () => void;
}

export function QuoteLibrary({ onSelectQuote, onBack }: QuoteLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuoteIndex, setSelectedQuoteIndex] = useState<number | null>(null);

  // Get quotes to display based on category and search
  const getDisplayQuotes = (): QuoteSuggestion[] => {
    if (searchQuery.trim()) {
      return searchQuotes(searchQuery);
    }

    if (selectedCategory === 'all') {
      return getAllQuotes();
    }

    const category = QUOTE_LIBRARY.find(cat => cat.id === selectedCategory);
    return category ? category.quotes : [];
  };

  const displayQuotes = getDisplayQuotes();

  const handleSelectQuote = (quote: QuoteSuggestion, index: number) => {
    setSelectedQuoteIndex(index);
    onSelectQuote(quote);
  };

  return (
    <div className="flex flex-col h-full max-h-[70vh]">
      {/* Header with Search */}
      <div className="flex-shrink-0 space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">📚 Quote Library</h3>
          <button
            onClick={onBack}
            className="text-sm text-blue-primary hover:text-blue-600 font-semibold"
          >
            ← Back to Suggestions
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search quotes, authors, or themes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 border-2 border-gray-300 rounded-lg focus:border-blue-primary focus:outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔍
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {!searchQuery && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🌟 All Quotes
            </button>
            {QUOTE_LIBRARY.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.emoji} {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quotes Grid */}
      <div className="flex-1 overflow-y-auto">
        {displayQuotes.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-gray-600">
              No quotes found for "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-primary hover:text-blue-600 text-sm mt-2"
            >
              Clear search
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-600 mb-3">
              {displayQuotes.length} quote{displayQuotes.length !== 1 ? 's' : ''} available
            </div>
            <div className="space-y-3">
              {displayQuotes.map((quote, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectQuote(quote, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedQuoteIndex === index
                      ? 'border-blue-primary bg-blue-50'
                      : 'border-gray-300 hover:border-blue-primary bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0">💬</div>
                    <div className="flex-1 min-w-0">
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
          </>
        )}
      </div>

      {/* Info Footer */}
      <div className="flex-shrink-0 mt-4 pt-4 border-t">
        <div className="bg-blue-50 border-l-4 border-blue-primary p-3 rounded text-sm">
          <p className="text-gray-900 font-semibold mb-1">💡 Tip</p>
          <p className="text-gray-700 text-xs">
            Click any quote to select it. You can customize the style before adding it to your collage!
          </p>
        </div>
      </div>
    </div>
  );
}
