"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpen,
  MessageCircle,
  Users,
  TrendingUp,
  Home,
  Bookmark,
  PenTool,
  User,
  Compass,
  Loader,
  LogOut,
  Settings,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

interface UserProfile {
  id: string;
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
  href: string; // Add href for routing
}

interface LeftSidebarProps {
  onSignOut: () => void;
}

export default function LeftSidebar({ onSignOut }: LeftSidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: "feed",
      label: "Home",
      icon: <Home size={20} strokeWidth={1.5} />,
      href: "/dashboard",
    },
    {
      id: "discover",
      label: "Discover",
      icon: <Compass size={20} strokeWidth={1.5} />,
      href: "/dashboard/discover",
    },
    {
      id: "trending",
      label: "Trending",
      icon: <TrendingUp size={20} strokeWidth={1.5} />,
      href: "/dashboard/trending",
    },
    {
      id: "lists",
      label: "Reading Lists",
      icon: <Bookmark size={20} strokeWidth={1.5} />,
      href: "/dashboard/lists",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageCircle size={20} strokeWidth={1.5} />,
      href: "/dashboard/messages",
      badge: 2,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={20} strokeWidth={1.5} />,
      href: "/dashboard/profile",
    },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);

      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();

        if (!data.authenticated) {
          setUser(null);
          setLoadingUser(false);
          return;
        }

        const username = data.username || data.email.split("@")[0];

        let avatar = "";
        if (data.full_name) {
          const nameParts = data.full_name.split(" ");
          avatar =
            nameParts.length > 1
              ? `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
              : data.full_name.substring(0, 2).toUpperCase();
        } else {
          avatar = data.email.substring(0, 2).toUpperCase();
        }

        const userData: UserProfile = {
          id: data.id,
          name: data.full_name,
          username: username,
          avatar: avatar,
          email: data.email,
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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-neutral-900 border-r border-neutral-800 p-6 overflow-y-auto">
      <div className="mb-8">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <h1 className="text-xl font-serif text-neutral-300">
            Scriptum Mens Lumen
          </h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive(item.href)
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-300"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto bg-neutral-700 text-neutral-300 text-xs rounded-full w-6 h-6 flex items-center justify-center font-medium">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Write Review Button */}
      <button
        onClick={() => router.push("/dashboard/posts")}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-100 px-6 py-3 rounded-lg font-medium transition flex items-center justify-center space-x-2 border border-neutral-700"
      >
        <PenTool size={18} strokeWidth={1.5} />
        <span>Write Review</span>
      </button>

      <div className="mt-8 pt-2 border-t border-neutral-800">
        {loadingUser ? (
          <div className="flex items-center justify-center py-4">
            <Loader className="animate-spin text-neutral-600" size={20} />
          </div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-neutral-800/50 transition cursor-pointer"
            >
              <div className="w-10 h-10 bg-neutral-800 border border-neutral-700 rounded-full flex items-center justify-center text-neutral-400 font-medium text-sm">
                {user.avatar}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-neutral-300">
                  {user.name}
                </p>
                <p className="text-xs text-neutral-500">@{user.username}</p>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-neutral-700">
                  <p className="text-xs text-neutral-500">Signed in as</p>
                  <p className="text-sm text-neutral-300 truncate">
                    {user.email}
                  </p>
                </div>
                <button className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-300 hover:bg-neutral-700 transition text-left">
                  <Settings size={16} strokeWidth={1.5} />
                  <span className="text-sm">Settings</span>
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-neutral-400 hover:bg-neutral-700 hover:text-red-400 transition text-left"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-neutral-500 mb-3">Not signed in</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition border border-neutral-700"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
