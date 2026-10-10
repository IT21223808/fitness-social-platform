"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/api";

import {
  CalendarDays,
  Clock,
  Dumbbell,
  ImagePlus,
  Plus,
  Target,
  Trash2,
  X,
  Pencil,
} from "lucide-react";

type WorkoutExercise = {
  exerciseName: string;
  sets: string;
  reps: string;
  duration: string;
};

type WorkoutPlan = {
  id: number;
  userId: number;
  username: string;
  title: string;
  description?: string;
  imageUrl?: string;
  exercises: {
    id: number;
    exerciseName: string;
    sets: number;
    reps: number;
    duration?: number;
  }[];
  createdAt: string;
  updatedAt: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(
    /\/api$/,
    ""
  ) || "http://localhost:8080";

const emptyExercise: WorkoutExercise = {
  exerciseName: "",
  sets: "",
  reps: "",
  duration: "",
};

export default function WorkoutPlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");

  const [plans, setPlans] = useState<WorkoutPlan[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [exercises, setExercises] = useState<
    WorkoutExercise[]
  >([{ ...emptyExercise }]);

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [existingImageUrl, setExistingImageUrl] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [loadingEditPlan, setLoadingEditPlan] =
    useState(false);

  const [error, setError] = useState("");

  async function loadPlans() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<WorkoutPlan[]>(
        "/workout-plans"
      );

      setPlans(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load workout plans"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPlans();
  }, []);

  useEffect(() => {
    async function loadEditPlan() {
      if (!editId) {
        return;
      }

      const planId = Number(editId);

      if (!Number.isInteger(planId)) {
        setError("Invalid workout plan ID.");
        return;
      }

      try {
        setLoadingEditPlan(true);
        setError("");

        const plan =
          await apiRequest<WorkoutPlan>(
            `/workout-plans/${planId}`
          );

        setEditingId(plan.id);
        setTitle(plan.title);
        setDescription(
          plan.description || ""
        );

        setExercises(
          plan.exercises.length > 0
            ? plan.exercises.map(
                (exercise) => ({
                  exerciseName:
                    exercise.exerciseName,
                  sets: String(
                    exercise.sets
                  ),
                  reps: String(
                    exercise.reps
                  ),
                  duration:
                    exercise.duration !==
                      undefined &&
                    exercise.duration !==
                      null
                      ? String(
                          exercise.duration
                        )
                      : "",
                })
              )
            : [{ ...emptyExercise }]
        );

        setSelectedImage(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (plan.imageUrl) {
          setExistingImageUrl(
            plan.imageUrl
          );

          setImagePreview(
            `${API_BASE_URL}${plan.imageUrl}`
          );
        } else {
          setExistingImageUrl(null);
          setImagePreview(null);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load workout plan"
        );
      } finally {
        setLoadingEditPlan(false);
      }
    }

    void loadEditPlan();
  }, [editId]);

  function handleImageChange(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Only image files are allowed."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Image size cannot exceed 5 MB."
      );

      e.target.value = "";
      return;
    }

    setError("");

    if (
      imagePreview &&
      selectedImage
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function removeSelectedImage() {
    if (
      imagePreview &&
      selectedImage
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(null);

    if (existingImageUrl) {
      setImagePreview(
        `${API_BASE_URL}${existingImageUrl}`
      );
    } else {
      setImagePreview(null);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateExercise(
    index: number,
    field: keyof WorkoutExercise,
    value: string
  ) {
    setExercises(
      (currentExercises) =>
        currentExercises.map(
          (
            exercise,
            exerciseIndex
          ) =>
            exerciseIndex === index
              ? {
                  ...exercise,
                  [field]: value,
                }
              : exercise
        )
    );
  }

  function addExercise() {
    setExercises(
      (currentExercises) => [
        ...currentExercises,
        { ...emptyExercise },
      ]
    );
  }

  function removeExercise(
    index: number
  ) {
    if (exercises.length === 1) {
      return;
    }

    setExercises(
      (currentExercises) =>
        currentExercises.filter(
          (_, exerciseIndex) =>
            exerciseIndex !== index
        )
    );
  }

  function resetForm() {
    setTitle("");
    setDescription("");

    setExercises([
      { ...emptyExercise },
    ]);

    if (
      imagePreview &&
      selectedImage
    ) {
      URL.revokeObjectURL(
        imagePreview
      );
    }

    setSelectedImage(null);
    setImagePreview(null);
    setExistingImageUrl(null);
    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleCancelEdit() {
    resetForm();
    setError("");

    router.push("/workout-plans");
  }

  async function handleDeletePlan(
    planId: number
  ) {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this workout plan?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await apiRequest(
        `/workout-plans/${planId}`,
        {
          method: "DELETE",
        }
      );

      if (editingId === planId) {
        resetForm();
        router.push("/workout-plans");
      }

      await loadPlans();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete workout plan"
      );
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      if (!title.trim()) {
        setError(
          "Workout plan title is required."
        );
        return;
      }

      if (exercises.length === 0) {
        setError(
          "At least one exercise is required."
        );
        return;
      }

      const hasInvalidExercise =
        exercises.some(
          (exercise) =>
            !exercise.exerciseName.trim() ||
            !exercise.sets ||
            Number(exercise.sets) < 1 ||
            !exercise.reps ||
            Number(exercise.reps) < 1
        );

      if (hasInvalidExercise) {
        setError(
          "Please enter valid exercise name, sets and reps."
        );
        return;
      }

      const hasInvalidDuration =
        exercises.some(
          (exercise) =>
            exercise.duration !== "" &&
            Number(exercise.duration) < 0
        );

      if (hasInvalidDuration) {
        setError(
          "Duration cannot be negative."
        );
        return;
      }

      const formData =
        new FormData();

      const workoutPlanData = {
        title: title.trim(),
        description:
          description.trim(),

        exercises:
          exercises.map(
            (exercise) => ({
              exerciseName:
                exercise.exerciseName.trim(),

              sets: Number(
                exercise.sets
              ),

              reps: Number(
                exercise.reps
              ),

              duration:
                exercise.duration !== ""
                  ? Number(
                      exercise.duration
                    )
                  : null,
            })
          ),
      };

      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify(
              workoutPlanData
            ),
          ],
          {
            type: "application/json",
          }
        )
      );

      if (selectedImage) {
        formData.append(
          "image",
          selectedImage
        );
      }

      if (editingId) {
        await apiRequest(
          `/workout-plans/${editingId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        await apiRequest(
          "/workout-plans",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      resetForm();

      await loadPlans();

      router.push("/workout-plans");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : editingId
            ? "Failed to update workout plan"
            : "Failed to create workout plan"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">

            {/* Header */}
            <div className="mb-8">
              <p className="text-sm text-[#10B981]">
                Plan your training
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Workout Plans
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Create and manage your workout plans.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setError("")
                  }
                  className="text-red-400 transition hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">

              {/* Create / Edit Workout Plan */}
              <section className="h-fit rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                    {editingId ? (
                      <Pencil className="h-5 w-5 text-[#10B981]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#10B981]" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      {editingId
                        ? "Edit Workout Plan"
                        : "Create Workout Plan"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {editingId
                        ? "Update your training plan"
                        : "Build your training plan"}
                    </p>
                  </div>
                </div>

                {loadingEditPlan ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-5"
                  >

                    {/* Title */}
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Plan Title
                      </label>

                      <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                          setTitle(
                            e.target.value
                          )
                        }
                        placeholder="e.g. Beginner Strength"
                        required
                        disabled={creating}
                        className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Description
                      </label>

                      <textarea
                        value={description}
                        onChange={(e) =>
                          setDescription(
                            e.target.value
                          )
                        }
                        placeholder="Describe your workout plan..."
                        rows={4}
                        disabled={creating}
                        className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"
                      />
                    </div>

                    {/* Image */}
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Workout Image
                      </label>

                      {!imagePreview ? (
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#27303D] bg-[#0B0F17] px-4 py-8 transition hover:border-[#10B981]">
                          <ImagePlus className="h-8 w-8 text-slate-500" />

                          <p className="mt-3 text-sm font-medium text-slate-300">
                            Choose an image
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            PNG, JPG, WEBP • Max 5 MB
                          </p>

                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={
                              handleImageChange
                            }
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl border border-[#27303D]">

                          <img
                            src={imagePreview}
                            alt="Workout preview"
                            className="h-48 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={
                              removeSelectedImage
                            }
                            disabled={creating}
                            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {existingImageUrl &&
                            !selectedImage && (
                              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 text-xs text-slate-300">
                                Current image
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Exercises */}
                    <div>
                      <div className="mb-3 flex items-center justify-between">

                        <div>
                          <label className="block text-sm font-medium text-slate-300">
                            Exercises
                          </label>

                          <p className="mt-1 text-xs text-slate-500">
                            Add exercises to your plan
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={
                            addExercise
                          }
                          disabled={creating}
                          className="flex items-center gap-1.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-medium text-[#10B981] transition hover:bg-[#10B981]/20 disabled:opacity-50"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>

                      <div className="space-y-4">
                        {exercises.map(
                          (
                            exercise,
                            index
                          ) => (
                            <div
                              key={index}
                              className="rounded-xl border border-[#27303D] bg-[#0B0F17] p-4"
                            >

                              <div className="mb-4 flex items-center justify-between">
                                <p className="text-sm font-medium text-white">
                                  Exercise{" "}
                                  {index + 1}
                                </p>

                                {exercises.length >
                                  1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeExercise(
                                        index
                                      )
                                    }
                                    disabled={
                                      creating
                                    }
                                    className="text-slate-500 transition hover:text-red-400 disabled:opacity-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </div>

                              {/* Exercise Name */}
                              <div>
                                <label className="mb-2 block text-xs text-slate-400">
                                  Exercise Name
                                </label>

                                <input
                                  type="text"
                                  value={
                                    exercise.exerciseName
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateExercise(
                                      index,
                                      "exerciseName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Push Ups"
                                  required
                                  disabled={
                                    creating
                                  }
                                  className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981] disabled:opacity-50"
                                />
                              </div>

                              {/* Sets / Reps */}
                              <div className="mt-3 grid grid-cols-2 gap-3">

                                <div>
                                  <label className="mb-2 block text-xs text-slate-400">
                                    Sets
                                  </label>

                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      exercise.sets
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateExercise(
                                        index,
                                        "sets",
                                        e.target.value
                                      )
                                    }
                                    placeholder="3"
                                    required
                                    disabled={
                                      creating
                                    }
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981] disabled:opacity-50"
                                  />
                                </div>

                                <div>
                                  <label className="mb-2 block text-xs text-slate-400">
                                    Reps
                                  </label>

                                  <input
                                    type="number"
                                    min="1"
                                    value={
                                      exercise.reps
                                    }
                                    onChange={(
                                      e
                                    ) =>
                                      updateExercise(
                                        index,
                                        "reps",
                                        e.target.value
                                      )
                                    }
                                    placeholder="12"
                                    required
                                    disabled={
                                      creating
                                    }
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981] disabled:opacity-50"
                                  />
                                </div>
                              </div>

                              {/* Duration */}
                              <div className="mt-3">
                                <label className="mb-2 block text-xs text-slate-400">
                                  Duration (seconds)
                                </label>

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    exercise.duration
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    updateExercise(
                                      index,
                                      "duration",
                                      e.target.value
                                    )
                                  }
                                  placeholder="30"
                                  disabled={
                                    creating
                                  }
                                  className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981] disabled:opacity-50"
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">

                      {editingId && (
                        <button
                          type="button"
                          onClick={
                            handleCancelEdit
                          }
                          disabled={
                            creating
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#27303D] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-[#1A212C] hover:text-white disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={
                          creating
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {editingId ? (
                          <Pencil className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}

                        {creating
                          ? editingId
                            ? "Updating..."
                            : "Creating..."
                          : editingId
                            ? "Update Plan"
                            : "Create Plan"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              {/* Plans */}
              <section>

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Workout Plans
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Plans you have created.
                  </p>
                </div>

                {/* Loading */}
                {loading && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
                    <p className="text-sm text-slate-500">
                      Loading workout plans...
                    </p>
                  </div>
                )}

                {/* Empty */}
                {!loading &&
                  plans.length === 0 && (
                    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">

                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
                        <Dumbbell className="h-6 w-6 text-[#10B981]" />
                      </div>

                      <h3 className="mt-4 font-semibold text-white">
                        No workout plans yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Create your first plan to get started.
                      </p>
                    </div>
                  )}

                {/* Plan List */}
                {!loading &&
                  plans.length > 0 && (
                    <div className="grid gap-5 md:grid-cols-2">

                      {plans.map(
                        (plan) => (
                          <div
                            key={
                              plan.id
                            }
                            className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]"
                          >

                            {/* Image */}
                            {plan.imageUrl ? (
                              <img
                                src={`${API_BASE_URL}${plan.imageUrl}`}
                                alt={
                                  plan.title
                                }
                                className="h-48 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-48 w-full items-center justify-center bg-[#0B0F17]">
                                <Dumbbell className="h-10 w-10 text-[#10B981]/40" />
                              </div>
                            )}

                            <div className="p-5">

                              {/* Title */}
                              <div className="flex items-start justify-between gap-4">

                                <div className="min-w-0">
                                  <h3 className="font-semibold text-white">
                                    {
                                      plan.title
                                    }
                                  </h3>

                                  <p className="mt-1 text-xs text-slate-500">
                                    Created{" "}
                                    {new Date(
                                      plan.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>

                                {/* Actions */}
                                <div className="flex shrink-0 items-center gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      router.push(
                                        `/workout-plans?edit=${plan.id}`
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#10B981]/10 text-[#10B981] transition hover:bg-[#10B981]/20"
                                    title="Edit workout plan"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeletePlan(
                                        plan.id
                                      )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition hover:bg-red-500/20"
                                    title="Delete workout plan"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>

                                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                                    <Dumbbell className="h-5 w-5 text-[#10B981]" />
                                  </div>

                                </div>
                              </div>

                              {/* Description */}
                              {plan.description && (
                                <p className="mt-4 text-sm leading-6 text-slate-400">
                                  {
                                    plan.description
                                  }
                                </p>
                              )}

                              {/* Exercise Count */}
                              <div className="mt-5 flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">

                                <Target className="h-4 w-4 text-[#14B8A6]" />

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Exercises
                                  </p>

                                  <p className="text-sm font-medium text-white">
                                    {
                                      plan
                                        .exercises
                                        .length
                                    }{" "}
                                    {plan
                                      .exercises
                                      .length ===
                                    1
                                      ? "exercise"
                                      : "exercises"}
                                  </p>
                                </div>
                              </div>

                              {/* Exercises */}
                              <div className="mt-4 space-y-2">

                                {plan.exercises.map(
                                  (
                                    exercise
                                  ) => (
                                    <div
                                      key={
                                        exercise.id
                                      }
                                      className="rounded-xl border border-[#27303D] bg-[#0B0F17] p-3"
                                    >

                                      <div className="flex items-center justify-between gap-3">

                                        <p className="text-sm font-medium text-white">
                                          {
                                            exercise.exerciseName
                                          }
                                        </p>

                                        <span className="text-xs text-slate-500">
                                          {
                                            exercise.sets
                                          }{" "}
                                          ×{" "}
                                          {
                                            exercise.reps
                                          }
                                        </span>
                                      </div>

                                      {exercise.duration !==
                                        undefined &&
                                        exercise.duration !==
                                          null && (
                                          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">

                                            <Clock className="h-3.5 w-3.5 text-[#84CC16]" />

                                            {
                                              exercise.duration
                                            }{" "}
                                            seconds
                                          </div>
                                        )}
                                    </div>
                                  )
                                )}
                              </div>

                              {/* Created */}
                              <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">

                                <CalendarDays className="h-4 w-4 text-[#10B981]" />

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Created
                                  </p>

                                  <p className="text-sm font-medium text-white">
                                    {new Date(
                                      plan.createdAt
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}