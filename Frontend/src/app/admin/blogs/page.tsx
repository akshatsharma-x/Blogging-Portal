import { blogs } from "@/data/blogs";
import Link from "next/link";

export default function ManageBlogs() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Blogs</h1>
        <Link href="/admin/create-blog" className="bg-[#FFE600] text-black font-semibold px-4 py-2 rounded hover:bg-[#E6CF00]">
          Create New Blog
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border">
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
                <td className="p-4">{blog.author}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-sm ${blog.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {blog.status}
                  </span>
                </td>
                <td className="p-4 space-x-2">
                  <Link href={`/blogs/${blog.id}`} className="text-[#2E2E38] font-semibold hover:underline">View</Link>
                  <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
