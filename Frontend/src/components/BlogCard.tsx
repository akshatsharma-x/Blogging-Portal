import Link from "next/link";
import Image from "next/image";

interface Author {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
}

interface Category {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  author: Author;
  category?: Category | null;
  tags?: Tag[];
  excerpt: string;
  cover_image?: string | null;
  views_count?: number;
  comment_count?: number;
  status: string;
  created_at: string;
}

export default function BlogCard({ blog }: { blog: Post }) {
  const authorName = blog.author.first_name ? `${blog.author.first_name} ${blog.author.last_name}` : blog.author.username;
  const formattedDate = new Date(blog.created_at).toLocaleDateString();

  return (
    <div className="border rounded-lg shadow-sm hover:shadow-md transition overflow-hidden bg-white flex flex-col h-full">
      {blog.cover_image && (
        <div className="relative w-full h-48 bg-gray-100">
          <Image 
            src={blog.cover_image} 
            alt={blog.title} 
            fill 
            className="object-cover"
            unoptimized
          />
        </div>
      )}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2 items-center">
            {blog.status === "draft" && (
              <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                DRAFT
              </span>
            )}
            {blog.category && (
              <span className="bg-[#FFF9CC] text-[#2E2E38] text-xs font-semibold px-2 py-1 rounded">
                {blog.category.name}
              </span>
            )}
          </div>
          <div className="text-gray-500 text-xs flex gap-3">
            <span>👁️ {blog.views_count || 0}</span>
            <span>💬 {blog.comment_count || 0}</span>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h2>
        <p className="text-gray-500 text-xs mb-3">By {authorName} on {formattedDate}</p>
        
        <p className="text-gray-700 text-sm mb-4 flex-grow line-clamp-3">{blog.excerpt || "No excerpt available."}</p>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.slice(0, 3).map(tag => (
              <span key={tag.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        <Link href={`/blogs/${blog.id}`} className="inline-block mt-auto text-black font-bold hover:underline">
          Read more &rarr;
        </Link>
      </div>
    </div>
  );
}
