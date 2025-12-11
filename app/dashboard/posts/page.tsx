"use client";

import React, { useState } from "react";
import { BookOpen, X, Loader, AlertCircle, CheckCircle } from "lucide-react";

interface PostFormData {
  title: string;
  excerpt: string;
  content: string;
  genre: string;
  tags: string[];
  status: "draft" | "published";
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
  });

  const [tagInput, setTagInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const genres = [
    "Fiction",
    "Non-Fiction",
    "Literary Analysis",
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

    const submitData = { ...formData, status };

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const readTime = calculateReadTime(submitData.content);

      console.log("Submitting post:", { ...submitData, read_time: readTime });

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...submitData,
          read_time: readTime,
        }),
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-4xl my-8 h-full">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <BookOpen
              className="text-neutral-400"
              size={24}
              strokeWidth={1.5}
            />
            <h2 className="text-2xl font-serif text-neutral-200">
              Create New Post
            </h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-200 transition"
            >
              <X size={24} strokeWidth={1.5} />
            </button>
          )}
        </div>

        <form className="p-6 space-y-6">
          {error && (
            <div className="flex items-center space-x-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle className="text-green-400" size={20} />
              <p className="text-sm text-green-400">
                Post created successfully!
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter your post title..."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              maxLength={200}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Genre <span className="text-red-400">*</span>
            </label>
            <select
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
            >
              <option value="">Select a genre...</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Excerpt <span className="text-red-400">*</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              placeholder="Write a compelling excerpt that will appear in the feed..."
              rows={3}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent resize-none"
              maxLength={300}
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.excerpt.length}/300 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Content <span className="text-red-400">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              placeholder="Write your full post content here..."
              rows={12}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent resize-none font-serif leading-relaxed"
            />
            <p className="text-xs text-neutral-500 mt-1">
              Estimated read time: {calculateReadTime(formData.content)} min
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter..."
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
            />
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-sm text-neutral-300"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-neutral-500 hover:text-neutral-300 transition"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-neutral-800">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700"
                disabled={loading}
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-medium transition border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              className="px-6 py-3 bg-neutral-200 hover:bg-neutral-100 text-neutral-900 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Post</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
