import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { applyStoredTheme } from './lib/theme'

// Apply the user's saved theme before React mounts so the very first frame
// already has the right colours — no white-then-dark flash.
applyStoredTheme()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
