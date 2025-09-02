import React, { useState } from 'react'
import './windows2000.css'
import { DesktopRoot } from './components/desktop/DesktopRoot/DesktopRoot.jsx'
import Win2kLogin from './components/win2k-login/Win2kLogin.jsx'
import PreventPullToRefresh from './utils/PreventPullMobile/PreventPullToRefresh.jsx'

function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  function handleShutdown() {
    setLoggedIn(false)
  }

  return (
    <PreventPullToRefresh>
      {!loggedIn ? (
        <Win2kLogin onLogin={() => setLoggedIn(true)} />
      ) : (
        <DesktopRoot onShutdown={handleShutdown} />
      )}
    </PreventPullToRefresh>
  )
}

export default App
