import { spawn } from 'child_process'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  const ollama = spawn('ollama', ['run', 'tinyllama:latest'], { stdio: ['pipe', 'pipe', 'pipe'] })
  ollama.stdin.write(prompt + '\n')
  ollama.stdin.end()

  let output = ''
  ollama.stdout.on('data', data => {
    output += data.toString()
  })

  ollama.stderr.on('data', data => {
    console.error('[Backend] Ollama error:', data.toString())
  })

  ollama.on('close', code => {
    if (code !== 0) {
      return res.status(500).json({ error: `Ollama exited with code ${code}` })
    }
    res.json({ text: output.trim() })
  })
}
