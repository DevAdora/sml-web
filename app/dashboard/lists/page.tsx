"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Plus,
  Users,
  BookOpen,
  Lock,
  Globe,
  Search,
  Filter,
  Heart,
  MessageCircle,
  Eye,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

export default function ReadingListsPage() {
  const [activeView, setActiveView] = useState<string>("discover");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const views = [
    { id: "discover", label: "Discover Lists" },
    { id: "my-lists", label: "My Lists" },
    { id: "saved", label: "Saved Lists" },
  ];

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
    {
      id: 3,
      title: "Private Reading Goals 2024",
      description: "My personal reading challenge for this year.",
      books: 8,
      followers: 0,
      isPrivate: true,
      coverEmojis: ["🎯", "📖", "⭐", "📝"],
      lastUpdated: "3 days ago",
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
    {
      id: 6,
      title: "Books About Books",
      description: "Meta reads for people who love reading about reading.",
      books: 22,
      followers: 2789,
      likes: 654,
      isPrivate: false,
      coverEmojis: ["📖", "📚", "✍️", "💭"],
      lastUpdated: "5 days ago",
      author: "Literary Lou",
      authorAvatar: "LL",
    },
    {
      id: 7,
      title: "Emotional Rollercoaster Reads",
      description:
        "Keep tissues nearby. These books will make you feel everything.",
      books: 16,
      followers: 4123,
      likes: 987,
      isPrivate: false,
      coverEmojis: ["😭", "💔", "🌈", "💕"],
      lastUpdated: "1 week ago",
      author: "Emotional Emma",
      authorAvatar: "EE",
    },
    {
      id: 8,
      title: "Philosophy 101: Beginner's Guide",
      description:
        "Start your philosophical journey with these accessible introductions.",
      books: 20,
      followers: 3892,
      likes: 721,
      isPrivate: false,
      coverEmojis: ["🤔", "💭", "🧠", "📘"],
      lastUpdated: "2 weeks ago",
      author: "Thoughtful Theo",
      authorAvatar: "TT",
    },
    {
      id: 9,
      title: "Short Story Collections Worth Your Time",
      description: "Perfect for when you want complete stories in small doses.",
      books: 14,
      followers: 2234,
      likes: 543,
      isPrivate: false,
      coverEmojis: ["📄", "⏱️", "✨", "📚"],
      lastUpdated: "3 days ago",
      author: "Quick Reader",
      authorAvatar: "QR",
    },
  ];

  const savedLists = [
    {
      id: 10,
      title: "Books That Make You Think",
      description: "Mind-bending reads that challenge your perspective.",
      books: 19,
      followers: 6721,
      isPrivate: false,
      coverEmojis: ["🧠", "💭", "🤯", "📚"],
      lastUpdated: "4 days ago",
      author: "Deep Thinker",
      authorAvatar: "DT",
    },
    {
      id: 11,
      title: "Underrated Gems of 2023",
      description: "Books that deserved more attention last year.",
      books: 25,
      followers: 4532,
      isPrivate: false,
      coverEmojis: ["💎", "⭐", "📖", "🌟"],
      lastUpdated: "1 week ago",
      author: "Hidden Gem Hunter",
      authorAvatar: "HG",
    },
  ];

  const handleSignOut = () => {
    console.log("User signed out");
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
        {showActions && (
          <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition ml-2">
            <MoreVertical size={18} strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Book Covers Preview */}
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

      {/* Author Info */}
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

      {/* Stats */}
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
        {!list.isPrivate && activeView === "discover" && (
          <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-xs font-medium transition">
            Save List
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="ml-72 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10">
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
                  Curated collections of books organized by theme, genre, or
                  mood
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

            {/* View Tabs */}
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

              {/* Search */}
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
                  placeholder="Search lists..."
                  className="pl-10 pr-4 py-2 w-64 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 text-neutral-200 placeholder-neutral-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
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

          {/* Saved Lists View */}
          {activeView === "saved" && (
            <div>
              {savedLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedLists.map((list) => renderListCard(list, false))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Bookmark
                    className="mx-auto text-neutral-700 mb-4"
                    size={64}
                    strokeWidth={1}
                  />
                  <h3 className="text-xl font-serif text-neutral-300 mb-2">
                    No saved lists
                  </h3>
                  <p className="text-neutral-500 mb-6">
                    Save lists from other users to see them here
                  </p>
                  <button
                    onClick={() => setActiveView("discover")}
                    className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition border border-neutral-700"
                  >
                    Discover Lists
                  </button>
                </div>
              )}
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
