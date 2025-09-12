import dotenv from 'dotenv';

import Quiz from '../models/quizModel.js';

import getMainPrompt from '../lib/getPrompt.js';
import createQuiz from '../lib/generateQuiz.js';

dotenv.config();

export const getAllQuizzes = async (req, res) => {
    const tagFilter = req.query.tags;
    console.log(tagFilter);
    if (tagFilter) {
        try {
            const tags = tagFilter.split(",").map(tag => tag.trim());
            console.log(tags)
            const quizzes = await Quiz.find({ tags: { $all: tags } });
            return res.status(200).json(quizzes);
        } catch (error) {
            console.error("Error fetching quizzes by tag:", error);
            return res.status(500).json({ error: "Internal Server Error" });
        }
    }
    try {
        const quizzes = await Quiz.find({}, '-systemPrompt -__v -questions'); // Exclude systemPrompt,  __v, and questions fields
        res.status(200).json(quizzes);

    } catch (error) {
        console.error("Error fetching quizzes:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const getQuizById = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }

        quiz.originalPrompt = undefined;
        quiz.systemPrompt = undefined;
        for (let q of quiz.questions) {
            q.answer = undefined;            
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const generateQuiz = async (req, res) => {
    const { topic, duration, numQuestions, questionType, tags } = req.body;

    if (!topic || !numQuestions || !questionType) {
        return res.status(400).json({ error: "Please provide topic, numQuestions, and questionType" });
    }

    const systemPrompt = await getMainPrompt(topic, numQuestions, questionType);
    console.log("Get SysPrompt", systemPrompt);
    const message = await createQuiz(systemPrompt);
    console.log(message);

    const newQuiz = new Quiz({
        title: topic,
        questions: message[0].questions,
        originalPrompt: topic + ", " + numQuestions + ", " + questionType,
        choiceType: questionType,
        systemPrompt,
        duration: duration,
        questionCount: numQuestions,
        tags: tags || []
    });

    await newQuiz.save();

    res.status(200).json(message);
}

export const updateQuizById = async (req, res) => {
    const { id } = req.params;
    const { topic, duration, numQuestions, questionType, regenerateQuiz, tags } = req.body;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        if (topic) quiz.title = topic;
        if (duration !== undefined) quiz.duration = duration;
        if (numQuestions !== undefined) quiz.questionCount = numQuestions;
        if (questionType) quiz.questionType = questionType;
        if (regenerateQuiz) {
            const systemPrompt = getMainPrompt(topic, numQuestions, questionType);
            const message = await createQuiz(systemPrompt);
            quiz.questions = message[0].questions;
        }
        if (tags) quiz.tags = tags;
        await quiz.save();
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error updating quiz by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export const deleteQuizById = async (req, res) => {
    const { id } = req.params;
    try {
        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        console.error("Error deleting quiz by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const submitQuizAnswers = async (req, res) => {
    const { id } = req.params;
    const { answers } = req.body; // answers should be an array of { questionId, userAnswer }
    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        let score = 0;
        quiz.questions.forEach((question, index) => {
            const userAnswerObj = answers.find(ans => ans.questionId === question._id.toString());
            if (userAnswerObj) {
                question.userAnswer = userAnswerObj.userAnswer;
                if (question.answer === userAnswerObj.userAnswer) {
                    question.isAnswerCorrect = true;
                    score += 1;
                } else {
                    question.isAnswerCorrect = false;
                }
            }
        });
        quiz.score = score;
        const savedQuiz = await quiz.save();

        for (let q of savedQuiz.questions) {
            q.answer = undefined;            
        }

        savedQuiz.originalPrompt = undefined;
        savedQuiz.systemPrompt = undefined;

        res.status(200).json(savedQuiz);
    } catch (error) {
        console.error("Error submitting quiz answers:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

export default { getAllQuizzes, getQuizById, generateQuiz, deleteQuizById, submitQuizAnswers };