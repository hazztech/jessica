import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { effectivePrice } from '../lib/format.js';
import { load, save } from '../lib/storage.js';

const CartContext = createContext(null);
const KEY = 'jcsa-cart-v1';

/**
 * Cart line shape (matches the future orderItems table):
 * { lineId, productId, slug, name, category, image, basePrice,
 *   options: { label: value }, personalization, addOns: [{ id, label, price }],
 *   quantity, hasReferenceUploads }
 */
export const lineUnitPrice = (line) =>
  line.basePrice + (line.addOns || []).reduce((sum, a) => sum + a.price, 0);
export const lineTotal = (line) => lineUnitPrice(line) * line.quantity;

const makeId = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load(KEY, []));
  const [isOpen, setOpen] = useState(false);

  useEffect(() => save(KEY, items), [items]);

  const addItem = useCallback(
    ({ product, quantity = 1, options = {}, personalization = '', addOns = [], hasReferenceUploads = false }) => {
      setItems((prev) => {
        // Merge identical, un-customized lines; customized lines stay separate
        const plain = !Object.keys(options).length && !personalization && !addOns.length && !hasReferenceUploads;
        if (plain) {
          const existing = prev.find((l) => l.productId === product.id && l.isPlain);
          if (existing) {
            return prev.map((l) => (l === existing ? { ...l, quantity: l.quantity + quantity } : l));
          }
        }
        return [
          ...prev,
          {
            lineId: makeId(),
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            image: product.images?.[0] || null,
            basePrice: effectivePrice(product),
            options,
            personalization,
            addOns,
            quantity,
            hasReferenceUploads,
            isPlain: plain,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((lineId, quantity) => {
    setItems((prev) =>
      prev.map((l) => (l.lineId === lineId ? { ...l, quantity: Math.max(1, Math.min(99, quantity)) } : l))
    );
  }, []);

  const removeItem = useCallback((lineId) => setItems((prev) => prev.filter((l) => l.lineId !== lineId)), []);
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(() => {
    const count = items.reduce((n, l) => n + l.quantity, 0);
    const subtotal = items.reduce((n, l) => n + lineTotal(l), 0);
    return { items, count, subtotal, isOpen, addItem, updateQuantity, removeItem, clear, openCart, closeCart };
  }, [items, isOpen, addItem, updateQuantity, removeItem, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
