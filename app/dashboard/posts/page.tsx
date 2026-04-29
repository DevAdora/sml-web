"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  BookOpen,
  Loader,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  Trash2,
  LogIn,
  ArrowLeft,
  Clock,
  Heart,
  MessageCircle,
  Bookmark,
  ExternalLink,
  ChevronDown,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  genre: string;
  tags: string[];
  status: "draft" | "published";
  coverImage: File | null;
  coverImageUrl: string;
  coverImageCaption: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const calculateReadTime = (text: string): number =>
  Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 200));

const getRelativeTime = () => "just now";

const GENRES = [
  "Fiction",
  "Non-Fiction",
  "Literary Analysis",
  "Book Review",
  "Lists",
  "Essay",
  "Opinion",
  "Philosophy",
  "Poetry",
  "Personal Essay",
  "Writing Tips",
  "Classics",
  "Science Fiction",
  "Mystery",
  "Fantasy",
  "Biography",
  "History",
  "Contemporary",
  "Thriller",
];

// ─── Subcomponents ────────────────────────────────────────────────────────────

/** Exactly how a post card looks in the dashboard feed */
function PostPreviewCard({
  formData,
  imagePreview,
  authorName,
  authorAvatar,
}: {
  formData: PostFormData;
  imagePreview: string;
  authorName: string;
  authorAvatar: string;
}) {
  const isEmpty =
    !formData.title && !formData.excerpt && !formData.content && !imagePreview;

  return (
    <div className="flex flex-col h-full">
      {/* Preview label */}
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
          Preview
        </span>
        <div className="flex-1 h-px bg-[#1a1a1a]" />
        <span className="text-[10px] text-neutral-700">
          how your post appears in the feed
        </span>
      </div>

      {/* Card — matches feed PostCard exactly */}
      <div className="bg-[#111] border border-[#1f1f1f] overflow-hidden flex-shrink-0">
        {/* Cover image */}
        {imagePreview && (
          <div className="relative w-full h-44">
            <Image
              src={imagePreview}
              alt="Cover preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-5">
          {isEmpty ? (
            <div className="py-8 text-center">
              <BookOpen
                size={28}
                strokeWidth={1.2}
                className="mx-auto mb-3 text-neutral-700"
              />
              <p className="text-xs text-neutral-700">
                Start writing to see your post preview
              </p>
            </div>
          ) : (
            <>
              {/* Author row */}
              <div className="flex items-start justify-between mb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full flex items-center justify-center text-neutral-400 text-[10px] font-semibold flex-shrink-0">
                    {authorAvatar || "??"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-300 leading-tight">
                      {authorName || "Your Name"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-600 mt-0.5">
                      <span>{getRelativeTime()}</span>
                      {formData.content && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} strokeWidth={1.5} />
                            {calculateReadTime(formData.content)} min read
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                {formData.genre && (
                  <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-500 bg-[#1a1a1a] border border-[#272727] px-2.5 py-1 flex-shrink-0">
                    {formData.genre}
                  </span>
                )}
              </div>

              {/* Title */}
              {formData.title ? (
                <h3 className="text-base font-semibold text-white leading-snug mb-2 tracking-tight">
                  {formData.title}
                </h3>
              ) : (
                <h3 className="text-base font-semibold text-neutral-700 leading-snug mb-2 italic">
                  Your title will appear here…
                </h3>
              )}

              {/* Excerpt */}
              {formData.excerpt ? (
                <p className="text-sm text-neutral-500 leading-relaxed mb-4 line-clamp-2">
                  {formData.excerpt}
                </p>
              ) : (
                <p className="text-sm text-neutral-700 leading-relaxed mb-4 italic">
                  Your excerpt will appear here…
                </p>
              )}

              {/* Tags */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] text-neutral-600 bg-[#161616] border border-[#222] px-2 py-0.5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action bar */}
              <div className="flex items-center gap-5 text-neutral-700 border-t border-[#1a1a1a] pt-3.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <Heart size={13} strokeWidth={1.5} />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <MessageCircle size={13} strokeWidth={1.5} />
                  <span>0</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <Bookmark size={13} strokeWidth={1.5} />
                  <span>Save</span>
                </div>
                {formData.content && (
                  <span className="ml-auto text-[11px] text-neutral-700">
                    {calculateReadTime(formData.content)} min
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Full content preview */}
      {formData.content && (
        <div className="mt-4 flex-1 overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
              Content Preview
            </span>
            <div className="flex-1 h-px bg-[#1a1a1a]" />
          </div>
          <div className="overflow-y-auto h-full pr-1 [scrollbar-width:thin] [scrollbar-color:#2a2a2a_transparent]">
            <div className="text-sm text-neutral-400 leading-relaxed whitespace-pre-wrap font-serif">
              {formData.content}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Compact field label */
function FieldLabel({
  children,
  required,
  hint,
}: {
  children: React.ReactNode;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-500">
        {children}
        {required && <span className="text-neutral-600 ml-1">*</span>}
      </label>
      {hint && <span className="text-[10px] text-neutral-700">{hint}</span>}
    </div>
  );
}

/** Shared input classes */
const inputCls =
  "w-full px-3 py-2.5 bg-[#161616] border border-[#272727] text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors";

const textareaCls =
  "w-full px-3 py-2.5 bg-[#161616] border border-[#272727] text-neutral-200 text-sm placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors resize-none";

// ─── Main page ────────────────────────────────────────────────────────────────

export default function WritePostPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<PostFormData>({
    title: "",
    excerpt: "",
    content: "",
    genre: "",
    tags: [],
    status: "draft",
    coverImage: null,
    coverImageUrl: "",
    coverImageCaption: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [genreOpen, setGenreOpen] = useState(false);

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

  // ── Auth check ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/user", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated || false);
          if (data.authenticated && data.user) {
            const name = data.user.full_name || "User";
            setAuthorName(name);
            const parts = name.trim().split(" ");
            setAuthorAvatar(
              parts.length > 1
                ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                : name.substring(0, 2).toUpperCase()
            );
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    check();
  }, []);

  // Close genre dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node))
        setGenreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError("");
    },
    []
  );

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }
    setFormData((prev) => ({ ...prev, coverImage: file }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
    setError("");
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({ ...prev, coverImage: null, coverImageUrl: "" }));
    setImagePreview("");
    if (coverImageInputRef.current) coverImageInputRef.current.value = "";
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: fd,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to upload image");
    }
    return (await res.json()).url;
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, newTag] }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) =>
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));

  const validateForm = (): string | null => {
    if (formData.title.length < 10)
      return "Title must be at least 10 characters";
    if (formData.title.length > 200)
      return "Title must not exceed 200 characters";
    if (formData.excerpt.length < 50)
      return "Excerpt must be at least 50 characters";
    if (formData.excerpt.length > 300)
      return "Excerpt must not exceed 300 characters";
    if (formData.content.length < 100)
      return "Content must be at least 100 characters";
    if (!formData.genre) return "Please select a genre";
    return null;
  };

  const handleSubmit = async (status: "draft" | "published") => {
    setError("");
    setSuccess(false);
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      let coverImageUrl = formData.coverImageUrl;
      if (formData.coverImage) {
        setUploadingImage(true);
        try {
          coverImageUrl = await uploadImageToSupabase(formData.coverImage);
        } finally {
          setUploadingImage(false);
        }
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          excerpt: formData.excerpt,
          content: formData.content,
          genre: formData.genre,
          tags: formData.tags,
          status,
          read_time: calculateReadTime(formData.content),
          cover_image_url: coverImageUrl || null,
          cover_image_caption: formData.coverImageCaption || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create post");
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // ── Char counter color ─────────────────────────────────────────────────────

  const counterColor = (len: number, min: number, max: number) => {
    if (len > max * 0.9) return "text-red-500";
    if (len < min && len > 0) return "text-neutral-600";
    return "text-neutral-700";
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  // Auth loading
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader className="animate-spin text-neutral-700" size={24} />
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-[#111] border border-[#1f1f1f] p-8 text-center">
          <div className="w-12 h-12 bg-[#1a1a1a] border border-[#272727] flex items-center justify-center mx-auto mb-5">
            <LogIn size={18} strokeWidth={1.5} className="text-neutral-500" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2 tracking-tight">
            Sign in required
          </h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            You need to be signed in to write and publish posts.
          </p>
          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="block w-full py-2.5 bg-white text-[#0a0a0a] text-sm font-semibold text-center hover:bg-neutral-100 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => router.push("/dashboard")}
              className="block w-full py-2.5 border border-[#272727] text-neutral-500 text-sm hover:border-[#3a3a3a] hover:text-neutral-300 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-[#111] border border-[#1f1f1f] p-8 text-center">
          <div className="w-12 h-12 bg-[#1a1a1a] border border-[#272727] flex items-center justify-center mx-auto mb-5">
            <CheckCircle
              size={18}
              strokeWidth={1.5}
              className="text-neutral-400"
            />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Post created!
          </h2>
          <p className="text-sm text-neutral-500">
            Redirecting to your dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Main split layout ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">

      {/* ── Top bar ── */}
      <header className="h-12 border-b border-[#1a1a1a] flex items-center justify-between px-5 flex-shrink-0 bg-[#0a0a0a] z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 text-neutral-600 hover:text-neutral-300 transition-colors text-xs"
          >
            <ArrowLeft size={13} strokeWidth={2} />
            Dashboard
          </button>
          <span className="w-px h-3.5 bg-[#1f1f1f]" />
          <span className="text-xs font-semibold text-white tracking-tight">
            Write a Post
          </span>
        </div>

        {/* Top-right actions */}
        <div className="flex items-center gap-2">
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/8 border border-red-500/15 px-3 py-1.5 max-w-xs truncate">
              <AlertCircle size={12} />
              <span className="truncate">{error}</span>
            </div>
          )}
          <button
            onClick={() => handleSubmit("draft")}
            disabled={loading || uploadingImage}
            className="text-xs font-medium text-neutral-500 border border-[#272727] px-3.5 py-1.5 hover:border-[#3a3a3a] hover:text-neutral-300 transition-all disabled:opacity-40"
          >
            Save draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={loading || uploadingImage}
            className="text-xs font-semibold text-[#0a0a0a] bg-white px-4 py-1.5 hover:bg-neutral-100 transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            {loading || uploadingImage ? (
              <>
                <Loader className="animate-spin" size={12} />
                {uploadingImage ? "Uploading…" : "Publishing…"}
              </>
            ) : (
              "Publish"
            )}
          </button>
        </div>
      </header>

      {/* ── Split pane ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Editor ── */}
        <div className="flex-1 overflow-y-auto border-r border-[#1a1a1a] [scrollbar-width:thin] [scrollbar-color:#1f1f1f_transparent]">
          <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

            {/* Cover image */}
            <div>
              <FieldLabel hint="Optional · max 5MB">Cover Image</FieldLabel>
              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverImageSelect}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-40 overflow-hidden border border-[#272727]">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-[#0a0a0a]/90 border border-[#272727] flex items-center justify-center text-neutral-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                  <input
                    type="text"
                    name="coverImageCaption"
                    value={formData.coverImageCaption}
                    onChange={handleInputChange}
                    placeholder="Image caption (optional)"
                    className="w-full px-3 py-2 bg-[#111] border border-t-0 border-[#272727] text-neutral-400 text-xs placeholder-neutral-700 focus:outline-none focus:border-[#3a3a3a] transition-colors"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => coverImageInputRef.current?.click()}
                  className="w-full h-28 border border-dashed border-[#272727] hover:border-[#3a3a3a] flex flex-col items-center justify-center gap-2 text-neutral-700 hover:text-neutral-500 transition-colors group"
                >
                  <ImagePlus size={20} strokeWidth={1.5} />
                  <span className="text-xs">Click to upload cover image</span>
                </button>
              )}
            </div>

            {/* Title */}
            <div>
              <FieldLabel
                required
                hint={`${formData.title.length}/200`}
              >
                Title
              </FieldLabel>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Write a captivating title…"
                className={`${inputCls} text-base font-semibold`}
                maxLength={200}
              />
              {formData.title.length < 10 && formData.title.length > 0 && (
                <p className="text-[10px] text-neutral-700 mt-1">
                  {10 - formData.title.length} more characters needed
                </p>
              )}
            </div>

            {/* Genre */}
            <div>
              <FieldLabel required>Genre</FieldLabel>
              <div ref={genreRef} className="relative">
                <button
                  type="button"
                  onClick={() => setGenreOpen((v) => !v)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 bg-[#161616] border border-[#272727] text-sm transition-colors hover:border-[#3a3a3a] ${
                    formData.genre ? "text-neutral-200" : "text-neutral-700"
                  }`}
                >
                  {formData.genre || "Select a genre…"}
                  <ChevronDown
                    size={13}
                    strokeWidth={2}
                    className={`text-neutral-600 transition-transform ${genreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {genreOpen && (
                  <div className="absolute top-full left-0 right-0 mt-0.5 bg-[#161616] border border-[#272727] z-20 max-h-52 overflow-y-auto shadow-xl [scrollbar-width:thin]">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, genre: g }));
                          setGenreOpen(false);
                          setError("");
                        }}
                        className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#1e1e1e] ${
                          formData.genre === g
                            ? "text-white font-medium bg-[#1a1a1a]"
                            : "text-neutral-400"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <FieldLabel
                required
                hint={`${formData.excerpt.length}/300`}
              >
                Excerpt
              </FieldLabel>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="A short summary shown in the feed…"
                rows={3}
                className={textareaCls}
                maxLength={300}
              />
              {formData.excerpt.length < 50 && formData.excerpt.length > 0 && (
                <p className="text-[10px] text-neutral-700 mt-1">
                  {50 - formData.excerpt.length} more characters needed
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <FieldLabel
                required
                hint={`${calculateReadTime(formData.content)} min read`}
              >
                Content
              </FieldLabel>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Write your full post here… Use double line breaks for paragraphs."
                rows={18}
                className={`${textareaCls} font-serif leading-relaxed`}
              />
              {formData.content.length < 100 && formData.content.length > 0 && (
                <p className="text-[10px] text-neutral-700 mt-1">
                  {100 - formData.content.length} more characters needed
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <FieldLabel hint="Press Enter to add">Tags</FieldLabel>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="e.g. fiction, book-review…"
                className={inputCls}
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 text-[10px] text-neutral-500 bg-[#161616] border border-[#272727] px-2 py-1"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-700 hover:text-neutral-400 transition-colors"
                      >
                        <X size={10} strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom padding */}
            <div className="h-6" />
          </div>
        </div>

        {/* ── RIGHT: Live preview ── */}
        <div className="w-[380px] flex-shrink-0 overflow-y-auto p-6 [scrollbar-width:thin] [scrollbar-color:#1f1f1f_transparent] hidden lg:block">
          <PostPreviewCard
            formData={formData}
            imagePreview={imagePreview}
            authorName={authorName}
            authorAvatar={authorAvatar}
          />
        </div>
      </div>
    </div>
  );
}