"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export interface ReplyData {
  id: number;
  body: string;
  created_at: string;
  author?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export interface CommentData extends ReplyData {
  replies?: ReplyData[];
}

export default function CommentsSection({ postId, initialComments }: { postId: number, initialComments: CommentData[] }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const router = useRouter();
  const { isStaff } = useAuth();

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const addedComment = await fetchAPI(`/posts/${postId}/comments/`, {
        method: "POST",
        body: JSON.stringify({ body: newComment, post: postId }),
      });
      
      setComments([...comments, addedComment]);
      setNewComment("");
      toast.success("Comment posted!");
      router.refresh();
    } catch {
      toast.error("Failed to post comment. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    setLoading(true);
    try {
      const addedReply = await fetchAPI(`/posts/${postId}/comments/`, {
        method: "POST",
        body: JSON.stringify({ body: replyBody, post: postId, parent: parentId }),
      });
      
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: [...(c.replies || []), addedReply] };
        }
        return c;
      }));
      setReplyBody("");
      setReplyingTo(null);
      toast.success("Reply posted!");
      router.refresh();
    } catch {
      toast.error("Failed to post reply. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await fetchAPI(`/posts/${postId}/comments/${commentId}/`, { method: "DELETE" });
      setComments(comments.filter(c => c.id !== commentId));
      toast.success("Comment deleted successfully.");
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  const handleDeleteReply = async (parentId: number, replyId: number) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      await fetchAPI(`/posts/${postId}/comments/${replyId}/`, { method: "DELETE" });
      setComments(comments.map(c => {
        if (c.id === parentId) {
          return { ...c, replies: (c.replies || []).filter(r => r.id !== replyId) };
        }
        return c;
      }));
      toast.success("Reply deleted successfully.");
    } catch {
      toast.error("Failed to delete reply.");
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})</h3>
      
      <form onSubmit={handlePostComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600] mb-3"
          rows={3}
          placeholder="Leave a comment..."
          required
        ></textarea>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-[#FFE600] text-black font-semibold px-6 py-2 rounded hover:bg-[#E6CF00] disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Comment"}
        </button>
      </form>

      <div className="space-y-6">
        {comments.map((comment: CommentData) => (
          <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold">
                {comment.author?.first_name 
                  ? `${comment.author.first_name} ${comment.author.last_name}` 
                  : comment.author?.username || "Anonymous"}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
                {isStaff && (
                  <button onClick={() => handleDeleteComment(comment.id)} className="text-xs text-red-600 font-bold hover:underline">
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-gray-800 mb-3">{comment.body}</p>
            
            <button 
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-sm text-[#2E2E38] font-semibold hover:underline"
            >
              Reply
            </button>

            {replyingTo === comment.id && (
              <form onSubmit={(e) => handlePostReply(e, comment.id)} className="mt-3 ml-6">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#FFE600] mb-2 text-sm"
                  rows={2}
                  placeholder="Write a reply..."
                  required
                ></textarea>
                <div className="flex gap-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-[#FFE600] text-black text-sm font-semibold px-4 py-1.5 rounded hover:bg-[#E6CF00] disabled:opacity-50"
                  >
                    Post Reply
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReplyingTo(null)}
                    className="bg-gray-200 text-black text-sm font-semibold px-4 py-1.5 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 ml-6 space-y-4 border-l-2 pl-4 border-gray-200">
                {comment.replies.map(reply => (
                  <div key={reply.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">
                        {reply.author?.first_name 
                          ? `${reply.author.first_name} ${reply.author.last_name}` 
                          : reply.author?.username || "Anonymous"}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">
                          {new Date(reply.created_at).toLocaleDateString()}
                        </span>
                        {isStaff && (
                          <button onClick={() => handleDeleteReply(comment.id, reply.id)} className="text-xs text-red-600 font-bold hover:underline">
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 text-sm">{reply.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
