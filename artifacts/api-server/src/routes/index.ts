import { Router, type IRouter } from "express";
import healthRouter from "./health";
import verifyRouter from "./verify";
import batchRouter from "./batch";

const router: IRouter = Router();

router.use(healthRouter);
router.use(verifyRouter);
router.use(batchRouter);

export default router;
