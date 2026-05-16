export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: 'admin' | 'user';
  createdAt: any;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'video' | 'image';
  videoUrl?: string;
  imageUrl?: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  likesCount: number;
  commentsCount: number;
  createdAt: any;
  updatedAt?: any;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
}
