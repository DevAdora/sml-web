"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  MessageCircle,
  Clock,
  Star,
  Bookmark,
  Loader,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import LeftSidebar from "@/app/components/Sidebar";
import { RightSidebar } from "../components/TrendingBar";

// ==================== TYPES ====================
interface TrendingBook {
  title: string;
  author: string;
  category: string;
  discussions: number;
  link?: string;
}

interface FeedPost {
  id: string;
  title: string;
  author: string;
  author_id: string;
  avatar: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  excerpt: string;
  timestamp: string;
  link?: string;
  source?: string;
  likes_count: number;
  comments_count: number;
  read_time: number;
  created_at: string;
  isExternal?: boolean;
  cover_image_url?: string | null;
  cover_image_caption?: string | null;
}

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

interface SuggestedWriter {
  name: string;
  handle: string;
  followers: string;
  bio: string;
}

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  email: string;
}

export default function SMLDashboard() {
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

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

  // Fetch external APIs (NY Times & Guardian)
  const fetchExternalAPIs = async () => {
    const externalPosts: FeedPost[] = [];

    // NY Times Books API
    try {
      const nytResponse = await fetch(
        "https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=DEMO_KEY"
      );
      const nytData = await nytResponse.json();

      if (nytData.results && nytData.results.lists) {
        nytData.results.lists.forEach((list: any) => {
          list.books.slice(0, 2).forEach((book: any) => {
            externalPosts.push({
              id: `nyt-${book.primary_isbn13}`,
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

    // Guardian API
    try {
      const guardianResponse = await fetch(
        "https://content.guardianapis.com/search?section=books&show-fields=trailText,thumbnail&page-size=10&api-key=test"
      );
      const guardianData = await guardianResponse.json();

      if (guardianData.response && guardianData.response.results) {
        guardianData.response.results.forEach((article: any) => {
          externalPosts.push({
            id: `guardian-${article.id}`,
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

  // Fetch internal posts from API
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

  // Initial fetch - SORTED BY DATE
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingPosts(true);

      // Fetch both external and internal posts
      const [externalPosts, internalData] = await Promise.all([
        fetchExternalAPIs(),
        fetchInternalPosts(1),
      ]);

      // Combine all posts and sort by date (latest first)
      const allPosts = [...externalPosts, ...internalData.posts].sort(
        (a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA; // Newest first
        }
      );

      setFeedPosts(allPosts);
      setHasMore(internalData.hasMore);
      setLoadingPosts(false);
    };

    fetchInitialData();
  }, []);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    const internalData = await fetchInternalPosts(nextPage);

    if (internalData.posts.length > 0) {
      // Simply append new posts without re-sorting
      // They should already be in chronological order from the API
      setFeedPosts((prev) => [...prev, ...internalData.posts]);
      setPage(nextPage);
      setHasMore(internalData.hasMore);
    } else {
      setHasMore(false);
    }

    setIsLoadingMore(false);
  }, [page, isLoadingMore, hasMore]);

  // Infinite scroll observer
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

  // Fetch trending books
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

  // Fetch user profile
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

  const handleInteraction = (action: string) => {
    console.log(`User wants to ${action} - feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Left Sidebar */}
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:ml-72 lg:mr-96 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Welcome Header */}
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

          {/* Feed Header */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif text-neutral-100 mb-2">
              Your Feed
            </h2>
            <p className="text-neutral-500 text-sm">
              {feedPosts.length} posts sorted by latest
            </p>
          </div>

          {/* Loading State */}
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader
                className="animate-spin text-neutral-600 mb-4"
                size={40}
              />
              <p className="text-neutral-500 text-sm">Loading your feed...</p>
            </div>
          ) : feedPosts.length === 0 ? (
            /* Empty State */
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
                          <button
                            onClick={() => handleInteraction("like posts")}
                            className="flex items-center space-x-2 hover:text-neutral-300 transition"
                          >
                            <Star size={16} strokeWidth={1.5} />
                            <span>{post.likes}</span>
                          </button>
                          <button
                            onClick={() => handleInteraction("comment")}
                            className="flex items-center space-x-2 hover:text-neutral-300 transition"
                          >
                            <MessageCircle size={16} strokeWidth={1.5} />
                            <span>{post.comments}</span>
                          </button>
                          <button
                            onClick={() => handleInteraction("bookmark")}
                            className="flex items-center space-x-2 hover:text-neutral-300 transition"
                          >
                            <Bookmark size={16} strokeWidth={1.5} />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <Link key={post.id} href={`/dashboard/posts/${post.id}`}>
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
                              onClick={(e) => {
                                e.preventDefault();
                                handleInteraction("like posts");
                              }}
                              className="flex items-center space-x-2 hover:text-neutral-300 transition"
                            >
                              <Star size={16} strokeWidth={1.5} />
                              <span>{post.likes}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleInteraction("comment");
                              }}
                              className="flex items-center space-x-2 hover:text-neutral-300 transition"
                            >
                              <MessageCircle size={16} strokeWidth={1.5} />
                              <span>{post.comments}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleInteraction("bookmark");
                              }}
                              className="flex items-center space-x-2 hover:text-neutral-300 transition"
                            >
                              <Bookmark size={16} strokeWidth={1.5} />
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    </Link>
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
