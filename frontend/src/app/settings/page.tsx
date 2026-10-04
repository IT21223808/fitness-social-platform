"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Lock,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:py-10">

        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-gray-400 transition hover:bg-[#141A23] hover:text-white"
          >
            <ArrowLeft size={22} />
          </button>

          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Account */}
        <section className="mb-6">
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Account
          </h2>

          <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
            <button
              onClick={() => router.push("/profile")}
              className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <User size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium">Profile</p>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your profile information
                </p>
              </div>

              <ChevronRight size={19} className="text-gray-500" />
            </button>

            <button
              className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <Lock size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium">Password & Security</p>
                <p className="mt-1 text-sm text-gray-500">
                  Manage your password and security
                </p>
              </div>

              <ChevronRight size={19} className="text-gray-500" />
            </button>

            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#1A212C]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <Shield size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium">Privacy</p>
                <p className="mt-1 text-sm text-gray-500">
                  Control your privacy settings
                </p>
              </div>

              <ChevronRight size={19} className="text-gray-500" />
            </button>
          </div>
        </section>

        {/* Preferences */}
        <section className="mb-6">
          <h2 className="mb-3 px-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Preferences
          </h2>

          <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
            <button
              className="flex w-full items-center gap-4 border-b border-[#27303D] px-5 py-4 text-left transition hover:bg-[#1A212C]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <Bell size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium">Notifications</p>
                <p className="mt-1 text-sm text-gray-500">
                  Manage notification preferences
                </p>
              </div>

              <ChevronRight size={19} className="text-gray-500" />
            </button>

            <button
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#1A212C]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#10B981]/10 text-[#10B981]">
                <Moon size={20} />
              </div>

              <div className="flex-1">
                <p className="font-medium">Appearance</p>
                <p className="mt-1 text-sm text-gray-500">
                  Dark mode is currently enabled
                </p>
              </div>

              <span className="rounded-full bg-[#10B981]/10 px-3 py-1 text-xs font-medium text-[#10B981]">
                Dark
              </span>
            </button>
          </div>
        </section>

        {/* Logout */}
        <section>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-left transition hover:bg-red-500/10"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <LogOut size={20} />
            </div>

            <div>
              <p className="font-medium text-red-400">Log out</p>
              <p className="mt-1 text-sm text-gray-500">
                Sign out of your account
              </p>
            </div>
          </button>
        </section>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-600">
          Fitness Social Platform
        </p>
      </div>
    </div>
  );
}