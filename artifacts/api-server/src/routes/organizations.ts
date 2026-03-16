import { Router, type IRouter, type Request, type Response } from "express";
import { eq, and } from "drizzle-orm";
import { db, organizationsTable, organizationMembersTable, usersTable } from "@workspace/db";
import {
  GetCurrentOrganizationResponse,
  ListOrganizationMembersResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getOrCreateOrg(userId: string) {
  const existing = await db
    .select({ org: organizationsTable })
    .from(organizationMembersTable)
    .innerJoin(organizationsTable, eq(organizationsTable.id, organizationMembersTable.orgId))
    .where(eq(organizationMembersTable.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].org;
  }

  const [org] = await db.insert(organizationsTable).values({ name: "My Organization" }).returning();
  await db.insert(organizationMembersTable).values({
    orgId: org.id,
    userId,
    role: "owner",
  });

  return org;
}

router.get("/organizations/current", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const org = await getOrCreateOrg(req.user.id);
  res.json(GetCurrentOrganizationResponse.parse(org));
});

router.get("/organizations/members", async (req: Request, res: Response): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const org = await getOrCreateOrg(req.user.id);

  const members = await db
    .select({
      id: organizationMembersTable.id,
      userId: organizationMembersTable.userId,
      role: organizationMembersTable.role,
      user: {
        id: usersTable.id,
        email: usersTable.email,
        firstName: usersTable.firstName,
        lastName: usersTable.lastName,
        profileImageUrl: usersTable.profileImageUrl,
      },
    })
    .from(organizationMembersTable)
    .innerJoin(usersTable, eq(usersTable.id, organizationMembersTable.userId))
    .where(eq(organizationMembersTable.orgId, org.id));

  res.json(ListOrganizationMembersResponse.parse(members));
});

export default router;
export { getOrCreateOrg };
