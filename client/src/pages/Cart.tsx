import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ShoppingBag, Truck, CreditCard, Shield, MapPin, Clock } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/currency";
import { useUser } from "@/context/UserContext";
import CartItem from "@/components/CartItem";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { orderAPI, addressAPI, Address } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Cart = () => {
  const { cartItems, getTotalAmount, getTotalItems, clearCart } = useCart();
  const { user, isLoggedIn } = useUser();
  const { toast } = useToast();
  const totalAmount = getTotalAmount();
  const deliveryFee = totalAmount > 50 ? 0 : 5.99;
  const tax = totalAmount * 0.08; // 8% tax
  const finalTotal = totalAmount + deliveryFee + tax;

  const [showCheckout, setShowCheckout] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  
  // Address selection states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<{
    orderNumber: string;
    estimatedDeliveryTime: string;
  } | null>(null);

  // Fetch saved addresses when checkout modal opens
  useEffect(() => {
    if (showCheckout && isLoggedIn) {
      fetchSavedAddresses();
    }
  }, [showCheckout, isLoggedIn]);

  const fetchSavedAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await addressAPI.getAddresses();
      if (response.success && response.addresses) {
        setSavedAddresses(response.addresses);
        // Auto-select default address if available
        const defaultAddress = response.addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id!);
          setUseNewAddress(false);
        } else if (response.addresses.length > 0) {
          setSelectedAddressId(response.addresses[0]._id!);
          setUseNewAddress(false);
        } else {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setAddressesLoading(false);
    }
  };

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });

  const handleInputChange = (field: string, value: string) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    // If using a saved address, check if one is selected
    if (!useNewAddress) {
      if (!selectedAddressId) {
        toast({
          title: "Address Required",
          description: "Please select a delivery address",
          variant: "destructive"
        });
        return false;
      }
      return true;
    }
    
    // If using new address, validate the form fields
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof typeof shippingAddress]) {
        toast({
          title: "Missing Information",
          description: `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to place an order",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) return;

    if (paymentMethod !== "cod") {
      toast({
        title: "Payment Method",
        description: "Currently only Cash on Delivery is supported",
        variant: "destructive"
      });
      return;
    }

    setIsOrdering(true);

    try {
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));

      console.log('📦 Placing COD order with data:', {
        items: orderItems,
        address: shippingAddress
      });

      // Get the address to use for the order
      let addressToUse;
      if (useNewAddress) {
        addressToUse = shippingAddress;
      } else {
        const selectedAddress = savedAddresses.find(addr => addr._id === selectedAddressId);
        if (!selectedAddress) {
          toast({
            title: "Address Required",
            description: "Please select a delivery address",
            variant: "destructive"
          });
          return;
        }
        addressToUse = {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zipCode: selectedAddress.zipCode,
          country: selectedAddress.country
        };
      }

      const response = await orderAPI.placeOrderCOD({
        items: orderItems,
        address: addressToUse
      });

      console.log('📥 COD order response:', response);

      if (response.success) {
        setOrderSuccess({
          orderNumber: response.orderNumber || "N/A",
          estimatedDeliveryTime: new Date(Date.now() + 40 * 60 * 1000).toLocaleTimeString()
        });
        setShowCheckout(false);
        toast({
          title: "Order Placed Successfully!",
          description: `Order #${response.orderNumber} has been placed`,
        });
      } else {
        toast({
          title: "Order Failed",
          description: response.message || "Failed to place order",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: "Order Failed", 
        description: "An error occurred while placing your order",
        variant: "destructive"
      });
    } finally {
      setIsOrdering(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">Order Placed Successfully!</h1>
                <p className="text-muted-foreground mb-6">
                  Thank you for your order. Your food is being prepared and will be delivered soon.
                </p>
                <div className="bg-secondary rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Order Number:</span>
                    <span className="font-bold text-primary">{orderSuccess.orderNumber}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Estimated Delivery:</span>
                    <span className="font-bold">{orderSuccess.estimatedDeliveryTime}</span>
                  </div>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Estimated delivery time: 30-40 minutes</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>Payment: Cash on Delivery</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Link to="/" className="flex-1">
                    <Button variant="outline" className="w-full">Continue Shopping</Button>
                  </Link>
                  <Button 
                    onClick={() => setOrderSuccess(null)} 
                    className="flex-1"
                  >
                    Place Another Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const EmptyCart = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-secondary rounded-full flex items-center justify-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-4">Your cart is empty</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Looks like you haven't added any delicious items to your cart yet. 
        Start exploring our menu and discover amazing flavors!
      </p>
      <Link to="/">
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
          Browse Menu
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Menu
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
              <p className="text-muted-foreground">
                {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
          </div>

          {cartItems.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Order Items</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCart}
                    className="text-destructive hover:text-destructive"
                  >
                    Clear Cart
                  </Button>
                </div>
                
                {cartItems.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-xl">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Pricing Breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal ({getTotalItems()} items)</span>
                        <span className="font-medium">{formatPrice(totalAmount)}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span className={`font-medium ${deliveryFee === 0 ? 'text-green-600' : ''}`}>
                          {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax</span>
                        <span className="font-medium">{formatPrice(tax)}</span>
                      </div>
                      
                      {totalAmount < 50 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <p className="text-sm text-orange-800">
                            Add {formatPrice(50 - totalAmount)} more for free delivery!
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />
                    
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(finalTotal)}</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Truck className="w-4 h-4" />
                        <span>Fast delivery in 25-30 mins</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        <span>100% secure payment</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Multiple payment options</span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg"
                      size="lg"
                      onClick={() => setShowCheckout(true)}
                      disabled={!isLoggedIn}
                    >
                      {isLoggedIn ? "Proceed to Checkout" : "Login to Checkout"}
                    </Button>
                    
                    {/* Continue Shopping */}
                    <Link to="/">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        size="lg"
                      >
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Checkout Modal */}
          {showCheckout && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    Complete Your Order
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowCheckout(false)}
                    >
                      ✕
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Address Selection */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Delivery Address
                    </h3>
                    
                    {addressesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-3">Loading addresses...</span>
                      </div>
                    ) : savedAddresses.length > 0 ? (
                      <div className="space-y-4">
                        {/* Address Selection Options */}
                        <RadioGroup 
                          value={useNewAddress ? "new" : selectedAddressId} 
                          onValueChange={(value) => {
                            if (value === "new") {
                              setUseNewAddress(true);
                              setSelectedAddressId("");
                            } else {
                              setUseNewAddress(false);
                              setSelectedAddressId(value);
                            }
                          }}
                        >
                          {/* Saved Addresses */}
                          {savedAddresses.map((address) => (
                            <div key={address._id} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                              <RadioGroupItem value={address._id!} id={address._id!} className="mt-1" />
                              <Label htmlFor={address._id!} className="flex-1 cursor-pointer">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{address.fullName}</span>
                                    {address.isDefault && (
                                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Default</span>
                                    )}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {address.address}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {address.city}, {address.state} {address.zipCode}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    📞 {address.phone}
                                  </div>
                                </div>
                              </Label>
                            </div>
                          ))}
                          
                          {/* New Address Option */}
                          <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-gray-50">
                            <RadioGroupItem value="new" id="new-address" className="mt-1" />
                            <Label htmlFor="new-address" className="flex-1 cursor-pointer">
                              <div className="space-y-1">
                                <div className="font-medium">Use a new address</div>
                                <div className="text-sm text-gray-600">Enter a different delivery address</div>
                              </div>
                            </Label>
                          </div>
                        </RadioGroup>
                        
                        {/* Quick Actions */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open('/addresses', '_blank')}
                            className="text-xs"
                          >
                            Manage Addresses
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 border rounded-lg bg-gray-50">
                        <p className="text-gray-600 mb-2">No saved addresses found</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => window.open('/addresses', '_blank')}
                        >
                          Add New Address
                        </Button>
                      </div>
                    )}
                    
                    {/* New Address Form (shown when "Use new address" is selected) */}
                    {useNewAddress && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                        <h4 className="font-medium mb-4">Enter New Address</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              value={shippingAddress.fullName}
                              onChange={(e) => handleInputChange('fullName', e.target.value)}
                              placeholder="John Doe"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              value={shippingAddress.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              placeholder="+1 (555) 123-4567"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Street Address *</Label>
                            <Input
                              id="address"
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              placeholder="123 Main Street, Apt 4B"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City *</Label>
                            <Input
                              id="city"
                              value={shippingAddress.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="New York"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={shippingAddress.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="NY"
                            />
                          </div>
                          <div>
                            <Label htmlFor="zipCode">ZIP Code *</Label>
                            <Input
                              id="zipCode"
                              value={shippingAddress.zipCode}
                              onChange={(e) => handleInputChange('zipCode', e.target.value)}
                              placeholder="10001"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country</Label>
                            <Input
                              id="country"
                              value={shippingAddress.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              placeholder="USA"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Payment Method */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Method
                    </h3>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <Label htmlFor="cod" className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Cash on Delivery</p>
                              <p className="text-sm text-muted-foreground">Pay when your order arrives</p>
                            </div>
                            <div className="text-green-600 font-medium">Available</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border rounded-lg opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <Label htmlFor="card" className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Credit/Debit Card</p>
                              <p className="text-sm text-muted-foreground">Pay securely online</p>
                            </div>
                            <div className="text-muted-foreground text-sm">Coming Soon</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div>
                    <h3 className="font-semibold mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>{formatPrice(totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-primary">{formatPrice(finalTotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Button */}
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCheckout(false)}
                      className="flex-1"
                    >
                      Back to Cart
                    </Button>
                    <Button 
                      onClick={handlePlaceOrder}
                      disabled={isOrdering}
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      {isOrdering ? "Placing Order..." : `Place Order - ${formatPrice(finalTotal)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;