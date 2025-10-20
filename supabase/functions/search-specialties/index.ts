import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

interface RequestBody {
  input: string;
}

serve(async (req) => {
  // Handle preflight request (CORS)
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    // Parse request body
    const body: RequestBody = await req.json();
    
    if (!body.input) {
      return new Response(
        JSON.stringify({ error: 'input is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    const searchInput = body.input.trim();
    
    if (searchInput.length === 0) {
      return new Response(
        JSON.stringify({ error: 'input cannot be empty' }), 
        { 
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Search for specialties that start with or contain the input
    // Using CASE statement to prioritize matches that start with the input
    const { data, error } = await supabase
      .from('specialties')
      .select('id, name')
      .or(`name.ilike.${searchInput}%,name.ilike.%${searchInput}%`)
      .order('name', { ascending: true })
      .limit(5);

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 500,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Sort results to prioritize those that start with the input
    const sortedData = data?.sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(searchInput.toLowerCase());
      const bStartsWith = b.name.toLowerCase().startsWith(searchInput.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return a.name.localeCompare(b.name);
    }) || [];

    return new Response(JSON.stringify(sortedData), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  }
});