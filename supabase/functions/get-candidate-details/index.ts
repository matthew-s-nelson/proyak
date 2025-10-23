import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle preflight request (CORS)
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get candidate_profile_id from request
    const { candidate_profile_id } = await req.json();

    if (!candidate_profile_id) {
      return new Response(
        JSON.stringify({ error: "candidate_profile_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Use service role key to access auth schema
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch candidate profile with related data
    const { data: candidateProfile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select(
        `
        id,
        user_id,
        specialty_id,
        work_type,
        employment_type,
        location,
        bio,
        created_at,
        updated_at,
        specialties (
          id,
          name
        )
      `
      )
      .eq("id", candidate_profile_id)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
      return new Response(
        JSON.stringify({ error: "Candidate profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Fetch interests associated with the candidate
    const { data: userInterests, error: interestsError } = await supabase
      .from("user_interest")
      .select(
        `
        interests (
          id,
          name
        )
      `
      )
      .eq("candidate_id", candidate_profile_id);

    if (interestsError) {
      console.error("Interests error:", interestsError);
    }

    // Extract just the interests data
    const interests = userInterests?.map(ui => ui.interests).filter(Boolean) || [];

    // Fetch user data using auth.admin API
    const { data: authData, error: authError } = await supabase.auth.admin.getUserById(
      candidateProfile.user_id
    );

    if (authError || !authData.user) {
      console.error("User error:", authError);
      return new Response(
        JSON.stringify({ error: "User data not found" }),
        {
          status: 404,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Extract relevant user data
    const userData = {
      id: authData.user.id,
      email: authData.user.email || "",
      full_name: authData.user.user_metadata?.full_name || null,
      created_at: authData.user.created_at,
    };

    // Combine the data
    const result = {
      candidate_profile: candidateProfile,
      user: userData,
      interests: interests,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: (error as Error).message }),
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  }
});
