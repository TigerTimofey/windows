export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting professional emails.

WRITE A PROFESSIONAL EMAIL with these specifications:

From: ${form.sender}
To: ${form.receiver}
Subject: ${form.subject}
Purpose: ${form.purpose}
Tone: ${form.tone}
Length: Maximum ${form.maxWords} words
Complexity: ${form.complexity}
Presentation Style: ${form.presentation}
Temperature: ${form.temperature}
Max Tokens: ${form.maxTokens}

IMPORTANT: Structure the email content exactly as follows:
GREETING: Hello ${form.receiver},
INTRODUCTION: [Brief introduction stating the purpose of the email]
BODY: [Main content addressing the topic, purpose, and key details]
CLOSING: [Polite closing statement or call to action]

Write only the email content in the format above. Do not include subject lines, signatures, explanations, or additional text outside the specified structure.`.trim();
}