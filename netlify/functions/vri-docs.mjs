import { getStore } from '@netlify/blobs';
import { validSession } from './_auth.mjs';

const STORE = 'vri-tekeningen';
const MAX = 4 * 1024 * 1024;
const ALLOWED = new Set(['application/pdf','image/jpeg','image/png']);

const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: { 'cache-control': 'no-store' }
  });

const clean = s =>
  String(s || '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 160);

export default async (req) => {
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'list';
  const slug = clean(url.searchParams.get('slug'));

  const store = getStore({
    name: STORE,
    consistency: 'strong'
  });

  // =========================================================
  // LIJST MET TEKENINGEN OPHALEN
  // =========================================================
  if (action === 'list') {
    if (!slug) {
      return json({ error: 'slug ontbreekt' }, 400);
    }

    const { blobs } = await store.list({
      prefix: `${slug}/`
    });

    const docs = [];

    for (const b of blobs) {
      const entry = await store.getWithMetadata(b.key, {
        type: 'blob',
        consistency: 'strong'
      });

      if (!entry) continue;

      const m = entry.metadata || {};

      // Fallback voor reeds geüploade bestanden
      const fallbackName = b.key
        .split('/')
        .pop()
        .replace(/^[0-9a-f-]{36}-/i, '');

      const name = m.name || fallbackName;

      docs.push({
        id: b.key,
        name: name,
        title:
          m.title ||
          name.replace(/\.[^.]+$/, ''),
        type:
          m.type ||
          entry.data?.type ||
          'application/octet-stream',
        size:
          Number(m.size) ||
          Number(entry.data?.size) ||
          0,
        uploadedAt:
          m.uploadedAt || '',
        url:
          `/api/vri-docs?action=file&id=${encodeURIComponent(b.key)}`
      });
    }

    docs.sort((a, b) =>
      String(b.uploadedAt).localeCompare(
        String(a.uploadedAt)
      )
    );

    return json({ docs });
  }

  // =========================================================
  // BESTAND OPENEN
  // =========================================================
  if (action === 'file') {
    const id = url.searchParams.get('id') || '';

    if (!id || id.includes('..')) {
      return new Response('Niet gevonden', {
        status: 404
      });
    }

    const entry = await store.getWithMetadata(id, {
      type: 'blob',
      consistency: 'strong'
    });

    if (!entry) {
      return new Response('Niet gevonden', {
        status: 404
      });
    }

    const m = entry.metadata || {};

    return new Response(entry.data, {
      headers: {
        'content-type':
          m.type || 'application/octet-stream',

        'content-disposition':
          `inline; filename="${clean(m.name || 'tekening')}"`,

        'cache-control':
          'private, max-age=300'
      }
    });
  }

  // =========================================================
  // VANAF HIER ALLEEN VOOR INGelogde BEHEERDERS
  // =========================================================
  if (!validSession(req)) {
    return json({
      error: 'Niet ingelogd'
    }, 401);
  }

  // =========================================================
  // TEKENING UPLOADEN
  // =========================================================
  if (
    action === 'upload' &&
    req.method === 'POST'
  ) {
    if (!slug) {
      return json({
        error: 'slug ontbreekt'
      }, 400);
    }

    const form = await req.formData();

    const file = form.get('file');

    const title = String(
      form.get('title') || ''
    )
      .trim()
      .slice(0, 120);

    if (!(file instanceof File)) {
      return json({
        error: 'Geen bestand gekozen'
      }, 400);
    }

    if (!ALLOWED.has(file.type)) {
      return json({
        error:
          'Alleen PDF, JPG en PNG zijn toegestaan'
      }, 400);
    }

    if (file.size > MAX) {
      return json({
        error:
          'Bestand is groter dan 4 MB'
      }, 413);
    }

    const id =
      `${slug}/` +
      `${crypto.randomUUID()}-` +
      `${clean(file.name)}`;

    const metadata = {
      name: file.name,

      title:
        title ||
        file.name.replace(/\.[^.]+$/, ''),

      type: file.type,
      size: file.size,

      uploadedAt:
        new Date().toISOString()
    };

    await store.set(id, file, {
      metadata
    });

    return json({
      ok: true,

      doc: {
        id,
        ...metadata
      }
    }, 201);
  }

  // =========================================================
  // TEKENING VERWIJDEREN
  // =========================================================
  if (
    action === 'delete' &&
    req.method === 'DELETE'
  ) {
    const id =
      url.searchParams.get('id') || '';

    if (
      !id ||
      !slug ||
      !id.startsWith(slug + '/')
    ) {
      return json({
        error: 'Ongeldig bestand'
      }, 400);
    }

    await store.delete(id);

    return json({
      ok: true
    });
  }

  return json({
    error: 'Niet toegestaan'
  }, 405);
};

export const config = {
  path: '/api/vri-docs'
};
