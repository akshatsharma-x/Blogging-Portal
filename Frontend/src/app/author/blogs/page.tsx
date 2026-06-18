"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Blog {
  id: number;
  title: string;
  status: string;
  author?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      await fetchAPI(`/posts/${id}/`, { method: "DELETE" });
      setBlogs(blogs.filter((b) => b.id !== id));
      toast.success("Blog deleted successfully!");
    } catch {
      toast.error("Failed to delete blog.");
    }
  };

  const handleUpdateStatus = async (id: number, action: "publish" | "archive") => {
    try {
      await fetchAPI(`/posts/${id}/${action}/`, { method: "POST" });
      setBlogs(blogs.map((b) => b.id === id ? { ...b, status: action === 'publish' ? 'published' : 'archived' } : b));
      toast.success(`Blog ${action}ed successfully!`);
    } catch {
      toast.error(`Failed to ${action} blog.`);
    }
  };

  useEffect(() => {
    const loadMyBlogs = async () => {
      setLoading(true);
      try {
        const response = await fetchAPI(`/posts/my_posts/?page=${page}`);
        const blogsData = Array.isArray(response) ? response : response.results || [];
        setBlogs(blogsData);
        setHasNext(!!response?.pagination?.next);
        setHasPrev(!!response?.pagination?.previous);
      } catch (error) {
        console.error("Error loading my blogs", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadMyBlogs();
  }, [router, page]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Link href="/author/create-blog" className="bg-[#FFE600] text-black font-semibold px-4 py-2 rounded hover:bg-[#E6CF00]">
          Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
        {loading ? (
          <p className="p-4">Loading your blogs...</p>
        ) : blogs.length === 0 ? (
          <p className="p-4">You have not created any blogs yet.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4 font-bold text-gray-700">Title</th>
                <th className="p-4 font-bold text-gray-700">Author</th>
                <th className="p-4 font-bold text-gray-700">Status</th>
                <th className="p-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{blog.title}</td>
                  <td className="p-4">
                    {blog.author?.first_name 
                      ? `${blog.author.first_name} ${blog.author.last_name}` 
                      : blog.author?.username}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-sm ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-4">
                      {blog.status === 'draft' && (
                        <button onClick={() => handleUpdateStatus(blog.id, 'publish')} className="text-green-600 font-semibold hover:underline">
                          Publish
                        </button>
                      )}
                      {blog.status === 'published' && (
                        <button onClick={() => handleUpdateStatus(blog.id, 'archive')} className="text-orange-600 font-semibold hover:underline">
                          Archive
                        </button>
                      )}
                      <Link href={`/author/edit-blog/${blog.id}`} className="text-[#2E2E38] font-semibold hover:underline">
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(blog.id)} className="text-red-600 font-semibold hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex justify-between items-center mt-6">
        {hasPrev ? (
          <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-semibold">
            &larr; Previous
          </button>
        ) : <div />}
        {hasNext ? (
          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-semibold">
            Next &rarr;
          </button>
        ) : <div />}
      </div>
    </div>
  );
}
