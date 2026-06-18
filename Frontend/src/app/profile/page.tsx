"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchAPI } from "@/lib/api";
import BlogCard, { Post } from "@/components/BlogCard";
import Link from "next/link";

export default function Profile() {
  const { isAuthenticated, username, loading: authLoading } = useAuth();
  const [blogs, setBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      window.location.href = "/login";
      return;
    }

    if (isAuthenticated) {
      const loadBlogs = async () => {
        try {
          const res = await fetchAPI("/posts/my_posts/");
          setBlogs(res.results || res || []);
        } catch {
        } finally {
          setLoading(false);
        }
      };
      loadBlogs();
    }
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white p-6 border rounded-lg shadow-sm mb-8 flex items-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full mr-6"></div>
          <div className="space-y-3">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div className="h-8 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg border"></div>
          <div className="h-64 bg-gray-200 rounded-lg border"></div>
        </div>
      </div>
    );
  }

  const initial = username ? username.charAt(0).toUpperCase() : "U";

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white p-6 border rounded-lg shadow-sm mb-8">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-[#FFF9CC] rounded-full flex items-center justify-center text-[#2E2E38] text-2xl font-bold mr-6 uppercase">
            {initial}
          </div>
          <div>
            <h2 className="text-2xl font-bold">{username}</h2>
            <p className="text-sm bg-[#FFF9CC] text-[#2E2E38] font-semibold px-2 py-1 rounded inline-block mt-2">Author</p>
          </div>
        </div>
      </div>
        
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-2xl font-bold">My Blogs</h3>
        <Link href="/admin/create-blog" className="bg-[#FFE600] text-black font-semibold px-4 py-2 rounded hover:bg-[#E6CF00]">
          Create New Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <p className="text-gray-600 bg-white p-6 rounded-lg border text-center">You haven&apos;t published any blogs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}
