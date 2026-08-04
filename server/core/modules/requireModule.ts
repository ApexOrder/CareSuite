import type { NextFunction, Request, Response } from 'express';
import type { PrismaClient } from '@prisma/client';
import { companyHasModule, type ModuleKey } from './moduleAccess';

export function requireModule(prisma: PrismaClient, moduleKey: ModuleKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as Request & { user?: { companyId?: string } }).user;

    if (!user?.companyId) {
      return res.status(401).json({ error: 'No authenticated company context' });
    }

    try {
      const enabled = await companyHasModule(prisma, user.companyId, moduleKey);
      if (!enabled) {
        return res.status(403).json({
          error: 'Module not included in subscription',
          code: 'MODULE_DISABLED',
          module: moduleKey,
        });
      }

      next();
    } catch (error) {
      console.error(`[MODULE] Failed entitlement check for ${moduleKey}:`, error);
      return res.status(503).json({ error: 'Unable to verify module entitlement' });
    }
  };
}
