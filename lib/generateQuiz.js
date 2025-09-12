import dotenv from 'dotenv';
dotenv.config();

export const createQuiz = async (prompt) => {
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent', {
        method: 'POST',
        headers: {
            contentType: 'application/json',
            'x-goog-api-key': process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: "Array",
                    items: {
                        type: "OBJECT",
                        properties: {
                            questions: {
                                type: "Array",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        question: { type: "string" },
                                        options: { type: "Array", items: { type: "string" } },
                                        answer: { type: "string" },
                                    },
                                    required: ["question", "options", "answer"],
                                    propertyOrdering: ["question", "options", "answer"]
                                }
                            },
                        },
                    },
                }
            }
        })
    });
    
    const geminiData = await geminiResponse.json();
    console.log("Gemini Data", geminiData);
    let message = await geminiData.candidates[0].content.parts[0].text;
    message = await JSON.parse(message);
    console.log(message);
    return message;
}


export default createQuiz;