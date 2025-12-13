"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  Archive,
  Trash2,
  Star,
  BookOpen,
} from "lucide-react";
import LeftSidebar from "@/app/components/Sidebar";

interface Conversation {
  id: number;
  user: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  unreadCount?: number;
  online: boolean;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number>(1);
  const [messageInput, setMessageInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const conversations: Conversation[] = [
    {
      id: 1,
      user: "Sarah Mitchell",
      avatar: "SM",
      lastMessage:
        "I just finished reading 'The Midnight Library'! We need to discuss this.",
      timestamp: "5m ago",
      unread: true,
      unreadCount: 2,
      online: true,
    },
    {
      id: 2,
      user: "James Chen",
      avatar: "JC",
      lastMessage: "Thanks for the Murakami recommendation!",
      timestamp: "2h ago",
      unread: true,
      unreadCount: 1,
      online: true,
    },
    {
      id: 3,
      user: "Book Club: Classics",
      avatar: "BC",
      lastMessage: "Next meeting is on Friday at 7 PM",
      timestamp: "1d ago",
      unread: false,
      online: false,
    },
    {
      id: 4,
      user: "Emma Thompson",
      avatar: "ET",
      lastMessage: "Have you read any good mysteries lately?",
      timestamp: "2d ago",
      unread: false,
      online: false,
    },
    {
      id: 5,
      user: "Detective Dana",
      avatar: "DD",
      lastMessage: "Check out my new list of mystery novels!",
      timestamp: "3d ago",
      unread: false,
      online: true,
    },
    {
      id: 6,
      user: "Literary Lou",
      avatar: "LL",
      lastMessage: "Your review on Dostoevsky was brilliant",
      timestamp: "5d ago",
      unread: false,
      online: false,
    },
    {
      id: 7,
      user: "BookWorm Betty",
      avatar: "BB",
      lastMessage: "Want to join our reading challenge?",
      timestamp: "1w ago",
      unread: false,
      online: false,
    },
  ];

  const messageHistory: Record<number, Message[]> = {
    1: [
      {
        id: 1,
        sender: "Sarah Mitchell",
        content: "Hey! Did you get a chance to read that book I recommended?",
        timestamp: "10:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        content: "Yes! I just finished it last night. It was incredible!",
        timestamp: "10:32 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Sarah Mitchell",
        content:
          "Right?! The ending completely blew my mind. I didn't see it coming at all.",
        timestamp: "10:33 AM",
        isOwn: false,
      },
      {
        id: 4,
        sender: "You",
        content:
          "Same here! The way the author built up the tension throughout was masterful.",
        timestamp: "10:35 AM",
        isOwn: true,
      },
      {
        id: 5,
        sender: "Sarah Mitchell",
        content:
          "I just finished reading 'The Midnight Library'! We need to discuss this.",
        timestamp: "Just now",
        isOwn: false,
      },
    ],
    2: [
      {
        id: 1,
        sender: "James Chen",
        content: "Hey! I saw your review on Murakami's latest book.",
        timestamp: "Yesterday",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        content: "Oh yeah? What did you think?",
        timestamp: "Yesterday",
        isOwn: true,
      },
      {
        id: 3,
        sender: "James Chen",
        content: "Thanks for the Murakami recommendation!",
        timestamp: "2h ago",
        isOwn: false,
      },
    ],
    3: [
      {
        id: 1,
        sender: "Book Club: Classics",
        content: "Welcome to the Classics Book Club!",
        timestamp: "Last week",
        isOwn: false,
      },
      {
        id: 2,
        sender: "Book Club: Classics",
        content: "Next meeting is on Friday at 7 PM",
        timestamp: "1d ago",
        isOwn: false,
      },
    ],
  };

  const currentMessages = messageHistory[selectedConversation] || [];
  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput);
      setMessageInput("");
    }
  };

  const handleSignOut = () => {
    console.log("User signed out");
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <LeftSidebar onSignOut={handleSignOut} />

      {/* Main Content */}
      <main className="ml-72 min-h-screen flex">
        {/* Conversations List */}
        <div className="w-96 bg-neutral-900 border-r border-neutral-800 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-neutral-800">
            <h1 className="text-2xl font-serif text-neutral-200 flex items-center mb-4">
              <MessageCircle
                className="mr-3 text-neutral-400"
                size={28}
                strokeWidth={1.5}
              />
              Messages
            </h1>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500"
                size={18}
                strokeWidth={1.5}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-600 text-neutral-200 placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 flex items-start space-x-3 border-b border-neutral-800 hover:bg-neutral-800/50 transition text-left ${
                  selectedConversation === conv.id ? "bg-neutral-800" : ""
                }`}
              >
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-sm font-medium">
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-neutral-200 text-sm truncate">
                      {conv.user}
                    </h3>
                    <span className="text-xs text-neutral-600 flex-shrink-0 ml-2">
                      {conv.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p
                      className={`text-sm truncate ${
                        conv.unread
                          ? "text-neutral-300 font-medium"
                          : "text-neutral-500"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                    {conv.unread && conv.unreadCount && (
                      <span className="ml-2 bg-neutral-700 text-neutral-300 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-neutral-950">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="h-20 px-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-sm font-medium">
                      {currentConversation.avatar}
                    </div>
                    {currentConversation.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-neutral-900 rounded-full"></span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-neutral-200">
                      {currentConversation.user}
                    </h2>
                    <p className="text-xs text-neutral-500">
                      {currentConversation.online ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
                    <Phone size={20} strokeWidth={1.5} />
                  </button>
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
                    <Video size={20} strokeWidth={1.5} />
                  </button>
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
                    <Info size={20} strokeWidth={1.5} />
                  </button>
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition">
                    <MoreVertical size={20} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {currentMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-md ${
                        message.isOwn ? "order-2" : "order-1"
                      }`}
                    >
                      {!message.isOwn && (
                        <p className="text-xs text-neutral-500 mb-1 ml-1">
                          {message.sender}
                        </p>
                      )}
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.isOwn
                            ? "bg-neutral-800 text-neutral-200"
                            : "bg-neutral-800/50 text-neutral-300"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">
                          {message.content}
                        </p>
                        <p className="text-xs text-neutral-600 mt-1">
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900/50 backdrop-blur-sm">
                <div className="flex items-end space-x-3">
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition mb-2">
                    <Paperclip size={20} strokeWidth={1.5} />
                  </button>
                  <div className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg overflow-hidden">
                    <textarea
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-3 bg-transparent focus:outline-none text-neutral-200 placeholder-neutral-500 resize-none"
                    />
                  </div>
                  <button className="p-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition mb-2">
                    <Smile size={20} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="p-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-2 border border-neutral-700"
                  >
                    <Send size={20} strokeWidth={1.5} />
                  </button>
                </div>
                <p className="text-xs text-neutral-600 mt-2 ml-1">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle
                  className="mx-auto text-neutral-700 mb-4"
                  size={64}
                  strokeWidth={1}
                />
                <h3 className="text-xl font-serif text-neutral-300 mb-2">
                  No conversation selected
                </h3>
                <p className="text-neutral-500">
                  Choose a conversation from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Conversation Info (Optional) */}
        <div className="w-80 bg-neutral-900 border-l border-neutral-800 p-6 hidden xl:block">
          {currentConversation && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 text-xl font-medium mx-auto mb-3">
                  {currentConversation.avatar}
                </div>
                <h3 className="font-semibold text-neutral-200 mb-1">
                  {currentConversation.user}
                </h3>
                <p className="text-sm text-neutral-500">
                  {currentConversation.online ? "Active now" : "Offline"}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition text-left">
                  <BookOpen
                    size={18}
                    strokeWidth={1.5}
                    className="text-neutral-400"
                  />
                  <span className="text-sm text-neutral-300">View Profile</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition text-left">
                  <Star
                    size={18}
                    strokeWidth={1.5}
                    className="text-neutral-400"
                  />
                  <span className="text-sm text-neutral-300">
                    Star Conversation
                  </span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-neutral-800/50 hover:bg-neutral-800 rounded-lg transition text-left">
                  <Archive
                    size={18}
                    strokeWidth={1.5}
                    className="text-neutral-400"
                  />
                  <span className="text-sm text-neutral-300">Archive Chat</span>
                </button>
                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-neutral-800/50 hover:bg-red-900/20 rounded-lg transition text-left">
                  <Trash2
                    size={18}
                    strokeWidth={1.5}
                    className="text-red-400"
                  />
                  <span className="text-sm text-red-400">
                    Delete Conversation
                  </span>
                </button>
              </div>

              {/* Shared Content */}
              <div>
                <h4 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                  Shared Content
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">
                      Shared Lists
                    </p>
                    <p className="text-sm text-neutral-300">2 reading lists</p>
                  </div>
                  <div className="p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-xs text-neutral-500 mb-1">
                      Book Recommendations
                    </p>
                    <p className="text-sm text-neutral-300">5 books</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
