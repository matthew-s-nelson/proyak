import React from 'react';
import { supabase } from '../../lib/supabase';
import AutocompleteSearch from '../shared/AutocompleteSearch';

interface Interest {
  id: number;
  name: string;
  [key: string]: any;
}

interface InterestSearchProps {
  onInterestSelect: (interest: Interest) => void;
  placeholder?: string;
  width?: string;
}

const InterestSearch: React.FC<InterestSearchProps> = (props) => {
  const {
    onInterestSelect,
    placeholder = "Search for an interest...",
    width = "300px"
  } = props;

  const searchInterests = async (query: string): Promise<Interest[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('search-interests', {
        body: { input: query }
      });

      if (error) {
        console.error('Failed to search interests:', error);
        return [];
      }

      return (data ?? []) as Interest[];
    } catch (err) {
      console.error('Error calling search-interests function:', err);
      return [];
    }
  };

  return (
    <AutocompleteSearch<Interest>
      searchFunction={searchInterests}
      onItemSelect={onInterestSelect}
      displayProperty="name"
      placeholder={placeholder}
      width={width}
      noResultsText="No interests found"
    />
  );
};

export default InterestSearch;