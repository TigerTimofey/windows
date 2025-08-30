export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting professional emails.

WRITE A PROFESSIONAL EMAIL with these specifications:

From: ${form.sender}
To: ${form.receiver}
Topic: ${form.content}

Requirements:
- Maximum ${form.maxWords} words
- Complexity: ${form.complexity}
- Presentation style: ${form.presentation}
- Temperature: ${form.temperature}
- Max tokens: ${form.maxTokens}

IMPORTANT: Write only the email content. Start with "Hello ${form.receiver}," and end with the message. Do not include any explanations, signatures, or additional text outside the email body.`.trim();
}