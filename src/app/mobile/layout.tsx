"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  Share2,
  BadgePercent,
  Menu,
  X,
  PhoneCall,
  UserCheck,
  FileCheck,
  Building2,
  BarChart3,
  Monitor,
  LogOut,
  Building,
} from "lucide-react";

const BOTTOM_NAV = [
  { href: "/mobile/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mobile/leads", label: "Leads", icon: Users },
  { href: "/mobile/distribution", label: "Distribute", icon: Share2 },
  { href: "/mobile/loans", label: "Loans", icon: BadgePercent },
];

const ALL_MOBILE_ROUTES = [
  { href: "/mobile/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mobile/leads", label: "Lead Management", icon: Users },
  { href: "/mobile/distribution", label: "Lead Distribution", icon: Share2 },
  { href: "/mobile/employees", label: "Employees & Quotas", icon: UserCheck },
  { href: "/mobile/calls", label: "Daily Call Targets", icon: PhoneCall },
  { href: "/mobile/documents", label: "Document Verification", icon: FileCheck },
  { href: "/mobile/banks", label: "Banks & Loan Schemes", icon: Building2 },
  { href: "/mobile/loans", label: "Loan Applications", icon: BadgePercent },
  { href: "/mobile/reports", label: "Reports & Analytics", icon: BarChart3 },
];

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center">
      {/* Mobile Device Frame Container (Simulates App Shell on Desktop, Native Fullscreen on Mobile) */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col shadow-2xl relative border-x border-slate-200">
        {/* Mobile App Bar */}
        <header className="h-14 bg-indigo-600 text-white px-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-1.5 -ml-1 text-white hover:bg-white/10 rounded-lg active:scale-95 transition-transform"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="font-bold text-sm tracking-tight leading-none">CloudHouse CRM</div>
              <div className="text-[10px] text-indigo-200 font-medium leading-tight">Admin Mobile</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              title="Switch to Desktop Layout"
              className="px-2 py-1 bg-white/15 hover:bg-white/25 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </Link>
          </div>
        </header>

        {/* Drawer Menu */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex">
            <div className="w-72 bg-slate-900 text-slate-300 h-full flex flex-col p-4 shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                    <Building className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">CloudHouse CRM</div>
                    <div className="text-[10px] text-slate-400">Admin Mobile App</div>
                  </div>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-4 space-y-1 overflow-y-auto text-xs">
                {ALL_MOBILE_ROUTES.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-600 text-white font-semibold"
                          : "text-slate-400 hover:text-white hover:bg-slate-800"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] truncate pr-2">
                  <div className="text-white font-semibold truncate">{session?.user?.name || "Admin"}</div>
                  <div className="text-slate-500 truncate">{session?.user?.email}</div>
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="p-2 text-rose-400 hover:bg-slate-800 rounded-lg"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1" onClick={() => setDrawerOpen(false)} />
          </div>
        )}

        {/* Mobile Page Content Area */}
        <main className="flex-1 p-4 pb-20 overflow-y-auto">
          {children}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar */}
        <nav className="h-14 bg-white border-t border-slate-200 fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 flex items-center justify-around px-2 shadow-lg">
          {BOTTOM_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                <span className={`text-[10px] mt-0.5 ${isActive ? "font-bold text-indigo-600" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-slate-600"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
