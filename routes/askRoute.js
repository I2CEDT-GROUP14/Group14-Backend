import express from "express";

import * as askController from "../controllers/askController.js";

const router = express.Router();

router.post("/", askController.getAnswer);

export default router;