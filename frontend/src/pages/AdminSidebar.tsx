"use client";
import React from "react";
import {
  LayoutDashboard,
  FileText,
  DollarSign,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AdminSidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ currentPage, onPageChange, isCollapsed, onToggle }: AdminSidebarProps) {
  const menuItems = [
    {
      name: "Overview",
      id: "admin-dashboard",
      icon: LayoutDashboard,
      description: "Analytics & Forecasts",
    },
    {
      name: "Applications",
      id: "admin-applications",
      icon: FileText,
      description: "Review board & ledgers",
    },
    {
      name: "Payments",
      id: "admin-payments",
      icon: DollarSign,
      description: "Repayment history logs",
    },
    {
      name: "Employees",
      id: "admin-employees",
      icon: Briefcase,
      description: "Staff & roles directory",
    },
    {
      name: "Customers",
      id: "admin-customers",
      icon: Users,
      description: "Borrowers & depositors list",
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 left-0 shrink-0 bg-card dark:bg-slate-950 border-r border-border/80 dark:border-border/80 flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border dark:border-border/60">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 truncate">
            <Building2 className="h-6 w-6 text-blue-700 shrink-0" />
            <span className="font-bold text-foreground dark:text-white text-sm tracking-wide">
              Bhalchandra Admin
            </span>
          </div>
        )}
        {isCollapsed && (
          <Building2 className="h-6 w-6 text-blue-700 mx-auto shrink-0 animate-pulse" />
        )}
        
        {/* Toggle Button in Sidebar Header */}
        {!isCollapsed && (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-muted dark:hover:bg-slate-800 text-muted-foreground hover:text-muted-foreground transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onToggle}
            className="absolute left-14 top-4 bg-card dark:bg-slate-950 border border-border dark:border-border p-1 rounded-full shadow-md text-muted-foreground hover:text-muted-foreground hover:scale-105 transition-all z-50"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Navigation Stack */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          if (isCollapsed) {
            return (
              <Tooltip key={item.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPageChange(item.id)}
                    className={`w-full flex items-center justify-center p-3 rounded-xl transition-all duration-200 relative group ${
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-bold shadow-sm"
                        : "text-muted-foreground hover:text-blue-700 hover:bg-muted/30 dark:text-muted-foreground dark:hover:bg-slate-900"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-blue-700 rounded-r" />
                    )}
                    <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 duration-200" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-slate-900 text-white border-none text-xs rounded-lg px-2.5 py-1.5">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">{item.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-all duration-200 relative group ${
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-blue-700 hover:bg-muted/30 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1 bg-blue-700 rounded-r" />
              )}
              
              <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                isActive ? "text-blue-700 dark:text-blue-400" : "text-muted-foreground group-hover:text-blue-700"
              }`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.name}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
