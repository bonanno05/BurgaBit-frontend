import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SesionProveedor } from './contexto/SesionProveedor';
import { BrowserRouter } from 'react-router';

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SesionProveedor>
        <App />
      </SesionProveedor>
    </BrowserRouter>
  </StrictMode>,
)