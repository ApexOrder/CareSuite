import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();
const jwtSecret = process.env.JWT_SECRET || 'caresuite-fallback-secret';

type ClientIdentifierInput = {
  nhsNumber?: string | null;
  pidNumber?: string | null;
};

function parseCookie(cookieHeader = ''): Record<string, string> {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map(part => part.trim())
      .filter(Boolean)
      .map(part => {
        const separator = part.indexOf('=');
        return separator === -1
          ? [part, '']
          : [part.slice(0, separator), decodeURIComponent(part.slice(separator + 1))];
      }),
  );
}

function getCompanyId(req: Request): string | null {
  try {
    const token = parseCookie(req.headers.cookie).token;
    if (!token) return null;
    const payload = jwt.verify(token, jwtSecret) as { companyId?: string };
    return payload.companyId || null;
  } catch {
    return null;
  }
}

function normaliseNhsNumber(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const digits = String(value).replace(/\D/g, '');
  if (digits.length !== 10) throw new Error('NHS number must contain exactly 10 digits');
  return digits;
}

function normalisePidNumber(value: unknown): string | null {
  if (value === undefined || value === null || value === '') return null;
  const pid = String(value).trim();
  if (pid.length > 100) throw new Error('PID number is too long');
  return pid;
}

async function getIdentifiers(ids: string[]): Promise<Map<string, ClientIdentifierInput>> {
  if (!ids.length) return new Map();
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string; nhsNumber: string | null; pidNumber: string | null }>>(
    `SELECT "id", "nhsNumber", "pidNumber" FROM "Client" WHERE "id" = ANY($1::text[])`,
    ids,
  );
  return new Map(rows.map(row => [row.id, row]));
}

async function clientIdentifierMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith('/api/clients')) return next();

  const companyId = getCompanyId(req);
  if (!companyId) return next();

  let identifiers: ClientIdentifierInput | null = null;
  const isCreateOrEdit = req.method === 'POST' || req.method === 'PUT';
  const hasIdentifierInput = req.body && typeof req.body === 'object' && ('nhsNumber' in req.body || 'pidNumber' in req.body);

  if (isCreateOrEdit && hasIdentifierInput) {
    try {
      identifiers = {
        nhsNumber: normaliseNhsNumber(req.body.nhsNumber),
        pidNumber: normalisePidNumber(req.body.pidNumber),
      };
      delete req.body.nhsNumber;
      delete req.body.pidNumber;
    } catch (error) {
      return res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid client identifiers' });
    }
  }

  const originalJson = res.json.bind(res);
  res.json = ((payload: any) => {
    void (async () => {
      try {
        if (identifiers && payload?.id && res.statusCode < 400) {
          await prisma.$executeRawUnsafe(
            `UPDATE "Client" SET "nhsNumber" = $1, "pidNumber" = $2 WHERE "id" = $3 AND "companyId" = $4`,
            identifiers.nhsNumber,
            identifiers.pidNumber,
            payload.id,
            companyId,
          );
          payload.nhsNumber = identifiers.nhsNumber;
          payload.pidNumber = identifiers.pidNumber;
        }

        const records = Array.isArray(payload) ? payload : payload?.id ? [payload] : [];
        const idMap = await getIdentifiers(records.map(record => record.id).filter(Boolean));
        for (const record of records) {
          const values = idMap.get(record.id);
          if (values) Object.assign(record, values);
        }

        if (Array.isArray(payload) && req.method === 'GET') {
          const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
          if (search) {
            const archived = req.query.archived;
            const archiveClause = archived === 'true'
              ? 'AND "archivedAt" IS NOT NULL'
              : archived === 'all'
                ? ''
                : 'AND "archivedAt" IS NULL';

            const matches = await prisma.$queryRawUnsafe<any[]>(
              `SELECT * FROM "Client"
               WHERE "companyId" = $1
                 ${archiveClause}
                 AND ("nhsNumber" ILIKE $2 OR "pidNumber" ILIKE $2)`,
              companyId,
              `%${search}%`,
            );
            const existingIds = new Set(payload.map(record => record.id));
            for (const match of matches) {
              if (!existingIds.has(match.id)) payload.push(match);
            }
          }
        }

        originalJson(payload);
      } catch (error) {
        console.error('[CLIENT IDENTIFIERS]', error);
        originalJson(payload);
      }
    })();
    return res;
  }) as Response['json'];

  next();
}

const application = express.application as any;
const originalUse = application.use;
application.use = function patchedUse(...args: any[]) {
  const result = originalUse.apply(this, args);
  const includesJsonParser = args.some(arg => typeof arg === 'function' && arg.name === 'jsonParser');
  if (includesJsonParser && !this.__clientIdentifiersInstalled) {
    this.__clientIdentifiersInstalled = true;
    originalUse.call(this, clientIdentifierMiddleware);
  }
  return result;
};

await import('../server.ts');
