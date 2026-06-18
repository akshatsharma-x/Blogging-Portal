import { blogs } from "@/data/blogs";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function BlogDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const blog = blogs.find((b) => b.id.toString() === resolvedParams.id);

  if (!blog) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/blogs" className="text-[#2E2E38] font-semibold hover:underline mb-4 inline-block">
        &larr; Back to Blogs
      </Link>
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      <div className="text-gray-600 mb-8 border-b pb-4">
        <p>By {blog.author}</p>
        <p>Published on {blog.date}</p>
      </div>
      <div className="prose lg:prose-xl">
        <p>{blog.content}</p>
      </div>
    </div>
  );
}
