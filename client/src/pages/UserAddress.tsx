import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit2, Trash2, MapPin, Phone, User, Home, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUser } from "@/context/UserContext";
import { addressAPI, Address as APIAddress } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Use the Address interface from api.ts
type Address = APIAddress;

const UserAddress = () => {
  const { user, isLoggedIn, loading } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<Address>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA"
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      navigate('/');
    }
  }, [loading, isLoggedIn, navigate]);

  const fetchAddresses = useCallback(async () => {
    setAddressesLoading(true);
    try {
      console.log('📍 Fetching user addresses...');
      const response = await addressAPI.getAddresses();
      
      if (response.success && response.addresses) {
        console.log('✅ Addresses loaded:', response.addresses.length);
        setAddresses(response.addresses);
      } else {
        console.error('❌ Failed to load addresses:', response.message);
        toast({
          title: "Error",
          description: response.message || "Failed to load addresses",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error fetching addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive"
      });
    } finally {
      setAddressesLoading(false);
    }
  }, [toast]);

  // Fetch addresses on component mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchAddresses();
    }
  }, [isLoggedIn, fetchAddresses]);

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "USA"
    });
  };

  const handleAddAddress = async () => {
    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📍 Adding new address:', formData);
      const response = await addressAPI.addAddress({
        ...formData,
        isDefault: addresses.length === 0 // First address is default
      });
      
      if (response.success && response.address) {
        console.log('✅ Address added successfully');
        setAddresses([...addresses, response.address]);
        setIsAddDialogOpen(false);
        resetForm();
        
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error adding address:', error);
      toast({
        title: "Error",
        description: "Failed to add address",
        variant: "destructive"
      });
    }
  };

  const handleEditAddress = async () => {
    if (!editingAddress) return;

    if (!formData.fullName || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📍 Updating address:', editingAddress._id, formData);
      const response = await addressAPI.updateAddress(editingAddress._id!, {
        ...formData,
        isDefault: editingAddress.isDefault
      });
      
      if (response.success) {
        console.log('✅ Address updated successfully');
        const updatedAddresses = addresses.map(addr => 
          addr._id === editingAddress._id 
            ? { ...formData, _id: editingAddress._id, isDefault: editingAddress.isDefault }
            : addr
        );
        
        setAddresses(updatedAddresses);
        setIsEditDialogOpen(false);
        setEditingAddress(null);
        resetForm();
        
        toast({
          title: "Success",
          description: "Address updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error updating address:', error);
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (addresses.find(addr => addr._id === addressId)?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Cannot delete default address. Set another address as default first.",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('📍 Deleting address:', addressId);
      const response = await addressAPI.deleteAddress(addressId);
      
      if (response.success) {
        console.log('✅ Address deleted successfully');
        setAddresses(addresses.filter(addr => addr._id !== addressId));
        
        toast({
          title: "Success",
          description: "Address deleted successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      console.log('📍 Setting default address:', addressId);
      const response = await addressAPI.setDefaultAddress(addressId);
      
      if (response.success) {
        console.log('✅ Default address updated successfully');
        const updatedAddresses = addresses.map(addr => ({
          ...addr,
          isDefault: addr._id === addressId
        }));
        
        setAddresses(updatedAddresses);
        
        toast({
          title: "Success",
          description: "Default address updated"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update default address",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (address: Address) => {
    setEditingAddress(address);
    setFormData({ ...address });
    setIsEditDialogOpen(true);
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
                <p className="text-muted-foreground">Loading...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link 
                to="/profile" 
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Profile
              </Link>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-3xl font-bold text-foreground">My Addresses</h1>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Address</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main Street, Apt 4B"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="New York"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="NY"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code *</Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                      placeholder="10001"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddAddress} className="flex-1">
                      Add Address
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsAddDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Address</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-fullName">Full Name *</Label>
                    <Input
                      id="edit-fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Phone *</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Street Address *</Label>
                  <Input
                    id="edit-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, Apt 4B"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-city">City *</Label>
                    <Input
                      id="edit-city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-state">State *</Label>
                    <Input
                      id="edit-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="NY"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-zipCode">Zip Code *</Label>
                  <Input
                    id="edit-zipCode"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder="10001"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleEditAddress} className="flex-1">
                    Update Address
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingAddress(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Addresses List */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent>
              {addressesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-3">Loading addresses...</span>
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center p-8">
                  <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">No addresses saved</p>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address._id} className="border rounded-lg p-4 relative">
                      {address.isDefault && (
                        <Badge className="absolute top-2 right-2 bg-green-100 text-green-800">
                          <Check className="w-3 h-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      
                      <div className="pr-20">
                        <div className="flex items-start gap-3">
                          <Home className="w-5 h-5 text-muted-foreground mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold">{address.fullName}</span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div>{address.address}</div>
                              <div>{address.city}, {address.state} {address.zipCode}</div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {address.phone}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetDefault(address._id!)}
                          >
                            Set as Default
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(address)}
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        {!address.isDefault && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteAddress(address._id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserAddress;