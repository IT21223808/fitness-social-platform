"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PostCard from "@/components/post/PostCard";
import {
  MapPin,
  CalendarDays,
  Settings,
  Dumbbell,
  Flame,
  Users,
  X,
  Check,
  Loader2,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type User = {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  createdAt?: string;
};

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

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const currentUser = await apiRequest<User>("/users/me");

      setUser(currentUser);
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setProfileImageUrl(currentUser.profileImageUrl || "");

      const [followersCount, followingCount, allPosts] =
        await Promise.all([
          apiRequest<number>(
            `/users/${currentUser.id}/followers/count`
          ),
          apiRequest<number>(
            `/users/${currentUser.id}/following/count`
          ),
          apiRequest<Post[]>("/posts"),
        ]);

      setFollowers(followersCount);
      setFollowing(followingCount);

      const myPosts = allPosts.filter(
        (post) => post.userId === currentUser.id
      );

      setPosts(myPosts);
    } catch (error) {
      console.error("Failed to load profile:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setFormError("");

      const updatedUser = await apiRequest<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          profileImageUrl: profileImageUrl.trim(),
        }),
      });

      setUser(updatedUser);
      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setProfileImageUrl(updatedUser.profileImageUrl || "");
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
<div className="min-h-screen bg-[#0B0F17] pt-20 lg:pt-0">        <Sidebar />

        <div className="lg:pl-64">
          <Header />

          <main className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />

              <p className="mt-3 text-sm text-slate-500">
                Loading profile...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F17]">
        <Sidebar />

        <div className="lg:pl-64">
          <Header />

          <main className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="text-center">
              <p className="text-sm text-red-400">
                {error || "Profile not found"}
              </p>

              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Go Home
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username;

  const initial =
    user.firstName?.charAt(0).toUpperCase() ||
    user.username?.charAt(0).toUpperCase() ||
    "U";

  const joinedYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  const profileImage = user.profileImageUrl || "";

  return (
    <div className="min-h-screen bg-[#0B0F17]">

      <Sidebar />

      <div className="lg:pl-64">

        <Header />

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* Profile Header */}
            <section className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">

              {/* Cover */}
              <div className="h-40 bg-gradient-to-r from-[#10B981]/30 via-[#14B8A6]/20 to-[#84CC16]/20" />

              {/* Profile Info */}
              <div className="px-6 pb-6">

                <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                  <div className="flex items-end gap-4">

                    {/* Avatar */}
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#141A23] bg-[#10B981]/20 text-3xl font-bold text-[#10B981]">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initial
                      )}
                    </div>

                    <div className="pb-1">

                      <h1 className="text-2xl font-bold text-white">
                        {fullName}
                      </h1>

                      <p className="mt-1 text-sm text-slate-500">
                        @{user.username}
                      </p>

                    </div>

                  </div>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setEditing(true);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-[#10B981] hover:text-[#10B981]"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </button>

                </div>

                {editing && (
                  <div className="mt-6 rounded-2xl border border-[#27303D] bg-[#0B0F17] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">
                        Edit profile
                      </h2>

                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-[#1A2231] hover:text-white"
                        aria-label="Close editor"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {formError && (
                      <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                        {formError}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">First name</span>
                        <input
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="w-full rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                          placeholder="First name"
                        />
                      </label>

                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Last name</span>
                        <input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="w-full rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                          placeholder="Last name"
                        />
                      </label>
                    </div>

                    <label className="mt-4 block text-sm text-slate-300">
                      <span className="mb-2 block">Profile image URL</span>
                      <input
                        value={profileImageUrl}
                        onChange={(event) => setProfileImageUrl(event.target.value)}
                        className="w-full rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </label>

                    <div className="mt-5 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="rounded-xl border border-[#27303D] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-[#10B981] hover:text-white"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleSaveProfile()}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f9d74] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            Save changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div className="mt-5 max-w-2xl">

                  <p className="text-sm leading-6 text-slate-400">
                    {user.bio || "No bio added yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">

                    {user.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      Joined {joinedYear}
                    </span>

                  </div>

                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#27303D] pt-5 sm:max-w-lg">

                  <div className="text-center">

                    <p className="text-xl font-bold text-white">
                      {posts.length}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Posts
                    </p>

                  </div>

                  <div className="border-x border-[#27303D] text-center">

                    <p className="text-xl font-bold text-white">
                      {followers}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Followers
                    </p>

                  </div>

                  <div className="text-center">

                    <p className="text-xl font-bold text-white">
                      {following}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Following
                    </p>

                  </div>

                </div>

              </div>

            </section>

            {/* Content */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">

              {/* Posts */}
              <section>

                <div className="mb-5">

                  <h2 className="text-lg font-semibold text-white">
                    Your Posts
                  </h2>

                </div>

                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
                      <Dumbbell className="h-6 w-6 text-[#10B981]" />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      No posts yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Share your workouts, meals and progress
                      with the community.
                    </p>

                  </div>
                ) : (
                  <div className="space-y-5">

                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                      />
                    ))}

                  </div>
                )}

              </section>

              {/* Sidebar */}
              <aside className="space-y-5">

                {/* Fitness Stats */}
                <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                  <h2 className="font-semibold text-white">
                    Fitness Stats
                  </h2>

                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">

                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-[#10B981]" />

                        <span className="text-sm text-slate-400">
                          Posts
                        </span>
                      </div>

                      <span className="font-semibold text-white">
                        {posts.length}
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">

                      <div className="flex items-center gap-3">
                        <Flame className="h-4 w-4 text-[#84CC16]" />

                        <span className="text-sm text-slate-400">
                          Followers
                        </span>
                      </div>

                      <span className="font-semibold text-white">
                        {followers}
                      </span>

                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">

                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-[#14B8A6]" />

                        <span className="text-sm text-slate-400">
                          Following
                        </span>
                      </div>

                      <span className="font-semibold text-white">
                        {following}
                      </span>

                    </div>

                  </div>

                </div>

              </aside>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}