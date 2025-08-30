export function buildPrompt(form) {
  return `You are an expert AI writing assistant specialized in crafting engaging short stories.

WRITE A COMPLETE SHORT STORY with these specifications:

Genre: ${form.genre}
Characters: ${form.characters}
Setting: ${form.setting}
Length: Approximately ${form.length} words
Style: ${form.style}
Target Audience: ${form.targetAudience}
Mood: ${form.mood}

IMPORTANT: Structure your response exactly like this:
TITLE: [Compelling title here]

INTRODUCTION:
[Engaging setup and introduction to characters and setting]

BODY:
[Detailed main story with plot development, conflicts, and events]

CONCLUSION:
[Satisfying resolution and ending]

Write only the story content in the format above. Do not include any explanations or additional text.`.trim();
}
