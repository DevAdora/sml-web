"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  Plus,
  Lock,
  Globe,
  Search,
  Clock,
  Heart,
  MessageCircle,
  Loader,
  X,
  BookOpen,
  Trash2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import LeftSidebar from "@/app/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BookmarkedPost {
  id: string;
  title: string;
  excerpt: string;
  genre: string;
  read_time: number;
  created_at: string;
  author: string;
  author_id: string;
  likes_count: number;
  comments_count: number;
  cover_image_url?: string | null;
  bookmarked_at: string;
}

interface ReadingList {
  id: string;
  title: string;
  description: string;
  is_private: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRelativeTime = (dateString: string): string => {
  const diff = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 1000
  );
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
};

const getInitials = (name: string) =>
  (name || "??")
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#1a1a1a] animate-pulse ${className ?? ""}`} />;
}

function PostSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-4/5 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-2 w-8" />
        <Skeleton className="h-2 w-8" />
        <Skeleton className="h-2 w-10" />
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/2" />
          <Skeleton className="h-2.5 w-3/4" />
          <Skeleton className="h-2.5 w-2/3" />
        </div>
        <Skeleton className="h-5 w-12 ml-4" />
      </div>
      <div className="flex gap-4 mt-4">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-2 w-14" />
      </div>
    </div>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

const TABS = [
  { id: "saved", label: "Saved Posts" },
  { id: "my-lists", label: "My Lists" },
];

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ReadingListsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("saved");
  const [searchQuery, setSearchQuery] = useState("");

  // Saved posts
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Reading lists
  const [readingLists, setReadingLists] = useState<ReadingList[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);

  // Create list form
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrivacy, setNewPrivacy] = useState<"public" | "private">("public");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // ── Fetch bookmarks ────────────────────────────────────────────────────────

  const fetchBookmarks = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch("/api/bookmarks", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedPosts(data.bookmarks || []);
      }
    } catch (e) {
      console.error("Error fetching bookmarks:", e);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  // ── Fetch reading lists ────────────────────────────────────────────────────

  const fetchLists = useCallback(async () => {
    setLoadingLists(true);
    try {
      const res = await fetch("/api/reading-lists", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setReadingLists(data.lists || []);
      }
    } catch (e) {
      console.error("Error fetching lists:", e);
    } finally {
      setLoadingLists(false);
    }
  }, []);

  useEffect(() => {
    fetchBookmarks();
    fetchLists();
  }, [fetchBookmarks, fetchLists]);

  // ── Remove bookmark ────────────────────────────────────────────────────────

  const removeBookmark = async (postId: string) => {
    // Optimistic
    setBookmarkedPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      fetchBookmarks(); // revert on error
    }
  };

  // ── Create reading list ────────────────────────────────────────────────────

  const handleCreateList = async () => {
    if (!newTitle.trim()) {
      setCreateError("Title is required");
      return;
    }
    setCreating(true);
    setCreateError("");
    try {
      const res = await fetch("/api/reading-lists", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
          is_private: newPrivacy === "private",
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to create list");
      }
      const data = await res.json();
      setReadingLists((prev) => [data.list, ...prev]);
      setShowCreate(false);
      setNewTitle("");
      setNewDesc("");
      setNewPrivacy("public");
      setActiveTab("my-lists");
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create list");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete reading list ────────────────────────────────────────────────────

  const deleteList = async (listId: string) => {
    setReadingLists((prev) => prev.filter((l) => l.id !== listId));
    try {
      await fetch(`/api/reading-lists/${listId}`, {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      fetchLists();
    }
  };

  // ── Filter by search ───────────────────────────────────────────────────────

  const filteredPosts = bookmarkedPosts.filter(
    (p) =>
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLists = readingLists.filter(
    (l) =>
      !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="lg:ml-[240px] min-h-screen">
        <div className="max-w-3xl mx-auto px-5 py-6">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Bookmark
                size={14}
                strokeWidth={1.5}
                className="text-neutral-600"
              />
              <h1 className="text-sm font-semibold text-white tracking-tight">
                Reading Lists
              </h1>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#0a0a0a] bg-white px-3.5 py-1.5 hover:bg-neutral-100 transition-colors"
            >
              <Plus size={13} strokeWidth={2.5} />
              New List
            </button>
          </div>

          {/* ── Tabs + search ── */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex border-b border-[#1a1a1a]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-[11px] font-medium px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "border-white text-white"
                      : "border-transparent text-neutral-600 hover:text-neutral-300"
                  }`}
                >
                  {tab.label}
                  {tab.id === "saved" && bookmarkedPosts.length > 0 && (
                    <span className="ml-1.5 text-[10px] text-neutral-700">
                      {bookmarkedPosts.length}
                    </span>
                  )}
                  {tab.id === "my-lists" && readingLists.length > 0 && (
                    <span className="ml-1.5 text-[10px] text-neutral-700">
                      {readingLists.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={13}
                strokeWidth={1.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-8 py-2 w-44 bg-[#111] border border-[#1f1f1f] text-sm text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-[#2a2a2a] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              )}
            </div>
          </div>

          {/* ── Saved Posts tab ── */}
          {activeTab === "saved" && (
            <div>
              {loadingPosts ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => <PostSkeleton key={i} />)}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-[#111] border border-[#1f1f1f] p-14 text-center">
                  <Bookmark
                    size={30}
                    strokeWidth={1.2}
                    className="mx-auto mb-3 text-neutral-700"
                  />
                  <p className="text-sm text-neutral-500 mb-1">
                    {searchQuery
                      ? `No saved posts match "${searchQuery}"`
                      : "No saved posts yet"}
                  </p>
                  <p className="text-xs text-neutral-700 mb-5">
                    {searchQuery
                      ? "Try a different search term"
                      : "Bookmark posts from your feed to read them later"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="text-xs font-medium text-neutral-400 border border-[#272727] px-4 py-2 hover:border-[#3a3a3a] hover:text-neutral-200 transition-colors"
                    >
                      Browse Feed
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
                    <div key={post.id} className="group relative">
                      <Link href={`/dashboard/posts/${post.id}`}>
                        <article className="bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer p-5">
                          {/* Author row */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[9px] font-semibold text-neutral-500 flex-shrink-0">
                                {getInitials(post.author)}
                              </div>
                              <div>
                                <p className="text-xs font-medium text-neutral-400 leading-tight">
                                  {post.author}
                                </p>
                                <div className="flex items-center gap-1.5 text-[10px] text-neutral-600 mt-0.5">
                                  <span>{getRelativeTime(post.created_at)}</span>
                                  <span>·</span>
                                  <span className="flex items-center gap-1">
                                    <Clock size={9} strokeWidth={1.5} />
                                    {post.read_time} min
                                  </span>
                                </div>
                              </div>
                            </div>
                            {post.genre && (
                              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 flex-shrink-0">
                                {post.genre}
                              </span>
                            )}
                          </div>

                          {/* Title + excerpt */}
                          <h3 className="text-sm font-semibold text-white leading-snug mb-1.5 tracking-tight">
                            {post.title}
                          </h3>
                          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-3.5">
                            {post.excerpt}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-neutral-700">
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <Heart size={11} strokeWidth={1.5} />
                              <span>{post.likes_count}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <MessageCircle size={11} strokeWidth={1.5} />
                              <span>{post.comments_count}</span>
                            </div>
                            <span className="ml-auto text-[10px] text-neutral-700">
                              Saved {getRelativeTime(post.bookmarked_at)}
                            </span>
                          </div>
                        </article>
                      </Link>

                      {/* Remove bookmark — appears on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          removeBookmark(post.id);
                        }}
                        title="Remove bookmark"
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-red-400 hover:bg-[#1a1a1a] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Bookmark size={13} strokeWidth={1.5} fill="currentColor" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My Lists tab ── */}
          {activeTab === "my-lists" && (
            <div>
              {loadingLists ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => <ListSkeleton key={i} />)}
                </div>
              ) : filteredLists.length === 0 ? (
                <div className="bg-[#111] border border-[#1f1f1f] p-14 text-center">
                  <BookOpen
                    size={30}
                    strokeWidth={1.2}
                    className="mx-auto mb-3 text-neutral-700"
                  />
                  <p className="text-sm text-neutral-500 mb-1">
                    {searchQuery
                      ? `No lists match "${searchQuery}"`
                      : "No reading lists yet"}
                  </p>
                  <p className="text-xs text-neutral-700 mb-5">
                    {searchQuery
                      ? "Try a different search term"
                      : "Organise your saved posts into curated reading lists"}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setShowCreate(true)}
                      className="text-xs font-semibold text-[#0a0a0a] bg-white px-4 py-2 hover:bg-neutral-100 transition-colors"
                    >
                      Create Your First List
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLists.map((list) => (
                    <div key={list.id} className="group relative">
                      <button
                        onClick={() =>
                          router.push(`/dashboard/lists/${list.id}`)
                        }
                        className="w-full bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors p-5 text-left"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="text-sm font-semibold text-white leading-tight tracking-tight truncate">
                                {list.title}
                              </h3>
                              {list.is_private ? (
                                <Lock
                                  size={11}
                                  strokeWidth={1.5}
                                  className="text-neutral-600 flex-shrink-0"
                                />
                              ) : (
                                <Globe
                                  size={11}
                                  strokeWidth={1.5}
                                  className="text-neutral-700 flex-shrink-0"
                                />
                              )}
                            </div>
                            {list.description && (
                              <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                                {list.description}
                              </p>
                            )}
                          </div>
                          <ChevronRight
                            size={14}
                            strokeWidth={1.5}
                            className="text-neutral-700 flex-shrink-0 mt-0.5 group-hover:text-neutral-500 transition-colors"
                          />
                        </div>

                        <div className="flex items-center gap-4 text-[10px] text-neutral-700 mt-3">
                          <span>{list.post_count ?? 0} posts</span>
                          <span>·</span>
                          <span>
                            {list.is_private ? "Private" : "Public"}
                          </span>
                          <span>·</span>
                          <span>Updated {getRelativeTime(list.updated_at)}</span>
                        </div>
                      </button>

                      {/* Delete — hover */}
                      <button
                        onClick={() => deleteList(list.id)}
                        title="Delete list"
                        className="absolute top-3 right-8 w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-red-400 hover:bg-[#1a1a1a] transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── Create List panel (inline, no modal) ── */}
      {showCreate && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowCreate(false)}
          />

          {/* Slide-in panel from right */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-[#1a1a1a] z-50 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
              <span className="text-sm font-semibold text-white tracking-tight">
                New Reading List
              </span>
              <button
                onClick={() => setShowCreate(false)}
                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-[#1a1a1a] transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {createError && (
                <div className="bg-red-500/8 border border-red-500/15 px-3 py-2.5 text-xs text-red-400">
                  {createError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
                  Title <span className="text-neutral-700">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => {
                    setNewTitle(e.target.value);
                    setCreateError("");
                  }}
                  placeholder="e.g. Best Mystery Novels"
                  maxLength={100}
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#272727] text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors"
                />
                <p className="text-[10px] text-neutral-700 mt-1 text-right">
                  {newTitle.length}/100
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="What's this list about?"
                  rows={4}
                  maxLength={300}
                  className="w-full px-3 py-2.5 bg-[#161616] border border-[#272727] text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors resize-none"
                />
                <p className="text-[10px] text-neutral-700 mt-1 text-right">
                  {newDesc.length}/300
                </p>
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-2">
                  Visibility
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["public", "private"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setNewPrivacy(opt)}
                      className={`flex items-center gap-2 px-3 py-2.5 border text-xs font-medium transition-colors ${
                        newPrivacy === opt
                          ? "border-white text-white bg-[#1a1a1a]"
                          : "border-[#272727] text-neutral-500 hover:border-[#3a3a3a] hover:text-neutral-300"
                      }`}
                    >
                      {opt === "public" ? (
                        <Globe size={13} strokeWidth={1.5} />
                      ) : (
                        <Lock size={13} strokeWidth={1.5} />
                      )}
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-700 mt-2">
                  {newPrivacy === "public"
                    ? "Anyone on SML can discover and follow this list"
                    : "Only you can see this list"}
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex-shrink-0 px-5 py-4 border-t border-[#1a1a1a] flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 text-xs font-medium text-neutral-500 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateList}
                disabled={creating || !newTitle.trim()}
                className="flex-1 py-2.5 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-neutral-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {creating ? (
                  <><Loader className="animate-spin" size={12} /> Creating…</>
                ) : (
                  "Create List"
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}