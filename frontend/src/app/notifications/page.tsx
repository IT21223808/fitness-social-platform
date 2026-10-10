"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  Dumbbell,
  CheckCheck,
  Loader2,
  Settings2,
  Sparkles,
  Clock3,
  RefreshCw,
  Inbox,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

type Notification = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type FilterType = "ALL" | "UNREAD";

function getNotificationStyle(type: string) {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("LIKE")) {
    return {
      icon: Heart,
      color: "text-rose-400",
      background: "bg-rose-500/10",
      border: "border-rose-500/15",
      label: "Like",
    };
  }

  if (
    normalizedType.includes("FOLLOW") ||
    normalizedType.includes("FOLLOWER")
  ) {
    return {
      icon: UserPlus,
      color: "text-violet-400",
      background: "bg-violet-500/10",
      border: "border-violet-500/15",
      label: "Follow",
    };
  }

  if (normalizedType.includes("COMMENT")) {
    return {
      icon: MessageCircle,
      color: "text-sky-400",
      background: "bg-sky-500/10",
      border: "border-sky-500/15",
      label: "Comment",
    };
  }

  if (normalizedType.includes("WORKOUT")) {
    return {
      icon: Dumbbell,
      color: "text-amber-400",
      background: "bg-amber-500/10",
      border: "border-amber-500/15",
      label: "Workout",
    };
  }

  return {
    icon: Bell,
    color: "text-violet-400",
    background: "bg-violet-500/10",
    border: "border-violet-500/15",
    label: "Activity",
  };
}

function formatDate(date: string) {
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
    year:
      notificationDate.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
}

function getDateGroup(date: string): string {
  const notificationDate = new Date(date);

  if (Number.isNaN(notificationDate.getTime())) {
    return "Earlier";
  }

  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (notificationDate >= today) {
    return "Today";
  }

  if (notificationDate >= yesterday) {
    return "Yesterday";
  }

  return "Earlier";
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Notification[]>("/notifications");

      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
      setError("Unable to load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "UNREAD") {
      return notifications.filter(
        (notification) => !notification.isRead
      );
    }

    return notifications;
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    const groups: { title: string; items: Notification[] }[] = [];

    for (const title of ["Today", "Yesterday", "Earlier"]) {
      const items = filteredNotifications.filter(
        (notification) => getDateGroup(notification.createdAt) === title
      );

      if (items.length > 0) {
        groups.push({ title, items });
      }
    }

    return groups;
  }, [filteredNotifications]);

  async function handleMarkAllAsRead() {
    if (unreadCount === 0 || markingAllRead) {
      return;
    }

    try {
      setMarkingAllRead(true);
      setError("");

      await apiRequest<void>("/notifications/read-all", {
        method: "PUT",
      });

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
      setError("Unable to update notifications. Please try again.");
    } finally {
      setMarkingAllRead(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <main className="mx-auto w-full max-w-3xl px-4 py-7 sm:px-6 sm:py-10">
        {/* Page heading */}
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                <Bell size={21} className="text-violet-400" />
              </div>

              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                Your activity
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Notifications
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-400">
              Stay connected with your fitness community.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadNotifications()}
            disabled={loading}
            aria-label="Refresh notifications"
            title="Refresh notifications"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#293044] bg-[#141A27] text-gray-400 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </header>

        {/* Summary card */}
        <section className="relative mb-6 overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#211A3A] via-[#17182C] to-[#121826] p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-500/15">
                <Sparkles size={26} className="text-violet-300" />
              </div>

              <div>
                <p className="text-sm text-gray-400">
                  Your unread activity
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {unreadCount}
                  </span>

                  <span className="text-sm text-gray-400">
                    {unreadCount === 1
                      ? "new notification"
                      : "new notifications"}
                  </span>
                </div>
              </div>
            </div>

            {unreadCount > 0 && (
              <span className="hidden rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 sm:inline-flex">
                New activity
              </span>
            )}
          </div>
        </section>

        {/* Filters and mark as read */}
        <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div
            className="inline-flex rounded-xl border border-[#252D40] bg-[#111722] p-1"
            aria-label="Filter notifications"
          >
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              aria-pressed={activeFilter === "ALL"}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === "ALL"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              All
              <span className="ml-2 text-xs opacity-75">
                {notifications.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter("UNREAD")}
              aria-pressed={activeFilter === "UNREAD"}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === "UNREAD"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-950/30"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAllRead || loading}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {markingAllRead ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <CheckCheck size={16} />
              )}

              {markingAllRead ? "Updating..." : "Mark all as read"}
            </button>
          )}
        </section>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#252D40] bg-[#111722] px-6 py-16 text-center">
            <Loader2
              size={28}
              className="mx-auto mb-4 animate-spin text-violet-400"
            />

            <p className="text-sm font-medium text-gray-300">
              Loading notifications
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Fetching your latest activity...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-12 text-center"
          >
            <Bell size={28} className="mx-auto mb-3 text-rose-400" />

            <h2 className="font-semibold text-white">
              Something went wrong
            </h2>

            <p className="mt-2 text-sm text-gray-400">{error}</p>

            <button
              type="button"
              onClick={() => void loadNotifications()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="rounded-2xl border border-[#252D40] bg-[#111722] px-6 py-16 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-500/15 bg-violet-500/10">
              {activeFilter === "UNREAD" ? (
                <CheckCheck size={29} className="text-violet-300" />
              ) : (
                <Inbox size={29} className="text-violet-300" />
              )}
            </div>

            <h2 className="text-lg font-semibold text-white">
              {activeFilter === "UNREAD"
                ? "You're all caught up!"
                : "No notifications yet"}
            </h2>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-400">
              {activeFilter === "UNREAD"
                ? "There are no unread notifications. Come back when your community has something new to share."
                : "When someone follows you, likes your post, or leaves a comment, you'll see it here."}
            </p>

            {activeFilter === "UNREAD" && notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveFilter("ALL")}
                className="mt-5 rounded-xl border border-violet-500/30 px-4 py-2 text-sm font-medium text-violet-300 transition hover:bg-violet-500/10"
              >
                View all notifications
              </button>
            )}
          </div>
        )}

        {/* Notification groups */}
        {!loading && !error && filteredNotifications.length > 0 && (
          <div className="space-y-7">
            {groupedNotifications.map((group) => (
              <section key={group.title}>
                <div className="mb-3 flex items-center gap-2 px-1">
                  {group.title === "Today" ? (
                    <Sparkles size={15} className="text-violet-400" />
                  ) : (
                    <Clock3 size={15} className="text-gray-500" />
                  )}

                  <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {group.title}
                  </h2>

                  <span className="text-xs text-gray-600">
                    ({group.items.length})
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-[#252D40] bg-[#111722]">
                  {group.items.map((notification, index) => {
                    const style = getNotificationStyle(notification.type);
                    const Icon = style.icon;

                    return (
                      <article
                        key={notification.id}
                        className={`group relative flex items-start gap-3 px-4 py-4 transition-colors duration-200 sm:gap-4 sm:px-5 ${
                          index !== group.items.length - 1
                            ? "border-b border-[#252D40]"
                            : ""
                        } ${
                          !notification.isRead
                            ? "bg-violet-500/[0.045] hover:bg-violet-500/[0.08]"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Unread accent */}
                        {!notification.isRead && (
                          <div className="absolute bottom-3 left-0 top-3 w-[3px] rounded-r-full bg-violet-400" />
                        )}

                        {/* Notification icon */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.border} ${style.background} ${style.color}`}
                        >
                          <Icon size={20} strokeWidth={1.8} />
                        </div>

                        {/* Message */}
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-sm font-medium ${
                                notification.isRead
                                  ? "text-gray-300"
                                  : "text-white"
                              }`}
                            >
                              {notification.message}
                            </span>

                            {!notification.isRead && (
                              <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-md px-2 py-1 text-[10px] font-semibold ${style.background} ${style.color}`}
                            >
                              {style.label}
                            </span>

                            <span className="text-xs text-gray-500">
                              {formatDate(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && !error && notifications.length > 0 && (
          <footer className="mt-8 flex items-center justify-center gap-2 pb-4 text-xs text-gray-600">
            <CheckCheck size={14} />
            <span>
              You're up to date with your activity
            </span>
          </footer>
        )}
      </main>
    </div>
  );
}