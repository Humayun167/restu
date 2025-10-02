import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Filter, Grid, List } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FoodItem from "@/components/FoodItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { menu_list } from "@/assets/assets";
import { useSearch } from "@/context/SearchContext";
import { useProducts } from "@/hooks/useProducts";

const AllProducts = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { searchQuery } = useSearch();
  const { products, loading, error } = useProducts();

  // Filter and sort products
  let filteredProducts = selectedCategory === "All" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  // Apply search filter if there's a search query
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.join(' ').toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "price-low":
        return (a.offerPrice || a.price) - (b.offerPrice || b.price);
      case "price-high":
        return (b.offerPrice || b.price) - (a.offerPrice || a.price);
      case "category":
        return a.category.localeCompare(b.category);
      default:
        return 0;
    }
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button and Page Title */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-3xl font-bold text-foreground">All Products</h1>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="h-8 w-8 p-0"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters and Sort */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters:</span>
                  </div>
                  
                  {/* Category Filter */}
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Categories</SelectItem>
                      {menu_list.map((menu) => (
                        <SelectItem key={menu.menu_name} value={menu.menu_name}>
                          {menu.menu_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Sort By */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="price-low">Price (Low to High)</SelectItem>
                      <SelectItem value="price-high">Price (High to Low)</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="text-sm text-muted-foreground">
                  Showing {sortedProducts.length} of {products.length} products
                  {searchQuery.trim() && (
                    <span className="ml-2 text-primary font-medium">
                      for "{searchQuery}"
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid/List */}
          {loading ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2">Loading products...</h3>
                  <p>Please wait while we fetch the latest products.</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2 text-red-500">Error loading products</h3>
                  <p className="text-red-500">{error}</p>
                </div>
              </CardContent>
            </Card>
          ) : sortedProducts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p>
                    {searchQuery.trim() 
                      ? `No products match "${searchQuery}"${selectedCategory !== "All" ? ` in ${selectedCategory}` : ''}.`
                      : `No products found in ${selectedCategory}.`}
                  </p>
                  {(searchQuery.trim() || selectedCategory !== "All") && (
                    <div className="mt-4 space-x-2">
                      {searchQuery.trim() && (
                        <Button variant="outline" onClick={() => window.location.reload()}>
                          Clear Search
                        </Button>
                      )}
                      {selectedCategory !== "All" && (
                        <Button variant="outline" onClick={() => setSelectedCategory("All")}>
                          Show All Categories
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                : "space-y-4"
            }>
              {sortedProducts.map((product) => (
                viewMode === "grid" ? (
                  <FoodItem
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    image={product.image[0] || '/placeholder.svg'}
                    price={product.offerPrice || product.price}
                    description={product.description.join('. ')}
                    category={product.category}
                  />
                ) : (
                  <Card key={product._id} className="overflow-hidden">
                    <div className="flex">
                      <div className="w-32 h-32 flex-shrink-0">
                        <Link to={`/product/${product._id}`}>
                          <img 
                            src={product.image[0] || '/placeholder.svg'} 
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </Link>
                      </div>
                      <CardContent className="flex-1 p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <Link to={`/product/${product._id}`}>
                              <h3 className="font-semibold text-lg text-foreground hover:text-primary transition-colors">
                                {product.name}
                              </h3>
                            </Link>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                              {product.description.join('. ')}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
                                {product.category}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <span className="text-primary font-bold text-xl">${product.offerPrice || product.price}</span>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                )
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AllProducts;