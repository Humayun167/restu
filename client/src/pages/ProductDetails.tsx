import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { assets } from '@/assets/assets';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/currency';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { products, loading, error } = useProducts();
    const { addToCart, removeFromCart, getCartQuantity } = useCart();
    
    // Find the product by id
    const product = products.find(item => item._id === id);
    
    const itemCount = getCartQuantity(id || '');
    
    // Handle loading state
    if (loading) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Loading product...</h1>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
    
    // Handle error state
    if (error) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4 text-red-500">Error loading product</h1>
                        <p className="text-red-500 mb-4">{error}</p>
                        <Link to="/" className="text-primary hover:underline">
                            Return to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }
    
    // Handle product not found
    if (!product) {
        return (
            <>
                <Header />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                        <Link to="/" className="text-primary hover:underline">
                            Return to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    const handleAddItem = () => {
        addToCart(product._id);
    };

    const handleRemoveItem = () => {
        removeFromCart(product._id);
    };

    return (
        <>
            <Header />
            <div className="min-h-screen bg-background">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
                        <span>/</span>
                        <span className="capitalize">{product.category}</span>
                        <span>/</span>
                        <span className="text-primary font-medium">{product.name}</span>
                    </div>

                    {/* Back Button */}
                    <Link 
                        to="/" 
                        className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Menu
                    </Link>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Product Image */}
                        <div className="space-y-4">
                            <Card className="overflow-hidden">
                                <div className="aspect-square">
                                    <img
                                        src={product.image[0] || '/placeholder.svg'}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </Card>
                            {/* Additional images if available */}
                            {product.image.length > 1 && (
                                <div className="flex gap-2 overflow-x-auto">
                                    {product.image.slice(1).map((img, index) => (
                                        <div key={index} className="flex-shrink-0">
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 2}`}
                                                className="w-20 h-20 object-cover rounded-md border"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center">
                                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        <span className="ml-1 font-medium">4.5</span>
                                    </div>
                                    <span className="text-muted-foreground">•</span>
                                    <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                                        {product.category}
                                    </span>
                                    {!product.inStock && (
                                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full">
                                            Out of Stock
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center gap-3">
                                    {product.offerPrice !== product.price && (
                                        <p className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</p>
                                    )}
                                    <p className="text-3xl font-bold text-primary">{formatPrice(product.offerPrice)}</p>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Inclusive of all taxes</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Description</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {product.description.join('. ')}
                                </p>
                            </div>

                            {/* Add to Cart Section */}
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold mb-1">Quantity</p>
                                            <p className="text-sm text-muted-foreground">
                                                {itemCount > 0 ? `${itemCount} item${itemCount > 1 ? 's' : ''} in cart` : 'Not in cart'}
                                            </p>
                                        </div>
                                        
                                        {itemCount === 0 ? (
                                            <Button 
                                                onClick={handleAddItem} 
                                                disabled={!product.inStock}
                                                className="flex items-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={handleRemoveItem}
                                                    className="h-10 w-10"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="font-semibold text-lg min-w-[2rem] text-center">
                                                    {itemCount}
                                                </span>
                                                <Button
                                                    size="icon"
                                                    onClick={handleAddItem}
                                                    className="h-10 w-10"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {itemCount > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold">Total:</span>
                                                <span className="text-xl font-bold text-primary">
                                                    {formatPrice(product.offerPrice * itemCount)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <Link to="/cart" className="flex-1">
                                    <Button variant="outline" className="w-full">
                                        View Cart
                                    </Button>
                                </Link>
                                <Button className="flex-1">
                                    Order Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProductDetails;