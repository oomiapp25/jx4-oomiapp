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
    if (!product || !product.id) return { success: false, message: 'Producto inválido' };
    
    const currentCart = JSON.parse(localStorage.getItem('jx4_cart') || '[]');
    
    // Check if cart already has items from a different department
    if (currentCart.length > 0) {
      const differentDept = currentCart.some((item: any) => item.department_id !== product.department_id);
      if (differentDept) {
        return { 
          success: false, 
          message: 'Carrito ocupado con productos de otro departamento. ¿Desea finalizar esa compra primero?' 
        };
      }
    }

    const existingItemIndex = currentCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      currentCart.push({
        id: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images?.[0] || 'https://picsum.photos/seed/product/400/400',
        department_id: product.department_id
      });
    }

    localStorage.setItem('jx4_cart', JSON.stringify(currentCart));
    setCart(currentCart);
    window.dispatchEvent(new Event('cart-updated'));
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    const currentCart = JSON.parse(localStorage.getItem('jx4_cart') || '[]');
    const updatedCart = currentCart.filter((item: any) => item.id !== productId);
    localStorage.setItem('jx4_cart', JSON.stringify(updatedCart));
    setCart(updatedCart);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    const currentCart = JSON.parse(localStorage.getItem('jx4_cart') || '[]');
    const itemIndex = currentCart.findIndex((item: any) => item.id === productId);
    if (itemIndex > -1) {
      currentCart[itemIndex].quantity = newQuantity;
      localStorage.setItem('jx4_cart', JSON.stringify(currentCart));
      setCart(currentCart);
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  const clearCart = () => {
    localStorage.removeItem('jx4_cart');
    setCart([]);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount };
}
