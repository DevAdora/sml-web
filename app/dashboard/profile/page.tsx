"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Settings,
  MapPin,
  Calendar,
  ExternalLink,
  Edit3,
  Star,
  MessageCircle,
  Bookmark,
  Target,
  Heart,
  Loader,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

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

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();

  const paramId = (params as any)?.id as string | undefined;
  const [resolvedProfileId, setResolvedProfileId] = useState<string | null>(
    paramId ?? null
  );

  const [activeTab, setActiveTab] = useState<string>("reviews");

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

  const [followBusy, setFollowBusy] = useState(false);

  const tabs = useMemo(
    () => [
      {
        id: "reviews",
        label: "Reviews",
        icon: <Star size={16} strokeWidth={1.5} />,
      },
      {
        id: "lists",
        label: "Saved",
        icon: <Bookmark size={16} strokeWidth={1.5} />,
      },
      {
        id: "about",
        label: "About",
        icon: <User size={16} strokeWidth={1.5} />,
      },
    ],
    []
  );

  const generateAvatar = (name: string): string => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  const joinLabel = (createdAt: string) => {
    const d = new Date(createdAt);
    return d.toLocaleString(undefined, { month: "long", year: "numeric" });
  };

  useEffect(() => {
    let alive = true;

    const resolve = async () => {
      if (paramId) {
        setResolvedProfileId(paramId);
        return;
      }

      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch current user");
        const me = await res.json();

        const meId =
          me?.id ?? me?.user?.id ?? me?.user?.user?.id ?? me?.data?.id ?? null;

        if (!me?.authenticated || !meId) {
          throw new Error("Not authenticated");
        }

        if (alive) setResolvedProfileId(String(meId));
      } catch (e: any) {
        console.error(e);
        if (alive) {
          setError(e?.message || "Could not resolve profile");
          setResolvedProfileId(null);
          setLoading(false);
        }
      }
    };

    resolve();
    return () => {
      alive = false;
    };
  }, [paramId]);

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
        if (!alive) return;

        setProfileData(data);
      } catch (e: any) {
        console.error(e);
        if (!alive) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [resolvedProfileId]);

  const fetchReviews = async (page = 1, append = false) => {
    if (!resolvedProfileId) return;
    setReviewsLoading(true);

    try {
      const res = await fetch(
        `/api/user/${resolvedProfileId}/posts?page=${page}&limit=10`,
        { credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: PagedPostsResponse = await res.json();

      setReviews((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setReviewsPage(data.page);
      setReviewsHasMore(data.has_more);
    } catch (e) {
      console.error(e);
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
      if (!res.ok) throw new Error("Failed to fetch saved posts");
      const data: PagedPostsResponse = await res.json();

      setBookmarks((prev) => (append ? [...prev, ...data.posts] : data.posts));
      setBookmarksPage(data.page);
      setBookmarksHasMore(data.has_more);
    } catch (e) {
      console.error(e);
    } finally {
      setBookmarksLoading(false);
    }
  };

  useEffect(() => {
    if (!resolvedProfileId) return;
    fetchReviews(1, false);
  }, [resolvedProfileId]);

  useEffect(() => {
    if (!resolvedProfileId) return;
    if (activeTab === "lists" && bookmarks.length === 0 && !bookmarksLoading) {
      fetchBookmarks(1, false);
    }
  }, [activeTab, resolvedProfileId]);

  const toggleFollow = async () => {
    if (!profileData || !resolvedProfileId) return;
    if (profileData.viewer.is_me) return;

    const currentlyFollowing = profileData.viewer.is_following;
    setFollowBusy(true);

    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            viewer: { ...prev.viewer, is_following: !currentlyFollowing },
            stats: {
              ...prev.stats,
              followers: Math.max(
                0,
                prev.stats.followers + (currentlyFollowing ? -1 : 1)
              ),
            },
          }
        : prev
    );

    try {
      const res = await fetch(`/api/user/${resolvedProfileId}/follow`, {
        method: currentlyFollowing ? "DELETE" : "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Follow action failed");
    } catch (e) {
      console.error(e);
      // rollback
      setProfileData((prev) =>
        prev
          ? {
              ...prev,
              viewer: { ...prev.viewer, is_following: currentlyFollowing },
              stats: {
                ...prev.stats,
                followers: Math.max(
                  0,
                  prev.stats.followers + (currentlyFollowing ? 1 : -1)
                ),
              },
            }
          : prev
      );
    } finally {
      setFollowBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <Loader className="animate-spin text-neutral-600" size={44} />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col items-center justify-center">
        <p className="text-neutral-400">{error || "Profile not found"}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg border border-neutral-700"
        >
          Back
        </button>
      </div>
    );
  }

  const { profile, stats, viewer } = profileData;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="ml-0 lg:ml-72 min-h-screen pt-16 lg:pt-0">
        <div className="h-32 sm:h-48 bg-gradient-to-br from-neutral-800 to-neutral-900 border-b border-neutral-800" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="relative -mt-12 sm:-mt-20 mb-6">
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-neutral-800 border-4 border-neutral-950 rounded-full flex items-center justify-center text-neutral-300 text-3xl font-bold overflow-hidden">
                    {profile.avatar_url ? (
                      <span>{generateAvatar(profile.full_name)}</span>
                    ) : (
                      <span>{generateAvatar(profile.full_name)}</span>
                    )}
                  </div>

                  {viewer.is_me && (
                    <button className="absolute bottom-1 right-1 p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full transition">
                      <Edit3
                        size={14}
                        strokeWidth={1.5}
                        className="text-neutral-300"
                      />
                    </button>
                  )}
                </div>

                <h1 className="text-2xl font-serif text-neutral-200 mb-1">
                  {profile.full_name}
                </h1>
                <p className="text-neutral-500 text-sm mb-4">
                  @{profile.id.slice(0, 8)}
                </p>

                <div className="flex items-center gap-2 w-full">
                  {viewer.is_me ? (
                    <button className="flex-1 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700 flex items-center justify-center space-x-2">
                      <Settings size={16} strokeWidth={1.5} />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <button
                      onClick={toggleFollow}
                      disabled={followBusy}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition border ${
                        viewer.is_following
                          ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200"
                          : "bg-neutral-200 hover:bg-white border-neutral-200 text-neutral-900"
                      } disabled:opacity-60`}
                    >
                      {followBusy
                        ? "Working..."
                        : viewer.is_following
                        ? "Following"
                        : "Follow"}
                    </button>
                  )}

                  <button className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition border border-neutral-700">
                    <MessageCircle size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 bg-neutral-800 border-4 border-neutral-950 rounded-full flex items-center justify-center text-neutral-300 text-4xl font-bold overflow-hidden">
                  {profile.avatar_url ? (
                    <span>{generateAvatar(profile.full_name)}</span>
                  ) : (
                    <span>{generateAvatar(profile.full_name)}</span>
                  )}
                </div>

                {viewer.is_me && (
                  <button className="absolute bottom-2 right-2 p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full transition">
                    <Edit3
                      size={16}
                      strokeWidth={1.5}
                      className="text-neutral-300"
                    />
                  </button>
                )}
              </div>

              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-serif text-neutral-200 mb-1">
                      {profile.full_name}
                    </h1>
                    <p className="text-neutral-500">
                      @{profile.id.slice(0, 8)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {viewer.is_me ? (
                      <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700 flex items-center space-x-2">
                        <Settings size={16} strokeWidth={1.5} />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <button
                        onClick={toggleFollow}
                        disabled={followBusy}
                        className={`px-4 py-2 rounded-lg font-medium transition border ${
                          viewer.is_following
                            ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200"
                            : "bg-neutral-200 hover:bg-white border-neutral-200 text-neutral-900"
                        } disabled:opacity-60`}
                      >
                        {followBusy
                          ? "Working..."
                          : viewer.is_following
                          ? "Following"
                          : "Follow"}
                      </button>
                    )}

                    <button className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition border border-neutral-700">
                      <MessageCircle size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-neutral-300 leading-relaxed mb-4 max-w-2xl text-sm sm:text-base">
                {profile.bio || "No bio yet."}
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-neutral-500">
                {!!profile.location && (
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" strokeWidth={1.5} />
                    {profile.location}
                  </span>
                )}

                <span className="flex items-center">
                  <Calendar size={14} className="mr-1" strokeWidth={1.5} />
                  Joined {joinLabel(profile.created_at)}
                </span>

                {!!profile.website && (
                  <span className="flex items-center">
                    <ExternalLink
                      size={14}
                      className="mr-1"
                      strokeWidth={1.5}
                    />
                    <a
                      href={
                        profile.website.startsWith("http")
                          ? profile.website
                          : `https://${profile.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-neutral-400 hover:text-neutral-200 transition truncate max-w-[150px] sm:max-w-none"
                    >
                      {profile.website}
                    </a>
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8">
              <div>
                <span className="text-xl sm:text-2xl font-bold text-neutral-200">
                  {stats.reviews}
                </span>
                <span className="text-xs sm:text-sm text-neutral-500 ml-2">
                  Posts
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-neutral-200">
                  {stats.followers.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-neutral-500 ml-2">
                  Followers
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-neutral-200">
                  {stats.following.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-neutral-500 ml-2">
                  Following
                </span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold text-neutral-200">
                  {stats.readingLists}
                </span>
                <span className="text-xs sm:text-sm text-neutral-500 ml-2">
                  Saved
                </span>
              </div>
            </div>
          </div>

          <div className="border-b border-neutral-800 mb-6 overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-6 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-3 border-b-2 transition whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-neutral-300 text-neutral-200"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium text-sm sm:text-base">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 pb-12">
            <div className="lg:col-span-2 min-w-0">
              {/* Reviews (posts by user) */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {reviewsLoading && reviews.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-neutral-500">
                      <Loader className="animate-spin mr-2" size={18} />
                      Loading posts...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                      <p className="text-sm">No posts yet.</p>
                    </div>
                  ) : (
                    <>
                      {reviews.map((p) => (
                        <Link
                          key={p.id}
                          href={`/dashboard/posts/${p.id}`}
                          className="block"
                        >
                          <article className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition cursor-pointer">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-neutral-100 text-lg">
                                  {p.title}
                                </h3>
                                <p className="text-xs text-neutral-600 mt-1">
                                  {getRelativeTime(p.created_at)} ·{" "}
                                  {p.read_time ?? 5} min read
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium whitespace-nowrap">
                                {p.genre ?? "General"}
                              </span>
                            </div>

                            {p.excerpt && (
                              <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                {p.excerpt}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                                <span className="flex items-center">
                                  <Heart
                                    size={16}
                                    className="mr-1"
                                    strokeWidth={1.5}
                                  />
                                  {p.likes_count ?? 0}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle
                                    size={16}
                                    className="mr-1"
                                    strokeWidth={1.5}
                                  />
                                  {p.comments_count ?? 0}
                                </span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}

                      {reviewsHasMore && (
                        <div className="pt-2">
                          <button
                            onClick={() => fetchReviews(reviewsPage + 1, true)}
                            disabled={reviewsLoading}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 text-neutral-200 rounded-lg border border-neutral-700"
                          >
                            {reviewsLoading ? "Loading..." : "Load more"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Saved (bookmarks) */}
              {activeTab === "lists" && (
                <div className="space-y-6">
                  {bookmarksLoading && bookmarks.length === 0 ? (
                    <div className="flex items-center justify-center py-10 text-neutral-500">
                      <Loader className="animate-spin mr-2" size={18} />
                      Loading saved posts...
                    </div>
                  ) : bookmarks.length === 0 ? (
                    <div className="text-center py-10 text-neutral-500">
                      <p className="text-sm">No saved posts yet.</p>
                    </div>
                  ) : (
                    <>
                      {bookmarks.map((p) => (
                        <Link
                          key={p.id}
                          href={`/dashboard/posts/${p.id}`}
                          className="block"
                        >
                          <article className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition cursor-pointer">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-neutral-100 text-lg">
                                {p.title}
                              </h3>
                              <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium whitespace-nowrap">
                                {p.genre ?? "General"}
                              </span>
                            </div>

                            {p.excerpt && (
                              <p className="text-neutral-400 text-sm leading-relaxed line-clamp-3">
                                {p.excerpt}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-3 mt-4 border-t border-neutral-800">
                              <p className="text-xs text-neutral-600">
                                {getRelativeTime(p.created_at)}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-neutral-500">
                                <span className="flex items-center">
                                  <Heart
                                    size={16}
                                    className="mr-1"
                                    strokeWidth={1.5}
                                  />
                                  {p.likes_count ?? 0}
                                </span>
                                <span className="flex items-center">
                                  <MessageCircle
                                    size={16}
                                    className="mr-1"
                                    strokeWidth={1.5}
                                  />
                                  {p.comments_count ?? 0}
                                </span>
                              </div>
                            </div>
                          </article>
                        </Link>
                      ))}

                      {bookmarksHasMore && (
                        <div className="pt-2">
                          <button
                            onClick={() =>
                              fetchBookmarks(bookmarksPage + 1, true)
                            }
                            disabled={bookmarksLoading}
                            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 text-neutral-200 rounded-lg border border-neutral-700"
                          >
                            {bookmarksLoading ? "Loading..." : "Load more"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* About */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4">
                      About
                    </h3>
                    <p className="text-neutral-400 leading-relaxed">
                      {profile.bio || "No bio yet."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden lg:block space-y-6">
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
                  <Target
                    className="mr-2 text-neutral-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Reading Goal
                </h3>
                <p className="text-xs text-neutral-500">
                  Make this dynamic later (needs a table).
                </p>
              </div>

              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  Activity
                </h3>
                <p className="text-xs text-neutral-500">
                  Make this dynamic later (aggregate from posts/likes/comments).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
