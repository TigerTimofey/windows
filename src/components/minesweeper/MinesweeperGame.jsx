import React, { useState, useEffect } from 'react'
import './MinesweeperGame.css'

function createBoard(rows, cols, mines, safeCell) {
  // Generate empty board
  const board = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      r, c, mine: false, rev: false, flag: false, q: false, n: 0
    }))
  )
  // Place mines, avoid safeCell and neighbors
  const forbidden = new Set([`${safeCell.r},${safeCell.c}`])
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = safeCell.r + dr, nc = safeCell.c + dc
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols)
        forbidden.add(`${nr},${nc}`)
    }
  const cells = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (!forbidden.has(`${r},${c}`)) cells.push([r, c])
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  for (let k = 0; k < mines; k++) {
    const [r, c] = cells[k]
    board[r][c].mine = true
  }
  // Compute numbers
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      board[r][c].n = neighbors(board, r, c).reduce((a, n) => a + (n.mine ? 1 : 0), 0)
    }
  return board
}

function neighbors(board, r, c) {
  const res = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nr = r + dr, nc = c + dc
      if (nr >= 0 && nr < board.length && nc >= 0 && nc < board[0].length)
        res.push(board[nr][nc])
    }
  return res
}

export function MinesweeperGame() {
  const [rows, ] = useState(9)
  const [cols, ] = useState(12)
  const [mines, ] = useState(10)
  const [board, setBoard] = useState([])
  const [firstClick, setFirstClick] = useState(true)
  const [alive, setAlive] = useState(true)
  const [won, setWon] = useState(false)
  const [flags, setFlags] = useState(mines)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [face, setFace] = useState('🙂')

  useEffect(() => {
    setBoard(Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        r, c, mine: false, rev: false, flag: false, q: false, n: 0
      }))
    ))
    setFirstClick(true)
    setAlive(true)
    setWon(false)
    setFlags(mines)
    setTimer(0)
    setTimerActive(false)
    setFace('🙂')
  }, [rows, cols, mines])

  useEffect(() => {
    if (!timerActive || !alive || won) return
    const id = setInterval(() => setTimer(t => Math.min(999, t + 1)), 1000)
    return () => clearInterval(id)
  }, [timerActive, alive, won])

  function handleCellClick(cell) {
    if (!alive || cell.rev || cell.flag) return
    if (firstClick) {
      const newBoard = createBoard(rows, cols, mines, cell)
      newBoard[cell.r][cell.c].rev = true
      setBoard(newBoard)
      setFirstClick(false)
      setTimerActive(true)
      setFace('😮')
      setTimeout(() => setFace('🙂'), 120)
      return
    }
    if (cell.mine) {
      revealAllMines(cell)
      setAlive(false)
      setFace('☠️')
      setTimerActive(false)
      return
    }
    floodReveal(cell)
    setFace('😮')
    setTimeout(() => setFace('🙂'), 120)
    checkWin()
  }

  function handleCellRightClick(e, cell) {
    e.preventDefault()
    if (!alive || cell.rev) return
    const newBoard = board.map(row => row.map(c => ({ ...c })))
    const cur = newBoard[cell.r][cell.c]
    if (!cur.flag && !cur.q) { cur.flag = true; setFlags(f => f - 1) }
    else if (cur.flag) { cur.flag = false; cur.q = true; setFlags(f => f + 1) }
    else { cur.q = false }
    setBoard(newBoard)
  }

  function floodReveal(cell) {
    const newBoard = board.map(row => row.map(c => ({ ...c })))
    const q = [cell]
    while (q.length) {
      const cur = q.shift()
      if (cur.rev || cur.flag) continue
      newBoard[cur.r][cur.c].rev = true
      if (cur.n > 0) continue
      neighbors(newBoard, cur.r, cur.c).forEach(n => {
        if (!n.rev && !n.mine) q.push(n)
      })
    }
    setBoard(newBoard)
  }

  function revealAllMines(blownCell) {
    const newBoard = board.map(row => row.map(c => ({ ...c })))
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const cell = newBoard[r][c]
        if (cell.mine) {
          cell.rev = true
          cell.blown = blownCell && cell.r === blownCell.r && cell.c === blownCell.c
        }
      }
    setBoard(newBoard)
  }

  function checkWin() {
    let unrevealed = 0
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const cell = board[r][c]
        if (!cell.rev && !cell.mine) unrevealed++
      }
    if (unrevealed === 0) {
      setWon(true)
      setAlive(false)
      setFace('😎')
      setTimerActive(false)
    }
  }

  function handleReset() {
    setBoard(Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => ({
        r, c, mine: false, rev: false, flag: false, q: false, n: 0
      }))
    ))
    setFirstClick(true)
    setAlive(true)
    setWon(false)
    setFlags(mines)
    setTimer(0)
    setTimerActive(false)
    setFace('🙂')
  }



  return (
    <div className="minesweeper-window">

      <div className="minesweeper-board-wrap">
        <div className="minesweeper-status">
          <div className="led">{String(flags).padStart(3, '0')}</div>
          <div className="face" onClick={handleReset}><span>{face}</span></div>
          <div className="led">{String(timer).padStart(3, '0')}</div>
        </div>
        <div
          className="minesweeper-grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 24px)` }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r},${c}`}
                className={
                  'cell' +
                  (cell.rev ? ' revealed' : '') +
                  (cell.flag ? ' flag' : '') +
                  (cell.q ? ' qmark' : '') +
                  (cell.mine && cell.rev ? ' mine' : '') +
                  (cell.blown ? ' blown' : '') +
                  (cell.n > 0 && cell.rev ? ` n${cell.n}` : '')
                }
                onClick={() => handleCellClick(cell)}
                onContextMenu={e => handleCellRightClick(e, cell)}
              >
                {cell.rev && cell.mine ? (cell.blown ? '💥' : '💣') : cell.rev && cell.n > 0 ? cell.n : ''}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  )
}
