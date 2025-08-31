import { spawn } from 'child_process'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt } = req.body
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' })
  }

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  res.flushHeaders()

  const ollama = spawn('ollama', ['run', 'tinyllama:latest'], { stdio: ['pipe', 'pipe', 'pipe'] })
  ollama.stdin.write(prompt + '\n')
  ollama.stdin.end()

  let responded = false
  const MAX_MS = 60_000
  const timeout = setTimeout(() => {
    if (!responded) {
      responded = true
      res.write('event: error\ndata: Timeout: Ollama did not respond in 60 seconds.\n\n')
      res.write('event: end\ndata: END\n\n')
      res.end()
      try { ollama.kill('SIGKILL') } catch {}
    }
  }, MAX_MS)

  ollama.stdout.on('data', data => {
    if (!responded) {
      const chunk = data.toString()
      res.write(`data: ${chunk}\n\n`)
    }
  })

  ollama.stderr.on('data', data => {
    if (!responded) {
      const chunk = data.toString()
      res.write(`event: error\ndata: ${chunk}\n\n`)
    }
  })

  ollama.on('close', code => {
    clearTimeout(timeout)
    if (!responded) {
      responded = true
      res.write('event: end\ndata: END\n\n')
      res.end()
    }
  })
}
