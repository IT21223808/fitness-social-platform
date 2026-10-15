"use client";

import { useRouter } from "next/navigation";
import {
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react";

import Sidebar from "@/components/layout/Sidebar";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <Sidebar />

      <main className="min-h-screen pt-16 lg:ml-64 lg:pt-0">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {/* Header */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#10B981]/20 bg-[#10B981]/10">
              <User size={22} className="text-[#10B981]" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Settings
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Manage your account and preferences
              </p>
            </div>
          </div>

          {/* Account */}
          <section className="mb-7">
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Account
            </h2>

            <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <User size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Profile</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your profile information
                  </p>
                </div>

                <ChevronRight size={19} className="shrink-0 text-gray-500" />
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <Lock size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Password &amp; Security</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your password and security
                  </p>
                </div>

                <ChevronRight size={19} className="shrink-0 text-gray-500" />
              </button>

              <button
                type="button"
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#1A212C]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <Shield size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Privacy</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Control your privacy settings
                  </p>
                </div>

                <ChevronRight size={19} className="shrink-0 text-gray-500" />
              </button>
            </div>
          </section>

          {/* Preferences */}
          <section className="mb-7">
            <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              Preferences
            </h2>

            <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
              <button
                type="button"
                onClick={() => router.push("/notifications")}
                className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <Bell size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Notifications</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your notification preferences
                  </p>
                </div>

                <ChevronRight size={19} className="shrink-0 text-gray-500" />
              </button>

              <div className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10 text-[#10B981]">
                  <Moon size={20} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium">Appearance</p>
                  <p className="mt-1 text-sm text-gray-500">
                    Dark mode is currently enabled
                  </p>
                </div>

                <span className="rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-1 text-xs font-semibold text-[#10B981]">
                  Dark
                </span>
              </div>
            </div>
          </section>

          {/* Logout */}
          <section>
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-left transition hover:bg-red-500/10"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <LogOut size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-red-400">Log out</p>
                <p className="mt-1 text-sm text-gray-500">
                  Sign out of your account
                </p>
              </div>

              <ChevronRight size={19} className="shrink-0 text-gray-500" />
            </button>
          </section>

          {/* Footer */}
          <p className="mt-8 pb-4 text-center text-xs text-gray-600">
            Fitness Social Platform
          </p>
        </div>
      </main>
    </div>
  );
}