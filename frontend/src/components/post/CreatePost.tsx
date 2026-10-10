"use client";

import {

  Image,

  Video,

  Dumbbell,

  Utensils,

  Send,

  X,

  Plus,

  Trash2,

  Clock,

} from "lucide-react";

import { useRef, useState } from "react";

import { apiRequest } from "@/lib/api";

type CreatePostProps = {

  onPostCreated?: () => void;

};

type PostMode = "POST" | "WORKOUT" | "MEAL";

type CreatedPost = {

  id: number;

};

type WorkoutExerciseForm = {

  exerciseName: string;

  sets: string;

  reps: string;

  duration: string;

};

type MealForm = {

  mealName: string;

  foodName: string;

  calories: string;

  protein: string;

  carbs: string;

  fats: string;

};

const emptyExercise: WorkoutExerciseForm = {

  exerciseName: "",

  sets: "",

  reps: "",

  duration: "",

};

const emptyMeal: MealForm = {

  mealName: "",

  foodName: "",

  calories: "",

  protein: "",

  carbs: "",

  fats: "",

};

export default function CreatePost({

  onPostCreated,

}: CreatePostProps) {

  const [mode, setMode] = useState<PostMode>("POST");

  // Normal post

  const [content, setContent] = useState("");

  const [selectedFiles, setSelectedFiles] = useState<File[]>(

    []

  );

  const [previewUrls, setPreviewUrls] = useState<string[]>(

    []

  );

  // Workout plan

  const [workoutTitle, setWorkoutTitle] = useState("");

  const [workoutDescription, setWorkoutDescription] = useState("");

  const [exercises, setExercises] = useState<WorkoutExerciseForm[]

  >([{ ...emptyExercise }]);

  // Meal plan

  const [mealTitle, setMealTitle] = useState("");

  const [mealDescription, setMealDescription] =

    useState("");

  const [meals, setMeals] = useState<MealForm[]>([

    { ...emptyMeal },

  ]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 3;

  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  function handleModeChange(newMode: PostMode) {

    setMode(newMode);

    setError("");

  }

  function handleFileSelect(

    event: React.ChangeEvent<HTMLInputElement>

  ) {

    const files = Array.from(event.target.files || []);

    if (files.length === 0) {

      return;

    }

    setError("");

    const remainingSlots =

      MAX_FILES - selectedFiles.length;

    if (remainingSlots <= 0) {

      setError(

        "A post can have maximum 3 media files."

      );

      event.target.value = "";

      return;

    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {

      setError(

        "A post can have maximum 3 media files."

      );

    }

    for (const file of filesToAdd) {

      if (file.size > MAX_FILE_SIZE) {

        setError(

          `${file.name}: File size cannot exceed 50 MB.`

        );

        event.target.value = "";

        return;

      }

      if (

        !file.type.startsWith("image/") &&

        !file.type.startsWith("video/")

      ) {

        setError(

          `${file.name}: Only image and video files are allowed.`

        );

        event.target.value = "";

        return;

      }

    }

    const newPreviewUrls = filesToAdd.map((file) =>

      URL.createObjectURL(file)

    );

    setSelectedFiles((current) => [

      ...current,

      ...filesToAdd,

    ]);

    setPreviewUrls((current) => [

      ...current,

      ...newPreviewUrls,

    ]);

    event.target.value = "";

  }

  function removeFile(index: number) {

    const previewUrl = previewUrls[index];

    if (previewUrl) {

      URL.revokeObjectURL(previewUrl);

    }

    setSelectedFiles((current) =>

      current.filter(

        (_, fileIndex) => fileIndex !== index

      )

    );

    setPreviewUrls((current) =>

      current.filter(

        (_, previewIndex) => previewIndex !== index

      )

    );

  }

  function removeAllFiles() {

    previewUrls.forEach((url) => {

      URL.revokeObjectURL(url);

    });

    setSelectedFiles([]);

    setPreviewUrls([]);

    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  }

  function updateExercise(

    index: number,

    field: keyof WorkoutExerciseForm,

    value: string

  ) {

    setExercises((currentExercises) =>

      currentExercises.map(

        (exercise, exerciseIndex) =>

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

    setExercises((currentExercises) => [

      ...currentExercises,

      { ...emptyExercise },

    ]);

  }

  function removeExercise(index: number) {

    if (exercises.length === 1) {

      return;

    }

    setExercises((currentExercises) =>

      currentExercises.filter(

        (_, exerciseIndex) =>

          exerciseIndex !== index

      )

    );

  }

  function updateMeal(

    index: number,

    field: keyof MealForm,

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

      { ...emptyMeal },

    ]);

  }

  function removeMeal(index: number) {

    if (meals.length === 1) {

      return;

    }

    setMeals((currentMeals) =>

      currentMeals.filter(

        (_, mealIndex) => mealIndex !== index

      )

    );

  }

  function resetForms() {

    setContent("");

    setWorkoutTitle("");

    setWorkoutDescription("");

    setExercises([{ ...emptyExercise }]);

    setMealTitle("");

    setMealDescription("");

    setMeals([{ ...emptyMeal }]);

    setMode("POST");

    removeAllFiles();

  }

  async function createNormalPost() {

    if (

      !content.trim() &&

      selectedFiles.length === 0

    ) {

      throw new Error(

        "Please write something or select an image/video."

      );

    }

    const createdPost = await apiRequest<CreatedPost>(

      "/posts",

      {

        method: "POST",

        body: JSON.stringify({

          description: content.trim(),

          type: "MEDIA",

        }),

      }

    );

    if (!createdPost?.id) {

      throw new Error(

        "Post was created, but the post ID was not returned."

      );

    }

    for (

      let index = 0;

      index < selectedFiles.length;

      index++

    ) {

      const file = selectedFiles[index];

      const formData = new FormData();

      formData.append("file", file);

      formData.append(

        "displayOrder",

        String(index + 1)

      );

      await apiRequest(

        `/posts/${createdPost.id}/media`,

        {

          method: "POST",

          body: formData,

        }

      );

    }

  }

  async function createWorkoutPlan() {

    if (!workoutTitle.trim()) {

      throw new Error(

        "Workout plan title is required."

      );

    }

    if (exercises.length === 0) {

      throw new Error(

        "At least one exercise is required."

      );

    }

    const hasInvalidExercise = exercises.some(

      (exercise) =>

        !exercise.exerciseName.trim() ||

        !exercise.sets ||

        Number(exercise.sets) < 1 ||

        !exercise.reps ||

        Number(exercise.reps) < 1

    );

    if (hasInvalidExercise) {

      throw new Error(

        "Please enter valid exercise name, sets and reps."

      );

    }

    const hasInvalidDuration = exercises.some(

      (exercise) =>

        exercise.duration !== "" &&

        Number(exercise.duration) < 0

    );

    if (hasInvalidDuration) {

      throw new Error(

        "Duration cannot be negative."

      );

    }

    const workoutPlanData = {

      title: workoutTitle.trim(),

      description:

        workoutDescription.trim(),

      exercises: exercises.map(

        (exercise) => ({

          exerciseName:

            exercise.exerciseName.trim(),

          sets: Number(exercise.sets),

          reps: Number(exercise.reps),

          duration:

            exercise.duration !== ""

              ? Number(exercise.duration)

              : null,

        })

      ),

    };

    const formData = new FormData();

    formData.append(

      "data",

      new Blob(

        [JSON.stringify(workoutPlanData)],

        {

          type: "application/json",

        }

      )

    );

    selectedFiles.forEach((file) => {

      formData.append("media", file);

    });

    await apiRequest(

      "/workout-plans",

      {

        method: "POST",

        body: formData,

      }

    );

  }

  async function createMealPlan() {

    if (!mealTitle.trim()) {
      throw new Error(
        "Meal plan title is required."
      );
    }

    if (meals.length === 0) {
      throw new Error(
        "At least one meal is required."
      );
    }

    const hasInvalidMeal = meals.some(
      (meal) =>
        !meal.mealName.trim() ||
        !meal.foodName.trim()
    );

    if (hasInvalidMeal) {

      throw new Error(

        "Please enter meal name and food name."

      );

    }

    const mealPlanData = {

      title: mealTitle.trim(),

      description:
        mealDescription.trim(),

      meals: meals.map((meal) => ({
        mealName: meal.mealName.trim(),
        foodName: meal.foodName.trim(),

        calories:

          meal.calories !== ""
            ? Number(meal.calories)
            : null,

        protein:

          meal.protein !== ""

            ? Number(meal.protein)

            : null,

        carbs:

          meal.carbs !== ""

            ? Number(meal.carbs)

            : null,

        fats:

          meal.fats !== ""

            ? Number(meal.fats)

            : null,

      })),

    };

    const formData = new FormData();

    formData.append(

      "data",

      new Blob(

        [JSON.stringify(mealPlanData)],

        {

          type: "application/json",

        }

      )

    );

    selectedFiles.forEach((file) => {

      formData.append("media", file);

    });

    await apiRequest(

      "/meal-plans",

      {

        method: "POST",

        body: formData,

      }

    );

  }

  async function handleSubmit() {

    if (loading) {

      return;

    }

    try {

      setLoading(true);

      setError("");

      if (mode === "POST") {

        await createNormalPost();

      }

      if (mode === "WORKOUT") {

        await createWorkoutPlan();

      }

      if (mode === "MEAL") {

        await createMealPlan();

      }

      resetForms();

      onPostCreated?.();

    } catch (error) {

      console.error(

        "Create failed:",

        error

      );

      setError(

        error instanceof Error

          ? error.message

          : "Failed to create"

      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-4 sm:p-5">

      <div className="flex items-start gap-3">

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 font-semibold text-[#10B981] sm:h-11 sm:w-11">

          J

        </div>

        <div className="min-w-0 flex-1">

          {/* ================= POST ================= */}

          {mode === "POST" && (

            <>

              <textarea

                value={content}

                onChange={(e) => {

                  if (

                    e.target.value.length <= 500

                  ) {

                    setContent(e.target.value);

                  }

                }}

                placeholder="Share your fitness journey..."

                rows={3}

                className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] sm:p-4"

              />

            </>

          )}

          {/* ================= WORKOUT PLAN ================= */}

          {mode === "WORKOUT" && (

            <div className="space-y-4">

              <div>

                <p className="text-base font-semibold text-white">

                  Create Workout Plan

                </p>

                <p className="mt-1 text-xs text-slate-500">

                  Create your workout plan and post it

                  to your feed.

                </p>

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">

                  Plan Title

                </label>

                <input

                  type="text"

                  value={workoutTitle}

                  onChange={(e) =>

                    setWorkoutTitle(

                      e.target.value

                    )

                  }

                  placeholder="e.g. Beginner Strength"

                  disabled={loading}

                  className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"

                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">

                  Description

                </label>

                <textarea

                  value={workoutDescription}

                  onChange={(e) =>

                    setWorkoutDescription(

                      e.target.value

                    )

                  }

                  placeholder="Describe your workout plan..."

                  rows={3}

                  disabled={loading}

                  className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"

                />

              </div>

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-300">

                      Exercises

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Add exercises to your plan

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={addExercise}

                    disabled={loading}

                    className="flex items-center gap-1.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-medium text-[#10B981] transition hover:bg-[#10B981]/20 disabled:opacity-50"

                  >

                    <Plus className="h-3.5 w-3.5" />

                    Add

                  </button>

                </div>

                <div className="space-y-3">

                  {exercises.map(

                    (exercise, index) => (

                      <div

                        key={index}

                        className="rounded-xl border border-[#27303D] bg-[#0B0F17] p-4"

                      >

                        <div className="mb-3 flex items-center justify-between">

                          <p className="text-sm font-medium text-white">

                            Exercise {index + 1}

                          </p>

                          {exercises.length > 1 && (

                            <button

                              type="button"

                              onClick={() =>

                                removeExercise(

                                  index

                                )

                              }

                              disabled={loading}

                              className="text-slate-500 transition hover:text-red-400 disabled:opacity-50"

                            >

                              <Trash2 className="h-4 w-4" />

                            </button>

                          )}

                        </div>

                        <input

                          type="text"

                          value={

                            exercise.exerciseName

                          }

                          onChange={(e) =>

                            updateExercise(

                              index,

                              "exerciseName",

                              e.target.value

                            )

                          }

                          placeholder="Exercise Name e.g. Push Ups"

                          disabled={loading}

                          className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                        />

                        <div className="mt-3 grid grid-cols-2 gap-3">

                          <div>

                            <label className="mb-2 block text-xs text-slate-400">

                              Sets

                            </label>

                            <input

                              type="number"

                              min="1"

                              value={exercise.sets}

                              onChange={(e) =>

                                updateExercise(

                                  index,

                                  "sets",

                                  e.target.value

                                )

                              }

                              placeholder="3"

                              disabled={loading}

                              className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                            />

                          </div>

                          <div>

                            <label className="mb-2 block text-xs text-slate-400">

                              Reps

                            </label>

                            <input

                              type="number"

                              min="1"

                              value={exercise.reps}

                              onChange={(e) =>

                                updateExercise(

                                  index,

                                  "reps",

                                  e.target.value

                                )

                              }

                              placeholder="12"

                              disabled={loading}

                              className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                            />

                          </div>

                        </div>

                        <div className="mt-3">

                          <label className="mb-2 flex items-center gap-1.5 text-xs text-slate-400">

                            <Clock className="h-3.5 w-3.5" />

                            Duration (seconds)

                          </label>

                          <input

                            type="number"

                            min="0"

                            value={exercise.duration}

                            onChange={(e) =>

                              updateExercise(

                                index,

                                "duration",

                                e.target.value

                              )

                            }

                            placeholder="30"

                            disabled={loading}

                            className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                          />

                        </div>

                      </div>

                    )

                  )}

                </div>

              </div>

            </div>

          )}

          {/* ================= MEAL PLAN ================= */}

          {mode === "MEAL" && (

            <div className="space-y-4">

              <div>

                <p className="text-base font-semibold text-white">

                  Create Meal Plan

                </p>

                <p className="mt-1 text-xs text-slate-500">

                  Create your meal plan and post it

                  to your feed.

                </p>

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">

                  Plan Title

                </label>

                <input

                  type="text"

                  value={mealTitle}

                  onChange={(e) =>

                    setMealTitle(e.target.value)

                  }

                  placeholder="e.g. Healthy Daily Meal Plan"

                  disabled={loading}

                  className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"

                />

              </div>

              <div>

                <label className="mb-2 block text-sm text-slate-300">

                  Description

                </label>

                <textarea

                  value={mealDescription}

                  onChange={(e) =>

                    setMealDescription(

                      e.target.value

                    )

                  }

                  placeholder="Describe your meal plan..."

                  rows={3}

                  disabled={loading}

                  className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] disabled:opacity-50"

                />

              </div>

              <div>

                <div className="mb-3 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-medium text-slate-300">

                      Meals

                    </p>

                    <p className="mt-1 text-xs text-slate-500">

                      Add meals to your plan

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={addMeal}

                    disabled={loading}

                    className="flex items-center gap-1.5 rounded-lg border border-[#10B981]/30 bg-[#10B981]/10 px-3 py-2 text-xs font-medium text-[#10B981] transition hover:bg-[#10B981]/20 disabled:opacity-50"

                  >

                    <Plus className="h-3.5 w-3.5" />

                    Add

                  </button>

                </div>

                <div className="space-y-3">

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

                            disabled={loading}

                            className="text-slate-500 transition hover:text-red-400 disabled:opacity-50"

                          >

                            <Trash2 className="h-4 w-4" />

                          </button>

                        )}

                      </div>

                      <div>

                        <label className="mb-2 block text-xs text-slate-400">

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

                          disabled={loading}

                          className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                        />

                      </div>

                      <div className="mt-3">

                        <label className="mb-2 block text-xs text-slate-400">

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

                          placeholder="e.g. Oats with Banana"

                          disabled={loading}

                          className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                        />

                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-3">

                        <div>

                          <label className="mb-2 block text-xs text-slate-400">

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

                            placeholder="300"

                            disabled={loading}

                            className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-xs text-slate-400">

                            Protein

                          </label>

                          <input

                            type="number"

                            min="0"

                            value={meal.protein}

                            onChange={(e) =>

                              updateMeal(

                                index,

                                "protein",

                                e.target.value

                              )

                            }

                            placeholder="20"

                            disabled={loading}

                            className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-xs text-slate-400">

                            Carbs

                          </label>

                          <input

                            type="number"

                            min="0"

                            value={meal.carbs}

                            onChange={(e) =>

                              updateMeal(

                                index,

                                "carbs",

                                e.target.value

                              )

                            }

                            placeholder="40"

                            disabled={loading}

                            className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-xs text-slate-400">

                            Fats

                          </label>

                          <input

                            type="number"

                            min="0"

                            value={meal.fats}

                            onChange={(e) =>

                              updateMeal(

                                index,

                                "fats",

                                e.target.value

                              )

                            }

                            placeholder="10"

                            disabled={loading}

                            className="w-full rounded-lg border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-[#10B981]"

                          />

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          )}

          {/* ================= SELECTED MEDIA PREVIEW ================= */}

          {selectedFiles.length > 0 && (

            <div className="mt-4 space-y-3">

              {selectedFiles.map((file, index) => (

                <div

                  key={`${file.name}-${index}`}

                  className="relative overflow-hidden rounded-xl border border-[#27303D] bg-[#0B0F17]"

                >

                  {file.type.startsWith("image/") ? (

                    <img

                      src={previewUrls[index]}

                      alt={`Selected media ${index + 1}`}

                      className="max-h-[400px] w-full object-contain"

                    />

                  ) : (

                    <video

                      src={previewUrls[index]}

                      controls

                      className="max-h-[400px] w-full"

                    />

                  )}

                  <div className="absolute left-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">

                    {index + 1}/{selectedFiles.length}

                  </div>

                  <button

                    type="button"

                    onClick={() => removeFile(index)}

                    disabled={loading}

                    aria-label={`Remove media ${index + 1}`}

                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black disabled:opacity-50"

                  >

                    <X className="h-4 w-4" />

                  </button>

                </div>

              ))}

            </div>

          )}

          <input

            ref={fileInputRef}

            type="file"

            accept="image/*,video/*"

            multiple

            onChange={handleFileSelect}

            className="hidden"

          />

          {/* ================= ACTIONS ================= */}

          <div className="mt-5 flex flex-wrap gap-2">

            <>

              <button

                type="button"

                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "image/*";
                    fileInputRef.current.click();
                  }
                }}

                disabled={

                  loading ||

                  selectedFiles.length >= MAX_FILES

                }

                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-[#1A212C] hover:text-white disabled:opacity-50"

              >

                <Image className="h-4 w-4" />

                Photo

              </button>

              <button

                type="button"

                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.accept = "video/*";
                    fileInputRef.current.click();
                  }
                }}

                disabled={

                  loading ||

                  selectedFiles.length >= MAX_FILES

                }

                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-[#1A212C] hover:text-white disabled:opacity-50"

              >

                <Video className="h-4 w-4" />

                Video

              </button>

            </>

            <button

              type="button"

              onClick={() =>

                handleModeChange("WORKOUT")

              }

              disabled={loading}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${mode === "WORKOUT"

                  ? "bg-[#10B981]/10 text-[#10B981]"

                  : "text-slate-400 hover:bg-[#1A212C] hover:text-white"

                } disabled:opacity-50`}

            >

              <Dumbbell className="h-4 w-4" />

              Workout

            </button>

            <button

              type="button"

              onClick={() =>

                handleModeChange("MEAL")

              }

              disabled={loading}

              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition ${mode === "MEAL"

                  ? "bg-[#10B981]/10 text-[#10B981]"

                  : "text-slate-400 hover:bg-[#1A212C] hover:text-white"

                } disabled:opacity-50`}

            >

              <Utensils className="h-4 w-4" />

              Meal

            </button>

            <div className="ml-auto">

              <button

                type="button"

                onClick={handleSubmit}

                disabled={loading}

                className="flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"

              >

                {mode === "POST" ? (
                  <Send className="h-4 w-4" />
                ) : mode === "WORKOUT" ? (
                  <Dumbbell className="h-4 w-4" />
                ) : (
                  <Utensils className="h-4 w-4" />
                )}

                {loading
                  ? "Posting..."
                  : mode === "POST"
                    ? "Post"
                    : mode === "WORKOUT"
                      ? "Post Workout"
                      : "Post Meal"}
              </button>
            </div>
          </div>

          {/* ================= ERROR ================= */}

          {error && (
            <div className="mt-4 flex items-start justify-between gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-400 transition hover:text-red-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

          )}
        </div>
      </div>
    </div>

  );

}