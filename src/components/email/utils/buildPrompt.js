export function buildPrompt(form) {
  return `
You are an expert AI writing assistant.

Content type: ${form.contentType}
Context: ${form.context}
Specifications: Max ${form.maxWords} words. Platform: Gmail.
Style: Complexity: ${form.complexity}. Presentation: ${form.presentation}.
Generation settings: temperature=${form.temperature}, max_tokens=${form.maxTokens}

TASK:
Generate a short, direct email according to the above details.
Strictly follow the specifications and style parameters.
Do not add explanations or extra information.
  `.trim()
}
