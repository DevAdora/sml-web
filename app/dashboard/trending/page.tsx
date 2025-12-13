"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Flame,
  Clock,
  Star,
  MessageCircle,
  Bookmark,
  Eye,
  Users,
  Hash,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

export default function TrendingPage() {
  const [timeFilter, setTimeFilter] = useState<string>("today");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const timeFilters = [
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
  ];

  const categories = ["All", "Reviews", "Lists", "Discussions", "Authors"];

  const trendingPosts = [
    {
      id: 1,
      rank: 1,
      title: "Why 'The Midnight Library' Is More Relevant Than Ever",
      author: "Sarah Mitchell",
      avatar: "SM",
      genre: "Fiction",
      excerpt:
        "In times of uncertainty, this book reminds us that every choice matters and every life has infinite possibilities...",
      likes: 2847,
      comments: 456,
      views: 12340,
      timestamp: "4 hours ago",
      readTime: "8 min",
      trending: "hot",
      growth: "+342%",
    },
    {
      id: 2,
      rank: 2,
      title: "Top 15 Books That Predicted AI's Rise",
      author: "Tech Reader",
      avatar: "TR",
      genre: "Lists",
      excerpt:
        "From Asimov to Gibson, these authors saw our AI future decades before ChatGPT...",
      likes: 2134,
      comments: 289,
      views: 9823,
      timestamp: "6 hours ago",
      readTime: "12 min",
      trending: "hot",
      growth: "+267%",
    },
    {
      id: 3,
      rank: 3,
      title: "Unpopular Opinion: Classic Literature Is Overrated",
      author: "Critical Carl",
      avatar: "CC",
      genre: "Opinion",
      excerpt:
        "Let's talk about why forcing students to read Dickens might be doing more harm than good...",
      likes: 1876,
      comments: 523,
      views: 8934,
      timestamp: "8 hours ago",
      readTime: "7 min",
      trending: "controversial",
      growth: "+198%",
    },
    {
      id: 4,
      rank: 4,
      title: "My Journey Reading 100 Books This Year",
      author: "BookWorm Betty",
      avatar: "BB",
      genre: "Personal",
      excerpt:
        "Here's what I learned from reading 100 books in 365 days, and how it changed my perspective on everything...",
      likes: 1654,
      comments: 234,
      views: 7621,
      timestamp: "10 hours ago",
      readTime: "10 min",
      trending: "rising",
      growth: "+156%",
    },
    {
      id: 5,
      rank: 5,
      title: "The Best Mystery Novels You've Never Heard Of",
      author: "Detective Dana",
      avatar: "DD",
      genre: "Lists",
      excerpt:
        "Forget Gone Girl and The Girl on the Train. These hidden gems will keep you up all night...",
      likes: 1523,
      comments: 187,
      views: 6892,
      timestamp: "12 hours ago",
      readTime: "9 min",
      trending: "rising",
      growth: "+134%",
    },
    {
      id: 6,
      rank: 6,
      title: "Why Brandon Sanderson Is the Future of Fantasy",
      author: "Fantasy Fan",
      avatar: "FF",
      genre: "Analysis",
      excerpt:
        "His world-building, magic systems, and consistent output make him the Tolkien of our generation...",
      likes: 1421,
      comments: 312,
      views: 6234,
      timestamp: "14 hours ago",
      readTime: "11 min",
      trending: "steady",
      growth: "+112%",
    },
    {
      id: 7,
      rank: 7,
      title: "Books That Made Me Cry (And I'm Not Ashamed)",
      author: "Emotional Emma",
      avatar: "EE",
      genre: "Personal",
      excerpt:
        "These stories broke my heart in the best possible way. Keep tissues nearby...",
      likes: 1312,
      comments: 245,
      views: 5876,
      timestamp: "16 hours ago",
      readTime: "6 min",
      trending: "steady",
      growth: "+98%",
    },
    {
      id: 8,
      rank: 8,
      title: "The Problem With BookTok Recommendations",
      author: "Critical Reader",
      avatar: "CR",
      genre: "Opinion",
      excerpt:
        "Why algorithmic reading culture might be homogenizing our literary tastes...",
      likes: 1267,
      comments: 456,
      views: 5621,
      timestamp: "18 hours ago",
      readTime: "8 min",
      trending: "controversial",
      growth: "+87%",
    },
  ];

  const trendingTopics = [
    { tag: "reading-challenge-2024", posts: "1.8k", growth: "+342%" },
    { tag: "book-recommendations", posts: "5.1k", growth: "+267%" },
    { tag: "unpopular-opinions", posts: "923", growth: "+198%" },
    { tag: "fantasy-books", posts: "2.4k", growth: "+156%" },
    { tag: "book-reviews", posts: "3.2k", growth: "+134%" },
    { tag: "emotional-reads", posts: "1.5k", growth: "+112%" },
  ];

  const trendingAuthors = [
    {
      name: "Sarah Mitchell",
      followers: "12.3k",
      newFollowers: "+342",
      avatar: "SM",
    },
    {
      name: "Critical Carl",
      followers: "8.9k",
      newFollowers: "+267",
      avatar: "CC",
    },
    {
      name: "Detective Dana",
      followers: "15.2k",
      newFollowers: "+198",
      avatar: "DD",
    },
    {
      name: "BookWorm Betty",
      followers: "6.7k",
      newFollowers: "+156",
      avatar: "BB",
    },
  ];

  const getTrendingBadge = (type: string) => {
    switch (type) {
      case "hot":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded text-xs font-medium">
            <Flame size={12} strokeWidth={2} />
            <span>Hot</span>
          </span>
        );
      case "rising":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded text-xs font-medium">
            <TrendingUp size={12} strokeWidth={2} />
            <span>Rising</span>
          </span>
        );
      case "controversial":
        return (
          <span className="flex items-center space-x-1 px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-medium">
            <MessageCircle size={12} strokeWidth={2} />
            <span>Controversial</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium">
            Steady
          </span>
        );
    }
  };

  const handleSignOut = () => {
    console.log("User signed out");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="ml-72 min-h-screen">
        {/* Header */}
        <div className="top-0 z-10  backdrop-blur-sm ">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-serif text-neutral-200 flex items-center mb-2">
                  <Flame
                    className="mr-3 text-red-400"
                    size={32}
                    strokeWidth={1.5}
                  />
                  Trending Now
                </h1>
                <p className="text-sm text-neutral-500">
                  The hottest discussions and reviews in the community
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between">
              {/* Time Filter */}
              <div className="flex space-x-2">
                {timeFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => setTimeFilter(filter.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      timeFilter === filter.value
                        ? "bg-neutral-200 text-neutral-900"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category.toLowerCase())}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      categoryFilter === category.toLowerCase()
                        ? "bg-neutral-800 text-neutral-200 border border-neutral-700"
                        : "text-neutral-500 hover:text-neutral-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Trending Posts */}
            <div className="lg:col-span-2 space-y-4">
              {trendingPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition cursor-pointer"
                >
                  {/* Header */}
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                          post.rank === 1
                            ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50"
                            : post.rank === 2
                            ? "bg-gray-400/20 text-gray-300 border-2 border-gray-400/50"
                            : post.rank === 3
                            ? "bg-orange-600/20 text-orange-400 border-2 border-orange-600/50"
                            : "bg-neutral-800 text-neutral-500 border border-neutral-700"
                        }`}
                      >
                        {post.rank}
                      </div>
                    </div>

                    {/* Author Info */}
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
                        {post.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-300 text-sm truncate">
                          {post.author}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-neutral-600">
                          <span>{post.timestamp}</span>
                          <span>·</span>
                          <span className="flex items-center">
                            <Clock
                              size={11}
                              className="mr-1"
                              strokeWidth={1.5}
                            />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendingBadge(post.trending)}
                        <span className="px-2 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
                          {post.growth}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="ml-14">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-serif text-neutral-100 hover:text-neutral-300 transition flex-1 break-words">
                        {post.title}
                      </h3>
                      <span className="ml-3 px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium whitespace-nowrap">
                        {post.genre}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm mb-4 leading-relaxed break-words line-clamp-2">
                      {post.excerpt}
                    </p>

                    {/* Engagement Stats */}
                    <div className="flex items-center space-x-6 text-sm text-neutral-500">
                      <span className="flex items-center space-x-2 hover:text-neutral-300 transition">
                        <Star size={16} strokeWidth={1.5} />
                        <span>{post.likes.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-2 hover:text-neutral-300 transition">
                        <MessageCircle size={16} strokeWidth={1.5} />
                        <span>{post.comments}</span>
                      </span>
                      <span className="flex items-center space-x-2 hover:text-neutral-300 transition">
                        <Eye size={16} strokeWidth={1.5} />
                        <span>{post.views.toLocaleString()}</span>
                      </span>
                      <span className="flex items-center space-x-2 hover:text-neutral-300 transition">
                        <Bookmark size={16} strokeWidth={1.5} />
                        <span>Save</span>
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Trending Topics */}
              <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
                  <Hash
                    className="mr-2 text-neutral-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-neutral-300 text-sm">
                          #{topic.tag}
                        </span>
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs font-medium">
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

              {/* Trending Authors */}
              <section className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
                  <Users
                    className="mr-2 text-neutral-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  Trending Authors
                </h3>
                <div className="space-y-4">
                  {trendingAuthors.map((author, idx) => (
                    <div key={idx} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium flex-shrink-0">
                        {author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-300 text-sm truncate">
                          {author.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-neutral-600">
                          <span>{author.followers} followers</span>
                          <span className="text-green-400">
                            {author.newFollowers} new
                          </span>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-xs font-medium transition flex-shrink-0">
                        Follow
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Info Box */}
              <section className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 rounded-lg p-6">
                <TrendingUp
                  className="text-neutral-400 mb-3"
                  size={32}
                  strokeWidth={1.5}
                />
                <h3 className="text-lg font-serif text-neutral-200 mb-2">
                  How Trending Works
                </h3>
                <p className="text-sm text-neutral-400 mb-4">
                  Posts are ranked by engagement velocity—how quickly they gain
                  likes, comments, and views. The algorithm updates every hour.
                </p>
                <div className="space-y-2 text-xs text-neutral-500">
                  <div className="flex items-center space-x-2">
                    <Flame size={14} className="text-red-400" />
                    <span>
                      <strong className="text-neutral-400">Hot:</strong> Rapid
                      growth in last 6 hours
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp size={14} className="text-orange-400" />
                    <span>
                      <strong className="text-neutral-400">Rising:</strong>{" "}
                      Steady engagement increase
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageCircle size={14} className="text-purple-400" />
                    <span>
                      <strong className="text-neutral-400">
                        Controversial:
                      </strong>{" "}
                      High comment ratio
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
