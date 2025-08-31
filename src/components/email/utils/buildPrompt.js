export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting professional emails.

WRITE A PROFESSIONAL EMAIL with these specifications:

From: ${form.sender}
To: ${form.receiver}
Purpose: ${form.purpose}
Tone: ${form.tone}
Length: Approximately ${form.length} words

IMPORTANT: Structure your response exactly like this:
GREETING: Hello ${form.receiver},

INTRODUCTION:
[Brief introduction stating the purpose]

BODY:
[Main content addressing the purpose and key details]

CLOSING:
[Polite closing statement]

Write only the email content in the format above. Do not include subject lines, signatures, explanations, or additional text outside the specified structure.`.trim();
}