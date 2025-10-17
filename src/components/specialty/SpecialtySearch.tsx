import React from 'react';
import { createClient } from '@supabase/supabase-js';
import AutocompleteSearch from '../shared/AutocompleteSearch';

interface Specialty {
  id: number;
  name: string;
}

interface SpecialtySearchProps {
  onSpecialtySelect: (specialty: Specialty) => void;
  placeholder?: string;
  width?: string;
}

const SpecialtySearch: React.FC<SpecialtySearchProps> = ({
  onSpecialtySelect,
  placeholder = "Search for a specialty...",
  width = "300px"
}) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const searchSpecialties = async (query: string): Promise<Specialty[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('search-specialties', {
        body: { input: query }
      });

      if (error) {
        console.error('Failed to search specialties:', error);
        return [];
      }

      return (data ?? []) as Specialty[];
    } catch (err) {
      console.error('Error calling search-specialties function:', err);
      return [];
    }
  };

  return (
    <AutocompleteSearch<Specialty>
      searchFunction={searchSpecialties}
      onItemSelect={onSpecialtySelect}
      displayProperty="name"
      placeholder={placeholder}
      width={width}
      noResultsText="No specialties found"
    />
  );
};

export default SpecialtySearch;