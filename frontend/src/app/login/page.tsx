"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

type LoginResponse = {
  token: string;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      localStorage.setItem("token", data.token);

      router.push("/home");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F17] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#27303D] bg-[#141A23] p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to your fitness account
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#10B981] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-[#10B981] hover:text-[#059669]"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}