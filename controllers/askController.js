import { generateAnswer } from "../lib/generateAnswer.js";

export const getAnswer = async (req, res) => {
    const { question } = req.body;
    try {
        const answer = await generateAnswer(question);
        res.status(200).json({ answer });
    } catch (error) {
        console.error("Error generating answer:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}