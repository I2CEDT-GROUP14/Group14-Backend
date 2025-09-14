import dotenv from 'dotenv';
dotenv.config();

export const createQuiz = async (prompt) => {
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
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
                            injectionDetected: { type: "boolean" },
                            gibberishDetected: { type: "boolean" },
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
                        required: ["injectionDetected", "gibberishDetected", "questions"],
                        propertyOrdering: ["injectionDetected", "gibberishDetected", "questions"]
                    },
                }
            }
        })
    });
    
    const geminiData = await geminiResponse.json();
    console.log("Gemini Data", geminiData);

    try {
        let message = await geminiData.candidates[0].content.parts[0].text;
        message = await JSON.parse(message);
        message = message[0]; // Extract the first object from the array
        if (message.gibberishDetected) {
            return { success: false, error: "Gibberish detected in topic. Please provide a valid topic." };
        }
        if (message.injectionDetected) {
            return { success: false, error: "Prompt injection detected in topic. Please provide a valid topic." };
        }
        console.log(message);
        return { success: true, data: message };
    } catch (err) {
        //check for error messages from gemini
        if (message.error) {
            return { success: false, error: message.error };
        }
        console.error("Gemini Error:", err);
        return { success: false, error: "Gemini Error: " + err.message };
    }

}


export default createQuiz;