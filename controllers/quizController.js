import dotenv from 'dotenv';
import Quiz from '../models/quizModel.js';
dotenv.config();
// import '../db/db.js';

export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        // const quizzes = await Quiz.find({}, '-systemPrompt -__v -questions.answer'); // Exclude systemPrompt and __v fields
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
        res.status(200).json(quiz);
    } catch (error) {
        console.error("Error fetching quiz by ID:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

export const generateQuiz = async (req, res) => {
    const { topic, numQuestions, questionType } = req.body;

    if (!topic || !numQuestions || !questionType) {
        return res.status(400).json({ error: "Please provide topic, numQuestions, and questionType" });
    }

    let questiontypePrompt;

    if (questionType === 'multiple-choice') {
        questiontypePrompt = "Each question must be a multiple-choice question with 4 options.";
    } else if (questionType === 'true-false') {
        questiontypePrompt = "Each question must be a statement that can be answered with 'True' or 'False', with options 'True' and 'False'.";
    } else if (questionType === 'mixed') {
        questiontypePrompt = "Combine multiple-choice and true/false questions.";
    }

    const systemPrompt = `Generate a quiz on the topic of "${topic}" with ${numQuestions} questions. ${questiontypePrompt} Always use English.`;

    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
            contentType: 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: systemPrompt
                }]
            }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "Array",
                    items: {
                        type: "OBJECT",
                        properties: {
                            question: { type: "string" },
                            options: { type: "Array", items: { type: "string" } },
                            answer: { type: "string" }
                        },
                        propertyOrdering: ["question", "options", "answer"]
                    },
                }
            }
        })
    });

    const geminiData = await geminiResponse.json();
    let message = geminiData.candidates[0].content.parts[0].text;
    console.log("Generated Quiz:", message);
    //escape quotes in message
    message = JSON.parse(message);

    //save to database
    // Assuming you have a Quiz model set up with Mongoose
    const newQuiz = new Quiz({
        title: topic,
        numQuestions,
        questions: message,
        systemPrompt
    });
    await newQuiz.save();

    res.status(200).json(message);
}

export default { generateQuiz };