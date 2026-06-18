import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import CommentsSection, { CommentData } from "@/components/CommentsSection";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Tag { id: number; name: string; }
interface Category { id: number; name: string; }
interface BlogDetail {
  id: number;
  title: string;
  content: string;
  cover_image?: string | null;
  category?: Category | null;
  tags?: Tag[];
  author: { first_name?: string; last_name?: string; username: string };
  created_at: string;
  views_count?: number;
  comment_count?: number;
  comments: CommentData[];
}

export default async function BlogDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let blog: BlogDetail | null = null;

  try {
    blog = await fetchAPI(`/posts/${resolvedParams.id}/`, { cache: "no-store" });
  } catch {
    notFound();
  }

  if (!blog) {
    notFound();
  }

  const authorName = blog.author.first_name ? `${blog.author.first_name} ${blog.author.last_name}` : blog.author.username;
  const formattedDate = new Date(blog.created_at).toLocaleDateString();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Link href="/blogs" className="text-[#2E2E38] font-semibold hover:underline mb-4 inline-block">
        &larr; Back to Blogs
      </Link>
      
      {blog.cover_image && (
        <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6 bg-gray-100">
          <Image src={blog.cover_image} alt={blog.title} fill className="object-cover" unoptimized />
        </div>
      )}

      {blog.category && (
        <span className="bg-[#FFF9CC] text-[#2E2E38] text-sm font-semibold px-3 py-1 rounded inline-block mb-4">
          {blog.category.name}
        </span>
      )}
      
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      
      <div className="flex flex-wrap items-center text-gray-600 mb-6 border-b pb-4 gap-4">
        <div>By <span className="font-semibold">{authorName}</span></div>
        <div>&bull;</div>
        <div>{formattedDate}</div>
        <div>&bull;</div>
        <div className="flex gap-4">
          <span>👁️ {blog.views_count || 0} Views</span>
          <span>💬 {blog.comment_count || 0} Comments</span>
        </div>
      </div>

      {blog.tags && blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {blog.tags.map(tag => (
            <span key={tag.id} className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              #{tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="prose lg:prose-xl max-w-none mb-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content}</ReactMarkdown>
      </div>
      
      <CommentsSection postId={blog.id} initialComments={blog.comments || []} />
    </div>
  );
}
