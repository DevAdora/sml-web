interface TrendingBook {
  title: string;
  author: string;
  category: string;
  discussions: number;
}

interface FeedPost {
  id: number;
  title: string;
  author: string;
  avatar: string;
  genre: string;
  likes: number;
  comments: number;
  readTime: string;
  excerpt: string;
  timestamp: string;
}

interface TrendingTopic {
  tag: string;
  posts: string;
  growth: string;
}

interface SuggestedWriter {
  name: string;
  handle: string;
  followers: string;
  bio: string;
}

interface UserProfile {
  name: string;
  username: string;
  avatar: string;
  email: string;
  full_name: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}