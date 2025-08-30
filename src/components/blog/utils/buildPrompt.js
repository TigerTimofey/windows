export function buildPrompt(form) {
  return `
You are an expert AI writing assistant specialized in crafting professional blog posts.

Topic: ${form.topic}
Target Audience: ${form.targetAudience}
Word Count: ${form.wordCount}
Tone: ${form.tone}
SEO Focus: ${form.seoFocus}
Expertise Level: ${form.expertiseLevel}

TASK:
Generate a structured blog post according to the above details.
- Include a compelling title.
- An engaging introduction.
- A detailed body with relevant sections.
- A strong conclusion.
- Ensure the total word count is around ${form.wordCount}.
- Optimize for SEO if specified.
- Do not add explanations or extra information outside the blog post structure.
  `.trim();
}
