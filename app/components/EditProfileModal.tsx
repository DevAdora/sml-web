"use client";

import React, { useState, useRef } from "react";
import { X, Upload, Loader } from "lucide-react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string;
    location: string;
    website: string;
  };
  onSave: (updatedProfile: Partial<ProfileUpdate>) => Promise<void>;
}

interface ProfileUpdate {
  full_name: string;
  bio: string;
  location: string;
  website: string;
  avatar_url: string | null;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    bio: profile.bio,
    location: profile.location,
    website: profile.website,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.avatar_url
  );
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile) return avatarPreview;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to upload avatar");

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar");
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Upload avatar if changed
      const avatarUrl = await uploadAvatar();

      // Prepare update data
      const updates: Partial<ProfileUpdate> = {
        ...formData,
      };

      if (avatarUrl !== profile.avatar_url) {
        updates.avatar_url = avatarUrl;
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const generateAvatar = (name: string): string => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg w-full max-w-2xl my-8 relative">
        {/* Header */}
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-lg z-10">
          <h2 className="text-lg sm:text-xl font-semibold text-neutral-200">
            Edit Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-lg transition text-neutral-400 hover:text-neutral-200"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 sm:p-6 space-y-4 sm:space-y-6"
        >
          {/* Avatar Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-3">
              Profile Picture
            </label>
            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-neutral-800 border-2 border-neutral-700 rounded-full flex items-center justify-center text-neutral-300 text-xl sm:text-2xl font-bold overflow-hidden flex-shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{generateAvatar(formData.full_name)}</span>
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full sm:w-auto px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-60 text-neutral-200 rounded-lg border border-neutral-700 flex items-center justify-center space-x-2 transition"
                >
                  <Upload size={16} strokeWidth={1.5} />
                  <span>
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                  </span>
                </button>
                <p className="text-xs text-neutral-500 mt-2">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="full_name"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              maxLength={100}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              placeholder="Your name"
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.full_name.length}/100
            </p>
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-neutral-500 mt-1">
              {formData.bio.length}/500
            </p>
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Location
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              maxLength={100}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          {/* Website */}
          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Website
            </label>
            <input
              id="website"
              type="text"
              value={formData.website}
              onChange={(e) =>
                setFormData({ ...formData, website: e.target.value })
              }
              maxLength={200}
              className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-600 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={saving || uploadingAvatar}
              className="w-full sm:w-auto px-4 py-2 text-neutral-300 hover:bg-neutral-800 rounded-lg transition disabled:opacity-60 order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingAvatar}
              className="w-full sm:w-auto px-6 py-2 bg-neutral-200 hover:bg-white text-neutral-900 font-medium rounded-lg transition disabled:opacity-60 flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              {saving ? (
                <>
                  <Loader className="animate-spin" size={16} />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
