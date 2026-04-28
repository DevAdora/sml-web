"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  TrendingUp,
  Users,
  Hash,
  BookOpen,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  ExternalLink,
  Loader,
  X,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/app/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SMLPost {
  id: string;
  title: string;
  excerpt: string;
  author_name: string;
  genre: string;
  likes_count: number;
  comments_count: number;
  read_time: number;
  created_at: string;
  cover_image_url?: string | null;
}

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

interface SuggestedUser {
  id: string;
  full_name: string;
  post_count?: number;
  follower_count?: number;
  is_following: boolean;
}

interface NYTBook {
  title: string;
  author: string;
  description: string;
  amazon_product_url: string;
  rank: number;
  weeks_on_list: number;
  publisher: string;
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
  return (
    <div
      className={`bg-[#1a1a1a] animate-pulse ${className ?? ""}`}
    />
  );
}

function PostSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-2.5 w-1/3" />
          <Skeleton className="h-2 w-1/4" />
        </div>
      </div>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-5/6 mb-4" />
      <div className="flex gap-4">
        <Skeleton className="h-2 w-8" />
        <Skeleton className="h-2 w-8" />
        <Skeleton className="h-2 w-10" />
      </div>
    </div>
  );
}

// ─── Post card (matches feed exactly) ────────────────────────────────────────

function PostCard({
  post,
  onLike,
  onBookmark,
  liked,
  bookmarked,
  likeCount,
}: {
  post: SMLPost;
  onLike: (id: string) => void;
  onBookmark: (id: string) => void;
  liked: boolean;
  bookmarked: boolean;
  likeCount: number;
}) {
  return (
    <Link href={`/dashboard/posts/${post.id}`}>
      <article className="bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer group my-5">
        {post.cover_image_url && (
          <div
            className="w-full h-40 bg-[#161616] bg-cover bg-center"
            style={{ backgroundImage: `url(${post.cover_image_url})` }}
          />
        )}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[10px] font-semibold text-neutral-500 flex-shrink-0">
                {getInitials(post.author_name)}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-300 leading-tight">
                  {post.author_name}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mt-0.5">
                  <span>{getRelativeTime(post.created_at)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={10} strokeWidth={1.5} />
                    {post.read_time} min
                  </span>
                </div>
              </div>
            </div>
            {post.genre && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-[#1a1a1a] border border-[#272727] px-2.5 py-1 flex-shrink-0">
                {post.genre}
              </span>
            )}
          </div>

          <h3 className="text-base font-semibold text-white leading-snug mb-2 tracking-tight group-hover:text-neutral-200 transition-colors">
            {post.title}
          </h3>
          <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-4">
            {post.excerpt}
          </p>

          <div
            className="flex items-center gap-5 text-neutral-600"
            onClick={(e) => e.preventDefault()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                onLike(post.id);
              }}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? "text-red-400" : "hover:text-neutral-300"
              }`}
            >
              <Heart
                size={13}
                strokeWidth={1.5}
                fill={liked ? "currentColor" : "none"}
              />
              <span>{likeCount}</span>
            </button>
            <div className="flex items-center gap-1.5 text-xs">
              <MessageCircle size={13} strokeWidth={1.5} />
              <span>{post.comments_count}</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark(post.id);
              }}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                bookmarked ? "text-amber-400" : "hover:text-neutral-300"
              }`}
            >
              <Bookmark
                size={13}
                strokeWidth={1.5}
                fill={bookmarked ? "currentColor" : "none"}
              />
              <span>{bookmarked ? "Saved" : "Save"}</span>
            </button>
            <span className="ml-auto text-[11px] text-neutral-700">
              {post.read_time} min
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
  count,
}: {
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-neutral-700">{icon}</span>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </h2>
      {count !== undefined && (
        <span className="text-[10px] text-neutral-700 ml-1">
          {count} results
        </span>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const GENRES = [
  "All",
  "Fiction",
  "Non-Fiction",
  "Literary Analysis",
  "Book Review",
  "Essay",
  "Opinion",
  "Poetry",
  "Science Fiction",
  "Fantasy",
  "Mystery",
  "Thriller",
  "Biography",
  "Philosophy",
  "Contemporary",
];

const INTERNAL_TRENDING: TrendingTopic[] = [
  { tag: "literary-fiction", posts: "2.3k", growth: "+12%" },
  { tag: "book-recommendations", posts: "5.1k", growth: "+8%" },
  { tag: "reading-challenge-2024", posts: "1.8k", growth: "+25%" },
  { tag: "indie-authors", posts: "892", growth: "+15%" },
  { tag: "poetry-corner", posts: "1.2k", growth: "+5%" },
  { tag: "book-club-picks", posts: "923", growth: "+18%" },
];

export default function DiscoverPage() {
  const router = useRouter();

  // ── Search state ───────────────────────────────────────────────────────────
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");

  // ── Posts ──────────────────────────────────────────────────────────────────
  const [posts, setPosts] = useState<SMLPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postInteractions, setPostInteractions] = useState<
    Record<string, { liked: boolean; bookmarked: boolean; likeCount: number }>
  >({});

  // ── NYT Books ──────────────────────────────────────────────────────────────
  const [nytBooks, setNytBooks] = useState<NYTBook[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // ── Suggested users ────────────────────────────────────────────────────────
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // ── Fetch posts ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const params = new URLSearchParams({ limit: "20" });
      if (debouncedQuery) params.set("search", debouncedQuery);
      if (activeGenre !== "All") params.set("genre", activeGenre);

      const res = await fetch(`/api/posts?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      const fetched: SMLPost[] = (data.posts || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt || "",
        author_name: p.author_name || "Anonymous",
        genre: p.genre || "",
        likes_count: p.likes_count || 0,
        comments_count: p.comments_count || 0,
        read_time: p.read_time || 1,
        created_at: p.created_at || p.published_at,
        cover_image_url: p.cover_image_url || null,
      }));

      setPosts(fetched);

      // Fetch interaction state for each post
      const interactions: typeof postInteractions = {};
      await Promise.all(
        fetched.map(async (p) => {
          try {
            const r = await fetch(`/api/posts/${p.id}`, {
              credentials: "include",
            });
            if (r.ok) {
              const d = await r.json();
              interactions[p.id] = {
                liked: d.user_liked || false,
                bookmarked: d.user_bookmarked || false,
                likeCount: d.likes_count || p.likes_count,
              };
            }
          } catch {
            interactions[p.id] = {
              liked: false,
              bookmarked: false,
              likeCount: p.likes_count,
            };
          }
        })
      );
      setPostInteractions(interactions);
    } catch (e) {
      console.error("Error fetching posts:", e);
    } finally {
      setLoadingPosts(false);
    }
  }, [debouncedQuery, activeGenre]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Fetch NYT books ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch(
          "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=DEMO_KEY"
        );
        const data = await res.json();
        if (data.results?.books) {
          setNytBooks(
            data.results.books.slice(0, 6).map((b: any) => ({
              title: b.title,
              author: b.author,
              description: b.description,
              amazon_product_url: b.amazon_product_url,
              rank: b.rank,
              weeks_on_list: b.weeks_on_list,
              publisher: b.publisher,
            }))
          );
        }
      } catch (e) {
        console.error("Error fetching NYT books:", e);
      } finally {
        setLoadingBooks(false);
      }
    };
    fetch_();
  }, []);

  // ── Fetch suggested users ──────────────────────────────────────────────────
  useEffect(() => {
    const fetch_ = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/user/suggested?limit=5", {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSuggestedUsers(data.users || []);
      } catch {
        setSuggestedUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetch_();
  }, []);

  // ── Interactions ───────────────────────────────────────────────────────────

  const handleLike = async (postId: string) => {
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
      await fetch(`/api/posts/${postId}/like`, {
        method: newLiked ? "POST" : "DELETE",
        credentials: "include",
      });
    } catch {
      setPostInteractions((prev) => ({ ...prev, [postId]: current }));
    }
  };

  const handleBookmark = async (postId: string) => {
    const current = postInteractions[postId];
    const newBookmarked = !current?.bookmarked;
    setPostInteractions((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], bookmarked: newBookmarked },
    }));
    try {
      await fetch(`/api/posts/${postId}/bookmark`, {
        method: newBookmarked ? "POST" : "DELETE",
        credentials: "include",
      });
    } catch {
      setPostInteractions((prev) => ({ ...prev, [postId]: current }));
    }
  };

  const toggleFollow = async (userId: string, currentlyFollowing: boolean) => {
    setFollowLoadingId(userId);
    setSuggestedUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_following: !currentlyFollowing } : u
      )
    );
    try {
      const res = await fetch(`/api/user/${userId}/follow`, {
        method: currentlyFollowing ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) {
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_following: currentlyFollowing } : u
          )
        );
      }
    } catch {
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_following: currentlyFollowing } : u
        )
      );
    } finally {
      setFollowLoadingId(null);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/";
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="lg:ml-[240px] min-h-screen">
        <div className="max-w-[1200px] mx-auto px-5 py-6">

          {/* ── Search bar ── */}
          <div className="relative mb-6">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-600"
              size={15}
              strokeWidth={1.5}
            />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, authors, genres…"
              className="w-full pl-10 pr-10 py-2.5 bg-[#111] border border-[#1f1f1f] text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-[#2a2a2a] transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-400 transition-colors"
              >
                <X size={14} strokeWidth={2} />
              </button>
            )}
          </div>

          {/* ── Genre filter tabs ── */}
          <div className="flex gap-0 border-b border-[#1a1a1a] mb-6 overflow-x-auto [scrollbar-width:none]">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={`text-[11px] font-medium px-3.5 py-2.5 border-b-2 whitespace-nowrap flex-shrink-0 transition-all ${
                  activeGenre === g
                    ? "border-white text-white"
                    : "border-transparent text-neutral-600 hover:text-neutral-300"
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">

            <div className="space-y-6">

              <section>
                <SectionHeader
                  icon={<TrendingUp size={11} strokeWidth={1.6} />}
                  label={
                    debouncedQuery
                      ? `Results for "${debouncedQuery}"`
                      : activeGenre !== "All"
                      ? `${activeGenre} posts`
                      : "Discover Posts"
                  }
                  count={loadingPosts ? undefined : posts.length}
                />

                {loadingPosts ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="bg-[#111] border border-[#1f1f1f] p-12 text-center space-y-4">
                    <BookOpen
                      size={32}
                      strokeWidth={1.2}
                      className="mx-auto mb-3 text-neutral-700"
                    />
                    <p className="text-sm text-neutral-500 mb-1">
                      {debouncedQuery
                        ? `No posts found for "${debouncedQuery}"`
                        : "No posts in this genre yet"}
                    </p>
                    <p className="text-xs text-neutral-700">
                      {debouncedQuery
                        ? "Try a different search term"
                        : "Be the first to write one"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onBookmark={handleBookmark}
                        liked={postInteractions[post.id]?.liked || false}
                        bookmarked={
                          postInteractions[post.id]?.bookmarked || false
                        }
                        likeCount={
                          postInteractions[post.id]?.likeCount ??
                          post.likes_count
                        }
                      />
                    ))}
                  </div>
                )}
              </section>

              <section>
                <SectionHeader
                  icon={<Hash size={11} strokeWidth={1.6} />}
                  label="Trending in SML"
                />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTERNAL_TRENDING.map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(topic.tag)}
                      className="bg-[#111] border border-[#1f1f1f] px-4 py-3 text-left hover:border-[#2a2a2a] transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[12px] font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors truncate">
                          #{topic.tag}
                        </p>
                        <span className="text-[10px] font-semibold text-emerald-500 flex-shrink-0 ml-2">
                          {topic.growth}
                        </span>
                      </div>
                      <p className="text-[10px] text-neutral-700">
                        {topic.posts} posts
                      </p>
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">

              <section>
                <SectionHeader
                  icon={<Users size={11} strokeWidth={1.6} />}
                  label="Writers to Follow"
                />

                {loadingUsers ? (
                  <div className="space-y-5 ">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-2.5 w-1/2" />
                          <Skeleton className="h-2 w-1/3" />
                        </div>
                        <Skeleton className="h-6 w-14" />
                      </div>
                    ))}
                  </div>
                ) : suggestedUsers.length === 0 ? (
                  <p className="text-[11px] text-neutral-700 italic">
                    No suggestions yet.
                  </p>
                ) : (
                  <div className="divide-y divide-[#141414]">
                    {suggestedUsers.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                      >
                        <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[10px] font-semibold text-neutral-500 flex-shrink-0">
                          {getInitials(u.full_name || "")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-neutral-400 truncate leading-tight">
                            {u.full_name || "Anonymous"}
                          </p>
                          <p className="text-[10px] text-neutral-600 truncate mt-0.5">
                            @
                            {(u.full_name || "user")
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleFollow(u.id, u.is_following)}
                          disabled={followLoadingId === u.id}
                          className={`
                            flex-shrink-0 text-[10px] font-semibold px-3 py-1.5
                            border transition-all disabled:opacity-50 tracking-wide
                            ${
                              u.is_following
                                ? "border-[#1f1f1f] text-neutral-600 hover:border-red-900/40 hover:text-red-400"
                                : "border-[#2a2a2a] text-neutral-400 hover:border-[#3a3a3a] hover:text-white"
                            }
                          `}
                        >
                          {followLoadingId === u.id
                            ? "…"
                            : u.is_following
                            ? "Following"
                            : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="border border-[#1f1f1f] bg-[#111] p-5">
                <p className="text-xs font-semibold text-neutral-300 mb-1 tracking-tight">
                  Share your perspective
                </p>
                <p className="text-[11px] text-neutral-600 mb-4 leading-relaxed">
                  Write a review, essay, or reading list and reach the SML
                  community.
                </p>
                <button
                  onClick={() => router.push("/dashboard/posts")}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-white text-[#0a0a0a] text-xs font-semibold hover:bg-neutral-100 transition-colors"
                >
                  Write a Post
                  <ArrowUpRight size={12} strokeWidth={2.5} />
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}