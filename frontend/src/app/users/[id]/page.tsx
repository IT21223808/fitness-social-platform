"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/api";
import {
  ArrowLeft,
  MessageCircle,
  Send,
} from "lucide-react";

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

type Comment = {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
};

export default function PostCommentsPage() {
  const params = useParams();
  const router = useRouter();

  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadPost() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<Post>(
        `/posts/${postId}`
      );

      setPost(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load post"
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    try {
      const data = await apiRequest<Comment[]>(
        `/posts/${postId}/comments`
      );

      setComments(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load comments"
      );
    }
  }

  useEffect(() => {
    if (postId) {
      loadPost();
      loadComments();
    }
  }, [postId]);

  async function handleComment(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setCommentLoading(true);
      setError("");

      await apiRequest(
        `/posts/${postId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            content: content.trim(),
          }),
        }
      );

      setContent("");

      await loadComments();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to add comment"
      );
    } finally {
      setCommentLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-3xl">

            {/* Back */}
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {/* Loading */}
            {loading && (
              <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
                <p className="text-sm text-slate-500">
                  Loading post...
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Post */}
            {!loading && post && (
              <article className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10B981]/20 font-semibold text-[#10B981]">
                    {post.username
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      {post.username}
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(
                        post.createdAt
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

                {post.description && (
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                    {post.description}
                  </p>
                )}

                {post.media &&
                  post.media.length > 0 && (
                    <div className="mt-5 space-y-3">
                      {post.media.map((media) => (
                        <div
                          key={media.id}
                          className="overflow-hidden rounded-xl bg-[#0B0F17]"
                        >
                          {media.mediaType ===
                          "VIDEO" ? (
                            <video
                              src={media.mediaUrl}
                              controls
                              className="max-h-[500px] w-full object-contain"
                            />
                          ) : (
                            <img
                              src={media.mediaUrl}
                              alt="Post media"
                              className="max-h-[500px] w-full object-contain"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </article>
            )}

            {/* Comments */}
            {!loading && post && (
              <section className="mt-6 rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                    <MessageCircle className="h-5 w-5 text-[#10B981]" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Comments
                    </h2>

                    <p className="text-xs text-slate-500">
                      {comments.length}{" "}
                      {comments.length === 1
                        ? "comment"
                        : "comments"}
                    </p>
                  </div>
                </div>

                {/* Add Comment */}
                <form
                  onSubmit={handleComment}
                  className="mt-5 flex gap-3"
                >
                  <input
                    type="text"
                    value={content}
                    onChange={(e) =>
                      setContent(e.target.value)
                    }
                    placeholder="Write a comment..."
                    maxLength={500}
                    className="min-w-0 flex-1 rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                  />

                  <button
                    type="submit"
                    disabled={
                      commentLoading ||
                      !content.trim()
                    }
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {/* Comment List */}
                <div className="mt-6 space-y-3">
                  {comments.length === 0 && (
                    <div className="rounded-xl bg-[#0B0F17] p-6 text-center">
                      <p className="text-sm text-slate-500">
                        No comments yet.
                      </p>
                    </div>
                  )}

                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl bg-[#0B0F17] p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/10 text-sm font-semibold text-[#10B981]">
                          {comment.username
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {comment.username}
                            </p>

                            <span className="text-xs text-slate-600">
                              {new Date(
                                comment.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>

                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}