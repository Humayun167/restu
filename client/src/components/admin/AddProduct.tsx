import React, { useState } from 'react';
import { menu_list } from '@/assets/assets';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/useProducts';
import { getCurrencySymbol } from '@/utils/currency';
import { assets } from '@/assets/assets';

interface ProductFormData {
    name: string;
    description: string;
    price: string;
    offerPrice: string;
    category: string;
    inStock: boolean;
    images: File[];
}

const AddProduct = () => {
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        description: '',
        price: '',
        offerPrice: '',
        category: 'Salad',
        inStock: true,
        images: []
    });
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { refreshProducts } = useProducts();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            setFormData(prev => ({
                ...prev,
                images: files
            }));

            // Create previews
            const previews: string[] = [];
            files.forEach((file, index) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    previews[index] = reader.result as string;
                    if (previews.length === files.length) {
                        setImagePreviews(previews);
                    }
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removeImage = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        
        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
        setImagePreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const formDataToSend = new FormData();
            
            // Create product data object that matches the server expectation
            const productData = {
                name: formData.name,
                description: [formData.description], // Server expects array
                price: parseFloat(formData.price),
                offerPrice: parseFloat(formData.offerPrice || formData.price),
                category: formData.category,
                inStock: formData.inStock
            };
            
            formDataToSend.append('productData', JSON.stringify(productData));
            
            // Append images
            formData.images.forEach((image) => {
                formDataToSend.append('images', image);
            });

            const response = await fetch('/api/product/add', {
                method: 'POST',
                credentials: 'include', // Important: sends cookies with request
                body: formDataToSend
            });

            const data = await response.json();
            
            if (data.success) {
                toast({
                    title: "Success!",
                    description: "Product has been added successfully.",
                });

                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    offerPrice: '',
                    category: 'Salad',
                    inStock: true,
                    images: []
                });
                setImagePreviews([]);
                
                // Reset file input
                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';

                // Refresh products list to show new product
                await refreshProducts();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to add product",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error('Error adding product:', error);
            toast({
                title: "Error",
                description: "Failed to add product. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Images (Max 5)
                        </label>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                    multiple
                                    max={5}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors inline-block"
                                >
                                    Choose Images
                                </label>
                                <p className="text-sm text-gray-500 mt-1">Select up to 5 images for your product</p>
                            </div>
                            
                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative">
                                            <img 
                                                src={preview} 
                                                alt={`Preview ${index + 1}`} 
                                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter product name"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter product description"
                        />
                    </div>

                    {/* Price and Offer Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                                Regular Price ({getCurrencySymbol()}) *
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Offer Price ({getCurrencySymbol()})
                            </label>
                            <input
                                type="number"
                                id="offerPrice"
                                name="offerPrice"
                                value={formData.offerPrice}
                                onChange={handleInputChange}
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Leave empty to use regular price"
                            />
                        </div>
                    </div>

                    {/* Category and Stock Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {menu_list.map((menu) => (
                                    <option key={menu.menu_name} value={menu.menu_name}>
                                        {menu.menu_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center pt-8">
                            <input
                                type="checkbox"
                                id="inStock"
                                name="inStock"
                                checked={formData.inStock}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    inStock: e.target.checked
                                }))}
                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                            />
                            <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
                                Available in Stock
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    name: '',
                                    description: '',
                                    price: '',
                                    offerPrice: '',
                                    category: 'Salad',
                                    inStock: true,
                                    images: []
                                });
                                setImagePreviews([]);
                                
                                // Reset file input
                                const fileInput = document.getElementById('image-upload') as HTMLInputElement;
                                if (fileInput) fileInput.value = '';
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Adding Product...' : 'Add Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;