"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen,
  MessageCircle,
  Users,
  Search,
  Bell,
  Hash,
  Clock,
  Star,
  Bookmark,
  Loader,
  ExternalLink,
} from "lucide-react";
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
  const [fetchedExternalAPIs, setFetchedExternalAPIs] =
    useState<boolean>(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const loadedPagesRef = useRef<Set<number>>(new Set());

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
    const nameParts = name.split(" ");
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
            author_id: "guardian-books",
            avatar: "TG",
            genre: "Book Review",
            likes: Math.floor(Math.random() * 400) + 50,
            comments: Math.floor(Math.random() * 80) + 5,
            readTime: `${Math.floor(Math.random() * 8) + 4} min`,
            excerpt:
              (article.fields && article.fields.trailText) ||
              "An insightful review from The Guardian Books section.",
            timestamp: getRelativeTime(article.webPublicationDate),
            link: article.webUrl,
            source: "The Guardian",
            likes_count: Math.floor(Math.random() * 400) + 50,
            comments_count: Math.floor(Math.random() * 80) + 5,
            read_time: Math.floor(Math.random() * 8) + 4,
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

  // Fetch internal posts from Supabase
  const fetchInternalPosts = async (pageNum: number) => {
    try {
      const response = await fetch(
        `/api/posts?page=${pageNum}&limit=10&include_external=false`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch internal posts");
      }
      const data = await response.json();
      return data.posts || [];
    } catch (error) {
      console.error("Error fetching internal posts:", error);
      return [];
    }
  };

  // Fetch trending books from NY Times
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      setLoadingTrending(true);
      try {
        const response = await fetch(
          "https://api.nytimes.com/svc/books/v3/lists/overview.json?api-key=DEMO_KEY"
        );
        const data = await response.json();

        if (data.results && data.results.lists) {
          const books: TrendingBook[] = [];
          data.results.lists.slice(0, 3).forEach((list: any) => {
            list.books.slice(0, 2).forEach((book: any) => {
              books.push({
                title: book.title,
                author: book.author,
                category: list.list_name,
                discussions: Math.floor(Math.random() * 200) + 50,
                link:
                  book.amazon_product_url ||
                  (book.buy_links && book.buy_links[0]
                    ? book.buy_links[0].url
                    : undefined),
              });
            });
          });
          setTrendingBooks(books.slice(0, 5));
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();

        if (!data.authenticated) {
          setUser(null);
          setLoadingUser(false);
          return;
        }

        const username = data.username || data.email.split("@")[0];
        let avatar = "";
        if (data.full_name) {
          const nameParts = data.full_name.split(" ");
          avatar =
            nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : data.full_name.substring(0, 2).toUpperCase();
        } else {
          avatar = data.email.substring(0, 2).toUpperCase();
        }

        const userData: UserProfile = {
          name: data.full_name || data.email,
          username: username,
          avatar: avatar,
          email: data.email,
        };

        setUser(userData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Initial load: fetch external APIs first, then internal posts
  useEffect(() => {
    const loadInitialPosts = async () => {
      setLoadingPosts(true);

      // Fetch external APIs first
      const externalPosts = await fetchExternalAPIs();
      setFetchedExternalAPIs(true);

      // Fetch internal posts (page 1)
      const internalPosts = await fetchInternalPosts(1);
      loadedPagesRef.current.add(1);

      // Merge and sort by date
      const allPosts = [...externalPosts, ...internalPosts].sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      setFeedPosts(allPosts);
      setLoadingPosts(false);
    };

    loadInitialPosts();
  }, []);

  // Fetch more internal posts
  const fetchMorePosts = useCallback(
    async (pageNum: number) => {
      if (loadedPagesRef.current.has(pageNum) || isLoadingMore) {
        return;
      }

      setIsLoadingMore(true);
      loadedPagesRef.current.add(pageNum);

      const newPosts = await fetchInternalPosts(pageNum);

      if (newPosts.length > 0) {
        setFeedPosts((prevPosts) => {
          const merged = [...prevPosts, ...newPosts];
          return merged.sort((a, b) => {
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
        });
      }

      setIsLoadingMore(false);
    },
    [isLoadingMore]
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && !loadingPosts) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [isLoadingMore, loadingPosts]);

  // Trigger fetch when page changes
  useEffect(() => {
    if (page > 1 && !loadingPosts) {
      fetchMorePosts(page);
    }
  }, [page]);

  const handleSignOut = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setUser(null);
        window.location.href = "/";
      } else {
        console.error("Sign out failed");
        alert("Failed to sign out. Please try again.");
      }
    } catch (error) {
      console.error("Error signing out:", error);
      alert("An error occurred while signing out.");
    }
  };

  const handlePostClick = (post: FeedPost) => {
    if (post.link && post.isExternal) {
      window.open(post.link, "_blank");
    }
  };

  const handleInteraction = (action: string) => {
    if (!user) {
      alert(`Please sign in to ${action}`);
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Responsive main content */}
      <main className="pt-16 lg:pt-0 lg:ml-72 lg:mr-96 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Search Bar */}
          <div className="mb-6 lg:mb-8">
            <div className="relative">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Search books, reviews, authors..."
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700 text-neutral-200 placeholder-neutral-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Welcome Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl font-serif text-neutral-200 mb-1 sm:mb-2">
              Welcome back, {user ? user.name : "Reader"}
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm">
              {feedPosts.length} posts in your feed
            </p>
          </div>

          {/* Loading State */}
          {loadingPosts ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader
                className="animate-spin text-neutral-600 mb-4"
                size={32}
              />
              <p className="text-neutral-500 text-sm">Loading posts...</p>
            </div>
          ) : (
            <>
              {/* Feed Posts */}
              <div className="space-y-4 sm:space-y-6">
                {feedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen
                      className="mx-auto text-neutral-700 mb-4"
                      size={64}
                      strokeWidth={1}
                    />
                    <h3 className="text-xl font-serif text-neutral-300 mb-2">
                      No posts yet
                    </h3>
                    <p className="text-neutral-500">
                      Be the first to share a review!
                    </p>
                  </div>
                ) : (
                  feedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 sm:p-6 hover:border-neutral-700 transition cursor-pointer"
                      onClick={() => post.isExternal && handlePostClick(post)}
                    >
                      {/* Post Header */}
                      <div className="flex items-start space-x-3 mb-3 sm:mb-4">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
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
                            <span className="hidden sm:inline">·</span>
                            <span className="flex items-center whitespace-nowrap">
                              <Clock
                                size={11}
                                className="mr-1"
                                strokeWidth={1.5}
                              />
                              {post.readTime}
                            </span>
                            {post.source && (
                              <>
                                <span className="hidden sm:inline">·</span>
                                <span className="text-neutral-500 whitespace-nowrap">
                                  {post.source}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <span className="px-2 sm:px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium whitespace-nowrap flex-shrink-0">
                          {post.genre}
                        </span>
                      </div>

                      {/* Post Content */}
                      <div className={post.isExternal ? "cursor-pointer" : ""}>
                        <h3 className="text-base sm:text-xl font-serif text-neutral-100 mb-2 sm:mb-3 hover:text-neutral-300 transition break-words flex items-start leading-snug">
                          <span className="flex-1">{post.title}</span>
                          {post.isExternal && post.link && (
                            <ExternalLink
                              size={14}
                              className="ml-2 text-neutral-600 flex-shrink-0 mt-1"
                            />
                          )}
                        </h3>
                        <p className="text-neutral-400 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed break-words line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      {/* Post Actions */}
                      <div
                        className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm text-neutral-500"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleInteraction("like posts")}
                          className="flex items-center space-x-1.5 hover:text-neutral-300 transition"
                        >
                          <Star size={14} strokeWidth={1.5} />
                          <span>{post.likes}</span>
                        </button>
                        <button
                          onClick={() => handleInteraction("comment")}
                          className="flex items-center space-x-1.5 hover:text-neutral-300 transition"
                        >
                          <MessageCircle size={14} strokeWidth={1.5} />
                          <span>{post.comments}</span>
                        </button>
                        <button
                          onClick={() => handleInteraction("bookmark")}
                          className="flex items-center space-x-1.5 hover:text-neutral-300 transition"
                        >
                          <Bookmark size={14} strokeWidth={1.5} />
                          <span className="hidden sm:inline">Save</span>
                        </button>
                      </div>
                    </article>
                  ))
                )}
              </div>

              {/* Infinite Scroll Trigger & Loading Indicator */}
              {feedPosts.length > 0 && (
                <div ref={observerTarget} className="py-6 sm:py-8">
                  {isLoadingMore && (
                    <div className="flex flex-col items-center justify-center">
                      <Loader
                        className="animate-spin text-neutral-600 mb-2"
                        size={28}
                      />
                      <p className="text-neutral-500 text-xs sm:text-sm">
                        Loading more posts...
                      </p>
                    </div>
                  )}
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
