"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/api";

import {
  Utensils,
  Plus,
  CalendarDays,
  Clock,
  Target,
  Trash2,
  ImagePlus,
  X,
  Pencil,
} from "lucide-react";

type Meal = {
  mealName: string;
  foodName: string;
  calories: string;
  protein: string;
  carbs: string;
  fats: string;
};

type MealPlanMeal = {
  id?: number;
  mealName: string;
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

type MealPlan = {
  id: number;
  title: string;
  description?: string;
  imageUrl?: string;
  meals: MealPlanMeal[];
  createdAt: string;
};

export default function MealPlansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const editId = searchParams.get("edit");

  const [plans, setPlans] = useState<MealPlan[]>([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [existingImageUrl, setExistingImageUrl] =
    useState<string | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [meals, setMeals] = useState<Meal[]>([
    {
      mealName: "",
      foodName: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadingEditPlan, setLoadingEditPlan] =
    useState(false);
  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(
      /\/api$/,
      ""
    ) || "http://localhost:8080";

  async function loadPlans() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<MealPlan[]>(
        "/meal-plans"
      );

      setPlans(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load meal plans"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  useEffect(() => {
    if (!editId) {
      return;
    }

    async function loadEditPlan() {
      try {
        setLoadingEditPlan(true);
        setError("");

        const plan = await apiRequest<MealPlan>(
          `/meal-plans/${editId}`
        );

        setTitle(plan.title);
        setDescription(plan.description ?? "");

        setExistingImageUrl(
          plan.imageUrl ?? null
        );

        setSelectedImage(null);
        setImagePreview(null);

        if (plan.meals && plan.meals.length > 0) {
          setMeals(
            plan.meals.map((meal) => ({
              mealName: meal.mealName ?? "",
              foodName: meal.foodName ?? "",
              calories:
                meal.calories !== undefined &&
                meal.calories !== null
                  ? String(meal.calories)
                  : "",
              protein:
                meal.protein !== undefined &&
                meal.protein !== null
                  ? String(meal.protein)
                  : "",
              carbs:
                meal.carbs !== undefined &&
                meal.carbs !== null
                  ? String(meal.carbs)
                  : "",
              fats:
                meal.fats !== undefined &&
                meal.fats !== null
                  ? String(meal.fats)
                  : "",
            }))
          );
        } else {
          setMeals([
            {
              mealName: "",
              foodName: "",
              calories: "",
              protein: "",
              carbs: "",
              fats: "",
            },
          ]);
        }
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load meal plan"
        );
      } finally {
        setLoadingEditPlan(false);
      }
    }

    loadEditPlan();
  }, [editId]);

  function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size cannot exceed 5 MB.");
      return;
    }

    setError("");

    setSelectedImage(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  }

  function removeSelectedImage() {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function updateMeal(
    index: number,
    field: keyof Meal,
    value: string
  ) {
    setMeals((currentMeals) =>
      currentMeals.map((meal, mealIndex) =>
        mealIndex === index
          ? {
              ...meal,
              [field]: value,
            }
          : meal
      )
    );
  }

  function addMeal() {
    setMeals((currentMeals) => [
      ...currentMeals,
      {
        mealName: "",
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
    ]);
  }

  function removeMeal(index: number) {
    setMeals((currentMeals) =>
      currentMeals.filter(
        (_, mealIndex) => mealIndex !== index
      )
    );
  }

  function resetForm() {
    setTitle("");
    setDescription("");

    removeSelectedImage();

    setExistingImageUrl(null);

    setMeals([
      {
        mealName: "",
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
      },
    ]);

    setError("");
  }

  function handleCancelEdit() {
    resetForm();
    router.push("/meal-plans");
  }

  async function handleDeletePlan(planId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this meal plan?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(planId);
      setError("");

      await apiRequest(
        `/meal-plans/${planId}`,
        {
          method: "DELETE",
        }
      );

      if (editId === String(planId)) {
        resetForm();
        router.push("/meal-plans");
      }

      await loadPlans();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete meal plan"
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (meals.length === 0) {
      setError("At least one meal is required");
      return;
    }

    const hasInvalidMeal = meals.some(
      (meal) =>
        !meal.mealName.trim() ||
        !meal.foodName.trim()
    );

    if (hasInvalidMeal) {
      setError(
        "Meal name and food name are required for every meal."
      );
      return;
    }

    try {
      setCreating(true);
      setError("");

      const formData = new FormData();

      const mealPlanData = {
        title: title.trim(),
        description: description.trim(),
        meals: meals.map((meal) => ({
          mealName: meal.mealName.trim(),
          foodName: meal.foodName.trim(),
          calories: meal.calories
            ? Number(meal.calories)
            : 0,
          protein: meal.protein
            ? Number(meal.protein)
            : 0,
          carbs: meal.carbs
            ? Number(meal.carbs)
            : 0,
          fats: meal.fats
            ? Number(meal.fats)
            : 0,
        })),
      };

      formData.append(
        "data",
        new Blob(
          [JSON.stringify(mealPlanData)],
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

      if (editId) {
        await apiRequest(
          `/meal-plans/${editId}`,
          {
            method: "PUT",
            body: formData,
          }
        );
      } else {
        await apiRequest(
          "/meal-plans",
          {
            method: "POST",
            body: formData,
          }
        );
      }

      resetForm();

      await loadPlans();

      router.push("/meal-plans");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : editId
          ? "Failed to update meal plan"
          : "Failed to create meal plan"
      );
    } finally {
      setCreating(false);
    }
  }

  const isEditing = Boolean(editId);

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8">
              <p className="text-sm text-[#10B981]">
                Plan your nutrition
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Meal Plans
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Create and manage your nutrition plans.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
              <section className="h-fit rounded-2xl border border-[#27303D] bg-[#141A23] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                    {isEditing ? (
                      <Pencil className="h-5 w-5 text-[#10B981]" />
                    ) : (
                      <Plus className="h-5 w-5 text-[#10B981]" />
                    )}
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      {isEditing
                        ? "Edit Meal Plan"
                        : "Create Meal Plan"}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {isEditing
                        ? "Update your nutrition plan"
                        : "Build your nutrition plan"}
                    </p>
                  </div>
                </div>

                {loadingEditPlan ? (
                  <div className="mt-6 rounded-xl border border-[#27303D] bg-[#0B0F17] p-6 text-center">
                    <p className="text-sm text-slate-500">
                      Loading meal plan...
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="mt-5 space-y-4"
                  >
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Plan Title
                      </label>

                      <input
                        type="text"
                        value={title}
                        onChange={(e) =>
                          setTitle(e.target.value)
                        }
                        placeholder="e.g. Healthy Weight Gain"
                        required
                        className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Description
                      </label>

                      <textarea
                        value={description}
                        onChange={(e) =>
                          setDescription(e.target.value)
                        }
                        placeholder="Describe your meal plan..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">
                        Meal Plan Image
                      </label>

                      {!imagePreview &&
                      !existingImageUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          className="flex w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#27303D] bg-[#0B0F17] px-4 py-8 transition hover:border-[#10B981] hover:bg-[#10B981]/5"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#10B981]/10">
                            <ImagePlus className="h-6 w-6 text-[#10B981]" />
                          </div>

                          <p className="mt-3 text-sm font-medium text-white">
                            Upload meal plan image
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            JPG, PNG or WEBP • Maximum 5 MB
                          </p>
                        </button>
                      ) : (
                        <div className="relative overflow-hidden rounded-xl border border-[#27303D] bg-[#0B0F17]">
                          <img
                            src={
                              imagePreview ??
                              `${API_BASE_URL}${existingImageUrl}`
                            }
                            alt="Meal plan preview"
                            className="h-48 w-full object-cover"
                          />

                          <button
                            type="button"
                            onClick={() => {
                              if (imagePreview) {
                                removeSelectedImage();
                              } else {
                                setExistingImageUrl(null);
                              }
                            }}
                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-500"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          {selectedImage && (
                            <div className="border-t border-[#27303D] px-3 py-2">
                              <p className="truncate text-xs text-slate-400">
                                {selectedImage.name}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {!imagePreview &&
                        !existingImageUrl &&
                        isEditing && (
                          <button
                            type="button"
                            onClick={() =>
                              fileInputRef.current?.click()
                            }
                            className="mt-2 text-xs text-[#10B981] hover:underline"
                          >
                            Choose an image
                          </button>
                        )}

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <label className="block text-sm text-slate-300">
                            Meals
                          </label>

                          <p className="mt-1 text-xs text-slate-500">
                            Add at least one meal
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={addMeal}
                          className="flex items-center gap-1 rounded-lg bg-[#10B981]/10 px-3 py-2 text-xs font-medium text-[#10B981] transition hover:bg-[#10B981]/20"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Meal
                        </button>
                      </div>

                      <div className="space-y-4">
                        {meals.map((meal, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-[#27303D] bg-[#0B0F17] p-4"
                          >
                            <div className="mb-3 flex items-center justify-between">
                              <p className="text-sm font-medium text-white">
                                Meal {index + 1}
                              </p>

                              {meals.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMeal(index)
                                  }
                                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                                  title="Remove meal"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>

                            <div className="space-y-3">
                              <div>
                                <label className="mb-1.5 block text-xs text-slate-400">
                                  Meal Name
                                </label>

                                <input
                                  type="text"
                                  value={meal.mealName}
                                  onChange={(e) =>
                                    updateMeal(
                                      index,
                                      "mealName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Breakfast"
                                  required
                                  className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                />
                              </div>

                              <div>
                                <label className="mb-1.5 block text-xs text-slate-400">
                                  Food Name
                                </label>

                                <input
                                  type="text"
                                  value={meal.foodName}
                                  onChange={(e) =>
                                    updateMeal(
                                      index,
                                      "foodName",
                                      e.target.value
                                    )
                                  }
                                  placeholder="e.g. Oats with banana"
                                  required
                                  className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="mb-1.5 block text-xs text-slate-400">
                                    Calories
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    value={meal.calories}
                                    onChange={(e) =>
                                      updateMeal(
                                        index,
                                        "calories",
                                        e.target.value
                                      )
                                    }
                                    placeholder="400"
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs text-slate-400">
                                    Protein (g)
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={meal.protein}
                                    onChange={(e) =>
                                      updateMeal(
                                        index,
                                        "protein",
                                        e.target.value
                                      )
                                    }
                                    placeholder="20"
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs text-slate-400">
                                    Carbs (g)
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={meal.carbs}
                                    onChange={(e) =>
                                      updateMeal(
                                        index,
                                        "carbs",
                                        e.target.value
                                      )
                                    }
                                    placeholder="50"
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                  />
                                </div>

                                <div>
                                  <label className="mb-1.5 block text-xs text-slate-400">
                                    Fats (g)
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={meal.fats}
                                    onChange={(e) =>
                                      updateMeal(
                                        index,
                                        "fats",
                                        e.target.value
                                      )
                                    }
                                    placeholder="10"
                                    className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          disabled={creating}
                          className="flex-1 rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-[#1A212C] disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={
                          creating ||
                          loadingEditPlan
                        }
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isEditing ? (
                          <Pencil className="h-4 w-4" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}

                        {creating
                          ? isEditing
                            ? "Updating..."
                            : "Creating..."
                          : isEditing
                          ? "Update Meal Plan"
                          : "Create Meal Plan"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <section>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Your Meal Plans
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Plans you have created.
                  </p>
                </div>

                {loading && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
                    <p className="text-sm text-slate-500">
                      Loading meal plans...
                    </p>
                  </div>
                )}

                {!loading &&
                  plans.length === 0 && (
                    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
                        <Utensils className="h-6 w-6 text-[#10B981]" />
                      </div>

                      <h3 className="mt-4 font-semibold text-white">
                        No meal plans yet
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Create your first meal plan to get started.
                      </p>
                    </div>
                  )}

                {!loading &&
                  plans.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]"
                        >
                          {plan.imageUrl ? (
                            <img
                              src={`${API_BASE_URL}${plan.imageUrl}`}
                              alt={plan.title}
                              className="h-48 w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-32 items-center justify-center bg-[#0B0F17]">
                              <Utensils className="h-8 w-8 text-[#10B981]" />
                            </div>
                          )}

                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-white">
                                  {plan.title}
                                </h3>

                                <p className="mt-1 text-xs text-slate-500">
                                  Created{" "}
                                  {new Date(
                                    plan.createdAt
                                  ).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    router.push(
                                      `/meal-plans?edit=${plan.id}`
                                    )
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#27303D] bg-[#0B0F17] text-slate-400 transition hover:border-[#10B981] hover:text-[#10B981]"
                                  title="Edit meal plan"
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
                                  disabled={
                                    deletingId ===
                                    plan.id
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#27303D] bg-[#0B0F17] text-slate-400 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete meal plan"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#10B981]/10">
                                  <Utensils className="h-5 w-5 text-[#10B981]" />
                                </div>
                              </div>
                            </div>

                            {plan.description && (
                              <p className="mt-4 text-sm leading-6 text-slate-400">
                                {plan.description}
                              </p>
                            )}

                            <div className="mt-5 space-y-2">
                              {plan.meals?.length > 0 && (
                                <div className="rounded-xl bg-[#0B0F17] p-3">
                                  <p className="text-xs text-slate-500">
                                    Meals
                                  </p>

                                  <div className="mt-2 space-y-2">
                                    {plan.meals.map(
                                      (
                                        meal,
                                        mealIndex
                                      ) => (
                                        <div
                                          key={
                                            meal.id ??
                                            mealIndex
                                          }
                                          className="flex items-start justify-between gap-3"
                                        >
                                          <div>
                                            <p className="text-sm font-medium text-white">
                                              {
                                                meal.mealName
                                              }
                                            </p>

                                            <p className="text-xs text-slate-500">
                                              {
                                                meal.foodName
                                              }
                                            </p>
                                          </div>

                                          {meal.calories !==
                                            undefined &&
                                            meal.calories !==
                                              null && (
                                              <span className="text-xs text-slate-400">
                                                {
                                                  meal.calories
                                                }{" "}
                                                kcal
                                              </span>
                                            )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">
                                <Target className="h-4 w-4 text-[#14B8A6]" />

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Total Meals
                                  </p>

                                  <p className="text-sm font-medium text-white">
                                    {plan.meals
                                      ?.length ?? 0}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">
                                <Clock className="h-4 w-4 text-[#84CC16]" />

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Nutrition
                                  </p>

                                  <p className="text-sm font-medium text-white">
                                    Meal-based plan
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">
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
                        </div>
                      ))}
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