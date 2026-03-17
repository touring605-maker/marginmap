import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and, inArray } from "drizzle-orm";
import { db, companiesTable, channelsTable, channelCompaniesTable } from "@workspace/db";
import { getOrCreateOrg } from "./organizations";
import { z } from "zod";
import multer from "multer";
import { ObjectStorageService } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);
const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024;

const logoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_LOGO_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const CreateCompanyBody = z.object({
  name: z.string().min(1),
  parentCompanyId: z.number().int().nullable().optional(),
  industry: z.string().optional().nullable(),
  logoUrl: z.string().optional().nullable(),
  hq: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  fiscalYearEnd: z.string().optional().nullable(),
});

const UpdateCompanyBody = CreateCompanyBody.partial();

const CreateChannelBody = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  companyIds: z.array(z.number().int()).optional(),
});

const UpdateChannelBody = z.object({
  name: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  companyIds: z.array(z.number().int()).optional(),
});

const ReorderChannelsBody = z.object({
  orderedIds: z.array(z.number().int()),
});

function parseId(raw: unknown): number | null {
  const n = parseInt(String(raw), 10);
  return isNaN(n) ? null : n;
}

async function validateCompanyIds(companyIds: number[], orgId: number): Promise<boolean> {
  if (companyIds.length === 0) return true;
  const found = await db
    .select({ id: companiesTable.id })
    .from(companiesTable)
    .where(and(eq(companiesTable.orgId, orgId), inArray(companiesTable.id, companyIds)));
  return found.length === companyIds.length;
}

async function wouldCreateCycle(companyId: number, newParentId: number): Promise<boolean> {
  const visited = new Set<number>();
  let current: number | null = newParentId;
  while (current !== null) {
    if (current === companyId) return true;
    if (visited.has(current)) return true;
    visited.add(current);
    const [row] = await db
      .select({ parentCompanyId: companiesTable.parentCompanyId })
      .from(companiesTable)
      .where(eq(companiesTable.id, current));
    current = row?.parentCompanyId ?? null;
  }
  return false;
}

router.get("/companies", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const companies = await db.select().from(companiesTable).where(eq(companiesTable.orgId, org.id));
  res.json(companies);
});

router.post("/companies", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const parsed = CreateCompanyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const org = await getOrCreateOrg(req.user.id);

  if (parsed.data.parentCompanyId != null) {
    const [parent] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(and(eq(companiesTable.id, parsed.data.parentCompanyId), eq(companiesTable.orgId, org.id)));
    if (!parent) { res.status(400).json({ error: "Parent company not found in this org" }); return; }
  }

  const [company] = await db.insert(companiesTable).values({ ...parsed.data, orgId: org.id }).returning();
  res.status(201).json(company);
});

router.patch("/companies/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = parseId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Invalid company id" }); return; }
  const parsed = UpdateCompanyBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const org = await getOrCreateOrg(req.user.id);

  if (parsed.data.parentCompanyId != null) {
    if (parsed.data.parentCompanyId === id) { res.status(400).json({ error: "A company cannot be its own parent" }); return; }
    const [parent] = await db
      .select({ id: companiesTable.id })
      .from(companiesTable)
      .where(and(eq(companiesTable.id, parsed.data.parentCompanyId), eq(companiesTable.orgId, org.id)));
    if (!parent) { res.status(400).json({ error: "Parent company not found in this org" }); return; }
    const cycle = await wouldCreateCycle(id, parsed.data.parentCompanyId);
    if (cycle) { res.status(400).json({ error: "Setting this parent would create a circular hierarchy" }); return; }
  }

  const [company] = await db
    .update(companiesTable)
    .set(parsed.data)
    .where(and(eq(companiesTable.id, id), eq(companiesTable.orgId, org.id)))
    .returning();
  if (!company) { res.status(404).json({ error: "Company not found" }); return; }
  res.json(company);
});

router.delete("/companies/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = parseId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Invalid company id" }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const [deleted] = await db
    .delete(companiesTable)
    .where(and(eq(companiesTable.id, id), eq(companiesTable.orgId, org.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Company not found" }); return; }
  res.sendStatus(204);
});

router.get("/channels", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const channels = await db
    .select()
    .from(channelsTable)
    .where(eq(channelsTable.orgId, org.id))
    .orderBy(channelsTable.sortOrder);

  const channelIds = channels.map((c) => c.id);
  let companyLinks: Array<{ channelId: number; companyId: number }> = [];
  if (channelIds.length > 0) {
    companyLinks = await db
      .select({ channelId: channelCompaniesTable.channelId, companyId: channelCompaniesTable.companyId })
      .from(channelCompaniesTable)
      .where(inArray(channelCompaniesTable.channelId, channelIds));
  }

  const result = channels.map((ch) => ({
    ...ch,
    companyIds: companyLinks.filter((l) => l.channelId === ch.id).map((l) => l.companyId),
  }));

  res.json(result);
});

router.post("/channels", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const parsed = CreateChannelBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const { companyIds, ...channelData } = parsed.data;

  if (companyIds && companyIds.length > 0) {
    const valid = await validateCompanyIds(companyIds, org.id);
    if (!valid) { res.status(400).json({ error: "One or more companies not found in this org" }); return; }
  }

  const existingChannels = await db.select({ id: channelsTable.id }).from(channelsTable).where(eq(channelsTable.orgId, org.id));

  const [channel] = await db
    .insert(channelsTable)
    .values({ ...channelData, orgId: org.id, sortOrder: channelData.sortOrder ?? existingChannels.length })
    .returning();

  if (companyIds && companyIds.length > 0) {
    await db.insert(channelCompaniesTable).values(
      companyIds.map((cid: number) => ({ channelId: channel.id, companyId: cid }))
    );
  }

  res.status(201).json({ ...channel, companyIds: companyIds || [] });
});

router.patch("/channels/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = parseId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Invalid channel id" }); return; }
  const parsed = UpdateChannelBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const { companyIds, ...channelData } = parsed.data;

  const [existingChannel] = await db
    .select({ id: channelsTable.id })
    .from(channelsTable)
    .where(and(eq(channelsTable.id, id), eq(channelsTable.orgId, org.id)));
  if (!existingChannel) { res.status(404).json({ error: "Channel not found" }); return; }

  if (companyIds !== undefined && companyIds.length > 0) {
    const valid = await validateCompanyIds(companyIds, org.id);
    if (!valid) { res.status(400).json({ error: "One or more companies not found in this org" }); return; }
  }

  const [channel] = await db
    .update(channelsTable)
    .set(channelData)
    .where(and(eq(channelsTable.id, id), eq(channelsTable.orgId, org.id)))
    .returning();

  if (!channel) { res.status(404).json({ error: "Channel not found" }); return; }

  if (companyIds !== undefined) {
    await db.delete(channelCompaniesTable).where(eq(channelCompaniesTable.channelId, id));
    if (companyIds.length > 0) {
      await db.insert(channelCompaniesTable).values(
        companyIds.map((cid: number) => ({ channelId: id, companyId: cid }))
      );
    }
  }

  const links = await db
    .select({ companyId: channelCompaniesTable.companyId })
    .from(channelCompaniesTable)
    .where(eq(channelCompaniesTable.channelId, id));

  res.json({ ...channel, companyIds: links.map((l) => l.companyId) });
});

router.delete("/channels/:id", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const id = parseId(req.params["id"]);
  if (id === null) { res.status(400).json({ error: "Invalid channel id" }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const [deleted] = await db
    .delete(channelsTable)
    .where(and(eq(channelsTable.id, id), eq(channelsTable.orgId, org.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Channel not found" }); return; }
  res.sendStatus(204);
});

router.post("/channels/reorder", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const parsed = ReorderChannelsBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const org = await getOrCreateOrg(req.user.id);
  const { orderedIds } = parsed.data;

  const orgChannels = await db.select({ id: channelsTable.id }).from(channelsTable).where(eq(channelsTable.orgId, org.id));
  const orgChannelIds = new Set(orgChannels.map((c) => c.id));

  if (orderedIds.length !== orgChannelIds.size || orderedIds.some((id) => !orgChannelIds.has(id))) {
    res.status(400).json({ error: "orderedIds must contain exactly the org's channel IDs" }); return;
  }

  await Promise.all(
    orderedIds.map((chanId: number, idx: number) =>
      db
        .update(channelsTable)
        .set({ sortOrder: idx })
        .where(and(eq(channelsTable.id, chanId), eq(channelsTable.orgId, org.id)))
    )
  );

  res.sendStatus(204);
});

router.post("/companies/logo-upload", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }

  await new Promise<void>((resolve) => {
    logoUpload.single("logo")(req, res, (err: unknown) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
          res.status(400).json({ error: "File too large (max 5 MB)" });
        } else if (err instanceof Error) {
          res.status(400).json({ error: err.message });
        } else {
          res.status(400).json({ error: "Invalid file" });
        }
        resolve();
        return;
      }
      resolve();
    });
  });

  if (res.headersSent) return;
  if (!req.file) { res.status(400).json({ error: "No image file provided" }); return; }

  try {
    const objectPath = await objectStorageService.uploadBuffer(req.file.buffer, req.file.mimetype);
    const logoUrl = `/api/storage${objectPath}`;
    res.status(201).json({ logoUrl });
  } catch (err) {
    console.error("Logo upload error:", err);
    res.status(500).json({ error: "Failed to store logo" });
  }
});

export default router;
