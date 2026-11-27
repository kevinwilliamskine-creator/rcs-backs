// RCS Backs — accès par code (joueurs) et code coach. Les codes sont dans les variables Vercel.
import { next } from '@vercel/functions';

export const config = { matcher: '/:path*' };

const enc = new TextEncoder();
async function sig(role, code) {
  const salt = process.env.AUTH_SALT || '';
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(`${role}:${code}:${salt}`));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
function cookie(req, name) {
  const m = (req.headers.get('cookie') || '').match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}
export async function roleOf(req) {
  const team = process.env.TEAM_CODE, coach = process.env.COACH_CODE;
  if (!team || !coach) return 'open';
  const c = cookie(req, 'rcs_auth');
  if (!c) return '';
  if (c === await sig('coach', coach)) return 'coach';
  if (c === await sig('team', team)) return 'team';
  return '';
}

const page = (err) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RCS Backs</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0f5132;font-family:system-ui,sans-serif;color:#fff}
form{background:#fff;color:#0f2a1c;padding:28px 22px;border-radius:16px;width:min(320px,86vw);text-align:center;box-shadow:0 10px 30px rgba(0,0,0,.25)}
h1{margin:0 0 6px;font-size:22px}p{margin:0 0 16px;color:#4a5a50;font-size:15px}
input{width:100%;box-sizing:border-box;font-size:20px;padding:12px;border:2px solid #cfd8d2;border-radius:10px;text-align:center}
button{margin-top:12px;width:100%;font-size:18px;padding:12px;border:0;border-radius:10px;background:#198754;color:#fff;font-weight:700}
.e{color:#b02a37;margin-top:10px;font-size:14px}</style></head><body>
<form method="post" action="/__auth"><h1>RCS Backs</h1><p>Entre le code de l'équipe</p>
<input name="code" type="password" autocomplete="current-password" autofocus required>
<button type="submit">Entrer</button>${err ? '<div class="e">Code incorrect</div>' : ''}</form></body></html>`;

export default async function middleware(req) {
  const url = new URL(req.url);
  const team = process.env.TEAM_CODE, coach = process.env.COACH_CODE;
  if (!team || !coach) return next();

  if (url.pathname === '/__auth' && req.method === 'POST') {
    let code = '';
    try { const f = await req.formData(); code = String(f.get('code') || '').trim(); } catch {}
    let role = '';
    if (code === coach) role = 'coach'; else if (code.toLowerCase() === team.toLowerCase()) role = 'team';
    if (!role) return new Response(page(true), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
    const v = await sig(role, role === 'coach' ? coach : team);
    const h = new Headers({ location: role === 'coach' ? '/?coach' : '/', 'cache-control': 'no-store' });
    h.append('set-cookie', `rcs_auth=${v}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`);
    h.append('set-cookie', `rcs_role=${role}; Path=/; Max-Age=31536000; Secure; SameSite=Lax`);
    return new Response(null, { status: 303, headers: h });
  }
  if (url.pathname === '/__logout') {
    const h = new Headers({ location: '/', 'cache-control': 'no-store' });
    h.append('set-cookie', 'rcs_auth=; Path=/; Max-Age=0; Secure; SameSite=Lax');
    h.append('set-cookie', 'rcs_role=; Path=/; Max-Age=0; Secure; SameSite=Lax');
    return new Response(null, { status: 303, headers: h });
  }

  const role = await roleOf(req);
  if (role) return next();
  const dest = req.headers.get('sec-fetch-dest');
  const wantsHtml = dest === 'document' || (req.headers.get('accept') || '').includes('text/html') || url.pathname === '/' || url.pathname.endsWith('.html');
  if (wantsHtml) return new Response(page(false), { status: 401, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
  return new Response('Accès réservé', { status: 401, headers: { 'cache-control': 'no-store' } });
}
