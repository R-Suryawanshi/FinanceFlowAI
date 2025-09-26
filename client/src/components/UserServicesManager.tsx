
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Edit3, 
  Plus, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  FileText
} from "lucide-react";

interface UserService {
  userService: {
    id: string;
    userId: string;
    applicationNumber: string;
    amount: string;
    tenure: number;
    interestRate: string;
    emi?: string;
    status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
    purpose?: string;
    applicationDate: string;
    approvalDate?: string;
    notes?: string;
    outstandingAmount?: string;
  };
  serviceType: {
    id: string;
    name: string;
    displayName: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ServiceType {
  id: string;
  name: string;
  displayName: string;
  baseInterestRate: string;
  minAmount: string;
  maxAmount: string;
  minTenure: number;
  maxTenure: number;
}

interface UserServicesManagerProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function UserServicesManager({ user }: UserServicesManagerProps) {
  const [services, setServices] = useState<UserService[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [filteredServices, setFilteredServices] = useState<UserService[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<UserService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newService, setNewService] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    serviceTypeId: '',
    amount: 0,
    interestRate: 0,
    tenure: 12,
    status: 'pending',
    purpose: '',
    notes: ''
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter services based on search and filters
  useEffect(() => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.userService.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => service.userService.status === filterStatus);
    }

    if (filterServiceType !== 'all') {
      filtered = filtered.filter(service => service.serviceType.name === filterServiceType);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, filterStatus, filterServiceType]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      // Fetch user services
      const servicesResponse = await fetch('/api/admin/user-services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Fetch service types
      const serviceTypesResponse = await fetch('/api/services', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (servicesResponse.ok && serviceTypesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const serviceTypesData = await serviceTypesResponse.json();
        
        setServices(servicesData.services || []);
        setServiceTypes(serviceTypesData.services || []);
        setFilteredServices(servicesData.services || []);
      } else {
        setError('Failed to fetch data');
      }
    } catch (error) {
      console.error('Data fetch error:', error);
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'active': 'bg-blue-100 text-blue-800',
    'completed': 'bg-gray-100 text-gray-800'
  };

  const handleAddService = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/user-services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceTypeId: newService.serviceTypeId,
          amount: newService.amount,
          tenure: newService.tenure,
          interestRate: newService.interestRate,
          purpose: newService.purpose,
          notes: newService.notes
        })
      });

      if (response.ok) {
        await fetchData(); // Refresh the data
        setNewService({
          userId: '',
          userName: '',
          userEmail: '',
          serviceTypeId: '',
          amount: 0,
          interestRate: 0,
          tenure: 12,
          status: 'pending',
          purpose: '',
          notes: ''
        });
        setIsAddDialogOpen(false);
      } else {
        setError('Failed to add service');
      }
    } catch (error) {
      console.error('Add service error:', error);
      setError('Failed to add service');
    }
  };

  const handleEditService = (service: UserService) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async () => {
    if (!selectedService) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/user-services/${selectedService.userService.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: selectedService.userService.status,
          notes: selectedService.userService.notes,
          interestRate: selectedService.userService.interestRate,
          amount: selectedService.userService.amount,
          generateSchedule: true // Generate EMI schedule if approved
        })
      });

      if (response.ok) {
        await fetchData(); // Refresh the data
        setIsEditDialogOpen(false);
        setSelectedService(null);
      } else {
        setError('Failed to update service');
      }
    } catch (error) {
      console.error('Update service error:', error);
      setError('Failed to update service');
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(numAmount);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can access user services management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-lg">Loading services...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Services Management</h1>
          <p className="text-muted-foreground">Manage and track all user financial services</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => fetchData()}
        >
          <Plus className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name, email, or application number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterServiceType} onValueChange={setFilterServiceType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {serviceTypes.map((serviceType) => (
                    <SelectItem key={serviceType.id} value={serviceType.name}>
                      {serviceType.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.userService.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.user.name}</CardTitle>
                  <CardDescription>{service.user.email}</CardDescription>
                  <div className="text-sm text-muted-foreground mt-1">
                    App No: {service.userService.applicationNumber}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{service.serviceType.displayName}</Badge>
                <Badge className={statusColors[service.userService.status]}>
                  {service.userService.status.charAt(0).toUpperCase() + service.userService.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold">{formatCurrency(service.userService.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold">{service.userService.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="font-semibold">{service.userService.tenure} months</p>
                </div>
                {service.userService.emi && (
                  <div>
                    <p className="text-muted-foreground">EMI</p>
                    <p className="font-semibold">{formatCurrency(service.userService.emi)}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Application Date</p>
                <p className="text-sm">{new Date(service.userService.applicationDate).toLocaleDateString()}</p>
              </div>

              {service.userService.purpose && (
                <div>
                  <p className="text-muted-foreground text-sm">Purpose</p>
                  <p className="text-sm">{service.userService.purpose}</p>
                </div>
              )}

              {service.userService.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{service.userService.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User Name</Label>
                  <Input
                    value={selectedService.user.name}
                    disabled
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedService.userService.status} 
                    onValueChange={(value) => setSelectedService({
                      ...selectedService,
                      userService: { ...selectedService.userService, status: value as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={selectedService.userService.amount}
                    onChange={(e) => setSelectedService({
                      ...selectedService,
                      userService: { ...selectedService.userService, amount: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedService.userService.interestRate}
                    onChange={(e) => setSelectedService({
                      ...selectedService,
                      userService: { ...selectedService.userService, interestRate: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={selectedService.userService.notes || ''}
                  onChange={(e) => setSelectedService({
                    ...selectedService,
                    userService: { ...selectedService.userService, notes: e.target.value }
                  })}
                />
              </div>

              <Button onClick={handleUpdateService} className="w-full">
                Update Service
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
