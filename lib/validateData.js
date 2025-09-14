export const validateTopic = (topic) => {
    if (typeof topic !== 'string' || topic.trim().length === 0) {
        return { valid: false, error: "Topic must be a non-empty string." };
    }
    return { valid: true };
}

export const validateNumQuestions = (numQuestions) => {
    if (typeof numQuestions !== 'number' || !Number.isInteger(numQuestions) || numQuestions <= 0 || numQuestions > 50) {
        return { valid: false, error: "Number of questions must be an integer between 1 and 50." };
    }
    return { valid: true };
}

export const validateQuestionType = (questionType) => {
    const validTypes = ['multiple-choice', 'true-false'];
    if (!validTypes.includes(questionType)) {
        return { valid: false, error: `Question type must be one of: ${validTypes.join(", ")}.` };
    }
    return { valid: true };
}

export const validateTags = (tags) => {
    if (!Array.isArray(tags) || !tags.every(tag => typeof tag === 'string')) {
        return { valid: false, error: "Tags must be an array of strings." };
    }
    return { valid: true };
}

export const validateDuration = (duration) => {
    if (typeof duration !== 'number' || !Number.isInteger(duration) || duration < 0 || duration > 180) {
        return { valid: false, error: "Duration must be an integer between 0 and 180 minutes." };
    }
    return { valid: true };
}

export const validateQuizCreationData = (topic, duration, numQuestions, questionType, tags) => {
    let validation;

    validation = validateTopic(topic);
    if (!validation.valid) return validation;
    validation = validateNumQuestions(numQuestions);
    if (!validation.valid) return validation;
    validation = validateQuestionType(questionType);
    if (!validation.valid) return validation;
    if (tags) {
        validation = validateTags(tags);
        if (!validation.valid) return validation;
    }
    validation = validateDuration(duration);
    if (!validation.valid) return validation;

    return { valid: true };
}

export default {
    validateTopic,
    validateNumQuestions,
    validateQuestionType,
    validateTags,
    validateDuration,
    validateQuizCreationData
};