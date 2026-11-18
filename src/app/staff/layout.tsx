"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  PhoneCall,
  Calendar,
  FileCheck,
  BadgePercent,
  TrendingUp,
  LogOut,
  Building2,
  Menu,
  X,
  Target,
} from "lucide-react";

const STAFF_NAV_ITEMS = [
  { href: "/staff/dashboard", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/staff/leads", label: "Assigned Leads", icon: Users },
  { href: "/staff/follow-ups", label: "Follow-up Calls", icon: Calendar },
  { href: "/staff/documents", label: "Customer Documents", icon: FileCheck },
  { href: "/staff/loans", label: "Loan Applications", icon: BadgePercent },
  { href: "/staff/performance", label: "My Performance", icon: TrendingUp },
];

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayCalls, setTodayCalls] = useState({ completed: 0, target: 100 });

  useEffect(() => {
    fetchTodayTarget();
  }, [pathname]);

  const fetchTodayTarget = async () => {
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      const currentUserId = parseInt((session?.user as any)?.id);
      const myPerf = data?.staffPerformance?.find((s: any) => s.id === currentUserId);
      if (myPerf) {
        setTodayCalls({
          completed: myPerf.completedCalls,
          target: myPerf.targetCalls,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const progressPercent = Math.min(
    100,
    Math.round((todayCalls.completed / (todayCalls.target || 100)) * 100)
  );

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
            <div className="text-[11px] text-slate-400">Call Centre Agent Portal</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {STAFF_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/staff/dashboard" && pathname.startsWith(item.href));
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

        {/* Daily Target Progress Widget */}
        <div className="p-3.5 mx-3 mb-3 bg-slate-800/90 border border-slate-700/60 rounded-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-400" /> Today's Quota
            </span>
            <span className="font-mono text-indigo-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="text-xs text-slate-400 mb-2">
            <strong className="text-white font-mono">{todayCalls.completed}</strong> / {todayCalls.target} calls logged
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all ${
                progressPercent >= 100
                  ? "bg-emerald-500"
                  : progressPercent >= 70
                  ? "bg-indigo-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="truncate pr-2">
            <div className="text-xs font-medium text-white truncate">
              {session?.user?.name || "Agent"}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {session?.user?.email || "staff@cloudhouse.com"}
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
              {STAFF_NAV_ITEMS.find((item) => pathname.startsWith(item.href))?.label || "Call Centre Agent"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Calls Today: {todayCalls.completed}/{todayCalls.target}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                S
              </div>
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {session?.user?.name || "Staff Agent"}
              </span>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 text-slate-300 px-4 py-3 space-y-1 border-b border-slate-800">
            {STAFF_NAV_ITEMS.map((item) => {
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
            <div className="pt-2 border-t border-slate-800 flex justify-end">
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
