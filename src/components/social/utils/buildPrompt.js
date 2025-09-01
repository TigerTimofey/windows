export function buildPrompt(form) {
  return `Create 3 engaging ${form.platform} posts about ${form.productService}.

Goal: ${form.goal}
Tone: ${form.tone}
CTA: ${form.cta}

Format:
POST 1: [post content]
POST 2: [post content]
POST 3: [post content]

HASHTAGS: #hashtag1 #hashtag2 #hashtag3

Make the posts professional and engaging.`.trim();
}
