import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'frontend-virid-nu-28.vercel.app' || host === 'frontend-virid-nu-28-psi.vercel.app') {
    const target = `https://www.digitaldudesott.shop${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.replace(target);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
