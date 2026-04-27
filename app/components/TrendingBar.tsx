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

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <span className="text-neutral-700">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
        {label}
      </span>
    </div>
  );
}


export function RightSidebar({
  trendingBooks,
  loadingTrending,
  internalTrending,
  suggestedWriters,
}: RightSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifRead, setNotifRead] = useState(false);

  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [loadingSuggested, setLoadingSuggested] = useState(false);
  const [followLoadingId, setFollowLoadingId] = useState<string | null>(null);


  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);


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

  const generateInitials = (name: string) =>
    (name || "??")
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((p) => p[0])
      .join("")
      .toUpperCase();


  const PanelContent = () => (
    <div className="">

      <section className="px-5 py-4">
        <SectionHeader
          icon={<BookOpen size={16} strokeWidth={1.6} />}
          label="Trending Books"
        />

        {loadingTrending ? (
          <div className="flex justify-center py-6">
            <Loader className="animate-spin text-neutral-700" size={18} />
          </div>
        ) : trendingBooks.length === 0 ? (
          <p className="text-[16px] text-neutral-700 italic">No books found.</p>
        ) : (
          <div className="divide-y divide-[#141414]">
            {trendingBooks.map((book, idx) => (
              <button
                key={idx}
                onClick={() => book.link && window.open(book.link, "_blank")}
                className="w-full flex items-start gap-3 py-2.5 text-left group hover:opacity-75 transition-opacity"
              >
                {/* Rank number */}
                <span className="text-[10px] font-bold text-neutral-700 w-3.5 flex-shrink-0 mt-0.5 tabular-nums">
                  {idx + 1}
                </span>

                {/* Book info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors leading-snug truncate">
                    {book.title}
                  </p>
                  <p className="text-[10px] text-neutral-600 mt-0.5 truncate">
                    {book.author}
                  </p>
                  <p className="text-[10px] text-neutral-700 mt-1">
                    {book.discussions} discussions
                  </p>
                </div>

                {book.link && (
                  <ExternalLink
                    size={10}
                    className="text-neutral-700 group-hover:text-neutral-500 flex-shrink-0 mt-1 transition-colors"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="px-5 py-4">
        <SectionHeader
          icon={<Hash size={16} strokeWidth={1.6} />}
          label="Trending in SML"
        />

        <div className="divide-y divide-[#141414]">
          {internalTrending.map((topic, idx) => (
            <button
              key={idx}
              className="w-full flex items-center justify-between py-2.5 text-left group hover:opacity-75 transition-opacity"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors truncate">
                  #{topic.tag}
                </p>
                <p className="text-[10px] text-neutral-700 mt-0.5">
                  {topic.posts} posts
                </p>
              </div>
              <span className="text-[10px] font-semibold text-emerald-500 flex-shrink-0 ml-3 tabular-nums">
                {topic.growth}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 py-4">
        <SectionHeader
          icon={<Users size={16} strokeWidth={1.6} />}
          label="Suggested Writers"
        />

        {loadingSuggested ? (
          <div className="flex justify-center py-6">
            <Loader className="animate-spin text-neutral-700" size={18} />
          </div>
        ) : suggestedUsers.length === 0 ? (
          <p className="text-[11px] text-neutral-700 italic">
            No suggestions yet.
          </p>
        ) : (
          <div className="divide-y divide-[#141414]">
            {suggestedUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-500 text-[10px] font-semibold flex-shrink-0">
                  {generateInitials(u.full_name || "")}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-medium text-neutral-400 truncate leading-tight">
                    {u.full_name || "Anonymous"}
                  </p>
                  <p className="text-[12px] text-neutral-600 truncate mt-0.5">
                    @{(u.full_name || "user").toLowerCase().replace(/\s+/g, "")}
                  </p>
                </div>

                <button
                  onClick={() => toggleFollow(u.id, u.is_following)}
                  disabled={followLoadingId === u.id}
                  className={`
                    flex-shrink-0 text-[12px] font-semibold px-3 py-1.5
                    border transition-all disabled:opacity-50 tracking-wide
                    ${
                      u.is_following
                        ? "border-[#1f1f1f] text-neutral-600 hover:border-red-900/40 hover:text-red-400"
                        : "border-[#2a2a2a] text-neutral-400 hover:border-[#3a3a3a] hover:text-white"
                    }
                  `}
                >
                  {followLoadingId === u.id
                    ? "…"
                    : u.is_following
                    ? "Following"
                    : "Follow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );


  return (
    <>
      <aside className="hidden lg:flex flex-col fixed right-0 top-0 h-screen w-96 bg-[#0a0a0a] z-40 overflow-hidden">

        <div className="h-[48px] border-b border-[#1a1a1a] flex items-center justify-end px-4 flex-shrink-0">
          <button
            onClick={() => setNotifRead(true)}
            title="Notifications"
            className="relative w-8 h-8 flex items-center justify-center text-neutral-600 hover:text-neutral-300 hover:bg-[#161616] transition-colors"
          >
            <Bell size={16} strokeWidth={1.5} />
            {!notifRead && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-neutral-500 rounded-full border border-[#0a0a0a]" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <PanelContent />
        </div>
      </aside>

      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 bg-[#111] border border-[#272727] text-neutral-300 hover:border-[#3a3a3a] hover:text-white shadow-xl transition-all active:scale-95"
        aria-label="Open trending panel"
      >
        <TrendingUp size={14} strokeWidth={1.5} />
        <span className="text-xs font-semibold">Trending</span>
      </button>

      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[60]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ animation: "fadeIn 0.2s ease-out" }}
        />
      )}

      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0
          bg-[#0f0f0f] border-t border-[#1a1a1a] rounded-t-2xl
          z-[70] transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ height: "70vh", maxHeight: 680 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2a2a2a] rounded-full" />
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-[#1a1a1a] transition-colors"
          aria-label="Close panel"
        >
          <X size={15} strokeWidth={2} />
        </button>

        <div className="px-5 pb-3 border-b border-[#1a1a1a]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
            Discover
          </p>
        </div>

        <div className="h-full overflow-y-auto pb-10">
          <PanelContent />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}