"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Heart,
  UserPlus,
  MessageCircle,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

import { apiRequest } from "@/lib/api";

type Notification = {
  id: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

function getNotificationIcon(type: string) {
  const normalizedType = type.toUpperCase();

  if (normalizedType.includes("LIKE")) {
    return <Heart size={19} />;
  }

  if (
    normalizedType.includes("FOLLOW") ||
    normalizedType.includes("FOLLOWER")
  ) {
    return <UserPlus size={19} />;
  }

  if (normalizedType.includes("COMMENT")) {
    return <MessageCircle size={19} />;
  }

  if (normalizedType.includes("WORKOUT")) {
    return <Dumbbell size={19} />;
  }

  return <Bell size={19} />;
}

function formatDate(date: string) {
  const notificationDate = new Date(date);
  const now = new Date();

  const difference =
    now.getTime() - notificationDate.getTime();

  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  if (days < 7) {
    return `${days}d`;
  }

  return notificationDate.toLocaleDateString();
}

export default function NotificationsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Notification[]>(
        "/notifications"
      );

      setNotifications(data);
    } catch (err) {
      console.error(err);

      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">

          <div>
            <div className="flex items-center gap-2">
              <Bell
                size={22}
                className="text-emerald-400"
              />

              <h1 className="text-2xl font-bold">
                Notifications
              </h1>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Stay updated with your fitness community.
            </p>
          </div>

          {unreadCount > 0 && (
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              {unreadCount} new
            </div>
          )}

        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
            <p className="text-sm text-gray-400">
              Loading notifications...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
            <p className="text-sm text-red-400">
              {error}
            </p>

            <button
              onClick={loadNotifications}
              className="mt-4 rounded-lg bg-[#141A23] px-4 py-2 text-xs text-white hover:bg-[#1B222D]"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          notifications.length === 0 && (
            <div className="rounded-2xl border border-[#27303D] bg-[#141A23] px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#0B0F17]">
                <Bell
                  size={25}
                  className="text-gray-500"
                />
              </div>

              <h2 className="text-sm font-semibold">
                No notifications yet
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                When someone interacts with you, you'll see it here.
              </p>

            </div>
          )}

        {/* Notification List */}
        {!loading &&
          !error &&
          notifications.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">

              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`flex items-center gap-4 px-5 py-4 transition hover:bg-[#1A212C] ${
                    index !== notifications.length - 1
                      ? "border-b border-[#27303D]"
                      : ""
                  } ${
                    !notification.isRead
                      ? "bg-emerald-500/[0.03]"
                      : ""
                  }`}
                >

                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      notification.isRead
                        ? "bg-[#0B0F17] text-gray-500"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">

                    <p
                      className={`text-sm leading-5 ${
                        notification.isRead
                          ? "text-gray-400"
                          : "font-medium text-white"
                      }`}
                    >
                      {notification.message}
                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {formatDate(notification.createdAt)}
                    </p>

                  </div>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400" />
                  )}

                  {/* Read icon */}
                  {notification.isRead && (
                    <CheckCircle2
                      size={16}
                      className="shrink-0 text-gray-700"
                    />
                  )}

                </div>
              ))}

            </div>
          )}

      </main>
    </div>
  );
}