"use client";

import React, { useState } from "react";
import {
  User,
  Settings,
  MapPin,
  Calendar,
  ExternalLink,
  BookOpen,
  Edit3,
  Star,
  MessageCircle,
  Bookmark,
  Users,
  TrendingUp,
  Award,
  Target,
  Heart,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("reviews");
  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const tabs = [
    {
      id: "reviews",
      label: "Reviews",
      icon: <Star size={16} strokeWidth={1.5} />,
    },
    {
      id: "lists",
      label: "Reading Lists",
      icon: <Bookmark size={16} strokeWidth={1.5} />,
    },
    { id: "about", label: "About", icon: <User size={16} strokeWidth={1.5} /> },
  ];

  const userProfile = {
    name: "John Doe",
    username: "johndoe",
    avatar: "JD",
    bio: "Passionate reader and book reviewer. I love exploring different genres and sharing my thoughts on literature. Currently obsessed with sci-fi and philosophy.",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    website: "johndoe.com",
    stats: {
      reviews: 156,
      followers: 2341,
      following: 892,
      readingLists: 23,
    },
    badges: [
      { name: "Early Adopter", icon: "🌟", color: "text-yellow-400" },
      { name: "100 Reviews", icon: "📚", color: "text-blue-400" },
      { name: "Top Contributor", icon: "⭐", color: "text-purple-400" },
    ],
    currentlyReading: [
      { title: "Dune", author: "Frank Herbert", progress: 67 },
      { title: "Sapiens", author: "Yuval Noah Harari", progress: 34 },
    ],
    readingGoal: {
      current: 42,
      target: 50,
      year: 2024,
    },
  };

  const reviews = [
    {
      id: 1,
      bookTitle: "The Midnight Library",
      bookAuthor: "Matt Haig",
      rating: 5,
      title: "A Beautiful Meditation on Life's Possibilities",
      excerpt:
        "This book touched my soul in ways I didn't expect. Matt Haig's exploration of regret, choice, and infinite possibilities is both heartbreaking and hopeful...",
      likes: 234,
      comments: 45,
      timestamp: "2 days ago",
      genre: "Fiction",
    },
    {
      id: 2,
      bookTitle: "Project Hail Mary",
      bookAuthor: "Andy Weir",
      rating: 5,
      title: "The Best Sci-Fi I've Read This Year",
      excerpt:
        "Andy Weir does it again! This book had me laughing, crying, and completely invested in the fate of humanity. The science is fascinating...",
      likes: 189,
      comments: 32,
      timestamp: "1 week ago",
      genre: "Science Fiction",
    },
    {
      id: 3,
      bookTitle: "Klara and the Sun",
      bookAuthor: "Kazuo Ishiguro",
      rating: 4,
      title: "Haunting and Thought-Provoking",
      excerpt:
        "Ishiguro's prose is as beautiful as ever. This story about an AI's perspective on humanity raises profound questions about consciousness...",
      likes: 156,
      comments: 28,
      timestamp: "2 weeks ago",
      genre: "Literary Fiction",
    },
  ];

  const readingLists = [
    {
      id: 1,
      title: "Books That Changed My Life",
      description: "Transformative reads that shaped my worldview",
      books: 12,
      followers: 456,
      coverEmojis: ["📚", "💡", "🌟", "✨"],
    },
    {
      id: 2,
      title: "Essential Sci-Fi Classics",
      description: "Must-read science fiction for every fan",
      books: 24,
      followers: 789,
      coverEmojis: ["🚀", "👽", "🛸", "🌌"],
    },
    {
      id: 3,
      title: "Philosophy 101",
      description: "Beginner-friendly philosophy books",
      books: 18,
      followers: 342,
      coverEmojis: ["🤔", "💭", "🧠", "📘"],
    },
  ];

  const handleSignOut = () => {
    console.log("User signed out");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="ml-72 min-h-screen">
        {/* Cover/Header Area */}
        <div className="h-48 bg-gradient-to-br from-neutral-800 to-neutral-900 border-b border-neutral-800"></div>

        {/* Profile Section */}
        <div className="max-w-5xl mx-auto px-6">
          {/* Profile Header */}
          <div className="relative -mt-20 mb-6">
            <div className="flex items-end space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-neutral-800 border-4 border-neutral-950 rounded-full flex items-center justify-center text-neutral-300 text-4xl font-bold">
                  {userProfile.avatar}
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full transition">
                  <Edit3
                    size={16}
                    strokeWidth={1.5}
                    className="text-neutral-300"
                  />
                </button>
              </div>

              {/* Name and Actions */}
              <div className="flex-1 pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-serif text-neutral-200 mb-1">
                      {userProfile.name}
                    </h1>
                    <p className="text-neutral-500">@{userProfile.username}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700 flex items-center space-x-2">
                      <Settings size={16} strokeWidth={1.5} />
                      <span>Edit Profile</span>
                    </button>
                    <button className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition border border-neutral-700">
                      <MessageCircle size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <p className="text-neutral-300 leading-relaxed mb-4 max-w-2xl">
                {userProfile.bio}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center">
                  <MapPin size={16} className="mr-1" strokeWidth={1.5} />
                  {userProfile.location}
                </span>
                <span className="flex items-center">
                  <Calendar size={16} className="mr-1" strokeWidth={1.5} />
                  Joined {userProfile.joinDate}
                </span>
                <span className="flex items-center">
                  <ExternalLink size={16} className="mr-1" strokeWidth={1.5} />
                  <a
                    href={`https://${userProfile.website}`}
                    className="text-neutral-400 hover:text-neutral-200 transition"
                  >
                    {userProfile.website}
                  </a>
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 flex items-center space-x-8">
              <div>
                <span className="text-2xl font-bold text-neutral-200">
                  {userProfile.stats.reviews}
                </span>
                <span className="text-sm text-neutral-500 ml-2">Reviews</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-200">
                  {userProfile.stats.followers.toLocaleString()}
                </span>
                <span className="text-sm text-neutral-500 ml-2">Followers</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-200">
                  {userProfile.stats.following}
                </span>
                <span className="text-sm text-neutral-500 ml-2">Following</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-neutral-200">
                  {userProfile.stats.readingLists}
                </span>
                <span className="text-sm text-neutral-500 ml-2">Lists</span>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-6 flex items-center space-x-2">
              {userProfile.badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg flex items-center space-x-2 hover:bg-neutral-800 transition"
                  title={badge.name}
                >
                  <span className="text-lg">{badge.icon}</span>
                  <span className={`text-xs font-medium ${badge.color}`}>
                    {badge.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-neutral-800 mb-6">
            <div className="flex space-x-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-neutral-300 text-neutral-200"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <article
                      key={review.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-neutral-100 text-lg">
                              {review.bookTitle}
                            </h3>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-neutral-700"
                                  }
                                  strokeWidth={1.5}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-500 mb-2">
                            by {review.bookAuthor}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium whitespace-nowrap">
                          {review.genre}
                        </span>
                      </div>
                      <h4 className="font-semibold text-neutral-200 mb-2">
                        {review.title}
                      </h4>
                      <p className="text-neutral-400 text-sm leading-relaxed mb-4 line-clamp-3">
                        {review.excerpt}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                        <div className="flex items-center space-x-4 text-sm text-neutral-500">
                          <span className="flex items-center">
                            <Heart
                              size={16}
                              className="mr-1"
                              strokeWidth={1.5}
                            />
                            {review.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle
                              size={16}
                              className="mr-1"
                              strokeWidth={1.5}
                            />
                            {review.comments}
                          </span>
                        </div>
                        <span className="text-xs text-neutral-600">
                          {review.timestamp}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Reading Lists Tab */}
              {activeTab === "lists" && (
                <div className="grid grid-cols-1 gap-4">
                  {readingLists.map((list) => (
                    <div
                      key={list.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 hover:border-neutral-700 transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-neutral-100 text-lg mb-2">
                            {list.title}
                          </h3>
                          <p className="text-sm text-neutral-400">
                            {list.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mb-4">
                        {list.coverEmojis.map((emoji, idx) => (
                          <div
                            key={idx}
                            className="w-14 h-16 bg-neutral-800 border border-neutral-700 rounded flex items-center justify-center text-2xl"
                          >
                            {emoji}
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500 pt-3 border-t border-neutral-800">
                        <span className="flex items-center">
                          <BookOpen
                            size={14}
                            className="mr-1"
                            strokeWidth={1.5}
                          />
                          {list.books} books
                        </span>
                        <span className="flex items-center">
                          <Users size={14} className="mr-1" strokeWidth={1.5} />
                          {list.followers} followers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* About Tab */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4">
                      About Me
                    </h3>
                    <p className="text-neutral-400 leading-relaxed">
                      {userProfile.bio}
                    </p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-neutral-200 mb-4">
                      Favorite Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Science Fiction",
                        "Philosophy",
                        "Literary Fiction",
                        "Mystery",
                        "Non-Fiction",
                      ].map((genre) => (
                        <span
                          key={genre}
                          className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-300"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Reading Goal */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
                  <Target
                    className="mr-2 text-neutral-500"
                    size={16}
                    strokeWidth={1.5}
                  />
                  {userProfile.readingGoal.year} Reading Goal
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold text-neutral-200">
                        {userProfile.readingGoal.current}
                      </span>
                      <span className="text-sm text-neutral-500">
                        of {userProfile.readingGoal.target} books
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-neutral-300 transition-all"
                        style={{
                          width: `${
                            (userProfile.readingGoal.current /
                              userProfile.readingGoal.target) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {userProfile.readingGoal.target -
                      userProfile.readingGoal.current}{" "}
                    books to go!
                  </p>
                </div>
              </div>

              {/* Currently Reading */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  Currently Reading
                </h3>
                <div className="space-y-4">
                  {userProfile.currentlyReading.map((book, idx) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-200 truncate">
                            {book.title}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {book.author}
                          </p>
                        </div>
                        <span className="text-xs text-neutral-500 ml-2">
                          {book.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-400 transition-all"
                          style={{ width: `${book.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">
                  Activity
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">This Week</span>
                    <span className="text-sm font-semibold text-neutral-200">
                      12 reviews
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">This Month</span>
                    <span className="text-sm font-semibold text-neutral-200">
                      47 reviews
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Total Likes
                    </span>
                    <span className="text-sm font-semibold text-neutral-200">
                      8.4K
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
