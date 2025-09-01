import { Router } from 'express'
import { spawn, spawnSync } from 'child_process'
import { checkOllama, checkModel } from '../utils/ollamaChecks.js'

const router = Router()
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

router.post('/generate-stream', async (req, res) => {
  let prompt = req.body.prompt
  console.log('[Backend] /generate-stream called with prompt:', prompt)
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  // Check ollama and model
  const ollamaCheck = checkOllama()
  if (ollamaCheck.error) return res.status(500).json(ollamaCheck)
  const modelCheck = checkModel()
  if (modelCheck.error) return res.status(424).json(modelCheck)

  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': FRONTEND_ORIGIN,
    'Access-Control-Allow-Credentials': 'true'
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
})

router.post('/generate-blog', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

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
})

router.post('/generate-story', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

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
})

router.post('/generate-email', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

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
})

router.post('/generate-social', async (req, res) => {
  const prompt = req.body.prompt
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

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
})

export default router
