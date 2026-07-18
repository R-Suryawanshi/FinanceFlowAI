"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, EyeOff, Calendar, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminAddEmployeePageProps {
  user: any;
  onPageChange: (page: string) => void;
  onBack?: () => void;
}

export function AdminAddEmployeePage({ user, onPageChange, onBack }: AdminAddEmployeePageProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    primaryPhone: "",
    secondaryPhone: "",
    role: "underwriter",
    joiningDate: "",
    status: "active",
    allowedModules: {
      overview: true,
      applications: true,
      payments: false,
      customers: false,
    }
  });

  if (!user || user.role !== "admin") {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You don’t have permission to access this page.
        </p>
      </div>
    );
  }

  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      // Extract username from email before '@' to meet database unique constraints
      const username = newEmployee.email.split("@")[0] || `staff_${Date.now()}`;
      
      const payload = {
        name: newEmployee.name,
        username,
        email: newEmployee.email,
        password: newEmployee.password,
        role: newEmployee.role,
        isActive: newEmployee.status === "active"
      };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          toast({
            title: "Employee Added successfully",
            description: `${newEmployee.name} has been onboarded as a ${newEmployee.role.replace('-', ' ')}.`
          });
          if (onPageChange) onPageChange("admin-employees");
        } else {
          toast({
            title: "Failed to onboard employee",
            description: data.error || "An error occurred",
            variant: "destructive"
          });
        }
      } else {
        const data = await res.json();
        toast({
          title: "Registration Failed",
          description: data.error || "Verify temporary password strength (1 uppercase, 1 lowercase, 1 number, min 8 characters) and uniqueness.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 w-full space-y-6">
      
      {/* Title Header Section */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack || (() => onPageChange && onPageChange("admin-employees"))}
          data-testid="page-back-button"
          className="h-10 w-10 rounded-lg border border-border/50 dark:border-border bg-card dark:bg-slate-900 text-blue-700 dark:text-blue-400 hover:bg-muted/30 dark:hover:bg-slate-955 transition-colors shadow-sm flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground dark:text-white tracking-tight">Add New Employee</h1>
      </div>

      {/* Main Form Card Container */}
      <Card className="bg-card dark:bg-slate-900 border border-border dark:border-border shadow-md rounded-2xl overflow-hidden p-6 sm:p-8">
        <form onSubmit={handleSubmitEmployee} className="space-y-6">
          
          {/* Row 1: Name, Email, Password */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter Full Name"
                className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 bg-card dark:bg-slate-950 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="Enter Email Address"
                className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 bg-card dark:bg-slate-955 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter Password"
                  className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 pr-10 bg-card dark:bg-slate-955 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Primary Phone, Secondary Phone, Role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                Primary Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-border dark:border-border focus-within:ring-1 focus-within:ring-blue-500">
                <span className="inline-flex items-center px-3 border-r border-border dark:border-border bg-muted/30 dark:bg-slate-950 text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Phone number"
                  className="flex-1 text-sm p-2.5 bg-card dark:bg-slate-950 text-foreground dark:text-slate-200 focus:outline-none"
                  value={newEmployee.primaryPhone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, primaryPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-300">
                Secondary Phone <span className="text-rose-500">*</span>
              </label>
              <div className="relative flex rounded-lg overflow-hidden border border-border dark:border-border focus-within:ring-1 focus-within:ring-blue-500">
                <span className="inline-flex items-center px-3 border-r border-border dark:border-border bg-muted/30 dark:bg-slate-955 text-xs font-semibold text-muted-foreground dark:text-muted-foreground">
                  🇮🇳 +91
                </span>
                <input
                  type="tel"
                  required
                  placeholder="Secondary phone"
                  className="flex-1 text-sm p-2.5 bg-card dark:bg-slate-955 text-foreground dark:text-slate-200 focus:outline-none"
                  value={newEmployee.secondaryPhone}
                  onChange={(e) => setNewEmployee({ ...newEmployee, secondaryPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground dark:text-slate-305">
                Role <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 bg-card dark:bg-slate-955 text-foreground dark:text-slate-200 focus:outline-none"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
              >
                <option value="underwriter">Underwriter / Credit Analyst</option>
                <option value="loan-officer">Loan Officer</option>
                <option value="support-agent">Customer Support</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          {/* Row 3: Joining Date, Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-750 dark:text-slate-300">
                Joining Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 pl-10 bg-card dark:bg-slate-950 text-foreground dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newEmployee.joiningDate}
                  onChange={(e) => setNewEmployee({ ...newEmployee, joiningDate: e.target.value })}
                />
                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-750 dark:text-slate-300">
                  Status
                </label>
                <button type="button" className="text-blue-600 dark:text-blue-400 hover:text-blue-800">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <select
                className="w-full text-sm border border-border dark:border-border rounded-lg p-2.5 bg-card dark:bg-slate-950 text-foreground dark:text-slate-200 focus:outline-none"
                value={newEmployee.status}
                onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            
            {/* Empty grid space to maintain layout structure */}
            <div className="hidden md:block"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border dark:border-border">
            <Button
              type="button"
              variant="outline"
              className="px-6 border-border dark:border-border text-muted-foreground dark:text-slate-250 font-semibold"
              onClick={() => onPageChange && onPageChange("admin-employees")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              disabled={loading}
            >
              {loading ? "Registering..." : "Add Employee"}
            </Button>
          </div>

        </form>
      </Card>
    </div>
  );
}
