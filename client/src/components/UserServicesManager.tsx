
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
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  serviceType: 'home-loan' | 'car-loan' | 'personal-loan' | 'gold-loan' | 'investment' | 'insurance';
  amount: number;
  interestRate: number;
  tenure: number;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'completed';
  applicationDate: string;
  approvalDate?: string;
  emi?: number;
  notes: string;
  documents: string[];
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
  const [filteredServices, setFilteredServices] = useState<UserService[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<UserService | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');

  const [newService, setNewService] = useState({
    userId: '',
    userName: '',
    userEmail: '',
    serviceType: 'personal-loan',
    amount: 0,
    interestRate: 0,
    tenure: 12,
    status: 'pending',
    notes: '',
    documents: []
  });

  // Mock data - replace with real API calls
  useEffect(() => {
    const mockServices: UserService[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'Rajesh Kumar',
        userEmail: 'rajesh@email.com',
        serviceType: 'home-loan',
        amount: 2500000,
        interestRate: 8.5,
        tenure: 240,
        status: 'active',
        applicationDate: '2024-01-15',
        approvalDate: '2024-01-20',
        emi: 19308,
        notes: 'Documents verified, loan sanctioned',
        documents: ['income-proof.pdf', 'property-docs.pdf']
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Priya Sharma',
        userEmail: 'priya@email.com',
        serviceType: 'gold-loan',
        amount: 150000,
        interestRate: 12,
        tenure: 12,
        status: 'pending',
        applicationDate: '2024-01-25',
        notes: 'Gold evaluation pending',
        documents: ['gold-appraisal.pdf']
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Amit Patel',
        userEmail: 'amit@email.com',
        serviceType: 'car-loan',
        amount: 800000,
        interestRate: 9.5,
        tenure: 60,
        status: 'approved',
        applicationDate: '2024-02-01',
        approvalDate: '2024-02-05',
        emi: 16779,
        notes: 'Ready for disbursement',
        documents: ['car-invoice.pdf', 'insurance.pdf']
      }
    ];
    setServices(mockServices);
    setFilteredServices(mockServices);
  }, []);

  // Filter services based on search and filters
  useEffect(() => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(service => service.status === filterStatus);
    }

    if (filterServiceType !== 'all') {
      filtered = filtered.filter(service => service.serviceType === filterServiceType);
    }

    setFilteredServices(filtered);
  }, [services, searchTerm, filterStatus, filterServiceType]);

  const serviceTypes = {
    'home-loan': 'Home Loan',
    'car-loan': 'Car Loan',
    'personal-loan': 'Personal Loan',
    'gold-loan': 'Gold Loan',
    'investment': 'Investment',
    'insurance': 'Insurance'
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'active': 'bg-blue-100 text-blue-800',
    'completed': 'bg-gray-100 text-gray-800'
  };

  const handleAddService = () => {
    const service: UserService = {
      id: Date.now().toString(),
      ...newService,
      applicationDate: new Date().toISOString().split('T')[0],
      documents: []
    };

    setServices([...services, service]);
    setNewService({
      userId: '',
      userName: '',
      userEmail: '',
      serviceType: 'personal-loan',
      amount: 0,
      interestRate: 0,
      tenure: 12,
      status: 'pending',
      notes: '',
      documents: []
    });
    setIsAddDialogOpen(false);
  };

  const handleEditService = (service: UserService) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = () => {
    if (selectedService) {
      setServices(services.map(s => s.id === selectedService.id ? selectedService : s));
      setIsEditDialogOpen(false);
      setSelectedService(null);
    }
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">Only administrators can access user services management.</p>
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user-name">User Name</Label>
                  <Input
                    id="user-name"
                    value={newService.userName}
                    onChange={(e) => setNewService({...newService, userName: e.target.value})}
                    placeholder="Enter user name"
                  />
                </div>
                <div>
                  <Label htmlFor="user-email">User Email</Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={newService.userEmail}
                    onChange={(e) => setNewService({...newService, userEmail: e.target.value})}
                    placeholder="user@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service-type">Service Type</Label>
                  <Select value={newService.serviceType} onValueChange={(value) => setNewService({...newService, serviceType: value as any})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(serviceTypes).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newService.amount}
                    onChange={(e) => setNewService({...newService, amount: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interest-rate">Interest Rate (%)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    value={newService.interestRate}
                    onChange={(e) => setNewService({...newService, interestRate: Number(e.target.value)})}
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <Label htmlFor="tenure">Tenure (months)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={newService.tenure}
                    onChange={(e) => setNewService({...newService, tenure: Number(e.target.value)})}
                    placeholder="12"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newService.notes}
                  onChange={(e) => setNewService({...newService, notes: e.target.value})}
                  placeholder="Additional notes..."
                />
              </div>

              <Button onClick={handleAddService} className="w-full">
                Add Service
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by user name or email..."
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
                  {Object.entries(serviceTypes).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
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
          <Card key={service.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.userName}</CardTitle>
                  <CardDescription>{service.userEmail}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditService(service)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteService(service.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{serviceTypes[service.serviceType]}</Badge>
                <Badge className={statusColors[service.status]}>
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-semibold">{formatCurrency(service.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interest Rate</p>
                  <p className="font-semibold">{service.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="font-semibold">{service.tenure} months</p>
                </div>
                {service.emi && (
                  <div>
                    <p className="text-muted-foreground">EMI</p>
                    <p className="font-semibold">{formatCurrency(service.emi)}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-muted-foreground text-sm">Application Date</p>
                <p className="text-sm">{new Date(service.applicationDate).toLocaleDateString()}</p>
              </div>

              {service.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm">{service.notes}</p>
                </div>
              )}

              {service.documents.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm">Documents</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {service.documents.map((doc, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <FileText className="h-3 w-3 mr-1" />
                        {doc}
                      </Badge>
                    ))}
                  </div>
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
                    value={selectedService.userName}
                    onChange={(e) => setSelectedService({...selectedService, userName: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={selectedService.status} 
                    onValueChange={(value) => setSelectedService({...selectedService, status: value as any})}
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
                    value={selectedService.amount}
                    onChange={(e) => setSelectedService({...selectedService, amount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Interest Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedService.interestRate}
                    onChange={(e) => setSelectedService({...selectedService, interestRate: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={selectedService.notes}
                  onChange={(e) => setSelectedService({...selectedService, notes: e.target.value})}
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
