export function buildPrompt(form) {
  return `
You are an expert AI writing assistant specialized in crafting professional emails.

Content type: ${form.contentType}
Sender: ${form.sender}
Receiver: ${form.receiver}
Content: ${form.content}
Specifications: 
- Max ${form.maxWords} words. 
Style: 
- Complexity: ${form.complexity}. 
- Presentation: ${form.presentation}.
Generation settings: 
- Temperature: ${form.temperature}. 
- Max tokens: ${form.maxTokens}.

TASK:
Generate a short, direct email from ${form.sender} to ${form.receiver} according to the above details.
- The email should start with 'Hello ${form.receiver}.
- Do not add explanations or extra information.
  `.trim();
}