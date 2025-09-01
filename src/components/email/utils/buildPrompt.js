export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting professional emails.

WRITE A PROFESSIONAL EMAIL with these specifications:

From: ${form.sender}
To: ${form.receiver}
Recipient Context: ${form.recipientContext}
Purpose: ${form.purpose}
Key Points: ${form.keyPoints}
Tone: ${form.tone}
Length: Approximately ${form.length} words

IMPORTANT: Structure your response exactly like this:
GREETING: Hello ${form.receiver},

INTRODUCTION:
Write a brief introduction here that states the purpose of the email.

BODY:
Write the main content here that addresses the purpose and includes the key details provided.

CLOSING:
Write a polite closing statement here.

Ensure the total word count is approximately ${form.length} words. Keep it professional, no subject lines, signatures, explanations, or additional text outside the specified structure. Make the content unique and relevant to the recipient context and key points.`.trim();
}