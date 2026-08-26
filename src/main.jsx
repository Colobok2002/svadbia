import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/cormorant-garamond/wght.css';
import '@fontsource-variable/cormorant-garamond/wght-italic.css';
import '@fontsource-variable/manrope/wght.css';
import App from './App';
import './styles.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode><App /></StrictMode>,
);
