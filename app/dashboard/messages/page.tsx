"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ExternalLink,
  Settings,
  MessageCircle,
  Bookmark,
  Heart,
  Loader,
  Clock,
  Edit3,
  X,
  Upload,
  Globe,
  Lock,
  CheckCircle,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

// ─── Types ────────────────────────────────────────────────────────────────────

type ProfileDTO = {
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string;
    location: string;
    website: string;
    created_at: string;
  };
  stats: {
    reviews: number;
    followers: number;
    following: number;
    readingLists: number;
  };
  viewer: {
    is_following: boolean;
    is_me: boolean;
  };
};

type PostCard = {
  id: string;
  title: string;
  excerpt: string | null;
  genre: string | null;
  created_at: string;
  read_time: number | null;
  likes_count: number | null;
  comments_count: number | null;
};

type PagedPostsResponse = {
  posts: PostCard[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

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

const joinLabel = (createdAt: string) =>
  new Date(createdAt).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });

const formatCount = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#1a1a1a] animate-pulse ${className ?? ""}`} />;
}

function PostSkeleton() {
  return (
    <div className="bg-[#111] border border-[#1f1f1f] p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-2.5 w-1/3" />
        </div>
        <Skeleton className="h-5 w-16 ml-4" />
      </div>
      <Skeleton className="h-2.5 w-full mb-1.5" />
      <Skeleton className="h-2.5 w-4/5 mb-4" />
      <div className="flex gap-4 pt-3 border-t border-[#1a1a1a]">
        <Skeleton className="h-2 w-8" />
        <Skeleton className="h-2 w-8" />
      </div>
    </div>
  );
}

// ─── Inline Edit Panel ────────────────────────────────────────────────────────

function EditPanel({
  profile,
  onSave,
  onClose,
}: {
  profile: ProfileDTO["profile"];
  onSave: (updates: Partial<ProfileDTO["profile"]>) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    full_name: profile.full_name,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    setError("");
    try {
      await onSave(form);
      setSuccess(true);
      setTimeout(onClose, 800);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full px-3 py-2.5 bg-[#161616] border border-[#272727] text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors";
  const labelCls =
    "block text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-500 mb-1.5";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-[#0f0f0f] border-l border-[#1a1a1a] z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] flex-shrink-0">
          <span className="text-sm font-semibold text-white tracking-tight">
            Edit Profile
          </span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-[#1a1a1a] transition-colors"
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          {error && (
            <div className="bg-red-500/8 border border-red-500/15 px-3 py-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className={labelCls}>Full Name</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              maxLength={100}
              className={inputCls}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className={labelCls}>Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              maxLength={300}
              className={`${inputCls} resize-none`}
              placeholder="Tell the community about yourself…"
            />
            <p className="text-[10px] text-neutral-700 mt-1 text-right">
              {form.bio.length}/300
            </p>
          </div>

          <div>
            <label className={labelCls}>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
              maxLength={100}
              className={inputCls}
              placeholder="City, Country"
            />
          </div>

          <div>
            <label className={labelCls}>Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
              maxLength={200}
              className={inputCls}
              placeholder="https://yoursite.com"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-[#1a1a1a] flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-xs font-medium text-neutral-500 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 text-xs font-semibold text-[#0a0a0a] bg-white hover:bg-neutral-100 transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
          >
            {saving ? (
              <><Loader className="animate-spin" size={12} /> Saving…</>
            ) : success ? (
              <><CheckCircle size={12} /> Saved</>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Post card — matches dashboard feed exactly ───────────────────────────────

function ProfilePostCard({ post }: { post: PostCard }) {
  return (
    <Link href={`/dashboard/posts/${post.id}`}>
      <article className="bg-[#111] border border-[#1f1f1f] hover:border-[#2a2a2a] transition-colors cursor-pointer p-5 group">
        <div className="flex items-start justify-between mb-2.5">
          <div className="flex-1 min-w-0 pr-3">
            <h3 className="text-sm font-semibold text-white leading-snug tracking-tight group-hover:text-neutral-200 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mt-1">
              <span>{getRelativeTime(post.created_at)}</span>
              {post.read_time && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={9} strokeWidth={1.5} />
                    {post.read_time} min
                  </span>
                </>
              )}
            </div>
          </div>
          {post.genre && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 bg-[#1a1a1a] border border-[#272727] px-2 py-0.5 flex-shrink-0">
              {post.genre}
            </span>
          )}
        </div>

        {post.excerpt && (
          <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2 mb-3.5">
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-4 pt-3 border-t border-[#1a1a1a] text-neutral-700">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Heart size={11} strokeWidth={1.5} />
            <span>{post.likes_count ?? 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <MessageCircle size={11} strokeWidth={1.5} />
            <span>{post.comments_count ?? 0}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const paramId = (params as any)?.id as string | undefined;

  const [resolvedProfileId, setResolvedProfileId] = useState<string | null>(
    paramId ?? null
  );
  const [activeTab, setActiveTab] = useState("reviews");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviews, setReviews] = useState<PostCard[]>([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsHasMore, setReviewsHasMore] = useState(false);

  const [bookmarksLoading, setBookmarksLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<PostCard[]>([]);
  const [bookmarksPage, setBookmarksPage] = useState(1);
  const [bookmarksHasMore, setBookmarksHasMore] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const tabs = [
    { id: "reviews", label: "Posts" },
    { id: "lists", label: "Saved" },
    { id: "about", label: "About" },
  ];

  // ── Resolve profile ID ─────────────────────────────────────────────────────

  useEffect(() => {
    let alive = true;
    if (paramId) {
      setResolvedProfileId(paramId);
      return;
    }
    const resolve = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) throw new Error("Not authenticated");
        const me = await res.json();
        const meId =
          me?.id ?? me?.user?.id ?? me?.user?.user?.id ?? me?.data?.id ?? null;
        if (!me?.authenticated || !meId) throw new Error("Not authenticated");
        if (alive) setResolvedProfileId(String(meId));
      } catch (e: any) {
        if (alive) {
          setError(e?.message || "Could not resolve profile");
          setLoading(false);
        }
      }
    };
    resolve();
    return () => { alive = false; };
  }, [paramId]);

  // ── Fetch profile ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!resolvedProfileId) return;
    let alive = true;
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/user/${resolvedProfileId}/profile`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data: ProfileDTO = await res.json();
        if (alive) setProfileData(data);
      } catch (e: any) {
        if (alive) setError(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    };
    run();
    return () => { alive = false; };
  }, [resolvedProfileId]);

  // ── Fetch posts ────────────────────────────────────────────────────────────

  const fetchReviews = async (page = 1, append = false) => {
    if (!resolvedProfileId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(
        `/api/user/${resolvedProfileId}/posts?page=${page}&limit=10`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const data: PagedPostsResponse = await res.json();
      setReviews((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setReviewsPage(data.page);
      setReviewsHasMore(data.has_more);
    } catch {
      /* silent */
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchBookmarks = async (page = 1, append = false) => {
    if (!resolvedProfileId) return;
    setBookmarksLoading(true);
    try {
      const res = await fetch(
        `/api/user/${resolvedProfileId}/bookmarks?page=${page}&limit=10`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error();
      const data: PagedPostsResponse = await res.json();
      setBookmarks((prev) =>
        append ? [...prev, ...data.posts] : data.posts
      );
      setBookmarksPage(data.page);
      setBookmarksHasMore(data.has_more);
    } catch {
      /* silent */
    } finally {
      setBookmarksLoading(false);
    }
  };

  useEffect(() => {
    if (resolvedProfileId) fetchReviews(1, false);
  }, [resolvedProfileId]);

  useEffect(() => {
    if (
      resolvedProfileId &&
      activeTab === "lists" &&
      bookmarks.length === 0 &&
      !bookmarksLoading
    ) {
      fetchBookmarks(1, false);
    }
  }, [activeTab, resolvedProfileId]);

  // ── Follow ─────────────────────────────────────────────────────────────────

  const toggleFollow = async () => {
    if (!profileData || !resolvedProfileId || profileData.viewer.is_me) return;
    const was = profileData.viewer.is_following;
    setFollowBusy(true);
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            viewer: { ...prev.viewer, is_following: !was },
            stats: {
              ...prev.stats,
              followers: Math.max(0, prev.stats.followers + (was ? -1 : 1)),
            },
          }
        : prev
    );
    try {
      const res = await fetch(`/api/user/${resolvedProfileId}/follow`, {
        method: was ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
    } catch {
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              viewer: { ...prev.viewer, is_following: was },
              stats: {
                ...prev.stats,
                followers: Math.max(0, prev.stats.followers + (was ? 1 : -1)),
              },
            }
          : prev
      );
    } finally {
      setFollowBusy(false);
    }
  };

  // ── Save profile ───────────────────────────────────────────────────────────

  const handleSaveProfile = async (
    updates: Partial<ProfileDTO["profile"]>
  ) => {
    if (!resolvedProfileId) return;
    const res = await fetch(`/api/user/${resolvedProfileId}/profile`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update profile");
    const data = await res.json();
    setProfileData((prev) =>
      prev ? { ...prev, profile: { ...prev.profile, ...data.profile } } : prev
    );
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  // ─── States ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader className="animate-spin text-neutral-700" size={22} />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-neutral-500">{error || "Profile not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs font-medium text-neutral-400 border border-[#272727] px-4 py-2 hover:border-[#3a3a3a] hover:text-neutral-200 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { profile, stats, viewer } = profileData;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="lg:ml-[288px] min-h-screen pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-5 py-8">

          {/* ── Profile header ── */}
          <div className="border-b border-[#1a1a1a] pb-7 mb-6">
            <div className="flex items-start gap-5 mb-5">

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-xl font-semibold overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{getInitials(profile.full_name)}</span>
                  )}
                </div>
                {viewer.is_me && (
                  <button
                    onClick={() => setShowEdit(true)}
                    title="Edit profile"
                    className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-[#161616] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <Edit3 size={10} strokeWidth={2} />
                  </button>
                )}
              </div>

              {/* Name + actions */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h1 className="text-lg font-semibold text-white tracking-tight leading-tight">
                      {profile.full_name}
                    </h1>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      @{profile.id.slice(0, 8)}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {viewer.is_me ? (
                      <button
                        onClick={() => setShowEdit(true)}
                        className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 border border-[#272727] px-3 py-1.5 hover:border-[#3a3a3a] hover:text-neutral-200 transition-colors"
                      >
                        <Settings size={12} strokeWidth={1.5} />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={toggleFollow}
                          disabled={followBusy}
                          className={`text-xs font-semibold px-4 py-1.5 border transition-all disabled:opacity-50 ${
                            viewer.is_following
                              ? "border-[#1f1f1f] text-neutral-600 hover:border-red-900/40 hover:text-red-400"
                              : "bg-white text-[#0a0a0a] border-white hover:bg-neutral-100"
                          }`}
                        >
                          {followBusy
                            ? "…"
                            : viewer.is_following
                            ? "Following"
                            : "Follow"}
                        </button>
                        <button
                          onClick={() =>
                            router.push("/dashboard/messages")
                          }
                          title="Send message"
                          className="w-8 h-8 flex items-center justify-center text-neutral-500 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors"
                        >
                          <MessageCircle size={13} strokeWidth={1.5} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p className="text-sm text-neutral-400 leading-relaxed mt-3 max-w-xl">
                    {profile.bio}
                  </p>
                )}

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {profile.location && (
                    <span className="flex items-center gap-1 text-[11px] text-neutral-600">
                      <MapPin size={10} strokeWidth={1.5} />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[11px] text-neutral-600">
                    <Calendar size={10} strokeWidth={1.5} />
                    Joined {joinLabel(profile.created_at)}
                  </span>
                  {profile.website && (
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      <ExternalLink size={10} strokeWidth={1.5} />
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* ── Stats row ── */}
            <div className="flex items-center gap-6 sm:gap-8">
              {[
                { value: stats.reviews, label: "Posts" },
                { value: stats.followers, label: "Followers" },
                { value: stats.following, label: "Following" },
                { value: stats.readingLists, label: "Saved" },
              ].map((s) => (
                <div key={s.label} className="text-center sm:text-left">
                  <span className="text-base font-semibold text-white tabular-nums">
                    {formatCount(s.value)}
                  </span>
                  <span className="text-[11px] text-neutral-600 ml-1.5">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-[#1a1a1a] mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-[11px] font-medium px-3.5 py-2.5 border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-white text-white"
                    : "border-transparent text-neutral-600 hover:text-neutral-300"
                }`}
              >
                {tab.label}
                {tab.id === "reviews" && (
                  <span className="ml-1.5 text-[10px] text-neutral-700">
                    {stats.reviews}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}

          {/* Posts */}
          {activeTab === "reviews" && (
            <div className="space-y-3">
              {reviewsLoading && reviews.length === 0 ? (
                [...Array(3)].map((_, i) => <PostSkeleton key={i} />)
              ) : reviews.length === 0 ? (
                <div className="bg-[#111] border border-[#1f1f1f] p-14 text-center">
                  <p className="text-sm text-neutral-500 mb-1">No posts yet</p>
                  {viewer.is_me && (
                    <button
                      onClick={() => router.push("/dashboard/posts")}
                      className="text-xs font-semibold text-[#0a0a0a] bg-white px-4 py-2 hover:bg-neutral-100 transition-colors mt-4"
                    >
                      Write your first post
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {reviews.map((p) => (
                    <ProfilePostCard key={p.id} post={p} />
                  ))}
                  {reviewsHasMore && (
                    <button
                      onClick={() => fetchReviews(reviewsPage + 1, true)}
                      disabled={reviewsLoading}
                      className="w-full py-3 text-xs font-medium text-neutral-500 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors disabled:opacity-40"
                    >
                      {reviewsLoading ? "Loading…" : "Load more"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Saved */}
          {activeTab === "lists" && (
            <div className="space-y-3">
              {bookmarksLoading && bookmarks.length === 0 ? (
                [...Array(3)].map((_, i) => <PostSkeleton key={i} />)
              ) : bookmarks.length === 0 ? (
                <div className="bg-[#111] border border-[#1f1f1f] p-14 text-center">
                  <Bookmark
                    size={28}
                    strokeWidth={1.2}
                    className="mx-auto mb-3 text-neutral-700"
                  />
                  <p className="text-sm text-neutral-500">No saved posts yet</p>
                </div>
              ) : (
                <>
                  {bookmarks.map((p) => (
                    <ProfilePostCard key={p.id} post={p} />
                  ))}
                  {bookmarksHasMore && (
                    <button
                      onClick={() => fetchBookmarks(bookmarksPage + 1, true)}
                      disabled={bookmarksLoading}
                      className="w-full py-3 text-xs font-medium text-neutral-500 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors disabled:opacity-40"
                    >
                      {bookmarksLoading ? "Loading…" : "Load more"}
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* About */}
          {activeTab === "about" && (
            <div className="space-y-3 max-w-xl">
              {/* Bio */}
              <div className="bg-[#111] border border-[#1f1f1f] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 mb-3">
                  Bio
                </p>
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {profile.bio || "No bio yet."}
                </p>
              </div>

              {/* Details */}
              <div className="bg-[#111] border border-[#1f1f1f] p-5 space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 mb-3">
                  Details
                </p>
                {profile.location && (
                  <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                    <MapPin size={13} strokeWidth={1.5} className="text-neutral-600 flex-shrink-0" />
                    {profile.location}
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                  <Calendar size={13} strokeWidth={1.5} className="text-neutral-600 flex-shrink-0" />
                  Joined {joinLabel(profile.created_at)}
                </div>
                {profile.website && (
                  <div className="flex items-center gap-2.5">
                    <ExternalLink size={13} strokeWidth={1.5} className="text-neutral-600 flex-shrink-0" />
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
                    >
                      {profile.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="bg-[#111] border border-[#1f1f1f] p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600 mb-4">
                  Stats
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Posts written", value: stats.reviews },
                    { label: "Followers", value: stats.followers },
                    { label: "Following", value: stats.following },
                    { label: "Posts saved", value: stats.readingLists },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-semibold text-white tabular-nums">
                        {formatCount(s.value)}
                      </p>
                      <p className="text-[10px] text-neutral-600 mt-0.5">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit panel */}
      {showEdit && (
        <EditPanel
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}