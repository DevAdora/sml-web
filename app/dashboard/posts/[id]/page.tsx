"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Loader,
  X,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";
import { RightSidebar } from "@/app/components/TrendingBar";
import { CommentsResponse, PostData, CommentData } from "../../../types/types";
export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [user, setUser] = useState<any>(null);

  const [comments, setComments] = useState<CommentData[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsHasMore, setCommentsHasMore] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [commentActionId, setCommentActionId] = useState<string | null>(null);

  const trendingBooks: any[] = [];
  const internalTrending = [
    { tag: "literary-fiction", posts: "2.3k", growth: "+12%" },
    { tag: "book-recommendations", posts: "5.1k", growth: "+8%" },
  ];
  const suggestedWriters = [
    {
      name: "Olivia Wordsworth",
      handle: "@oliviaw",
      followers: "12.3k",
      bio: "Literary critic & book reviewer",
    },
  ];

  useEffect(() => {
    if (!postId) return;

    const fetchPost = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
        setLiked(data.user_liked || false);
        setBookmarked(data.user_bookmarked || false);
        setLikeCount(data.likes_count || 0);
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.authenticated) {
            setUser(data);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const fetchComments = async (page = 1, append = false) => {
    setCommentsLoading(true);
    setCommentsError(null);

    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?page=${page}&limit=20`,
        { credentials: "include" }
      );

      if (!res.ok) throw new Error("Failed to fetch comments");

      const data: CommentsResponse = await res.json();

      setComments((prev) =>
        append ? [...prev, ...data.comments] : data.comments
      );
      setCommentsPage(data.page);
      setCommentsHasMore(data.has_more);
    } catch (e: any) {
      console.error(e);
      setCommentsError(e?.message || "Failed to fetch comments");
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) return;
    fetchComments(1, false);
  }, [postId]);

  const refreshComments = async () => {
    await fetchComments(1, false);
  };

  const handleAddComment = async () => {
    if (!user) {
      alert("Please sign in to comment");
      return;
    }

    const content = newComment.trim();
    if (!content) return;

    setSubmittingComment(true);

    const tempId = `temp_${Date.now()}`;
    const optimistic: CommentData = {
      id: tempId,
      post_id: postId,
      user_id: user?.user?.id || user?.id || "me",
      content,
      created_at: new Date().toISOString(),
      updated_at: null,
      parent_id: null,
      author: user?.user?.user_metadata?.full_name || user?.full_name || "You",
      avatar_url: null,
      can_edit: true,
    };

    setComments((prev) => [optimistic, ...prev]);
    setNewComment("");

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to create comment");

      const created = await res.json();

      setComments((prev) => prev.map((c) => (c.id === tempId ? created : c)));

      setPost((prev) =>
        prev
          ? { ...prev, comments_count: (prev.comments_count || 0) + 1 }
          : prev
      );
    } catch (e) {
      console.error(e);
      setComments((prev) => prev.filter((c) => c.id !== tempId));
      setNewComment(content);
      alert("Could not post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const startEditComment = (comment: CommentData) => {
    setEditingCommentId(comment.id);
    setEditingValue(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingValue("");
  };

  const saveEditComment = async (commentId: string) => {
    const content = editingValue.trim();
    if (!content) return;

    setCommentActionId(commentId);

    // optimistic update
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, content, updated_at: new Date().toISOString() }
          : c
      )
    );

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) throw new Error("Failed to update comment");

      const updated = await res.json();

      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? { ...c, ...updated } : c))
      );
      cancelEditComment();
    } catch (e) {
      console.error(e);
      alert("Could not update comment.");
      await refreshComments(); // safest rollback
    } finally {
      setCommentActionId(null);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    setCommentActionId(commentId);

    const prevComments = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    try {
      const res = await fetch(`/api/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to delete comment");

      setPost((prev) =>
        prev
          ? {
              ...prev,
              comments_count: Math.max(0, (prev.comments_count || 0) - 1),
            }
          : prev
      );
    } catch (e) {
      console.error(e);
      setComments(prevComments); // rollback
      alert("Could not delete comment.");
    } finally {
      setCommentActionId(null);
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please sign in to like posts");
      return;
    }

    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1));

    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: newLiked ? "POST" : "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      setLiked(!newLiked);
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1));
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      alert("Please sign in to bookmark posts");
      return;
    }

    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);

    try {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: newBookmarked ? "POST" : "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      setBookmarked(!newBookmarked);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard/posts/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: shareUrl,
        });
      } catch (error) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Error copying link:", error);
      }
    }
  };

  const generateAvatar = (name: string): string => {
    if (!name) return "??";
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const formatContent = (content: string) => {
    return content.split("\n\n").map((paragraph, index) => (
      <p key={index} className="mb-6 leading-relaxed">
        {paragraph}
      </p>
    ));
  };

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader className="animate-spin text-neutral-600" size={48} />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center">
        <h1 className="text-2xl text-neutral-300 mb-4">Post not found</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="pt-16 lg:pt-0 lg:ml-72 lg:mr-96 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-neutral-400 hover:text-neutral-300 transition mb-6 sm:mb-8"
          >
            <ChevronLeft size={20} strokeWidth={1.5} />
            <span className="text-sm">Back to feed</span>
          </button>

          <article className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
            <header className="border-b border-neutral-800 p-6 sm:p-8 lg:p-12">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full text-xs font-medium">
                  {post.genre}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-neutral-100 mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 font-medium text-sm">
                    {generateAvatar(post.author)}
                  </div>
                  <div>
                    <p className="text-neutral-200 font-medium text-base sm:text-lg">
                      {post.author}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-neutral-500">
                      <span>{getRelativeTime(post.created_at)}</span>
                      <span>·</span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" strokeWidth={1.5} />
                        {post.read_time} min read
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLike}
                    className={`p-2 rounded-full transition ${
                      liked
                        ? "bg-red-500/10 text-red-400"
                        : "hover:bg-neutral-800 text-neutral-400"
                    }`}
                    aria-label="Like post"
                  >
                    <Heart
                      size={20}
                      strokeWidth={1.5}
                      fill={liked ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-2 rounded-full transition ${
                      bookmarked
                        ? "bg-neutral-700 text-neutral-200"
                        : "hover:bg-neutral-800 text-neutral-400"
                    }`}
                    aria-label="Bookmark post"
                  >
                    <Bookmark
                      size={20}
                      strokeWidth={1.5}
                      fill={bookmarked ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 hover:bg-neutral-800 text-neutral-400 rounded-full transition"
                    aria-label="Share post"
                  >
                    <Share2 size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </header>

            {post.cover_image_url && (
              <div className="relative w-full">
                <div className="relative w-full h-64 sm:h-96 lg:h-[500px]">
                  <Image
                    src={post.cover_image_url}
                    alt={post.cover_image_caption || post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {post.cover_image_caption && (
                  <div className="px-6 sm:px-8 lg:px-12 py-3">
                    <p className="text-xs sm:text-sm text-neutral-400 text-center italic">
                      {post.cover_image_caption}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="p-6 sm:p-8 lg:p-12">
              <div className="prose prose-invert prose-neutral max-w-none">
                <div className="text-neutral-300 text-base sm:text-lg leading-relaxed font-serif">
                  {formatContent(post.content)}
                </div>
              </div>

              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-neutral-800">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full text-xs hover:bg-neutral-700 transition cursor-pointer"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <footer className="border-t border-neutral-800 p-6 sm:p-8 bg-neutral-800/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-neutral-400">
                  <button
                    onClick={handleLike}
                    className="flex items-center space-x-2 hover:text-neutral-300 transition"
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.5}
                      fill={liked ? "currentColor" : "none"}
                    />
                    <span className="text-sm">{likeCount}</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={18} strokeWidth={1.5} />
                    <span className="text-sm">{post.comments_count}</span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm font-medium transition border border-neutral-700"
                >
                  Share
                </button>
              </div>
            </footer>
          </article>

          <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-serif text-neutral-200 mb-6">
              Comments ({post.comments_count})
            </h3>
            {/* Add comment */}
            <div className="mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 font-medium text-xs">
                  {user?.user?.user_metadata?.full_name
                    ? generateAvatar(user.user.user_metadata.full_name)
                    : user
                    ? "ME"
                    : "??"}
                </div>

                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={
                      user ? "Write a comment..." : "Sign in to write a comment"
                    }
                    disabled={!user || submittingComment}
                    rows={3}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700 resize-none"
                  />

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      {newComment.length > 5000
                        ? "Too long (max 5000 chars)"
                        : " "}
                    </p>

                    <button
                      onClick={handleAddComment}
                      disabled={
                        !user ||
                        submittingComment ||
                        !newComment.trim() ||
                        newComment.length > 5000
                      }
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:hover:bg-neutral-800 text-neutral-200 rounded-lg text-sm font-medium transition border border-neutral-700"
                    >
                      {submittingComment ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comments list */}
            {commentsLoading && comments.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-neutral-500">
                <Loader className="animate-spin mr-2" size={18} />
                <span className="text-sm">Loading comments...</span>
              </div>
            ) : commentsError ? (
              <div className="py-6 text-sm text-red-400">
                {commentsError}
                <button
                  onClick={refreshComments}
                  className="ml-3 text-neutral-300 hover:text-neutral-200 underline underline-offset-4"
                >
                  Retry
                </button>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                <MessageCircle
                  size={42}
                  className="mx-auto mb-3 text-neutral-700"
                  strokeWidth={1}
                />
                <p className="text-sm">Be the first to comment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 font-medium text-xs overflow-hidden">
                          {c.avatar_url ? (
                            // optional: if you want real avatar images later
                            <span>{generateAvatar(c.author)}</span>
                          ) : (
                            <span>{generateAvatar(c.author)}</span>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-neutral-200 font-medium">
                              {c.author}
                            </p>
                            <span className="text-xs text-neutral-600">·</span>
                            <p className="text-xs text-neutral-500">
                              {getRelativeTime(c.created_at)}
                              {c.updated_at ? " (edited)" : ""}
                            </p>
                          </div>

                          {editingCommentId === c.id ? (
                            <div className="mt-3">
                              <textarea
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                rows={3}
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-700 resize-none"
                              />
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  onClick={() => saveEditComment(c.id)}
                                  disabled={
                                    commentActionId === c.id ||
                                    !editingValue.trim()
                                  }
                                  className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-neutral-200 rounded-lg text-sm font-medium transition border border-neutral-700"
                                >
                                  {commentActionId === c.id
                                    ? "Saving..."
                                    : "Save"}
                                </button>
                                <button
                                  onClick={cancelEditComment}
                                  disabled={commentActionId === c.id}
                                  className="px-3 py-2 bg-transparent hover:bg-neutral-900 text-neutral-300 rounded-lg text-sm font-medium transition border border-neutral-800"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 text-sm text-neutral-300 whitespace-pre-wrap">
                              {c.content}
                            </p>
                          )}
                        </div>
                      </div>

                      {c.can_edit && (
                        <div className="flex items-center gap-2">
                          {editingCommentId !== c.id && (
                            <button
                              onClick={() => startEditComment(c)}
                              disabled={commentActionId === c.id}
                              className="text-xs px-3 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-neutral-300 transition disabled:opacity-50"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => deleteComment(c.id)}
                            disabled={commentActionId === c.id}
                            className="text-xs px-3 py-2 rounded-lg border border-neutral-800 hover:bg-neutral-900 text-red-300 transition disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load more */}
            <div className="mt-6 flex justify-center">
              {commentsHasMore && !commentsLoading && (
                <button
                  onClick={() => fetchComments(commentsPage + 1, true)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-sm font-medium transition border border-neutral-700"
                >
                  Load more
                </button>
              )}
              {commentsLoading && comments.length > 0 && (
                <div className="flex items-center text-neutral-500 text-sm">
                  <Loader className="animate-spin mr-2" size={16} />
                  Loading...
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <RightSidebar
        trendingBooks={trendingBooks}
        loadingTrending={false}
        internalTrending={internalTrending}
        suggestedWriters={suggestedWriters}
      />
    </div>
  );
}
