import Link from "next/link";

export default function BlogCard({ blog }: { blog: { id: number; title: string; author: string; date: string; content: string; status: string } }) {
  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
      <h2 className="text-xl font-bold mb-2">{blog.title}</h2>
      <p className="text-gray-600 text-sm mb-2">By {blog.author} on {blog.date}</p>
      <p className="text-gray-800 mb-4">{blog.content.substring(0, 100)}...</p>
      <Link href={`/blogs/${blog.id}`} className="text-[#2E2E38] font-bold hover:text-black hover:underline">
        Read more
      </Link>
    </div>
  );
}
