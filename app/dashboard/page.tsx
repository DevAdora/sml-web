"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  MessageCircle,
  Clock,
  Heart,
  Bookmark,
  Loader,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown,
  ArrowUp,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LeftSidebar from "@/app/components/Sidebar";
import { RightSidebar } from "../components/TrendingBar";
import { useRouter } from "next/navigation";
import {
  TrendingBook,
  FeedPost,
  TrendingTopic,
  SuggestedWriter,
  UserProfile,
} from "../types/types";

// ─── Types ───────────────────────────────────────────────────────────────────

type SortMode = "latest" | "top" | "discussed";
type FilterTab = "All" | "Fiction" | "Non-fiction" | "Poetry" | "Reviews";

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#1e1e1e] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-2.5 bg-[#1e1e1e] rounded w-1/3" />
          <div className="h-2 bg-[#1e1e1e] rounded w-1/4" />
        </div>
      </div>
      <div className="h-4 bg-[#1e1e1e] rounded w-3/4 mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-2.5 bg-[#1e1e1e] rounded w-full" />
        <div className="h-2.5 bg-[#1e1e1e] rounded w-5/6" />
      </div>
      <div className="flex gap-4">
        <div className="h-2.5 bg-[#1e1e1e] rounded w-10" />
        <div className="h-2.5 bg-[#1e1e1e] rounded w-10" />
        <div className="h-2.5 bg-[#1e1e1e] rounded w-12" />
      </div>
    </div>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "top", label: "Top rated" },
  { value: "discussed", label: "Most discussed" },
];

function SortDropdown({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-neutral-400 bg-[#161616] border border-[#272727] px-3 py-1.5 hover:border-[#3a3a3a] hover:text-white transition-all"
      >
        <SlidersHorizontal size={11} strokeWidth={2} />
        {current.label}
        <ChevronDown
          size={11}
          strokeWidth={2}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#161616] border border-[#272727] z-20 min-w-[140px] shadow-xl">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-[#1e1e1e] ${
                value === opt.value
                  ? "text-white font-medium"
                  : "text-neutral-400"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = [
  "All",
  "Fiction",
  "Non-fiction",
  "Poetry",
  "Reviews",
];

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  interactions,
  onLike,
  onBookmark,
  router,
}: {
  post: FeedPost;
  interactions: { liked: boolean; bookmarked: boolean; likeCount: number };
  onLike: (id: string, e: React.MouseEvent) => void;
  onBookmark: (id: string, e: React.MouseEvent) => void;
  router: ReturnType<typeof useRouter>;
}) {
  const isExternal = post.isExternal;

  const inner = (
    <article
      className="bg-[#111] border border-[#1f1f1f] overflow-hidden hover:border-[#2a2a2a] transition-all cursor-pointer group my-6"
    >
      {/* Cover image */}
      {post.cover_image_url && (
        <div className="relative w-full h-44">
          <Image
            src={post.cover_image_url}
            alt={post.cover_image_caption || post.title}
            fill
            className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          {isExternal && (
            <div className="absolute top-3 right-3 bg-black/60 px-2 py-0.5 flex items-center gap-1">
              <ExternalLink size={10} className="text-neutral-400" />
              <span className="text-xs text-neutral-400">{post.source}</span>
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-semibold flex-shrink-0">
              {post.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-300 truncate leading-tight">
                {post.author}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mt-0.5">
                <span>{post.timestamp}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock size={10} strokeWidth={1.5} />
                  {post.readTime}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-[#1a1a1a] border border-[#272727] px-2.5 py-1 flex-shrink-0 ml-3">
            {post.genre}
          </span>
        </div>

        {/* Title + excerpt */}
        <h3 className="text-base font-semibold text-white leading-snug mb-2 tracking-tight group-hover:text-neutral-200 transition-colors break-words">
          {post.title}
          {isExternal && !post.cover_image_url && (
            <ExternalLink
              size={12}
              className="inline ml-1.5 text-neutral-600 relative -top-0.5"
            />
          )}
        </h3>
        <p className="text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-2 break-words">
          {post.excerpt}
        </p>

        {/* Actions */}
        <div
          className="flex items-center gap-5 text-neutral-600"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Like */}
          {isExternal ? (
            <div className="flex items-center gap-1.5 text-xs">
              <Heart size={13} strokeWidth={1.5} />
              <span>{post.likes}</span>
            </div>
          ) : (
            <button
              onClick={(e) => onLike(post.id, e)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                interactions.liked
                  ? "text-red-400"
                  : "hover:text-neutral-300"
              }`}
            >
              <Heart
                size={13}
                strokeWidth={1.5}
                fill={interactions.liked ? "currentColor" : "none"}
              />
              <span>{interactions.likeCount ?? post.likes_count}</span>
            </button>
          )}

          {/* Comments */}
          <button
            onClick={(e) => {
              if (!isExternal) {
                e.preventDefault();
                router.push(`/dashboard/posts/${post.id}`);
              }
            }}
            className="flex items-center gap-1.5 text-xs hover:text-neutral-300 transition-colors"
          >
            <MessageCircle size={13} strokeWidth={1.5} />
            <span>{post.comments_count ?? post.comments}</span>
          </button>

          {/* Bookmark */}
          {isExternal ? (
            <div className="flex items-center gap-1.5 text-xs text-neutral-700 cursor-not-allowed select-none">
              <Bookmark size={13} strokeWidth={1.5} />
              <span>External</span>
            </div>
          ) : (
            <button
              onClick={(e) => onBookmark(post.id, e)}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                interactions.bookmarked
                  ? "text-amber-400"
                  : "hover:text-neutral-300"
              }`}
            >
              <Bookmark
                size={13}
                strokeWidth={1.5}
                fill={interactions.bookmarked ? "currentColor" : "none"}
              />
              <span>{interactions.bookmarked ? "Saved" : "Save"}</span>
            </button>
          )}

          {/* Read time right-aligned */}
          <span className="ml-auto text-[11px] text-neutral-700">
            {post.readTime}
          </span>
        </div>
      </div>
    </article>
  );

  if (isExternal) {
    return (
      <div
        key={post.id}
        onClick={() => post.link && window.open(post.link, "_blank")}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link key={post.id} href={`/dashboard/posts/${post.id}`}>
      {inner}
    </Link>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function SMLDashboard() {
  const router = useRouter();

  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [postInteractions, setPostInteractions] = useState<{
    [postId: string]: { liked: boolean; bookmarked: boolean; likeCount: number };
  }>({});

  const observerTarget = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  // ── Static data ────────────────────────────────────────────────────────────

  const internalTrending: TrendingTopic[] = [
    { tag: "literary-fiction", posts: "2.3k", growth: "+12%" },
    { tag: "book-recommendations", posts: "5.1k", growth: "+8%" },
    { tag: "reading-challenge-2024", posts: "1.8k", growth: "+25%" },
    { tag: "indie-authors", posts: "892", growth: "+15%" },
    { tag: "poetry", posts: "1.2k", growth: "+5%" },
  ];

  const suggestedWriters: SuggestedWriter[] = [
    {
      name: "Olivia Wordsworth",
      handle: "@oliviaw",
      followers: "12.3k",
      bio: "Literary critic & book reviewer",
    },
    {
      name: "Thomas Inkling",
      handle: "@tinkling",
      followers: "8.9k",
      bio: "Fantasy & sci-fi enthusiast",
    },
    {
      name: "Priya Chapters",
      handle: "@pchapters",
      followers: "15.2k",
      bio: "Contemporary fiction lover",
    },
  ];

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const generateAvatar = (name: string): string => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  // ── Sorting ────────────────────────────────────────────────────────────────

  const sortedPosts = [...feedPosts].sort((a, b) => {
    if (sortMode === "latest")
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortMode === "top")
      return (b.likes_count || 0) - (a.likes_count || 0);
    if (sortMode === "discussed")
      return (b.comments_count || 0) - (a.comments_count || 0);
    return 0;
  });

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredPosts =
    activeFilter === "All"
      ? sortedPosts
      : sortedPosts.filter(
          (p) => p.genre?.toLowerCase() === activeFilter.toLowerCase()
        );

  // ── Interactions ───────────────────────────────────────────────────────────

  const fetchPostInteractionStatus = async (postId: string) => {
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        return {
          liked: data.user_liked || false,
          bookmarked: data.user_bookmarked || false,
          likeCount: data.likes_count || 0,
        };
      }
    } catch (error) {
      console.error(`Error fetching post ${postId}:`, error);
    }
    return null;
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = postInteractions[postId];
    const newLiked = !current?.liked;

    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        liked: newLiked,
        likeCount: newLiked
          ? (prev[postId]?.likeCount || 0) + 1
          : Math.max((prev[postId]?.likeCount || 0) - 1, 0),
      },
    }));

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: newLiked ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setPostInteractions((prev) => ({ ...prev, [postId]: current }));
      } else {
        await new Promise((r) => setTimeout(r, 100));
        const updated = await fetchPostInteractionStatus(postId);
        if (updated)
          setPostInteractions((prev) => ({ ...prev, [postId]: updated }));
      }
    } catch {
      setPostInteractions((prev) => ({ ...prev, [postId]: current }));
    }
  };

  const handleBookmark = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const current = postInteractions[postId];
    const newBookmarked = !current?.bookmarked;

    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        liked: prev[postId]?.liked || false,
        likeCount: prev[postId]?.likeCount || 0,
        bookmarked: newBookmarked,
      },
    }));

    try {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: newBookmarked ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        setPostInteractions((prev) => ({ ...prev, [postId]: current }));
      } else {
        await new Promise((r) => setTimeout(r, 100));
        const updated = await fetchPostInteractionStatus(postId);
        if (updated)
          setPostInteractions((prev) => ({ ...prev, [postId]: updated }));
      }
    } catch {
      setPostInteractions((prev) => ({ ...prev, [postId]: current }));
    }
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchInternalPosts = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success && data.posts) {
        const posts: FeedPost[] = data.posts.map((post: any) => ({
          id: post.id,
          title: post.title,
          author: post.author_name || "Anonymous",
          author_id: post.author_id,
          avatar: generateAvatar(post.author_name || "Anonymous"),
          genre: post.genre || "General",
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          readTime: `${post.read_time || 5} min`,
          excerpt: post.excerpt || "",
          timestamp: getRelativeTime(post.created_at || post.published_at),
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          read_time: post.read_time || 5,
          created_at: post.created_at || post.published_at,
          isExternal: false,
          cover_image_url: post.cover_image_url || null,
          cover_image_caption: post.cover_image_caption || null,
        }));

        const interactions: typeof postInteractions = {};
        await Promise.all(
          posts.map(async (p) => {
            const s = await fetchPostInteractionStatus(p.id);
            if (s) interactions[p.id] = s;
          })
        );
        setPostInteractions((prev) => ({ ...prev, ...interactions }));

        return { posts, hasMore: data.hasMore || false };
      }
      return { posts: [], hasMore: false };
    } catch (error) {
      console.error("Error fetching posts:", error);
      return { posts: [], hasMore: false };
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoadingPosts(true);
      const { posts, hasMore } = await fetchInternalPosts(1);
      setFeedPosts(posts);
      setHasMore(hasMore);
      setLoadingPosts(false);
    };
    init();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const { posts, hasMore: more } = await fetchInternalPosts(nextPage);
    if (posts.length > 0) {
      setFeedPosts((prev) => [...prev, ...posts]);
      setPage(nextPage);
      setHasMore(more);
    } else {
      setHasMore(false);
    }
    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoadingMore) loadMorePosts();
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, isLoadingMore]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser({
              name: data.user.full_name || "User",
              username: data.user.email?.split("@")[0] || "user",
              avatar: generateAvatar(data.user.full_name || "User"),
              email: data.user.email || "",
              id: data.user.id,
              full_name: data.user.full_name,
            });
          }
        }
      } catch (e) {
        console.error("Error fetching user:", e);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (res.ok) window.location.href = "/";
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main ref={mainRef} className="pt-16 lg:pt-0 lg:ml-72 lg:mr-96 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

          {user && (
            <div className="mb-8 bg-[#111] border border-[#1f1f1f] p-5 flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  Good {getGreeting()}, {user.name.split(" ")[0]}
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Discover new stories and share your thoughts
                </p>
              </div>
              <div className="w-9 h-9 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-xs font-semibold flex-shrink-0">
                {user.avatar}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-white tracking-tight">
                Your Feed
              </h2>
              <p className="text-xs text-neutral-600 mt-0.5">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""} · {SORT_OPTIONS.find(o => o.value === sortMode)?.label.toLowerCase()}
              </p>
            </div>
            <SortDropdown value={sortMode} onChange={setSortMode} />
          </div>

          <div className="flex border-b border-[#1f1f1f] mb-6 overflow-x-auto scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`text-xs font-medium px-3.5 py-2.5 border-b-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  activeFilter === tab
                    ? "border-white text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {loadingPosts ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20 border border-[#1a1a1a] bg-[#111]">
              <BookOpen
                size={36}
                strokeWidth={1.2}
                className="mx-auto mb-4 text-neutral-700"
              />
              <h3 className="text-sm font-medium text-neutral-400 mb-1">
                {activeFilter === "All" ? "No posts yet" : `No ${activeFilter} posts yet`}
              </h3>
              <p className="text-xs text-neutral-600">
                {activeFilter === "All"
                  ? "Be the first to share something with the community."
                  : "Try a different filter or check back later."}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    interactions={
                      postInteractions[post.id] || {
                        liked: false,
                        bookmarked: false,
                        likeCount: post.likes_count || 0,
                      }
                    }
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    router={router}
                  />
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={observerTarget} className="py-6">
                {isLoadingMore && (
                  <div className="flex items-center justify-center gap-2 text-neutral-600">
                    <Loader className="animate-spin" size={16} />
                    <span className="text-xs">Loading more…</span>
                  </div>
                )}
              </div>

              {!hasMore && (
                <p className="text-center text-xs text-neutral-700 pb-8">
                  You've reached the end of your feed
                </p>
              )}
            </>
          )}
        </div>
      </main>

      <RightSidebar
        trendingBooks={trendingBooks}
        loadingTrending={loadingTrending}
        internalTrending={internalTrending}
        suggestedWriters={suggestedWriters}
      />

      {/* ── Back to top ── */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 w-9 h-9 bg-[#161616] border border-[#2a2a2a] flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#444] transition-all z-50 shadow-xl"
          title="Back to top"
        >
          <ArrowUp size={14} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}