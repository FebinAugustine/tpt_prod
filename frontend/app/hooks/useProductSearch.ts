"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { API_BASE_URL } from "../services/types";

export interface SearchProduct {
  _id: string;
  name: string;
  images: string[];
  price: number;
  offerPrice?: number;
  flavour?: string;
  company?: string;
  weight?: string;
  category?: {
    _id: string;
    name: string;
  };
}

interface SearchResult {
  products: SearchProduct[];
  timestamp: number;
}

const searchCache = new Map<string, SearchResult>();
const CACHE_DURATION = 5 * 60 * 1000;

export function useProductSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchProducts = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const cacheKey = searchQuery.toLowerCase().trim();
    const cached = searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setResults(cached.products);
      setIsOpen(true);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setIsOpen(true);

    try {
      console.log('Fetching search for:', searchQuery);
      const response = await fetch(
        `${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery.trim())}&limit=10`,
        {
          signal: abortControllerRef.current.signal,
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      console.log('Search results:', data);

      const result: SearchResult = {
        products: data || [],
        timestamp: Date.now(),
      };

      searchCache.set(cacheKey, result);

      setResults(data || []);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        console.error('Search error:', err);
        setError("Failed to search products");
        setResults([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (!value || value.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        setError(null);
        return;
      }

      debounceRef.current = setTimeout(() => {
        searchProducts(value);
      }, 300);
    },
    [searchProducts]
  );

  const clearSearch = useCallback(() => {
    setQuery("");
    setResults([]);
    setIsOpen(false);
    setError(null);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const closeResults = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    results,
    isLoading,
    isOpen,
    error,
    handleSearch,
    clearSearch,
    closeResults,
    setIsOpen,
  };
}