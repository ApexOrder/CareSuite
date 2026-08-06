import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './mobile.css';
import { enableClientOnlyMode } from './clientOnlyMode';
import { enableSimplifiedClientRegistration } from './simplifiedClientRegistration';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

enableClientOnlyMode();
enableSimplifiedClientRegistration();
