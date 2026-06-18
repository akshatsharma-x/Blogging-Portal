import { blogs } from "@/data/blogs";
import BlogCard from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";

export default function BlogsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">All Blogs</h1>
      <SearchBar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </div>
  );
}
