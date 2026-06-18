"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export default function EditBlog() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    category_id: "",
  });
  
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, tagsRes, postRes] = await Promise.all([
          fetchAPI("/categories/"),
          fetchAPI("/tags/"),
          fetchAPI(`/posts/${id}/`),
        ]);
        
        setCategories(catsRes.results || catsRes || []);
        setTags(tagsRes.results || tagsRes || []);

        setFormData({
          title: postRes.title || "",
          content: postRes.content || "",
          excerpt: postRes.excerpt || "",
          status: postRes.status || "draft",
          category_id: postRes.category?.id?.toString() || "",
        });

        if (postRes.tags && Array.isArray(postRes.tags)) {
          setSelectedTags(postRes.tags.map((t: { id: number }) => t.id));
        }

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags((prev) => 
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    setCreatingTag(true);
    try {
      const res = await fetchAPI("/tags/", {
        method: "POST",
        body: JSON.stringify({ name: newTagName.trim() })
      });
      setTags([...tags, res]);
      setSelectedTags([...selectedTags, res.id]);
      setNewTagName("");
      toast.success("Tag created!");
    } catch {
      toast.error("Failed to create tag.");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("content", formData.content);
    data.append("excerpt", formData.excerpt);
    data.append("status", formData.status);
    
    if (formData.category_id) {
      data.append("category_id", formData.category_id);
    }
    
    selectedTags.forEach((tagId) => {
      data.append("tag_ids", tagId.toString());
    });

    if (coverImage) {
      data.append("cover_image", coverImage);
    }

    try {
      await fetchAPI(`/posts/${id}/`, {
        method: "PUT",
        body: data,
      });

      toast.success("Blog updated successfully!");
      router.push("/author/blogs");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(msg || "Failed to update blog post.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="space-y-6 bg-white p-6 border rounded-lg shadow-sm">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-32 bg-gray-200 rounded w-full"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Blog</h1>
        <Link href="/author/blogs" className="text-gray-600 hover:underline">
          Cancel
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 border rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600]" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cover Image (Upload new to replace)</label>
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span></p>
                <p className="text-xs text-gray-500">PNG, JPG or GIF</p>
                {coverImage && <p className="mt-2 text-sm font-bold text-[#2E2E38] bg-[#FFF9CC] px-2 py-1 rounded">{coverImage.name}</p>}
              </div>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange} 
                className="hidden" 
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select 
              name="category_id" 
              value={formData.category_id} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600]"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <label key={t.id} className="flex items-center space-x-2 bg-gray-50 px-3 py-1 border rounded cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={selectedTags.includes(t.id)}
                  onChange={() => handleTagToggle(t.id)}
                  className="rounded text-[#FFE600] focus:ring-[#FFE600]"
                />
                <span className="text-sm">{t.name}</span>
              </label>
            ))}
          </div>
          <div className="mt-3 flex gap-2 max-w-sm">
            <input 
              type="text" 
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Create new tag" 
              className="flex-1 p-1 px-2 border rounded focus:outline-none focus:ring-1 focus:ring-[#FFE600] text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(); } }}
            />
            <button 
              type="button" 
              onClick={handleCreateTag}
              disabled={creatingTag || !newTagName.trim()}
              className="bg-gray-200 text-black px-3 py-1 rounded hover:bg-gray-300 text-sm font-semibold disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Excerpt</label>
          <textarea 
            name="excerpt" 
            value={formData.excerpt} 
            onChange={handleChange} 
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600]" 
            rows={3} 
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea 
            name="content" 
            value={formData.content} 
            onChange={handleChange} 
            className="w-full p-2 border rounded h-64 focus:outline-none focus:ring-2 focus:ring-[#FFE600]" 
            required 
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-[#FFE600] text-black font-semibold py-3 rounded hover:bg-[#E6CF00] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
