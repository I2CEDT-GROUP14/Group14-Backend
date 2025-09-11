import express from "express";

import * as tagController from "../controllers/tagController.js";

const router = express.Router();

router.get("/", tagController.getAllTags);
router.post("/create", tagController.createTag);
// router.get("/:id", quizController.getQuizById);
// router.post("/generate", quizController.generateQuiz);


export default router;