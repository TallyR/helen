import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Runs on the server for every request instead of being built to a static file
export const prerender = false;

const MAX_LENGTH = 500;

const url = import.meta.env.SUPABASE_URL;
const key = import.meta.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in .env');
}

const supabase = createClient(url, key);

export const GET: APIRoute = async () => {
  const { data, error } = await supabase
    .from('Messages')
    .select('id, created_at, message')
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const raw = (body as { message?: unknown })?.message;
  const message = typeof raw === 'string' ? raw.trim() : '';

  if (!message) return Response.json({ error: 'Message is empty' }, { status: 400 });
  if (message.length > MAX_LENGTH) {
    return Response.json({ error: `Message is longer than ${MAX_LENGTH} characters` }, { status: 400 });
  }

  const { error } = await supabase.from('Messages').insert({ message });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(null, { status: 204 });
};
