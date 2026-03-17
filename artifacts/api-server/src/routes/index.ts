import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import organizationsRouter from "./organizations";
import casesRouter from "./cases";
import dependenciesRouter from "./dependencies";
import canvasRouter from "./canvas";
import exchangeRatesRouter from "./exchangeRates";
import templatesRouter from "./templates";
import companiesRouter from "./companies";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(organizationsRouter);
router.use(casesRouter);
router.use(dependenciesRouter);
router.use(canvasRouter);
router.use(exchangeRatesRouter);
router.use(templatesRouter);
router.use(companiesRouter);

export default router;
