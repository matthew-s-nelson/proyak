import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { 
      user_id, 
      specialty_id, 
      work_type, 
      employment_type, 
      bio, 
      location,
      interest_ids 
    } = await req.json();

    // Validate required fields
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!specialty_id) {
      return new Response(
        JSON.stringify({ error: 'specialty_id is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Array.isArray(interest_ids) || interest_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one interest is required' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' } 
        }
      );
    }

    // Step 1: Insert into candidate_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('candidate_profiles')
      .insert({
        user_id,
        specialty_id,
        work_type,
        employment_type,
        bio: bio || null,
        location: location || null,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile insert error:', profileError);
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Step 2: Insert interests into user_interest pivot table
    const userInterests = interest_ids.map((interest_id: number) => ({
      user_id,
      interest_id,
    }));

    const { data: interestsData, error: interestsError } = await supabase
      .from('user_interest')
      .insert(userInterests)
      .select();

    if (interestsError) {
      console.error('Interests insert error:', interestsError);
      // If interests insert fails, we might want to rollback the profile
      // For now, we'll just log the error and return it
      throw new Error(`Failed to add interests: ${interestsError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        profile: profileData,
        interests: interestsData 
      }), 
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error creating candidate profile:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }), 
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      }
    );
  }
});
