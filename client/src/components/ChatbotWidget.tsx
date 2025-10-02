import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, X, Send, Trash2, Plus, ShoppingCart } from 'lucide-react';
import { useChatbot } from '@/hooks/useChatbot';
import { useCart } from '@/hooks/useCart';
import { Message } from '@/context/chatbotTypes';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const CartButton = () => {
  const { cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleViewCart = () => {
    window.location.href = '/cart';
  };

  return (
    <Button
      onClick={handleViewCart}
      variant="ghost"
      size="sm"
      className="h-8 px-2 relative"
    >
      <ShoppingCart className="h-4 w-4" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Button>
  );
};

const ChatbotWidget = () => {
  const { isOpen, toggleChat } = useChatbot();

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="animate-in slide-in-from-bottom-5 duration-300">
          <ChatWindow />
        </div>
      )}
    </>
  );
};

const ChatWindow = () => {
  const { messages, isTyping, sendMessage, clearChat } = useChatbot();
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      await sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-background border border-border rounded-lg shadow-xl z-40 flex flex-col md:w-96">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-primary/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">Menu Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <CartButton />
          <Button
            onClick={clearChat}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "What's good today?",
              "Got any veggie stuff?",
              "Something sweet?",
              "What's cheap?"
            ].map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => sendMessage(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What are you craving?"
            className="flex-1"
            disabled={isTyping}
          />
          <Button 
            onClick={handleSendMessage} 
            size="icon"
            disabled={isTyping || !inputMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message }: { message: Message }) => {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`p-3 rounded-lg ${
            message.isUser
              ? 'bg-primary text-primary-foreground ml-4'
              : 'bg-muted text-muted-foreground mr-4'
          }`}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        
        {/* Product Suggestions */}
        {message.products && message.products.length > 0 && (
          <div className="mt-3 space-y-2 mr-4">
            {message.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

interface Product {
  _id: string;
  name: string;
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
}

const ProductCard = ({ product }: { product: Product }) => {
  const formatPrice = (price: number) => `৳${price}`;
  const { addToCart, loading } = useCart();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAdding(true);
    
    try {
      await addToCart(product._id);
      toast({
        title: "Added to cart!",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="p-3 hover:shadow-md transition-all duration-200 hover:border-primary/50 group">
      <div className="flex gap-3">
        <div className="relative overflow-hidden rounded-md">
          <img
            src={product.image[0]}
            alt={product.name}
            className="w-16 h-16 object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
            {product.name}
          </h4>
          <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">
                {formatPrice(product.offerPrice)}
              </span>
              {product.offerPrice < product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 hover:bg-primary hover:text-primary-foreground"
              onClick={handleAddToCart}
              disabled={isAdding || loading}
            >
              {isAdding ? (
                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const TypingIndicator = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted text-muted-foreground p-3 rounded-lg mr-4">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotWidget;