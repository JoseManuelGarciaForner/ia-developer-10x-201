import type { FastifyRequest } from 'fastify';
import { pool } from '../db.js';

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  email_provider: string;
  email_from: string;
  email_config: Record<string, unknown>;
}

const TENANT_COLUMNS = 'id, slug, name, email_provider, email_from, email_config';

// La tienda identifica al promotor por el dominio (entradas.salafaro.localhost)
// o, si no puede usar dominios propios (Codespaces), por el slug de la ruta /t/<slug>.
export async function resolvePublicTenant(req: FastifyRequest): Promise<Tenant | null> {
  const slug = req.headers['x-telon-tenant-slug'];
  if (typeof slug === 'string' && slug) {
    const r = await pool.query<Tenant>(`SELECT ${TENANT_COLUMNS} FROM tenants WHERE slug = $1`, [slug]);
    return r.rows[0] ?? null;
  }
  const host = req.headers['x-telon-host'];
  if (typeof host === 'string' && host) {
    const r = await pool.query<Tenant>(
      `SELECT ${TENANT_COLUMNS.split(', ').map((c) => 't.' + c).join(', ')}
         FROM domains d JOIN tenants t ON t.id = d.tenant_id
        WHERE d.host = $1`,
      [host.toLowerCase().replace(/:\d+$/, '')],
    );
    return r.rows[0] ?? null;
  }
  return null;
}

// El backoffice se autentica con el token del promotor.
export async function resolveAdminTenant(req: FastifyRequest): Promise<Tenant | null> {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const r = await pool.query<Tenant>(`SELECT ${TENANT_COLUMNS} FROM tenants WHERE admin_token = $1`, [token]);
  return r.rows[0] ?? null;
}
