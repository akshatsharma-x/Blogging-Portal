"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Blog {
  id: number;
  title: string;
  status: string;
  featured: boolean;
  views_count: number;
  created_at: string;
  author: {
    username: string;
    first_name: string;
    last_name: string;
  };
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function AdminDashboard() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const router = useRouter();
  const { isAuthenticated, isStaff, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    
    if (!isAuthenticated || !isStaff) {
      router.push("/");
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [postsRes, catsRes, tagsRes] = await Promise.all([
          fetchAPI("/posts/"),
          fetchAPI("/categories/"),
          fetchAPI("/tags/")
        ]);
        setBlogs(postsRes.results || postsRes || []);
        setCategories(catsRes.results || catsRes || []);
        setTags(tagsRes.results || tagsRes || []);
      } catch (error) {
        console.error("Error loading dashboard data", error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, isStaff, authLoading, router]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this blog?")) return;

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

  const handleToggleFeatured = async (id: number) => {
    try {
      await fetchAPI(`/posts/${id}/toggle_featured/`, { method: "POST" });
      setBlogs(blogs.map((b) => b.id === id ? { ...b, featured: !b.featured } : b));
      toast.success("Featured status updated!");
    } catch {
      toast.error("Failed to update featured status.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setCreatingCategory(true);
    try {
      const newCat = await fetchAPI("/categories/", {
        method: "POST",
        body: JSON.stringify({ name: newCategory }),
      });
      setCategories([...categories, newCat]);
      toast.success(`Category "${newCategory}" created successfully!`);
      setNewCategory("");
    } catch {
      toast.error("Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleEditCategory = async (id: number, oldName: string) => {
    const newName = window.prompt("Enter new category name:", oldName);
    if (!newName || newName.trim() === oldName) return;

    try {
      const updated = await fetchAPI(`/categories/${id}/`, {
        method: "PUT",
        body: JSON.stringify({ name: newName.trim() }),
      });
      setCategories(categories.map(c => c.id === id ? updated : c));
      toast.success("Category updated!");
    } catch {
      toast.error("Failed to update category.");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This might affect blogs using it.")) return;
    try {
      await fetchAPI(`/categories/${id}/`, { method: "DELETE" });
      setCategories(categories.filter(c => c.id !== id));
      toast.success("Category deleted!");
    } catch {
      toast.error("Failed to delete category.");
    }
  };

  const handleDeleteTag = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this tag?")) return;
    try {
      await fetchAPI(`/tags/${id}/`, { method: "DELETE" });
      setTags(tags.filter(t => t.id !== id));
      toast.success("Tag deleted!");
    } catch {
      toast.error("Failed to delete tag.");
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center">Loading Admin Dashboard...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-orange-600">Platform Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Moderate all posts across the entire platform.</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create Category</h2>
        <form onSubmit={handleCreateCategory} className="flex gap-4">
          <input
            type="text"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="e.g. Artificial Intelligence"
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
          <button
            type="submit"
            disabled={creatingCategory || !newCategory.trim()}
            className="bg-orange-600 text-white font-semibold px-6 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
          >
            {creatingCategory ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <h2 className="text-xl font-bold mb-4">All Platform Posts</h2>
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {blogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No blogs exist on the platform.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 font-semibold text-sm text-gray-600">Title</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Author</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Date</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Views</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Status</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Featured</th>
                <th className="p-3 font-semibold text-sm text-gray-600">Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">{blog.title}</td>
                  <td className="p-3 text-sm text-gray-600">{blog.author?.username || 'Unknown'}</td>
                  <td className="p-3 text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-sm">{blog.views_count}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      blog.status === "published" ? "bg-green-100 text-green-800" :
                      blog.status === "draft" ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    }`}>
                      {blog.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm font-bold text-orange-600">
                    {blog.featured ? "Featured" : ""}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-4">
                      {blog.status === 'published' && (
                        <button onClick={() => handleToggleFeatured(blog.id)} className="text-blue-600 font-semibold hover:underline">
                          {blog.featured ? "Unfeature" : "Feature"}
                        </button>
                      )}
                      {blog.status === 'draft' && (
                        <button onClick={() => handleUpdateStatus(blog.id, 'publish')} className="text-green-600 font-semibold hover:underline">
                          Force Publish
                        </button>
                      )}
                      {blog.status === 'published' && (
                        <button onClick={() => handleUpdateStatus(blog.id, 'archive')} className="text-orange-600 font-semibold hover:underline">
                          Archive
                        </button>
                      )}
                      <Link href={`/blogs/${blog.id}`} className="text-[#2E2E38] font-semibold hover:underline">
                        View
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <h2 className="text-xl font-bold mb-4">Manage Categories</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {categories.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No categories exist.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-sm text-gray-600">ID</th>
                    <th className="p-3 font-semibold text-sm text-gray-600">Name</th>
                    <th className="p-3 font-semibold text-sm text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-500">{c.id}</td>
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleEditCategory(c.id, c.name)} className="text-blue-600 font-semibold hover:underline mr-4">Edit</button>
                        <button onClick={() => handleDeleteCategory(c.id)} className="text-red-600 font-semibold hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Manage Tags</h2>
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {tags.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No tags exist.</div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 font-semibold text-sm text-gray-600">ID</th>
                    <th className="p-3 font-semibold text-sm text-gray-600">Name</th>
                    <th className="p-3 font-semibold text-sm text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tags.map((t) => (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-500">{t.id}</td>
                      <td className="p-3 font-medium">{t.name}</td>
                      <td className="p-3 text-right">
                        <button onClick={() => handleDeleteTag(t.id)} className="text-red-600 font-semibold hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
