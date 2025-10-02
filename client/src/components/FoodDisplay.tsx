import FoodItem from "./FoodItem";
import { useSearch } from "@/context/SearchContext";
import { useProducts } from "@/hooks/useProducts";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FoodDisplayProps {
  selectedCategory: string;
}

const FoodDisplay = ({ selectedCategory }: FoodDisplayProps) => {
  const { searchQuery } = useSearch();
  const { products, loading, error } = useProducts();
  
  // Filter products based on selected category and search query
  let filteredFoods = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Apply search filter if there's a search query
  if (searchQuery.trim()) {
    filteredFoods = filteredFoods.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.join(' ').toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  return (
    <section className="py-12 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {searchQuery.trim() 
              ? `Search Results for "${searchQuery}"` 
              : selectedCategory === "All" 
                ? "All Dishes" 
                : `${selectedCategory} Dishes`}
          </h2>
          <p className="text-muted-foreground">
            {filteredFoods.length} {filteredFoods.length === 1 ? 'dish' : 'dishes'} 
            {searchQuery.trim() ? ' found' : ' available'}
            {searchQuery.trim() && selectedCategory !== "All" ? ` in ${selectedCategory}` : ''}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg text-red-500">
              Error loading products: {error}
            </p>
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchQuery.trim() 
                ? `No dishes found matching "${searchQuery}"${selectedCategory !== "All" ? ` in ${selectedCategory}` : ''}.`
                : 'No dishes found in this category.'}
            </p>
            {searchQuery.trim() && (
              <p className="text-muted-foreground text-sm mt-2">
                Try searching with different keywords or browse all categories.
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFoods.map((product) => (
                <FoodItem
                  key={product._id}
                  id={product._id}
                  name={product.name}
                  image={product.image[0] || '/placeholder.svg'} // Use first image or placeholder
                  price={product.offerPrice || product.price}
                  description={product.description.join('. ')} // Join description array
                  category={product.category}
                />
              ))}
            </div>
            
            {/* View All Products Button */}
            {!searchQuery.trim() && (
              <div className="text-center mt-8">
                <Link to="/products">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    View All Products ({products.length} items)
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FoodDisplay;