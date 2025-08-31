export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  // Mock blog response
  const mockText = `Mock Blog Post Title

Introduction: This is a mock blog post generated for study purposes.

Body: The content here would normally be created by an AI model like Ollama. For now, it's just placeholder text to demonstrate the functionality.

Conclusion: Remember, this is for educational purposes only.`

  res.status(200).json({ text: mockText })
}
