export function buildPrompt(form) {
  return `
You are an expert AI writing assistant.

Content type: ${form.contentType}
Context: ${form.context}
Specifications: ${form.specifications}
Style: ${form.style}
Generation settings: ${form.generation}

TASK:
Generate 2-3 sentences of the requested content according to the above details.
Strictly follow the specifications and style parameters.
Do not add explanations or extra information.
  `.trim()
}
