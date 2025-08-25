import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { logRequests } from './utils/logRequests.js'
import generateRoutes from './routes/generate.js'

dotenv.config()

const app = express()
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173'

// CORS middleware
app.use(cors({
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  optionsSuccessStatus: 200
}))

app.use(logRequests)
app.use(express.json())

console.log('[Backend] Server file loaded, waiting for requests...')

// Register routes
app.use('/', generateRoutes)

const rawHost = process.env.HOST || '0.0.0.0'
const HOST = rawHost.replace(/^https?:\/\//, '')
const PORT = parseInt(process.env.PORT, 10) || 5001
app.listen(PORT, HOST, () => {
  console.log(`Backend running on ${HOST}:${PORT}`)
})
