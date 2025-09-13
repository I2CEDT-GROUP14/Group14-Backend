import mongoose from "mongoose";

//define quiz type (multiple choice or true/false)

// const quizSchema = new mongoose.Schema({
//     question: { type: String, required: true },
//     options: { type: [String], required: true },
//     answer: { type: String, required: true },
//     type: { type: String, enum: ['multiple-choice', 'true-false'], required: true }
// }, { timestamps: true });

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    questions: [
            {
                question: { type: String, required: true },
                options: { type: [String], required: true },
                answer: { type: String, required: true },
                userAnswer: { type: String, default: "" },
                isAnswerCorrect: { type: Boolean, default: false }
            }
    ],
    choiceType: {
        type: String,
        enum: ['multiple-choice', 'true-false'],
        required: true
    },
    originalPrompt: {
        type: String,
        required: true,
    },
    systemPrompt: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        default: 0, // duration in minutes, 0 means no time limit
    },
    questionCount: {
        type: Number,
        default: 0,
    },
    tags: {
        type: [String],
        default: []
    },
    score: {
        type: Number,
        default: 0,
    }
}, { timestamps: true });

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
