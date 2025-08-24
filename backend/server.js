// Moved to src/server.js. See new structure in src/
import express from 'express'
import { spawn, spawnSync } from 'child_process'

import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

// CORS middleware FIRST
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Log every request for debugging
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`)
  next()
})

app.use(express.json())

console.log('[Backend] Server file loaded, waiting for requests...')

// SSE endpoint for streaming Ollama output
app.post('/generate-stream', async (req, res) => {
  let prompt = req.body.prompt
  console.log('[Backend] /generate-stream called with prompt:', prompt)
  if (!prompt) return res.status(400).json({ error: 'Missing prompt' })

  // Make the prompt as short and direct as possible
  prompt += '\n\nPlease write a very short, direct email (max 3 sentences). Only include the most essential information.'

  // --- check ollama exists ---
  const checkCmd = process.platform === 'win32' ? 'where' : 'which'
  try {
    const whichRes = spawnSync(checkCmd, ['ollama'])
    if (whichRes.status !== 0) {
      console.error('[Backend] ollama not found on PATH.')
      return res.status(500).json({ error: 'ollama not found on PATH. Install Ollama or add it to PATH.' })
    }
    console.log('[Backend] ollama path (sync):', whichRes.stdout.toString().trim())
  } catch (e) {
    console.error('[Backend] Failed to check ollama path sync:', e)
    return res.status(500).json({ error: 'Failed to verify ollama binary', details: e.message })
  }

  // --- check model available ---
  try {
    const listRes = spawnSync('ollama', ['list'])
    if (listRes.status === 0) {
      const listOut = listRes.stdout.toString()
 if (!/tinyllama:latest/i.test(listOut)) {
+   console.warn('[Backend] Model "tinyllama:latest" not found locally. Please run: ollama pull tinyllama:latest')
        return res.status(424).json({ error: 'Model inyllama:latest not available', details: 'Run `ollama pull inyllama:latest` or wait for it to finish downloading.' })
      }
    }
  } catch (e) {
    console.error('[Backend] Failed to run ollama list sync:', e)
  }

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

// POST /generate { prompt: "..." }

// Keep the old /generate endpoint for compatibility
app.post('/generate', async (req, res) => {
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

// host/port setup
const rawHost = process.env.HOST || '0.0.0.0'
const HOST = rawHost.replace(/^https?:\/\//, '')
const PORT = parseInt(process.env.PORT, 10) || 5000
app.listen(PORT, HOST, () => {
  console.log(`Backend running on ${HOST}:${PORT}`)
})
