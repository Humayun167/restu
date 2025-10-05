import React, { useState, ReactNode, useEffect, useCallback } from 'react';
import { CartContext, CartItem, CartContextType } from './CartContext';
import { cartAPI, productAPI, authAPI } from '@/lib/api';
import { useUser } from './UserContext';

interface CartProviderProps {
  children: ReactNode;
}

const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn, checkAuth } = useUser();

  // Load cart data when user is logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      loadCartData();
    } else {
      setCartItems([]);
    }
  }, [isLoggedIn, user]);

  const loadCartData = useCallback(async () => {
    try {
      setLoading(true);
      // Get fresh user data which includes cartItems
      const response = await authAPI.checkAuth();
      
      if (response.success && response.user) {
        const userCartItems = response.user.cartItems || {};
        console.log('🛒 Loading cart data:', userCartItems);
        
        // Check if cart has any items
        if (Object.keys(userCartItems).length === 0) {
          console.log('🛒 Cart is empty');
          setCartItems([]);
          return;
        }
        
        // Convert cart object to array with product details
        const cartItemsWithDetails = await Promise.all(
          Object.entries(userCartItems).map(async ([productId, quantity]) => {
            const qty = Number(quantity);
            if (qty <= 0) return null;
            
            try {
              console.log('🔍 Loading product details for:', productId);
              const productResponse = await productAPI.getProduct(productId);
              console.log('📦 Product response:', productResponse);
              
              if (productResponse.success && productResponse.data) {
                const product = productResponse.data;
                console.log('✅ Product loaded:', product.name);
                return {
                  id: productId,
                  name: product.name,
                  price: product.price,
                  image: product.image[0] || '',
                  quantity: qty
                };
              }
              console.log('❌ Product not found for ID:', productId);
              return null;
            } catch (error) {
              console.error('💥 Error loading product details for', productId, ':', error);
              return null;
            }
          })
        );
        
        setCartItems(cartItemsWithDetails.filter(item => item !== null) as CartItem[]);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (itemId: string) => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to add items to cart');
      // You could show a toast notification here
      alert('Please log in to add items to cart');
      return;
    }

    try {
      console.log('Adding item to cart:', itemId);
      
      // Create updated cart items object
      const currentCart: Record<string, number> = {};
      cartItems.forEach(item => {
        currentCart[item.id] = item.quantity;
      });
      
      // Add or increment the item
      currentCart[itemId] = (currentCart[itemId] || 0) + 1;
      
      console.log('Sending cart update:', currentCart);
      const response = await cartAPI.updateCart(currentCart);
      console.log('Cart update response:', response);
      
      if (response.success) {
        // Reload cart data to get updated state
        console.log('🔄 Reloading cart data after add...');
        await loadCartData();
        console.log('✅ Cart updated successfully');
      } else {
        console.error('Failed to add item to cart:', response.message);
        alert('Failed to add item to cart: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding item to cart. Please try again.');
      
      // Fallback: update local state if API fails
      try {
        const productResponse = await productAPI.getProduct(itemId);
        if (productResponse.success && productResponse.data) {
          const product = productResponse.data;
          
          setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === itemId);
            
            if (existingItem) {
              return prevItems.map(item =>
                item.id === itemId 
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              );
            } else {
              return [...prevItems, {
                id: itemId,
                name: product.name,
                price: product.price,
                image: product.image[0] || '',
                quantity: 1
              }];
            }
          });
        }
      } catch (fallbackError) {
        console.error('Fallback add to cart failed:', fallbackError);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isLoggedIn) {
      console.warn('User must be logged in to remove items from cart');
      alert('Please log in to modify cart items');
      return;
    }

    try {
      const currentItem = cartItems.find(item => item.id === itemId);
      if (!currentItem) return;

      console.log('Removing item from cart:', itemId);
      
      // Create updated cart items object
      const currentCart: Record<string, number> = {};
      cartItems.forEach(item => {
        currentCart[item.id] = item.quantity;
      });
      
      // Decrease or remove the item
      const newQuantity = currentCart[itemId] - 1;
      if (newQuantity <= 0) {
        delete currentCart[itemId];
      } else {
        currentCart[itemId] = newQuantity;
      }
      
      console.log('Sending cart update:', currentCart);
      const response = await cartAPI.updateCart(currentCart);
      console.log('Cart update response:', response);
      
      if (response.success) {
        // Reload cart data to get updated state
        console.log('🔄 Reloading cart data after remove...');
        await loadCartData();
        console.log('✅ Item removed successfully');
      } else {
        console.error('Failed to remove item from cart:', response.message);
        alert('Failed to remove item from cart: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Error removing item from cart. Please try again.');
      
      // Fallback: update local state if API fails
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === itemId);
        
        if (!existingItem) return prevItems;
        
        if (existingItem.quantity === 1) {
          return prevItems.filter(item => item.id !== itemId);
        } else {
          return prevItems.map(item =>
            item.id === itemId 
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
      });
    }
  };

  const getCartQuantity = (itemId: string): number => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalAmount = (): number => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = (): number => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = async () => {
    if (isLoggedIn) {
      try {
        // If you have a clear cart API endpoint, use it here
        // await cartAPI.clearCart();
        setCartItems([]);
        await loadCartData(); // Reload to sync with server
      } catch (error) {
        console.error('Error clearing cart:', error);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }
  };

  const value: CartContextType = {
    cartItems,
    addToCart,
    removeFromCart,
    getCartQuantity,
    getTotalAmount,
    getTotalItems,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;