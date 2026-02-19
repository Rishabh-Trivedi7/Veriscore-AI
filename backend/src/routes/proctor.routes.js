import express from 'express';
import { logViolation } from '../controllers/proctor.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/log-violation").post(verifyJWT, logViolation);

export default router;
