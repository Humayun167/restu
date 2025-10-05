import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, ProductContextType } from '../types/product';

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/product/list`);
      const data = await response.json();
      
      console.log('🛒 Product fetch response:', data);
      
      if (data.success) {
        setProducts(data.products);
        console.log('✅ Products loaded:', data.products.length);
      } else {
        setError(data.message || 'Failed to fetch products');
        console.error('❌ Product fetch failed:', data.message);
      }
    } catch (err) {
      setError('Failed to fetch products');
      console.error('❌ Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      const serverProductData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        offerPrice: productData.offerPrice,
        category: productData.category,
        inStock: productData.inStock
      };
      
      formData.append('productData', JSON.stringify(serverProductData));
      
      // Note: Image handling would need to be done separately as this function
      // doesn't have access to File objects
      
      const response = await fetch('/api/product/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh products list
        await fetchProducts();
        return true;
      } else {
        setError(data.message || 'Failed to add product');
        return false;
      }
    } catch (err) {
      setError('Failed to add product');
      console.error('Error adding product:', err);
      return false;
    }
  };

  const refreshProducts = useCallback(async () => {
    await fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, []);

  const value: ProductContextType = {
    products,
    loading,
    error,
    fetchProducts,
    addProduct,
    refreshProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};