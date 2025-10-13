import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Users, Phone, Mail, MessageSquare, Search, Filter, Eye, Edit, X, Check, AlertCircle } from "lucide-react";

interface Reservation {
  id: string;
  confirmationNumber: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  tableNumber?: string;
  adminNotes?: string;
  userId?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface ReservationPagination {
  current: number;
  pages: number;
  total: number;
}

const ReservationManagement = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    tableNumber: '',
    adminNotes: ''
  });
  const [pagination, setPagination] = useState<ReservationPagination>({
    current: 1,
    pages: 1,
    total: 0
  });
  const [todayStats, setTodayStats] = useState<Record<string, { count: number; guests: number }>>({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { toast } = useToast();

  // Debounced search term to prevent too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchReservations = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      console.log('Fetching reservations with filters:', {
        status: statusFilter === 'all' ? undefined : statusFilter,
        date: dateFilter || undefined,
        search: debouncedSearchTerm || undefined,
        page: page,
      });

      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (dateFilter) params.append('date', dateFilter);
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      params.append('page', page.toString());
      params.append('limit', '20');
      params.append('sortBy', 'date');
      params.append('sortOrder', 'desc');

      const response = await fetch(`/api/reservation/all?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.json();
      console.log('Reservation API response:', data);

      if (data.success) {
        const reservations = data.reservations || [];
        setReservations(reservations);
        setPagination(data.pagination || { current: page, pages: 1, total: 0 });
        setTodayStats(data.todayStats || {});
        
        // Only show success toast on initial load
        if (isInitialLoad && reservations.length > 0) {
          toast({
            title: "Success",
            description: `Loaded ${reservations.length} reservations`,
          });
          setIsInitialLoad(false);
        }
      } else {
        console.error('API returned error:', data.message);
        toast({
          title: "Error",
          description: data.message || "Failed to load reservations. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      toast({
        title: "Error",
        description: "Failed to load reservations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, debouncedSearchTerm, isInitialLoad, toast]);

  // Initial load and filter changes
  useEffect(() => {
    fetchReservations(1);
    setPagination(prev => ({ ...prev, current: 1 }));
  }, [fetchReservations]);

  // Handle pagination changes separately
  const handlePageChange = useCallback((newPage: number) => {
    fetchReservations(newPage);
  }, [fetchReservations]);

  const handleUpdateReservation = async () => {
    if (!selectedReservation) return;

    try {
      const response = await fetch(`/api/reservation/update/${selectedReservation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Reservation Updated",
          description: "Reservation has been updated successfully",
        });
        setIsUpdateModalOpen(false);
        fetchReservations();
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Failed to update reservation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Error",
        description: "Failed to update reservation",
        variant: "destructive",
      });
    }
  };

  const openUpdateModal = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setUpdateData({
      status: reservation.status,
      tableNumber: reservation.tableNumber || '',
      adminNotes: reservation.adminNotes || ''
    });
    setIsUpdateModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { 
        className: 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-50', 
        label: 'Pending' 
      },
      confirmed: { 
        className: 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-50', 
        label: 'Confirmed' 
      },
      cancelled: { 
        className: 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-50', 
        label: 'Cancelled' 
      },
      completed: { 
        className: 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-50', 
        label: 'Completed' 
      },
      'no-show': { 
        className: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-50', 
        label: 'No Show' 
      }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01 ${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 bg-white min-h-screen p-6">
      {/* Header with Stats */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-600">Reservation Management</h1>
          <p className="text-gray-500">Manage restaurant reservations and table bookings</p>
        </div>

        {/* Today's Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Today's Reservations</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {Object.values(todayStats).reduce((sum, stat) => sum + stat.count, 0)}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Guests Today</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {Object.values(todayStats).reduce((sum, stat) => sum + stat.guests, 0)}
                  </p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Confirmed Today</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {todayStats.confirmed?.count || 0}
                  </p>
                </div>
                <Check className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Pending Today</p>
                  <p className="text-2xl font-bold text-gray-600">
                    {todayStats.pending?.count || 0}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-600">
            <Filter className="h-5 w-5 text-gray-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-600">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, or confirmation number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">Date</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="bg-white border-gray-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-600">&nbsp;</Label>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateFilter('');
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations Table */}
      <Card className="bg-white border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-600">Reservations ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No reservations found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Confirmation #</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Customer</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Date & Time</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Guests</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Status</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Table</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="font-mono text-sm text-gray-600">
                          {reservation.confirmationNumber}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-600">{reservation.name}</div>
                          <div className="text-sm text-gray-400">{reservation.email}</div>
                          <div className="text-sm text-gray-400">{reservation.phone}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <div className="font-medium text-gray-600">{formatDate(reservation.date)}</div>
                          <div className="text-sm text-gray-400">{formatTime(reservation.time)}</div>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span>{reservation.guests}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(reservation.status)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-sm text-gray-600">
                          {reservation.tableNumber || 'Not assigned'}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setIsDetailModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            onClick={() => openUpdateModal(reservation)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                variant="outline"
                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {pagination.current} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reservation Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-600">Reservation Details</DialogTitle>
            <DialogDescription className="text-gray-500">
              View detailed information about this reservation
            </DialogDescription>
          </DialogHeader>
          
          {selectedReservation && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Confirmation Number</Label>
                  <p className="font-mono text-gray-600">{selectedReservation.confirmationNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Customer Name</Label>
                  <p className="text-gray-600">{selectedReservation.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-gray-600">{selectedReservation.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-gray-600">{selectedReservation.phone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                  <p className="text-gray-600">{formatDate(selectedReservation.date)} at {formatTime(selectedReservation.time)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Number of Guests</Label>
                  <p className="text-gray-600">{selectedReservation.guests}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Table Number</Label>
                  <p className="text-gray-600">{selectedReservation.tableNumber || 'Not assigned'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="text-gray-600">{formatDate(selectedReservation.createdAt)}</p>
                </div>
              </div>
              
              {selectedReservation.specialRequests && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Special Requests</Label>
                  <p className="mt-1 text-sm bg-white border border-gray-200 p-3 rounded text-gray-600">
                    {selectedReservation.specialRequests}
                  </p>
                </div>
              )}
              
              {selectedReservation.adminNotes && (
                <div className="col-span-2">
                  <Label className="text-sm font-medium text-gray-500">Admin Notes</Label>
                  <p className="mt-1 text-sm bg-white border border-gray-200 p-3 rounded text-gray-600">
                    {selectedReservation.adminNotes}
                  </p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
            {selectedReservation && (
              <Button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => {
                setIsDetailModalOpen(false);
                openUpdateModal(selectedReservation);
              }}>
                Edit Reservation
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Reservation Modal */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-600">Update Reservation</DialogTitle>
            <DialogDescription className="text-gray-500">
              Modify reservation status, table assignment, and notes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-600">Status</Label>
              <Select
                value={updateData.status}
                onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="bg-white border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Table Number</Label>
              <Input
                placeholder="e.g., Table 12, Booth 3, Patio A"
                value={updateData.tableNumber}
                onChange={(e) => setUpdateData(prev => ({ ...prev, tableNumber: e.target.value }))}
                className="bg-white border-gray-200"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-600">Admin Notes</Label>
              <Textarea
                placeholder="Internal notes about this reservation..."
                value={updateData.adminNotes}
                onChange={(e) => setUpdateData(prev => ({ ...prev, adminNotes: e.target.value }))}
                rows={3}
                className="bg-white border-gray-200"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50" onClick={() => setIsUpdateModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50" onClick={handleUpdateReservation}>
              Update Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReservationManagement;
