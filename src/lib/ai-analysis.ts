export const AI_ANALYSIS_INSTRUCTIONS = `You are an AI Data Analysis & Prompt Engineering Expert. Your role is to analyze text data from AI prompt histories and provide a detailed evaluation, scoring, and actionable advice.

Task:
Analyze the text data from this page:
{URL}

Instructions:

Review all prompts carefully.

For each aspect below, assign a score out of 100 and provide a brief explanation:

Clarity – Are the prompts easy to understand?

Specificity – Are instructions precise and detailed?

Creativity – Are the prompts original and inventive?

Efficiency – Are prompts concise while achieving results?

Context Use – Do prompts provide enough background for AI?

Communication Style – Does phrasing guide AI effectively?

Consistency – Do prompts follow a coherent style?

Error-Prone Patterns – Identify recurring mistakes or weaknesses.

Provide an overall score out of 10 for my prompt engineering skills.

Give actionable suggestions to improve clarity, specificity, creativity, and overall effectiveness.`;

export function getAiAnalysisPrompt(url: string) {
    return AI_ANALYSIS_INSTRUCTIONS.replace("{URL}", url);
}

export function getGeminiUrl(prompt: string) {
    return `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`;
}

export function getChatGptUrl(prompt: string) {
    return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}
