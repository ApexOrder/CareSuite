# CareSuite modular architecture

CareSuite is organised around independently maintainable business modules. Subscription access and user permissions are separate concerns:

- **Subscription entitlement** decides whether a company owns a module.
- **Permission entitlement** decides whether an individual user may use it.

Both checks must be enforced. Hiding navigation is not a security boundary.

## Subscription tiers

| Tier | Included modules |
| --- | --- |
| CORE | Dashboard, Clients, Staff, Visits, Users, Company |
| PROFESSIONAL | CORE plus Care Plans, Actions, Risks, Audits, Reports |
| CLINICAL | PROFESSIONAL plus Medication and Medication Orders |
| ENTERPRISE | CLINICAL plus advanced role management and future enterprise modules |

`CompanyModule` records override the plan in either direction. An override can be temporary through `expiresAt`.

## Frontend module contract

Each module should live under `src/modules/<module-name>`:

```text
src/modules/clients/
├── api/
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
└── index.ts
```

A module exports its public surface only from `index.ts`. Modules must not import private files from another module. Cross-module reusable code belongs in `src/core` or `src/shared`.

The canonical module list is in `src/core/modules/registry.ts`. Navigation, routing and upgrade messaging should derive from that registry rather than maintaining duplicate lists.

## Backend module contract

Each backend module should live under `server/modules/<module-name>`:

```text
server/modules/clients/
├── clients.routes.ts
├── clients.controller.ts
├── clients.service.ts
├── clients.repository.ts
└── clients.schema.ts
```

Protected routes use middleware in this order:

```ts
authenticate,
requireModule(prisma, 'clients'),
requirePermission('clients.view'),
handler
```

## Migration strategy

1. Apply the Prisma SQL migration.
2. Add the entitlement endpoint returning the authenticated company's tier, enabled modules and overrides.
3. Wrap the application in a module provider.
4. Build sidebar navigation from the module registry.
5. Extract Clients as the reference module.
6. Extract Staff and Visits.
7. Extract Professional and Clinical modules.
8. Split `server.ts` into matching backend modules.

During extraction, existing routes and UI behaviour should remain unchanged.

## Deployment

Apply migrations before deploying code that enforces module access:

```bash
npx prisma migrate deploy
npx prisma generate
npm run build
pm2 restart caresuite --update-env
```

The migration places existing trial companies on the CLINICAL tier so current demo functionality is not unexpectedly removed.
