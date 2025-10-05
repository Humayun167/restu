import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, Phone, Mail, MessageSquare } from "lucide-react";
import { useUser } from "@/context/UserContext";

interface ReservationFormData {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  email: string;
  specialRequests: string;
}

interface AvailableSlot {
  time: string;
  available: boolean;
  displayTime: string;
}

const ReservationForm = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ReservationFormData>({
    date: '',
    time: '',
    guests: 2,
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
    specialRequests: ''
  });
  
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Available time slots for reservations
  const timeSlots = [
    { value: '17:00', label: '5:00 PM' },
    { value: '17:30', label: '5:30 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '18:30', label: '6:30 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '19:30', label: '7:30 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '20:30', label: '8:30 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '21:30', label: '9:30 PM' }
  ];

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get maximum date (60 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return maxDate.toISOString().split('T')[0];
  };

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // When date or guests change, fetch available slots
    if (name === 'date' || name === 'guests') {
      const updatedData = { ...formData, [name]: value };
      if (updatedData.date && updatedData.guests) {
        fetchAvailableSlots(updatedData.date, updatedData.guests);
      }
    }
  };

  const fetchAvailableSlots = async (date: string, guests: number) => {
    try {
      setLoadingSlots(true);
      const response = await fetch(`/api/reservation/available-slots?date=${date}&guests=${guests}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAvailableSlots([]);
        toast({
          title: "Error",
          description: "Failed to fetch available time slots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.date || !formData.time || !formData.name || !formData.phone || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.guests < 1 || formData.guests > 20) {
      toast({
        title: "Invalid Guest Count",
        description: "Guest count must be between 1 and 20",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/reservation/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reservation Confirmed! 🎉",
          description: `Your table for ${formData.guests} guests on ${new Date(formData.date).toLocaleDateString()} at ${formData.time} has been confirmed. Confirmation number: ${data.reservation.confirmationNumber}`,
        });

        // Reset form
        setFormData({
          date: '',
          time: '',
          guests: 2,
          name: user?.name || '',
          phone: '',
          email: user?.email || '',
          specialRequests: ''
        });
        setAvailableSlots([]);
      } else {
        toast({
          title: "Reservation Failed",
          description: data.message || "Unable to process your reservation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Reservation error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Make a Reservation</CardTitle>
        <CardDescription>
          Reserve your table at our restaurant. We'll confirm your booking shortly.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={getMinDate()}
                max={getMaxDate()}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Number of Guests *
              </Label>
              <Select
                value={formData.guests.toString()}
                onValueChange={(value) => handleInputChange('guests', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 20 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      {i + 1} {i === 0 ? 'Guest' : 'Guests'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Time *
            </Label>
            
            {loadingSlots ? (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Loading available times...</p>
              </div>
            ) : formData.date && formData.guests ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const isAvailable = availableSlots.length === 0 || 
                    availableSlots.some(available => available.time === slot.value && available.available);
                  
                  return (
                    <Button
                      key={slot.value}
                      type="button"
                      variant={formData.time === slot.value ? "default" : "outline"}
                      disabled={!isAvailable}
                      onClick={() => handleInputChange('time', slot.value)}
                      className={`text-sm ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {slot.label}
                    </Button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">
                Please select a date and number of guests to see available times.
              </p>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <Label htmlFor="specialRequests" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Special Requests (Optional)
            </Label>
            <Textarea
              id="specialRequests"
              placeholder="Any special dietary requirements, occasion details, or seating preferences..."
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !formData.date || !formData.time}
          >
            {loading ? 'Confirming Reservation...' : 'Confirm Reservation'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;
