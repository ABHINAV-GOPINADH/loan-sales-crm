"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  PhoneCall,
  FileCheck,
  Building2,
  BadgePercent,
  BarChart3,
  Smartphone,
  LogOut,
  Menu,
  X,
  Share2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Lead Management", icon: Users },
  { href: "/admin/distribution", label: "Lead Distribution", icon: Share2 },
  { href: "/admin/employees", label: "Employees", icon: UserCheck },
  { href: "/admin/calls", label: "Daily Call Targets", icon: PhoneCall },
  { href: "/admin/documents", label: "Documents", icon: FileCheck },
  { href: "/admin/banks", label: "Banks & Schemes", icon: Building2 },
  { href: "/admin/loans", label: "Loan Applications", icon: BadgePercent },
  { href: "/admin/reports", label: "Reports & Analytics", icon: BarChart3 },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 gap-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-white tracking-wide text-sm">CloudHouse CRM</div>
            <div className="text-[11px] text-slate-400">Admin Control Panel</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Switch to Mobile UI Banner */}
        <div className="p-3 mx-3 mb-3 bg-gradient-to-r from-indigo-950 to-slate-800 border border-indigo-500/30 rounded-xl">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
            <Smartphone className="w-4 h-4 text-indigo-400" />
            <span>Mobile Admin UI</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Test the entire Admin Portal in mobile application layout.
          </p>
          <Link
            href="/mobile/dashboard"
            className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
          >
            Open Mobile UI
          </Link>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-medium text-white truncate">
              {session?.user?.name || "Admin User"}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {session?.user?.email || "admin@cloudhouse.com"}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">
              {NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || "Admin Portal"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/mobile/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg transition-colors"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile Layout View</span>
            </Link>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                A
              </div>
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {session?.user?.name || "Admin"}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-slate-300 px-4 py-3 space-y-1 border-b border-slate-800">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 text-slate-300"
                >
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
              <Link
                href="/mobile/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-indigo-400 font-medium flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Open Mobile Admin UI</span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-xs text-rose-400 flex items-center gap-1 font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
