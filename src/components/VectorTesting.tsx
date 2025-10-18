import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import SpecialtySearch from './specialty/SpecialtySearch'

interface Specialty {
  id: number;
  name: string;
}

const NUM_ROWS = 5;

const VectorTesting: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>('');
  const [similarSpecialties, setSimilarSpecialties] = React.useState<Specialty[]>([]);

  useEffect(() => {
    // Fetch specialties from the backend API
    const fetchSpecialties = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-specialties');
        
        if (error) {
          throw error;
        }
        
        console.log('Data from function:', data);
        setSpecialties((data ?? []) as Specialty[]);
      } catch (err) {
        console.error('Failed to load specialties', err);
      }
    };

    fetchSpecialties();
  }, []);



  useEffect(() => {
    const getSimilarSpecialties = async () => {
      if (!selectedSpecialty) return;

      try {
        const { data, error } = await supabase.functions.invoke('get-similar-specialties', {
          body: {
            input_name: selectedSpecialty,
            num_rows: NUM_ROWS
          }
        });

        if (error) {
          console.error('Failed to get similar specialties:', error);
        } else {
          setSimilarSpecialties((data ?? []) as Specialty[]);
        }
      } catch (err) {
        console.error('Error calling get-similar-specialties function:', err);
      }
    }

    getSimilarSpecialties();
  }, [selectedSpecialty]);

  const handleSpecialtySelect = (specialty: Specialty) => {
    setSelectedSpecialty(specialty.name);
  };

  return (
    <>
        <h1>Vector Testing</h1>
        
        {/* Reusable Specialty Search Component */}
        <div style={{ marginBottom: '20px' }}>
          <SpecialtySearch 
            onSpecialtySelect={handleSpecialtySelect}
            placeholder="Search for a specialty..."
            width="400px"
          />
        </div>

        {/* Original Select Dropdown (keeping for comparison) */}
        <select 
          value={selectedSpecialty}
          onChange={(e) => setSelectedSpecialty(e.target.value)}
          style={{ marginBottom: '20px' }}
        >
            <option value="">Select Specialty from full list</option>
            {specialties.map((specialty, index) => (
                <option key={index} value={specialty.name}>{specialty.name}</option>
            ))}
        </select>
        
        {similarSpecialties.length > 0 && (
          <div>
            <h2>Similar Specialties to "{selectedSpecialty}":</h2>
            <ul>
              {similarSpecialties.map((specialty, index) => (
                <li key={index}>{index+1}. {specialty.name}</li>
              ))}
            </ul>
          </div>
        )}
    </>
  )
}

export default VectorTesting
