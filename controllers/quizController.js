import dotenv from 'dotenv';

import Quiz from '../models/quizModel.js';

import getMainPrompt from '../lib/getPrompt.js';
import createQuiz from '../lib/generateQuiz.js';

import { validateQuizCreationData } from '../lib/validateData.js';

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
        const quizzes = await Quiz.find({}, '-systemPrompt -__v -questions').sort({ updatedAt: -1 }); // Exclude systemPrompt, __v, and questions fields and sort by creation date (newest first)
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
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const generateQuiz = async (req, res) => {
    const { title, description, duration, numQuestions, questionType, tags } = req.body;

    //validate data
    const validationError = validateQuizCreationData(description, duration, numQuestions, questionType);
    if (!validationError) {
        return res.status(400).json({ error: validationError });
    }

    const systemPrompt = await getMainPrompt(description, numQuestions, questionType);
    console.log("Get SysPrompt", systemPrompt);
    const createQuizResponse = await createQuiz(systemPrompt);
    console.log(createQuizResponse);
    console.log("Create Quiz Response", createQuizResponse.success);
    if (!createQuizResponse.success) {
        return res.status(400).json({ error: createQuizResponse.error });
    }

    //check if gemini returned an error
    if (createQuizResponse.error) {
        console.error("Gemini API error:", createQuizResponse.error);
        return res.status(400).json({ error: createQuizResponse.error });
    }

    //escape special characters in the title and tags
    title = title
        .replace(/[\\\"\'\n\r\t\b\f]/g, match => {
            switch (match) {
                case '\\': return '\\\\';
                case '"': return '\\"';
                case "'": return "\\'";
                case '\n': return '\\n';
                case '\r': return '\\r';
                case '\t': return '\\t';
                case '\b': return '\\b';
                case '\f': return '\\f';
                default: return match;
            }
        })
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    if (Array.isArray(tags)) {
        tags = tags.map(tag => tag
            .replace(/[\\\"\'\n\r\t\b\f]/g, match => {
                switch (match) {
                    case '\\': return '\\\\';
                    case '"': return '\\"';
                    case "'": return "\\'";
                    case '\n': return '\\n';
                    case '\r': return '\\r';
                    case '\t': return '\\t';
                    case '\b': return '\\b';
                    case '\f': return '\\f';
                    default: return match;
                }
            })
        );
    }

    const message = createQuizResponse.data;

    console.log("Create Quiz Message", message);

    const newQuiz = new Quiz({
        title: title,
        description: description,
        questions: message.questions,
        originalPrompt: description + ", " + numQuestions + ", " + questionType,
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
    const { title, description, duration, numQuestions, questionType, regenerateQuiz = true, tags } = req.body;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ error: "Quiz not found" });
        }
        if (title) quiz.title = title;
        if (description) quiz.description = description;
        if (duration !== undefined) quiz.duration = duration;
        if (numQuestions !== undefined) quiz.questionCount = numQuestions;
        if (questionType) quiz.questionType = questionType;
        if (regenerateQuiz) {
            const systemPrompt = getMainPrompt(description, numQuestions, questionType);
            const message = await createQuiz(systemPrompt);
            if (!message.success) {
                return res.status(400).json({ error: message.error });
            }
            quiz.systemPrompt = systemPrompt;
            quiz.originalPrompt = description + ", " + numQuestions + ", " + questionType;
            quiz.questions = message.data.questions;
            quiz.choiceType = questionType;
            quiz.score = 0; // Reset score when regenerating quiz
            // quiz.userAnswer = []; // Clear previous answers when regenerating quiz
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