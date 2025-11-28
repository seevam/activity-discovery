'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageSearchResult } from '@/types/collage';

interface ImageSearchToolProps {
  onSelectImage: (url: string) => void;
  onClose: () => void;
}

export function ImageSearchTool({ onSelectImage, onClose }: ImageSearchToolProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ImageSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/images/search?q=${encodeURIComponent(query)}&perPage=20`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to search images. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    onSelectImage(imageUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">🔍 Search Free Images</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search for images... (e.g., 'heart', 'coding', 'nature')"
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Powered by Unsplash - Free high-quality images
          </p>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-600">Searching for images...</div>
            </div>
          )}

          {!loading && results.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              {query ? 'No results found. Try a different search term.' : 'Enter a search term to find images'}
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {results.map((image) => (
                <div
                  key={image.id}
                  className="cursor-pointer group relative rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                  onClick={() => handleImageClick(image.fullUrl)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity flex items-center justify-center">
                    <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold">
                      Click to Add
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      Photo by {image.photographer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <p className="text-xs text-gray-600 text-center">
            💡 Tip: Click an image to add it to your collage. You can resize and move it
            after adding.
          </p>
        </div>
      </div>
    </div>
  );
}
