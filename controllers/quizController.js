import dotenv from 'dotenv';
import Quiz from '../models/quizModel.js';
dotenv.config();

export const getAllQuizzes = async (req, res) => {
    const quizzes = await Quiz.find();
    // const quizzes = await Quiz.find({}, '-systemPrompt -__v -questions.answer'); // Exclude systemPrompt and __v fields
    res.status(200).json(quizzes);
}

export const generateQuiz = async (req, res) => {
    const { topic, numQuestions } = req.body;

    const systemPrompt = `Generate a quiz on the topic of "${topic}" with ${numQuestions} questions. Combine multiple-choice and true/false questions. Always use English.`;

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