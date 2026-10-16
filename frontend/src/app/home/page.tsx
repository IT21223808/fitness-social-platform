
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PostCard from "@/components/post/PostCard";
import CreatePost from "@/components/post/CreatePost";
import { apiRequest } from "@/lib/api";

type WorkoutExercise = {
  id: number;
  exerciseName: string;
  sets: number;
  reps: number;
  duration?: number;
};

type WorkoutPlan = {
  id: number;
  userId: number;
  username: string;
  title: string;
  description?: string;
  imageUrl?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt?: string;
};

type Meal = {
  id: number;
  mealName: string;
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

type MealPlan = {
  id: number;
  userId: number;
  username: string;
  title: string;
  description?: string;
  imageUrl?: string;
  meals: Meal[];
  createdAt: string;
  updatedAt?: string;
};

type SuggestedUser = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string | null;
};

type Post = {
  id: number;
  userId: number;
  username: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  media?: {
    id: number;
    mediaUrl: string;
    mediaType: string;
    displayOrder: number;
  }[];
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
};

export default function Home() {
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);

  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Post[]>("/feed");
      setPosts(data);
    } catch (error) {
      console.error("Failed to load feed:", error);

      setError(
        error instanceof Error ? error.message : "Failed to load feed"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSuggestedUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const [users, currentUser] = await Promise.all([
        apiRequest<SuggestedUser[]>("/users"),
        apiRequest<SuggestedUser>("/users/me"),
      ]);

      setSuggestedUsers(
        users
          .filter((user) => user.id !== currentUser.id)
          .slice(0, 5)
      );
    } catch (error) {
      console.error("Failed to load suggested users:", error);
      setSuggestedUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    setAuthenticated(true);
    setAuthChecking(false);
  }, [router]);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    loadFeed();
    loadSuggestedUsers();
  }, [authenticated, loadFeed, loadSuggestedUsers]);

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0F17]">
        <div className="text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />
          <p className="mt-3 text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="pt-20 p-4 sm:p-6 lg:p-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-medium text-[#10B981]">
                Welcome back 👋
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Your Fitness Feed
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Stay connected. Stay active. Keep progressing.
              </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
              <section className="min-w-0 space-y-5">
                <CreatePost onPostCreated={loadFeed} />

                {loading && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />
                    <p className="mt-3 text-sm text-slate-500">
                      Loading your feed...
                    </p>
                  </div>
                )}

                {!loading && error && (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
                    <p className="text-sm text-red-400">{error}</p>

                    <button
                      type="button"
                      onClick={loadFeed}
                      className="mt-3 text-sm font-medium text-[#10B981] hover:text-[#059669]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {!loading && !error && posts.length === 0 && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10 text-2xl">
                      🏋️
                    </div>

                    <h2 className="mt-4 font-semibold text-white">
                      Your feed is empty
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Follow fitness enthusiasts and share your first workout
                      to start building your feed.
                    </p>
                  </div>
                )}

                {!loading &&
                  !error &&
                  posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
              </section>

              <aside className="hidden space-y-5 xl:block">
                <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                      Your Progress
                    </h2>

                    <span className="text-xs text-[#10B981]">
                      This week
                    </span>
                  </div>

                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Weekly Goal</span>
                      <span className="font-medium text-[#10B981]">
                        75%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#27303D]">
                      <div className="h-full w-[75%] rounded-full bg-[#10B981]" />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#0B0F17] p-3">
                      <p className="text-xs text-slate-500">Workouts</p>
                      <p className="mt-1 text-lg font-bold text-white">4</p>
                    </div>

                    <div className="rounded-xl bg-[#0B0F17] p-3">
                      <p className="text-xs text-slate-500">Streak</p>
                      <p className="mt-1 text-lg font-bold text-white">
                        7 days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-white">
                      Suggested Users
                    </h2>

                    <button
                      type="button"
                      onClick={() => router.push("/explore")}
                      className="text-xs font-medium text-[#10B981] hover:text-[#059669]"
                    >
                      See all
                    </button>
                  </div>

                  {usersLoading ? (
                    <div className="py-6 text-center">
                      <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />
                      <p className="mt-3 text-xs text-slate-500">
                        Loading users...
                      </p>
                    </div>
                  ) : suggestedUsers.length === 0 ? (
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      No other users to suggest right now.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {suggestedUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#27303D] bg-[#0B0F17] text-sm font-semibold text-[#10B981]">
                            {user.profileImageUrl ? (
                              <img
                                src={
                                  user.profileImageUrl.startsWith("http")
                                    ? user.profileImageUrl
                                    : `${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "")}${user.profileImageUrl}`
                                }
                                alt={`${user.username}'s profile`}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              user.username.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-white">
                              {user.firstName || user.lastName
                                ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
                                : user.username}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              @{user.username}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
