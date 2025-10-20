import React from 'react';
import { supabase } from '../../lib/supabase';
import AutocompleteSearch from '../shared/AutocompleteSearch';

interface Specialty {
  id: number;
  name: string;
  [key: string]: any;
}

interface SpecialtySearchProps {
  onSpecialtySelect: (specialty: Specialty) => void;
  placeholder?: string;
  width?: string;
}

const SpecialtySearch: React.FC<SpecialtySearchProps> = (props) => {
  const {
    onSpecialtySelect,
    placeholder = "Search for a specialty...",
    width = "300px"
  } = props;

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