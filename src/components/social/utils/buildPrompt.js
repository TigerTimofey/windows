export function buildPrompt(form) {
  return `You are an AI that ONLY outputs in the exact specified format. Do NOT include any conversational text, disclaimers, notes, or additional explanations.

Platform-Optimized Social Media Posts with These Specifications:

Product/Service: ${form.productService}

Goal: ${form.goal}

1. Product/Service: The ${form.productService} provides professional copywriting services for businesses looking to improve their brand awareness through social media posts on ${form.platform}.

2. Platform: ${form.platform}

3. Goal: ${form.goal} by sharing informative and engaging content that highlights the ${form.productService}'s expertise and provides value to potential clients.

4. Tone: ${form.tone}

5. CTA: ${form.cta}

6. Important: Use structure exactly like this to create engaging platform-optimized posts and hashtags. Do not include any additional text or explanations.

7. HASHTAGS: #${form.goal}, #${form.productService}, #${form.platform}, #${form.cta}

POST 1: [Write an actual engaging ${form.platform} post about ${form.productService} in ${form.tone} tone that achieves the goal of ${form.goal}. Include ${form.cta} at the end.]

POST 2: [Write another actual engaging ${form.platform} post about ${form.productService} in ${form.tone} tone that achieves the goal of ${form.goal}. Include ${form.cta} at the end.]

POST 3: [Write a third actual engaging ${form.platform} post about ${form.productService} in ${form.tone} tone that achieves the goal of ${form.goal}. Include ${form.cta} at the end.]

STRICT INSTRUCTIONS: Replace ALL bracketed text with actual content. Output ONLY the format above with real posts and real hashtags. Do NOT add any text before or after this format. Do NOT include phrases like "I don't have access to", "here are some specifications", "note:", or any other conversational content.`.trim();
}
