export function buildPrompt(form) {
  return `You are an expert AI social media strategist specialized in creating engaging platform-optimized posts.

WRITE PLATFORM-OPTIMIZED SOCIAL MEDIA POSTS with these specifications:

Product/Service: ${form.productService}
Platform: ${form.platform}
Goal: ${form.goal}
Tone: ${form.tone}
CTA: ${form.cta}

IMPORTANT: Structure your response exactly like this:
POSTS:
[Post 1]

[Post 2]

[Post 3]

HASHTAGS:
#hashtag1 #hashtag2 #hashtag3

Write only the posts and hashtags in the format above. Do not include any explanations or additional text.`.trim();
}
