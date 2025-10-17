import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

interface Specialty {
  id: number;
  name: string;
}

const VectorTesting: React.FC = () => {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = React.useState<string>('');

  useEffect(() => {
    // Fetch specialties from the backend API
    // TODO: figure out API keys for github actions
    const fetchSpecialties = async () => {
      try {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          throw new Error('Supabase environment variables not configured');
        }
        
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.functions.invoke('get-specialties');
        
        if (error) {
          throw error;
        }
        
        console.log('Data from function:', data);
        setSpecialties(data);
      } catch (err) {
        console.error('Failed to load specialties', err);
      }
    };

    fetchSpecialties();
  }, []);

  return (
    <>
        <h1>Vector Testing</h1>
        <select>
            <option value="">Select Specialty</option>
            {specialties.map((specialty, index) => (
                <option key={index} value={specialty.id}>{specialty.name}</option>
            ))}
        </select>
    </>
  )
}

export default VectorTesting
