
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // TODO-ben : Re-enable strict mode after writing generators
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)
