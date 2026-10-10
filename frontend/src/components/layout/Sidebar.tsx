"use client";

import Image from "next/image";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Dumbbell,
  Home,
  LogOut,
  Menu,
  PlusSquare,
  Search,
  Settings,
  User,
  Utensils,
  X,
} from "lucide-react";

const menuItems = [
  {
    label: "Home",
    icon: Home,
    path: "/home",
  },
  {
    label: "Explore",
    icon: Search,
    path: "/explore",
  },
  {
    label: "Create Post",
    icon: PlusSquare,
    path: "/create",
  },
  {
    label: "Workout",
    icon: Dumbbell,
    path: "/workout-plans",
  },
  {
    label: "Meal Plans",
    icon: Utensils,
    path: "/meal-plans",
  },
  {
    label: "Notifications",
    icon: Bell,
    path: "/notifications",
  },
  {
    label: "Profile",
    icon: User,
    path: "/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    router.push("/login");
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-[#27303D] px-6">
        <div className="flex items-center gap-3">
          <Image
            src="/fit_logo.png"
            alt="FitSocial"
            width={42}
            height={42}
            className="h-10 w-10 object-contain"
          />

          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              Pulse<span className="text-[#10B981]">Fit</span>
            </h1>

            <p className="text-xs text-gray-500">
              Fitness Community
            </p>
          </div>
        </div>

        {/* Mobile close */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          className="ml-auto rounded-lg p-2 text-gray-400 hover:bg-[#1A212C] hover:text-white lg:hidden"
        >
          <X size={21} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.path === "/home"
              ? pathname === "/home"
              : pathname === item.path ||
                pathname.startsWith(`${item.path}/`);

          return (
            <button
              type="button"
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "border border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]"
                  : "border border-transparent text-gray-400 hover:bg-[#141A23] hover:text-white"
              }`}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.2 : 1.8}
              />

              <span>{item.label}</span>

              {item.path === "/notifications" && isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#27303D] p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-[#27303D] bg-[#0B0F17] lg:flex">
        {sidebarContent}
      </aside>

      {/* Mobile Top Bar */}
      <div className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-[#27303D] bg-[#0B0F17]/95 px-4 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-gray-300 transition hover:bg-[#141A23] hover:text-white"
        >
          <Menu size={23} />
        </button>

        <button
          type="button"
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-lg font-bold"
        >
          <Image
            src="/fit_logo.png"
            alt="FitSocial"
            width={30}
            height={30}
            className="h-7 w-7 object-contain"
          />

          <span>
            Fit<span className="text-[#10B981]">Social</span>
          </span>
        </button>

        {/* Mobile notification navigation */}
        <button
          type="button"
          onClick={() => router.push("/notifications")}
          aria-label="Open notifications"
          className={`relative rounded-xl p-2 transition hover:bg-[#141A23] ${
            pathname === "/notifications"
              ? "text-[#10B981]"
              : "text-gray-300 hover:text-[#10B981]"
          }`}
        >
          <Bell size={21} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        aria-label="Mobile navigation"
        className={`fixed left-0 top-0 z-[60] flex h-screen w-72 flex-col border-r border-[#27303D] bg-[#0B0F17] transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}