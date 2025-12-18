"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
  ImagePlus,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";
import Image from "next/image";

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

interface PostFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function PostForm({ onClose, onSuccess }: PostFormProps) {
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

  const [tagInput, setTagInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const coverImageInputRef = useRef<HTMLInputElement>(null);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuthentication = async () => {
      setCheckingAuth(true);
      try {
        const response = await fetch("/api/user", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.authenticated || false);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthentication();
  }, []);

  const genres = [
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

  const calculateReadTime = (text: string): number => {
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleCoverImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      coverImage: file,
    }));

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleRemoveCoverImage = () => {
    setFormData((prev) => ({
      ...prev,
      coverImage: null,
      coverImageUrl: "",
    }));
    setImagePreview("");
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const uploadImageToSupabase = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");

      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const validateForm = (): string | null => {
    if (formData.title.length < 10) {
      return "Title must be at least 10 characters long";
    }
    if (formData.title.length > 200) {
      return "Title must not exceed 200 characters";
    }
    if (formData.excerpt.length < 50) {
      return "Excerpt must be at least 50 characters long";
    }
    if (formData.excerpt.length > 300) {
      return "Excerpt must not exceed 300 characters";
    }
    if (formData.content.length < 100) {
      return "Content must be at least 100 characters long";
    }
    if (!formData.genre) {
      return "Please select a genre";
    }
    return null;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: "draft" | "published"
  ) => {
    e.preventDefault();
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

      // Upload cover image if exists
      if (formData.coverImage) {
        setUploadingImage(true);
        try {
          coverImageUrl = await uploadImageToSupabase(formData.coverImage);
        } catch (uploadError) {
          throw new Error(
            `Image upload failed: ${
              uploadError instanceof Error
                ? uploadError.message
                : "Unknown error"
            }`
          );
        } finally {
          setUploadingImage(false);
        }
      }

      const readTime = calculateReadTime(formData.content);

      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        genre: formData.genre,
        tags: formData.tags,
        status,
        read_time: readTime,
        cover_image_url: coverImageUrl || null,
        cover_image_caption: formData.coverImageCaption || null,
      };

      console.log("Submitting post:", submitData);

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(submitData),
      });

      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("Response data:", data);

      if (!response.ok) {
        throw new Error(data.error || "Failed to create post");
      }

      setSuccess(true);

      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    } catch (err) {
      console.error("Submission error:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 border border-neutral-700/50 rounded-2xl w-full max-w-5xl my-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700/50 bg-gradient-to-r from-neutral-800/50 to-transparent">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl">
              <BookOpen
                className="text-amber-400"
                size={24}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-neutral-100 tracking-tight">
                Create New Post
              </h2>
              <p className="text-sm text-neutral-400 mt-0.5">
                Share your thoughts with the community
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-all p-2.5 rounded-lg group"
            aria-label="Close"
          >
            <X
              size={24}
              strokeWidth={1.5}
              className="group-hover:rotate-90 transition-transform duration-200"
            />
          </button>
        </div>

        {/* Loading Auth Check */}
        {checkingAuth ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <Loader className="animate-spin text-amber-400" size={48} />
            <p className="text-neutral-400">Checking authentication...</p>
          </div>
        ) : !isAuthenticated ? (
          /* Not Authenticated - Show Sign In Message */
          <div className="p-12">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center">
                <LogIn className="text-amber-400" size={40} strokeWidth={1.5} />
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-serif text-neutral-100">
                  Sign In Required
                </h3>
                <p className="text-neutral-400 leading-relaxed">
                  You need to be signed in to create posts and share your
                  reviews with the community.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
                >
                  <LogIn size={20} />
                  <span>Sign In</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-all border border-neutral-700"
                >
                  Cancel
                </button>
              </div>

              <p className="text-sm text-neutral-500 pt-4">
                Don't have an account?{" "}
                <a
                  href="/signup"
                  className="text-amber-400 hover:text-amber-300 transition-colors underline"
                >
                  Sign up here
                </a>
              </p>
            </div>
          </div>
        ) : (
          /* Authenticated - Show Form */
          <form className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                <AlertCircle
                  className="text-red-400 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl backdrop-blur-sm">
                <CheckCircle className="text-green-400" size={20} />
                <p className="text-sm text-green-300">
                  Post created successfully!
                </p>
              </div>
            )}

            {/* Cover Image Section */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-neutral-300">
                Cover Image
                <span className="text-neutral-500 font-normal ml-2">
                  (Optional)
                </span>
              </label>

              {imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-64 rounded-xl overflow-hidden border-2 border-neutral-700/50">
                    <Image
                      src={imagePreview}
                      alt="Cover preview"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoverImage}
                    className="absolute top-3 right-3 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => coverImageInputRef.current?.click()}
                  className="relative border-2 border-dashed border-neutral-700 hover:border-amber-500/50 rounded-xl p-8 text-center cursor-pointer transition-all hover:bg-neutral-800/30 group"
                >
                  <input
                    ref={coverImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleCoverImageSelect}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-neutral-800 group-hover:bg-amber-500/20 rounded-full transition-all">
                      <ImagePlus
                        className="text-neutral-400 group-hover:text-amber-400 transition-colors"
                        size={32}
                        strokeWidth={1.5}
                      />
                    </div>
                    <div>
                      <p className="text-neutral-300 font-medium mb-1">
                        Click to upload cover image
                      </p>
                      <p className="text-xs text-neutral-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Caption */}
              {imagePreview && (
                <input
                  type="text"
                  name="coverImageCaption"
                  value={formData.coverImageCaption}
                  onChange={handleInputChange}
                  placeholder="Add an image caption (optional)"
                  className="w-full px-4 py-2.5 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-200 text-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
                />
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Title <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter a captivating title..."
                className="w-full px-4 py-3.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all font-serif text-lg"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-neutral-500">
                  {formData.title.length}/200 characters
                </p>
                {formData.title.length < 10 && formData.title.length > 0 && (
                  <p className="text-xs text-amber-400">
                    {10 - formData.title.length} more needed
                  </p>
                )}
              </div>
            </div>

            {/* Genre */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Genre <span className="text-amber-400">*</span>
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-3.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all cursor-pointer"
              >
                <option value="" className="bg-neutral-900">
                  Select a genre...
                </option>
                {genres.map((genre) => (
                  <option key={genre} value={genre} className="bg-neutral-900">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Excerpt <span className="text-amber-400">*</span>
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                placeholder="Write a compelling excerpt that will appear in the feed..."
                rows={3}
                className="w-full px-4 py-3.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent resize-none transition-all"
                maxLength={300}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-neutral-500">
                  {formData.excerpt.length}/300 characters
                </p>
                {formData.excerpt.length < 50 &&
                  formData.excerpt.length > 0 && (
                    <p className="text-xs text-amber-400">
                      {50 - formData.excerpt.length} more needed
                    </p>
                  )}
              </div>
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-300">
                  Content <span className="text-amber-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-neutral-300 transition-colors px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg"
                >
                  {showPreview ? (
                    <>
                      <EyeOff size={14} />
                      <span>Hide Preview</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} />
                      <span>Show Preview</span>
                    </>
                  )}
                </button>
              </div>

              {showPreview ? (
                <div className="w-full min-h-[300px] px-6 py-4 bg-neutral-800/30 border border-neutral-700 rounded-xl">
                  <div className="prose prose-invert prose-neutral max-w-none">
                    <div className="text-neutral-300 text-base leading-relaxed font-serif whitespace-pre-wrap">
                      {formData.content || (
                        <span className="text-neutral-500 italic">
                          Your content will appear here...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your full post content here... Use double line breaks for paragraphs."
                  rows={14}
                  className="w-full px-4 py-3.5 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent resize-none font-serif leading-relaxed transition-all"
                />
              )}

              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-neutral-500">
                  Estimated read time: {calculateReadTime(formData.content)} min
                </p>
                {formData.content.length < 100 &&
                  formData.content.length > 0 && (
                    <p className="text-xs text-amber-400">
                      {100 - formData.content.length} more characters needed
                    </p>
                  )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Tags
                <span className="text-neutral-500 font-normal ml-2">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter..."
                className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all"
              />
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-full text-sm text-amber-300"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-all border border-neutral-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "draft")}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium transition-all border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || uploadingImage}
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, "published")}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg shadow-amber-500/20"
                disabled={loading || uploadingImage}
              >
                {loading || uploadingImage ? (
                  <>
                    <Loader className="animate-spin" size={18} />
                    <span>
                      {uploadingImage ? "Uploading..." : "Publishing..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Publish Post</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
