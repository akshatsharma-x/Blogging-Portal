import BlogCard, { Post } from "@/components/BlogCard";
import SearchBar from "@/components/SearchBar";
import FeaturedBlogs from "@/components/FeaturedBlogs";
import { fetchAPI } from "@/lib/api";
import Link from "next/link";

export default async function BlogsPage({ searchParams }: { searchParams: Promise<{ page?: string; search?: string; category?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const page = resolvedSearchParams.page || "1";
  const search = resolvedSearchParams.search || "";
  const category = resolvedSearchParams.category || "";
  
  let allBlogs: { pagination?: { next: string | null, previous: string | null }, results?: Post[] } | Post[] | null = null;
  
  try {
    const queryParams = new URLSearchParams();
    queryParams.set("page", page);
    if (search) queryParams.set("search", search);
    if (category) queryParams.set("category", category);

    allBlogs = await fetchAPI(`/posts/?${queryParams.toString()}`, { cache: "no-store" });
  } catch {
    // Graceful fallback
  }

  const isArray = Array.isArray(allBlogs);
  const paginatedData = allBlogs as { pagination?: { next: string | null, previous: string | null }, results?: Post[] };
  
  const blogsData = !isArray && paginatedData?.results ? paginatedData.results : (isArray ? (allBlogs as Post[]) : []);
  const next = !isArray ? paginatedData?.pagination?.next : null;
  const previous = !isArray ? paginatedData?.pagination?.previous : null;
  const currentPage = parseInt(page, 10);

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Explore Blogs</h1>
      
      <SearchBar />

      {!search && <FeaturedBlogs />}

      {blogsData.length === 0 ? (
        <p className="text-gray-600 mt-4">No blogs found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {blogsData.map((blog: Post) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-8 pt-4 border-t">
            {previous ? (
              <Link href={`/blogs?page=${currentPage - 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-semibold">
                &larr; Previous
              </Link>
            ) : <div />}
            
            {next ? (
              <Link href={`/blogs?page=${currentPage + 1}${search ? `&search=${search}` : ""}${category ? `&category=${category}` : ""}`} className="px-4 py-2 bg-gray-200 text-black rounded hover:bg-gray-300 font-semibold">
                Next &rarr;
              </Link>
            ) : <div />}
          </div>
        </>
      )}
    </div>
  );
}
