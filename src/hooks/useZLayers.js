import { useRef, useState, useCallback } from 'react'

export function useZLayers(initial = 150) {
  const zCounterRef = useRef(initial)
  const [folderZ, setFolderZ] = useState(110)
  const [emailZ, setEmailZ] = useState(120)
  const [compZ, setCompZ] = useState(115)
  const [binZ, setBinZ] = useState(100)
  const [confirmZ, setConfirmZ] = useState(105)
  const [blogZ, setBlogZ] = useState(125)
  const [minesweeperZ, setMinesweeperZ] = useState(130)

  const bring = useCallback((which) => {
    const next = ++zCounterRef.current
    if (which === 'folder') setFolderZ(next)
    else if (which === 'email') setEmailZ(next)
    else if (which === 'comp') setCompZ(next)
    else if (which === 'bin') setBinZ(next)
    else if (which === 'confirm') setConfirmZ(next)
    else if (which === 'blog') setBlogZ(next)
    else if (which === 'minesweeper') setMinesweeperZ(next)
  }, [])

  return { zCounterRef, bring, folderZ, emailZ, compZ, binZ, confirmZ, blogZ, minesweeperZ }
}
