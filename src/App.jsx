import React, { useState } from 'react'
import './windows2000.css'
import './App.css'
import { DesktopRoot } from './components/desktop/DesktopRoot/DesktopRoot.jsx'
import Win2kLogin from './components/win2k-login/Win2kLogin.jsx'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  if (!loggedIn) {
    return <Win2kLogin onLogin={() => setLoggedIn(true)} />
  }

  return <DesktopRoot />
}

export default App
