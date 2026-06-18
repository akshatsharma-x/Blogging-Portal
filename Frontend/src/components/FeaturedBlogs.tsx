import { fetchAPI } from "@/lib/api";
import BlogCard, { Post } from "./BlogCard";

export default async function FeaturedBlogs() {
  let featuredPosts: Post[] = [];

  try {
    const res = await fetchAPI("/posts/featured/", { cache: "no-store" });
    featuredPosts = res.results || res || [];
  } catch {
    return null;
  }

  if (!featuredPosts || featuredPosts.length === 0) return null;

  return (
    <div className="mb-12 border-b border-gray-200 pb-12">
      <h2 className="text-3xl font-bold mb-8 flex items-center">
        <span className="text-[#FFE600] mr-3 text-4xl">★</span> Featured Posts
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {featuredPosts.map((post) => (
          <BlogCard key={post.id} blog={post} />
        ))}
      </div>
    </div>
  );
}
