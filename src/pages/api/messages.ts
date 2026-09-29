import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

// Runs on the server for every request instead of being built to a static file
export const prerender = false;

const MAX_LENGTH = 500;
const SENDERS = ['Helen', 'Hassan'] as const;
type Sender = (typeof SENDERS)[number];

// Messages are stored as "text - Name"; this pulls the name back off the end
const SENDER_SUFFIX = /\s-\s(Helen|Hassan)$/;

function parseMessage(message: string | null) {
  const raw = message ?? '';
  const match = raw.match(SENDER_SUFFIX);
  if (!match) return { text: raw, sender: null };
  return { text: raw.slice(0, match.index).trimEnd(), sender: match[1] as Sender };
}

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
    .order('created_at', { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data.map((m) => ({ id: m.id, created_at: m.created_at, ...parseMessage(m.message) })));
};

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message: rawMessage, sender } = (body ?? {}) as { message?: unknown; sender?: unknown };
  const text = typeof rawMessage === 'string' ? rawMessage.trim() : '';

  if (!SENDERS.includes(sender as Sender)) {
    return Response.json({ error: 'Pick Helen or Hassan' }, { status: 400 });
  }
  if (!text) return Response.json({ error: 'Message is empty' }, { status: 400 });
  if (text.length > MAX_LENGTH) {
    return Response.json({ error: `Message is longer than ${MAX_LENGTH} characters` }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('Messages')
    .insert({ message: `${text} - ${sender}` })
    .select('id, created_at, message')
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ id: data.id, created_at: data.created_at, ...parseMessage(data.message) }, { status: 201 });
};
