export interface TrendingBook {
  title: string;
  author: string;
  category: string;
  discussions: number;
  link?: string;
}

export interface FeedPost {
  id: string;
  title: string;
  author: string;
  author_id: string;
  avatar: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  excerpt: string;
  timestamp: string;
  link?: string;
  source?: string;
  likes_count: number;
  comments_count: number;
  read_time: number;
  created_at: string;
  isExternal?: boolean;
  cover_image_url?: string | null;
  cover_image_caption?: string | null;
}

export interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

export interface SuggestedWriter {
  name: string;
  handle: string;
  followers: string;
  bio: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  email: string;
  full_name: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href: string;

}
export interface PostData {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  genre: string;
  read_time: number;
  created_at: string;
  author: string;
  author_id: string;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  user_liked: boolean;
  user_bookmarked: boolean;
  tags: string[];
  cover_image_url?: string | null;
  cover_image_caption?: string | null;
}
export interface CommentData {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at?: string | null;
  parent_id?: string | null;
  author: string;
  avatar_url: string | null;
  can_edit: boolean;
}

export interface CommentsResponse {
  comments: CommentData[];
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
}
