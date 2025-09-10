import express from "express";

import * as quizController from "../controllers/quizController.js";

const router = express.Router();

router.get("/", quizController.getAllQuizzes);
router.get("/:id", quizController.getQuizById);
router.post("/generate", quizController.generateQuiz);


export default router;