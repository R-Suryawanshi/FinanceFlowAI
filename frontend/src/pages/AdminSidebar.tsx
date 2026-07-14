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
      name: "Users Directory",
      id: "admin-users",
      icon: Users,
      description: "Registered accounts",
    },
  ];

  return (
    <aside
      className={`h-screen sticky top-0 left-0 shrink-0 bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Sidebar Header branding */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/60">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 truncate">
            <Building2 className="h-6 w-6 text-blue-700 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">
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
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onToggle}
            className="absolute left-14 top-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 p-1 rounded-full shadow-md text-slate-400 hover:text-slate-655 hover:scale-105 transition-all z-50"
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
                        : "text-slate-500 hover:text-blue-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900"
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
                  <p className="text-[10px] text-slate-400">{item.description}</p>
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
                  : "text-slate-600 hover:text-blue-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1 bg-blue-700 rounded-r" />
              )}
              
              <Icon className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 duration-200 ${
                isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-700"
              }`} />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-none mb-1">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate leading-none">{item.description}</p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
