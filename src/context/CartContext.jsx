import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save } from '../lib/storage.js';

const CartContext = createContext(null);
const KEY = 'jcsa-cart-v2';

/**
 * Cart line (maps to the future orderItems table):
 * {
 *   lineId, productId, slug, name, category, image,
 *   basePrice, unitPrice, quantity,
 *   selections: { fieldId: value },          // raw answers, used by "Edit"
 *   summary: [{ fieldId, label, value }],    // readable selections
 *   charges: [{ label, amount }],            // paid options
 *   uploadCount, signature
 * }
 * Lines with the same signature (identical customization) merge;
 * anything different becomes its own line.
 */
export const lineTotal = (line) => line.unitPrice * line.quantity;

const makeId = () =>
  (crypto.randomUUID && crypto.randomUUID()) || `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const clampQty = (n) => Math.max(1, Math.min(99, Math.round(n) || 1));

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => load(KEY, []));
  const [isOpen, setOpen] = useState(false);

  useEffect(() => save(KEY, items), [items]);

  /** Add a line built by buildCartLine(); merges only identical configurations */
  const addItem = useCallback((line) => {
    setItems((prev) => {
      const same = prev.find((l) => l.signature === line.signature);
      if (same) return prev.map((l) => (l === same ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l));
      return [...prev, { ...line, lineId: makeId(), quantity: clampQty(line.quantity) }];
    });
  }, []);

  /** Replace a line after editing its customization */
  const updateLine = useCallback((lineId, line) => {
    setItems((prev) => {
      const twin = prev.find((l) => l.lineId !== lineId && l.signature === line.signature);
      if (twin) {
        // edited into an identical twin — combine them
        return prev
          .filter((l) => l.lineId !== lineId)
          .map((l) => (l === twin ? { ...l, quantity: clampQty(l.quantity + line.quantity) } : l));
      }
      return prev.map((l) => (l.lineId === lineId ? { ...line, lineId, quantity: clampQty(line.quantity) } : l));
    });
  }, []);

  const updateQuantity = useCallback((lineId, quantity) => {
    setItems((prev) => prev.map((l) => (l.lineId === lineId ? { ...l, quantity: clampQty(quantity) } : l)));
  }, []);

  const removeItem = useCallback((lineId) => setItems((prev) => prev.filter((l) => l.lineId !== lineId)), []);
  const getLine = useCallback((lineId) => items.find((l) => l.lineId === lineId) || null, [items]);
  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo(() => {
    const count = items.reduce((n, l) => n + l.quantity, 0);
    const subtotal = items.reduce((n, l) => n + lineTotal(l), 0);
    return { items, count, subtotal, isOpen, addItem, updateLine, updateQuantity, removeItem, getLine, clear, openCart, closeCart };
  }, [items, isOpen, addItem, updateLine, updateQuantity, removeItem, getLine, clear, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
