import { useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
  department_id: string;
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('jx4_cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const handleCartUpdate = () => {
      const updatedCart = localStorage.getItem('jx4_cart');
      if (updatedCart) {
        setCart(JSON.parse(updatedCart));
      } else {
        setCart([]);
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, []);

  const addToCart = (product: any, quantity: number) => {
    const currentCart = JSON.parse(localStorage.getItem('jx4_cart') || '[]');
    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      currentCart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images[0],
        department_id: product.department_id
      });
    }

    localStorage.setItem('jx4_cart', JSON.stringify(currentCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeFromCart = (productId: string) => {
    const currentCart = JSON.parse(localStorage.getItem('jx4_cart') || '[]');
    const updatedCart = currentCart.filter((item: any) => item.id !== productId);
    localStorage.setItem('jx4_cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const clearCart = () => {
    localStorage.removeItem('jx4_cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, addToCart, removeFromCart, clearCart, total, itemCount };
}
