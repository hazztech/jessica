// Global styles first so component styles can override them predictably
import './styles/tokens.css';
import './styles/base.css';
import './components/Modal.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Router } from './lib/router.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import App from './App.jsx';
import { initCatalog } from './services/catalog.js';
import { initGallery } from './services/gallery.js';

const render = () => createRoot(document.getElementById('root')).render(
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

Promise.all([initCatalog(), initGallery()]).finally(render);
