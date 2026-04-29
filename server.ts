import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { z } from "zod";
import multer from "multer";
import helmet from "helmet";
import compression from "compression";

dotenv.config();

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "caresuite-fallback-secret";
const PORT = 3000;

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

// --- Zod Schemas ---
const ClientSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  addressLine1: z.string().optional().or(z.literal("")),
  town: z.string().optional().or(z.literal("")),
  postcode: z.string().optional().or(z.literal("")),
  carePackageStatus: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  notes: z.string().optional().or(z.literal("")),
});

const StaffSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  jobTitle: z.string().optional().or(z.literal("")),
  employmentStatus: z.enum(["ACTIVE", "ARCHIVED", "INACTIVE"]).default("ACTIVE"),
});

const VisitSchema = z.object({
  clientId: z.string().uuid(),
  staffId: z.string().uuid().optional().nullable(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  visitType: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["SCHEDULED", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "LATE", "MISSED", "CANCELLED", "NO_ACCESS"]).default("SCHEDULED"),
});

const ActionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  status: z.enum(["Open", "In Progress", "Completed", "Overdue", "Cancelled"]).default("Open"),
  dueDate: z.string().optional().nullable(),
  assignedToUserId: z.string().uuid().optional().nullable(),
  assignedToStaffId: z.string().uuid().optional().nullable(),
  sourceType: z.string().default("Manual"),
  sourceId: z.string().optional().nullable(),
});

const RiskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().default("Client"),
  riskLevel: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
  likelihood: z.enum(["Low", "Medium", "High"]).default("Medium"),
  impact: z.enum(["Low", "Medium", "High"]).default("Medium"),
  ownerUserId: z.string().uuid("Risk must have an owner").min(1),
  status: z.enum(["Open", "Monitoring", "Resolved", "Archived"]).default("Open"),
  reviewDate: z.string().optional().nullable(),
  linkedClientId: z.string().uuid().optional().nullable(),
  linkedStaffId: z.string().uuid().optional().nullable(),
});

const AuditSchema = z.object({
  title: z.string().min(1),
  auditType: z.string(),
  auditorId: z.string().uuid(),
  auditDate: z.string().optional(),
  reviewDate: z.string().optional().nullable(),
  linkedClientId: z.string().uuid().optional().nullable(),
  linkedStaffId: z.string().uuid().optional().nullable(),
});

const MedicationSchema = z.object({
  clientId: z.string().uuid(),
  medicationName: z.string().min(1),
  strength: z.string().optional().nullable(),
  form: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  dose: z.string().optional().nullable(),
  dosageInstructions: z.string().min(1),
  frequency: z.string().min(1),
  medicationType: z.enum(["Regular", "PRN", "Topical", "Controlled Drug", "Other"]).default("Regular"),
  isPRN: z.boolean().default(false),
  prnGuidance: z.string().optional().nullable(),
  prnReason: z.string().optional().nullable(),
  maxDose24Hours: z.string().optional().nullable(),
  isTopical: z.boolean().default(false),
  bodyMapNotes: z.string().optional().nullable(),
  prescribedBy: z.string().optional().nullable(),
  pharmacy: z.string().optional().nullable(),
  status: z.enum(["Active", "Discontinued", "On Hold"]).default("Active"),
  riskNotes: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  reviewDate: z.string().optional().nullable(),
});

const MARSchema = z.object({
  medicationId: z.string().uuid(),
  clientId: z.string().uuid(),
  staffId: z.string().uuid(),
  scheduledTime: z.string(),
  administeredTime: z.string().optional().nullable(),
  status: z.enum(["Scheduled", "Administered", "Refused", "Not Given", "Missed", "Held", "Cancelled"]).default("Scheduled"),
  doseGiven: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  refusalReason: z.string().optional().nullable(),
  notGivenReason: z.string().optional().nullable(),
});

const ActivityLogSchema = z.object({
  actionType: z.string(),
  entityType: z.string(),
  entityId: z.string().optional().nullable(),
  description: z.string(),
  metadata: z.any().optional(),
});

const NotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["INFO", "WARNING", "SUCCESS", "ERROR", "ALERT"]).default("INFO"),
});

// --- Middleware Helpers ---
const createNotification = async (userId: string, companyId: string, title: string, message: string, type: string = "INFO") => {
  try {
    await prisma.notification.create({
      data: {
        userId,
        companyId,
        title,
        message,
        type,
      },
    });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
};

const notifyAdmins = async (companyId: string, title: string, message: string, type: string = "INFO") => {
  try {
    const admins = await prisma.user.findMany({
      where: { 
        companyId,
        role: { name: { in: ["Owner", "Manager", "Admin"] } }
      }
    });

    await Promise.all(admins.map(admin => 
      createNotification(admin.id, companyId, title, message, type)
    ));
  } catch (err) {
    console.error("Failed to notify admins:", err);
  }
};
const logActivity = async (userId: string, companyId: string, actionType: string, entityType: string, entityId: string | null, description: string, metadata: any = null) => {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        companyId,
        actionType,
        entityType,
        entityId,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
};

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.error(`[API ERROR] ${req.method} ${req.url}:`, err);
    
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: err.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
    }

    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({ 
      error: err.message || "Internal Server Error",
      code: err.code
    });
  });
};

async function startServer() {
  const app = express();
  
  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for easier integration with front-end scripts in this env
    crossOriginEmbedderPolicy: false
  }));

  // Gzip Compression
  app.use(compression());

  app.use(express.json({ limit: '10mb' }));
  app.use(cookieParser());

  // Request logging middleware
  if (process.env.NODE_ENV !== "production") {
    app.use((req, res, next) => {
      console.log(`[REQ] ${req.method} ${req.url}`);
      next();
    });
  }

  // --- Auth Middleware ---
  const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      console.warn(`[AUTH] No token found for ${req.method} ${req.url}`);
      return res.status(401).json({ error: "No session found" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { 
          company: true, 
          role: { 
            include: { 
              permissions: { 
                include: { permission: true } 
              } 
            } 
          } 
        }
      });

      if (!user) {
        console.warn(`[AUTH] User not found for ID: ${decoded.userId}`);
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      if (user.status === "DISABLED") {
        console.warn(`[AUTH] Account disabled for: ${user.email}`);
        return res.status(403).json({ error: "Account disabled" });
      }

      (req as any).user = user;
      next();
    } catch (err) {
      console.error(`[AUTH] Token verification failed:`, err instanceof Error ? err.message : err);
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  const requirePermission = (permissionKey: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;
      const hasPerm = user.role.permissions.some((p: any) => p.permission.key === permissionKey);
      
      if (!hasPerm && !user.role.isSystem) {
        console.warn(`[AUTH] Permission denied for ${user.email}: ${permissionKey}`);
        return res.status(403).json({ error: "Forbidden" });
      }
      console.log(`[AUTH] Permission granted for ${user.email}: ${permissionKey}`);
      next();
    };
  };

  // --- API Routes ---

  // Auth
  app.post("/api/auth/signup-company", asyncHandler(async (req: Request, res: Response) => {
    const { 
      companyName, 
      tradingName,
      ownerName, 
      ownerEmail, 
      ownerPassword,
      addressLine1,
      town,
      postcode
    } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Company
      const company = await tx.company.create({
        data: {
          name: companyName,
          tradingName: tradingName || companyName,
          email: ownerEmail,
          addressLine1,
          town,
          postcode,
        }
      });

      // 2. Define Default Roles
      const roleDefs = [
        { name: 'Owner', description: 'Full system access', isSystem: true },
        { name: 'Manager', description: 'Full operational control' },
        { name: 'Admin', description: 'Office administration' },
        { name: 'Coordinator', description: 'Rota and scheduling' },
        { name: 'Senior Carer', description: 'Care supervision' },
        { name: 'Carer', description: 'Direct care delivery' },
        { name: 'Auditor', description: 'Compliance auditing' },
        { name: 'Read Only', description: 'View-only access' },
      ];

      const allPermissions = await tx.permission.findMany();
      let masterUserRole = null;

      for (const def of roleDefs) {
        const role = await tx.role.create({
          data: {
            companyId: company.id,
            name: def.name,
            description: def.description,
            isSystem: def.isSystem,
          }
        });

        if (def.name === 'Owner') masterUserRole = role;

        // Map permissions to role
        let permsToAssign: any[] = [];
        if (def.name === 'Owner' || def.name === 'Admin') {
          permsToAssign = allPermissions;
        } else if (def.name === 'Manager') {
          permsToAssign = allPermissions.filter(p => !p.key.startsWith('billing'));
        } else if (def.name === 'Coordinator') {
          permsToAssign = allPermissions.filter(p => p.key.startsWith('visits') || p.key.startsWith('clients.view') || p.key.startsWith('staff.view') || p.key.startsWith('medication.view') || p.key.startsWith('medication.orders') || p.key.startsWith('attachments.view'));
        } else if (def.name === 'Read Only') {
          permsToAssign = allPermissions.filter(p => p.key.endsWith('.view'));
        }

        if (permsToAssign.length > 0) {
          await tx.rolePermission.createMany({
            data: permsToAssign.map(p => ({ roleId: role.id, permissionId: p.id }))
          });
        }
      }

      // 3. Create Master User
      const passwordHash = await bcrypt.hash(ownerPassword, 10);
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          roleId: masterUserRole!.id,
          name: ownerName,
          email: ownerEmail,
          passwordHash,
        },
        include: { 
          company: true, 
          role: { 
            include: { 
              permissions: { include: { permission: true } } 
            } 
          } 
        }
      });

      return { user, company };
    });

    const token = jwt.sign({ userId: result.user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 
    });
    
    const { passwordHash, ...safeUser } = result.user;
    res.json({ user: safeUser, token });
  }));

  app.post("/api/auth/login", asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { 
        company: true, 
        role: {
          include: {
            permissions: { include: { permission: true } }
          }
        } 
      }
    });

    if (!user || user.status === "DISABLED") return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { 
      httpOnly: true, 
      secure: true, 
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000 
    });
    
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  }));

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { passwordHash, ...safeUser } = user;
    res.json(safeUser);
  }));

  // Dashboard
  app.get("/api/dashboard/stats", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userPayload = (req as any).user;
    const companyId = userPayload.companyId;
    const nowCheck = new Date();

    // Check for overdue actions and notify
    try {
      const overdueList = await prisma.action.findMany({
        where: {
          companyId,
          status: { in: ["Open", "In Progress"] },
          dueDate: { lt: nowCheck }
        }
      });

      for (const action of overdueList) {
        if (action.assignedToUserId) {
          const todayAtMidnight = new Date();
          todayAtMidnight.setHours(0,0,0,0);
          const existingNotify = await prisma.notification.findFirst({
            where: {
              userId: action.assignedToUserId,
              title: "Overdue Action",
              message: { contains: action.title },
              read: false,
              createdAt: { gte: todayAtMidnight }
            }
          });
          if (!existingNotify) {
            await createNotification(action.assignedToUserId, companyId, "Overdue Action", `Action "${action.title}" is overdue.`, "WARNING");
          }
        }
      }
    } catch (e) {
      console.error("Overdue check failed", e);
    }

    const [activeClients, activeStaff, totalVisitsToday, unassignedVisits, lateVisits, openActions, overdueActions, highPriorityActions, criticalActions, openRisks, highRisks, criticalRisks, overdueReviews, activeMedications, prnMissingGuidance, topicalMissingBodyMap, overdueMedReviews, pendingOrders, overdueOrders, orderIssues, awaitingCheck, activeCarePlans, carePlansUnderReview, overdueCarePlanReviews, clientsWithoutActivePlan, totalAudits, completedAudits, nonCompliantAudits, auditsWithOpenActions, overdueAudits] = await Promise.all([
      prisma.client.count({ where: { companyId, carePackageStatus: "ACTIVE" } }),
      prisma.staff.count({ where: { companyId, employmentStatus: "ACTIVE" } }),
      prisma.visit.count({ 
        where: { 
          companyId, 
          scheduledStart: { 
            gte: new Date(new Date().setHours(0,0,0,0)), 
            lte: new Date(new Date().setHours(23,59,59,999)) 
          } 
        } 
      }),
      prisma.visit.count({ where: { companyId, staffId: null, status: "SCHEDULED" } }),
      prisma.visit.count({ where: { companyId, status: "LATE" } }),
      prisma.action.count({ where: { companyId, status: { not: "Completed" } } }),
      prisma.action.count({
        where: {
          companyId,
          status: { not: "Completed" },
          dueDate: { lt: new Date() }
        }
      }),
      prisma.action.count({
        where: {
          companyId,
          status: { not: "Completed" },
          priority: { in: ["High", "Critical"] }
        }
      }),
      prisma.action.count({
        where: {
          companyId,
          status: { not: "Completed" },
          priority: "Critical"
        }
      }),
      prisma.risk.count({ where: { companyId, status: { in: ["Open", "Monitoring"] } } }),
      prisma.risk.count({ 
        where: { 
          companyId, 
          status: { in: ["Open", "Monitoring"] }, 
          riskLevel: "High" 
        } 
      }),
      prisma.risk.count({ 
        where: { 
          companyId, 
          status: { in: ["Open", "Monitoring"] }, 
          riskLevel: "Critical" 
        } 
      }),
      prisma.risk.count({
        where: {
          companyId,
          status: { in: ["Open", "Monitoring"] },
          reviewDate: { lt: new Date() }
        }
      }),
      prisma.medication.count({ where: { companyId, status: "Active" } }),
      prisma.medication.count({
        where: {
          companyId,
          isPRN: true,
          OR: [
            { prnGuidance: null },
            { prnGuidance: "" }
          ]
        }
      }),
      prisma.medication.count({
        where: {
          companyId,
          isTopical: true,
          OR: [
            { bodyMapNotes: null },
            { bodyMapNotes: "" }
          ]
        }
      }),
      prisma.medication.count({
        where: {
          companyId,
          status: "Active",
          reviewDate: { lt: new Date() }
        }
      }),
      prisma.medicationOrder.count({ where: { companyId, status: { in: ["Ready for Collection", "Ordered", "Requested"] } } }),
      prisma.medicationOrder.count({
        where: {
          companyId,
          status: { in: ["Requested", "Ordered", "Ready for Collection"] },
          expectedCollectionDate: { lt: new Date() }
        }
      }),
      prisma.medicationOrder.count({ where: { companyId, status: "Issue Reported" } }),
      prisma.medicationOrder.count({ where: { companyId, status: "Received" } }),
      prisma.carePlan.count({ where: { companyId, status: "Active" } }),
      prisma.carePlan.count({ where: { companyId, status: "Under Review" } }),
      prisma.carePlan.count({
        where: {
          companyId,
          status: { in: ["Active", "Under Review"] },
          reviewDate: { lt: new Date() }
        }
      }),
      prisma.client.count({
        where: {
          companyId,
          carePackageStatus: "ACTIVE",
          NOT: {
            carePlans: {
              some: { status: "Active" }
            }
          }
        }
      }),
      prisma.audit.count({ where: { companyId, status: { not: "Archived" } } }),
      prisma.audit.count({ where: { companyId, status: "Completed" } }),
      prisma.audit.count({ where: { companyId, result: "Non-Compliant", status: { not: "Archived" } } }),
      prisma.audit.count({ 
        where: { 
          companyId, 
          status: { not: "Archived" },
          checklistItems: {
            some: { requiresAction: true }
          }
        } 
      }),
      prisma.audit.count({
        where: {
          companyId,
          status: { in: ["Completed", "Reviewed"] },
          reviewDate: { lt: new Date() }
        }
      })
    ]);

    res.json({ 
      activeClients, 
      activeStaff, 
      totalVisitsToday, 
      unassignedVisits, 
      lateVisits,
      openActions,
      overdueActions,
      highPriorityActions,
      criticalActions,
      openRisks,
      highRisks,
      criticalRisks,
      overdueReviews,
      activeMedications,
      prnMissingGuidance,
      topicalMissingBodyMap,
      overdueMedReviews,
      pendingOrders,
      overdueOrders,
      orderIssues,
      awaitingCheck,
      activeCarePlans,
      carePlansUnderReview,
      overdueCarePlanReviews,
      clientsWithoutActivePlan,
      totalAudits,
      completedAudits,
      nonCompliantAudits,
      auditsWithOpenActions,
      overdueAudits
    });
  }));

  // Company
  app.get("/api/company", authenticate, requirePermission("company.view"), asyncHandler(async (req: Request, res: Response) => {
    const company = await prisma.company.findUnique({
      where: { id: (req as any).user.companyId }
    });
    res.json(company);
  }));

  app.put("/api/company", authenticate, requirePermission("company.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const body = req.body;
    
    const company = await prisma.company.update({
      where: { id: companyId },
      data: {
        name: body.name,
        tradingName: body.tradingName,
        phone: body.phone,
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        town: body.town,
        postcode: body.postcode,
        cqcProviderId: body.cqcProviderId,
      }
    });

    await logActivity((req as any).user.id, companyId, "UPDATE", "Company", companyId, `Updated company profile: ${company.name}`);
    res.json(company);
  }));

  // Clients
  app.get("/api/clients", authenticate, requirePermission("clients.view"), asyncHandler(async (req: Request, res: Response) => {
    const { archived, search } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };

    if (archived === "true") {
      where.archivedAt = { not: null };
    } else if (archived === "all") {
      // no archived filter
    } else {
      where.archivedAt = null;
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { postcode: { contains: q } },
        { email: { contains: q } }
      ];
    }

    const clients = await prisma.client.findMany({ 
      where,
      orderBy: { lastName: "asc" }
    });
    res.json(clients);
  }));

  app.get("/api/clients/:id", authenticate, requirePermission("clients.view"), asyncHandler(async (req: Request, res: Response) => {
    const client = await prisma.client.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId }
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json(client);
  }));

  app.post("/api/clients", authenticate, requirePermission("clients.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = ClientSchema.parse(req.body);
    
    const client = await prisma.client.create({
      data: { ...validatedData, companyId }
    });
    
    await logActivity((req as any).user.id, companyId, "CREATE", "Client", client.id, `Created new client: ${client.firstName} ${client.lastName}`);
    
    res.json(client);
  }));

  app.put("/api/clients/:id", authenticate, requirePermission("clients.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.client.findFirst({
      where: { id: req.params.id, companyId }
    });
    if (!target) return res.status(404).json({ error: "Client not found" });

    const validatedData = ClientSchema.partial().parse(req.body);

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: validatedData
    });

    await logActivity((req as any).user.id, companyId, "UPDATE", "Client", client.id, `Updated client details for ${client.firstName} ${client.lastName}`);

    res.json(client);
  }));

  app.patch("/api/clients/:id/archive", authenticate, requirePermission("clients.archive"), asyncHandler(async (req: Request, res: Response) => {
    const { archive } = req.body;
    const companyId = (req as any).user.companyId;
    
    const target = await prisma.client.findFirst({
      where: { id: req.params.id, companyId }
    });
    if (!target) return res.status(404).json({ error: "Client not found" });

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { 
        archivedAt: archive ? new Date() : null,
        carePackageStatus: archive ? "ARCHIVED" : "ACTIVE"
      }
    });

    await logActivity((req as any).user.id, companyId, archive ? "ARCHIVE" : "RESTORE", "Client", client.id, `${archive ? "Archived" : "Restored"} client: ${client.firstName} ${client.lastName}`);

    res.json(client);
  }));

  // Staff
  app.get("/api/staff", authenticate, requirePermission("staff.view"), asyncHandler(async (req: Request, res: Response) => {
    const { archived, search } = req.query;
    const companyId = (req as any).user.companyId;
    const where: any = { companyId };

    if (archived === "true") {
      where.archivedAt = { not: null };
    } else if (archived === "all") {
      // no archived filter
    } else {
      where.archivedAt = null;
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { jobTitle: { contains: q } },
        { postcode: { contains: q } }
      ];
    }

    const staff = await prisma.staff.findMany({ 
      where,
      orderBy: { lastName: "asc" }
    });
    res.json(staff);
  }));

  app.get("/api/staff/:id", authenticate, requirePermission("staff.view"), asyncHandler(async (req: Request, res: Response) => {
    const staffMember = await prisma.staff.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId }
    });
    if (!staffMember) return res.status(404).json({ error: "Staff member not found" });
    res.json(staffMember);
  }));

  app.post("/api/staff", authenticate, requirePermission("staff.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = StaffSchema.parse(req.body);
    
    const staffMember = await prisma.staff.create({
      data: { ...validatedData, companyId }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Staff", staffMember.id, `Created new staff member: ${staffMember.firstName} ${staffMember.lastName}`);

    res.json(staffMember);
  }));

  app.put("/api/staff/:id", authenticate, requirePermission("staff.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.staff.findFirst({
      where: { id: req.params.id, companyId }
    });
    if (!target) return res.status(404).json({ error: "Staff not found" });

    const validatedData = StaffSchema.partial().parse(req.body);

    const staffMember = await prisma.staff.update({
      where: { id: req.params.id },
      data: validatedData
    });

    await logActivity((req as any).user.id, companyId, "UPDATE", "Staff", staffMember.id, `Updated staff details for ${staffMember.firstName} ${staffMember.lastName}`);

    res.json(staffMember);
  }));

  app.patch("/api/staff/:id/archive", authenticate, requirePermission("staff.archive"), asyncHandler(async (req: Request, res: Response) => {
    const { archive } = req.body;
    const companyId = (req as any).user.companyId;

    const target = await prisma.staff.findFirst({
      where: { id: req.params.id, companyId }
    });
    if (!target) return res.status(404).json({ error: "Staff not found" });

    const staffMember = await prisma.staff.update({
      where: { id: req.params.id },
      data: { 
        archivedAt: archive ? new Date() : null,
        employmentStatus: archive ? "INACTIVE" : "ACTIVE"
      }
    });

    await logActivity((req as any).user.id, companyId, archive ? "ARCHIVE" : "RESTORE", "Staff", staffMember.id, `${archive ? "Archived" : "Restored"} staff member: ${staffMember.firstName} ${staffMember.lastName}`);

    res.json(staffMember);
  }));

  // Visits
  app.get("/api/visits", authenticate, requirePermission("visits.view"), asyncHandler(async (req: Request, res: Response) => {
    const { date, clientId, staffId, status } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };

    if (date) {
      const start = new Date(String(date));
      start.setHours(0, 0, 0, 0);
      const end = new Date(String(date));
      end.setHours(23, 59, 59, 999);
      where.scheduledStart = {
        gte: start,
        lte: end
      };
    }

    if (clientId) where.clientId = String(clientId);
    if (staffId) where.staffId = String(staffId);
    if (status) where.status = String(status);

    const visits = await prisma.visit.findMany({
      where,
      include: {
        client: true,
        staff: true
      },
      orderBy: { scheduledStart: "asc" }
    });
    res.json(visits);
  }));

  app.get("/api/visits/:id", authenticate, requirePermission("visits.view"), asyncHandler(async (req: Request, res: Response) => {
    const visit = await prisma.visit.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: { client: true, staff: true }
    });
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    res.json(visit);
  }));

  app.post("/api/visits", authenticate, requirePermission("visits.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = VisitSchema.parse(req.body);

    // Verify client belongs to company
    const client = await prisma.client.findFirst({
      where: { id: validatedData.clientId, companyId }
    });
    if (!client) return res.status(404).json({ error: "Client not found in your company" });

    // Verify staff belongs to company if provided
    if (validatedData.staffId) {
      const staff = await prisma.staff.findFirst({
        where: { id: validatedData.staffId, companyId }
      });
      if (!staff) return res.status(404).json({ error: "Staff member not found in your company" });
    }

    const visit = await prisma.visit.create({
      data: {
        ...validatedData,
        companyId,
        scheduledStart: new Date(validatedData.scheduledStart),
        scheduledEnd: new Date(validatedData.scheduledEnd),
        status: validatedData.staffId ? "ASSIGNED" : "SCHEDULED"
      }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Visit", visit.id, `Created new visit for client`);

    res.json(visit);
  }));

  app.put("/api/visits/:id", authenticate, requirePermission("visits.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.visit.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Visit not found" });

    const validatedData = VisitSchema.partial().parse(req.body);

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        scheduledStart: validatedData.scheduledStart ? new Date(validatedData.scheduledStart) : undefined,
        scheduledEnd: validatedData.scheduledEnd ? new Date(validatedData.scheduledEnd) : undefined,
      }
    });

    await logActivity((req as any).user.id, companyId, "UPDATE", "Visit", visit.id, `Updated visit details`);

    res.json(visit);
  }));

  app.patch("/api/visits/:id/assign", authenticate, requirePermission("visits.assign"), asyncHandler(async (req: Request, res: Response) => {
    const { staffId } = req.body;
    const companyId = (req as any).user.companyId;

    const target = await prisma.visit.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Visit not found" });

    if (staffId) {
      const staff = await prisma.staff.findFirst({ where: { id: staffId, companyId } });
      if (!staff) return res.status(400).json({ error: "Invalid staff" });
    }

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: { 
        staffId: staffId || null,
        status: staffId ? "ASSIGNED" : "SCHEDULED"
      }
    });
    res.json(visit);
  }));

  app.patch("/api/visits/:id/status", authenticate, requirePermission("visits.status"), asyncHandler(async (req: Request, res: Response) => {
    const { status, actualStart, actualEnd, cancellationReason, noAccessReason } = req.body;
    const companyId = (req as any).user.companyId;

    const target = await prisma.visit.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Visit not found" });

    const visit = await prisma.visit.update({
      where: { id: req.params.id },
      data: { 
        status,
        actualStart: actualStart ? new Date(actualStart) : target.actualStart,
        actualEnd: actualEnd ? new Date(actualEnd) : target.actualEnd,
        cancellationReason,
        noAccessReason
      }
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "Visit", visit.id, `Changed visit status to ${status}`);

    if (status === "MISSED") {
      await notifyAdmins(companyId, "Missed Visit Alert", `A visit for client has been marked as MISSED.`, "ALERT");
    }

    res.json(visit);
  }));

  // Actions
  app.get("/api/actions", authenticate, requirePermission("actions.view"), asyncHandler(async (req: Request, res: Response) => {
    const { status, priority, assignedTo, overdue } = req.query;
    const companyId = (req as any).user.companyId;
    const now = new Date();

    const where: any = { companyId };

    if (status) where.status = String(status);
    if (priority) where.priority = String(priority);
    if (assignedTo) {
      where.OR = [
        { assignedToUserId: String(assignedTo) },
        { assignedToStaffId: String(assignedTo) }
      ];
    }
    
    if (overdue === "true") {
      where.dueDate = { lt: now };
      where.status = { not: "Completed" };
    }

    const actions = await prisma.action.findMany({
      where,
      include: {
        assignedToUser: { select: { name: true, email: true } },
        assignedToStaff: { select: { firstName: true, lastName: true } }
      },
      orderBy: [
        { priority: "desc" },
        { dueDate: "asc" }
      ]
    });
    res.json(actions);
  }));

  app.get("/api/actions/:id", authenticate, requirePermission("actions.view"), asyncHandler(async (req: Request, res: Response) => {
    const action = await prisma.action.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: {
        assignedToUser: { select: { name: true, email: true } },
        assignedToStaff: { select: { firstName: true, lastName: true } }
      }
    });
    if (!action) return res.status(404).json({ error: "Action not found" });
    res.json(action);
  }));

  app.post("/api/actions", authenticate, requirePermission("actions.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = ActionSchema.parse(req.body);
    
    const action = await prisma.action.create({
      data: {
        ...validatedData,
        companyId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Action", action.id, `Created new action: ${action.title}`);

    res.json(action);
  }));

  app.put("/api/actions/:id", authenticate, requirePermission("actions.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.action.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Action not found" });

    const validatedData = ActionSchema.partial().parse(req.body);

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined
      }
    });
    res.json(action);
  }));

  app.patch("/api/actions/:id/assign", authenticate, requirePermission("actions.assign"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { assignedToUserId, assignedToStaffId } = req.body;
    
    const target = await prisma.action.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Action not found" });

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        assignedToUserId: assignedToUserId || null,
        assignedToStaffId: assignedToStaffId || null,
        status: (assignedToUserId || assignedToStaffId) ? (target.status === "Open" ? "In Progress" : target.status) : target.status
      }
    });

    await logActivity((req as any).user.id, companyId, "UPDATE", "Action", action.id, `Reassigned action: ${action.title}`);

    res.json(action);
  }));

  app.patch("/api/actions/:id/status", authenticate, requirePermission("actions.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { status } = req.body;
    
    const target = await prisma.action.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Action not found" });

    const updateData: any = { status };
    if (status === "Completed") {
      updateData.completedAt = new Date();
    }

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: updateData
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "Action", action.id, `Changed action status to ${status}`);

    res.json(action);
  }));

  app.patch("/api/actions/:id/complete", authenticate, requirePermission("actions.close"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { completionNotes } = req.body;
    
    const target = await prisma.action.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Action not found" });

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        status: "Completed",
        completedAt: new Date(),
        completionNotes
      }
    });

    await logActivity((req as any).user.id, companyId, "COMPLETE", "Action", action.id, `Completed action: ${action.title}`);

    res.json(action);
  }));

  app.patch("/api/actions/:id/reopen", authenticate, requirePermission("actions.close"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    
    const target = await prisma.action.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Action not found" });

    const action = await prisma.action.update({
      where: { id: req.params.id },
      data: {
        status: "Open",
        completedAt: null,
        completionNotes: null
      }
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "Action", action.id, `Reopened action: ${action.title}`);

    res.json(action);
  }));

  // Risks
  app.get("/api/risks", authenticate, requirePermission("risks.view"), asyncHandler(async (req: Request, res: Response) => {
    const { status, riskLevel, category, ownerId, overdue, search } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };
    if (status) where.status = String(status);
    if (riskLevel) where.riskLevel = String(riskLevel);
    if (category) where.category = String(category);
    if (ownerId) where.ownerUserId = String(ownerId);
    
    if (overdue === "true") {
      where.reviewDate = { lt: new Date() };
      where.status = { in: ["Open", "Monitoring"] };
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } }
      ];
    }

    const risks = await prisma.risk.findMany({
      where,
      include: {
        ownerUser: { select: { id: true, name: true } },
        linkedClient: { select: { id: true, firstName: true, lastName: true } },
        linkedStaff: { select: { id: true, firstName: true, lastName: true } }
      },
      orderBy: [
        { riskLevel: "desc" },
        { updatedAt: "desc" }
      ]
    });
    res.json(risks);
  }));

  app.get("/api/risks/:id", authenticate, requirePermission("risks.view"), asyncHandler(async (req: Request, res: Response) => {
    const risk = await prisma.risk.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: {
        ownerUser: { select: { id: true, name: true } },
        linkedClient: { select: { id: true, firstName: true, lastName: true } },
        linkedStaff: { select: { id: true, firstName: true, lastName: true } }
      }
    });
    if (!risk) return res.status(404).json({ error: "Risk not found" });
    res.json(risk);
  }));

  app.post("/api/risks", authenticate, requirePermission("risks.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = RiskSchema.parse(req.body);

    // Verify linked client exists
    if (validatedData.linkedClientId) {
      const client = await prisma.client.findFirst({ where: { id: validatedData.linkedClientId, companyId } });
      if (!client) return res.status(404).json({ error: "Linked client not found in your company" });
    }

    const risk = await prisma.risk.create({
      data: {
        ...validatedData,
        companyId,
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : null,
      }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Risk", risk.id, `Identified new risk: ${risk.title}`);

    if (validatedData.riskLevel === "Critical" || validatedData.riskLevel === "High") {
      await notifyAdmins(companyId, `${validatedData.riskLevel} Risk Alert: ${risk.title}`, `A new ${validatedData.riskLevel} risk has been identified: ${risk.description}`, "ALERT");
    }

    res.json(risk);
  }));

  app.put("/api/risks/:id", authenticate, requirePermission("risks.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.risk.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Risk not found" });

    const validatedData = RiskSchema.partial().parse(req.body);

    const risk = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : undefined
      }
    });
    res.json(risk);
  }));

  app.patch("/api/risks/:id/status", authenticate, requirePermission("risks.review"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { status, notes, reviewDate } = req.body;
    
    const target = await prisma.risk.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Risk not found" });

    const risk = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        status,
        notes: notes ? (target.notes ? `${target.notes}\n\nReview Note: ${notes}` : notes) : target.notes,
        reviewDate: reviewDate ? new Date(reviewDate) : target.reviewDate
      }
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "Risk", risk.id, `Updated risk status to ${status}`);

    res.json(risk);
  }));

  app.patch("/api/risks/:id/archive", authenticate, requirePermission("risks.archive"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.risk.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Risk not found" });

    const risk = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        status: "Archived"
      }
    });
    res.json(risk);
  }));

  // Audits
  app.get("/api/audits", authenticate, requirePermission("audits.view"), asyncHandler(async (req: Request, res: Response) => {
    const { auditType, status, result, auditorId, search, overdue } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };
    if (auditType) where.auditType = String(auditType);
    if (status) where.status = String(status);
    if (result) where.result = String(result);
    if (auditorId) where.auditorId = String(auditorId);
    
    if (overdue === "true") {
      where.reviewDate = { lt: new Date() };
      where.status = { in: ["Completed", "Reviewed"] };
    }

    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { findings: { contains: q } },
        { recommendations: { contains: q } }
      ];
    }

    const audits = await prisma.audit.findMany({
      where,
      include: {
        auditor: { select: { id: true, name: true } },
        linkedClient: { select: { id: true, firstName: true, lastName: true } },
        linkedStaff: { select: { id: true, firstName: true, lastName: true } },
        _count: { select: { checklistItems: true } }
      },
      orderBy: { auditDate: "desc" }
    });
    res.json(audits);
  }));

  app.get("/api/audits/:id", authenticate, requirePermission("audits.view"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const audit = await prisma.audit.findFirst({
      where: { id: req.params.id, companyId },
      include: {
        auditor: { select: { id: true, name: true } },
        linkedClient: { select: { id: true, firstName: true, lastName: true } },
        linkedStaff: { select: { id: true, firstName: true, lastName: true } },
        checklistItems: { orderBy: { createdAt: "asc" } }
      }
    });
    if (!audit) return res.status(404).json({ error: "Audit not found" });
    res.json(audit);
  }));

  app.post("/api/audits", authenticate, requirePermission("audits.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = AuditSchema.parse(req.body);
    const { checklistTemplate } = req.body;

    // Verify auditor exists
    const auditor = await prisma.staff.findFirst({ where: { id: validatedData.auditorId, companyId } });
    if (!auditor) return res.status(404).json({ error: "Auditor not found in your company" });

    // Verify linked client exists if provided
    if (validatedData.linkedClientId) {
      const client = await prisma.client.findFirst({ where: { id: validatedData.linkedClientId, companyId } });
      if (!client) return res.status(404).json({ error: "Linked client not found in your company" });
    }

    // Verify linked staff exists if provided
    if (validatedData.linkedStaffId) {
      const staff = await prisma.staff.findFirst({ where: { id: validatedData.linkedStaffId, companyId } });
      if (!staff) return res.status(404).json({ error: "Linked staff member not found in your company" });
    }

    const audit = await prisma.audit.create({
      data: {
        ...validatedData,
        companyId,
        auditDate: validatedData.auditDate ? new Date(validatedData.auditDate) : new Date(),
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : null,
        status: "Draft",
        checklistItems: {
          create: (checklistTemplate || []).map((q: string) => ({
            question: q,
            answer: "N/A"
          }))
        }
      }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Audit", audit.id, `Started new audit: ${audit.title}`);

    res.json(audit);
  }));

  app.put("/api/audits/:id", authenticate, requirePermission("audits.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.audit.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Audit not found" });

    const validatedData = AuditSchema.partial().parse(req.body);
    const { findings, recommendations, score, result, status } = req.body;

    const audit = await prisma.audit.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        auditDate: validatedData.auditDate ? new Date(validatedData.auditDate) : undefined,
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : undefined,
        findings, recommendations, score, result, status
      }
    });
    res.json(audit);
  }));

  app.patch("/api/audits/:id/status", authenticate, requirePermission("audits.review"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { status, result, score, notes } = req.body;
    const audit = await prisma.audit.update({
      where: { id: req.params.id, companyId },
      data: { 
        status, 
        result, 
        score,
        notes: notes || undefined 
      }
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "Audit", audit.id, `Completed audit review: ${audit.title} - Result: ${result}`);

    if (result === "Non-Compliant" || result === "Critical Fail") {
      await notifyAdmins(companyId, "Audit Failure Alert", `Audit "${audit.title}" resulted in ${result}.`, "ALERT");
    }

    res.json(audit);
  }));

  app.patch("/api/audits/:id/archive", authenticate, requirePermission("audits.archive"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const audit = await prisma.audit.update({
      where: { id: req.params.id, companyId },
      data: { status: "Archived" }
    });
    res.json(audit);
  }));

  app.post("/api/audits/:id/checklist-items", authenticate, requirePermission("audits.edit"), asyncHandler(async (req: Request, res: Response) => {
    const { question } = req.body;
    const item = await prisma.auditChecklistItem.create({
      data: {
        auditId: req.params.id,
        question,
        answer: "N/A"
      }
    });
    res.json(item);
  }));

  app.put("/api/audits/:auditId/checklist-items/:itemId", authenticate, requirePermission("audits.edit"), asyncHandler(async (req: Request, res: Response) => {
    const { answer, notes, evidence, requiresAction } = req.body;
    const item = await prisma.auditChecklistItem.update({
      where: { id: req.params.itemId, auditId: req.params.auditId },
      data: { answer, notes, evidence, requiresAction }
    });
    res.json(item);
  }));

  app.post("/api/audits/:id/actions", authenticate, requirePermission("audits.create_action"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { title, description, priority, dueDate, assignedToUserId } = req.body;
    const action = await prisma.action.create({
      data: {
        companyId,
        title,
        description,
        sourceType: "Audit",
        sourceId: req.params.id,
        priority: priority || "Medium",
        status: "Open",
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedToUserId: assignedToUserId || null
      }
    });
    res.json(action);
  }));

  app.post("/api/risks/:id/actions", authenticate, requirePermission("risks.create_action"), async (req, res) => {
    // ... (existing implementation)
  });

  // Compliance Dashboard
  app.get("/api/compliance/summary", authenticate, requirePermission("compliance.view"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const today = new Date();

    const [
      openActions,
      overdueActions,
      highPriorityActions,
      criticalActions,
      openRisks,
      highRisks,
      criticalRisks,
      overdueRiskReviews,
      totalAudits,
      nonCompliantAudits,
      auditsWithOpenActions,
      overdueAudits,
      topCriticalRisks,
      topOverdueActions,
      topNonCompliantAudits,
      upcomingAuditReviews
    ] = await Promise.all([
      prisma.action.count({ where: { companyId, status: { not: "Completed" } } }),
      prisma.action.count({ where: { companyId, status: { not: "Completed" }, dueDate: { lt: today } } }),
      prisma.action.count({ where: { companyId, status: { not: "Completed" }, priority: "High" } }),
      prisma.action.count({ where: { companyId, status: { not: "Completed" }, priority: "Critical" } }),
      prisma.risk.count({ where: { companyId, status: { notIn: ["Resolved", "Archived"] } } }),
      prisma.risk.count({ where: { companyId, status: { notIn: ["Resolved", "Archived"] }, riskLevel: "High" } }),
      prisma.risk.count({ where: { companyId, status: { notIn: ["Resolved", "Archived"] }, riskLevel: "Critical" } }),
      prisma.risk.count({ where: { companyId, status: { notIn: ["Resolved", "Archived"] }, reviewDate: { lt: today } } }),
      prisma.audit.count({ where: { companyId, status: { not: "Archived" } } }),
      prisma.audit.count({ where: { companyId, result: "Non-Compliant", status: { not: "Archived" } } }),
      prisma.audit.count({ 
        where: { 
          companyId, 
          status: { not: "Archived" },
          checklistItems: { some: { requiresAction: true } }
        } 
      }),
      prisma.audit.count({
        where: { companyId, status: { in: ["Completed", "Reviewed"] }, reviewDate: { lt: today } }
      }),
      // Detail fetch
      prisma.risk.findMany({
        where: { companyId, status: { notIn: ["Resolved", "Archived"] }, riskLevel: "Critical" },
        take: 5,
        orderBy: { createdAt: "desc" }
      }),
      prisma.action.findMany({
        where: { companyId, status: { not: "Completed" }, dueDate: { lt: today } },
        take: 5,
        orderBy: { dueDate: "asc" }
      }),
      prisma.audit.findMany({
        where: { companyId, result: "Non-Compliant", status: { not: "Archived" } },
        take: 5,
        orderBy: { auditDate: "desc" }
      }),
      prisma.audit.findMany({
        where: { companyId, status: { in: ["Completed", "Reviewed"] }, reviewDate: { gt: today } },
        take: 5,
        orderBy: { reviewDate: "asc" }
      })
    ]);

    res.json({
      stats: {
        openActions, overdueActions, highPriorityActions, criticalActions,
        openRisks, highRisks, criticalRisks, overdueRiskReviews,
        totalAudits, nonCompliantAudits, auditsWithOpenActions, overdueAudits
      },
      criticalRisks: topCriticalRisks,
      overdueActions: topOverdueActions,
      nonCompliantAudits: topNonCompliantAudits,
      upcomingAuditReviews
    });
  }));

  app.post("/api/risks/:id/actions", authenticate, requirePermission("risks.create_action"), async (req, res) => {
    const companyId = (req as any).user.companyId;
    const { title, description, priority, dueDate, assignedToUserId } = req.body;
    try {
      const target = await prisma.risk.findFirst({ where: { id: req.params.id, companyId } });
      if (!target) return res.status(404).json({ error: "Risk not found" });

      const action = await prisma.action.create({
        data: {
          companyId,
          title,
          description,
          sourceType: "Risk",
          sourceId: target.id,
          priority: priority || "Medium",
          status: "Open",
          dueDate: dueDate ? new Date(dueDate) : null,
          assignedToUserId: assignedToUserId || null
        }
      });
      res.json(action);
    } catch (err) {
      res.status(500).json({ error: "Failed to create linked action" });
    }
  });

  // Medications
  app.get("/api/medication", authenticate, requirePermission("medication.view"), asyncHandler(async (req: Request, res: Response) => {
    const { status, medicationType, clientId } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };
    if (status) where.status = String(status);
    if (medicationType) where.medicationType = String(medicationType);
    if (clientId) where.clientId = String(clientId);

    const medications = await prisma.medication.findMany({
      where,
      include: {
        client: { select: { firstName: true, lastName: true } }
      },
      orderBy: { medicationName: "asc" }
    });
    res.json(medications);
  }));

  app.get("/api/medication/:id", authenticate, requirePermission("medication.view"), asyncHandler(async (req: Request, res: Response) => {
    const medication = await prisma.medication.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: {
        client: { select: { firstName: true, lastName: true } }
      }
    });
    if (!medication) return res.status(404).json({ error: "Medication not found" });
    res.json(medication);
  }));

  app.post("/api/medication", authenticate, requirePermission("medication.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const validatedData = MedicationSchema.parse(req.body);

    // Verify client belongs to company
    const client = await prisma.client.findFirst({
      where: { id: validatedData.clientId, companyId }
    });
    if (!client) return res.status(404).json({ error: "Client not found in your company" });

    const medication = await prisma.medication.create({
      data: {
        ...validatedData,
        companyId,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : null
      }
    });

    await logActivity((req as any).user.id, companyId, "CREATE", "Medication", medication.id, `Added new medication: ${medication.medicationName}`);

    res.json(medication);
  }));

  app.put("/api/medication/:id", authenticate, requirePermission("medication.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.medication.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Medication not found" });

    const validatedData = MedicationSchema.partial().parse(req.body);

    const medication = await prisma.medication.update({
      where: { id: req.params.id },
      data: {
        ...validatedData,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
        reviewDate: validatedData.reviewDate ? new Date(validatedData.reviewDate) : undefined
      }
    });
    res.json(medication);
  }));

  app.patch("/api/medication/:id/archive", authenticate, requirePermission("medication.archive"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const target = await prisma.medication.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Medication not found" });

    const medication = await prisma.medication.update({
      where: { id: req.params.id },
      data: {
        status: "Discontinued",
        endDate: new Date()
      }
    });

    await logActivity((req as any).user.id, companyId, "ARCHIVE", "Medication", medication.id, `Discontinued medication: ${medication.medicationName}`);

    res.json(medication);
  }));

  // Medication Administration (MAR)
  app.get("/api/mar/client/:clientId", authenticate, requirePermission("medication.view"), asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const companyId = (req as any).user.companyId;
    const { clientId } = req.params;

    const where: any = { companyId, clientId };
    if (startDate && endDate) {
      where.scheduledTime = {
        gte: new Date(String(startDate)),
        lte: new Date(String(endDate))
      };
    }

    const administrations = await prisma.medicationAdministration.findMany({
      where,
      include: {
        medication: true
      },
      orderBy: { scheduledTime: "asc" }
    });
    res.json(administrations);
  }));

  app.post("/api/mar", authenticate, requirePermission("medication.record"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const staffId = (req as any).user.id; 
    
    const { medicationId, clientId, scheduledTime, administeredTime, status, doseGiven, notes, refusalReason, notGivenReason } = req.body;
    
    const admin = await prisma.medicationAdministration.create({
      data: {
        companyId,
        medicationId,
        clientId,
        staffId, 
        scheduledTime: new Date(scheduledTime),
        administeredTime: administeredTime ? new Date(administeredTime) : null,
        status: status || "Scheduled",
        doseGiven,
        notes,
        refusalReason,
        notGivenReason
      }
    });

    await logActivity((req as any).user.id, companyId, "REGISTER", "MAR", admin.id, `Recorded medication administration entry: ${status}`);

    if (status === "Missed" || status === "Refused") {
      await notifyAdmins(companyId, "Medication Issue", `Medication administration was ${status.toUpperCase()} for a client at ${new Date(scheduledTime).toLocaleTimeString()}.`, "WARNING");
    }

    res.json(admin);
  }));

  app.patch("/api/mar/:id/status", authenticate, requirePermission("medication.record"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { status, administeredTime, doseGiven, notes, refusalReason, notGivenReason } = req.body;
    
    const admin = await prisma.medicationAdministration.update({
      where: { id: req.params.id, companyId },
      data: {
        status,
        administeredTime: administeredTime ? new Date(administeredTime) : new Date(),
        doseGiven,
        notes,
        refusalReason,
        notGivenReason
      }
    });

    await logActivity((req as any).user.id, companyId, "STATUS_CHANGE", "MAR", admin.id, `Updated medication administration status to ${status}`);

    if (status === "Missed" || status === "Refused") {
      await notifyAdmins(companyId, "Medication Issue Updated", `Medication administration status updated to ${status.toUpperCase().toUpperCase()}.`, "WARNING");
    }

    res.json(admin);
  }));

  // Stock Checks
  app.post("/api/medication/:id/stock-check", authenticate, requirePermission("medication.stock_check"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const staffId = (req as any).user.id;
    const { quantity, notes, type } = req.body;
    
    const record = await prisma.medicationStockRecord.create({
      data: {
        companyId,
        medicationId: req.params.id,
        staffId,
        quantity: parseFloat(quantity),
        notes,
        type: type || "Manual Check"
      }
    });
    res.json(record);
  }));

  // Medication Orders
  app.get("/api/medication-orders", authenticate, requirePermission("medication.orders.view"), asyncHandler(async (req: Request, res: Response) => {
    const { status, clientId } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };
    if (status) where.status = String(status);
    if (clientId) where.clientId = String(clientId);

    const orders = await prisma.medicationOrder.findMany({
      where,
      include: {
        client: { select: { firstName: true, lastName: true } },
        items: true,
        company: { select: { name: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(orders);
  }));

  app.get("/api/medication-orders/:id", authenticate, requirePermission("medication.orders.view"), asyncHandler(async (req: Request, res: Response) => {
    const order = await prisma.medicationOrder.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: {
        client: true,
        items: {
          include: { medication: true }
        }
      }
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  }));

  app.post("/api/medication-orders", authenticate, requirePermission("medication.orders.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const userId = (req as any).user.id;
    const { items, ...orderData } = req.body;

    const order = await prisma.medicationOrder.create({
      data: {
        ...orderData,
        companyId,
        requestedByUserId: userId,
        prescriptionRequestDate: orderData.prescriptionRequestDate ? new Date(orderData.prescriptionRequestDate) : null,
        orderDate: orderData.orderDate ? new Date(orderData.orderDate) : null,
        expectedCollectionDate: orderData.expectedCollectionDate ? new Date(orderData.expectedCollectionDate) : null,
        items: {
          create: (items || []).map((item: any) => ({
            ...item,
            companyId
          }))
        }
      }
    });
    res.json(order);
  }));

  app.put("/api/medication-orders/:id", authenticate, requirePermission("medication.orders.edit"), async (req, res) => {
    const companyId = (req as any).user.companyId;
    const { items, ...orderData } = req.body;

    try {
      const target = await prisma.medicationOrder.findFirst({ where: { id: req.params.id, companyId } });
      if (!target) return res.status(404).json({ error: "Order not found" });

      const order = await prisma.medicationOrder.update({
        where: { id: req.params.id },
        data: {
          ...orderData,
          prescriptionRequestDate: orderData.prescriptionRequestDate ? new Date(orderData.prescriptionRequestDate) : target.prescriptionRequestDate,
          orderDate: orderData.orderDate ? new Date(orderData.orderDate) : target.orderDate,
          expectedCollectionDate: orderData.expectedCollectionDate ? new Date(orderData.expectedCollectionDate) : target.expectedCollectionDate,
          collectionDate: orderData.collectionDate ? new Date(orderData.collectionDate) : target.collectionDate,
          receivedDate: orderData.receivedDate ? new Date(orderData.receivedDate) : target.receivedDate,
          checkedDate: orderData.checkedDate ? new Date(orderData.checkedDate) : target.checkedDate
        }
      });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.patch("/api/medication-orders/:id/status", authenticate, requirePermission("medication.orders.status"), async (req, res) => {
    const companyId = (req as any).user.companyId;
    const userId = (req as any).user.id;
    const { status, dateField, dateValue } = req.body;

    try {
      const data: any = { status };
      
      if (status === "Ordered") {
        data.orderedByUserId = userId;
        data.orderDate = new Date();
      } else if (status === "Collected") {
        data.collectedByUserId = userId;
        data.collectionDate = new Date();
      } else if (status === "Received") {
        data.receivedByUserId = userId;
        data.receivedDate = new Date();
      } else if (status === "Checked") {
        data.checkedByUserId = userId;
        data.checkedDate = new Date();
      }

      if (dateField && dateValue) {
        data[dateField] = new Date(dateValue);
      }

      const order = await prisma.medicationOrder.update({
        where: { id: req.params.id, companyId },
        data
      });
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Status update failed" });
    }
  });

  app.post("/api/medication-orders/:id/items", authenticate, requirePermission("medication.orders.edit"), async (req, res) => {
    const companyId = (req as any).user.companyId;
    try {
      const order = await prisma.medicationOrder.findFirst({ where: { id: req.params.id, companyId } });
      if (!order) return res.status(404).json({ error: "Order not found" });

      const item = await prisma.medicationOrderItem.create({
        data: {
          ...req.body,
          medicationOrderId: req.params.id,
          companyId
        }
      });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Item creation failed" });
    }
  });

  app.put("/api/medication-orders/:id/items/:itemId", authenticate, requirePermission("medication.orders.collect"), async (req, res) => {
    const companyId = (req as any).user.companyId;
    try {
      const item = await prisma.medicationOrderItem.update({
        where: { id: req.params.itemId, companyId, medicationOrderId: req.params.id },
        data: {
          ...req.body
        }
      });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: "Item update failed" });
    }
  });

  app.patch("/api/medication-orders/:id/items/:itemId/cancel", authenticate, requirePermission("medication.orders.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    
    // Verify item belongs to an order in the company
    const item = await prisma.medicationOrderItem.findFirst({
      where: { 
        id: req.params.itemId,
        medicationOrderId: req.params.id,
        companyId
      }
    });
    
    if (!item) return res.status(404).json({ error: "Medication order item not found" });

    const updated = await prisma.medicationOrderItem.update({
      where: { id: req.params.itemId },
      data: { itemStatus: "Cancelled" }
    });
    res.json(updated);
  }));

  // Care Plans
  app.get("/api/care-plans", authenticate, requirePermission("carePlans.view"), asyncHandler(async (req: Request, res: Response) => {
    const { clientId, status } = req.query;
    const companyId = (req as any).user.companyId;

    const where: any = { companyId };
    if (clientId) where.clientId = String(clientId);
    if (status) where.status = String(status);

    const plans = await prisma.carePlan.findMany({
      where,
      include: {
        client: { select: { firstName: true, lastName: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(plans);
  }));

  app.get("/api/care-plans/:id", authenticate, requirePermission("carePlans.view"), asyncHandler(async (req: Request, res: Response) => {
    const plan = await prisma.carePlan.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: { client: true }
    });
    if (!plan) return res.status(404).json({ error: "Care Plan not found" });
    res.json(plan);
  }));

  app.post("/api/care-plans", authenticate, requirePermission("carePlans.create"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { clientId, status, ...planData } = req.body;

    const result = await prisma.$transaction(async (tx) => {
      if (status === "Active") {
        await tx.carePlan.updateMany({
          where: { clientId, companyId, status: "Active" },
          data: { status: "Superseded" }
        });
      }

      const latestPlan = await tx.carePlan.findFirst({
        where: { clientId, companyId },
        orderBy: { version: "desc" }
      });
      const version = latestPlan ? latestPlan.version + 1 : 1;

      return await tx.carePlan.create({
        data: {
          ...planData,
          clientId,
          companyId,
          status: status || "Draft",
          version,
          reviewDate: planData.reviewDate ? new Date(planData.reviewDate) : null
        }
      });
    });
    res.json(result);
  }));

  app.put("/api/care-plans/:id", authenticate, requirePermission("carePlans.edit"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { status, ...planData } = req.body;

    const target = await prisma.carePlan.findFirst({ where: { id: req.params.id, companyId } });
    if (!target) return res.status(404).json({ error: "Care Plan not found" });

    const result = await prisma.$transaction(async (tx) => {
      if (status === "Active" && target.status !== "Active") {
        await tx.carePlan.updateMany({
          where: { clientId: target.clientId, companyId, status: "Active" },
          data: { status: "Superseded" }
        });
      }

      return await tx.carePlan.update({
        where: { id: req.params.id },
        data: {
          ...planData,
          status,
          reviewDate: planData.reviewDate ? new Date(planData.reviewDate) : target.reviewDate,
          reviewedAt: planData.reviewedAt ? new Date(planData.reviewedAt) : target.reviewedAt,
          archivedAt: planData.archivedAt ? new Date(planData.archivedAt) : target.archivedAt
        }
      });
    });
    res.json(result);
  }));

  app.patch("/api/care-plans/:id/review", authenticate, requirePermission("carePlans.review"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { nextReviewDate } = req.body;

    const plan = await prisma.carePlan.update({
      where: { id: req.params.id, companyId },
      data: {
        status: "Active",
        reviewedAt: new Date(),
        reviewDate: nextReviewDate ? new Date(nextReviewDate) : null
      }
    });
    res.json(plan);
  }));

  app.patch("/api/care-plans/:id/archive", authenticate, requirePermission("carePlans.archive"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const plan = await prisma.carePlan.update({
      where: { id: req.params.id, companyId },
      data: {
        status: "Archived",
        archivedAt: new Date()
      }
    });
    res.json(plan);
  }));

  // Activity Logs
  app.get("/api/activity-logs", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const { limit = "50", offset = "0", entityType, entityId } = req.query;

    const logs = await prisma.activityLog.findMany({
      where: {
        companyId,
        ...(entityType ? { entityType: String(entityType) } : {}),
        ...(entityId ? { entityId: String(entityId) } : {}),
      },
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(String(limit)),
      skip: parseInt(String(offset)),
    });

    res.json(logs);
  }));

  // Attachments
  app.post("/api/attachments/upload", authenticate, requirePermission("attachments.upload"), upload.single("attachment"), asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { entityType, entityId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const attachment = await prisma.attachment.create({
      data: {
        companyId: user.companyId,
        uploadedByUserId: user.id,
        entityType,
        entityId,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileUrl: file.filename,
        fileSize: file.size,
      }
    });

    await logActivity(user.id, user.companyId, "UPLOAD", entityType, entityId, `Uploaded file: ${file.originalname}`);

    res.json(attachment);
  }));

  app.get("/api/attachments/:entityType/:entityId", authenticate, requirePermission("attachments.view"), asyncHandler(async (req: Request, res: Response) => {
    const { entityType, entityId } = req.params;
    const companyId = (req as any).user.companyId;

    const attachments = await prisma.attachment.findMany({
      where: {
        companyId,
        entityType,
        entityId
      },
      include: {
        uploadedByUser: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.json(attachments);
  }));

  app.get("/api/attachments/download/:id", authenticate, requirePermission("attachments.view"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const attachment = await prisma.attachment.findFirst({
      where: { id: req.params.id, companyId }
    });

    if (!attachment) return res.status(404).json({ error: "File not found" });

    const filePath = path.join(UPLOADS_DIR, attachment.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Physical file missing" });

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    res.setHeader('Content-Type', attachment.fileType);
    fs.createReadStream(filePath).pipe(res);
  }));

  app.delete("/api/attachments/:id", authenticate, requirePermission("attachments.delete"), asyncHandler(async (req: Request, res: Response) => {
    const companyId = (req as any).user.companyId;
    const attachment = await prisma.attachment.findFirst({
      where: { id: req.params.id, companyId }
    });

    if (!attachment) return res.status(404).json({ error: "File not found" });

    // Delete record
    await prisma.attachment.delete({ where: { id: req.params.id } });

    // Optionally delete physical file
    const filePath = path.join(UPLOADS_DIR, attachment.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await logActivity((req as any).user.id, companyId, "DELETE", attachment.entityType, attachment.entityId, `Deleted file: ${attachment.fileName}`);

    res.json({ success: true });
  }));

  // Exports & Reporting
  app.get("/api/reports/export/:entity", authenticate, requirePermission("reports.export"), asyncHandler(async (req: Request, res: Response) => {
    const { entity } = req.params;
    const { startDate, endDate, status, priority } = req.query;
    const companyId = (req as any).user.companyId;

    let data: any[] = [];
    let fields: string[] = [];
    let fileName = `export_${entity}_${Date.now()}.csv`;

    const commonWhere: any = { companyId };
    if (startDate && endDate) {
      commonWhere.createdAt = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    switch (entity) {
      case 'clients':
        data = await prisma.client.findMany({ where: commonWhere });
        fields = ['firstName', 'lastName', 'dob', 'address', 'carePackageStatus', 'fundingSource'];
        break;
      case 'staff':
        data = await prisma.user.findMany({ 
          where: { ...commonWhere, role: { name: { notIn: ['Owner', 'Admin'] } } },
          include: { role: true }
        });
        data = data.map(u => ({ ...u, roleName: u.role?.name }));
        fields = ['name', 'email', 'roleName', 'status', 'joinedAt'];
        break;
      case 'visits':
        data = await prisma.visit.findMany({ 
          where: { 
            ...commonWhere,
            ...(status ? { status: status as string } : {})
          },
          include: { client: true, staff: true }
        });
        data = data.map(v => ({ 
          ...v, 
          clientName: `${v.client?.firstName} ${v.client?.lastName}`,
          staffName: v.staff?.name
        }));
        fields = ['scheduledStartTime', 'scheduledEndTime', 'status', 'clientName', 'staffName'];
        break;
      case 'actions':
        data = await prisma.action.findMany({ 
          where: { 
            ...commonWhere,
            ...(status ? { status: status as string } : {}),
            ...(priority ? { priority: priority as string } : {})
          }
        });
        fields = ['title', 'status', 'priority', 'dueDate', 'category'];
        break;
      case 'risks':
        data = await prisma.risk.findMany({ 
          where: { 
            ...commonWhere,
            ...(status ? { status: status as string } : {}),
            ...(priority ? { riskLevel: priority as string } : {})
          }
        });
        fields = ['title', 'riskLevel', 'status', 'category', 'reviewDate'];
        break;
      case 'audits':
        data = await prisma.audit.findMany({ 
          where: { 
            ...commonWhere,
            ...(status ? { status: status as string } : {})
          }
        });
        fields = ['title', 'auditType', 'status', 'result', 'auditDate'];
        break;
      default:
        return res.status(400).json({ error: "Invalid entity" });
    }

    if (data.length === 0) return res.status(404).json({ error: "No data found for the selected filters" });

    // Manual CSV generation
    const csvContent = [
      fields.join(','),
      ...data.map(row => fields.map(f => {
        let val = row[f];
        if (val instanceof Date) val = val.toISOString();
        if (val === null || val === undefined) return '""';
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.status(200).send(csvContent);
  }));

  // Notifications
  app.get("/api/notifications", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const { unreadOnly = "false" } = req.query;

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly === "true" ? { read: false } : {})
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(notifications);
  }));

  app.patch("/api/notifications/:id/read", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    const notification = await prisma.notification.update({
      where: { id: req.params.id, userId },
      data: { read: true }
    });

    res.json(notification);
  }));

  app.patch("/api/notifications/read-all", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true }
    });

    res.json({ success: true });
  }));

  // Users Management
  app.get("/api/users", authenticate, requirePermission("users.view"), asyncHandler(async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
      where: { companyId: (req as any).user.companyId },
      include: { role: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(users.map(u => {
      const { passwordHash, ...safe } = u;
      return safe;
    }));
  }));

  app.get("/api/users/:id", authenticate, requirePermission("users.view"), asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findFirst({
      where: { id: req.params.id, companyId: (req as any).user.companyId },
      include: { role: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  }));

  app.post("/api/users", authenticate, requirePermission("users.create"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { name, email, password, roleId } = req.body;

    const targetRole = await prisma.role.findFirst({
      where: { id: roleId, companyId: currentUser.companyId }
    });

    if (!targetRole) return res.status(400).json({ error: "Invalid role" });
    if (targetRole.name === "Owner" && currentUser.role.name !== "Owner") {
      return res.status(403).json({ error: "Only an Owner can create another Owner account" });
    }

    // Check for users.assignRole permission 
    const hasAssignRole = currentUser.role.permissions.some((p: any) => p.permission.key === "users.assignRole") || currentUser.role.isSystem;
    if (!hasAssignRole) {
      return res.status(403).json({ error: "Forbidden: Missing permission users.assignRole" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        companyId: currentUser.companyId,
        name,
        email,
        passwordHash,
        roleId,
        status: "ACTIVE"
      },
      include: { role: true }
    });

    const { passwordHash: _, ...safeUser } = newUser;
    res.json(safeUser);
  }));

  app.put("/api/users/:id", authenticate, requirePermission("users.edit"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { name, email } = req.body;

    const targetUser = await prisma.user.findFirst({
      where: { id: req.params.id, companyId: currentUser.companyId }
    });

    if (!targetUser) return res.status(404).json({ error: "User not found" });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email },
      include: { role: true }
    });

    const { passwordHash: _, ...safeUser } = updated;
    res.json(safeUser);
  }));

  app.patch("/api/users/:id/status", authenticate, requirePermission("users.disable"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { status } = req.body;

    if (req.params.id === currentUser.id) {
      return res.status(400).json({ error: "You cannot disable your own account" });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: req.params.id, companyId: currentUser.companyId },
      include: { role: true }
    });

    if (!targetUser) return res.status(404).json({ error: "User not found" });
    if (targetUser.role.name === "Owner" && currentUser.role.name !== "Owner") {
      return res.status(403).json({ error: "Only an Owner can disable another Owner account" });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json({ status: updated.status });
  }));

  app.patch("/api/users/:id/role", authenticate, requirePermission("users.assignRole"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { roleId } = req.body;

    const [targetUser, newRole] = await Promise.all([
      prisma.user.findFirst({
        where: { id: req.params.id, companyId: currentUser.companyId },
        include: { role: true }
      }),
      prisma.role.findFirst({
        where: { id: roleId, companyId: currentUser.companyId }
      })
    ]);

    if (!targetUser || !newRole) return res.status(404).json({ error: "User or role not found" });
    
    // Protection: Only Owners can handle Owner roles
    if ((targetUser.role.name === "Owner" || newRole.name === "Owner") && currentUser.role.name !== "Owner") {
      return res.status(403).json({ error: "Only an Owner can assign or remove the Owner role" });
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { roleId }
    });

    res.json({ success: true });
  }));

  app.get("/api/permissions", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const perms = await prisma.permission.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }]
    });
    res.json(perms);
  }));

  app.get("/api/roles", authenticate, asyncHandler(async (req: Request, res: Response) => {
    const roles = await prisma.role.findMany({
      where: { companyId: (req as any).user.companyId },
      include: { 
        permissions: { include: { permission: true } },
        _count: { select: { users: true } }
      },
      orderBy: { name: "asc" }
    });
    res.json(roles);
  }));

  app.post("/api/roles", authenticate, requirePermission("settings.roles.manage"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { name, description } = req.body;

    const role = await prisma.role.create({
      data: {
        companyId: currentUser.companyId,
        name,
        description,
        isSystem: false
      }
    });
    res.json(role);
  }));

  app.put("/api/roles/:id", authenticate, requirePermission("settings.roles.manage"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { name, description } = req.body;

    const role = await prisma.role.findFirst({
      where: { id: req.params.id, companyId: currentUser.companyId }
    });

    if (!role) return res.status(404).json({ error: "Role not found" });
    if (role.isSystem || role.name === "Owner") return res.status(403).json({ error: "System roles cannot be renamed" });

    const updated = await prisma.role.update({
      where: { id: req.params.id },
      data: { name, description }
    });
    res.json(updated);
  }));

  app.patch("/api/roles/:id/permissions", authenticate, requirePermission("settings.roles.manage"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { permissionIds } = req.body; // Array of permission IDs to have

    const role = await prisma.role.findFirst({
      where: { id: req.params.id, companyId: currentUser.companyId }
    });

    if (!role) return res.status(404).json({ error: "Role not found" });
    if (role.name === "Owner") return res.status(403).json({ error: "Owner permissions cannot be modified" });

    // Security: User can only grant permissions they themselves have
    const myPermIds = currentUser.role.permissions.map((p: any) => p.permissionId);
    const isSystemAdmin = currentUser.role.isSystem;
    
    const unauthorizedPerms = permissionIds.filter((id: string) => !myPermIds.includes(id) && !isSystemAdmin);
    if (unauthorizedPerms.length > 0) {
      return res.status(403).json({ error: "You cannot grant permissions you do not possess" });
    }

    await prisma.$transaction([
      prisma.rolePermission.deleteMany({ where: { roleId: role.id } }),
      prisma.rolePermission.createMany({
        data: permissionIds.map((pid: string) => ({ roleId: role.id, permissionId: pid }))
      })
    ]);

    res.json({ success: true });
  }));

  app.post("/api/roles/:id/clone", authenticate, requirePermission("settings.roles.manage"), asyncHandler(async (req: Request, res: Response) => {
    const currentUser = (req as any).user;
    const { name } = req.body;

    const sourceRole = await prisma.role.findFirst({
      where: { id: req.params.id, companyId: currentUser.companyId },
      include: { permissions: true }
    });

    if (!sourceRole) return res.status(404).json({ error: "Source role not found" });

    const newRole = await prisma.role.create({
      data: {
        companyId: currentUser.companyId,
        name: name || `${sourceRole.name} (Copy)`,
        description: `Cloned from ${sourceRole.name}`,
        isSystem: false
      }
    });

    if (sourceRole.permissions.length > 0) {
      await prisma.rolePermission.createMany({
        data: sourceRole.permissions.map(p => ({
          roleId: newRole.id,
          permissionId: p.permissionId
        }))
      });
    }

    res.json(newRole);
  }));

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("[CRITICAL ERROR]", {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? "REDACTED" : err.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });

    const status = err.status || 500;
    res.status(status).json({
      error: "An internal server error occurred",
      message: process.env.NODE_ENV === "production" ? undefined : err.message
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareSuite server running at http://localhost:${PORT}`);
  });
}

startServer();
