"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PostCard from "@/components/post/PostCard";
import { Search, Users } from "lucide-react";
import { apiRequest } from "@/lib/api";

type User = {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
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
};

export default function ExplorePage() {
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExplore() {
      try {
        setLoading(true);
        setError("");

        const [usersData, postsData] = await Promise.all([
          apiRequest<User[]>("/users"),
          apiRequest<Post[]>("/posts"),
        ]);

        setUsers(usersData);
        setPosts(postsData);
      } catch (error) {
        console.error("Failed to load explore:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load explore"
        );
      } finally {
        setLoading(false);
      }
    }

    loadExplore();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchText = search.toLowerCase();

    return (
      user.username?.toLowerCase().includes(searchText) ||
      user.firstName?.toLowerCase().includes(searchText) ||
      user.lastName?.toLowerCase().includes(searchText)
    );
  });

  const filteredPosts = posts.filter((post) => {
    if (!search.trim()) {
      return true;
    }

    return (
      post.description
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      post.username
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  });

  return (
<div className="min-h-screen bg-[#0B0F17] pt-20 lg:pt-0">
      <Sidebar />

      <div className="lg:pl-64">

        <Header />

        <main className="p-6 lg:p-8">

          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-8">

              <p className="text-sm font-medium text-[#10B981]">
                Discover
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Explore
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Discover people, workouts and fitness content.
              </p>

            </div>

            {/* Search */}
            <div className="relative mb-8 max-w-xl">

              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search people or posts..."
                className="h-12 w-full rounded-xl border border-[#27303D] bg-[#141A23] pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
              />

            </div>

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">

                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />

                <p className="mt-3 text-sm text-slate-500">
                  Discovering content...
                </p>

              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">

                <p className="text-sm text-red-400">
                  {error}
                </p>

              </div>
            )}

            {!loading && !error && (
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

                {/* Users */}
                <aside>

                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                        <Users className="h-5 w-5 text-[#10B981]" />
                      </div>

                      <div>
                        <h2 className="font-semibold text-white">
                          People
                        </h2>

                        <p className="text-xs text-slate-500">
                          Find fitness members
                        </p>
                      </div>

                    </div>

                    <div className="mt-5 space-y-2">

                      {filteredUsers.length === 0 ? (
                        <p className="py-5 text-center text-sm text-slate-500">
                          No users found.
                        </p>
                      ) : (
                        filteredUsers.slice(0, 8).map((user) => {

                          const name =
                            `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim() || user.username;

                          const initial =
                            user.firstName?.charAt(0).toUpperCase() ||
                            user.username?.charAt(0).toUpperCase() ||
                            "U";

                          return (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() =>
                                router.push(`/users/${user.id}`)
                              }
                              className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-[#0B0F17]"
                            >

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-sm font-semibold text-[#10B981]">
                                {initial}
                              </div>

                              <div className="min-w-0">

                                <p className="truncate text-sm font-semibold text-white">
                                  {name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  @{user.username}
                                </p>

                              </div>

                            </button>
                          );
                        })
                      )}

                    </div>

                  </div>

                </aside>

                {/* Posts */}
                <section className="min-w-0">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Explore Posts
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Fresh content from the community.
                      </p>
                    </div>

                    <span className="text-xs text-slate-500">
                      {filteredPosts.length} posts
                    </span>

                  </div>

                  {filteredPosts.length === 0 ? (
                    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">

                      <p className="text-sm text-slate-500">
                        No posts found.
                      </p>

                    </div>
                  ) : (
                    <div className="space-y-5">

                      {filteredPosts.map((post) => (
                        <PostCard
                          key={post.id}
                          post={post}
                        />
                      ))}

                    </div>
                  )}

                </section>

              </div>
            )}

          </div>

        </main>

      </div>

    </div>
  );
}