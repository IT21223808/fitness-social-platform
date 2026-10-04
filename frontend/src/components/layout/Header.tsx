"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  UserCircle,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

type User = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
};

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const data = await apiRequest<User>("/users/me");
      setUser(data);
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/explore");
      return;
    }

    router.push(
      `/explore?search=${encodeURIComponent(value)}`
    );
  }

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    "User";

  return (
    <header className="sticky top-0 z-40 border-b border-[#27303D] bg-[#0B0F17]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex max-w-md flex-1"
        >
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search people or posts..."
              className="w-full rounded-xl border border-[#27303D] bg-[#141A23] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-emerald-500"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <button
            type="button"
            onClick={() => router.push("/notifications")}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#27303D] bg-[#141A23] text-gray-300 transition hover:border-emerald-500 hover:text-emerald-400"
            aria-label="Notifications"
          >
            <Bell size={19} />
          </button>

          {/* Profile */}
          <button
            type="button"
            onClick={() => router.push("/profile")}
            className="flex items-center gap-3 rounded-xl border border-transparent px-2 py-1.5 transition hover:border-[#27303D] hover:bg-[#141A23]"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-bold text-[#06110D]">
              {user?.username?.charAt(0).toUpperCase() || (
                <UserCircle size={20} />
              )}
            </div>

            <div className="hidden text-left lg:block">
              <p className="max-w-32 truncate text-sm font-medium text-white">
                {fullName}
              </p>

              <p className="max-w-32 truncate text-xs text-gray-500">
                @{user?.username || "user"}
              </p>
            </div>
          </button>

        </div>
      </div>
    </header>
  );
}