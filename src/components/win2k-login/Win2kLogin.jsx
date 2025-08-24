import { useState } from "react";
import './Win2kLogin.css'
import winLogo from '../../assets/win7/images/win-logo.png'

export default function Win2kLogin({ onLogin }) {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (onLogin) onLogin();
  }

  return (
    <div className="win2k-login-bg">
      <div className="win2k-login-container">
        <div className="win2k-login-titlebar">
          <div className="win2k-login-titlebar-left">
        
            <span className="win2k-login-title">Log On to Windows</span>
          </div>
     
        </div>
        <div className="win2k-login-content">
          <div className="win2k-login-logo-img-wrap">
            <img src={winLogo} alt="Windows Logo" className="win2k-login-logo-img" />
          </div>
          
          <form onSubmit={handleSubmit} className="win2k-login-form">
            <div className="win2k-login-row">
              <label>User name:</label>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus

              />
            </div>
            <div className="win2k-login-row">
              <label>Password:</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="win2k-login-row-checkbox">
              <input
                id="showpw"
                type="checkbox"
                onChange={e => setShowPassword(e.target.checked)}
              />
              <label htmlFor="showpw">Show password</label>
            </div>
            <div className="win2k-login-btn-row">
              <button type="submit" className="win2k-login-btn">OK</button>
              <button type="button" className="win2k-login-btn" onClick={() => { setUsername(""); setPassword(""); }}>Cancel</button>
            </div>
          </form>
          <div className="win2k-login-statusbar">
            <div>Fake Windows Cretead by @Timofey</div>
            <div>© 2000 Microsoft</div>
          </div>
        </div>
      </div>
    </div>
  );
}
