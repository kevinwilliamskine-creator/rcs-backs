// RCS Backs — commentaires des clips (stockage Vercel Blob, un fichier par commentaire).
const { put, list, del } = require('@vercel/blob');

const ID = /^[a-zA-Z0-9_-]{1,40}$/;
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (req.method === 'GET') {
      const blobs = []; let cursor;
      do { const r = await list({ prefix: 'cm/', cursor, limit: 1000 }); blobs.push(...r.blobs); cursor = r.hasMore ? r.cursor : undefined; } while (cursor && blobs.length < 3000);
      const items = await Promise.all(blobs.map(async b => {
        try { const r = await fetch(b.url, { cache: 'no-store' }); if (!r.ok) return null; const x = await r.json(); return { ...x, id: b.pathname.slice(3, -5) }; } catch { return null; }
      }));
      res.status(200).json({ comments: items.filter(Boolean).sort((a, b) => a.ts - b.ts) });
      return;
    }
    if (req.method === 'POST') {
      const b = await readBody(req);
      const clip = clean(b.clip, 40), text = clean(b.text, 600), name = clean(b.name, 40) || '?', pid = clean(b.pid, 40);
      if (!ID.test(clip) || !text || (pid && !ID.test(pid))) { res.status(400).json({ error: 'invalid' }); return; }
      const ts = Date.now();
      const id = `${clip}--${ts}-${Math.random().toString(36).slice(2, 8)}`;
      await put(`cm/${id}.json`, JSON.stringify({ clip, pid, name, text, ts }), { access: 'public', contentType: 'application/json', addRandomSuffix: false, cacheControlMaxAge: 31536000 });
      res.status(200).json({ ok: true, id });
      return;
    }
    if (req.method === 'DELETE') {
      const b = await readBody(req);
      const id = clean(b.id, 120);
      if (!/^[a-zA-Z0-9_-]+--\d+-[a-z0-9]+$/.test(id)) { res.status(400).json({ error: 'invalid' }); return; }
      const r = await list({ prefix: `cm/${id}.json`, limit: 1 });
      const blob = r.blobs[0]; if (!blob) { res.status(404).json({ error: 'not_found' }); return; }
      if (!b.coach) {
        const x = await (await fetch(blob.url, { cache: 'no-store' })).json();
        if (!x.pid || x.pid !== clean(b.pid, 40)) { res.status(403).json({ error: 'forbidden' }); return; }
      }
      await del(blob.url);
      res.status(200).json({ ok: true });
      return;
    }
    res.setHeader('Allow', 'GET, POST, DELETE'); res.status(405).json({ error: 'method' });
  } catch (e) {
    res.status(500).json({ error: 'server' });
  }
};
