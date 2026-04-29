"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Search,
  Send,
  UserPlus,
  ArrowLeft,
  CheckCheck,
  Loader,
  AlertCircle,
  X,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";
import { useRouter } from "next/navigation";

// ─── Utilities ────────────────────────────────────────────────────────────────

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
}

interface Conversation {
  id: string;
  participant: Profile;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface MessageProfile {
  email: string;
  full_name: string;
  avatar_url?: string | null;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  profiles: MessageProfile;
  isTemp?: boolean;
}

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const fetchConversations = async (): Promise<{
  conversations: Conversation[];
}> => {
  const res = await fetch("/api/messages/conversations");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch conversations");
  }
  return res.json();
};

const fetchMessages = async (
  conversationId: string
): Promise<{ messages: Message[] }> => {
  const res = await fetch(`/api/messages/${conversationId}`);
  if (!res.ok) throw new Error("Failed to fetch messages");
  return res.json();
};

const fetchAllUsers = async (): Promise<{ users: User[] }> => {
  const res = await fetch("/api/messages/users?all=true");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch users");
  }
  return res.json();
};

const sendMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<{ message: Message }> => {
  const res = await fetch(`/api/messages/${conversationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) throw new Error("Failed to send message");
  return res.json();
};

const createConversation = async (
  participantId: string
): Promise<{ conversationId: string; existed: boolean }> => {
  const res = await fetch("/api/messages/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId }),
  });
  if (!res.ok) throw new Error("Failed to create conversation");
  return res.json();
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name?: string) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h`;
  if (diff < 10080) return `${Math.floor(diff / 1440)}d`;
  return date.toLocaleDateString();
};

// ─── Shared atoms ─────────────────────────────────────────────────────────────

function Avatar({
  name,
  size = "md",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "w-7 h-7 text-[9px]"
      : size === "lg"
      ? "w-10 h-10 text-xs"
      : "w-8 h-8 text-[10px]";
  return (
    <div
      className={`${sz} bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center font-semibold text-neutral-500 flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

function ErrorBanner({
  error,
  conversationsError,
  usersError,
  onClose,
}: {
  error: string | null;
  conversationsError: unknown;
  usersError: unknown;
  onClose: () => void;
}) {
  const msg =
    error ||
    (conversationsError as Error | undefined)?.message ||
    (usersError as Error | undefined)?.message;
  if (!msg) return null;
  return (
    <div className="mx-4 mt-3 flex items-center justify-between gap-2 bg-red-500/8 border border-red-500/15 px-3 py-2.5">
      <div className="flex items-center gap-2">
        <AlertCircle size={13} className="text-red-400 flex-shrink-0" />
        <p className="text-xs text-red-400">{msg}</p>
      </div>
      <button onClick={onClose} className="text-red-500 hover:text-red-300">
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  );
}

// ─── Conversations list ────────────────────────────────────────────────────────

function ConversationsList({
  conversations,
  loading,
  selected,
  onSelect,
  onNewChat,
  errorBanner,
}: {
  conversations: Conversation[];
  loading: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  onNewChat: () => void;
  errorBanner: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-[48px] flex items-center justify-between px-4 border-b border-[#1a1a1a] flex-shrink-0">
        <span className="text-sm font-semibold text-white tracking-tight">
          Messages
        </span>
        <button
          onClick={onNewChat}
          title="New message"
          className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-[#1a1a1a] transition-colors"
        >
          <UserPlus size={14} strokeWidth={1.5} />
        </button>
      </div>

      {errorBanner}

      {/* Body */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-neutral-700" size={20} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
            <MessageCircle
              size={28}
              strokeWidth={1.2}
              className="text-neutral-700 mb-3"
            />
            <p className="text-sm text-neutral-500 mb-1">No conversations</p>
            <p className="text-xs text-neutral-700 mb-5">
              Start a conversation with another reader
            </p>
            <button
              onClick={onNewChat}
              className="text-xs font-semibold text-[#0a0a0a] bg-white px-4 py-2 hover:bg-neutral-100 transition-colors"
            >
              New Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#141414]">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  selected === conv.id
                    ? "bg-[#161616]"
                    : "hover:bg-[#111]"
                }`}
              >
                <Avatar name={conv.participant?.full_name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p
                      className={`text-xs font-medium truncate ${
                        conv.unreadCount > 0
                          ? "text-white"
                          : "text-neutral-400"
                      }`}
                    >
                      {conv.participant?.full_name || "Unknown"}
                    </p>
                    {conv.lastMessageTime && (
                      <span className="text-[10px] text-neutral-700 flex-shrink-0 ml-2">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] text-neutral-600 truncate">
                      {conv.lastMessage || "No messages yet"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="flex-shrink-0 w-4 h-4 bg-white text-[#0a0a0a] text-[9px] font-bold flex items-center justify-center">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── New chat / user search ────────────────────────────────────────────────────

function NewChatView({
  searchQuery,
  setSearchQuery,
  debouncedQuery,
  isTyping,
  usersLoading,
  filteredUsers,
  onBack,
  onCreateConversation,
  createPending,
  errorBanner,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  debouncedQuery: string;
  isTyping: boolean;
  usersLoading: boolean;
  filteredUsers: User[];
  onBack: () => void;
  onCreateConversation: (id: string) => void;
  createPending: boolean;
  errorBanner: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-[48px] flex items-center gap-3 px-4 border-b border-[#1a1a1a] flex-shrink-0">
        <button
          onClick={onBack}
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft size={15} strokeWidth={2} />
        </button>
        <span className="text-sm font-semibold text-white tracking-tight">
          New Message
        </span>
      </div>

      {errorBanner}

      {/* Search */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] flex-shrink-0">
        <div className="relative">
          <Search
            size={13}
            strokeWidth={1.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email…"
            autoFocus
            className="w-full pl-8 pr-3 py-2 bg-[#161616] border border-[#272727] text-sm text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors"
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {isTyping || usersLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-neutral-700" size={18} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <Search size={24} strokeWidth={1.2} className="text-neutral-700 mb-3" />
            <p className="text-xs text-neutral-600">
              {debouncedQuery
                ? `No readers found for "${debouncedQuery}"`
                : "Search for readers to message"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#141414]">
            {filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onCreateConversation(user.id)}
                disabled={createPending}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#111] transition-colors disabled:opacity-50"
              >
                <Avatar name={user.full_name} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-300 truncate">
                    {user.full_name || "Unknown"}
                  </p>
                  <p className="text-[10px] text-neutral-600 truncate mt-0.5">
                    {user.email}
                  </p>
                  {user.bio && (
                    <p className="text-[10px] text-neutral-700 truncate mt-0.5">
                      {user.bio}
                    </p>
                  )}
                </div>
                {createPending && (
                  <Loader className="animate-spin text-neutral-600 flex-shrink-0" size={14} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chat view ────────────────────────────────────────────────────────────────

function ChatView({
  currentConv,
  currentUserId,
  messages,
  messagesLoading,
  messageInput,
  setMessageInput,
  onSendMessage,
  sendPending,
  onBackMobile,
  errorBanner,
  messagesEndRef,
}: {
  currentConv?: Conversation;
  currentUserId: string;
  messages: Message[];
  messagesLoading: boolean;
  messageInput: string;
  setMessageInput: (v: string) => void;
  onSendMessage: () => void;
  sendPending: boolean;
  onBackMobile?: () => void;
  errorBanner: React.ReactNode;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  // Group messages by date
  const grouped = useMemo(() => {
    const groups: { date: string; messages: Message[] }[] = [];
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      const last = groups[groups.length - 1];
      if (last && last.date === date) {
        last.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  if (!currentConv) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <MessageCircle
          size={28}
          strokeWidth={1.2}
          className="text-neutral-700 mb-3"
        />
        <p className="text-sm text-neutral-500 mb-1">Select a conversation</p>
        <p className="text-xs text-neutral-700">
          Choose from the list or start a new one
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="h-[48px] flex items-center gap-3 px-4 border-b border-[#1a1a1a] flex-shrink-0">
        {onBackMobile && (
          <button
            onClick={onBackMobile}
            className="lg:hidden text-neutral-500 hover:text-neutral-300 transition-colors mr-1"
          >
            <ArrowLeft size={15} strokeWidth={2} />
          </button>
        )}
        <Avatar name={currentConv.participant?.full_name} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">
            {currentConv.participant?.full_name || "Unknown"}
          </p>
          <p className="text-[10px] text-neutral-600 truncate">
            {currentConv.participant?.email}
          </p>
        </div>
      </div>

      {errorBanner}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 [scrollbar-width:thin] [scrollbar-color:#1f1f1f_transparent]">
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-neutral-700" size={20} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <p className="text-xs text-neutral-600">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#1a1a1a]" />
                <span className="text-[10px] text-neutral-700 flex-shrink-0">
                  {group.date}
                </span>
                <div className="flex-1 h-px bg-[#1a1a1a]" />
              </div>

              {/* Messages in group */}
              <div className="space-y-1">
                {group.messages.map((msg, idx) => {
                  const isOwn = msg.sender_id === currentUserId;
                  const prevMsg = group.messages[idx - 1];
                  const showAvatar =
                    !isOwn &&
                    (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${
                        isOwn ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar placeholder to keep alignment */}
                      {!isOwn && (
                        <div className="w-6 flex-shrink-0">
                          {showAvatar && (
                            <Avatar
                              name={currentConv.participant?.full_name}
                              size="sm"
                            />
                          )}
                        </div>
                      )}

                      <div
                        className={`max-w-[72%] flex flex-col ${
                          isOwn ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`px-3 py-2 text-sm leading-relaxed break-words ${
                            isOwn
                              ? "bg-white text-[#0a0a0a]"
                              : "bg-[#161616] border border-[#272727] text-neutral-200"
                          } ${msg.isTemp ? "opacity-60" : ""}`}
                        >
                          {msg.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-0.5">
                          <span className="text-[10px] text-neutral-700">
                            {formatTime(msg.created_at)}
                          </span>
                          {isOwn && !msg.isTemp && (
                            <CheckCheck
                              size={11}
                              strokeWidth={1.5}
                              className="text-neutral-700"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-[#1a1a1a] px-4 py-3">
        <div className="flex items-end gap-3">
          <textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            rows={1}
            className="flex-1 bg-[#161616] border border-[#272727] text-sm text-neutral-200 placeholder-neutral-700 px-3 py-2.5 focus:outline-none focus:border-[#3a3a3a] transition-colors resize-none max-h-32 overflow-y-auto [scrollbar-width:thin]"
            style={{ lineHeight: "1.5" }}
          />
          <button
            onClick={onSendMessage}
            disabled={!messageInput.trim() || sendPending}
            className="w-9 h-9 flex items-center justify-center bg-white text-[#0a0a0a] hover:bg-neutral-100 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {sendPending ? (
              <Loader className="animate-spin" size={14} />
            ) : (
              <Send size={14} strokeWidth={2} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-neutral-700 mt-1.5">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

// ─── Main app ─────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Sidebar width sync ────────────────────────────────────────────────────
  // Reads the collapsed state from localStorage (set by LeftSidebar) and
  // recalculates the left margin whenever it changes — so the messages layout
  // always starts exactly where the sidebar ends, whether expanded or collapsed.

  const getSidebarWidth = () => {
    if (typeof window === "undefined") return 288;
    try {
      const collapsed = localStorage.getItem("sml_sidebar_collapsed") === "true";
      return collapsed ? 64 : 288;
    } catch {
      return 288;
    }
  };

  const [sidebarWidth, setSidebarWidth] = useState<number>(288);

  useEffect(() => {
    // Set correct width on mount (after localStorage is available)
    setSidebarWidth(getSidebarWidth());

    // Listen for storage changes triggered by the sidebar toggle
    const onStorage = (e: StorageEvent) => {
      if (e.key === "sml_sidebar_collapsed") {
        setSidebarWidth(e.newValue === "true" ? 64 : 288);
      }
    };

    // Also poll every 200ms for same-tab changes (storage event only fires
    // in OTHER tabs; same-tab changes need a custom event or polling)
    const interval = setInterval(() => {
      setSidebarWidth(getSidebarWidth());
    }, 200);

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  }, []);

  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [view, setView] = useState<"conversations" | "newChat" | "chat">(
    "conversations"
  );
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });

        // Non-200 that isn't specifically a 401 — API might be slow/erroring,
        // don't redirect, just leave currentUserId as null and let queries stay disabled
        if (!res.ok) {
          if (res.status === 401) router.push("/auth/login");
          return;
        }

        const data = await res.json();

        if (data.authenticated && (data.user?.id || data.id)) {
          // Support both response shapes: { user: { id } } and { id }
          setCurrentUserId(data.user?.id ?? data.id);
        } else if (data.authenticated === false) {
          // Explicitly told we're not authenticated
          router.push("/auth/login");
        }
        // If authenticated is undefined (unexpected shape) — do nothing,
        // avoid false redirects
      } catch (e) {
        // Network error — don't redirect, user may just have slow connection
        console.error("Auth check failed:", e);
      }
    };
    fetchUser();
  }, [router]);

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchInterval: 15000,
    enabled: !!currentUserId,
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: () => fetchMessages(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 5000,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
    enabled: view === "newChat",
    staleTime: 5 * 60 * 1000,
  });

  const conversations = conversationsData?.conversations || [];
  const messages = messagesData?.messages || [];
  const allUsers = usersData?.users || [];

  // ── Filter users ───────────────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase();
    if (!query) return allUsers.slice(0, 20);
    return allUsers
      .filter((u) => {
        const name = (u.full_name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const bio = (u.bio || "").toLowerCase();
        return (
          name.includes(query) || email.includes(query) || bio.includes(query)
        );
      })
      .slice(0, 20);
  }, [allUsers, debouncedSearchQuery]);

  const isTyping =
    searchQuery !== debouncedSearchQuery && searchQuery.length >= 2;

  const currentConv = conversations.find((c) => c.id === selectedConversation);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Mutations ──────────────────────────────────────────────────────────────

  const sendMessageMutation = useMutation({
    mutationFn: sendMessage,
    onMutate: async ({ content }) => {
      const tempMessage: Message = {
        id: "temp-" + Date.now(),
        content,
        created_at: new Date().toISOString(),
        sender_id: currentUserId || "",
        profiles: { full_name: "You", email: "you" },
        isTemp: true,
      };
      await queryClient.cancelQueries({
        queryKey: ["messages", selectedConversation],
      });
      const previousMessages = queryClient.getQueryData<{
        messages: Message[];
      }>(["messages", selectedConversation]);
      queryClient.setQueryData<{ messages: Message[] }>(
        ["messages", selectedConversation],
        (old) => ({ messages: [...(old?.messages || []), tempMessage] })
      );
      return { previousMessages, tempMessage };
    },
    onSuccess: (data, _variables, context) => {
      queryClient.setQueryData<{ messages: Message[] }>(
        ["messages", selectedConversation],
        (old) => ({
          messages: [
            ...(old?.messages.filter((m) => m.id !== context?.tempMessage.id) ||
              []),
            data.message,
          ],
        })
      );
      refetchConversations();
    },
    onError: (_err, _variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", selectedConversation],
          context.previousMessages
        );
      }
      setError("Failed to send message");
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: async (data) => {
      setSelectedConversation(data.conversationId);
      await refetchConversations();
      setView("chat");
      setSearchQuery("");
      setError(null);
    },
    onError: () => setError("Failed to create conversation"),
  });

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput.trim(),
    });
    setMessageInput("");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      router.push("/");
    } catch (e) {
      console.error(e);
    }
  };

  const errorBannerNode = (
    <ErrorBanner
      error={error}
      conversationsError={conversationsError}
      usersError={usersError}
      onClose={() => setError(null)}
    />
  );

  // ── Loading state ──────────────────────────────────────────────────────────

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader className="animate-spin text-neutral-700" size={22} />
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen bg-[#0a0a0a] text-neutral-200 overflow-hidden">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* ── Mobile layout ── */}
      <div className="lg:hidden flex flex-col h-screen pt-14 overflow-hidden">
        {view === "conversations" && (
          <ConversationsList
            conversations={conversations}
            loading={conversationsLoading}
            selected={selectedConversation}
            onSelect={(id) => {
              setSelectedConversation(id);
              setView("chat");
              setError(null);
            }}
            onNewChat={() => {
              setView("newChat");
              setError(null);
            }}
            errorBanner={errorBannerNode}
          />
        )}
        {view === "newChat" && (
          <NewChatView
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            debouncedQuery={debouncedSearchQuery}
            isTyping={isTyping}
            usersLoading={usersLoading}
            filteredUsers={filteredUsers}
            onBack={() => {
              setView("conversations");
              setSearchQuery("");
              setError(null);
            }}
            onCreateConversation={(id) =>
              createConversationMutation.mutate(id)
            }
            createPending={createConversationMutation.isPending}
            errorBanner={errorBannerNode}
          />
        )}
        {view === "chat" && (
          <ChatView
            currentConv={currentConv}
            currentUserId={currentUserId}
            messages={messages}
            messagesLoading={messagesLoading}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            sendPending={sendMessageMutation.isPending}
            onBackMobile={() => {
              setView("conversations");
              setSelectedConversation(null);
              setError(null);
            }}
            errorBanner={errorBannerNode}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      {/* ── Desktop layout ── */}
      <div style={{ marginLeft: `${sidebarWidth}px`, transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)" }} className="hidden lg:flex h-screen overflow-hidden">
        {/* Conversation / new-chat panel */}
        <div className="w-72 flex-shrink-0 border-r border-[#1a1a1a] flex flex-col overflow-hidden">
          {view === "newChat" ? (
            <NewChatView
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              debouncedQuery={debouncedSearchQuery}
              isTyping={isTyping}
              usersLoading={usersLoading}
              filteredUsers={filteredUsers}
              onBack={() => {
                setView("conversations");
                setSearchQuery("");
                setError(null);
              }}
              onCreateConversation={(id) =>
                createConversationMutation.mutate(id)
              }
              createPending={createConversationMutation.isPending}
              errorBanner={errorBannerNode}
            />
          ) : (
            <ConversationsList
              conversations={conversations}
              loading={conversationsLoading}
              selected={selectedConversation}
              onSelect={(id) => {
                setSelectedConversation(id);
                setView("chat");
                setError(null);
              }}
              onNewChat={() => {
                setView("newChat");
                setError(null);
              }}
              errorBanner={errorBannerNode}
            />
          )}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatView
            currentConv={currentConv}
            currentUserId={currentUserId}
            messages={messages}
            messagesLoading={messagesLoading}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
            sendPending={sendMessageMutation.isPending}
            errorBanner={errorBannerNode}
            messagesEndRef={messagesEndRef}
          />
        </div>
      </div>
    </div>
  );
}