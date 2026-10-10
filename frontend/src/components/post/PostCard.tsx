"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Heart,
    MessageCircle,
    MoreHorizontal,
    UserPlus,
    UserCheck,
    Pencil,
    Trash2,
    X,
    Check,
    Dumbbell,
    Utensils,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

const API_BASE_URL = "http://localhost:8080";

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

type User = {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
};

type PostCardProps = {
    post: Post;
};

export default function PostCard({ post }: PostCardProps) {
    const router = useRouter();

    const [currentUserId, setCurrentUserId] = useState<number | null>(null);

    const [liked, setLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    const [following, setFollowing] = useState(false);

    const [likeLoading, setLikeLoading] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [likeDataLoading, setLikeDataLoading] = useState(true);

    const [menuOpen, setMenuOpen] = useState(false);

    const [editing, setEditing] = useState(false);
    const [editDescription, setEditDescription] = useState(
        post.description
    );
    const [editLoading, setEditLoading] = useState(false);

    const [removingMediaId, setRemovingMediaId] =
        useState<number | null>(null);

    const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleted, setDeleted] = useState(false);

    const [actionError, setActionError] = useState("");

    const isOwnPost = currentUserId === post.userId;

    const isWorkoutPlan = post.type === "WORKOUT_PLAN";
    const isMealPlan = post.type === "MEAL_PLAN";
    const isPlanPost = isWorkoutPlan || isMealPlan;

    // Load current user
    useEffect(() => {
        async function loadCurrentUser() {
            try {
                const user = await apiRequest<User>("/users/me");
                setCurrentUserId(user.id);
            } catch (error) {
                console.error(
                    "Failed to load current user:",
                    error
                );
            }
        }

        loadCurrentUser();
    }, []);

    // Load like information
    useEffect(() => {
        async function loadLikeData() {
            try {
                setLikeDataLoading(true);

                const [count, isLiked] = await Promise.all([
                    apiRequest<number>(
                        `/posts/${post.id}/likes/count`
                    ),
                    apiRequest<boolean>(
                        `/posts/${post.id}/likes/me`
                    ),
                ]);

                setLikeCount(count);
                setLiked(isLiked);
            } catch (error) {
                console.error(
                    "Failed to load like data:",
                    error
                );
            } finally {
                setLikeDataLoading(false);
            }
        }

        loadLikeData();
    }, [post.id]);

    async function handleLike() {
        if (likeLoading) {
            return;
        }

        try {
            setLikeLoading(true);

            if (liked) {
                await apiRequest(`/posts/${post.id}/like`, {
                    method: "DELETE",
                });

                setLiked(false);
                setLikeCount((count) =>
                    Math.max(0, count - 1)
                );
            } else {
                await apiRequest(`/posts/${post.id}/like`, {
                    method: "POST",
                });

                setLiked(true);
                setLikeCount((count) => count + 1);
            }
        } catch (error) {
            console.error("Like failed:", error);
        } finally {
            setLikeLoading(false);
        }
    }

    async function handleFollow() {
        if (followLoading) {
            return;
        }

        try {
            setFollowLoading(true);

            if (following) {
                await apiRequest(
                    `/users/${post.userId}/follow`,
                    {
                        method: "DELETE",
                    }
                );

                setFollowing(false);
            } else {
                await apiRequest(
                    `/users/${post.userId}/follow`,
                    {
                        method: "POST",
                    }
                );

                setFollowing(true);
            }
        } catch (error) {
            console.error("Follow failed:", error);
        } finally {
            setFollowLoading(false);
        }
    }

    function handleComment() {
        router.push(`/posts/${post.id}`);
    }

    function handleEditStart() {
        // Plan post editing will be handled from
        // the corresponding plan page.
        if (isPlanPost) {
            if (isWorkoutPlan) {
                router.push(
                    `/workout-plans?edit=${post.workoutPlan?.id ?? ""}`
                );
            } else {
                router.push(
                    `/meal-plans?edit=${post.mealPlan?.id ?? ""}`
                );
            }

            return;
        }

        setActionError("");
        setEditDescription(post.description);
        setRemovedMediaIds([]);
        setEditing(true);
        setMenuOpen(false);
    }

    function handleEditCancel() {
        if (
            editLoading ||
            removingMediaId !== null
        ) {
            return;
        }

        setEditDescription(post.description);
        setRemovedMediaIds([]);
        setActionError("");
        setEditing(false);
    }

    async function handleRemoveMedia(
        mediaId: number
    ) {
        if (removingMediaId !== null) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to remove this media?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setRemovingMediaId(mediaId);
            setActionError("");

            await apiRequest(
                `/posts/${post.id}/media/${mediaId}`,
                {
                    method: "DELETE",
                }
            );

            setRemovedMediaIds((ids) => [
                ...ids,
                mediaId,
            ]);
        } catch (error) {
            console.error(
                "Remove media failed:",
                error
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to remove media"
            );
        } finally {
            setRemovingMediaId(null);
        }
    }

    async function handleEditSave() {
        if (
            editLoading ||
            removingMediaId !== null
        ) {
            return;
        }

        if (!editDescription.trim()) {
            setActionError(
                "Post description cannot be empty."
            );
            return;
        }

        try {
            setEditLoading(true);
            setActionError("");

            await apiRequest<Post>(
                `/posts/${post.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify({
                        description:
                            editDescription.trim(),
                        type: post.type,
                    }),
                }
            );

            post.description =
                editDescription.trim();

            setEditing(false);
            setRemovedMediaIds([]);
        } catch (error) {
            console.error(
                "Update post failed:",
                error
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to update post"
            );
        } finally {
            setEditLoading(false);
        }
    }

    async function handleDelete() {
        if (deleteLoading) {
            return;
        }

        const confirmed = window.confirm(
            isPlanPost
                ? "Are you sure you want to delete this plan post?"
                : "Are you sure you want to delete this post?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeleteLoading(true);
            setActionError("");

            /*
             * Plan posts are connected to their
             * Workout Plan / Meal Plan.
             *
             * We will connect these delete actions
             * to the plan delete endpoints in the
             * next step.
             */

            if (isWorkoutPlan) {
                await apiRequest(
                    `/workout-plans/${post.workoutPlan?.id}`,
                    {
                        method: "DELETE",
                    }
                );
            } else if (isMealPlan) {
                await apiRequest(
                    `/meal-plans/${post.mealPlan?.id}`,
                    {
                        method: "DELETE",
                    }
                );
            } else {
                await apiRequest(
                    `/posts/${post.id}`,
                    {
                        method: "DELETE",
                    }
                );
            }

            setDeleted(true);
        } catch (error) {
            console.error(
                "Delete failed:",
                error
            );

            setActionError(
                error instanceof Error
                    ? error.message
                    : "Failed to delete"
            );
        } finally {
            setDeleteLoading(false);
        }
    }

    if (deleted) {
        return null;
    }

    const visibleMedia =
        post.media?.filter(
            (media) =>
                !removedMediaIds.includes(
                    media.id
                )
        ) ?? [];

    return (
        <article className="overflow-visible rounded-2xl border border-[#27303D] bg-[#141A23]">

            {/* Header */}
            <div className="flex items-center justify-between p-5">

                <button
                    type="button"
                    onClick={() =>
                        router.push(
                            `/users/${post.userId}`
                        )
                    }
                    className="flex items-center gap-3"
                >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#10B981]/20 font-semibold text-[#10B981]">
                        {post.username
                            ?.charAt(0)
                            .toUpperCase() ||
                            "U"}
                    </div>

                    <div className="text-left">
                        <h3 className="text-sm font-semibold text-white">
                            {post.username}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                            {new Date(
                                post.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>
                </button>

                {/* More Menu */}
                {isOwnPost && (
                    <div className="relative">

                        <button
                            type="button"
                            onClick={() => {
                                setMenuOpen(
                                    (open) => !open
                                );
                                setActionError("");
                            }}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-[#1A212C] hover:text-white"
                            aria-label="Post options"
                        >
                            <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-11 z-50 w-44 overflow-hidden rounded-xl border border-[#27303D] bg-[#141A23] shadow-xl">

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(
                                            false
                                        );
                                        handleEditStart();
                                    }}
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-300 transition hover:bg-[#1A212C] hover:text-white"
                                >
                                    <Pencil className="h-4 w-4" />

                                    {isPlanPost
                                        ? "Edit Plan"
                                        : "Edit"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setMenuOpen(
                                            false
                                        );
                                        handleDelete();
                                    }}
                                    disabled={
                                        deleteLoading
                                    }
                                    className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                                >
                                    <Trash2 className="h-4 w-4" />

                                    {deleteLoading
                                        ? "Deleting..."
                                        : isPlanPost
                                            ? "Delete Plan"
                                            : "Delete"}
                                </button>

                            </div>
                        )}

                    </div>
                )}

            </div>

            {/* Plan Badge */}
            {isWorkoutPlan && (
                <div className="px-5 pb-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#10B981]/10 px-3 py-1.5 text-xs font-medium text-[#10B981]">
                        <Dumbbell className="h-3.5 w-3.5" />
                        Workout Plan
                    </div>
                </div>
            )}

            {isMealPlan && (
                <div className="px-5 pb-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[#14B8A6]/10 px-3 py-1.5 text-xs font-medium text-[#14B8A6]">
                        <Utensils className="h-3.5 w-3.5" />
                        Meal Plan
                    </div>
                </div>
            )}

            {/* Edit Form for Normal Posts */}
            {editing ? (
                <div className="px-5 pb-5">

                    <textarea
                        value={editDescription}
                        onChange={(e) =>
                            setEditDescription(
                                e.target.value
                            )
                        }
                        rows={4}
                        disabled={editLoading}
                        className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"
                        placeholder="Write something..."
                    />

                    {/* Edit Media */}
                    {visibleMedia.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-3 text-sm font-medium text-slate-300">
                                Media
                            </p>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {visibleMedia.map(
                                    (media) => (
                                        <div
                                            key={
                                                media.id
                                            }
                                            className="relative overflow-hidden rounded-xl border border-[#27303D] bg-[#0B0F17]"
                                        >
                                            {media.mediaType ===
                                            "VIDEO" ? (
                                                <video
                                                    src={`${API_BASE_URL}${media.mediaUrl}`}
                                                    controls
                                                    className="h-36 w-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={`${API_BASE_URL}${media.mediaUrl}`}
                                                    alt="Post media"
                                                    className="h-36 w-full object-cover"
                                                />
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRemoveMedia(
                                                        media.id
                                                    )
                                                }
                                                disabled={
                                                    removingMediaId ===
                                                        media.id ||
                                                    editLoading
                                                }
                                                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                                aria-label="Remove media"
                                            >
                                                {removingMediaId ===
                                                media.id ? (
                                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                ) : (
                                                    <X className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {actionError && (
                        <p className="mt-3 text-sm text-red-400">
                            {actionError}
                        </p>
                    )}

                    <div className="mt-4 flex justify-end gap-2">

                        <button
                            type="button"
                            onClick={
                                handleEditCancel
                            }
                            disabled={
                                editLoading ||
                                removingMediaId !==
                                    null
                            }
                            className="flex items-center gap-2 rounded-lg border border-[#27303D] px-3 py-2 text-sm text-slate-400 transition hover:bg-[#1A212C] hover:text-white disabled:opacity-50"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={
                                handleEditSave
                            }
                            disabled={
                                editLoading ||
                                removingMediaId !==
                                    null
                            }
                            className="flex items-center gap-2 rounded-lg bg-[#10B981] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Check className="h-4 w-4" />

                            {editLoading
                                ? "Saving..."
                                : "Save"}
                        </button>

                    </div>

                </div>
            ) : (
                <>
                    {/* Normal Post Description */}
                    {!isPlanPost &&
                        post.description && (
                            <div className="px-5 pb-4">
                                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-300">
                                    {
                                        post.description
                                    }
                                </p>
                            </div>
                        )}

                    {/* Workout Plan */}
                    {isWorkoutPlan &&
                        post.workoutPlan && (
                            <div className="px-5 pb-5">

                                <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#0B0F17]">

                                    {post.workoutPlan
                                        .imageUrl && (
                                        <img
                                            src={`${API_BASE_URL}${post.workoutPlan.imageUrl}`}
                                            alt={
                                                post.workoutPlan
                                                    .title
                                            }
                                            className="max-h-[420px] w-full object-cover"
                                        />
                                    )}

                                    <div className="p-5">

                                        <h2 className="text-xl font-bold text-white">
                                            {
                                                post.workoutPlan
                                                    .title
                                            }
                                        </h2>

                                        {post.workoutPlan
                                            .description && (
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                                {
                                                    post.workoutPlan
                                                        .description
                                                }
                                            </p>
                                        )}

                                        <div className="mt-5 space-y-3">

                                            {post.workoutPlan.exercises.map(
                                                (
                                                    exercise
                                                ) => (
                                                    <div
                                                        key={
                                                            exercise.id
                                                        }
                                                        className="rounded-xl border border-[#27303D] bg-[#141A23] p-4"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">

                                                            <div>
                                                                <h3 className="font-medium text-white">
                                                                    {
                                                                        exercise.exerciseName
                                                                    }
                                                                </h3>

                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    {exercise.sets}{" "}
                                                                    sets
                                                                    {" • "}
                                                                    {exercise.reps}{" "}
                                                                    reps
                                                                </p>
                                                            </div>

                                                            {exercise.duration !==
                                                                undefined &&
                                                                exercise.duration >
                                                                    0 && (
                                                                    <span className="rounded-lg bg-[#10B981]/10 px-2.5 py-1 text-xs text-[#10B981]">
                                                                        {
                                                                            exercise.duration
                                                                        }{" "}
                                                                        min
                                                                    </span>
                                                                )}
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>
                                </div>

                            </div>
                        )}

                    {/* Meal Plan */}
                    {isMealPlan &&
                        post.mealPlan && (
                            <div className="px-5 pb-5">

                                <div className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#0B0F17]">

                                    {post.mealPlan
                                        .imageUrl && (
                                        <img
                                            src={`${API_BASE_URL}${post.mealPlan.imageUrl}`}
                                            alt={
                                                post.mealPlan
                                                    .title
                                            }
                                            className="max-h-[420px] w-full object-cover"
                                        />
                                    )}

                                    <div className="p-5">

                                        <h2 className="text-xl font-bold text-white">
                                            {
                                                post.mealPlan
                                                    .title
                                            }
                                        </h2>

                                        {post.mealPlan
                                            .description && (
                                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                                                {
                                                    post.mealPlan
                                                        .description
                                                }
                                            </p>
                                        )}

                                        <div className="mt-5 space-y-3">

                                            {post.mealPlan.meals.map(
                                                (meal) => (
                                                    <div
                                                        key={
                                                            meal.id
                                                        }
                                                        className="rounded-xl border border-[#27303D] bg-[#141A23] p-4"
                                                    >

                                                        <div className="flex items-start justify-between gap-3">

                                                            <div>
                                                                <h3 className="font-medium text-white">
                                                                    {
                                                                        meal.mealName
                                                                    }
                                                                </h3>

                                                                <p className="mt-1 text-sm text-slate-400">
                                                                    {
                                                                        meal.foodName
                                                                    }
                                                                </p>
                                                            </div>

                                                            {meal.calories !==
                                                                undefined &&
                                                                meal.calories >
                                                                    0 && (
                                                                    <span className="rounded-lg bg-[#14B8A6]/10 px-2.5 py-1 text-xs text-[#14B8A6]">
                                                                        {
                                                                            meal.calories
                                                                        }{" "}
                                                                        kcal
                                                                    </span>
                                                                )}

                                                        </div>

                                                        <div className="mt-3 grid grid-cols-3 gap-2">

                                                            <div className="rounded-lg bg-[#0B0F17] p-2">
                                                                <p className="text-[10px] text-slate-500">
                                                                    Protein
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium text-white">
                                                                    {
                                                                        meal.protein ??
                                                                        0
                                                                    }{" "}
                                                                    g
                                                                </p>
                                                            </div>

                                                            <div className="rounded-lg bg-[#0B0F17] p-2">
                                                                <p className="text-[10px] text-slate-500">
                                                                    Carbs
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium text-white">
                                                                    {
                                                                        meal.carbs ??
                                                                        0
                                                                    }{" "}
                                                                    g
                                                                </p>
                                                            </div>

                                                            <div className="rounded-lg bg-[#0B0F17] p-2">
                                                                <p className="text-[10px] text-slate-500">
                                                                    Fats
                                                                </p>
                                                                <p className="mt-1 text-xs font-medium text-white">
                                                                    {
                                                                        meal.fats ??
                                                                        0
                                                                    }{" "}
                                                                    g
                                                                </p>
                                                            </div>

                                                        </div>

                                                    </div>
                                                )
                                            )}

                                        </div>

                                    </div>
                                </div>

                            </div>
                        )}
                </>
            )}

            {/* Action Error */}
            {!editing &&
                actionError && (
                    <div className="px-5 pb-4">
                        <p className="text-sm text-red-400">
                            {actionError}
                        </p>
                    </div>
                )}

            {/* Normal Post Media */}
            {visibleMedia.length > 0 && (
                <div className="space-y-2">
                    {visibleMedia.map(
                        (media) => (
                            <div
                                key={media.id}
                                className="overflow-hidden bg-[#0B0F17]"
                            >
                                {media.mediaType ===
                                "VIDEO" ? (
                                    <video
                                        src={`${API_BASE_URL}${media.mediaUrl}`}
                                        controls
                                        className="max-h-[500px] w-full object-contain"
                                    />
                                ) : (
                                    <img
                                        src={`${API_BASE_URL}${media.mediaUrl}`}
                                        alt="Post media"
                                        className="max-h-[500px] w-full object-contain"
                                    />
                                )}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Like / Comment Summary */}
            <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-500">

                <span>
                    {likeDataLoading
                        ? "Loading..."
                        : likeCount > 0
                            ? `${likeCount} ${
                                  likeCount === 1
                                      ? "like"
                                      : "likes"
                              }`
                            : "No likes yet"}
                </span>

            </div>

            {/* Actions */}
            <div className="mx-5 border-t border-[#27303D]" />

            <div className="flex items-center px-3 py-2">

                {/* Like */}
                <button
                    type="button"
                    onClick={handleLike}
                    disabled={
                        likeLoading ||
                        likeDataLoading
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                        liked
                            ? "text-red-400 hover:bg-red-400/10"
                            : "text-slate-400 hover:bg-[#1A212C] hover:text-red-400"
                    }`}
                >
                    <Heart
                        className="h-5 w-5"
                        fill={
                            liked
                                ? "currentColor"
                                : "none"
                        }
                    />

                    {liked
                        ? "Liked"
                        : "Like"}
                </button>

                {/* Comment */}
                <button
                    type="button"
                    onClick={handleComment}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-slate-400 transition hover:bg-[#1A212C] hover:text-[#10B981]"
                >
                    <MessageCircle className="h-5 w-5" />
                    Comment
                </button>

                {/* Follow */}
                <button
                    type="button"
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                        following
                            ? "text-[#10B981] hover:bg-[#10B981]/10"
                            : "text-slate-400 hover:bg-[#1A212C] hover:text-[#10B981]"
                    }`}
                >
                    {following ? (
                        <UserCheck className="h-5 w-5" />
                    ) : (
                        <UserPlus className="h-5 w-5" />
                    )}

                    {following
                        ? "Following"
                        : "Follow"}
                </button>

            </div>

        </article>
    );
}