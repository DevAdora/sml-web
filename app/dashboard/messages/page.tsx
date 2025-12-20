"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageCircle,
  Search,
  Send,
  UserPlus,
  ArrowLeft,
  CheckCheck,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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

// API Functions
const fetchConversations = async (): Promise<{
  conversations: Conversation[];
}> => {
  const response = await fetch("/api/messages/conversations");
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Failed to fetch conversations");
  }
  return response.json();
};

const fetchMessages = async (
  conversationId: string
): Promise<{ messages: Message[] }> => {
  const response = await fetch(`/api/messages/${conversationId}`);
  if (!response.ok) throw new Error("Failed to fetch messages");
  return response.json();
};

const fetchAllUsers = async (): Promise<{ users: User[] }> => {
  const response = await fetch(`/api/messages/users?all=true`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch users");
  }
  return response.json();
};

const sendMessage = async ({
  conversationId,
  content,
}: {
  conversationId: string;
  content: string;
}): Promise<{ message: Message }> => {
  const response = await fetch(`/api/messages/${conversationId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error("Failed to send message");
  return response.json();
};

const createConversation = async (
  participantId: string
): Promise<{ conversationId: string; existed: boolean }> => {
  const response = await fetch("/api/messages/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ participantId }),
  });
  if (!response.ok) throw new Error("Failed to create conversation");
  return response.json();
};

export default function MessagingApp() {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"conversations" | "newChat" | "chat">(
    "conversations"
  );
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search query - 1.5 seconds for more stability
  const debouncedSearchQuery = useDebounce(searchQuery, 1500);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/user");
        const data = await response.json();
        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      } catch (err) {
        console.error("Error getting user:", err);
      }
    };
    getCurrentUser();
  }, []);

  // Fetch conversations
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
    refetchInterval: 10000,
    enabled: !!currentUserId,
    retry: 1,
  });

  const conversations = conversationsData?.conversations || [];

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedConversation],
    queryFn: () => fetchMessages(selectedConversation!),
    enabled: !!selectedConversation,
    refetchInterval: 3000,
  });

  const messages = messagesData?.messages || [];

  // Fetch ALL users ONCE when opening new chat
  const {
    data: allUsersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["allUsers"],
    queryFn: fetchAllUsers,
    enabled: view === "newChat",
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const allUsers = allUsersData?.users || [];

  // ONLY filter using DEBOUNCED value - this prevents re-filtering on every keystroke
  const filteredUsers = useMemo(() => {
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      return allUsers.slice(0, 10); // Show top 10 when no search
    }

    const query = debouncedSearchQuery.toLowerCase().trim();

    return allUsers
      .filter((user) => {
        const fullName = user.full_name?.toLowerCase() || "";
        const email = user.email?.toLowerCase() || "";
        const bio = user.bio?.toLowerCase() || "";

        return (
          fullName.includes(query) ||
          email.includes(query) ||
          bio.includes(query)
        );
      })
      .slice(0, 20);
  }, [allUsers, debouncedSearchQuery]); // Only depends on debounced value!

  // Check if still typing
  const isTyping =
    searchQuery !== debouncedSearchQuery && searchQuery.length >= 2;

  // Send message mutation
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
        (old) => ({
          messages: [...(old?.messages || []), tempMessage],
        })
      );

      return { previousMessages, tempMessage };
    },
    onSuccess: (data, variables, context) => {
      queryClient.setQueryData<{ messages: Message[] }>(
        ["messages", selectedConversation],
        (old) => ({
          messages: [
            ...(old?.messages.filter((m) => m.id !== context.tempMessage.id) ||
              []),
            data.message,
          ],
        })
      );
      refetchConversations();
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ["messages", selectedConversation],
          context.previousMessages
        );
      }
      setError("Failed to send message");
    },
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: async (data) => {
      setSelectedConversation(data.conversationId);
      await refetchConversations();
      setView("chat");
      setSearchQuery("");
    },
    onError: (err) => {
      setError("Failed to create conversation");
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper functions
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput.trim(),
    });
    setMessageInput("");
  };

  const handleCreateConversation = (participantId: string) => {
    createConversationMutation.mutate(participantId);
  };

  const currentConv = conversations.find((c) => c.id === selectedConversation);

  // Error Banner Component
  const ErrorBanner = () => {
    if (!error && !conversationsError && !usersError) return null;
    const displayError =
      error ||
      (conversationsError as Error)?.message ||
      (usersError as Error)?.message;

    return (
      <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertCircle size={18} className="text-red-400" />
          <p className="text-sm text-red-300">{displayError}</p>
        </div>
        <button
          onClick={() => setError(null)}
          className="text-red-400 hover:text-red-300"
          aria-label="Close error"
        >
          <X size={18} />
        </button>
      </div>
    );
  };

  // Conversations List View
  const ConversationsList = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-neutral-100">Messages</h1>
          <button
            onClick={() => setView("newChat")}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            aria-label="New message"
          >
            <UserPlus size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ErrorBanner />
        {conversationsLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={32} className="text-neutral-500 animate-spin" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <MessageCircle size={48} className="text-neutral-700 mb-4" />
            <h3 className="text-lg font-semibold text-neutral-300 mb-2">
              No conversations yet
            </h3>
            <p className="text-neutral-500 mb-4">
              Start a new conversation to get started
            </p>
            <button
              onClick={() => setView("newChat")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <UserPlus size={18} className="inline mr-2" />
              New Message
            </button>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => {
                setSelectedConversation(conversation.id);
                setView("chat");
                setError(null);
              }}
              className={`w-full p-4 flex items-center space-x-3 border-b border-neutral-800 hover:bg-neutral-800/50 transition ${
                selectedConversation === conversation.id ? "bg-neutral-800" : ""
              }`}
            >
              <div className="flex-shrink-0 relative">
                {conversation.participant?.avatar_url ? (
                  <img
                    src={conversation.participant.avatar_url}
                    alt={conversation.participant.full_name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 text-sm font-medium">
                    {getInitials(conversation.participant?.full_name)}
                  </div>
                )}
                {conversation.unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {conversation.unreadCount > 9
                      ? "9+"
                      : conversation.unreadCount}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3
                    className={`font-medium text-sm truncate ${
                      conversation.unreadCount > 0
                        ? "text-neutral-100"
                        : "text-neutral-300"
                    }`}
                  >
                    {conversation.participant?.full_name || "Unknown User"}
                  </h3>
                  <span className="text-xs text-neutral-500 ml-2 flex-shrink-0">
                    {formatMessageTime(conversation.lastMessageTime)}
                  </span>
                </div>
                <p
                  className={`text-xs truncate ${
                    conversation.unreadCount > 0
                      ? "text-neutral-400 font-medium"
                      : "text-neutral-500"
                  }`}
                >
                  {conversation.lastMessage || "No messages yet"}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );

  // New Chat View
  const NewChatView = () => {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-neutral-800 flex-shrink-0">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => {
                setView("conversations");
                setSearchQuery("");
                setError(null);
              }}
              className="p-2 hover:bg-neutral-800 rounded-lg transition"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} className="text-neutral-400" />
            </button>
            <h2 className="text-lg font-semibold text-neutral-200">
              New Message
            </h2>
          </div>

          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-10 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-blue-600 text-neutral-200 placeholder-neutral-500"
              autoFocus
            />
            {isTyping && (
              <Loader2
                size={18}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500 animate-spin"
              />
            )}
          </div>

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-xs text-neutral-500 mt-2">
              Type at least 2 characters to search
            </p>
          )}

          {!isTyping && debouncedSearchQuery.length >= 2 && (
            <p className="text-xs text-neutral-500 mt-2">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}{" "}
              found
            </p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <ErrorBanner />
          {usersLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="text-neutral-500 animate-spin" />
            </div>
          ) : filteredUsers.length === 0 && debouncedSearchQuery.length >= 2 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <Search size={48} className="text-neutral-700 mb-4" />
              <p className="text-neutral-500">
                No users found matching "{debouncedSearchQuery}"
              </p>
            </div>
          ) : (
            <>
              {(!debouncedSearchQuery || debouncedSearchQuery.length < 2) && (
                <div className="p-3 bg-neutral-800/50 border-b border-neutral-700">
                  <p className="text-xs text-neutral-400">Suggested users</p>
                </div>
              )}
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleCreateConversation(user.id)}
                  className="w-full p-4 flex items-center space-x-3 border-b border-neutral-800 hover:bg-neutral-800/50 transition"
                  disabled={createConversationMutation.isPending}
                >
                  <div className="flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name || "User"}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 text-sm font-medium">
                        {getInitials(user.full_name)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-medium text-neutral-200 text-sm">
                      {user.full_name || user.email}
                    </h3>
                    <p className="text-xs text-neutral-500">{user.email}</p>
                    {user.bio && (
                      <p className="text-xs text-neutral-600 mt-1 truncate">
                        {user.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  // Chat View
  const ChatView = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setView("conversations");
              setSelectedConversation(null);
              setError(null);
            }}
            className="p-2 hover:bg-neutral-800 rounded-lg transition lg:hidden"
            aria-label="Back to conversations"
          >
            <ArrowLeft size={20} className="text-neutral-400" />
          </button>
          {currentConv && (
            <>
              <div className="flex-shrink-0">
                {currentConv.participant?.avatar_url ? (
                  <img
                    src={currentConv.participant.avatar_url}
                    alt={currentConv.participant.full_name || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center text-neutral-400 text-sm font-medium">
                    {getInitials(currentConv.participant?.full_name)}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-semibold text-neutral-200 text-sm sm:text-base">
                  {currentConv.participant?.full_name || "Unknown User"}
                </h2>
                <p className="text-xs text-neutral-500">
                  {currentConv.participant?.email || "unknown"}
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <ErrorBanner />
        <div className="space-y-4">
          {messagesLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 size={32} className="text-neutral-500 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle size={48} className="text-neutral-700 mb-4" />
              <p className="text-neutral-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-md ${
                      isOwn ? "order-2" : "order-1"
                    }`}
                  >
                    {!isOwn && (
                      <p className="text-xs text-neutral-500 mb-1 ml-1">
                        {message.profiles?.full_name || "Unknown"}
                      </p>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        message.isTemp
                          ? "bg-blue-600/50 text-white opacity-70"
                          : isOwn
                          ? "bg-blue-600 text-white"
                          : "bg-neutral-800 text-neutral-200"
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">
                        {message.content}
                      </p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <p
                          className={`text-xs ${
                            isOwn ? "text-blue-200" : "text-neutral-500"
                          }`}
                        >
                          {formatMessageTime(message.created_at)}
                        </p>
                        {isOwn && !message.isTemp && (
                          <CheckCheck size={14} className="text-blue-200" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="p-4 border-t border-neutral-800 flex-shrink-0">
        <div className="flex items-end space-x-2">
          <div className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type a message..."
              rows={1}
              disabled={sendMessageMutation.isPending}
              className="w-full px-4 py-3 bg-transparent focus:outline-none text-neutral-200 placeholder-neutral-500 resize-none disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {sendMessageMutation.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
        <p className="text-xs text-neutral-600 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );

  if (!currentUserId) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-200 flex items-center justify-center">
        <div className="text-center">
          <Loader2
            size={48}
            className="text-neutral-500 mx-auto mb-4 animate-spin"
          />
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <div className="lg:hidden h-screen">
        {view === "conversations" && <ConversationsList />}
        {view === "newChat" && <NewChatView />}
        {view === "chat" && <ChatView />}
      </div>

      <div className="hidden lg:flex h-screen">
        <div className="w-96 border-r border-neutral-800">
          {view === "newChat" ? <NewChatView /> : <ConversationsList />}
        </div>

        <div className="flex-1">
          {selectedConversation ? (
            <ChatView />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <MessageCircle size={64} className="text-neutral-700 mb-4" />
              <h3 className="text-xl font-semibold text-neutral-300 mb-2">
                Select a conversation
              </h3>
              <p className="text-neutral-500">
                Choose a conversation from the list or start a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
