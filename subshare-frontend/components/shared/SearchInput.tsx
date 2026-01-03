"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { debounce } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  debounceMs?: number;
}

export function SearchInput({ 
  placeholder = "Search...", 
  onSearch, 
  debounceMs = 300 
}: SearchInputProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      onSearch(query);
    }, debounceMs);

    debouncedSearch();
  }, [query, onSearch, debounceMs]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg bg-white/5 pl-12 pr-12 text-white placeholder-gray-400 transition-all border border-white/10 focus:bg-white/10 focus:border-[#00D9B4]"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}