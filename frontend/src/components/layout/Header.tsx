"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  UserCircle,
  Heart,
  UserPlus,
  MessageCircle,
  Dumbbell,
  X,
  Loader2,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

type User = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
};

type Notification = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function getNotificationStyle(type: string) {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("LIKE")) {
    return {
      icon: Heart,
      color: "text-rose-400",
      background: "bg-rose-500/10",
    };
  }

  if (
    normalizedType.includes("FOLLOW") ||
    normalizedType.includes("FOLLOWER")
  ) {
    return {
      icon: UserPlus,
      color: "text-emerald-400",
      background: "bg-emerald-500/10",
    };
  }

  if (normalizedType.includes("COMMENT")) {
    return {
      icon: MessageCircle,
      color: "text-sky-400",
      background: "bg-sky-500/10",
    };
  }

  if (normalizedType.includes("WORKOUT")) {
    return {
      icon: Dumbbell,
      color: "text-amber-400",
      background: "bg-amber-500/10",
    };
  }

  return {
    icon: Bell,
    color: "text-emerald-400",
    background: "bg-emerald-500/10",
  };
}

function formatTime(date: string) {
  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return "";
  }

  const difference = Date.now() - notificationDate.getTime();

  if (difference < 0) {
    return notificationDate.toLocaleDateString();
  }

  const minutes = Math.floor(difference / 60000);
  const hours = Math.floor(difference / 3600000);
  const days = Math.floor(difference / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return notificationDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
}

export default function Header() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");

  const [popupOpen, setPopupOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data = await apiRequest<User>("/users/me");
        setUser(data);
      } catch (error) {
        console.error("Failed to load user:", error);
      }
    }

    void loadUser();
  }, []);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPopupOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function loadNotifications() {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const [data, unreadResponse] = await Promise.all([
        apiRequest<Notification[]>("/notifications"),
        apiRequest<number>("/notifications/unread-count"),
      ]);

      setNotifications(data);
      setUnreadCount(unreadResponse);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setNotificationError("Unable to load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  }

  function handleNotificationClick() {
    const nextOpen = !popupOpen;
    setPopupOpen(nextOpen);

    if (nextOpen) {
      void loadNotifications();
    }
  }

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    const value = search.trim();

    if (!value) {
      router.push("/explore");
      return;
    }

    router.push(`/explore?search=${encodeURIComponent(value)}`);
  }

  function handleViewAll() {
    setPopupOpen(false);
    router.push("/notifications");
  }

  const latestNotifications = notifications.slice(0, 5);

  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    user?.username ||
    "User";

  return (
    <header className="sticky top-0 z-40 border-b border-[#27303D] bg-[#0B0F17]/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 lg:px-8">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex max-w-md flex-1">
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search people or posts..."
              className="w-full rounded-xl border border-[#27303D] bg-[#141A23] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#10B981]"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notification popup */}
          <div className="relative" ref={popupRef}>
            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label="Notifications"
              aria-expanded={popupOpen}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                popupOpen
                  ? "border-[#10B981]/50 bg-[#10B981]/10 text-[#10B981]"
                  : "border-[#27303D] bg-[#141A23] text-gray-300 hover:border-[#10B981]/50 hover:text-[#10B981]"
              }`}
            >
              <Bell size={19} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#0B0F17] bg-[#10B981] px-1 text-[9px] font-bold text-[#06110D]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {popupOpen && (
              <div className="fixed left-3 right-3 top-[72px] z-50 overflow-hidden rounded-2xl border border-[#303D3A] bg-[#111722] shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[390px]">
                {/* Popup header */}
                <div className="flex items-center justify-between border-b border-[#252D40] px-4 py-4">
                  <div>
                    <h2 className="text-base font-semibold text-white">
                      Notifications
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${
                            unreadCount === 1 ? "" : "s"
                          }`
                        : "Stay updated with your community"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPopupOpen(false)}
                    aria-label="Close notifications"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-[#252D40] hover:text-white"
                  >
                    <X size={17} />
                  </button>
                </div>

                {/* Loading */}
                {loadingNotifications && (
                  <div className="px-5 py-10 text-center">
                    <Loader2
                      size={23}
                      className="mx-auto animate-spin text-[#10B981]"
                    />

                    <p className="mt-3 text-sm text-gray-400">
                      Loading notifications...
                    </p>
                  </div>
                )}

                {/* Error */}
                {!loadingNotifications && notificationError && (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm text-rose-400">
                      {notificationError}
                    </p>

                    <button
                      type="button"
                      onClick={() => void loadNotifications()}
                      className="mt-3 inline-flex items-center gap-2 rounded-lg border border-[#303D3A] px-3 py-2 text-xs text-gray-300 hover:bg-[#1B2332]"
                    >
                      <RefreshCw size={13} />
                      Try again
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!loadingNotifications &&
                  !notificationError &&
                  notifications.length === 0 && (
                    <div className="px-5 py-10 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10">
                        <Bell
                          size={23}
                          className="text-[#10B981]"
                        />
                      </div>

                      <p className="mt-3 text-sm font-medium text-white">
                        No notifications yet
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Your latest activity will appear here.
                      </p>
                    </div>
                  )}

                {/* Latest notifications */}
                {!loadingNotifications &&
                  !notificationError &&
                  latestNotifications.length > 0 && (
                    <div className="max-h-[350px] overflow-y-auto">
                      {latestNotifications.map((notification) => {
                        const style = getNotificationStyle(
                          notification.type
                        );

                        const Icon = style.icon;

                        return (
                          <button
                            type="button"
                            key={notification.id}
                            onClick={handleViewAll}
                            className={`flex w-full items-start gap-3 border-b border-[#252D40] px-4 py-3.5 text-left transition hover:bg-[#1A2231] ${
                              !notification.isRead
                                ? "bg-[#10B981]/[0.04]"
                                : ""
                            }`}
                          >
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.background} ${style.color}`}
                            >
                              <Icon size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-sm font-medium leading-5 text-gray-100">
                                {notification.message}
                              </p>

                              <p className="mt-1.5 text-xs text-gray-500">
                                {formatTime(notification.createdAt)}
                              </p>
                            </div>

                            {!notification.isRead && (
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#10B981]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                {/* View all */}
                <button
                  type="button"
                  onClick={handleViewAll}
                  className="flex w-full items-center justify-center gap-2 border-t border-[#252D40] bg-[#151B29] px-4 py-4 text-sm font-semibold text-[#10B981] transition hover:bg-[#10B981]/10 hover:text-[#34D399]"
                >
                  View All Notifications
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

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