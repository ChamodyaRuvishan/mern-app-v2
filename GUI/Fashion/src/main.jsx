import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import ShopContextProvider from './Context/ShopContext.jsx';
import AuthContextProvider from './Context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthContextProvider>
      <ShopContextProvider>
        <App />
      </ShopContextProvider>
    </AuthContextProvider>
  </StrictMode>,
);