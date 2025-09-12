import express from "express";

import * as quizController from "../controllers/quizController.js";

const router = express.Router();

router.get("/", quizController.getAllQuizzes);
router.get("/:id", quizController.getQuizById);
router.delete("/:id", quizController.deleteQuizById);
router.post("/update/:id", quizController.updateQuizById);
router.post("/submit/:id", quizController.submitQuizAnswers);
router.post("/generate", quizController.generateQuiz);


export default router;