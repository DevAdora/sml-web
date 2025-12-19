"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  Bell,
  Hash,
  Loader,
  ExternalLink,
  X,
  TrendingUp,
} from "lucide-react";
import {
  TrendingBook,
  TrendingTopic,
  SuggestedWriter,
  SuggestedUser,
} from "@/app/types/types";

interface RightSidebarProps {
  trendingBooks: TrendingBook[];
  loadingTrending: boolean;
  internalTrending: TrendingTopic[];
  suggestedWriters: SuggestedWriter[];
}

export function RightSidebar({
  trendingBooks,
  loadingTrending,
  internalTrending,
  suggestedWriters,
}: RightSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  const handleBookClick = (link?: string) => {
    if (link) {
      window.open(link, "_blank");
    }
  };

  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingSuggested(true);
      try {
        const res = await fetch("/api/user/suggested?limit=5", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load users");
        const data = await res.json();
        setSuggestedUsers(data.users || []);
      } catch (e) {
        console.error(e);
        setSuggestedUsers([]);
      } finally {
        setLoadingSuggested(false);
      }
    };
    load();
  }, []);

  const toggleFollow = async (userId: string, currentlyFollowing: boolean) => {
    setFollowLoadingId(userId);

    setSuggestedUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, is_following: !currentlyFollowing } : u
      )
    );

    try {
      const res = await fetch(`/api/user/${userId}/follow`, {
        method: currentlyFollowing ? "DELETE" : "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.id === userId ? { ...u, is_following: currentlyFollowing } : u
          )
        );
        if (res.status === 401) alert("Please sign in to follow writers");
      }
    } catch (e) {
      console.error(e);
      setSuggestedUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_following: currentlyFollowing } : u
        )
      );
    } finally {
      setFollowLoadingId(null);
    }
  };

  const SidebarContent = () => (
    <>
      <div className="hidden lg:flex items-center justify-end space-x-3 mb-8">
        <button className="relative p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
          <Bell size={20} strokeWidth={1.5} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-neutral-600 rounded-full"></span>
        </button>
      </div>

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
                onClick={() => handleBookClick(book.link)}
                className="p-3 bg-neutral-800/50 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-neutral-300 text-sm truncate flex-1">
                    {book.title}
                  </p>
                  {book.link && (
                    <ExternalLink
                      size={14}
                      className="text-neutral-600 group-hover:text-neutral-400 ml-2 flex-shrink-0"
                    />
                  )}
                </div>
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
      <div className="mb-8 lg:mb-0">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4 flex items-center">
          <Users
            className="mr-2 text-neutral-500"
            size={16}
            strokeWidth={1.5}
          />
          Suggested Writers
        </h3>
        <div className="space-y-3">
          {loadingSuggested ? (
            <div className="flex items-center justify-center py-6">
              <Loader className="animate-spin text-neutral-600" size={20} />
            </div>
          ) : suggestedUsers.length === 0 ? (
            <p className="text-xs text-neutral-600">No suggestions yet.</p>
          ) : (
            <div className="space-y-3">
              {suggestedUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-4 bg-neutral-800/50 border border-neutral-800 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xs font-medium">
                        {(u.full_name || "??")
                          .trim()
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-300 text-sm">
                          {u.full_name || "Anonymous"}
                        </p>
                        <p className="text-xs text-neutral-600">
                          @
                          {(u.full_name || "user")
                            .toLowerCase()
                            .replace(/\s+/g, "")}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleFollow(u.id, u.is_following)}
                      disabled={followLoadingId === u.id}
                      className={`px-3 py-1 border rounded text-xs font-medium transition disabled:opacity-50 ${
                        u.is_following
                          ? "bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300"
                          : "bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300"
                      }`}
                    >
                      {followLoadingId === u.id
                        ? "..."
                        : u.is_following
                        ? "Following"
                        : "Follow"}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-500">Reader on SML</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:block fixed right-0 top-0 h-screen w-96 p-6 overflow-y-auto [scrollbar-width:none] z-40">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 bg-neutral-800/95 backdrop-blur-md hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded-full shadow-lg transition-all active:scale-95"
        aria-label="Open trending menu"
      >
        <TrendingUp size={20} strokeWidth={1.5} />
        <span className="text-sm font-medium">Trending</span>
      </button>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        />
      )}

      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 rounded-t-3xl z-[70] transition-transform duration-300 ease-out ${
          mobileMenuOpen ? "translate-y-0" : "translate-y-full"
        }`}
        style={{
          height: "65vh",
          maxHeight: "650px",
        }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-neutral-700 rounded-full" />
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800 rounded-full transition"
          aria-label="Close menu"
        >
          <X size={20} strokeWidth={1.5} />
        </button>

        <div className="h-full overflow-y-auto px-6 pb-6">
          <SidebarContent />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
