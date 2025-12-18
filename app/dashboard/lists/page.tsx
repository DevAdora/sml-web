"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Bookmark,
  Plus,
  Users,
  BookOpen,
  Lock,
  Globe,
  Search,
  Clock,
  Heart,
  MessageCircle,
  Loader,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

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
  cover_image_caption?: string | null;
  bookmarked_at: string;
}

export default function ReadingListsPage() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<string>("saved");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [bookmarkedPosts, setBookmarkedPosts] = useState<BookmarkedPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const views = [
    { id: "saved", label: "Saved Posts" },
    { id: "discover", label: "Discover Lists" },
    { id: "my-lists", label: "My Lists" },
  ];

  useEffect(() => {
    fetchBookmarkedPosts();
  }, []);

  const fetchBookmarkedPosts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/bookmarks", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBookmarkedPosts(data.bookmarks || []);
      } else {
        console.error("Failed to fetch bookmarks");
      }
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
    } finally {
      setLoading(false);
    }
  };

  const myLists = [
    {
      id: 1,
      title: "Books That Changed My Life",
      description:
        "Transformative reads that shaped my worldview and made me think differently about everything.",
      books: 12,
      followers: 2341,
      isPrivate: false,
      coverEmojis: ["📚", "💡", "🌟", "✨"],
      lastUpdated: "2 days ago",
      author: "You",
    },
    {
      id: 2,
      title: "Must-Read Sci-Fi Classics",
      description:
        "Essential science fiction that every fan should read at least once.",
      books: 24,
      followers: 1823,
      isPrivate: false,
      coverEmojis: ["🚀", "👽", "🛸", "🌌"],
      lastUpdated: "1 week ago",
      author: "You",
    },
  ];

  const discoverLists = [
    {
      id: 4,
      title: "Cozy Mystery Novels for Winter",
      description:
        "Perfect whodunits to read by the fireplace with a cup of tea.",
      books: 18,
      followers: 3456,
      likes: 892,
      isPrivate: false,
      coverEmojis: ["🔍", "☕", "🕵️", "📜"],
      lastUpdated: "1 day ago",
      author: "Detective Dana",
      authorAvatar: "DD",
    },
    {
      id: 5,
      title: "Epic Fantasy Series Worth Starting",
      description:
        "Multi-book series that will consume your life (in the best way).",
      books: 15,
      followers: 5621,
      likes: 1234,
      isPrivate: false,
      coverEmojis: ["⚔️", "🐉", "🏰", "📚"],
      lastUpdated: "3 days ago",
      author: "Fantasy Fan",
      authorAvatar: "FF",
    },
  ];

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

  const renderListCard = (list: any, showActions: boolean = false) => (
    <div
      key={list.id}
      className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-neutral-100 group-hover:text-neutral-300 transition text-lg">
              {list.title}
            </h3>
            {list.isPrivate && (
              <Lock
                className="text-neutral-500 flex-shrink-0"
                size={16}
                strokeWidth={1.5}
              />
            )}
          </div>
          <p className="text-sm text-neutral-400 line-clamp-2 mb-3">
            {list.description}
          </p>
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        {list.coverEmojis.map((emoji: string, idx: number) => (
          <div
            key={idx}
            className="w-14 h-16 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-2xl"
          >
            {emoji}
          </div>
        ))}
        {list.books > 4 && (
          <div className="w-14 h-16 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-neutral-500 text-xs font-medium">
            +{list.books - 4}
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 mb-3">
        {list.authorAvatar && (
          <div className="w-6 h-6 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium">
            {list.authorAvatar}
          </div>
        )}
        <span className="text-sm text-neutral-500">
          by <span className="text-neutral-400">{list.author}</span>
        </span>
        <span className="text-neutral-700">•</span>
        <span className="text-xs text-neutral-600">{list.lastUpdated}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <div className="flex items-center space-x-4 text-sm text-neutral-500">
          <span className="flex items-center">
            <BookOpen size={14} className="mr-1" strokeWidth={1.5} />
            {list.books} books
          </span>
          {!list.isPrivate && (
            <span className="flex items-center">
              <Users size={14} className="mr-1" strokeWidth={1.5} />
              {list.followers.toLocaleString()}
            </span>
          )}
          {list.likes && (
            <span className="flex items-center">
              <Heart size={14} className="mr-1" strokeWidth={1.5} />
              {list.likes}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderBookmarkedPost = (post: BookmarkedPost) => (
    <div
      key={post.id}
      onClick={() => router.push(`/dashboard/posts/${post.id}`)}
      className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-all cursor-pointer"
    >
      {post.cover_image_url && (
        <div className="relative w-full h-48">
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
              {generateAvatar(post.author)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-300 text-sm truncate">
                {post.author}
              </p>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs text-neutral-600">
                <span className="whitespace-nowrap">
                  {getRelativeTime(post.created_at)}
                </span>
                <span>·</span>
                <span className="flex items-center whitespace-nowrap">
                  <Clock size={12} className="mr-1" strokeWidth={1.5} />
                  {post.read_time} min
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

        <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
          <div className="flex items-center space-x-6 text-sm text-neutral-500">
            <span className="flex items-center">
              <Heart size={16} className="mr-1" strokeWidth={1.5} />
              {post.likes_count}
            </span>
            <span className="flex items-center">
              <MessageCircle size={16} className="mr-1" strokeWidth={1.5} />
              {post.comments_count}
            </span>
          </div>
          <span className="text-xs text-neutral-600">
            Saved {getRelativeTime(post.bookmarked_at)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="ml-72 min-h-screen">
        <div className="sticky top-0 z-10 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-serif text-neutral-200 flex items-center mb-2">
                  <Bookmark
                    className="mr-3 text-neutral-400"
                    size={32}
                    strokeWidth={1.5}
                  />
                  Reading Lists
                </h1>
                <p className="text-sm text-neutral-500">
                  Your saved posts and curated reading collections
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-neutral-200 hover:bg-neutral-100 text-neutral-900 rounded-lg font-medium transition"
              >
                <Plus size={18} strokeWidth={2} />
                <span>Create List</span>
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {views.map((view) => (
                  <button
                    key={view.id}
                    onClick={() => setActiveView(view.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      activeView === view.id
                        ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {view.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                  size={16}
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 text-neutral-200 placeholder-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Saved Posts View */}
          {activeView === "saved" && (
            <div>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader
                    className="animate-spin text-neutral-600 mb-4"
                    size={40}
                  />
                  <p className="text-neutral-500 text-sm">
                    Loading your saved posts...
                  </p>
                </div>
              ) : bookmarkedPosts.length > 0 ? (
                <div>
                  <div className="mb-4">
                    <p className="text-sm text-neutral-500">
                      {bookmarkedPosts.length} saved{" "}
                      {bookmarkedPosts.length === 1 ? "post" : "posts"}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {bookmarkedPosts.map((post) => renderBookmarkedPost(post))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bookmark
                    className="mx-auto text-neutral-700 mb-4"
                    size={64}
                    strokeWidth={1}
                  />
                  <h3 className="text-xl font-serif text-neutral-300 mb-2">
                    No saved posts yet
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Start bookmarking posts to see them here
                  </p>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition border border-neutral-700"
                  >
                    Explore Posts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* My Lists View */}
          {activeView === "my-lists" && (
            <div>
              {myLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myLists.map((list) => renderListCard(list, true))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bookmark
                    className="mx-auto text-neutral-700 mb-4"
                    size={64}
                    strokeWidth={1}
                  />
                  <h3 className="text-xl font-serif text-neutral-300 mb-2">
                    No lists yet
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Create your first reading list to get started
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition border border-neutral-700"
                  >
                    Create Your First List
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Discover Lists View */}
          {activeView === "discover" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {discoverLists.map((list) => renderListCard(list, false))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Create List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-neutral-200">
                Create New List
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  List Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Best Mystery Novels"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-600 text-neutral-200 placeholder-neutral-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What's this list about?"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-600 text-neutral-200 placeholder-neutral-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Privacy
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-neutral-800 border-2 border-neutral-700 rounded-lg hover:border-neutral-600 transition"
                  >
                    <Globe size={18} strokeWidth={1.5} />
                    <span className="text-sm font-medium">Public</span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition"
                  >
                    <Lock size={18} strokeWidth={1.5} />
                    <span className="text-sm font-medium">Private</span>
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="flex-1 px-4 py-3 bg-neutral-200 hover:bg-neutral-100 text-neutral-900 rounded-lg font-medium transition"
                >
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
