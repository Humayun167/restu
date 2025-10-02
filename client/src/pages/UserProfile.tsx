import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, MapPin, Camera, Edit2, Save, X, Package, Heart, Settings, LogOut } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUser } from "@/context/UserContext";
import { orderAPI, Order } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/utils/currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const UserProfile = () => {
  const { user, logout, isLoggedIn, loading } = useUser();
  const navigate = useNavigate();

  // Debug user data
  console.log('👤 UserProfile - User data:', user);
  console.log('🔐 UserProfile - Is logged in:', isLoggedIn);
  console.log('⏳ UserProfile - Loading:', loading);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    bio: "",
    avatar: user?.avatar || user?.profileImage || "",
    joinDate: "Recently joined"
  });

  // Profile picture upload states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const [editForm, setEditForm] = useState(profile);

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      const avatarUrl = user.avatar || user.profileImage || "";
      setProfile(prevProfile => ({
        ...prevProfile,
        name: user.name || "",
        email: user.email || "",
        avatar: avatarUrl
      }));
      setEditForm(prevForm => ({
        ...prevForm,
        name: user.name || "",
        email: user.email || "",  
        avatar: avatarUrl
      }));
    }
  }, [user]);

  // Real order history state
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch user orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!isLoggedIn) return;
      
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        console.log('📦 Fetching user orders...');
        const response = await orderAPI.getUserOrders();
        
        if (response.success && response.orders) {
          console.log('✅ Orders loaded:', response.orders.length);
          setOrderHistory(response.orders);
        } else {
          console.error('❌ Failed to load orders:', response.message);
          setOrdersError(response.message || 'Failed to load orders');
        }
      } catch (error) {
        console.error('❌ Error fetching orders:', error);
        setOrdersError('Failed to connect to server');
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order history"
        });
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchUserOrders();
  }, [isLoggedIn, toast]);

  // Mock favorite items
  const favoriteItems = [
    { id: "1", name: "Greek Salad", price: 12, image: "/api/placeholder/100/100" },
    { id: "5", name: "Lasagna Rolls", price: 14, image: "/api/placeholder/100/100" },
    { id: "9", name: "Ripple Ice Cream", price: 14, image: "/api/placeholder/100/100" }
  ];

  const handleSave = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Profile picture upload handlers
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select an image file"
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Please select an image smaller than 5MB"
      });
      return;
    }

    try {
      setUploadingAvatar(true);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('avatar', file);

      try {
        // Upload to server
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/upload-avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // Update profile with new avatar URL from server
          const newAvatarUrl = data.avatarUrl;
          setProfile(prev => ({ ...prev, avatar: newAvatarUrl }));
          setEditForm(prev => ({ ...prev, avatar: newAvatarUrl }));
          setPreviewAvatar(null);

          toast({
            title: "Success",
            description: "Profile picture updated successfully"
          });
        } else {
          throw new Error(data.message || 'Upload failed');
        }
      } catch (uploadError) {
        console.error('Server upload failed, using preview:', uploadError);
        
        // Fallback: Keep the preview as the new avatar (temporary until server is fixed)
        if (previewAvatar) {
          setProfile(prev => ({ ...prev, avatar: previewAvatar }));
          setEditForm(prev => ({ ...prev, avatar: previewAvatar }));
          setPreviewAvatar(null);

          toast({
            title: "Preview Updated",
            description: "Profile picture preview updated. Server upload will be available soon."
          });
        } else {
          throw uploadError;
        }
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      setPreviewAvatar(null);
      
      // More detailed error message
      let errorMessage = "Failed to update profile picture. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: errorMessage
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const triggerAvatarUpload = () => {
    const input = document.getElementById('avatar-upload') as HTMLInputElement;
    input?.click();
  };





  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "out-for-delivery":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getOrderItemNames = (orderItems: Order['orderItems']) => {
    return orderItems.map(item => item.name).join(', ');
  };

  const capitalizeStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background pt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background pt-16">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button and Page Title */}
          <div className="flex items-center gap-4 mb-8">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  {/* Profile Picture */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="relative mb-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage 
                          src={previewAvatar || profile.avatar} 
                          alt={profile.name} 
                        />
                        <AvatarFallback className="text-2xl">
                          {profile.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Loading overlay */}
                      {uploadingAvatar && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        </div>
                      )}
                      
                      {/* Camera button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full p-2 h-8 w-8"
                        onClick={triggerAvatarUpload}
                        disabled={uploadingAvatar}
                        title="Upload profile picture (Max 5MB, JPG/PNG)"
                      >
                        <Camera className="w-3 h-3" />
                      </Button>
                      
                      {/* Hidden file input */}
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{profile.name}</h2>
                    <p className="text-muted-foreground">{profile.email}</p>
                    <Badge variant="secondary" className="mt-2">
                      Member since {profile.joinDate}
                    </Badge>
                    {uploadingAvatar && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Uploading image...
                      </p>
                    )}
                    

                  </div>

                  <Separator className="my-6" />

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Orders</span>
                      <span className="font-semibold">{orderHistory.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Favorite Items</span>
                      <span className="font-semibold">{favoriteItems.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Spent</span>
                      <span className="font-semibold">
                        {formatPrice(orderHistory.reduce((sum, order) => sum + order.total, 0))}
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/cart">
                        <Package className="w-4 h-4 mr-2" />
                        View Cart
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/addresses">
                        <MapPin className="w-4 h-4 mr-2" />
                        Manage Addresses
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="profile">Profile Info</TabsTrigger>
                  <TabsTrigger value="orders">Order History</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                {/* Profile Info Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Personal Information</CardTitle>
                      {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                          <Edit2 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button onClick={handleSave} size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button onClick={handleCancel} variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="name"
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center p-3 bg-muted rounded-md">
                              <User className="w-4 h-4 mr-2 text-muted-foreground" />
                              {profile.name}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center p-3 bg-muted rounded-md">
                              <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                              {profile.email}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          {isEditing ? (
                            <Input
                              id="phone"
                              value={editForm.phone}
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center p-3 bg-muted rounded-md">
                              <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                              {profile.phone}
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          {isEditing ? (
                            <Input
                              id="address"
                              value={editForm.address}
                              onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                            />
                          ) : (
                            <div className="flex items-center p-3 bg-muted rounded-md">
                              <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                              {profile.address}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        {isEditing ? (
                          <Textarea
                            id="bio"
                            rows={3}
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                          />
                        ) : (
                          <div className="p-3 bg-muted rounded-md">
                            {profile.bio}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Order History Tab */}
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>Order History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="flex items-center justify-center p-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-3">Loading orders...</span>
                        </div>
                      ) : ordersError ? (
                        <div className="text-center p-8">
                          <p className="text-red-500 mb-4">{ordersError}</p>
                          <Button 
                            variant="outline" 
                            onClick={() => window.location.reload()}
                          >
                            Try Again
                          </Button>
                        </div>
                      ) : orderHistory.length === 0 ? (
                        <div className="text-center p-8">
                          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-500 mb-4">No orders found</p>
                          <Link to="/">
                            <Button>Start Shopping</Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orderHistory.map((order) => (
                            <div key={order._id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatOrderDate(order.createdAt.toString())}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <Badge className={getStatusColor(order.orderStatus)}>
                                    {capitalizeStatus(order.orderStatus)}
                                  </Badge>
                                  <p className="text-lg font-bold mt-1">{formatPrice(order.total)}</p>
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                <strong>Items ({order.orderItems.length}):</strong> {getOrderItemNames(order.orderItems)}
                              </div>
                              <div className="mt-2 text-xs text-muted-foreground">
                                Payment: {order.paymentMethod.toUpperCase()} • Status: {order.paymentStatus}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Favorites Tab */}
                <TabsContent value="favorites">
                  <Card>
                    <CardHeader>
                      <CardTitle>Favorite Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {favoriteItems.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold">{item.name}</h3>
                              <p className="text-primary font-bold">{formatPrice(item.price)}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;