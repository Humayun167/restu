import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReservationForm from "@/components/ReservationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  CheckCircle, 
  Info,
  Calendar,
  Utensils
} from "lucide-react";

const Reservations = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Reserve Your Table
            </h1>
            <p className="text-lg text-foreground/70 mb-8">
              Experience exceptional dining in an elegant atmosphere. Book your table today and let us make your meal memorable.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Open Daily 5:00 PM - 10:00 PM
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Accommodates 1-20 Guests
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Book up to 60 Days Ahead
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Reservation Form */}
          <div className="lg:col-span-2">
            <ReservationForm />
          </div>

          {/* Restaurant Information Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Restaurant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Address</p>
                    <p className="text-sm text-foreground/70">
                      123 Gourmet Street<br />
                      Downtown District<br />
                      City, State 12345
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-sm text-foreground/70">(555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-foreground/70">reservations@tastyc.com</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Operating Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Monday - Thursday</span>
                    <span>5:00 PM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Friday - Saturday</span>
                    <span>5:00 PM - 11:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Sunday</span>
                    <span>4:00 PM - 9:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Policies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Reservation Policies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-foreground/70">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Reservations can be made up to 60 days in advance</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Maximum party size is 20 guests</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Tables are held for 15 minutes past reservation time</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Cancellations accepted up to 2 hours before reservation</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Special dietary requirements can be accommodated with advance notice</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                  <p>Business casual dress code recommended</p>
                </div>
              </CardContent>
            </Card>

            {/* Special Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Dining Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-foreground/70">
                <div className="flex items-center justify-between">
                  <span>Private Dining</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Outdoor Seating</span>
                  <Badge variant="outline">Seasonal</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bar Seating</span>
                  <Badge variant="outline">Available</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Wheelchair Accessible</span>
                  <Badge variant="outline">Yes</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Valet Parking</span>
                  <Badge variant="outline">Weekends</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Contact for Large Parties */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">Large Party Reservations</CardTitle>
                <CardDescription>
                  Planning a special event or celebration?
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-3">
                  For parties of 8 or more guests, please call us directly to discuss seating arrangements, 
                  special menus, and pricing options.
                </p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <Phone className="h-4 w-4" />
                  <span>(555) 123-4567</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reservations;
