"use client";

import { FormEvent, useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/api";
import {
  Dumbbell,
  Flame,
  Clock,
  Plus,
} from "lucide-react";

type WorkoutStatus = {
  id: number;
  workoutName: string;
  duration: number;
  caloriesBurned: number;
  description?: string;
  createdAt: string;
};

export default function WorkoutStatusPage() {
  const [statuses, setStatuses] = useState<WorkoutStatus[]>([]);

  const [workoutName, setWorkoutName] = useState("");
  const [duration, setDuration] = useState("");
  const [caloriesBurned, setCaloriesBurned] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadStatuses() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest<WorkoutStatus[]>(
        "/workout-status"
      );

      setStatuses(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load workout statuses"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStatuses();
  }, []);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      await apiRequest("/workout-status", {
        method: "POST",
        body: JSON.stringify({
          workoutName,
          duration: Number(duration),
          caloriesBurned: Number(caloriesBurned),
          description,
        }),
      });

      setWorkoutName("");
      setDuration("");
      setCaloriesBurned("");
      setDescription("");

      await loadStatuses();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create workout status"
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

          <div className="mx-auto max-w-6xl">

            {/* Header */}
            <div className="mb-8">
              <p className="text-sm text-[#10B981]">
                Track your workouts
              </p>

              <h1 className="mt-1 text-3xl font-bold text-white">
                Workout Status
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Record your workout progress and activity.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">

              {/* Create Workout */}
              <section className="h-fit rounded-2xl border border-[#27303D] bg-[#141A23] p-5">

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                    <Plus className="h-5 w-5 text-[#10B981]" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Add Workout
                    </h2>

                    <p className="text-xs text-slate-500">
                      Record your latest activity
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-5 space-y-4"
                >

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Workout Name
                    </label>

                    <input
                      type="text"
                      value={workoutName}
                      onChange={(e) =>
                        setWorkoutName(e.target.value)
                      }
                      placeholder="e.g. Morning Run"
                      required
                      className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Duration (minutes)
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value)
                      }
                      placeholder="30"
                      required
                      className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Calories Burned
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={caloriesBurned}
                      onChange={(e) =>
                        setCaloriesBurned(e.target.value)
                      }
                      placeholder="250"
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
                      placeholder="How was your workout?"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Dumbbell className="h-4 w-4" />

                    {creating
                      ? "Saving..."
                      : "Save Workout"}
                  </button>

                </form>
              </section>

              {/* Workout History */}
              <section>

                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Workout History
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your recent workout activity.
                  </p>
                </div>

                {loading && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-8 text-center">
                    <p className="text-sm text-slate-500">
                      Loading workouts...
                    </p>
                  </div>
                )}

                {!loading && statuses.length === 0 && (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
                      <Dumbbell className="h-6 w-6 text-[#10B981]" />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      No workouts yet
                    </h3>

                    <p className="mt-2 text-sm text-slate-500">
                      Add your first workout to start tracking.
                    </p>
                  </div>
                )}

                {!loading && statuses.length > 0 && (
                  <div className="space-y-4">

                    {statuses.map((status) => (
                      <div
                        key={status.id}
                        className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <h3 className="font-semibold text-white">
                              {status.workoutName}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                status.createdAt
                              ).toLocaleString()}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                            <Dumbbell className="h-5 w-5 text-[#10B981]" />
                          </div>

                        </div>

                        {status.description && (
                          <p className="mt-4 text-sm leading-6 text-slate-400">
                            {status.description}
                          </p>
                        )}

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-[#0B0F17] p-3">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-[#14B8A6]" />

                              <span className="text-xs text-slate-500">
                                Duration
                              </span>
                            </div>

                            <p className="mt-2 font-semibold text-white">
                              {status.duration} min
                            </p>
                          </div>

                          <div className="rounded-xl bg-[#0B0F17] p-3">
                            <div className="flex items-center gap-2">
                              <Flame className="h-4 w-4 text-[#84CC16]" />

                              <span className="text-xs text-slate-500">
                                Calories
                              </span>
                            </div>

                            <p className="mt-2 font-semibold text-white">
                              {status.caloriesBurned}
                            </p>
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