import Link from "next/link";
import { blogs } from "@/data/blogs";
import BlogCard from "@/components/BlogCard";

export default function Home() {
  const featuredBlogs = blogs.slice(0, 3);

  return (
    <div className="space-y-8">
      <section className="text-center py-12 bg-[#FFFCE6] rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Welcome to Blogging Portal</h1>
        <p className="text-gray-600 mb-6">Read the latest articles and stories from our community.</p>
        <Link href="/blogs" className="bg-[#FFE600] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#E6CF00]">
          Explore Blogs
        </Link>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Featured Blogs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredBlogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      </section>
    </div>
  );
}
