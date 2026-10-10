"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Send,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type Comment = {
  id: number;
  userId: number;
  username: string;
  content: string;
  createdAt: string;
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

export default function PostPage() {
  const params = useParams();
  const router = useRouter();

  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        setError("");

        const [postData, commentData] = await Promise.all([
          apiRequest<Post>(`/posts/${postId}`),
          apiRequest<Comment[]>(`/posts/${postId}/comments`),
        ]);

        setPost(postData);
        setComments(commentData);
      } catch (error) {
        console.error("Failed to load post:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load post"
        );
      } finally {
        setLoading(false);
      }
    }

    if (postId) {
      loadPost();
    }
  }, [postId]);

  async function handleComment() {
    if (!comment.trim() || commentLoading) {
      return;
    }

    try {
      setCommentLoading(true);

      const newComment = await apiRequest<Comment>(
        `/posts/${postId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({
            content: comment.trim(),
          }),
        }
      );

      setComments((current) => [
        ...current,
        newComment,
      ]);

      setComment("");
    } catch (error) {
      console.error("Comment failed:", error);
    } finally {
      setCommentLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />

            <p className="mt-3 text-sm text-slate-500">
              Loading post...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0B0F17] px-6 text-white">
        <div className="mx-auto max-w-2xl pt-20 text-center">

          <p className="text-sm text-red-400">
            {error || "Post not found"}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F17]">

      <main className="px-6 py-8 lg:px-8">

        <div className="mx-auto max-w-2xl">

          {/* Back */}
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Post */}
          <article className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">

            {/* User */}
            <div className="flex items-center gap-3 p-5">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10B981]/20 font-semibold text-[#10B981]">
                {post.username?.charAt(0).toUpperCase() || "U"}
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {post.username}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>

            </div>

            {/* Description */}
            {post.description && (
              <p className="px-5 pb-4 text-sm leading-6 text-slate-300">
                {post.description}
              </p>
            )}

            {/* Media */}
            {post.media && post.media.length > 0 && (
              <div className="space-y-2">

                {post.media.map((media) => (
                  <div
                    key={media.id}
                    className="overflow-hidden bg-[#0B0F17]"
                  >
                    {media.mediaType === "VIDEO" ? (
                      <video
                        src={media.mediaUrl}
                        controls
                        className="max-h-[600px] w-full object-contain"
                      />
                    ) : (
                      <img
                        src={media.mediaUrl}
                        alt="Post media"
                        className="max-h-[600px] w-full object-contain"
                      />
                    )}
                  </div>
                ))}

              </div>
            )}

            {/* Basic Actions */}
            <div className="mx-5 border-t border-[#27303D]" />

            <div className="flex items-center gap-6 px-5 py-3 text-sm text-slate-400">

              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Like
              </span>

              <span className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                {comments.length} Comments
              </span>

            </div>

          </article>

          {/* Comments */}
          <section className="mt-5 rounded-2xl border border-[#27303D] bg-[#141A23]">

            <div className="border-b border-[#27303D] p-5">

              <h2 className="font-semibold text-white">
                Comments
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Join the conversation
              </p>

            </div>

            {/* Comment List */}
            <div className="divide-y divide-[#27303D]">

              {comments.length === 0 ? (
                <div className="p-8 text-center">

                  <MessageCircle className="mx-auto h-7 w-7 text-slate-600" />

                  <p className="mt-3 text-sm text-slate-500">
                    No comments yet.
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Be the first to comment.
                  </p>

                </div>
              ) : (
                comments.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-5"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-sm font-semibold text-[#10B981]">
                      {item.username
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">

                      <div className="rounded-2xl bg-[#0B0F17] px-4 py-3">

                        <p className="text-sm font-semibold text-white">
                          {item.username}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-slate-400">
                          {item.content}
                        </p>

                      </div>

                      <p className="mt-1 px-2 text-[11px] text-slate-600">
                        {new Date(
                          item.createdAt
                        ).toLocaleString()}
                      </p>

                    </div>

                  </div>
                ))
              )}

            </div>

            {/* Add Comment */}
            <div className="border-t border-[#27303D] p-4">

              <div className="flex items-end gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-sm font-semibold text-[#10B981]">
                  J
                </div>

                <div className="flex flex-1 items-end gap-2">

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    rows={1}
                    className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                  />

                  <button
                    type="button"
                    onClick={handleComment}
                    disabled={
                      !comment.trim() ||
                      commentLoading
                    }
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981] text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                  </button>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}