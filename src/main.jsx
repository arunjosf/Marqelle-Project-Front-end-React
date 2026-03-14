import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'

const CLIENT_ID = "1074584528500-g9k22qeaqi30fet3gq10ai1pfcs208g0.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
   <GoogleOAuthProvider clientId={CLIENT_ID}>
    <App />
    </GoogleOAuthProvider>
  </BrowserRouter>,
)
