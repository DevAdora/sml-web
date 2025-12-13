"use client";

import React, { useState } from "react";
import {
  Search,
  BookOpen,
  TrendingUp,
  Star,
  Users,
  Filter,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

export default function DiscoverPage() {

  const featuredBooks = [
    {
      id: 1,
      title: "The Midnight Library",
      author: "Matt Haig",
      cover: "📚",
      rating: 4.8,
      reviews: 1234,
      genre: "Fiction",
      trending: true,
    },
    {
      id: 2,
      title: "Atomic Habits",
      author: "James Clear",
      cover: "📖",
      rating: 4.9,
      reviews: 2341,
      genre: "Self-Help",
      trending: true,
    },
    {
      id: 3,
      title: "Project Hail Mary",
      author: "Andy Weir",
      cover: "🚀",
      rating: 4.7,
      reviews: 892,
      genre: "Science Fiction",
      trending: false,
    },
    {
      id: 4,
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      cover: "☀️",
      rating: 4.6,
      reviews: 567,
      genre: "Literary Fiction",
      trending: false,
    },
  ];

  const topReviewers = [
    {
      name: "Sarah Mitchell",
      reviews: 234,
      followers: "12.3k",
      avatar: "SM",
      specialty: "Fiction & Classics",
    },
    {
      name: "James Chen",
      reviews: 189,
      followers: "8.9k",
      avatar: "JC",
      specialty: "Sci-Fi & Fantasy",
    },
    {
      name: "Emma Wordsworth",
      reviews: 156,
      followers: "15.2k",
      avatar: "EW",
      specialty: "Literary Analysis",
    },
  ];

  const collections = [
    {
      title: "Books That Changed My Life",
      curator: "Sarah M.",
      books: 12,
      followers: 2341,
      preview: ["📚", "📖", "📕"],
    },
    {
      title: "Essential Science Fiction",
      curator: "James C.",
      books: 24,
      followers: 1823,
      preview: ["🚀", "🛸", "👽"],
    },
    {
      title: "Cozy Mystery Novels",
      curator: "Detective Dana",
      books: 18,
      followers: 1456,
      preview: ["🔍", "🕵️", "📜"],
    },
  ];

  const trendingTopics = [
    { tag: "book-recommendations", posts: "5.1k", growth: "+8%" },
    { tag: "reading-challenge-2024", posts: "1.8k", growth: "+25%" },
    { tag: "literary-fiction", posts: "2.3k", growth: "+12%" },
    { tag: "book-club-picks", posts: "923", growth: "+18%" },
    { tag: "indie-authors", posts: "892", growth: "+15%" },
    { tag: "poetry-corner", posts: "1.2k", growth: "+5%" },
  ];

  const handleSignOut = () => {
    console.log("User signed out");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      <main className="ml-72 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-500"
                size={20}
                strokeWidth={1.5}
              />
              <input
                type="text"
                placeholder="Search books, reviews, authors..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700 text-neutral-200 placeholder-neutral-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif text-neutral-200 flex items-center">
                    <TrendingUp
                      className="mr-2 text-neutral-400"
                      size={20}
                      strokeWidth={1.5}
                    />
                    Featured Books
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredBooks.map((book) => (
                    <div
                      key={book.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition cursor-pointer group"
                    >
                      <div className="flex space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-20 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-3xl">
                            {book.cover}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-neutral-100 group-hover:text-neutral-300 transition truncate">
                                {book.title}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                by {book.author}
                              </p>
                            </div>
                            {book.trending && (
                              <TrendingUp
                                className="text-neutral-400 flex-shrink-0 ml-2"
                                size={16}
                                strokeWidth={1.5}
                              />
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-xs text-neutral-500">
                            <span className="flex items-center">
                              <Star
                                className="mr-1 text-neutral-400"
                                size={12}
                                strokeWidth={1.5}
                              />
                              {book.rating}
                            </span>
                            <span>{book.reviews} reviews</span>
                          </div>
                          <span className="inline-block mt-2 px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs text-neutral-400">
                            {book.genre}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif text-neutral-200 flex items-center">
                    <BookOpen
                      className="mr-2 text-neutral-400"
                      size={20}
                      strokeWidth={1.5}
                    />
                    Curated Collections
                  </h2>
                </div>
                <div className="space-y-3">
                  {collections.map((collection, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-100 mb-1">
                            {collection.title}
                          </h3>
                          <p className="text-sm text-neutral-500 mb-3">
                            Curated by {collection.curator}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-neutral-600">
                            <span>{collection.books} books</span>
                            <span className="flex items-center">
                              <Users
                                size={12}
                                className="mr-1"
                                strokeWidth={1.5}
                              />
                              {collection.followers}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-1 ml-4">
                          {collection.preview.map((emoji, i) => (
                            <div
                              key={i}
                              className="w-10 h-12 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-lg"
                            >
                              {emoji}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif text-neutral-200">
                    Trending Topics
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {trendingTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:bg-neutral-800 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-300 text-sm">
                          #{topic.tag}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {topic.growth}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600">
                        {topic.posts} posts
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
                  <Users
                    className="mr-2 text-neutral-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Top Reviewers
                </h3>
                <div className="space-y-4">
                  {topReviewers.map((reviewer, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
                        {reviewer.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-300 text-sm truncate">
                          {reviewer.name}
                        </p>
                        <p className="text-xs text-neutral-600 truncate">
                          {reviewer.specialty}
                        </p>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-neutral-600">
                          <span>{reviewer.reviews} reviews</span>
                          <span>{reviewer.followers} followers</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-xs font-medium transition flex-shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  Community Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Books Reviewed
                    </span>
                    <span className="text-lg font-semibold text-neutral-200">
                      12.4K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Active Readers
                    </span>
                    <span className="text-lg font-semibold text-neutral-200">
                      3.2K
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Reading Lists
                    </span>
                    <span className="text-lg font-semibold text-neutral-200">
                      892
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Discussions
                    </span>
                    <span className="text-lg font-semibold text-neutral-200">
                      5.6K
                    </span>
                  </div>
                </div>
              </section>

              <section className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg p-6">
                <BookOpen
                  className="text-neutral-400 mb-3"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-serif text-neutral-200 mb-2">
                  Join the Community
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Share your reviews, create reading lists, and connect with
                  fellow bookworms.
                </p>
                <button
                  onClick={() => (window.location.href = "/auth/signup")}
                  className="w-full bg-neutral-200 hover:bg-neutral-100 text-neutral-900 px-4 py-2 rounded-lg font-medium transition"
                >
                  Sign Up Free
                </button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
