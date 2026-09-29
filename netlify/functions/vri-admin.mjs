import { makeSession, sessionCookie, clearCookie, validSession, safeEqual } from './_auth.mjs';

const json = (data, status=200, headers={}) => Response.json(data, { status, headers: { 'cache-control':'no-store', ...headers } });

export default async (req) => {
  const action = new URL(req.url).searchParams.get('action') || 'status';
  if (action === 'status') return json({ authenticated: validSession(req) });
  if (action === 'logout') return json({ ok:true }, 200, { 'set-cookie': clearCookie() });
  if (action !== 'login' || req.method !== 'POST') return json({ error:'Niet toegestaan' }, 405);
  if (!process.env.VRI_ADMIN_PASSWORD || !process.env.VRI_SESSION_SECRET) return json({ error:'Beheer is nog niet geconfigureerd op Netlify.' }, 503);
  let body; try { body = await req.json(); } catch { return json({ error:'Ongeldige aanvraag' }, 400); }
  if (!safeEqual(body.password, process.env.VRI_ADMIN_PASSWORD)) return json({ error:'Onjuist wachtwoord' }, 401);
  return json({ ok:true }, 200, { 'set-cookie': sessionCookie(makeSession()) });
};

export const config = { path: '/api/vri-admin' };
