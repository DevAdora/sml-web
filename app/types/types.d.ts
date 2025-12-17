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