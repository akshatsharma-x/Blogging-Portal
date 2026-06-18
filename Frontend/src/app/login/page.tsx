"use client";

import Link from "next/link";
import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchAPI("/auth/token/", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      if (isAdminLogin && !data.is_staff) {
        throw new Error("Access denied: You do not have Admin privileges.");
      }

      login(data.access, data.refresh, data.username || username, data.is_staff);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to login. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow-sm">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
          <button
            type="button"
            onClick={() => { setIsAdminLogin(false); setError(""); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${!isAdminLogin ? 'bg-white shadow' : 'text-gray-500 hover:text-black'}`}
          >
            User
          </button>
          <button
            type="button"
            onClick={() => { setIsAdminLogin(true); setError(""); }}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${isAdminLogin ? 'bg-orange-100 text-orange-700 shadow' : 'text-gray-500 hover:text-black'}`}
          >
            Admin
          </button>
        </div>
      </div>

      <h1 className={`text-2xl font-bold mb-6 text-center ${isAdminLogin ? 'text-orange-600' : ''}`}>
        {isAdminLogin ? "Admin Login" : "Login"}
      </h1>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${isAdminLogin ? 'focus:ring-orange-500' : 'focus:ring-[#FFE600]'}`}
            placeholder="Enter your username" 
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 border rounded focus:outline-none focus:ring-2 ${isAdminLogin ? 'focus:ring-orange-500' : 'focus:ring-[#FFE600]'}`}
            placeholder="Enter your password" 
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full font-semibold py-2 rounded disabled:opacity-50 transition-colors ${
            isAdminLogin 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-[#FFE600] text-black hover:bg-[#E6CF00]'
          }`}
        >
          {loading ? "Logging in..." : (isAdminLogin ? "Login as Admin" : "Login")}
        </button>
      </form>
      {!isAdminLogin && (
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account? <Link href="/register" className="text-[#2E2E38] font-bold hover:underline">Register</Link>
        </p>
      )}
    </div>
  );
}
