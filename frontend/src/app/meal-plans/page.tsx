"use client";

import { FormEvent, useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { apiRequest } from "@/lib/api";
import {
  Utensils,
  Plus,
  CalendarDays,
  Clock,
  Target,
} from "lucide-react";

type MealPlan = {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  goal?: string;
  createdAt: string;
};

export default function MealPlansPage() {
  const [plans, setPlans] = useState<MealPlan[]>([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [goal, setGoal] = useState("");

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    try {
      setCreating(true);
      setError("");

      await apiRequest("/meal-plans", {
        method: "POST",
        body: JSON.stringify({
          name,
          description,
          duration: duration ? Number(duration) : null,
          goal,
        }),
      });

      setName("");
      setDescription("");
      setDuration("");
      setGoal("");

      await loadPlans();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create meal plan"
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

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
              <section className="h-fit rounded-2xl border border-[#27303D] bg-[#141A23] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                    <Plus className="h-5 w-5 text-[#10B981]" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-white">
                      Create Meal Plan
                    </h2>

                    <p className="text-xs text-slate-500">
                      Build your nutrition plan
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="mt-5 space-y-4"
                >
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Plan Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="e.g. Healthy Weight Gain"
                      required
                      className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Goal
                    </label>

                    <input
                      type="text"
                      value={goal}
                      onChange={(e) =>
                        setGoal(e.target.value)
                      }
                      placeholder="e.g. Build healthy weight"
                      className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      Duration (days)
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={duration}
                      onChange={(e) =>
                        setDuration(e.target.value)
                      }
                      placeholder="30"
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
                      rows={4}
                      className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creating}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />

                    {creating
                      ? "Creating..."
                      : "Create Meal Plan"}
                  </button>
                </form>
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

                {!loading && plans.length === 0 && (
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

                {!loading && plans.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-2">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-white">
                              {plan.name}
                            </h3>

                            <p className="mt-1 text-xs text-slate-500">
                              Created{" "}
                              {new Date(
                                plan.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#10B981]/10">
                            <Utensils className="h-5 w-5 text-[#10B981]" />
                          </div>
                        </div>

                        {plan.description && (
                          <p className="mt-4 text-sm leading-6 text-slate-400">
                            {plan.description}
                          </p>
                        )}

                        <div className="mt-5 space-y-2">
                          {plan.goal && (
                            <div className="flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">
                              <Target className="h-4 w-4 text-[#14B8A6]" />

                              <div>
                                <p className="text-xs text-slate-500">
                                  Goal
                                </p>

                                <p className="text-sm font-medium text-white">
                                  {plan.goal}
                                </p>
                              </div>
                            </div>
                          )}

                          {plan.duration !== undefined &&
                            plan.duration !== null && (
                              <div className="flex items-center gap-3 rounded-xl bg-[#0B0F17] p-3">
                                <Clock className="h-4 w-4 text-[#84CC16]" />

                                <div>
                                  <p className="text-xs text-slate-500">
                                    Duration
                                  </p>

                                  <p className="text-sm font-medium text-white">
                                    {plan.duration} days
                                  </p>
                                </div>
                              </div>
                            )}

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