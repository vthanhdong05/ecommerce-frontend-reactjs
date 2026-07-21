import { Search } from 'lucide-react';
import React, { useState } from 'react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({
  className = '',
  placeholder = 'Tìm kiếm sản phẩm...',
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else if (query.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative w-full">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 pl-4 pr-12 border-2 border-primary rounded-lg
                     focus:outline-none focus:border-orange-600
                     transition-colors text-sm"
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-10 w-12
                     bg-primary hover:bg-orange-600 rounded-r-lg
                     flex items-center justify-center transition-colors"
          aria-label="Tìm kiếm"
        >
          <Search className="w-5 h-5 text-white" />
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
