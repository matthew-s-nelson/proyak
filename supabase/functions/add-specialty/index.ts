// supabase/functions/create-specialty/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const embedUrl = Deno.env.get('EMBED_SERVICE_URL')!;
const embedApiKey = Deno.env.get('EMBED_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  try {
    const { name } = await req.json();

    // Step 1: Get embedding from your microservice
    const embedRes = await fetch(`${embedUrl}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': embedApiKey,
      },
      body: JSON.stringify({ name }),
    });

    if (!embedRes.ok) {
      const err = await embedRes.text();
      throw new Error(`Embedding service error: ${err}`);
    }

    const { embedding } = await embedRes.json();

    // Step 2: Insert into Supabase
    const { data, error } = await supabase
      .from('specialties')
      .insert([{ name, embedding }])
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
