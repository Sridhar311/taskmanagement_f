"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {api} from "@/services/api";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      setToken(res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-3xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-[0.3em]">
              Task Management
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your task dashboard and stay productive.
            </p>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                placeholder="you@example.com"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 block w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 top-2 flex items-center pr-4 text-slate-400 hover:text-indigo-600 transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/10 transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <button
              onClick={() => router.push('/register')}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Create one
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 