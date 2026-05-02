import express from 'express';

import { getDsahboardOverview } from '../controllers/dashboardController.js';
import authMiddleware from '../middleware/auth.js';

const dashboardRouter = express.Router();

dashboardRouter.get("/", authMiddleware, getDsahboardOverview);

export default dashboardRouter;