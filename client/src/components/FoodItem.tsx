import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { assets } from "@/assets/assets";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/currency";

interface FoodItemProps {
  id: string;
  name: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

const FoodItem = ({ id, name, image, price, description, category }: FoodItemProps) => {
  const { addToCart, removeFromCart, getCartQuantity } = useCart();
  const itemCount = getCartQuantity(id);

  const handleAddItem = () => {
    console.log('🍽️ Adding item to cart:', { id, name, price });
    addToCart(id);
  };

  const handleRemoveItem = () => {
    removeFromCart(id);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <Link to={`/product/${id}`}>
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
          />
        </Link>
        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium">4.5</span>
          </div>
        </div>
        {itemCount === 0 ? (
          <button
            onClick={handleAddItem}
            className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <img src={assets.add_icon_green} alt="Add" className="w-5 h-5" />
          </button>
        ) : (
          <div className="absolute bottom-2 right-2 bg-white rounded-full flex items-center gap-2 px-3 py-2 shadow-lg">
            <button
              onClick={handleRemoveItem}
              className="hover:scale-110 transition-transform"
            >
              <img src={assets.remove_icon_red} alt="Remove" className="w-4 h-4" />
            </button>
            <span className="font-medium text-sm min-w-[20px] text-center">{itemCount}</span>
            <button
              onClick={handleAddItem}
              className="hover:scale-110 transition-transform"
            >
              <img src={assets.add_icon_green} alt="Add" className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/product/${id}`}>
            <h3 className="font-semibold text-lg text-foreground truncate hover:text-primary transition-colors cursor-pointer">{name}</h3>
          </Link>
          <span className="text-primary font-bold text-lg">{formatPrice(price)}</span>
        </div>
        
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs bg-secondary px-2 py-1 rounded-full text-secondary-foreground">
            {category}
          </span>
          {itemCount > 0 && (
            <span className="text-xs text-primary font-medium">
              Total: {formatPrice(price * itemCount)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FoodItem;