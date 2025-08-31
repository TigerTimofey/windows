export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  // Mock social response
  const mockText = `Mock Social Media Posts:

1. Exciting news! Check out our latest update. #MockPost
2. Behind the scenes of our project. #StudyPurposes
3. Join the conversation! #AI #Mock`

  res.status(200).json({ text: mockText })
}
