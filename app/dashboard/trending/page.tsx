"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  Hash,
  Users,
  Loader,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LeftSidebar from "@/app/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrendingPost {
  id: string;
  rank: number;
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

interface TrendingAuthor {
  id: string;
  full_name: string;
  post_count: number;
  follower_count: number;
  is_following: boolean;
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

const formatCount = (n: number): string => {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#1a1a1a] animate-pulse ${className ?? ""}`} />;
}

function PostSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5 flex gap-4">
      <Skeleton className="w-6 h-6 flex-shrink-0 mt-1" />
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-2 w-16 ml-auto" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2.5 w-full" />
        <Skeleton className="h-2.5 w-4/5" />
        <div className="flex gap-4 pt-1">
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-8" />
          <Skeleton className="h-2 w-10" />
        </div>
      </div>
    </div>
  );
}

// ─── Time filter tabs ─────────────────────────────────────────────────────────

const TIME_FILTERS = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "all", label: "All Time" },
];

// ─── Static trending topics (replace with API if available) ───────────────────

const TRENDING_TOPICS: TrendingTopic[] = [
  { tag: "literary-fiction", posts: "2.3k", growth: "+12%" },
  { tag: "book-recommendations", posts: "5.1k", growth: "+8%" },
  { tag: "reading-challenge-2024", posts: "1.8k", growth: "+25%" },
  { tag: "indie-authors", posts: "892", growth: "+15%" },
  { tag: "poetry-corner", posts: "1.2k", growth: "+5%" },
  { tag: "book-club-picks", posts: "923", growth: "+18%" },
];

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-neutral-700">{icon}</span>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-neutral-500">
        {label}
      </h2>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TrendingPage() {
  const router = useRouter();

  const [timeFilter, setTimeFilter] = useState("today");
  const [posts, setPosts] = useState<TrendingPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [trendingAuthors, setTrendingAuthors] = useState<TrendingAuthor[]>([]);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  const [postInteractions, setPostInteractions] = useState<
    Record<string, { liked: boolean; bookmarked: boolean; likeCount: number }>
  >({});

  // ── Fetch trending posts ───────────────────────────────────────────────────

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      // Sort by likes to get most-engaged posts
      // Pass timeFilter so the API can filter by created_at window if supported
      const params = new URLSearchParams({
        limit: "20",
        sort: "top",
        period: timeFilter,
      });

      const res = await fetch(`/api/posts?${params}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();

      const fetched = (data.posts || [])
        .map((p: any, idx: number) => ({
          id: p.id,
          rank: idx + 1,
          title: p.title,
          excerpt: p.excerpt || "",
          author_name: p.author_name || "Anonymous",
          genre: p.genre || "",
          likes_count: p.likes_count || 0,
          comments_count: p.comments_count || 0,
          read_time: p.read_time || 1,
          created_at: p.created_at || p.published_at,
          cover_image_url: p.cover_image_url || null,
        }))
        // Client-side sort by engagement score (likes × 2 + comments)
        // as a fallback if API doesn't support sort param
        .sort(
          (a: TrendingPost, b: TrendingPost) =>
            b.likes_count * 2 +
            b.comments_count -
            (a.likes_count * 2 + a.comments_count)
        )
        .map((p: TrendingPost, idx: number) => ({ ...p, rank: idx + 1 }));

      setPosts(fetched);

      // Fetch interaction state
      const interactions: typeof postInteractions = {};
      await Promise.all(
        fetched.slice(0, 10).map(async (p: TrendingPost) => {
          try {
            const r = await fetch(`/api/posts/${p.id}`, {
              credentials: "include",
            });
            if (r.ok) {
              const d = await r.json();
              interactions[p.id] = {
                liked: d.user_liked || false,
                bookmarked: d.user_bookmarked || false,
                likeCount: d.likes_count ?? p.likes_count,
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
      console.error("Error fetching trending posts:", e);
    } finally {
      setLoadingPosts(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ── Fetch trending authors ─────────────────────────────────────────────────

  useEffect(() => {
    const fetch_ = async () => {
      setLoadingAuthors(true);
      try {
        const res = await fetch("/api/user/suggested?limit=5", {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTrendingAuthors(
          (data.users || []).map((u: any) => ({
            id: u.id,
            full_name: u.full_name || "Anonymous",
            post_count: u.post_count || 0,
            follower_count: u.follower_count || 0,
            is_following: u.is_following || false,
          }))
        );
      } catch {
        setTrendingAuthors([]);
      } finally {
        setLoadingAuthors(false);
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
    setTrendingAuthors((prev) =>
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
        setTrendingAuthors((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_following: currentlyFollowing } : u
          )
        );
      }
    } catch {
      setTrendingAuthors((prev) =>
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
        <div className="max-w-[1100px] mx-auto px-5 py-6">

          {/* ── Page header + time filter ── */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp
                size={14}
                strokeWidth={1.5}
                className="text-neutral-600"
              />
              <h1 className="text-sm font-semibold text-white tracking-tight">
                Trending
              </h1>
              <span className="text-xs text-neutral-700 ml-1">
                ranked by engagement
              </span>
            </div>

            {/* Time filter pills */}
            <div className="flex items-center gap-1 bg-[#111] border border-[#1f1f1f] p-1">
              {TIME_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTimeFilter(f.value)}
                  className={`text-[11px] font-medium px-3 py-1.5 transition-all ${
                    timeFilter === f.value
                      ? "bg-white text-[#0a0a0a]"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_260px] gap-6">

            {/* ── Left: Ranked posts ── */}
            <div>
              {loadingPosts ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-[#111] border border-[#1f1f1f] p-16 text-center">
                  <BookOpen
                    size={32}
                    strokeWidth={1.2}
                    className="mx-auto mb-3 text-neutral-700"
                  />
                  <p className="text-sm text-neutral-500">
                    No trending posts yet
                  </p>
                  <p className="text-xs text-neutral-700 mt-1">
                    Be the first to write something
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map((post) => {
                    const interaction = postInteractions[post.id];
                    const liked = interaction?.liked || false;
                    const bookmarked = interaction?.bookmarked || false;
                    const likeCount =
                      interaction?.likeCount ?? post.likes_count;

                    return (
                      <Link
                        key={post.id}
                        href={`/dashboard/posts/${post.id}`}
                      >
                        <article className="bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer group flex gap-4 p-5">

                          {/* Rank */}
                          <div className="flex-shrink-0 w-6 pt-0.5">
                            <span
                              className={`text-sm font-bold tabular-nums leading-none ${
                                post.rank === 1
                                  ? "text-neutral-300"
                                  : post.rank <= 3
                                  ? "text-neutral-500"
                                  : "text-neutral-700"
                              }`}
                            >
                              {post.rank}
                            </span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Author row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[9px] font-semibold text-neutral-500 flex-shrink-0">
                                  {getInitials(post.author_name)}
                                </div>
                                <span className="text-xs font-medium text-neutral-400">
                                  {post.author_name}
                                </span>
                                <span className="text-neutral-700 text-xs">·</span>
                                <span className="text-[11px] text-neutral-600 flex items-center gap-1">
                                  <Clock size={10} strokeWidth={1.5} />
                                  {post.read_time} min
                                </span>
                                <span className="text-neutral-700 text-xs">·</span>
                                <span className="text-[11px] text-neutral-700">
                                  {getRelativeTime(post.created_at)}
                                </span>
                              </div>
                              {post.genre && (
                                <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 flex-shrink-0">
                                  {post.genre}
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-semibold text-white leading-snug mb-2 tracking-tight group-hover:text-neutral-200 transition-colors">
                              {post.title}
                            </h3>

                            {/* Excerpt */}
                            <p className="text-[12px] text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                              {post.excerpt}
                            </p>

                            {/* Actions */}
                            <div
                              className="flex items-center gap-5 text-neutral-700"
                              onClick={(e) => e.preventDefault()}
                            >
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleLike(post.id);
                                }}
                                className={`flex items-center gap-1.5 text-xs transition-colors ${
                                  liked
                                    ? "text-red-400"
                                    : "hover:text-neutral-400"
                                }`}
                              >
                                <Heart
                                  size={12}
                                  strokeWidth={1.5}
                                  fill={liked ? "currentColor" : "none"}
                                />
                                <span>{formatCount(likeCount)}</span>
                              </button>

                              <div className="flex items-center gap-1.5 text-xs">
                                <MessageCircle size={12} strokeWidth={1.5} />
                                <span>
                                  {formatCount(post.comments_count)}
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleBookmark(post.id);
                                }}
                                className={`flex items-center gap-1.5 text-xs transition-colors ${
                                  bookmarked
                                    ? "text-amber-400"
                                    : "hover:text-neutral-400"
                                }`}
                              >
                                <Bookmark
                                  size={12}
                                  strokeWidth={1.5}
                                  fill={bookmarked ? "currentColor" : "none"}
                                />
                                <span>{bookmarked ? "Saved" : "Save"}</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Right sidebar ── */}
            <div className="space-y-5">

              {/* Trending topics */}
              <section>
                <SectionHeader
                  icon={<Hash size={11} strokeWidth={1.6} />}
                  label="Trending Topics"
                />
                <div className="divide-y divide-[#141414]">
                  {TRENDING_TOPICS.map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 cursor-pointer group"
                    >
                      <div>
                        <p className="text-[12px] font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors">
                          #{topic.tag}
                        </p>
                        <p className="text-[10px] text-neutral-700 mt-0.5">
                          {topic.posts} posts
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-500 tabular-nums">
                        {topic.growth}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Trending authors */}
              <section>
                <SectionHeader
                  icon={<Users size={11} strokeWidth={1.6} />}
                  label="Writers to Watch"
                />

                {loadingAuthors ? (
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-2.5 w-1/2" />
                          <Skeleton className="h-2 w-1/3" />
                        </div>
                        <Skeleton className="h-6 w-14" />
                      </div>
                    ))}
                  </div>
                ) : trendingAuthors.length === 0 ? (
                  <p className="text-[11px] text-neutral-700 italic">
                    No authors to show.
                  </p>
                ) : (
                  <div className="divide-y divide-[#141414]">
                    {trendingAuthors.map((author) => (
                      <div
                        key={author.id}
                        className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
                      >
                        <div className="w-7 h-7 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-[9px] font-semibold text-neutral-500 flex-shrink-0">
                          {getInitials(author.full_name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-medium text-neutral-400 truncate leading-tight">
                            {author.full_name}
                          </p>
                          <p className="text-[10px] text-neutral-600 mt-0.5">
                            @
                            {author.full_name
                              .toLowerCase()
                              .replace(/\s+/g, "")}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            toggleFollow(author.id, author.is_following)
                          }
                          disabled={followLoadingId === author.id}
                          className={`flex-shrink-0 text-[10px] font-semibold px-3 py-1.5 border transition-all disabled:opacity-50 tracking-wide ${
                            author.is_following
                              ? "border-[#1f1f1f] text-neutral-600 hover:border-red-900/40 hover:text-red-400"
                              : "border-[#2a2a2a] text-neutral-400 hover:border-[#3a3a3a] hover:text-white"
                          }`}
                        >
                          {followLoadingId === author.id
                            ? "…"
                            : author.is_following
                            ? "Following"
                            : "Follow"}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* How ranking works — compact, no gradient */}
              <section className="bg-[#111] border border-[#1f1f1f] p-4">
                <p className="text-[11px] font-semibold text-neutral-400 mb-2 tracking-tight">
                  How ranking works
                </p>
                <p className="text-[11px] text-neutral-600 leading-relaxed">
                  Posts are ranked by engagement velocity — likes and comments
                  weighted by recency. Updated hourly.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}