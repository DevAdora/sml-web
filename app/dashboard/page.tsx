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

export default function SMLDashboard() {
  const router = useRouter();
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const [postInteractions, setPostInteractions] = useState<{
    [postId: string]: {
      liked: boolean;
      bookmarked: boolean;
      likeCount: number;
    };
  }>({});

  const observerTarget = useRef<HTMLDivElement>(null);

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

  const generateAvatar = (name: string): string => {
    if (!name) return "??";
    const nameParts = name.trim().split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fetchPostInteractionStatus = async (postId: string) => {
    try {
      console.log(`[FETCH INTERACTION] Starting fetch for post ${postId}`);

      const response = await fetch(`/api/posts/${postId}`, {
        credentials: "include",
      });

      console.log(`[FETCH INTERACTION] Response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log(`[FETCH INTERACTION] Full response for ${postId}:`, data);
        console.log(
          `[FETCH INTERACTION] Extracted interaction for ${postId}:`,
          {
            liked: data.user_liked,
            bookmarked: data.user_bookmarked,
            likeCount: data.likes_count,
          }
        );

        return {
          liked: data.user_liked || false,
          bookmarked: data.user_bookmarked || false,
          likeCount: data.likes_count || 0,
        };
      } else {
        console.error(
          `[FETCH INTERACTION] Failed to fetch, status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        `[FETCH INTERACTION] Error fetching post ${postId}:`,
        error
      );
    }
    return null;
  };

  const handleLike = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentState = postInteractions[postId];
    const newLiked = !currentState?.liked;

    console.log(
      `Like clicked for ${postId}. Current: ${currentState?.liked}, New: ${newLiked}`
    );

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
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: newLiked ? "POST" : "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        console.error("Like API failed");
        setPostInteractions((prev) => ({
          ...prev,
          [postId]: currentState,
        }));
      } else {
        console.log("Like API success, refetching status...");
        await new Promise((resolve) => setTimeout(resolve, 100));

        const updatedStatus = await fetchPostInteractionStatus(postId);
        if (updatedStatus) {
          console.log(`Updated status for ${postId}:`, updatedStatus);
          setPostInteractions((prev) => ({
            ...prev,
            [postId]: updatedStatus,
          }));
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      setPostInteractions((prev) => ({
        ...prev,
        [postId]: currentState,
      }));
    }
  };

  

  const handleBookmark = async (postId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentState = postInteractions[postId];
    const newBookmarked = !currentState?.bookmarked;

    console.log(`[BOOKMARK CLICK] Post: ${postId}`);
    console.log(`[BOOKMARK CLICK] Current state:`, currentState);
    console.log(`[BOOKMARK CLICK] New bookmarked state: ${newBookmarked}`);

    setPostInteractions((prev) => ({
      ...prev,
      [postId]: {
        liked: prev[postId]?.liked || false,
        likeCount: prev[postId]?.likeCount || 0,
        bookmarked: newBookmarked,
      },
    }));

    try {
      const url = `/api/posts/${postId}/bookmark`;
      const method = newBookmarked ? "POST" : "DELETE";

      console.log(`[BOOKMARK API] Calling ${method} ${url}`);

      const response = await fetch(url, {
        method: method,
        credentials: "include",
      });

      const responseData = await response.json();
      console.log(
        `[BOOKMARK API] Response (${response.status}):`,
        responseData
      );

      if (!response.ok) {
        console.error(`[BOOKMARK API] Failed with status ${response.status}`);
        // Revert on failure
        setPostInteractions((prev) => ({
          ...prev,
          [postId]: currentState,
        }));
      } else {
        console.log(`[BOOKMARK API] Success! Waiting 100ms before refetch...`);
        await new Promise((resolve) => setTimeout(resolve, 100));

        console.log(`[BOOKMARK API] Refetching interaction status...`);
        const updatedStatus = await fetchPostInteractionStatus(postId);

        if (updatedStatus) {
          console.log(`[BOOKMARK API] Updated status received:`, updatedStatus);
          setPostInteractions((prev) => ({
            ...prev,
            [postId]: updatedStatus,
          }));
          console.log(`[BOOKMARK API] State updated successfully`);
        } else {
          console.error(`[BOOKMARK API] Failed to get updated status`);
        }
      }
    } catch (error) {
      console.error(`[BOOKMARK ERROR] Exception occurred:`, error);
      setPostInteractions((prev) => ({
        ...prev,
        [postId]: currentState,
      }));
    }
  };

  const fetchExternalAPIs = async () => {
    const externalPosts: FeedPost[] = [];

    try {
      const nytResponse = await fetch(
        "https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=DEMO_KEY"
      );
      const nytData = await nytResponse.json();

      if (nytData.results && nytData.results.lists) {
        nytData.results.lists.forEach((list: any) => {
          list.books.slice(0, 2).forEach((book: any) => {
            const postId = `nyt-${book.primary_isbn13}`;
            externalPosts.push({
              id: postId,
              title: `Review: ${book.title}`,
              author: book.author,
              author_id: "nyt-books",
              avatar: generateAvatar(book.author),
              genre: list.list_name,
              likes: Math.floor(Math.random() * 500) + 100,
              comments: Math.floor(Math.random() * 100) + 10,
              readTime: `${Math.floor(Math.random() * 10) + 5} min`,
              excerpt:
                book.description ||
                `A fascinating look at ${book.title} by ${book.author}.`,
              timestamp: getRelativeTime(
                new Date(
                  Date.now() - Math.random() * 86400000 * 3
                ).toISOString()
              ),
              link:
                book.amazon_product_url ||
                (book.buy_links && book.buy_links[0]
                  ? book.buy_links[0].url
                  : undefined),
              source: "NY Times Books",
              likes_count: Math.floor(Math.random() * 500) + 100,
              comments_count: Math.floor(Math.random() * 100) + 10,
              read_time: Math.floor(Math.random() * 10) + 5,
              created_at: new Date(
                Date.now() - Math.random() * 86400000 * 3
              ).toISOString(),
              isExternal: true,
            });
          });
        });
      }
    } catch (error) {
      console.error("Error fetching NY Times books:", error);
    }

    try {
      const guardianResponse = await fetch(
        "https://content.guardianapis.com/search?section=books&show-fields=trailText,thumbnail&page-size=10&api-key=test"
      );
      const guardianData = await guardianResponse.json();

      if (guardianData.response && guardianData.response.results) {
        guardianData.response.results.forEach((article: any) => {
          const postId = `guardian-${article.id}`;
          externalPosts.push({
            id: postId,
            title: article.webTitle,
            author: "The Guardian",
            author_id: "guardian",
            avatar: "TG",
            genre: article.sectionName || "Books",
            likes: Math.floor(Math.random() * 300) + 50,
            comments: Math.floor(Math.random() * 80) + 5,
            readTime: `${Math.floor(Math.random() * 8) + 3} min`,
            excerpt:
              article.fields?.trailText ||
              "An insightful article from The Guardian.",
            timestamp: getRelativeTime(article.webPublicationDate),
            link: article.webUrl,
            source: "The Guardian",
            likes_count: Math.floor(Math.random() * 300) + 50,
            comments_count: Math.floor(Math.random() * 80) + 5,
            read_time: Math.floor(Math.random() * 8) + 3,
            created_at: article.webPublicationDate,
            isExternal: true,
          });
        });
      }
    } catch (error) {
      console.error("Error fetching Guardian articles:", error);
    }

    return externalPosts;
  };

  const fetchInternalPosts = async (pageNum: number) => {
    try {
      const response = await fetch(`/api/posts?page=${pageNum}&limit=10`);
      const data = await response.json();

      if (data.success && data.posts) {
        const internalPosts: FeedPost[] = data.posts.map((post: any) => ({
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

        console.log(
          `Fetching interactions for ${internalPosts.length} posts...`
        );

        const interactions: typeof postInteractions = {};
        await Promise.all(
          internalPosts.map(async (post) => {
            const status = await fetchPostInteractionStatus(post.id);
            if (status) {
              interactions[post.id] = status;
            }
          })
        );

        console.log(
          "Fetched interactions:",
          JSON.stringify(interactions, null, 2)
        );
        setPostInteractions((prev) => ({ ...prev, ...interactions }));

        return {
          posts: internalPosts,
          hasMore: data.hasMore || false,
        };
      }

      return { posts: [], hasMore: false };
    } catch (error) {
      console.error("Error fetching internal posts:", error);
      return { posts: [], hasMore: false };
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingPosts(true);

      const [externalPosts, internalData] = await Promise.all([
        fetchExternalAPIs(),
        fetchInternalPosts(1),
      ]);

      const allPosts = [...externalPosts, ...internalData.posts].sort(
        (a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        }
      );

      setFeedPosts(allPosts);
      setHasMore(internalData.hasMore);
      setLoadingPosts(false);
    };

    fetchInitialData();
  }, []);

  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    const internalData = await fetchInternalPosts(nextPage);

    if (internalData.posts.length > 0) {
      setFeedPosts((prev) => [...prev, ...internalData.posts]);
      setPage(nextPage);
      setHasMore(internalData.hasMore);
    } else {
      setHasMore(false);
    }

    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMorePosts, hasMore, isLoadingMore]);

  useEffect(() => {
    const fetchTrending = async () => {
      setLoadingTrending(true);
      try {
        const response = await fetch(
          "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json?api-key=DEMO_KEY"
        );
        const data = await response.json();

        if (data.results && data.results.books) {
          const books: TrendingBook[] = data.results.books
            .slice(0, 5)
            .map((book: any) => ({
              title: book.title,
              author: book.author,
              category: "Fiction",
              discussions: Math.floor(Math.random() * 500) + 100,
              link: book.amazon_product_url,
            }));

          setTrendingBooks(books);
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrending();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setLoadingUser(true);
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
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
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="pt-16 lg:pt-0 lg:ml-72 lg:mr-96 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {user && (
            <div className="mb-6 sm:mb-8 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-800 rounded-xl p-6">
              <h1 className="text-2xl sm:text-3xl font-serif text-neutral-100 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-neutral-400 text-sm">
                Discover new stories and share your thoughts with the community
              </p>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-100 mb-2">
              Your Feed
            </h2>
            <p className="text-neutral-500 text-sm">
              {feedPosts.length} posts sorted by latest
            </p>
          </div>

          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader
                className="animate-spin text-neutral-600 mb-4"
                size={40}
              />
              <p className="text-neutral-500 text-sm">Loading your feed...</p>
            </div>
          ) : feedPosts.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto mb-4 text-neutral-700" />
              <h3 className="text-xl text-neutral-300 mb-2">No posts yet</h3>
              <p className="text-neutral-500">
                Be the first to share something!
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {feedPosts.map((post) =>
                  post.isExternal ? (
                    <article
                      key={post.id}
                      onClick={() =>
                        post.link && window.open(post.link, "_blank")
                      }
                      className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-pointer"
                    >
                      {post.cover_image_url && (
                        <div className="relative w-full h-48 sm:h-64">
                          <Image
                            src={post.cover_image_url}
                            alt={post.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
                              {post.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-neutral-300 text-sm truncate">
                                {post.author}
                              </p>
                              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-600">
                                <span className="whitespace-nowrap">
                                  {post.timestamp}
                                </span>
                                <span>·</span>
                                <span className="flex items-center whitespace-nowrap">
                                  <Clock
                                    size={12}
                                    className="mr-1"
                                    strokeWidth={1.5}
                                  />
                                  {post.readTime}
                                </span>
                                {post.source && (
                                  <>
                                    <span>·</span>
                                    <span className="text-neutral-500 whitespace-nowrap">
                                      {post.source}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ml-3">
                            {post.genre}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-xl font-serif text-neutral-100 mb-3 hover:text-neutral-300 transition break-words leading-snug flex items-start">
                            <span className="flex-1">{post.title}</span>
                            {post.link && (
                              <ExternalLink
                                size={16}
                                className="ml-2 text-neutral-600 flex-shrink-0 mt-1"
                              />
                            )}
                          </h3>
                          <p className="text-neutral-400 text-sm mb-4 leading-relaxed break-words line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div
                          className="flex items-center space-x-6 text-sm text-neutral-500"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center space-x-2">
                            <Heart size={16} strokeWidth={1.5} />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MessageCircle size={16} strokeWidth={1.5} />
                            <span>{post.comments}</span>
                          </div>
                          {/* External posts don't support bookmarking */}
                          <div className="flex items-center space-x-2 text-neutral-600 cursor-not-allowed">
                            <Bookmark size={16} strokeWidth={1.5} />
                            <span>External</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div key={post.id}>
                      <Link href={`/dashboard/posts/${post.id}`}>
                        <article className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-pointer">
                          {post.cover_image_url && (
                            <div className="relative w-full h-48 sm:h-64">
                              <Image
                                src={post.cover_image_url}
                                alt={post.cover_image_caption || post.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}

                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3 flex-1 min-w-0">
                                <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
                                  {post.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-neutral-300 text-sm truncate">
                                    {post.author}
                                  </p>
                                  <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-600">
                                    <span className="whitespace-nowrap">
                                      {post.timestamp}
                                    </span>
                                    <span>·</span>
                                    <span className="flex items-center whitespace-nowrap">
                                      <Clock
                                        size={12}
                                        className="mr-1"
                                        strokeWidth={1.5}
                                      />
                                      {post.readTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ml-3">
                                {post.genre}
                              </span>
                            </div>

                            <div>
                              <h3 className="text-xl font-serif text-neutral-100 mb-3 hover:text-neutral-300 transition break-words leading-snug">
                                {post.title}
                              </h3>
                              <p className="text-neutral-400 text-sm mb-4 leading-relaxed break-words line-clamp-3">
                                {post.excerpt}
                              </p>
                            </div>

                            <div
                              className="flex items-center space-x-6 text-sm text-neutral-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                onClick={(e) => handleLike(post.id, e)}
                                className={`flex items-center space-x-2 transition ${
                                  postInteractions[post.id]?.liked
                                    ? "text-red-500"
                                    : "hover:text-red-400"
                                }`}
                              >
                                <Heart
                                  size={16}
                                  strokeWidth={1.5}
                                  fill={
                                    postInteractions[post.id]?.liked
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                                <span>
                                  {postInteractions[post.id]?.likeCount ??
                                    post.likes_count}
                                </span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  router.push(`/dashboard/posts/${post.id}`);
                                }}
                                className="flex items-center space-x-2 hover:text-neutral-300 transition"
                              >
                                <MessageCircle size={16} strokeWidth={1.5} />
                                <span>{post.comments_count}</span>
                              </button>
                              <button
                                onClick={(e) => handleBookmark(post.id, e)}
                                className={`flex items-center space-x-2 transition ${
                                  postInteractions[post.id]?.bookmarked
                                    ? "text-amber-500"
                                    : "hover:text-neutral-300"
                                }`}
                                title={
                                  postInteractions[post.id]?.bookmarked
                                    ? "Remove bookmark"
                                    : "Save post"
                                }
                              >
                                <Bookmark
                                  size={16}
                                  strokeWidth={1.5}
                                  fill={
                                    postInteractions[post.id]?.bookmarked
                                      ? "currentColor"
                                      : "none"
                                  }
                                />
                                <span>
                                  {postInteractions[post.id]?.bookmarked
                                    ? "Saved"
                                    : "Save"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </article>
                      </Link>
                    </div>
                  )
                )}
              </div>

              {feedPosts.length > 0 && hasMore && (
                <div ref={observerTarget} className="py-8">
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center">
                      <Loader
                        className="animate-spin text-neutral-600 mb-2"
                        size={32}
                      />
                      <p className="text-neutral-500 text-sm">
                        Loading more posts...
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!hasMore && feedPosts.length > 0 && (
                <div className="text-center py-8 text-neutral-600 text-sm">
                  <p>You've reached the end of your feed</p>
                </div>
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
    </div>
  );
}
