import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './lib/router.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import App from './App.jsx';
import './styles/tokens.css';
import './styles/base.css';
import './components/Modal.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <ToastProvider>
        <WishlistProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </WishlistProvider>
      </ToastProvider>
    </Router>
  </StrictMode>
);
