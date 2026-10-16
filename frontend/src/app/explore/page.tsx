"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowUpRight,
  Clock3,
  Dumbbell,
  LoaderCircle,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  Utensils,
  X,
} from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PostCard, { type PostCardPost } from "@/components/post/PostCard";
import { apiRequest } from "@/lib/api";

type ExploreUser = {
  id: number;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  bio?: string | null;
};

type PageResponse<T> = {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

type CurrentUser = {
  id: number;
};

type Category = {
  label: string;
  type?: string;
  icon: typeof Activity;
};

const categories: Category[] = [
  { label: "All posts", icon: Activity },
  { label: "Workouts", type: "WORKOUT_STATUS", icon: Dumbbell },
  { label: "Workout plans", type: "WORKOUT_PLAN", icon: Dumbbell },
  { label: "Meal plans", type: "MEAL_PLAN", icon: Utensils },
];

const POSTS_PER_PAGE = 10;
const USERS_PER_PAGE = 8;

function buildQuery(
  search: string,
  page: number,
  size: number,
  type?: string,
  sort?: "RECENT" | "TRENDING"
) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search) {
    params.set("search", search);
  }
  if (type) {
    params.set("type", type);
  }
  if (sort) {
    params.set("sort", sort);
  }

  return params.toString();
}

function getDisplayName(user: ExploreUser) {
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
    || user.username;
}

function UserAvatar({ user }: { user: ExploreUser }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = getDisplayName(user).slice(0, 1).toUpperCase() || "U";

  if (user.profileImageUrl && !imageFailed) {
    const imageUrl = user.profileImageUrl.startsWith("http")
      ? user.profileImageUrl
      : `http://localhost:8080${user.profileImageUrl.startsWith("/") ? "" : "/"}${user.profileImageUrl}`;

    return (
      <Image
        src={imageUrl}
        alt=""
        width={44}
        height={44}
        unoptimized
        className="h-full w-full object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-emerald-400/10 text-sm font-semibold text-emerald-300">
      {initials}
    </span>
  );
}

export default function ExplorePage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<Category>(categories[0]);
  const [sort, setSort] = useState<"RECENT" | "TRENDING">("RECENT");
  const [users, setUsers] = useState<ExploreUser[]>([]);
  const [posts, setPosts] = useState<PostCardPost[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number>();
  const [postPage, setPostPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const [postTotal, setPostTotal] = useState(0);
  const [postsHaveMore, setPostsHaveMore] = useState(false);
  const [usersHaveMore, setUsersHaveMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMorePosts, setLoadingMorePosts] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);
  const [error, setError] = useState("");
  const [postsMoreError, setPostsMoreError] = useState("");
  const [usersMoreError, setUsersMoreError] = useState("");
  const [retry, setRetry] = useState(0);
  const activeQuery = useRef("");
  const postMoreLock = useRef(false);
  const userMoreLock = useRef(false);
  const postMoreController = useRef<AbortController | null>(null);
  const userMoreController = useRef<AbortController | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      300
    );

    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const queryKey = JSON.stringify([
      debouncedSearch,
      category.type ?? "",
      sort,
      retry,
    ]);
    const controller = new AbortController();
    activeQuery.current = queryKey;
    postMoreController.current?.abort();
    userMoreController.current?.abort();
    postMoreLock.current = false;
    userMoreLock.current = false;
    async function loadExplore() {
      if (activeQuery.current !== queryKey) {
        return;
      }

      setLoading(true);
      setError("");
      setPostsMoreError("");
      setUsersMoreError("");
      setPosts([]);
      setUsers([]);
      setPostPage(0);
      setUserPage(0);
      setPostTotal(0);
      setPostsHaveMore(false);
      setUsersHaveMore(false);

      try {
        const [postResult, userResult, currentUser] = await Promise.all([
          apiRequest<PageResponse<PostCardPost>>(
            `/explore/posts?${buildQuery(
              debouncedSearch,
              0,
              POSTS_PER_PAGE,
              category.type,
              sort
            )}`,
            { signal: controller.signal }
          ),
          apiRequest<PageResponse<ExploreUser>>(
            `/explore/users?${buildQuery(
              debouncedSearch,
              0,
              USERS_PER_PAGE
            )}`,
            { signal: controller.signal }
          ),
          apiRequest<CurrentUser>("/users/me", {
            signal: controller.signal,
          }),
        ]);

        if (activeQuery.current !== queryKey) {
          return;
        }

        setPosts(postResult.content);
        setPostPage(postResult.number);
        setPostTotal(postResult.totalElements);
        setPostsHaveMore(!postResult.last);
        setUsers(userResult.content);
        setUserPage(userResult.number);
        setUsersHaveMore(!userResult.last);
        setCurrentUserId(currentUser.id);
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }
        if (activeQuery.current === queryKey) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Explore could not be loaded. Please try again."
          );
        }
      } finally {
        if (activeQuery.current === queryKey) {
          setLoading(false);
        }
      }
    }

    const timeout = window.setTimeout(() => {
      void loadExplore();
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [debouncedSearch, category, sort, retry]);

  async function loadMorePosts() {
    if (!postsHaveMore || postMoreLock.current) {
      return;
    }

    postMoreLock.current = true;
    const queryKey = activeQuery.current;
    const controller = new AbortController();
    postMoreController.current = controller;
    setLoadingMorePosts(true);
    setPostsMoreError("");

    try {
      const result = await apiRequest<PageResponse<PostCardPost>>(
        `/explore/posts?${buildQuery(
          debouncedSearch,
          postPage + 1,
          POSTS_PER_PAGE,
          category.type,
          sort
        )}`,
        { signal: controller.signal }
      );

      if (activeQuery.current !== queryKey) {
        return;
      }

      setPosts((previous) => {
        const existingIds = new Set(previous.map((post) => post.id));
        return [
          ...previous,
          ...result.content.filter((post) => !existingIds.has(post.id)),
        ];
      });
      setPostPage(result.number);
      setPostTotal(result.totalElements);
      setPostsHaveMore(!result.last);
    } catch (loadError) {
      if (
        !(loadError instanceof DOMException) ||
        loadError.name !== "AbortError"
      ) {
        setPostsMoreError(
          loadError instanceof Error
            ? loadError.message
            : "More posts could not be loaded."
        );
      }
    } finally {
      if (activeQuery.current === queryKey) {
        postMoreLock.current = false;
        setLoadingMorePosts(false);
      }
    }
  }

  async function loadMoreUsers() {
    if (!usersHaveMore || userMoreLock.current) {
      return;
    }

    userMoreLock.current = true;
    const queryKey = activeQuery.current;
    const controller = new AbortController();
    userMoreController.current = controller;
    setLoadingMoreUsers(true);
    setUsersMoreError("");

    try {
      const result = await apiRequest<PageResponse<ExploreUser>>(
        `/explore/users?${buildQuery(
          debouncedSearch,
          userPage + 1,
          USERS_PER_PAGE
        )}`,
        { signal: controller.signal }
      );

      if (activeQuery.current !== queryKey) {
        return;
      }

      setUsers((previous) => {
        const existingIds = new Set(previous.map((user) => user.id));
        return [
          ...previous,
          ...result.content.filter((user) => !existingIds.has(user.id)),
        ];
      });
      setUserPage(result.number);
      setUsersHaveMore(!result.last);
    } catch (loadError) {
      if (
        !(loadError instanceof DOMException) ||
        loadError.name !== "AbortError"
      ) {
        setUsersMoreError(
          loadError instanceof Error
            ? loadError.message
            : "More people could not be loaded."
        );
      }
    } finally {
      if (activeQuery.current === queryKey) {
        userMoreLock.current = false;
        setLoadingMoreUsers(false);
      }
      }
  }

  const hasSearch = Boolean(debouncedSearch);

  return (
    <div className="min-h-screen bg-[#0B0F17] pt-20 lg:pt-0">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          <div className="mx-auto max-w-[1440px]">
            <section className="relative mb-8 overflow-hidden rounded-3xl border border-[#27303D] bg-gradient-to-br from-[#17231F] via-[#141A23] to-[#141A23] p-6 sm:p-9 lg:p-11">
              <div className="pointer-events-none absolute -right-16 -top-28 h-80 w-80 rounded-full border border-emerald-400/10" />
              <div className="pointer-events-none absolute -right-4 -top-16 h-56 w-56 rounded-full border border-emerald-400/10" />
              <div className="relative max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
                  <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                  COMMUNITY DISCOVERY
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Find your next source of{" "}
                  <span className="text-emerald-400">inspiration.</span>
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
                  Meet people who keep showing up, discover practical plans,
                  and find fresh ideas from across the fitness community.
                </p>

                <form
                  className="mt-7 flex max-w-2xl items-center gap-3 rounded-2xl border border-[#354052] bg-[#0B0F17]/80 px-4 shadow-lg shadow-black/10 transition focus-within:border-emerald-500/70 focus-within:ring-2 focus-within:ring-emerald-500/15"
                  role="search"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <Search
                    className="h-5 w-5 shrink-0 text-emerald-400"
                    aria-hidden="true"
                  />
                  <label className="sr-only" htmlFor="explore-search">
                    Search people and posts
                  </label>
                  <input
                    id="explore-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search people, workouts, plans..."
                    className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    autoComplete="off"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </form>
              </div>
            </section>

            <div className="mb-7 flex flex-col gap-4 border-b border-[#27303D] pb-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2" aria-label="Post categories">
                {categories.map((item) => {
                  const Icon = item.icon;
                  const selected = category.label === item.label;

                  return (
                    <button
                      key={item.label}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategory(item)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                        selected
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-[#27303D] bg-[#141A23] text-slate-400 hover:border-slate-600 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 self-start rounded-xl border border-[#27303D] bg-[#141A23] p-1 xl:self-auto">
                <button
                  type="button"
                  aria-pressed={sort === "RECENT"}
                  onClick={() => setSort("RECENT")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    sort === "RECENT"
                      ? "bg-[#27303D] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Clock3 className="h-4 w-4" aria-hidden="true" />
                  Recent
                </button>
                <button
                  type="button"
                  aria-pressed={sort === "TRENDING"}
                  onClick={() => setSort("TRENDING")}
                  title="Ranked by likes plus twice the comments, with newer posts first on ties"
                  className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
                    sort === "TRENDING"
                      ? "bg-[#27303D] text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <TrendingUp className="h-4 w-4" aria-hidden="true" />
                  Trending
                </button>
              </div>
            </div>

            {error && !loading ? (
              <div
                className="rounded-2xl border border-red-400/20 bg-red-400/5 p-8 text-center"
                role="alert"
              >
                <p className="font-medium text-red-300">
                  Explore could not be loaded
                </p>
                <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => setRetry((attempt) => attempt + 1)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-300/20 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try again
                </button>
              </div>
            ) : (
              <div className="grid items-start gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="min-w-0">
                  <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
                    <div className="border-b border-[#27303D] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                            <Users className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <h2 className="font-semibold text-white">
                              Community
                            </h2>
                            <p className="mt-0.5 text-xs text-slate-500">
                              People to discover
                            </p>
                          </div>
                        </div>
                        <ArrowUpRight
                          className="mt-1 h-4 w-4 text-slate-600"
                          aria-hidden="true"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-[#27303D]/70">
                      {loading ? (
                        Array.from({ length: 4 }, (_, index) => (
                          <div key={index} className="flex animate-pulse gap-3 p-4">
                            <div className="h-11 w-11 rounded-full bg-[#27303D]" />
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-3 w-2/3 rounded bg-[#27303D]" />
                              <div className="h-2.5 w-1/3 rounded bg-[#27303D]" />
                            </div>
                          </div>
                        ))
                      ) : users.length === 0 ? (
                        <p className="px-5 py-8 text-center text-sm text-slate-500">
                          {hasSearch
                            ? "No people match your search."
                            : "No new community members to show right now."}
                        </p>
                      ) : (
                        users.map((user) => (
                          <div
                            key={user.id}
                            className="flex items-start gap-3 p-4 transition hover:bg-white/[0.02]"
                          >
                            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
                              <UserAvatar user={user} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-white">
                                {getDisplayName(user)}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                @{user.username}
                              </p>
                              {user.bio && (
                                <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-400">
                                  {user.bio}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => router.push(`/users/${user.id}`)}
                                className="mt-2 text-xs font-semibold text-emerald-400 transition hover:text-emerald-300 focus-visible:outline-none focus-visible:underline"
                              >
                                View profile
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {!loading && usersHaveMore && (
                      <div className="border-t border-[#27303D] p-4">
                        {usersMoreError && (
                          <p className="mb-3 text-xs text-red-300" role="alert">
                            {usersMoreError}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => void loadMoreUsers()}
                          disabled={loadingMoreUsers}
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#27303D] px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          {loadingMoreUsers ? (
                            <LoaderCircle
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <Users className="h-4 w-4" aria-hidden="true" />
                          )}
                          {loadingMoreUsers ? "Loading people..." : "Show more people"}
                        </button>
                      </div>
                    )}
                  </div>
                </aside>

                <section className="min-w-0" aria-labelledby="community-posts">
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        {sort === "TRENDING" ? (
                          <TrendingUp
                            className="h-5 w-5 text-emerald-400"
                            aria-hidden="true"
                          />
                        ) : (
                          <Activity
                            className="h-5 w-5 text-emerald-400"
                            aria-hidden="true"
                          />
                        )}
                        <h2
                          id="community-posts"
                          className="text-lg font-semibold text-white"
                        >
                          {sort === "TRENDING"
                            ? "Trending in the community"
                            : "Community posts"}
                        </h2>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {sort === "TRENDING"
                          ? "Popular posts ranked by real likes and comments."
                          : "Fresh ideas, training updates, and plans from members."}
                      </p>
                    </div>
                    {!loading && (
                      <span className="text-xs font-medium text-slate-500">
                        {postTotal} {postTotal === 1 ? "post" : "posts"}
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="space-y-5" aria-label="Loading posts">
                      {Array.from({ length: 2 }, (_, index) => (
                        <div
                          key={index}
                          className="animate-pulse rounded-2xl border border-[#27303D] bg-[#141A23] p-5"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-11 w-11 rounded-full bg-[#27303D]" />
                            <div className="space-y-2">
                              <div className="h-3 w-32 rounded bg-[#27303D]" />
                              <div className="h-2.5 w-20 rounded bg-[#27303D]" />
                            </div>
                          </div>
                          <div className="mt-5 space-y-2">
                            <div className="h-3 w-full rounded bg-[#27303D]" />
                            <div className="h-3 w-4/5 rounded bg-[#27303D]" />
                          </div>
                          <div className="mt-5 h-56 rounded-xl bg-[#27303D]/70" />
                        </div>
                      ))}
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] px-6 py-16 text-center">
                      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 text-emerald-300">
                        <Search className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <h3 className="mt-4 font-semibold text-white">
                        {hasSearch ? "No matching posts" : "Nothing here yet"}
                      </h3>
                      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                        {hasSearch
                          ? "Try a different phrase or broaden your category filters."
                          : "There are no posts in this category yet. Check another category or come back later."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-5">
                        {posts.map((post) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            initialCurrentUserId={currentUserId}
                          />
                        ))}
                      </div>
                      {postsMoreError && (
                        <p className="mt-4 text-center text-sm text-red-300" role="alert">
                          {postsMoreError}
                        </p>
                      )}
                      {postsHaveMore && (
                        <button
                          type="button"
                          onClick={() => void loadMorePosts()}
                          disabled={loadingMorePosts}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[#27303D] bg-[#141A23] px-4 py-3 text-sm font-medium text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                        >
                          {loadingMorePosts ? (
                            <LoaderCircle
                              className="h-4 w-4 animate-spin"
                              aria-hidden="true"
                            />
                          ) : (
                            <RefreshCw
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                          {loadingMorePosts ? "Loading posts..." : "Load more posts"}
                        </button>
                      )}
                    </>
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
