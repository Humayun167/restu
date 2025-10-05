import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/currency";
import { CartItem as CartItemType } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

const CartItem = ({ item }: CartItemProps) => {
  const { addToCart, removeFromCart } = useCart();

  const handleIncrease = () => {
    addToCart(item.id);
  };

  const handleDecrease = () => {
    removeFromCart(item.id);
  };

  const handleRemoveAll = () => {
    // Remove all instances of this item
    for (let i = 0; i < item.quantity; i++) {
      removeFromCart(item.id);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-foreground truncate">
              {item.name}
            </h3>
            <p className="text-primary font-bold text-lg">
              {formatPrice(item.price)}
            </p>
            <p className="text-sm text-muted-foreground">
              Subtotal: {formatPrice(item.price * item.quantity)}
            </p>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDecrease}
                className="h-8 w-8 p-0 hover:bg-background"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <span className="font-semibold text-foreground min-w-[2rem] text-center">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleIncrease}
                className="h-8 w-8 p-0 hover:bg-background"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Remove Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAll}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;