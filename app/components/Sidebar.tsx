"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { UserProfile, NavItem } from "@/app/types/types";

interface LeftSidebarProps {
  onSignOut: () => void;
}

const SIDEBAR_COLLAPSED_KEY = "sml_sidebar_collapsed";

export default function LeftSidebar({ onSignOut }: LeftSidebarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Desktop collapse state — persisted in localStorage
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: "feed",
      label: "Home",
      icon: <Home size={18} strokeWidth={1.5} />,
      href: "/dashboard",
    },
    {
      id: "discover",
      label: "Discover",
      icon: <Compass size={18} strokeWidth={1.5} />,
      href: "/dashboard/discover",
    },
    {
      id: "trending",
      label: "Trending",
      icon: <TrendingUp size={18} strokeWidth={1.5} />,
      href: "/dashboard/trending",
    },
    {
      id: "lists",
      label: "Reading Lists",
      icon: <Bookmark size={18} strokeWidth={1.5} />,
      href: "/dashboard/lists",
    },
    {
      id: "messages",
      label: "Messages",
      icon: <MessageCircle size={18} strokeWidth={1.5} />,
      href: "/dashboard/messages",
      badge: 2,
    },
    {
      id: "profile",
      label: "Profile",
      icon: <User size={18} strokeWidth={1.5} />,
      href: "/dashboard/profile",
    },
  ];

  // Restore collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") setCollapsed(true);
    setMounted(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      // Close user menu when collapsing
      if (next) setShowUserMenu(false);
      return next;
    });
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoadingUser(true);
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch user profile");
        const data = await response.json();
        if (!data.authenticated) {
          setUser(null);
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
        setUser({
          id: data.id,
          name: data.full_name,
          username,
          avatar,
          email: data.email,
          full_name: data.full_name,
        });
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
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    if (!showUserMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-user-menu]")) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href.startsWith("/dashboard/profile"))
      return pathname?.startsWith("/dashboard/profile");
    return pathname?.startsWith(href);
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };


  const DesktopSidebar = () => (
    <aside
      className={`
        hidden lg:flex flex-col fixed left-0 top-0 h-screen
        bg-[#0a0a0a] border-r border-[#1a1a1a] z-40 overflow-hidden
        transition-all duration-300 ease-in-out
        ${mounted ? (collapsed ? "w-[64px]" : "w-[300px]") : "w-[300px]"}
      `}
    >
      <div
        className={`
          flex items-center border-b border-[#1a1a1a] flex-shrink-0
          ${collapsed ? "justify-center px-0 py-4 h-14" : "justify-between px-5 py-4 h-14"}
        `}
      >
        {!collapsed && (
          <span className="text-sm font-semibold text-white tracking-tight truncate">
            Scriptum Mens Lumen
          </span>
        )}
        <button
          onClick={toggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`
            flex items-center justify-center w-7 h-7 
            text-neutral-600 hover:text-neutral-300
            hover:bg-[#1a1a1a] transition-all flex-shrink-0
            ${collapsed ? "" : ""}
          `}
        >
          {collapsed ? (
            <ChevronRight size={14} strokeWidth={2} />
          ) : (
            <ChevronLeft size={14} strokeWidth={2} />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.href)}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center gap-3 transition-colors relative group
                ${collapsed ? "justify-center px-0 py-3" : "px-6 py-3"}
                ${
                  active
                    ? "text-white bg-[#161616]"
                    : "text-neutral-500 hover:text-neutral-200 hover:bg-[#141414]"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white" />
              )}

              <span className="flex-shrink-0">{item.icon}</span>

              {!collapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}

              {item.badge && !collapsed && (
                <span className="ml-auto text-[10px] font-semibold bg-[#272727] text-neutral-400 px-1.5 py-0.5 flex-shrink-0">
                  {item.badge}
                </span>
              )}

              {item.badge && collapsed && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-neutral-500 rounded-full" />
              )}

              {collapsed && (
                <span className="
                  pointer-events-none absolute left-full ml-3 px-2.5 py-1.5
                  bg-[#1e1e1e] border border-[#2a2a2a] text-white text-xs
                  font-medium whitespace-nowrap opacity-0
                  group-hover:opacity-100 transition-opacity z-50
                  shadow-xl
                ">
                  {item.label}
                  {item.badge ? ` (${item.badge})` : ""}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`flex-shrink-0 border-t border-[#1a1a1a] ${collapsed ? "p-2" : "p-4"}`}>
        <button
          onClick={() => handleNavClick("/dashboard/posts")}
          title={collapsed ? "Write Review" : undefined}
          className={`
            w-full bg-white hover:bg-neutral-100 text-[#0a0a0a]
            font-semibold text-xs transition-colors flex items-center justify-center gap-2
            ${collapsed ? "p-2.5 aspect-square" : "px-4 py-2.5"}
          `}
        >
          <PenTool size={14} strokeWidth={2} className="flex-shrink-0" />
          {!collapsed && <span>Write Review</span>}
        </button>
      </div>

      {/* User section */}
      <div className={`flex-shrink-0 border-t border-[#1a1a1a] ${collapsed ? "p-2" : "p-3"}`}>
        {loadingUser ? (
          <div className="flex items-center justify-center py-3">
            <Loader className="animate-spin text-neutral-700" size={16} />
          </div>
        ) : user ? (
          <div className="relative" data-user-menu>
            <button
              onClick={() => !collapsed && setShowUserMenu((v) => !v)}
              title={collapsed ? `${user.name} (@${user.username})` : undefined}
              className={`
                w-full flex items-center gap-2.5
                hover:bg-[#141414] transition-colors
                ${collapsed ? "justify-center p-2" : "px-3 py-2.5"}
                ${showUserMenu ? "bg-[#141414]" : ""}
              `}
            >
              <div className="w-7 h-7 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-semibold flex-shrink-0">
                {user.avatar}
              </div>
              {!collapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-medium text-neutral-300 truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-neutral-600 truncate">
                    @{user.username}
                  </p>
                </div>
              )}
            </button>

            {showUserMenu && !collapsed && (
              <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#161616] border border-[#272727] shadow-2xl z-50 overflow-hidden">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[#272727]">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-600 mb-0.5">
                    Signed in as
                  </p>
                  <p className="text-xs text-neutral-300 truncate">{user.email}</p>
                </div>

                <button
                  onClick={() => {
                    handleNavClick("/dashboard/settings");
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-neutral-400 hover:text-neutral-200 hover:bg-[#1e1e1e] transition-colors text-left"
                >
                  <Settings size={14} strokeWidth={1.5} />
                  <span className="text-xs">Settings</span>
                </button>

                <button
                  onClick={() => {
                    onSignOut();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-neutral-500 hover:text-red-400 hover:bg-[#1e1e1e] transition-colors text-left border-t border-[#272727]"
                >
                  <LogOut size={14} strokeWidth={1.5} />
                  <span className="text-xs">Sign Out</span>
                </button>
              </div>
            )}

            {/* Collapsed: tooltip with actions */}
            {collapsed && (
              <div className="
                pointer-events-none absolute left-full bottom-0 ml-3
                bg-[#161616] border border-[#272727] shadow-2xl z-50
                opacity-0 group-hover:opacity-100 min-w-[160px]
              ">
                <div className="px-3 py-2.5 border-b border-[#272727]">
                  <p className="text-xs font-medium text-neutral-300 truncate">{user.name}</p>
                  <p className="text-[10px] text-neutral-600">@{user.username}</p>
                </div>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-neutral-400 hover:bg-[#1e1e1e] text-xs pointer-events-auto">
                  <Settings size={12} strokeWidth={1.5} /> Settings
                </button>
                <button
                  onClick={onSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-red-400 hover:bg-[#1e1e1e] text-xs pointer-events-auto border-t border-[#272727]"
                >
                  <LogOut size={12} strokeWidth={1.5} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={collapsed ? "flex justify-center p-2" : ""}>
            {collapsed ? (
              <button
                onClick={() => router.push("/auth/login")}
                title="Sign In"
                className="w-8 h-8 flex items-center justify-center bg-[#1a1a1a] border border-[#272727] text-neutral-500 hover:text-white hover:border-[#3a3a3a] transition-colors"
              >
                <User size={14} strokeWidth={1.5} />
              </button>
            ) : (
              <div className="px-1">
                <p className="text-[10px] text-neutral-600 mb-2 uppercase tracking-wider font-medium">
                  Not signed in
                </p>
                <button
                  onClick={() => router.push("/auth/login")}
                  className="w-full px-3 py-2 text-xs font-medium text-neutral-400 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-200 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );

  // ─── Mobile header + bottom sheet ─────────────────────────────────────────

  const MobileSidebarContent = () => (
    <>
      {/* Brand */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-white tracking-tight">
          Scriptum Mens Lumen
        </p>
      </div>

      {/* Nav */}
      <nav className="space-y-0.5 mb-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.href)}
            className={`
              w-full flex items-center gap-3 px-3 py-3 transition-colors relative
              ${
                isActive(item.href)
                  ? "bg-[#161616] text-white"
                  : "text-neutral-500 hover:text-neutral-200 hover:bg-[#141414]"
              }
            `}
          >
            {isActive(item.href) && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white" />
            )}
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[10px] font-semibold bg-[#272727] text-neutral-400 px-1.5 py-0.5">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Write review */}
      <button
        onClick={() => handleNavClick("/dashboard/posts")}
        className="w-full bg-white hover:bg-neutral-100 text-[#0a0a0a] font-semibold text-sm px-4 py-3 transition-colors flex items-center justify-center gap-2 mb-6"
      >
        <PenTool size={15} strokeWidth={2} />
        Write Review
      </button>

      {/* User */}
      <div className="border-t border-[#1a1a1a] pt-4">
        {loadingUser ? (
          <div className="flex justify-center py-4">
            <Loader className="animate-spin text-neutral-700" size={16} />
          </div>
        ) : user ? (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-semibold flex-shrink-0">
                {user.avatar}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-300 truncate">{user.name}</p>
                <p className="text-xs text-neutral-600">@{user.username}</p>
              </div>
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick("/dashboard/settings")}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-500 hover:text-neutral-200 hover:bg-[#141414] transition-colors text-sm"
              >
                <Settings size={15} strokeWidth={1.5} />
                Settings
              </button>
              <button
                onClick={onSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-neutral-600 hover:text-red-400 hover:bg-[#141414] transition-colors text-sm"
              >
                <LogOut size={15} strokeWidth={1.5} />
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs text-neutral-600 mb-3">Not signed in</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="w-full px-4 py-2.5 text-sm font-medium text-neutral-400 border border-[#272727] hover:border-[#3a3a3a] hover:text-neutral-200 transition-colors"
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
      {/* ── Desktop sidebar ── */}
      <DesktopSidebar />

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] border-b border-[#1a1a1a] z-50 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <span className="text-xs font-semibold text-neutral-400 tracking-tight">
          Scriptum Mens Lumen
        </span>
        <div className="w-16" />
      </header>

      {/* ── Mobile backdrop ── */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-[60]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ animation: "fadeIn 0.2s ease-out" }}
        />
      )}

      <div
        className={`
          lg:hidden fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-[#1a1a1a]
          rounded-t-2xl z-[70] transition-transform duration-300 ease-out
          ${mobileMenuOpen ? "translate-y-0" : "translate-y-full"}
        `}
        style={{ height: "65vh", maxHeight: 640 }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-[#2a2a2a] rounded-full" />
        </div>

        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-3.5 right-4 w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-[#1a1a1a] transition-colors"
          aria-label="Close menu"
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="h-full overflow-y-auto px-5 pb-8 pt-2">
          <MobileSidebarContent />
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