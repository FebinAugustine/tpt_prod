'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useProductSearch } from '../hooks/useProductSearch';

export function SearchDropdown() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [query, setQuery] = useState('');

  const { results, isLoading, error, handleSearch, clearSearch } = useProductSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const onSearchChange = (value: string) => {
    setQuery(value);
    handleSearch(value);
  };

  const onClear = () => {
    setQuery('');
    clearSearch();
  };

  const onResultClick = (productId: string) => {
    clearSearch();
    setQuery('');
    router.push(`/category/search?q=${encodeURIComponent(query)}`);
    setIsSearchFocused(false);
  };

  return (
    <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
      <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search
            className={`h-5 w-5 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-gray-500'}`}
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          placeholder="Search products..."
          className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {query && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearchFocused && query.length >= 2 && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-400">Searching...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">{error}</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No products found</div>
          ) : (
            <div className="py-2">
              {results.slice(0, 5).map((product) => (
                <button
                  key={product._id}
                  onClick={() => onResultClick(product._id)}
                  className="w-full px-4 py-2 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                >
                  {product.images && product.images.length > 0 && (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {product.name}
                    </div>
                    <div className="text-gray-400 text-sm">
                      ₹{product.offerPrice || product.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}