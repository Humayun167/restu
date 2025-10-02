export interface Product {
  _id: string;
  name: string;
  description: string[];
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}