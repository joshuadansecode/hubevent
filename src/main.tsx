import {createRoot} from 'react-dom/client';
import {BackendProvider} from './lib/backend';
import {LangProvider} from './lib/i18n';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <BackendProvider>
    <LangProvider>
      <App />
    </LangProvider>
  </BackendProvider>,
);
