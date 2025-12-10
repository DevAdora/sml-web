"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  MessageCircle,
  Users,
  TrendingUp,
  Plus,
  Search,
  Bell,
  Home,
  Bookmark,
  PenTool,
  User,
  Hash,
  Compass,
  Clock,
  Star,
  Loader,
  LogOut,
  Settings,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

// ==================== TYPES ====================
interface TrendingBook {
  title: string;
  author: string;
  category: string;
  discussions: number;
}

interface FeedPost {
  id: number;
  title: string;
  author: string;
  avatar: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  excerpt: string;
  timestamp: string;
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

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

// ==================== RIGHT SIDEBAR COMPONENT ====================
interface RightSidebarProps {
  trendingBooks: TrendingBook[];
  loadingTrending: boolean;
  internalTrending: TrendingTopic[];
  suggestedWriters: SuggestedWriter[];
}

function RightSidebar({
  trendingBooks,
  loadingTrending,
  internalTrending,
  suggestedWriters,
}: RightSidebarProps) {
  return (
    <aside className="fixed right-0 top-0 h-screen w-96 bg-neutral-900 border-l border-neutral-800 p-6 overflow-y-auto  [scrollbar-width:none]">
      {/* Notifications */}
      <div className="flex items-center justify-end space-x-3 mb-8">
        <button className="relative p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neutral-600 rounded-full"></span>
        </button>
      </div>

      {/* Trending Books from Google Books API */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
          <BookOpen
            className="mr-2 text-neutral-500"
            size={16}
            strokeWidth={1.5}
          />
          Trending Books
        </h3>
        {loadingTrending ? (
          <div className="flex items-center justify-center py-8">
            <Loader className="animate-spin text-neutral-600" size={24} />
          </div>
        ) : (
          <div className="space-y-2">
            {trendingBooks.map((book, idx) => (
              <div
                key={idx}
                className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
              >
                <p className="font-medium text-neutral-300 text-sm truncate">
                  {book.title}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  by {book.author}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-neutral-600">
                    {book.category}
                  </span>
                  <span className="text-xs text-neutral-600">
                    {book.discussions} discussions
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Internal Trending Topics */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
          <Hash className="mr-2 text-neutral-500" size={16} strokeWidth={1.5} />
          Trending in SML
        </h3>
        <div className="space-y-2">
          {internalTrending.map((topic, idx) => (
            <div
              key={idx}
              className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-neutral-300 text-sm">
                  #{topic.tag}
                </p>
                <span className="text-xs text-neutral-500">{topic.growth}</span>
              </div>
              <p className="text-xs text-neutral-600 mt-1">
                {topic.posts} posts
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggested Writers */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
          <Users
            className="mr-2 text-neutral-500"
            size={16}
            strokeWidth={1.5}
          />
          Suggested Writers
        </h3>
        <div className="space-y-3">
          {suggestedWriters.map((writer, idx) => (
            <div
              key={idx}
              className="p-4 bg-neutral-800/50 border border-neutral-800 rounded-lg"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-neutral-300 text-sm">
                    {writer.name}
                  </p>
                  <p className="text-xs text-neutral-600">{writer.handle}</p>
                </div>
                <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-xs font-medium transition">
                  Follow
                </button>
              </div>
              <p className="text-xs text-neutral-500">{writer.bio}</p>
              <p className="text-xs text-neutral-600 mt-2">
                {writer.followers} followers
              </p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ==================== MAIN DASHBOARD COMPONENT ====================
export default function SMLDashboard() {
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [trendingBooks, setTrendingBooks] = useState<TrendingBook[]>([]);
  const [loadingTrending, setLoadingTrending] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);

  const feedPosts: FeedPost[] = [
    {
      id: 1,
      title: "Why 'The Midnight Library' Changed My Perspective on Life",
      author: "Sarah Mitchell",
      avatar: "SM",
      genre: "Fiction",
      likes: 234,
      comments: 45,
      readTime: "8 min",
      excerpt:
        "Matt Haig's novel isn't just about parallel universes—it's a profound meditation on regret, choice, and the infinite possibilities of existence...",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      title: "A Deep Dive into Murakami's Surrealism",
      author: "James Chen",
      avatar: "JC",
      genre: "Literary Analysis",
      likes: 189,
      comments: 32,
      readTime: "12 min",
      excerpt:
        "Haruki Murakami's work exists in a liminal space between dream and reality, where cats talk, and wells become portals to other dimensions...",
      timestamp: "5 hours ago",
    },
    {
      id: 3,
      title: "Top 10 Sci-Fi Books That Predicted Our Future",
      author: "Alex Rodriguez",
      avatar: "AR",
      genre: "Lists",
      likes: 412,
      comments: 78,
      readTime: "6 min",
      excerpt:
        "From AI sentience to climate collapse, these science fiction novels saw our present coming decades before we arrived...",
      timestamp: "8 hours ago",
    },
    {
      id: 4,
      title: "Rediscovering Jane Austen in 2024: Still Relevant?",
      author: "Emma Thompson",
      avatar: "ET",
      genre: "Classics",
      likes: 156,
      comments: 29,
      readTime: "10 min",
      excerpt:
        "Two centuries later, Austen's sharp wit and social commentary feel more prescient than ever in our age of social media and performative identity...",
      timestamp: "12 hours ago",
    },
    {
      id: 5,
      title: "The Art of Building a Personal Library",
      author: "Marcus Webb",
      avatar: "MW",
      genre: "Essay",
      likes: 298,
      comments: 54,
      readTime: "7 min",
      excerpt:
        "A library isn't just a collection of books—it's a map of who you are, who you were, and who you hope to become...",
      timestamp: "15 hours ago",
    },
    {
      id: 6,
      title: "Why Short Stories Deserve More Love",
      author: "Lisa Park",
      avatar: "LP",
      genre: "Opinion",
      likes: 203,
      comments: 41,
      readTime: "5 min",
      excerpt:
        "In our age of shrinking attention spans, the short story offers something novels can't: complete worlds in concentrated form...",
      timestamp: "18 hours ago",
    },
    {
      id: 7,
      title: "Reading Dostoevsky in the Age of Anxiety",
      author: "Viktor Sokolov",
      avatar: "VS",
      genre: "Philosophy",
      likes: 267,
      comments: 62,
      readTime: "15 min",
      excerpt:
        "Crime and Punishment speaks to our modern crisis of meaning with unsettling accuracy. Raskolnikov's existential torment mirrors our own...",
      timestamp: "1 day ago",
    },
    {
      id: 8,
      title: "Best Mystery Novels of 2024 (So Far)",
      author: "Detective Dana",
      avatar: "DD",
      genre: "Lists",
      likes: 445,
      comments: 91,
      readTime: "9 min",
      excerpt:
        "This year has been exceptional for mystery fiction. From psychological thrillers to cozy whodunits, here are the must-reads...",
      timestamp: "1 day ago",
    },
    {
      id: 9,
      title: "The Poetry of Ocean Vuong: Language as Healing",
      author: "Maya Rodriguez",
      avatar: "MR",
      genre: "Poetry",
      likes: 178,
      comments: 36,
      readTime: "11 min",
      excerpt:
        "Vuong's work transforms trauma into something luminous, proving that poetry can be both wound and medicine...",
      timestamp: "1 day ago",
    },
    {
      id: 10,
      title: "How Graphic Novels Changed My Reading Life",
      author: "Jordan Lee",
      avatar: "JL",
      genre: "Personal Essay",
      likes: 321,
      comments: 68,
      readTime: "8 min",
      excerpt:
        "I used to think 'real' readers only consumed prose. Then I discovered Persepolis, Maus, and Sandman...",
      timestamp: "2 days ago",
    },
    {
      id: 11,
      title: "Tolkien's Worldbuilding: Lessons for Fantasy Writers",
      author: "Rebecca Storm",
      avatar: "RS",
      genre: "Writing Tips",
      likes: 389,
      comments: 73,
      readTime: "13 min",
      excerpt:
        "Middle-earth wasn't just invented—it was grown, with roots deep in mythology, language, and Tolkien's own experiences...",
      timestamp: "2 days ago",
    },
    {
      id: 12,
      title: "The Problem With BookTok Recommendations",
      author: "Critical Carl",
      avatar: "CC",
      genre: "Opinion",
      likes: 512,
      comments: 134,
      readTime: "7 min",
      excerpt:
        "Viral doesn't mean good. Let's talk about how algorithm-driven reading culture is homogenizing our literary tastes...",
      timestamp: "2 days ago",
    },
    {
      id: 13,
      title: "In Defense of Slow Reading",
      author: "Margaret Whitmore",
      avatar: "MW",
      genre: "Essay",
      likes: 289,
      comments: 47,
      readTime: "9 min",
      excerpt:
        "In our rush to consume content, we've forgotten the pleasure of lingering over a single sentence, savoring each word like fine wine...",
      timestamp: "2 days ago",
    },
    {
      id: 14,
      title: "Virginia Woolf's Stream of Consciousness: A Masterclass",
      author: "Literary Lou",
      avatar: "LL",
      genre: "Analysis",
      likes: 198,
      comments: 38,
      readTime: "14 min",
      excerpt:
        "To the Lighthouse doesn't just tell a story—it recreates the very texture of human thought, moment by moment...",
      timestamp: "3 days ago",
    },
    {
      id: 15,
      title: "Why I'm Rereading My Childhood Favorites at 40",
      author: "nostalgic_reader",
      avatar: "NR",
      genre: "Personal",
      likes: 356,
      comments: 82,
      readTime: "6 min",
      excerpt:
        "There's something magical about returning to the books that shaped you, seeing them with adult eyes while remembering your younger self...",
      timestamp: "3 days ago",
    },
  ];

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

  // Fetch user profile (simulated API call)
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        // Simulate API call with delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Simulated user data - replace with actual API call
        const userData: UserProfile = {
          name: "John Doe",
          username: "johndoe",
          avatar: "JD",
          email: "john.doe@example.com",
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

  // Fetch trending books from Google Books API
  useEffect(() => {
    const fetchTrendingBooks = async () => {
      setLoadingTrending(true);
      try {
        const categories = [
          "fiction",
          "mystery",
          "science fiction",
          "fantasy",
          "literary fiction",
        ];
        const randomCategory =
          categories[Math.floor(Math.random() * categories.length)];

        const response = await fetch(
          `https://www.googleapis.com/books/v1/volumes?q=subject:${randomCategory}&orderBy=newest&maxResults=6&langRestrict=en`
        );

        const data = await response.json();

        if (data.items) {
          const books: TrendingBook[] = data.items.map(
            (item: {
              volumeInfo: {
                title: string;
                authors?: string[];
                categories?: string[];
              };
            }) => ({
              title: item.volumeInfo.title,
              author: item.volumeInfo.authors
                ? item.volumeInfo.authors[0]
                : "Unknown Author",
              category: item.volumeInfo.categories
                ? item.volumeInfo.categories[0]
                : randomCategory,
              discussions: Math.floor(Math.random() * 500) + 50,
            })
          );
          setTrendingBooks(books);
        }
      } catch (error) {
        console.error("Error fetching trending books:", error);
        // Fallback data
        setTrendingBooks([
          {
            title: "The Midnight Library",
            author: "Matt Haig",
            category: "Fiction",
            discussions: 342,
          },
          {
            title: "Project Hail Mary",
            author: "Andy Weir",
            category: "Science Fiction",
            discussions: 289,
          },
          {
            title: "Klara and the Sun",
            author: "Kazuo Ishiguro",
            category: "Literary Fiction",
            discussions: 215,
          },
        ]);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingBooks();
  }, []);

  const handleSignOut = () => {
    console.log("User signed out");
    setUser(null);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    console.log("Active tab:", tab);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onSignOut={handleSignOut}
      />
      {/* Main Content */}
      <main className="ml-72 mr-96 min-h-screen">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* Search Bar */}
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

          {/* Welcome Section */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-serif text-neutral-200 mb-2">
              Welcome back, {user ? user.name : "Reader"}
            </h2>
            <p className="text-neutral-500 text-sm">
              5 new reviews from writers you follow
            </p>
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            {feedPosts.map((post) => (
              <article
                key={post.id}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 transition cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium">
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-300 text-sm">
                      {post.author}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-neutral-600">
                      <span>{post.timestamp}</span>
                      <span>·</span>
                      <span className="flex items-center">
                        <Clock size={11} className="mr-1" strokeWidth={1.5} />
                        {post.readTime}
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-neutral-800 text-neutral-400 border border-neutral-700 rounded text-xs font-medium">
                    {post.genre}
                  </span>
                </div>

                <h3 className="text-xl font-serif text-neutral-100 mb-3 hover:text-neutral-300 transition">
                  {post.title}
                </h3>
                <p className="text-neutral-400 text-sm mb-4 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="flex items-center space-x-6 text-sm text-neutral-500">
                  <button className="flex items-center space-x-2 hover:text-neutral-300 transition">
                    <Star size={16} strokeWidth={1.5} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-neutral-300 transition">
                    <MessageCircle size={16} strokeWidth={1.5} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-neutral-300 transition">
                    <Bookmark size={16} strokeWidth={1.5} />
                    <span>Save</span>
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button className="w-full mt-8 py-4 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg font-medium hover:bg-neutral-800 hover:border-neutral-700 hover:text-neutral-300 transition">
            Load More Reviews
          </button>
        </div>
      </main>

      {/* Right Sidebar Component */}
      <RightSidebar
        trendingBooks={trendingBooks}
        loadingTrending={loadingTrending}
        internalTrending={internalTrending}
        suggestedWriters={suggestedWriters}
      />
    </div>
  );
}
