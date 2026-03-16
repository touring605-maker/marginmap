import { Router, type IRouter, type Request, type Response } from "express";
import { ListIndustryTemplatesResponse } from "@workspace/api-zod";
import { industryTemplates } from "../lib/industryTemplates";

const router: IRouter = Router();

router.get("/industry-templates", (_req: Request, res: Response) => {
  res.json(ListIndustryTemplatesResponse.parse(industryTemplates));
});

export default router;
