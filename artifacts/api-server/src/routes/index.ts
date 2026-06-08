import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import activitiesRouter from "./activities";
import challengesRouter from "./challenges";
import eventsRouter from "./events";
import badgesRouter from "./badges";
import leaderboardRouter from "./leaderboard";
import notificationsRouter from "./notifications";
import analyticsRouter from "./analytics";
import reportsRouter from "./reports";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(activitiesRouter);
router.use(challengesRouter);
router.use(eventsRouter);
router.use(badgesRouter);
router.use(leaderboardRouter);
router.use(notificationsRouter);
router.use(analyticsRouter);
router.use(reportsRouter);
router.use(settingsRouter);

export default router;
