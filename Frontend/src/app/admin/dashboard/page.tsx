import Link from "next/link";
import { blogs, users } from "@/data/blogs";

export default function AdminDashboard() {
  const totalBlogs = blogs.length;
  const totalUsers = users.length;
  const publishedBlogs = blogs.filter(b => b.status === "Published").length;
  const draftBlogs = blogs.filter(b => b.status === "Draft").length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <Link href="/admin/blogs" className="text-[#2E2E38] font-semibold hover:underline">Manage Blogs</Link>
          <Link href="/admin/users" className="text-[#2E2E38] font-semibold hover:underline">Manage Users</Link>
          <Link href="/admin/create-blog" className="bg-[#FFE600] text-black font-semibold px-4 py-2 rounded hover:bg-[#E6CF00]">Create Blog</Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Blogs</h2>
          <p className="text-3xl font-bold text-gray-800">{totalBlogs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-gray-500 text-sm font-bold uppercase mb-2">Total Users</h2>
          <p className="text-3xl font-bold text-gray-800">{totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-gray-500 text-sm font-bold uppercase mb-2">Published Blogs</h2>
          <p className="text-3xl font-bold text-green-600">{publishedBlogs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-gray-500 text-sm font-bold uppercase mb-2">Draft Blogs</h2>
          <p className="text-3xl font-bold text-yellow-600">{draftBlogs}</p>
        </div>
      </div>
    </div>
  );
}
