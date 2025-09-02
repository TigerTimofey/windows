import React, { useState } from 'react'
import './windows2000.css'
import { DesktopRoot } from './components/desktop/DesktopRoot/DesktopRoot.jsx'
import Win2kLogin from './components/win2k-login/Win2kLogin.jsx'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  function handleShutdown() {
    setLoggedIn(false)
  }

  if (!loggedIn) {
    return <Win2kLogin onLogin={() => setLoggedIn(true)} />
  }

  return <DesktopRoot onShutdown={handleShutdown} />
}

export default App

