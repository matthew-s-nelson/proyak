import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle preflight request (CORS)
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get resume_url and/or cover_letter_url from request
    const { resume_url, cover_letter_url } = await req.json();

    if (!resume_url && !cover_letter_url) {
      return new Response(
        JSON.stringify({ error: "At least one of resume_url or cover_letter_url is required" }),
        {
          status: 400,
          headers: { ...corsHeaders(), "Content-Type": "application/json" },
        }
      );
    }

    // Use service role key to access storage
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

    const result: {
      resume_signed_url?: string | null;
      cover_letter_signed_url?: string | null;
    } = {};

    // Generate signed URL for resume if provided
    if (resume_url) {
      const { data: signedUrlData, error: resumeError } = await supabase.storage
        .from('resumes')
        .createSignedUrl(resume_url, 60 * 60); // 1 hour expiration
      
      if (resumeError) {
        console.error("Resume signed URL error:", resumeError);
        result.resume_signed_url = null;
      } else if (signedUrlData) {
        result.resume_signed_url = signedUrlData.signedUrl;
      }
    }

    // Generate signed URL for cover letter if provided
    if (cover_letter_url) {
      const { data: signedUrlData, error: coverLetterError } = await supabase.storage
        .from('cover-letters')
        .createSignedUrl(cover_letter_url, 60 * 60); // 1 hour expiration
      
      if (coverLetterError) {
        console.error("Cover letter signed URL error:", coverLetterError);
        result.cover_letter_signed_url = null;
      } else if (signedUrlData) {
        result.cover_letter_signed_url = signedUrlData.signedUrl;
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders(), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error", 
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: { ...corsHeaders(), "Content-Type": "application/json" },
      }
    );
  }
});
