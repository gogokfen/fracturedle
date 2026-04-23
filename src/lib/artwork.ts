import OpenAI from 'openai';

function openaiClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY not set');
  return new OpenAI({ apiKey: key });
}

function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role env vars not set');
  const { createClient } = require('@supabase/supabase-js');
  return createClient(url, key);
}

const STYLE_SUFFIX =
  'Magic: The Gathering card art style, fantasy illustration, detailed painterly digital art, dramatic lighting, no text, no borders, no card frame';

export async function generateAndCacheArtwork(
  puzzleId: string,
  prompt: string,
): Promise<string> {
  const openai = openaiClient();

  // Generate with DALL-E 3
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `${prompt}. ${STYLE_SUFFIX}`,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  const tempUrl = response.data?.[0]?.url;
  if (!tempUrl) throw new Error('No image URL returned from DALL-E');

  // Download the image (DALL-E URLs expire in ~1 hour)
  const imageRes = await fetch(tempUrl);
  if (!imageRes.ok) throw new Error('Failed to download generated image');
  const buffer = await imageRes.arrayBuffer();

  // Upload to Supabase Storage for permanent hosting
  const supabase = supabaseAdmin();
  const filename = `${puzzleId}-${Date.now()}.png`;
  const { error: uploadError } = await supabase.storage
    .from('card-artwork')
    .upload(filename, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage.from('card-artwork').getPublicUrl(filename);
  return data.publicUrl as string;
}
