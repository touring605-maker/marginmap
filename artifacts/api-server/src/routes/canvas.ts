import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, canvasPositionsTable } from "@workspace/db";
import {
  GetCanvasPositionsResponse,
  SaveCanvasPositionsBody,
  SaveCanvasPositionsResponse,
} from "@workspace/api-zod";
import { getOrCreateOrg } from "./organizations";

const router: IRouter = Router();

router.get("/canvas/positions", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);
  const positions = await db.select().from(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));
  res.json(GetCanvasPositionsResponse.parse({ positions }));
});

router.put("/canvas/positions", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const body = SaveCanvasPositionsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const org = await getOrCreateOrg(req.user.id);

  await db.delete(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));

  if (body.data.positions.length > 0) {
    await db.insert(canvasPositionsTable).values(
      body.data.positions.map(p => ({ orgId: org.id, caseId: p.caseId, x: p.x, y: p.y }))
    );
  }

  const positions = await db.select().from(canvasPositionsTable).where(eq(canvasPositionsTable.orgId, org.id));
  res.json(SaveCanvasPositionsResponse.parse({ positions }));
});

export default router;
