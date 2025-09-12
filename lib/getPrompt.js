export const getMainPrompt = (topic, numQuestions, questionType) => {
    const questiontypePrompt = getQuestionTypePrompt(questionType);
    const systemPrompt = `Generate a quiz on the topic of "${topic}" with ${numQuestions} questions. ${questiontypePrompt} Always use English.`;
    console.log("System Prompt", systemPrompt);
    return systemPrompt;
}

export const getQuestionTypePrompt = (questionType) => {
    let questiontypePrompt;
    if (questionType === 'multiple-choice') {
        questiontypePrompt = "Each question must be a multiple-choice question with 4 options.";
    } else if (questionType === 'true-false') {
        questiontypePrompt = "Each question must be a statement that can be answered with 'True' or 'False', with options 'True' and 'False'.";
    } else if (questionType === 'mixed') {
        questiontypePrompt = "Combine multiple-choice and true/false questions.";
    }
    return questiontypePrompt;
}

export default getMainPrompt;