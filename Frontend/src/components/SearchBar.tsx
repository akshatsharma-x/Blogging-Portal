"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<{id: number, name: string}[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAPI("/categories/").then(res => setCategories(res.results || res || [])).catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category) params.set("category", category);
    
    router.push(`/blogs${params.toString() ? '?' + params.toString() : ''}`);
  };

  return (
    <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search blogs..."
        className="w-full md:w-2/3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
      />
      <select 
        value={category} 
        onChange={(e) => setCategory(e.target.value)}
        className="w-full md:w-1/3 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFE600] bg-white"
      >
        <option value="">All Categories</option>
        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" className="bg-[#FFE600] text-black font-semibold px-6 py-2 rounded-lg hover:bg-[#E6CF00]">
        Search
      </button>
    </form>
  );
}
