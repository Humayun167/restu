import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice } from '@/utils/currency';
import { assets } from '@/assets/assets';

interface Product {
    _id: string;
    name: string;
    description: string[];
    price: number;
    offerPrice: number;
    category: string;
    image: string[];
    inStock: boolean;
}

const ProductList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { products, loading, error, refreshProducts } = useProducts();
    const { toast } = useToast();

    const categories = ['All', 'Salad', 'Rolls', 'Deserts', 'Sandwich', 'Cake', 'Pure Veg', 'Pasta', 'Noodles'];

    // Products are automatically loaded by ProductContext on mount
    // No need to call refreshProducts here to avoid infinite loops

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.join(' ').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
            
            console.log('🔍 Delete product debug:');
            console.log('Admin logged in flag:', isAdminLoggedIn);
            console.log('Admin token present:', !!token);
            console.log('Backend URL:', backendUrl);
            console.log('Product ID:', productId);
            
            // Check if admin is logged in
            if (!isAdminLoggedIn) {
                toast({
                    title: "Error",
                    description: "Admin authentication required. Please login again.",
                    variant: "destructive",
                });
                return;
            }
            
            // Prepare headers - include token if available
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${backendUrl}/api/product/delete/${productId}`, {
                method: 'DELETE',
                credentials: 'include', // Include cookies for httpOnly token
                headers,
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                toast({
                    title: "Success!",
                    description: "Product deleted successfully.",
                });
                // Refresh the products list to reflect the deletion
                await refreshProducts();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to delete product.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast({
                title: "Error",
                description: "Failed to delete product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        toast({
            title: "Feature Coming Soon",
            description: "Product editing will be available in the next update.",
        });
    };



    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="relative">
                        <img 
                            src={assets.search_icon} 
                            alt="Search" 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                    
                    {/* Category Filter */}
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Product
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Stock Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        Loading products...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-red-500">
                                        Error: {error}
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                        No products found
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img 
                                                src={product.image[0] || '/placeholder.svg'} 
                                                alt={product.name}
                                                className="h-12 w-12 rounded-lg object-cover"
                                            />
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                    {product.description.join('. ')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        <div className="flex flex-col">
                                            <span className="text-green-600 font-semibold">{formatPrice(product.offerPrice)}</span>
                                            {product.offerPrice !== product.price && (
                                                <span className="text-gray-400 line-through text-xs">{formatPrice(product.price)}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            product.inStock 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleEdit(product)}
                                            className="text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            disabled={isLoading}
                                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found matching your criteria.</p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default ProductList;