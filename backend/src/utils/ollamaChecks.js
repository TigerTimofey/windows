import { spawnSync } from 'child_process'

export function checkOllama() {
  const checkCmd = process.platform === 'win32' ? 'where' : 'which'
  try {
    const whichRes = spawnSync(checkCmd, ['ollama'])
    if (whichRes.status !== 0) {
      console.error('[Backend] ollama not found on PATH.')
      return { error: 'ollama not found on PATH. Install Ollama or add it to PATH.' }
    }
    console.log('[Backend] ollama path (sync):', whichRes.stdout.toString().trim())
    return {}
  } catch (e) {
    console.error('[Backend] Failed to check ollama path sync:', e)
    return { error: 'Failed to verify ollama binary', details: e.message }
  }
}

export function checkModel() {
  try {
    const listRes = spawnSync('ollama', ['list'])
    if (listRes.status === 0) {
      const listOut = listRes.stdout.toString()
      if (!/tinyllama:latest/i.test(listOut)) {
        console.warn('[Backend] Model "tinyllama:latest" not found locally. Please run: ollama pull tinyllama:latest')
        return { error: 'Model tinyllama:latest not available', details: 'Run `ollama pull tinyllama:latest` or wait for it to finish downloading.' }
      }
      return {}
    }
    return { error: 'Failed to list ollama models.' }
  } catch (e) {
    console.error('[Backend] Failed to run ollama list sync:', e)
    return { error: 'Failed to run ollama list', details: e.message }
  }
}
