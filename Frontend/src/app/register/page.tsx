"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (formData.password !== formData.password2) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await fetchAPI("/auth/register/", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <input type="password" name="password2" value={formData.password2} onChange={handleChange} className="w-full p-2 border rounded" required />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#FFE600] text-black font-semibold py-2 rounded hover:bg-[#E6CF00] disabled:opacity-50">
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm">
        Already have an account? <Link href="/login" className="text-[#2E2E38] font-bold hover:underline">Login</Link>
      </p>
    </div>
  );
}
