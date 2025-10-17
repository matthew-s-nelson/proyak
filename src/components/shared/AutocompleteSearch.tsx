import React, { useEffect, useState } from 'react';

interface AutocompleteItem {
  id: number | string;
  [key: string]: any; // Allow any additional properties
}

interface AutocompleteSearchProps<T extends AutocompleteItem> {
  onItemSelect: (item: T) => void;
  searchFunction: (query: string) => Promise<T[]>;
  displayProperty: keyof T;
  placeholder?: string;
  width?: string;
  debounceMs?: number;
  maxResults?: number;
  noResultsText?: string;
}

function AutocompleteSearch<T extends AutocompleteItem>({
  onItemSelect,
  searchFunction,
  displayProperty,
  placeholder = "Search...",
  width = "300px",
  debounceMs = 300,
  maxResults = 10,
  noResultsText = "No results found"
}: AutocompleteSearchProps<T>) {
  const [searchInput, setSearchInput] = useState<string>('');
  const [searchResults, setSearchResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isManualSelection, setIsManualSelection] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search items as user types
  useEffect(() => {
    const searchItems = async () => {
      if (!searchInput.trim() || isManualSelection) {
        setSearchResults([]);
        setShowDropdown(false);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const results = await searchFunction(searchInput.trim());
        const limitedResults = results.slice(0, maxResults);
        setSearchResults(limitedResults);
        setShowDropdown(true);
      } catch (err) {
        console.error('Error in search function:', err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search to avoid too many API calls
    const timeoutId = setTimeout(searchItems, debounceMs);
    return () => clearTimeout(timeoutId);
  }, [searchInput, isManualSelection, searchFunction, debounceMs, maxResults]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsManualSelection(false);
    setSearchInput(e.target.value);
  };

  const handleItemSelect = (item: T) => {
    setIsManualSelection(true);
    setSearchInput(String(item[displayProperty]));
    setShowDropdown(false);
    setSearchResults([]);
    onItemSelect(item);
  };

  // Clear search when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <input
        type="text"
        value={searchInput}
        onChange={handleInputChange}
        placeholder={placeholder}
        style={{
          width,
          padding: '10px',
          fontSize: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      
      {/* Dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ccc',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{
              padding: '10px',
              textAlign: 'center',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Loading...
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemSelect(item)}
                style={{
                  padding: '10px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #eee',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.backgroundColor = 'white';
                }}
              >
                {String(item[displayProperty])}
              </div>
            ))
          ) : (
            <div style={{
              padding: '10px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              {noResultsText}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AutocompleteSearch;