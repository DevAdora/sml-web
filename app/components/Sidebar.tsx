"use client";

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  TrendingUp,
  Home,
  Bookmark,
  PenTool,
  User,
  Compass,
  Loader,
  LogOut,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { UserProfile, NavItem } from "@/app/types/types";

interface LeftSidebarProps {
  onSignOut: () => void;
}

export default function LeftSidebar({ onSignOut }: LeftSidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
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
          full_name: data.full_name,
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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-8">
          <h1 className="text-xl font-serif text-neutral-300">
            Scriptum Mens Lumen
          </h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
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

      <button
        onClick={() => handleNavClick("/dashboard/posts")}
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
    </>
  );

  return (
    <>
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-72 bg-neutral-900 border-r border-neutral-800 p-6 overflow-y-auto z-40">
        <SidebarContent />
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800 z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center space-x-2 text-neutral-300 hover:text-neutral-100 transition"
          aria-label="Open menu"
        >
          <Menu size={24} strokeWidth={1.5} />
          <span className="font-medium">Menu</span>
        </button>

        <h1 className="text-sm font-serif text-neutral-400">
          Scriptum Mens Lumen
        </h1>
      </header>

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
        className={`lg:hidden h-full fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 rounded-t-3xl z-[70] transition-transform duration-300 ease-out ${
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
