export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting professional blog posts.

WRITE A STRUCTURED BLOG POST with these specifications:

Topic: ${form.topic}
Target Audience: ${form.targetAudience}
Word Count: Approximately ${form.wordCount} words
Tone: ${form.tone}
SEO Focus: ${form.seoFocus ? 'Yes' : 'No'}
Expertise Level: ${form.expertiseLevel}

IMPORTANT: Structure your response exactly like this:
TITLE: [Compelling title here]

INTRODUCTION:
[Engaging introduction paragraph]

BODY:
[Detailed body content with sections]

CONCLUSION:
[Strong conclusion paragraph]

Write only the blog post content in the format above. Do not include any explanations or additional text.`.trim();
}
